// auth

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from "./firebase.js";

import {auth} from "./firebase.js";

// Preloader for login page only
const load = document.getElementById('preLoader');

// Main logic

if(localStorage.getItem("uid") != null) {
    window.location.href = "groups.html";
}
else {
    document.getElementById("loginBtn").addEventListener("click", (e) => {
        e.preventDefault();
        login();
    });

    // Add event listener for forgot password link
    document.getElementById("forgotPasswordLink").addEventListener("click", (e) => {
        e.preventDefault();
        handleForgotPassword();
    });

    // functions 
    
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showNotification(message, type = 'error') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'error' ? 
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="notification-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' :
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="notification-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';

        notification.innerHTML = `
            <div class="notification-content">
                ${icon}
                <p class="notification-message">${message}</p>
            </div>
            <div class="notification-progress"></div>
        `;

        container.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    function login() {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        // Input validation
        if (!email || !password) {
            showNotification("Please enter both email and password");
            return;
        }

        if (!validateEmail(email)) {
            showNotification("Please enter a valid email address");
            return;
        }

        // Show preloader
        load.style.display = "block";
        document.body.style.overflow = "hidden";
        
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            localStorage.setItem("uid", userCredential.user.uid);
            const docRef = doc(db, "users", localStorage.getItem('uid'));
            return getDoc(docRef);
        })
        .then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.username) {
                    localStorage.setItem("username", data.username);
                }
            }
            showNotification("Login successful! Redirecting...", "success");
            setTimeout(() => {
                window.location.href = "groups.html";
            }, 1000);
        })
        .catch((error) => {
            console.error("Login error:", error);
            let errorMessage = "An error occurred during login. Please try again.";
            
            // Enhanced error messages
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = "Please enter a valid email address.";
                    break;
                case 'auth/user-disabled':
                    errorMessage = "This account has been disabled. Please contact support.";
                    break;
                case 'auth/user-not-found':
                    errorMessage = "No account found with this email. Please check your email or sign up.";
                    break;
                case 'auth/wrong-password':
                    errorMessage = "Incorrect password. Please try again.";
                    break;
                case 'auth/too-many-requests':
                    errorMessage = "Too many failed attempts. Please try again later or reset your password.";
                    break;
                case 'auth/network-request-failed':
                    errorMessage = "Network error. Please check your internet connection.";
                    break;
            }
            
            showNotification(errorMessage);
            load.style.display = "none";
            document.body.style.overflow = "";
        });    
    }

    function handleForgotPassword() {
        const email = document.getElementById("email").value.trim();
        
        if (!email) {
            showNotification("Please enter your email address");
            return;
        }

        if (!validateEmail(email)) {
            showNotification("Please enter a valid email address");
            return;
        }

        // Show preloader
        load.style.display = "block";
        document.body.style.overflow = "hidden";

        sendPasswordResetEmail(auth, email)
            .then(() => {
                showNotification("Password reset email sent! Please check your inbox.", "success");
            })
            .catch((error) => {
                console.error("Password reset error:", error);
                let errorMessage = "An error occurred while sending the reset email. Please try again.";
                
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessage = "Please enter a valid email address.";
                        break;
                    case 'auth/user-not-found':
                        errorMessage = "No account found with this email address.";
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = "Too many attempts. Please try again later.";
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = "Network error. Please check your internet connection.";
                        break;
                }
                
                showNotification(errorMessage);
            })
            .finally(() => {
                load.style.display = "none";
                document.body.style.overflow = "";
            });
    }
}
