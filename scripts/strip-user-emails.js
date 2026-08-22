/* eslint-disable */

/**
 * Migração: remove o campo `email` dos documentos da coleção `users`.
 *
 * Versões antigas do app gravavam o email do jogador ali. Como as regras
 * liberam a leitura de `/users/{qualquer}` para qualquer autenticado, esse
 * campo é exatamente o dado sensível do incidente — enquanto ele existir nos
 * documentos históricos, o vazamento continua aberto para quem estiver logado.
 *
 * O login já não grava mais o campo (e o apaga do próprio documento, via
 * `deleteField`), e as regras proíbem gravá-lo. Falta a limpeza do histórico.
 *
 * ATENÇÃO — a versão anterior fazia `db.collection('users').get()`, lendo a
 * coleção inteira de uma vez. O inventário de 2026-08-22 mostrou **110.539
 * usuários**: são 110k leituras num único comando, mais que o dobro do teto
 * diário do plano Spark (50k). O script estourava a quota do dia e ainda podia
 * morrer no meio, sem ter limpado nada.
 *
 * Esta versão lê APENAS os documentos que têm o campo. `orderBy('email')` é o
 * filtro de existência do Firestore: uma query ordenada por um campo só
 * devolve documentos em que esse campo existe. Assim as leituras passam a ser
 * proporcionais ao que falta limpar, e não ao tamanho da base.
 *
 * A paginação sempre relê do começo, sem cursor: cada documento limpo perde o
 * campo e sai do índice de `email`, então a próxima página já vem com os
 * seguintes. O `seen` existe só para detectar o caso em que o índice ainda não
 * refletiu a escrita e a mesma página volta — aí o script para em vez de girar
 * em falso.
 *
 * Variáveis de ambiente:
 *   MAX_DOCS   teto de documentos limpos nesta execução (padrão 15000; o
 *              Spark permite 20k escritas/dia). Se sobrar gente, rode de novo
 *              no dia seguinte: ele continua de onde parou.
 *   DRY_RUN    "true" para apenas contar, sem escrever nada
 *
 * Uso: node ./scripts/strip-user-emails.js
 * Requer scripts/serviceAccountKey.json (Admin SDK).
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const MAX_DOCS = Number(process.env.MAX_DOCS ?? 15000);
const DRY_RUN = process.env.DRY_RUN === 'true';
const PAGE_SIZE = 500;

const app = initializeApp({
  credential: cert(require('./serviceAccountKey.json')),
});

const db = getFirestore(app);

async function stripEmails() {
  // `count()` é uma agregação: custa ~1 leitura por 1000 documentos indexados,
  // não 1 por documento. Dá o total real sem pesar na quota.
  const { count: total } = (
    await db.collection('users').orderBy('email').count().get()
  ).data();

  console.log(`Usuários com o campo email: ${total}`);

  if (total === 0) {
    console.log('Nada a limpar.');
    return;
  }

  const writer = db.bulkWriter();
  const seen = new Set();

  let cleaned = 0;
  let reachedLimit = false;

  writer.onWriteError((error) => error.failedAttempts < 3);

  while (!reachedLimit) {
    // `select()` sem argumentos traz só a referência do documento: a leitura é
    // faturada do mesmo jeito, mas não trafega o email de volta para cá.
    const snapshot = await db
      .collection('users')
      .orderBy('email')
      .select()
      .limit(PAGE_SIZE)
      .get();

    if (snapshot.empty) {
      break;
    }

    let novos = 0;

    for (const doc of snapshot.docs) {
      if (seen.has(doc.id)) {
        continue;
      }

      seen.add(doc.id);
      novos += 1;

      if (cleaned >= MAX_DOCS) {
        reachedLimit = true;
        break;
      }

      cleaned += 1;

      if (!DRY_RUN) {
        writer.update(doc.ref, { email: FieldValue.delete() });
      }
    }

    // Em DRY_RUN nada é apagado, então a mesma página voltaria para sempre — o
    // total vem do `count()` lá em cima, não da varredura.
    if (DRY_RUN || novos === 0) {
      break;
    }

    await writer.flush();
  }

  await writer.close();

  if (DRY_RUN) {
    console.log(
      `DRY_RUN: nada foi escrito. Seriam ${Math.min(total, MAX_DOCS)} documento(s) ` +
        `nesta execução, de ${total} no total.`
    );

    return;
  }

  console.log(`Emails removidos de ${cleaned} documento(s).`);

  if (reachedLimit) {
    console.log(
      `Teto de ${MAX_DOCS} atingido — ainda há usuários com email. ` +
        `Rode de novo (amanhã, por causa da quota) para continuar.`
    );
  }
}

stripEmails()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Erro ao limpar emails:', error);
    process.exit(1);
  });
