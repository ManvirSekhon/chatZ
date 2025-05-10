// Optimized and cleaned version of script.js
const initChatApp = () => {
  // DOM Elements
  const createGroupBtn = document.getElementById('createGroupBtn');
  const joinGroupBtn = document.getElementById('joinGroupBtn');
  const createGroupSubmitBtn = document.getElementById('createGroupSubmitBtn');
  const joinGroupSubmitBtn = document.getElementById('joinGroupSubmitBtn');
  const leaveGroupBtn = document.getElementById('leaveGroupBtn');
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const closeDrawer = document.getElementById('closeDrawer');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  const groupsOptions = document.getElementById('groupsOptions');
  const createGroupForm = document.getElementById('createGroupForm');
  const joinGroupForm = document.getElementById('joinGroupForm');

  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const tabIndicator = document.querySelector('.tab-indicator');

  const backBtns = document.querySelectorAll('.back-btn');
  const messageForm = document.querySelector('.message-form');
  const messageInput = document.getElementById('messageInput');

  // Drawer state
  let isDrawerOpen = false;

  // Animation utility
  const animateElement = (element, animation) => {
    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.animation = animation;
  };

  // Drawer functionality
  const toggleDrawer = (open) => {
    isDrawerOpen = open;
    sidebar.classList.toggle('active', open);
    overlay.classList.toggle('active', open);
    hamburgerMenu.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  // Initialize all event listeners
  const initEventListeners = () => {
    // Drawer controls
    if (hamburgerMenu) {
      hamburgerMenu.addEventListener('click', () => toggleDrawer(true));
    }
    if (closeDrawer) {
      closeDrawer.addEventListener('click', () => toggleDrawer(false));
    }
    if (overlay) {
      overlay.addEventListener('click', () => toggleDrawer(false));
    }

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        toggleDrawer(false);
      }
    });

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

    if (leaveGroupBtn) {
      leaveGroupBtn.addEventListener('click', () => {
        if (isDrawerOpen) {
          toggleDrawer(false);
        }
        navigateTo('groups.html');
      });
    }

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
    if (window.innerWidth > 768 && isDrawerOpen) {
      toggleDrawer(false);
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

// Preloader
const loader = document.getElementById("preLoader");
document.addEventListener("DOMContentLoaded", function() {
  loader.style.display = "none";
});

