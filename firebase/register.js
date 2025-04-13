// auth

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {auth} from "./firebase.js";


// fireStore

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

import {db} from "./firebase.js";



// Main logic


if(localStorage.getItem("uid") != null) {
    window.location.href = "group.html";
}
else{
    document.getElementById("registerBtn").addEventListener("click", (e) => {
        e.preventDefault();
        signup();
    })
    
    function signup(){
        const email = document.getElementById("rEmail").value;
        const pass = document.getElementById("rPassword").value;
        const user = document.getElementById("username").value;
    
        createUserWithEmailAndPassword(auth, email, pass)
        .then( (userCredential) => {
            console.log(userCredential.user.email);
            localStorage.setItem("uid", userCredential.user.uid)
            return setDoc(doc(db, "users", userCredential.user.uid), {
                username: user,
                email: userCredential.user.email,
                createdAt: new Date()
            })
        })
        .then( () => {
            window.location.href = "groups.html";
        })
        .catch( (e) => {alert(e.message)});
    }
}

