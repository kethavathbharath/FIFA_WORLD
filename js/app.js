/* ============================================================
   NEXUS App Shell — Navigation, State & Initialization
   ============================================================ */

const NexusApp = (() => {
  'use strict';

  // ─── Module Registry ───────────────────────────────────────
  const modules = {
    'command-center': { init: () => CommandCenter.init(), destroy: () => CommandCenter.destroy(), icon: '🎯', title: 'Command Center', breadcrumb: 'NEXUS / Main Operations / Command Center' },
    'crowd-analytics': { init: () => CrowdAnalytics.init(), destroy: () => CrowdAnalytics.destroy(), icon: '📊', title: 'Crowd Analytics', breadcrumb: 'NEXUS / Main Operations / Crowd Analytics' },
    'smart-navigation': { init: () => SmartNavigation.init(), destroy: () => SmartNavigation.destroy(), icon: '🗺️', title: 'Smart Navigation', breadcrumb: 'NEXUS / Main Operations / Smart Navigation' },
    'ai-assistant': { init: () => AIAssistant.init(), destroy: () => AIAssistant.destroy(), icon: '🤖', title: 'NEXUS AI Assistant', breadcrumb: 'NEXUS / AI & Intelligence / NEXUS AI' },
    'operations': { init: () => Operations.init(), destroy: () => Operations.destroy(), icon: '🛡️', title: 'Operations Control', breadcrumb: 'NEXUS / Management / Operations' },
    'multi-language': { init: () => MultiLanguage.init(), destroy: () => MultiLanguage.destroy(), icon: '🌐', title: 'Multi-Language Hub', breadcrumb: 'NEXUS / Management / Multi-Language' }
  };

  let activePage = 'command-center';
  let clockInterval = null;
  let toastTimeout = null;

  // ─── Navigation ────────────────────────────────────────────
  function navigateTo(page) {
    if (page === activePage) return;
    
    // Destroy current module
    const currentModule = modules[activePage];
    if (currentModule && currentModule.destroy) {
      try { currentModule.destroy(); } catch(e) { console.warn('Module destroy error:', e); }
    }

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Update page views
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });
    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) {
      pageEl.classList.add('active');
    }

    // Update header
    const mod = modules[page];
    if (mod) {
      document.getElementById('header-page-icon').textContent = mod.icon;
      document.getElementById('header-page-title').textContent = mod.title;
      document.getElementById('header-breadcrumb').textContent = mod.breadcrumb;
    }

    activePage = page;

    // Initialize new module
    if (mod && mod.init) {
      try { mod.init(); } catch(e) { console.error('Module init error:', e); }
    }
  }

  // ─── Clock ─────────────────────────────────────────────────
  function startClock() {
    function updateClock() {
      const now = new Date();
      document.getElementById('clock-time').textContent = 
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
  }

  // ─── Toast Notifications ───────────────────────────────────
  function showToast(type, title, message, duration = 5000) {
    const container = document.getElementById('toast-container');
    const icons = { critical: '🚨', warning: '⚠️', info: 'ℹ️', success: '✅' };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
    
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ─── Auto Alerts ───────────────────────────────────────────
  function startAutoAlerts() {
    // Show a random operational toast every 30-60 seconds
    function scheduleNext() {
      const delay = 30000 + Math.random() * 30000;
      toastTimeout = setTimeout(() => {
        const alerts = [
          { type: 'info', title: 'AI Insight', msg: 'Fan engagement metrics up 12% in the last 15 minutes.' },
          { type: 'warning', title: 'Crowd Alert', msg: 'Gate B approaching capacity threshold. Monitor advised.' },
          { type: 'success', title: 'System Update', msg: 'All 16 venue connections verified. Latency: <50ms.' },
          { type: 'info', title: 'Match Update', msg: 'Halftime whistle. Concession demand surge expected.' },
          { type: 'warning', title: 'Weather Advisory', msg: 'Temperature rising. Hydration alerts activated for 3 venues.' },
          { type: 'info', title: 'Staff Update', msg: 'Shift rotation completed. 98% coverage maintained.' }
        ];
        const alert = alerts[Math.floor(Math.random() * alerts.length)];
        showToast(alert.type, alert.title, alert.msg);
        
        // Update notification count
        const badge = document.getElementById('notification-count');
        badge.textContent = parseInt(badge.textContent) + 1;
        
        scheduleNext();
      }, delay);
    }
    scheduleNext();
  }

  // ─── Fullscreen ────────────────────────────────────────────
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // ─── Mobile Menu ───────────────────────────────────────────
  function toggleMobileMenu() {
    document.getElementById('sidebar').classList.toggle('mobile-open');
  }

  // ─── Event Bindings ────────────────────────────────────────
  function bindEvents() {
    // Navigation clicks
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        if (page) {
          navigateTo(page);
          // Close mobile menu if open
          document.getElementById('sidebar').classList.remove('mobile-open');
        }
      });
    });

    // Fullscreen button
    document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);

    // Mobile menu
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (mobileBtn) mobileBtn.addEventListener('click', toggleMobileMenu);

    // Notification button
    document.getElementById('btn-notifications').addEventListener('click', () => {
      showToast('info', 'Notifications', 'You have active alerts. Check the Command Center for details.');
      document.getElementById('notification-count').textContent = '0';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.altKey) {
        switch(e.key) {
          case '1': navigateTo('command-center'); break;
          case '2': navigateTo('crowd-analytics'); break;
          case '3': navigateTo('smart-navigation'); break;
          case '4': navigateTo('ai-assistant'); break;
          case '5': navigateTo('operations'); break;
          case '6': navigateTo('multi-language'); break;
        }
      }
    });

    // Responsive check
    function checkResponsive() {
      const mobileBtn = document.getElementById('mobile-menu-btn');
      if (window.innerWidth <= 768) {
        mobileBtn.style.display = 'flex';
      } else {
        mobileBtn.style.display = 'none';
        document.getElementById('sidebar').classList.remove('mobile-open');
      }
    }
    window.addEventListener('resize', checkResponsive);
    checkResponsive();
  }

  // ─── Initialization ────────────────────────────────────────
  function init() {
    console.log('%c🏟️ NEXUS — FIFA World Cup 2026 Smart Stadium Command Center', 
      'color: #00F7FF; font-size: 16px; font-weight: bold; background: #0a0a0f; padding: 8px 16px; border-radius: 4px;');
    console.log('%cGenAI-Enabled Operations Platform | 16 Venues | 48 Teams | 104 Matches', 
      'color: #94A3B8; font-size: 11px;');

    bindEvents();
    startClock();
    startAutoAlerts();

    // Initialize the default page
    setTimeout(() => {
      modules['command-center'].init();
    }, 300);
  }

  // ─── Start on DOM Ready ────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    navigateTo,
    showToast,
    get activePage() { return activePage; }
  };
})();
