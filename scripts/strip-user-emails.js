/* eslint-disable */

// Migração única: remove o campo `email` de todos os documentos já existentes
// na coleção `users`. Versões antigas do app gravavam o email do usuário ali;
// este script apaga esse dado sensível dos registros históricos.
//
// Uso: node ./scripts/strip-user-emails.js
// Requer scripts/serviceAccountKey.json (Admin SDK).

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const app = initializeApp({
  credential: cert(require('./serviceAccountKey.json')),
});

const db = getFirestore(app);

const stripEmails = async () => {
  const snapshot = await db.collection('users').get();

  console.log(`Verificando ${snapshot.size} usuário(s)...`);

  const withEmail = snapshot.docs.filter(
    (doc) => doc.get('email') !== undefined
  );

  if (withEmail.length === 0) {
    console.log('Nenhum documento com email para limpar.');
    return;
  }

  const BATCH_SIZE = 500;
  let cleaned = 0;

  for (let i = 0; i < withEmail.length; i += BATCH_SIZE) {
    const chunk = withEmail.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    for (const doc of chunk) {
      batch.update(doc.ref, { email: FieldValue.delete() });
      cleaned++;
    }

    await batch.commit();
  }

  console.log(`Emails removidos de ${cleaned} documento(s).`);
};

stripEmails()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
