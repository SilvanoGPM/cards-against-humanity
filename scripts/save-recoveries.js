/* eslint-disable */

const fs = require('fs');
const path = require('path');

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const app = initializeApp({
  credential: cert(require('./serviceAccountKey.json')),
});

const db = getFirestore(app);

const outputDir = path.join(__dirname, 'recoveries');

function sanitizeFilename(str) {
  return str.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getFilename(data) {
  if (data.userEmail) {
    const localPart = data.userEmail.split('@')[0];
    return sanitizeFilename(localPart);
  }

  if (data.sentAt) {
    return sanitizeFilename(data.sentAt);
  }

  return 'unknown';
}

const saveRecoveries = async () => {
  try {
    const snapshot = await db.collection('recovery').get();

    if (snapshot.empty) {
      console.log('Nenhum recovery encontrado.');
      return;
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let saved = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      let filename = getFilename(data);
      const filePath = path.join(outputDir, `${filename}.json`);

      // Evita sobrescrever arquivos com o mesmo nome
      let finalPath = filePath;
      let counter = 1;
      while (fs.existsSync(finalPath)) {
        finalPath = path.join(outputDir, `${filename}_${counter}.json`);
        counter++;
      }

      fs.writeFileSync(finalPath, JSON.stringify(data, null, 2), 'utf-8');
      saved++;
    });

    console.log(`${saved} recovery(s) salvo(s) em ${outputDir}`);
  } catch (error) {
    console.error('Erro ao salvar recoveries:', error);
  }
};

saveRecoveries();
