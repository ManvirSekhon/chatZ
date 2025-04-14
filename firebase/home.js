import {
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";


import {auth} from "./firebase.js";

import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from "./firebase.js";


// Main logic

if(localStorage.getItem("uid") == null) {
    window.location.href = "index.html";
}
else {
    document.getElementById("groupsLogoutBtn").addEventListener("click", logout);
    
    // userInfo

    document.getElementById("User").innerText = localStorage.getItem("username");


    // create groups

    document.getElementById('createGroupSubmitBtn')
    .addEventListener('click', (e) => {
        createGroup();
    })


    document.getElementById('joinGroupSubmitBtn')
    .addEventListener('click', (e) => {
        joinGroup();
    })




    // functions
    
    function logout() {
        signOut(auth)
        .then( () => {
            localStorage.removeItem("uid");
            localStorage.removeItem("username");
            alert("you are logout");
            window.location.href = "index.html";
        })
        .catch( (e) => console.log("error: " + e.message));
    }

    async function createGroup() {
        const groupName = document.getElementById('create-name').value.trim();
        const password = document.getElementById('create-pass').value;

        // Check if group already exists
    const groupRef = doc(db, "groups", groupName);
    const groupSnap = await getDoc(groupRef);

    if (groupSnap.exists()) {
        alert("Group name already exists. Please choose another.");
        return;
    }

    // Save to Firestore

    await setDoc(groupRef, {
        password: password,
        createdAt: new Date()
    });

    // Store locally & redirect
    sessionStorage.setItem("groupName", groupName);
    sessionStorage.setItem("groupPassword", password);
    sessionStorage.setItem("action", "create");

    
    window.location.href = "chatting.html";
    }

    async function joinGroup(){
        const groupName = document.getElementById('join-name').value.trim();
        const password = document.getElementById('join-pass').value;

        const groupRef = doc(db, "groups", groupName);
        const groupSnap = await getDoc(groupRef);
        if(groupSnap.exists()){
            if(groupSnap.data().password === password){
                sessionStorage.setItem("groupName", groupName);
                sessionStorage.setItem("groupPassword", password);
                sessionStorage.setItem("action", "join");
                window.location.href = "chatting.html";
            }
        }
    }



}


