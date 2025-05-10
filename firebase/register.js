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

// Get DOM elements
const registerForm = document.getElementById('registerForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('rEmail');
const passwordInput = document.getElementById('rPassword');
const registerBtn = document.getElementById('registerBtn');
const load = document.getElementById('preLoader');

// Add event listener to register button
registerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    register();
});

// Register function
function register() {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Input validation
    if (!username || !email || !password) {
        showNotification("Please fill in all fields");
        return;
    }

    if (!validateUsername(username)) {
        showNotification("Username must be 3-20 characters and can only contain letters, numbers, and underscores");
        return;
    }

    if (!validateEmail(email)) {
        showNotification("Please enter a valid email address");
        return;
    }

    if (!validatePassword(password)) {
        showNotification("Password must be at least 6 characters long");
        return;
    }
    
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        localStorage.setItem("uid", userCredential.user.uid);
        localStorage.setItem("username", username);
        const docRef = doc(db, "users", localStorage.getItem('uid'));
        return setDoc(docRef, {
            username: username,
            email: email,
            createdAt: new Date().toISOString()
        });
    })
    .then(() => {
        // Show preloader only after successful registration
        load.style.display = "block";
        document.body.style.overflow = "hidden";
        showNotification("Registration successful! Redirecting...", "success");
        setTimeout(() => {
            window.location.href = "groups.html";
        }, 1000);
    })
    .catch((error) => {
        console.error("Registration error:", error);
        let errorMessage = "An error occurred during registration. Please try again.";
        
        // Enhanced error messages
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = "This email is already registered. Please try logging in instead.";
                break;
            case 'auth/invalid-email':
                errorMessage = "Please enter a valid email address.";
                break;
            case 'auth/operation-not-allowed':
                errorMessage = "Email/password accounts are not enabled. Please contact support.";
                break;
            case 'auth/weak-password':
                errorMessage = "Password is too weak. Please use a stronger password.";
                break;
            case 'auth/network-request-failed':
                errorMessage = "Network error. Please check your internet connection.";
                break;
        }
        
        showNotification(errorMessage);
    });
}

// Validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

// Notification function
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

