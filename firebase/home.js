import {
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {auth} from "./firebase.js";


// Main logic

if(localStorage.getItem("uid") == null) {
    window.location.href = "../index.html";
}
else {
    document.getElementById("logout").addEventListener("click", logout);


    // functions
    
    function logout() {
        signOut(auth)
        .then( () => {
            localStorage.removeItem("uid");
            alert("you are logout");
            window.location.href = "../index.html";
        })
        .catch( (e) => console.log("error: " + e.message));
    }
}
