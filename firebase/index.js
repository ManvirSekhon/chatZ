// auth

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {auth} from "./firebase.js";


// Main logic

if(localStorage.getItem("uid") != null) {
    window.location.href = "groups.html";
}
else {
    document.getElementById("loginBtn").addEventListener("click", (e) => {
        e.preventDefault();
        login();
    })
    
    
    // functions 
    
    function login() {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        
        signInWithEmailAndPassword(auth, email, password)
        .then( (userCredential) => {
            console.log(userCredential.user.email);
            localStorage.setItem("uid", userCredential.user.uid);
            window.location.href = "groups.html";
        })
        .catch((error) => {alert(error.message)});
    }
}
