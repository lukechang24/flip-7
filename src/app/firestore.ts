import { firestore } from './firebase';

export const addDocument = async () => {
  try {
    const docRef = await firestore.collection('items').add({
      name: 'Next.js with Firebase',
      description: 'A powerful combination for modern web apps.',
    });
    console.log('Document written with ID: ', docRef.id);
  } catch (error) {
    console.error('Error adding document: ', error);
  }
};

export const getDocuments = async () => {
  const querySnapshot = await firestore.collection('items').get();
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${doc.data().name}`);
  });
};
