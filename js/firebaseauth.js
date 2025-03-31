
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-analytics.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
  import { getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
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
  const analytics = getAnalytics(app);

  //submit button
  const submit = document.getElementById('signup');
submit.addEventListener('click', (event) => {
  event.preventDefault();
  console.log(5)

  //getting email and password
  const email = document.getElementById('rEmail').value;
  const password = document.getElementById('rPassword').value;
  const userName = document.getElementById('username').value;

  const auth=getAuth();
  const bd=getFirestore();

  createUserWithEmailAndPassword(auth,email,password)
  .then((userCredential) => {
    const user = userCredential.user;
    const userData={
      email: email,
      userName: userName
    };

})
})  
