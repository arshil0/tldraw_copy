// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getDatabase, set, ref, child, get, push, remove} from "firebase/database";
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
  appId: "1:685073490766:web:81a30e12cf3b3eada0341f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const setCanvas = async(sessionID, objects) =>{
  const db = getDatabase();
  set(ref(db, sessionID + "/objects"), objects)
}


export const addToDB = async(sessionID, object, index) =>{
  const db = getDatabase();
  set(ref(db, sessionID + "/objects/" + index), object)
}

export const removeFromDB = async(sessionID, object) =>{
  console.log(object);
  const db = getDatabase();
  remove(ref(db, sessionID + "objects"), object)
}


export const getCanvas = async(sessionID) =>{
  const dbRef = ref(getDatabase());
  let value = null;
  await get(child(dbRef, sessionID + "/objects")).then((snapshot) => {
    if (snapshot.exists()) {
      value = snapshot.val();
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  })
  return value;
}