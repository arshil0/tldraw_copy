// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getFirestore, collection, getDocs} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBU6E_OkiO7TH3REQ3fFOALYpodgzxb0LI",
  authDomain: "tldrawcopy.firebaseapp.com",
  databaseURL: "https://tldrawcopy-default-rtdb.firebaseio.com",
  projectId: "tldrawcopy",
  storageBucket: "tldrawcopy.appspot.com",
  messagingSenderId: "685073490766",
  appId: "1:685073490766:web:81a30e12cf3b3eada0341f"
};

// Initialize Firebase
initializeApp(firebaseConfig);

const db = getFirestore();

const col = collection(db, "test")

export const setDatabase = async(x, y) =>{
    /* I give up
    await col.add({
        x: x,
        y: y
    })*/
}