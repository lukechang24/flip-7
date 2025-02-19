// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import 'firebase/compat/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import firebaseConfig from "./firebaseConfig"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional`


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const analytics = getAnalytics(app);

class Firebase {
  constructor() {
    this.db = db;
  }
  createRoom = async (id, data) => {
    const roomRef = doc(this.db, "rooms", id); // Reference to the document
    await setDoc(roomRef, data); // Set data in Firestore
    return roomRef;
  };

  findRoom = async (id) => {
    const roomRef = doc(this.db, "rooms", id);
    const roomSnap = await getDoc(roomRef);

    return roomSnap.exists() ? roomSnap.data() : null;
  };

  updateRoom = async (id, newData) => {
    const roomRef = doc(this.db, "rooms", id);
    await updateDoc(roomRef, newData);
  };

  listenToRoom = (id, callback) => {
    const roomRef = doc(this.db, "rooms", id);
    return onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data()); // Call function with new data
      } else {
        callback(null); // Handle room deletion
      }
    });
  };

}

export default Firebase;