/* eslint-disable */

/**
 * Finaliza partidas que ficaram abertas.
 *
 * A versão anterior deste script montava um único `db.batch()` com TODAS as
 * partidas não finalizadas e dava um `commit()` só. O servidor do Firestore
 * rejeita commits acima de 500 escritas e o `WriteBatch` não divide nada do
 * lado do cliente — então, a partir do momento em que passaram de 500 partidas
 * abertas, o commit passou a falhar inteiro e NENHUMA partida era encerrada.
 * Como o erro era apenas logado (sem `exit(1)`), o GitHub Action seguia
 * reportando sucesso todos os dias, e a coleção só crescia.
 *
 * Esta versão:
 *   - pagina a leitura (nunca carrega tudo em memória);
 *   - usa BulkWriter, que divide os lotes sozinho;
 *   - respeita um teto de escritas por execução (o plano Spark permite 20k/dia);
 *   - só encerra partidas paradas há mais de MAX_AGE_HOURS;
 *   - sai com código 1 em caso de erro, para o Action falhar de verdade.
 *
 * Variáveis de ambiente:
 *   MAX_AGE_HOURS  idade mínima da partida para ser encerrada (padrão 6; use 0
 *                  para encerrar todas, que era o comportamento antigo)
 *   MAX_WRITES     teto de escritas nesta execução (padrão 15000)
 *   DRY_RUN        "true" para apenas contar, sem escrever nada
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldPath, Timestamp } = require('firebase-admin/firestore');

const MAX_AGE_HOURS = Number(process.env.MAX_AGE_HOURS ?? 6);
const MAX_WRITES = Number(process.env.MAX_WRITES ?? 15000);
const DRY_RUN = process.env.DRY_RUN === 'true';
const PAGE_SIZE = 500;
const OPEN_STATUSES = ['PLAYING', 'LOADING'];

const app = initializeApp({
  credential: cert(require('./serviceAccountKey.json')),
});

const db = getFirestore(app);

/**
 * Partidas antigas não têm `createdAt` (o campo foi adicionado depois), então a
 * ausência conta como "antiga o suficiente".
 */
function isOldEnough(data, cutoff) {
  if (MAX_AGE_HOURS <= 0) {
    return true;
  }

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

async function finishMatches() {
  const cutoff = Date.now() - MAX_AGE_HOURS * 60 * 60 * 1000;
  const writer = db.bulkWriter();

  let lastDoc = null;
  let scanned = 0;
  let scheduled = 0;
  let skippedRecent = 0;
  let reachedLimit = false;

  writer.onWriteError((error) => {
    // Reexecuta erros transitórios algumas vezes; o resto propaga no close().
    return error.failedAttempts < 3;
  });

  while (!reachedLimit) {
    let query = db
      .collection('matches')
      .where('status', 'in', OPEN_STATUSES)
      .select('status', 'createdAt')
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

      if (scheduled >= MAX_WRITES) {
        reachedLimit = true;
        break;
      }

      scheduled += 1;

      if (!DRY_RUN) {
        writer.update(doc.ref, { status: 'FINISHED' });
      }
    }

    if (snapshot.size < PAGE_SIZE) {
      break;
    }
  }

  await writer.close();

  console.log(`Partidas abertas lidas:        ${scanned}`);
  console.log(`Ignoradas por serem recentes:  ${skippedRecent} (< ${MAX_AGE_HOURS}h)`);
  console.log(`Finalizadas:                   ${scheduled}${DRY_RUN ? ' (DRY_RUN, nada foi escrito)' : ''}`);

  if (reachedLimit) {
    console.log(
      `Teto de ${MAX_WRITES} escritas atingido — ainda restam partidas abertas. ` +
        `A próxima execução continua de onde esta parou.`
    );
  }
}

finishMatches()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro ao finalizar partidas:', error);

    if (error && error.code === 9) {
      console.error(
        'FAILED_PRECONDITION costuma significar índice ausente — a mensagem ' +
          'acima traz o link para criá-lo no console.'
      );
    }

    // Precisa falhar de verdade: antes o erro era engolido e o Action ficava
    // verde mesmo sem ter encerrado nada.
    process.exit(1);
  });
