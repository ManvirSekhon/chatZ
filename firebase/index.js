// auth

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from "./firebase.js";

import {auth} from "./firebase.js";

    //preLoader
    const load = document.getElementById('preLoader');

// Main logic

if(localStorage.getItem("uid") != null) {
    window.location.href = "groups.html";
}
else {
    document.getElementById("loginBtn").addEventListener("click", (e) => {
        e.preventDefault();
        login();
        load.style.display= "block";
    })
    

    // functions 
    
    function login() {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        signInWithEmailAndPassword(auth, email, password)
        .then( (userCredential) => {
            console.log(userCredential.user.email);
            localStorage.setItem("uid", userCredential.user.uid);
            const docRef = doc(db, "users", localStorage.getItem('uid'));
            return getDoc(docRef);
        })
        .then( docSnap => {
            console.log(docSnap);
            console.log(docSnap.data());
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.username) {
                    console.log("Document data:", data.username);
                    localStorage.setItem("username", data.username);
                } else {
                    console.log("No username field in document");
                }
            } else {
                console.log("No such document!");
            }
            window.location.href = "groups.html";
        })
        .catch((error) => {alert(error.message)
            load.style.display = "none";
        });    
    }
}
