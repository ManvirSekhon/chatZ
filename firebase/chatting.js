import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from "./firebase.js";



const socket = io('http://localhost:8000');
let lastMessageDate = null;



const groupName = sessionStorage.getItem("groupName");
document.title = groupName;
if (!groupName) {
  window.location.href = "../groups.html";
} else {
  document.body.style.display = "block";
}

document.getElementById("chatGroup-name-header").innerText = groupName;
// const form = document.getElementById('message-form');
const messageInput = document.getElementById('messageInput');
// const messageList = document.getElementById('messages-container');
const messageBtn = document.getElementById("sendMessageBtn");
const userName = localStorage.getItem("username");


function insertDayDivider(date) {
  const messageGroup = document.querySelector('.message-group');
  
  const divider = document.createElement('div');
  divider.classList.add('day-divider');

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    divider.textContent = "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    divider.textContent = "Yesterday";
  } else {
    divider.textContent = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  }

  messageGroup.appendChild(divider);
}


socket.on("connect", () => {
    console.log("Connected to server");
    socket.emit('new-user-joined', {groupName, userName});
});


 
const animateElement = (element, animation) => {
  element.style.animation = 'none';
  element.offsetHeight; // Trigger reflow
  element.style.animation = animation;
};



socket.on('user-joined', userName => {
  updateMemberList(userName)
  const messagesContainer = document.querySelector('.messages-container');
  const messageGroup = document.querySelector('.message-group');

  const messageDate = new Date();
  if (!lastMessageDate || lastMessageDate.toDateString() !== messageDate.toDateString()) {
    insertDayDivider(messageDate);
    lastMessageDate = messageDate;
  }

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', 'join-left');
  messageDiv.innerHTML = `
    <div class="message-content">
      <div class="message-header">
        <span class="message-time">${currentTime}</span>
      </div>
      <p class="message-text">${userName} joined the chat</p>
    </div>
  `;
  
  messageGroup.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  animateElement(messageDiv, 'fadeSlideUp 0.3s ease forwards');
})

socket.on("current-members", (members) => {
  members.forEach(name => {
    updateMemberList(name);
  });
});


messageBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (!messageInput.value.trim()) return;
    const messagesContainer = document.querySelector('.messages-container');
    const messageGroup = document.querySelector('.message-group');

    const messageDate = new Date();
    if (!lastMessageDate || lastMessageDate.toDateString() !== messageDate.toDateString()) {
      insertDayDivider(messageDate);
      lastMessageDate = messageDate;
    }
  

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'own-message');
    messageDiv.innerHTML = `
      <div class="message-content">
        <div class="message-header">
          <span class="message-time">${currentTime}</span>
        </div>
        <p class="message-text">${messageInput.value}</p>
      </div>
    `;
    
    messageGroup.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    animateElement(messageDiv, 'fadeSlideUp 0.3s ease forwards');
    const message = messageInput.value;
    socket.emit("send", {groupName, message});
    messageInput.value = '';
})

socket.on('receive', (data) => {
    console.log(data.message, data.name);
    const userName = data.name;
    const message = data.message;
    const messagesContainer = document.querySelector('.messages-container');
    const messageGroup = document.querySelector('.message-group');

    const messageDate = new Date();
    if (!lastMessageDate || lastMessageDate.toDateString() !== messageDate.toDateString()) {
      insertDayDivider(messageDate);
      lastMessageDate = messageDate;
    }

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.innerHTML = `
      <div class="message-avatar">${userName.trim().charAt(0).toUpperCase()}</div>
      <div class="message-content">
        <div class="message-header">
          <span class="message-author">${userName}</span>
          <span class="message-time">${currentTime}</span>
        </div>
        <p class="message-text">${message}</p>
      </div>
    `;
    
    messageGroup.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    animateElement(messageDiv, 'fadeSlideUp 0.3s ease forwards');
})

function updateMemberList(userName){
  const member = document.createElement("div");
  member.classList.add("member");
  member.innerHTML = `
    <div class="member-avatar">${userName.trim().charAt(0).toUpperCase()}</div>
    <span class="member-name">${userName.trim()}</span>
  `;
  document.querySelector(".members-list").appendChild(member);
}

function removeMemberFromList(userName) {
  const members = document.querySelectorAll(".member");
  members.forEach(member => {
    const name = member.querySelector(".member-name").textContent.trim();
    if (name === userName.trim()) {
      member.remove();
    }
  });
}

socket.on("leaving", (user) => {
  const messagesContainer = document.querySelector('.messages-container');
  const messageGroup = document.querySelector('.message-group');

  const messageDate = new Date();
  if (!lastMessageDate || lastMessageDate.toDateString() !== messageDate.toDateString()) {
    insertDayDivider(messageDate);
    lastMessageDate = messageDate;
  }

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', 'join-left');
  messageDiv.innerHTML = `
    <div class="message-content">
      <div class="message-header">
        <span class="message-time">${currentTime}</span>
      </div>
      <p class="message-text">${user} has left the chat</p>
    </div>
  `;
  
  messageGroup.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  animateElement(messageDiv, 'fadeSlideUp 0.3s ease forwards');
  removeMemberFromList(user);
})

window.addEventListener("beforeunload", () => {
  sessionStorage.removeItem("groupName");
});

