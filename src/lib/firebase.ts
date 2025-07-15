// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB90N6T3yW8mRdAV1V3uPUVos4hnJRTDAA",
  authDomain: "cloudstage-43rw8.firebaseapp.com",
  projectId: "cloudstage-43rw8",
  storageBucket: "cloudstage-43rw8.firebasestorage.app",
  messagingSenderId: "132847146373",
  appId: "1:132847146373:web:d5d0e89be15b50ad42e0ec"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
