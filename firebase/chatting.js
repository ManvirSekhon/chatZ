import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { db } from "./firebase.js";
import WebRTCManager from "./webrtc.js";

const socket = io('http://localhost:8000', {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 60000,
    autoConnect: true,
    withCredentials: true,
    forceNew: true
});
let lastMessageDate = null;

const groupName = sessionStorage.getItem("groupName");
document.title = groupName;
if (!groupName) {
  window.location.href = "../groups.html";
} else {
  document.body.style.display = "block";
}

document.getElementById("chatGroup-name-header").innerText = groupName;
const messageInput = document.getElementById('messageInput');
const messageBtn = document.getElementById("sendMessageBtn");
const userName = localStorage.getItem("username");

// File upload handling
const fileInput = document.getElementById('fileUpload');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const CHUNK_SIZE = 64 * 1024; // 64KB chunks

// Store active file transfers
const activeFileTransfers = new Map();

// Initialize WebRTC manager
const webRTCManager = new WebRTCManager(socket, groupName, userName);

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
    <div class="message-content" id="join-left-message">
      <div class="message-header">
        <span class="message-time">${currentTime}</span>
      </div>
      <p class="message-text">${userName} joined the chat</p>
    </div>
  `;
  
  messageGroup.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  animateElement(messageDiv, 'fadeSlideUp 0.3s ease forwards');
});

socket.on('current-members', (members) => {
  const membersContainer = document.querySelector('.members-container');
  membersContainer.innerHTML = ''; // Clear existing members
  
  members.forEach(member => {
    const memberDiv = document.createElement('div');
    memberDiv.classList.add('member');
    memberDiv.innerHTML = `
      <div class="member-avatar">${member.trim().charAt(0).toUpperCase()}</div>
      <div class="member-name">${member}</div>
    `;
    membersContainer.appendChild(memberDiv);
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
});

socket.on('receive', (data) => {
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
});

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
});

window.addEventListener("beforeunload", () => {
  sessionStorage.removeItem("groupName");
});

// Handle file input changes
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            alert('File size exceeds 5MB limit');
            fileInput.value = '';
            return;
        }

        // Show loading state
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'message own-message file-message';
        loadingMessage.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">You</span>
                    <span class="message-time">${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="file-info">
                    <div class="file-uploading">
                        <span class="file-icon">📎</span>
                        <span class="file-name">${file.name}</span>
                        <div class="upload-progress">Preparing upload...</div>
                    </div>
                </div>
            </div>
        `;
        
        const messageGroup = document.querySelector('.message-group');
        messageGroup.appendChild(loadingMessage);
        messageGroup.scrollTop = messageGroup.scrollHeight;

        // Generate unique file ID
        const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Calculate total chunks
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        
        // Store file transfer info
        activeFileTransfers.set(fileId, {
            fileName: file.name,
            fileType: file.type,
            totalChunks,
            receivedChunks: new Set(),
            chunks: new Array(totalChunks)
        });

        // Read and send file in chunks
        const reader = new FileReader();
        let offset = 0;
        let currentChunk = 0;

        const readNextChunk = () => {
            const chunk = file.slice(offset, offset + CHUNK_SIZE);
            reader.readAsArrayBuffer(chunk);
        };

        reader.onload = (event) => {
            // Send chunk to server
            socket.emit('file-chunk', {
                room: groupName,
                fileId,
                chunkIndex: currentChunk,
                totalChunks,
                fileName: file.name,
                fileType: file.type,
                chunk: event.target.result,
                senderName: userName
            });

            // Update progress
            const progress = ((currentChunk + 1) / totalChunks) * 100;
            const progressDiv = loadingMessage.querySelector('.upload-progress');
            progressDiv.textContent = `Uploading... ${Math.round(progress)}%`;

            currentChunk++;
            offset += CHUNK_SIZE;

            if (offset < file.size) {
                setTimeout(readNextChunk, 0);
            } else {
                progressDiv.textContent = 'Upload complete';
                fileInput.value = '';
            }
        };

        readNextChunk();
    } catch (error) {
        console.error('Error handling file:', error);
        alert('Error uploading file: ' + error.message);
        fileInput.value = '';
    }
});

// Handle incoming file chunks
socket.on('file-chunk', ({ fileId, chunkIndex, totalChunks, fileName, fileType, chunk, senderName }) => {
    try {
        // Initialize file transfer if not exists
        if (!activeFileTransfers.has(fileId)) {
            activeFileTransfers.set(fileId, {
                fileName,
                fileType,
                totalChunks,
                receivedChunks: new Set(),
                chunks: new Array(totalChunks),
                senderName
            });
        }

        const transfer = activeFileTransfers.get(fileId);
        transfer.chunks[chunkIndex] = chunk;
        transfer.receivedChunks.add(chunkIndex);

        // Check if all chunks are received
        if (transfer.receivedChunks.size === totalChunks) {
            // Create blob from chunks
            const blob = new Blob(transfer.chunks, { type: fileType });
            const url = URL.createObjectURL(blob);

            // Create download link
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message file-message';
            messageDiv.innerHTML = `
                <div class="message-avatar">${transfer.senderName.trim().charAt(0).toUpperCase()}</div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-author">${transfer.senderName}</span>
                        <span class="message-time">${new Date().toLocaleTimeString()}</span>
                    </div>
                    <div class="file-info">
                        <a href="${url}" download="${fileName}" class="file-link">
                            <span class="file-icon">📎</span>
                            <span class="file-name">${fileName}</span>
                        </a>
                    </div>
                </div>
            `;

            const messageGroup = document.querySelector('.message-group');
            messageGroup.appendChild(messageDiv);
            messageGroup.scrollTop = messageGroup.scrollHeight;

            // Cleanup
            activeFileTransfers.delete(fileId);
        }
    } catch (error) {
        console.error('Error handling file chunk:', error);
    }
});

// Handle file errors
socket.on('file-error', ({ error }) => {
    console.error('File transfer error:', error);
    alert('File transfer error: ' + error);
});

// Cleanup on disconnect
socket.on('disconnect', () => {
    // Cleanup active file transfers
    activeFileTransfers.clear();
});

