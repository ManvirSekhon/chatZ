import {
    signOut
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {auth} from "./firebase.js";

import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from "./firebase.js";

// Preloader
const load = document.getElementById('preLoader');

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
        // Show preloader
        load.style.display = "block";
        document.body.style.overflow = "hidden";

        auth.signOut()
            .then(() => {
                // Clear all local storage data
                localStorage.clear();
                sessionStorage.clear();
                
                showNotification("You have been logged out", "success");
                
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            })
            .catch((error) => {
                console.error("Logout error:", error);
                showNotification("An error occurred during logout. Please try again.");
                load.style.display = "none";
                document.body.style.overflow = "";
            });
    }

    // Helper functions for error handling
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

    async function createGroup() {
        const groupName = document.getElementById('create-name').value.trim();
        const password = document.getElementById('create-pass').value;

        // Validate inputs
        if (!groupName) {
            showNotification("Please enter a group name");
            return;
        }

        if (groupName.length < 3) {
            showNotification("Group name must be at least 3 characters long");
            return;
        }

        // Show preloader
        load.style.display = "block";
        document.body.style.overflow = "hidden";
        
        try {
            // Check if group already exists
            const groupRef = doc(db, "groups", groupName);
            const groupSnap = await getDoc(groupRef);

            if (groupSnap.exists()) {
                showNotification("Group name already exists. Please choose another name.");
                load.style.display = "none";
                document.body.style.overflow = "";
                return;
            }

            // Save to Firestore
            await setDoc(groupRef, {
                password: password || "", // Store empty string if no password provided
                createdAt: new Date()
            });

            // Show success message
            showNotification("Group created successfully! Redirecting...", "success");

            // Store locally & redirect
            sessionStorage.setItem("groupName", groupName);
            sessionStorage.setItem("groupPassword", password || "");
            sessionStorage.setItem("action", "create");
            setTimeout(() => {
                window.location.href = "chatting.html";
            }, 1000);
        } catch (error) {
            console.error("Error creating group:", error);
            showNotification("An error occurred while creating the group. Please try again.");
            load.style.display = "none";
            document.body.style.overflow = "";
        }
    }

    async function joinGroup(){
        const groupName = document.getElementById('join-name').value.trim();
        const password = document.getElementById('join-pass').value;

        // Validate inputs
        if (!groupName) {
            showNotification("Please enter a group name");
            return;
        }

        // Show preloader
        load.style.display = "block";
        document.body.style.overflow = "hidden";
        
        try {
            const groupRef = doc(db, "groups", groupName);
            const groupSnap = await getDoc(groupRef);
            
            if (!groupSnap.exists()) {
                showNotification("Group does not exist. Please check the group name.");
                load.style.display = "none";
                document.body.style.overflow = "";
                return;
            }

            const groupData = groupSnap.data();
            // Only check password if the group has one set
            if (groupData.password && groupData.password !== password) {
                showNotification("Incorrect password. Please try again.");
                load.style.display = "none";
                document.body.style.overflow = "";
                return;
            }

            // Show success message
            showNotification("Joining group...", "success");

            // Success - store group info and redirect
            sessionStorage.setItem("groupName", groupName);
            sessionStorage.setItem("groupPassword", password || "");
            sessionStorage.setItem("action", "join");
            setTimeout(() => {
                window.location.href = "chatting.html";
            }, 1000);
        } catch (error) {
            console.error("Error joining group:", error);
            showNotification("An error occurred while joining the group. Please try again.");
            load.style.display = "none";
            document.body.style.overflow = "";
        }
    }
}


