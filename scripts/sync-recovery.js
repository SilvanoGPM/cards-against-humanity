/* eslint-disable */

const fs = require('fs');
const path = require('path');

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// =============================================
// Escolha o arquivo de recovery aqui:
const RECOVERY_FILE = 'marcoliveira0809.json';
// =============================================

const app = initializeApp({
  credential: cert(require('./serviceAccountKey.json')),
});

const db = getFirestore(app);

const syncRecovery = async () => {
  const filePath = path.join(__dirname, 'recoveries', RECOVERY_FILE);

  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const recovery = JSON.parse(raw);
  const cards = recovery.cards;

  if (!Array.isArray(cards) || cards.length === 0) {
    console.error('Nenhuma carta encontrada no arquivo.');
    process.exit(1);
  }

  console.log(`Sincronizando ${cards.length} carta(s) de ${RECOVERY_FILE}...`);

  const cardsCollection = db.collection('cards');
  let created = 0;
  let updated = 0;
  let skipped = 0;

  // Firestore batch suporta no máximo 500 operações
  const BATCH_SIZE = 500;

  for (let i = 0; i < cards.length; i += BATCH_SIZE) {
    const chunk = cards.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    for (const card of chunk) {
      if (!card.id || !card.message || !card.type) {
        skipped++;
        continue;
      }

      const docRef = cardsCollection.doc(card.id);
      const doc = await docRef.get();

      if (doc.exists) {
        batch.update(docRef, { message: card.message, type: card.type });
        updated++;
      } else {
        batch.set(docRef, { message: card.message, type: card.type });
        created++;
      }
    }

    await batch.commit();
  }

  console.log(`Sincronização concluída!`);
  console.log(`  Criadas: ${created}`);
  console.log(`  Atualizadas: ${updated}`);
  console.log(`  Ignoradas: ${skipped}`);
};

syncRecovery();
