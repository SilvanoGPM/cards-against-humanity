/* eslint-disable */

const { initializeApp } = require('firebase/app');

const {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyCJh45lbjhCek0BP30K7YvSK-hG-8SeWa0',
  authDomain: 'cards-against-humanity-16605.firebaseapp.com',
  projectId: 'cards-against-humanity-16605',
  storageBucket: 'cards-against-humanity-16605.appspot.com',
  messagingSenderId: '1094359847041',
  appId: '1:1094359847041:web:a8ecc0bd327d85ee5f3d80',
  measurementId: 'G-2GNVB3MBHM',
};

const app = initializeApp(firebaseConfig);

const matchesCollection = collection(getFirestore(app), 'matches');

const q = query(matchesCollection, where('status', '!=', 'FINISHED'));

const deleteDocuments = async () => {
  try {
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
      console.log(`Documento ${doc.id} excluído com sucesso.`);
    });

    console.log('Exclusão de documentos concluída.');
  } catch (error) {
    console.error('Erro ao excluir documentos:', error);
  }
};

deleteDocuments();
