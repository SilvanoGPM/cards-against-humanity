/* eslint-disable */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = initializeApp({
  credential: cert(require('./serviceAccountKey.json')),
});

const db = getFirestore(app);

const finishMatches = async () => {
  try {
    const snapshot = await db
      .collection('matches')
      .where('status', '!=', 'FINISHED')
      .get();

    const batch = db.batch();

    snapshot.forEach((doc) => {
      batch.update(doc.ref, { status: 'FINISHED' });
    });

    await batch.commit();

    console.log(`${snapshot.size} Partida(s) finalizadas com sucesso.`);
  } catch (error) {
    console.error('Erro ao finalizar partidas:', error);
  }
};

finishMatches();
