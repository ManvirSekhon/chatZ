
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyBTuOScamAOS5Mh_KvaJXz1zNamknE2Fv8",
  authDomain: "chatz-d931f.firebaseapp.com",
  projectId: "chatz-d931f",
  storageBucket: "chatz-d931f.firebasestorage.app",
  messagingSenderId: "487288747913",
  appId: "1:487288747913:web:351adf59a7f5bc6cc39358",
  measurementId: "G-LRBDV6RCB2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);