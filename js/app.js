/**
 * Railway Digital Twin - Core Application Module
 * Handles: Theme, Navigation, Sidebar, Clock, Utilities
 */

const App = (function() {
  'use strict';

  // ============================================================
  // PRIVATE STATE
  // ============================================================
  
  const STATE = {
    isDark: localStorage.getItem('rdt-theme') === 'dark',
    currentPage: window.location.pathname.split('/').pop() || 'index.html',
    clockInterval: null,
    sidebarLoaded: false,
  };

  // ============================================================
  // THEME MANAGEMENT
  // ============================================================
  
  const theme = {
    isDark: STATE.isDark,

    apply() {
      document.documentElement.dataset.theme = this.isDark ? 'dark' : 'light';
      const icon = document.getElementById('theme-icon');
      if (icon) {
        icon.setAttribute('data-lucide', this.isDark ? 'moon' : 'sun');
        if (window.lucide) lucide.createIcons();
      }
      // Notify modules of theme change
      this.notifyModules();
    },

    toggle() {
      this.isDark = !this.isDark;
      localStorage.setItem('rdt-theme', this.isDark ? 'dark' : 'light');
      this.apply();
    },

    notifyModules() {
      // Allow modules to react to theme changes
      const event = new CustomEvent('themeChange', { detail: { isDark: this.isDark } });
      document.dispatchEvent(event);
    },

    init() {
      this.isDark = localStorage.getItem('rdt-theme') === 'dark';
      this.apply();
    }
  };

  // ============================================================
  // NAVIGATION
  // ============================================================
  
  const navigate = function(page) {
    const pages = {
      'index': 'index.html',
      'asset_details': 'asset_details.html',
      'asset_hierarchy': 'asset_hierarchy.html',
    };
    
    const target = pages[page] || page;
    if (window.location.pathname.includes(target)) return;
    window.location.href = target;
  };

  // ============================================================
  // SIDEBAR MANAGEMENT
  // ============================================================
  
  const loadSidebar = function(sidebarUrl) {
    const container = document.getElementById('sidebar-container');
    if (!container) return;

    // Only load once
    if (STATE.sidebarLoaded) {
      this.highlightActivePage();
      return;
    }

    fetch(sidebarUrl || 'sidebar.html')
      .then(response => {
        if (!response.ok) throw new Error('Failed to load sidebar');
        return response.text();
      })
      .then(html => {
        container.innerHTML = html;
        STATE.sidebarLoaded = true;
        this.highlightActivePage();
        if (window.lucide) lucide.createIcons();
      })
      .catch(error => {
        console.error('Sidebar load error:', error);
        container.innerHTML = '<div style="padding:20px;color:var(--muted)">Sidebar unavailable</div>';
      });
  };

const highlightActivePage = function() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  const pageName = current.replace('.html', '');
  
  // Map page names to sidebar selectors
  const map = {
    'index': '.sb-overview-btn',
    'asset_details': '#sidebar-asset-details',
    'asset_hierarchy': '.sb-item:nth-child(4)', // Asset Hierarchy (adjust if needed)
  };

  const selector = map[pageName];
  if (!selector) return;

  // Remove all active states
  document.querySelectorAll('.sb-item, .sb-overview-btn').forEach(el => {
    el.classList.remove('active-page');
  });

  // Add active state to current page
  const activeEl = document.querySelector(selector);
  if (activeEl) {
    activeEl.classList.add('active-page');
    
    // Also add active class for styling
    if (activeEl.classList.contains('sb-item')) {
      activeEl.classList.add('active');
    }
  }
};
  // ============================================================
  // CLOCK
  // ============================================================
  
  const startClock = function() {
    this.updateClock();
    if (STATE.clockInterval) clearInterval(STATE.clockInterval);
    STATE.clockInterval = setInterval(this.updateClock, 1000);
  };

  const updateClock = function() {
    const now = new Date();
    const dateEl = document.getElementById('clock-date');
    const timeEl = document.getElementById('clock-time');
    
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================
  
  const logout = function() {
    if (confirm('Are you sure you want to logout?')) {
      window.location.href = 'login.html';
    }
  };

  // ============================================================
  // UTILITIES
  // ============================================================
  
  const utils = {
    safeQuery(selector, context = document) {
      return context.querySelector(selector);
    },

    safeQueryAll(selector, context = document) {
      return context.querySelectorAll(selector);
    },

    isElementVisible(el) {
      return el && el.offsetParent !== null;
    },

    debounce(fn, delay = 300) {
      let timer;
      return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    }
  };

  // ============================================================
  // PUBLIC API
  // ============================================================
  
  return {
    // Core
    theme,
    navigate,
    loadSidebar,
    highlightActivePage,
    startClock,
    updateClock,
    logout,
    utils,

    // Modules will be registered here
    Dashboard: null,
    Map: null,
    Asset: null,
    AssetDetails: null,

    // Init called from page scripts
    init() {
      this.theme.init();
    }
  };

})();

// Expose App globally
window.App = App;