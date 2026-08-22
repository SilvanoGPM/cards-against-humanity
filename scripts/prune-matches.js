/* eslint-disable */

/**
 * Retenção: apaga partidas já encerradas e antigas.
 *
 * O inventário de 2026-08-22 encontrou **143.080 partidas FINISHED** contra 128
 * abertas. Elas nunca são lidas de volta: a tela "Encontrar partidas" filtra
 * por `status == 'PLAYING'`, o placar de vitórias mora em `users.wins`, e
 * nenhuma tela mostra histórico. São documentos mortos ocupando armazenamento
 * (o Spark dá 1 GiB) e engordando toda varredura administrativa da coleção.
 *
 * Como o Spark permite 20k exclusões/dia, os 143k NÃO cabem numa execução: o
 * script apaga um lote por dia e continua de onde parou. Com o padrão de
 * 15.000, são ~10 dias até zerar o passivo; depois disso cada execução acha
 * pouca coisa e termina em segundos.
 *
 * SEGURANÇA — exclusão não tem volta, então `DRY_RUN` vem **ligado por
 * padrão**. Para apagar de verdade é preciso passar `DRY_RUN=false`
 * explicitamente. (O `finish-matches.js` faz o contrário porque só escreve um
 * campo.)
 *
 * Variáveis de ambiente:
 *   MAX_AGE_DAYS  idade mínima da partida encerrada para ser apagada (padrão 7)
 *   MAX_DELETES   teto de exclusões nesta execução (padrão 15000)
 *   DRY_RUN       "false" para apagar de verdade; qualquer outra coisa só conta
 *
 * Uso: DRY_RUN=false node ./scripts/prune-matches.js
 * Requer scripts/serviceAccountKey.json (Admin SDK).
 */

const { initializeApp, cert } = require('firebase-admin/app');
const {
  getFirestore,
  FieldPath,
  Timestamp,
} = require('firebase-admin/firestore');

const MAX_AGE_DAYS = Number(process.env.MAX_AGE_DAYS ?? 7);
const MAX_DELETES = Number(process.env.MAX_DELETES ?? 15000);
const DRY_RUN = process.env.DRY_RUN !== 'false';
const PAGE_SIZE = 500;

const app = initializeApp({
  credential: cert(require('./serviceAccountKey.json')),
});

const db = getFirestore(app);

/**
 * Partidas antigas não têm `createdAt` (o campo entrou depois), e são
 * justamente as mais antigas — a ausência conta como "velha o suficiente".
 */
function isOldEnough(data, cutoff) {
  const createdAt = data.createdAt;

  if (!createdAt) {
    return true;
  }

  const millis =
    createdAt instanceof Timestamp
      ? createdAt.toMillis()
      : new Date(createdAt).getTime();

  return Number.isFinite(millis) ? millis < cutoff : true;
}

async function pruneMatches() {
  const finished = db.collection('matches').where('status', '==', 'FINISHED');

  // Agregação: ~1 leitura por 1000 documentos, em vez de 1 por documento.
  const { count: total } = (await finished.count().get()).data();

  console.log(`Partidas encerradas na base: ${total}`);

  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const writer = db.bulkWriter();

  let lastDoc = null;
  let scanned = 0;
  let deleted = 0;
  let skippedRecent = 0;
  let reachedLimit = false;

  writer.onWriteError((error) => error.failedAttempts < 3);

  while (!reachedLimit) {
    let query = finished
      .select('createdAt')
      .orderBy(FieldPath.documentId())
      .limit(PAGE_SIZE);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      break;
    }

    scanned += snapshot.size;
    lastDoc = snapshot.docs[snapshot.size - 1];

    for (const doc of snapshot.docs) {
      if (!isOldEnough(doc.data(), cutoff)) {
        skippedRecent += 1;
        continue;
      }

      if (deleted >= MAX_DELETES) {
        reachedLimit = true;
        break;
      }

      deleted += 1;

      if (!DRY_RUN) {
        writer.delete(doc.ref);
      }
    }

    if (snapshot.size < PAGE_SIZE) {
      break;
    }
  }

  await writer.close();

  console.log(`Lidas:                        ${scanned}`);
  console.log(
    `Preservadas por serem recentes: ${skippedRecent} (< ${MAX_AGE_DAYS} dias)`
  );
  console.log(
    `Apagadas:                     ${deleted}${
      DRY_RUN ? ' (DRY_RUN — nada foi apagado; use DRY_RUN=false)' : ''
    }`
  );

  if (reachedLimit) {
    const restante = Math.max(0, total - skippedRecent - deleted);

    console.log(
      `Teto de ${MAX_DELETES} exclusões atingido. Restam ~${restante} — ` +
        `rode de novo amanhã (a quota de exclusões é diária).`
    );
  }
}

pruneMatches()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro ao apagar partidas antigas:', error);

    if (error && error.code === 9) {
      console.error(
        'FAILED_PRECONDITION costuma significar índice ausente — a mensagem ' +
          'acima traz o link para criá-lo no console.'
      );
    }

    process.exit(1);
  });
