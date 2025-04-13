// Optimized and cleaned version of script.js
const initChatApp = () => {
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
  const animateElement = (element, animation) => {
    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.animation = animation;
  };

  // Initialize all event listeners
  const initEventListeners = () => {
    // Tab functionality
    if (tabBtns.length) {
      tabBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          tabIndicator.style.transform = `translateX(${index * 100}%)`;
          tabContents.forEach(content => content.classList.remove('active'));
          document.getElementById(btn.dataset.tab).classList.add('active');
          animateElement(document.getElementById(btn.dataset.tab), 'fadeSlideUp 0.5s ease forwards');
        });
      });
    }

    // // Navigation handlers
    // if (registerBtn) registerBtn.addEventListener('click', () => navigateTo('groups.html'));
    if (createGroupSubmitBtn) createGroupSubmitBtn.addEventListener('click', () => navigateTo('chat.html'));
    if (joinGroupSubmitBtn) joinGroupSubmitBtn.addEventListener('click', () => navigateTo('chat.html'));
    // if (groupsLogoutBtn) groupsLogoutBtn.addEventListener('click', () => navigateTo('auth.html'));
    // if (chatLogoutBtn) chatLogoutBtn.addEventListener('click', () => navigateTo('auth.html'));
    if (leaveGroupBtn) leaveGroupBtn.addEventListener('click', () => navigateTo('groups.html'));

    // Group page form toggling
    if (createGroupBtn) {
      createGroupBtn.addEventListener('click', () => toggleForms(groupsOptions, createGroupForm));
    }
    if (joinGroupBtn) {
      joinGroupBtn.addEventListener('click', () => toggleForms(groupsOptions, joinGroupForm));
    }

    // Back button functionality
    if (backBtns.length) {
      backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          document.getElementById(btn.dataset.target).classList.remove('hidden');
          btn.closest('.card-content').classList.add('hidden');
          animateElement(document.getElementById(btn.dataset.target), 'fadeSlideUp 0.5s ease forwards');
        });
      });
    }

    // Chat functionality
    if (openSidebarBtn) openSidebarBtn.addEventListener('click', () => sidebar.style.transform = 'translateX(0)');
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => sidebar.style.transform = 'translateX(-100%)');

    if (messageForm) {
      messageForm.addEventListener('submit', handleMessageSubmit);
    }

    // UI Effects
    initButtonEffects();
    initInputEffects();
  };

  // Helper functions
  const navigateTo = (page) => window.location.href = page;

  const toggleForms = (options, form) => {
    options.classList.add('hidden');
    form.classList.remove('hidden');
    animateElement(form, 'fadeSlideUp 0.5s ease forwards');
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (!messageInput.value.trim()) return;
    
    const messagesContainer = document.querySelector('.messages-container');
    const messageGroup = document.querySelector('.message-group');
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
    messageInput.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    animateElement(messageDiv, 'fadeSlideUp 0.3s ease forwards');
  };

  const initButtonEffects = () => {
    const buttons = document.querySelectorAll('.primary-btn');
    buttons.forEach(button => {
      button.addEventListener('mousedown', (e) => {
        const btnGlow = button.querySelector('.btn-glow');
        if (btnGlow) {
          const rect = button.getBoundingClientRect();
          btnGlow.style.left = `${e.clientX - rect.left}px`;
          btnGlow.style.top = `${e.clientY - rect.top}px`;
        }
      });
    });
  };

  const initInputEffects = () => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        const focusElement = input.nextElementSibling;
        if (focusElement?.classList.contains('input-focus')) {
          focusElement.style.width = '100%';
        }
      });
      
      input.addEventListener('blur', () => {
        const focusElement = input.nextElementSibling;
        if (focusElement?.classList.contains('input-focus')) {
          focusElement.style.width = '0';
        }
      });
    });
  };

  // Mobile responsive adjustments
  const handleResize = () => {
    if (sidebar) {
      sidebar.style.transform = window.innerWidth <= 768 ? 'translateX(-100%)' : '';
    }
  };

  // Initialize everything
  const init = () => {
    initEventListeners();
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    // Scroll message container to bottom on load
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  return { init };
};

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = initChatApp();
  app.init();
});
