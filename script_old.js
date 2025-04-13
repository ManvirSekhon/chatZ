// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const createGroupBtn = document.getElementById('createGroupBtn');
const joinGroupBtn = document.getElementById('joinGroupBtn');
const createGroupSubmitBtn = document.getElementById('createGroupSubmitBtn');
const joinGroupSubmitBtn = document.getElementById('joinGroupSubmitBtn');
const groupsLogoutBtn = document.getElementById('groupsLogoutBtn');
const chatLogoutBtn = document.getElementById('chatLogoutBtn');
const leaveGroupBtn = document.getElementById('leaveGroupBtn');

const openSidebarBtn = document.getElementById('openSidebar');
const closeSidebarBtn = document.getElementById('closeSidebar');
const sidebar = document.getElementById('sidebar');

const groupsOptions = document.getElementById('groupsOptions');
const createGroupForm = document.getElementById('createGroupForm');
const joinGroupForm = document.getElementById('joinGroupForm');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const tabIndicator = document.querySelector('.tab-indicator');

const backBtns = document.querySelectorAll('.back-btn');
const messageForm = document.querySelector('.message-form');
const messageInput = document.getElementById('messageInput');

// Animation utility
function animateElement(element, animation) {
  element.style.animation = 'none';
  element.offsetHeight; // Trigger reflow
  element.style.animation = animation;
}

// Tab functionality
tabBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    // Update active tab button
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Move tab indicator
    tabIndicator.style.transform = `translateX(${index * 100}%)`;
    
    // Show active tab content
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.add('active');
    
    // Animate the content
    animateElement(document.getElementById(btn.dataset.tab), 'fadeSlideUp 0.5s ease forwards');
  });
});

// Login/Register functionality
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    window.location.href = 'groups.html';
  });
}

if (registerBtn) {
  registerBtn.addEventListener('click', () => {
    window.location.href = 'groups.html';
  });
}

// Group page form toggling
createGroupBtn.addEventListener('click', () => {
  groupsOptions.classList.add('hidden');
  createGroupForm.classList.remove('hidden');
  animateElement(createGroupForm, 'fadeSlideUp 0.5s ease forwards');
});

joinGroupBtn.addEventListener('click', () => {
  groupsOptions.classList.add('hidden');
  joinGroupForm.classList.remove('hidden');
  animateElement(joinGroupForm, 'fadeSlideUp 0.5s ease forwards');
});

// Back button functionality
backBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.target).classList.remove('hidden');
    btn.closest('.card-content').classList.add('hidden');
    animateElement(document.getElementById(btn.dataset.target), 'fadeSlideUp 0.5s ease forwards');
  });
});

// Group submission handlers
if (createGroupSubmitBtn) {
  createGroupSubmitBtn.addEventListener('click', () => {
    window.location.href = 'chat.html';
  });
}

if (joinGroupSubmitBtn) {
  joinGroupSubmitBtn.addEventListener('click', () => {
    window.location.href = 'chat.html';
  });
}

// Chat page sidebar toggle
openSidebarBtn.addEventListener('click', () => {
  sidebar.style.transform = 'translateX(0)';
});

closeSidebarBtn.addEventListener('click', () => {
  sidebar.style.transform = 'translateX(-100%)';
});

// Chat message submission (frontend only)
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  if (messageInput.value.trim() === '') return;
  
  const messagesContainer = document.querySelector('.messages-container');
  const messageGroup = document.querySelector('.message-group');
  
  // Create new message element
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', 'own-message');
  
  const currentTime = new Date();
  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  messageDiv.innerHTML = `
    <div class="message-content">
      <div class="message-header">
        <span class="message-time">${formattedTime}</span>
      </div>
      <p class="message-text">${messageInput.value}</p>
    </div>
  `;
  
  // Add message to DOM
  messageGroup.appendChild(messageDiv);
  
  // Clear input
  messageInput.value = '';
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Animate the message
  animateElement(messageDiv, 'fadeSlideUp 0.3s ease forwards');
});

// Logout functionality
if (groupsLogoutBtn) {
  groupsLogoutBtn.addEventListener('click', () => {
    window.location.href = 'auth.html';
  });
}

if (chatLogoutBtn) {
  chatLogoutBtn.addEventListener('click', () => {
    window.location.href = 'auth.html';
  });
}

// Leave group button
if (leaveGroupBtn) {
  leaveGroupBtn.addEventListener('click', () => {
    window.location.href = 'groups.html';
  });
}

// Button glow effect
const buttons = document.querySelectorAll('.primary-btn');
buttons.forEach(button => {
  button.addEventListener('mousedown', (e) => {
    const btnGlow = button.querySelector('.btn-glow');
    if (btnGlow) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      btnGlow.style.left = `${x}px`;
      btnGlow.style.top = `${y}px`;
    }
  });
});

// Input focus effects
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
  input.addEventListener('focus', () => {
    const focusElement = input.nextElementSibling;
    if (focusElement && focusElement.classList.contains('input-focus')) {
      focusElement.style.width = '100%';
    }
  });
  
  input.addEventListener('blur', () => {
    const focusElement = input.nextElementSibling;
    if (focusElement && focusElement.classList.contains('input-focus')) {
      focusElement.style.width = '0';
    }
  });
});

// Mobile responsive adjustments
function handleResize() {
  if (window.innerWidth <= 768) {
    sidebar.style.transform = 'translateX(-100%)';
  } else {
    sidebar.style.transform = '';
  }
}

window.addEventListener('resize', handleResize);
handleResize(); // Initial call

// Scroll message container to bottom on load
document.addEventListener('DOMContentLoaded', () => {
  const messagesContainer = document.querySelector('.messages-container');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});
