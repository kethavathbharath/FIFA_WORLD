/**
 * @file app.js
 * @description NEXUS App Shell — SPA router, module lifecycle manager, lazy script loader,
 * toast notification system, and keyboard shortcut bindings.
 * @module NexusApp
 */

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

  // ─── Navigation ────────────────────────────────────────────
  /**
   * @description Navigates the SPA to the specified page module. Destroys the
   * currently active module, updates nav/header UI, activates the target page
   * view, and initialises the new module.
   * @param {string} page - The page identifier key (must exist in the modules registry).
   * @returns {void}
   */
  function navigateTo(page) {
    if (page === activePage) {return;}
    
    // Destroy current module
    const currentModule = modules[activePage];
    if (currentModule && currentModule.destroy) {
      try { currentModule.destroy(); } catch(e) { console.warn('Module destroy error:', e); }
    }

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      const isActive = item.dataset.page === page;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
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
  /**
   * @description Starts the header clock by immediately rendering the current
   * time and scheduling a 1-second interval to keep it updated.
   * @returns {void}
   */
  function startClock() {
    /**
     * @description Reads the current time and writes a formatted HH:MM:SS
     * string into the #clock-time element.
     * @returns {void}
     */
    function updateClock() {
      const now = new Date();
      document.getElementById('clock-time').textContent = 
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // ─── Toast Notifications ───────────────────────────────────
  /**
   * @description Creates and displays a toast notification in the #toast-container.
   * The toast auto-removes itself after the specified duration.
   * @param {string} type - Toast severity level ('critical' | 'warning' | 'info' | 'success').
   * @param {string} title - Short headline text displayed in bold.
   * @param {string} message - Descriptive body text of the notification.
   * @param {number} [duration=5000] - Milliseconds before the toast auto-dismisses.
   * @returns {void}
   */
  function showToast(type, title, message, duration = 5000) {
    const container = document.getElementById('toast-container');
    const icons = { critical: '🚨', warning: '⚠️', info: 'ℹ️', success: '✅' };
    
    // HTML Sanitizer
    const esc = (str) => String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
      
    const safeTitle = esc(title);
    const safeMsg = esc(message);
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <div class="toast-content">
        <div class="toast-title">${safeTitle}</div>
        <div class="toast-msg">${safeMsg}</div>
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
  /**
   * @description Begins a recurring cycle of simulated operational alerts.
   * Each cycle picks a random alert from a predefined list and shows it as
   * a toast notification every 30–60 seconds.
   * @returns {void}
   */
  function startAutoAlerts() {
    // Show a random operational toast every 30-60 seconds
    /**
     * @description Schedules the next random alert toast after a randomised
     * delay between 30 000 ms and 60 000 ms, then reschedules itself.
     * @returns {void}
     */
    function scheduleNext() {
      const delay = 30000 + Math.random() * 30000;
      setTimeout(() => {
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
  /**
   * @description Toggles the browser between fullscreen and windowed mode
   * using the Fullscreen API. Silently catches any permission errors.
   * @returns {void}
   */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // ─── Mobile Menu ───────────────────────────────────────────
  /**
   * @description Toggles the sidebar's 'mobile-open' CSS class to show or
   * hide the mobile navigation drawer.
   * @returns {void}
   */
  function toggleMobileMenu() {
    document.getElementById('sidebar').classList.toggle('mobile-open');
  }

  // ─── Event Bindings ────────────────────────────────────────
  /**
   * @description Attaches all global DOM event listeners: nav-item clicks,
   * fullscreen button, mobile menu toggle, notification button, keyboard
   * shortcuts (Alt+1–6), and the responsive resize watcher.
   * @returns {void}
   */
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
    if (mobileBtn) {mobileBtn.addEventListener('click', toggleMobileMenu);}

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
    /**
     * @description Checks the viewport width and shows/hides the mobile menu
     * button. Closes the sidebar on wide viewports.
     * @returns {void}
     */
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

  // ─── Automated Self-Diagnostics Test Suite ────────────────
  /**
   * @description Executes a full suite of automated self-diagnostics covering
   * external libraries, core modules, telemetry generators, and the GenAI
   * contextual retrieval engine. Results are printed to the browser console.
   * @returns {void}
   */
  function runDiagnostics() {
    console.log('%c⚙️ RUNNING AUTOMATED CORE SELF-DIAGNOSTICS...', 'color: #A78BFA; font-weight: bold; margin-top: 10px;');
    const results = [];
    
    // Helper to log test states
    /**
     * @description Runs a single named assertion and logs PASS / FAIL /
     * CRITICAL ERR to the console. Accumulates results for the summary.
     * @param {string} name - Human-readable label for the test case.
     * @param {Function} assertFn - Zero-argument function that returns a boolean.
     * @returns {void}
     */
    function test(name, assertFn) {
      try {
        const pass = assertFn();
        results.push({ name, pass, error: null });
        if (pass) {
          console.log(`%c  ✅ PASS: ${name}`, 'color: #4DFFBE;');
        } else {
          console.log(`%c  ❌ FAIL: ${name}`, 'color: #FF0087; font-weight: bold;');
        }
      } catch (e) {
        results.push({ name, pass: false, error: e.message });
        console.log(`%c  ❌ CRITICAL ERR: ${name} (${e.message})`, 'color: #FF0087; font-weight: bold;');
      }
    }

    // 1. External Library Checks
    test('Chart.js Library Loaded', () => typeof Chart !== 'undefined');
    test('ECharts Library Loaded', () => typeof echarts !== 'undefined');
    test('Leaflet Library Loaded', () => typeof L !== 'undefined');

    // 2. Core Modules Checks
    test('NexusData Module Loaded', () => typeof NexusData !== 'undefined');
    test('NexusCharts Module Loaded', () => typeof NexusCharts !== 'undefined');
    test('NexusStadiumMap Module Loaded', () => typeof NexusStadiumMap !== 'undefined');
    test('CommandCenter Module Loaded', () => typeof CommandCenter !== 'undefined');
    test('CrowdAnalytics Module Loaded', () => typeof CrowdAnalytics !== 'undefined');
    test('SmartNavigation Module Loaded', () => typeof SmartNavigation !== 'undefined');
    test('AIAssistant Module Loaded', () => typeof AIAssistant !== 'undefined');
    test('Operations Module Loaded', () => typeof Operations !== 'undefined');
    test('MultiLanguage Module Loaded', () => typeof MultiLanguage !== 'undefined');

    // 3. Telemetry and Simulation Layer Checks
    test('16 Venues Correctly Configured', () => NexusData.venues.length === 16);
    test('48 Group Teams Correctly Configured', () => NexusData.teams.length === 48);
    test('Live Crowd Data Telemetry Generator Active', () => {
      const d = NexusData.getSimulatedCrowdData('metlife');
      return d && d.totalCurrent > 0 && d.zones.length > 0;
    });
    test('Simulated Match Schedule Active', () => NexusData.getSimulatedMatches().length > 0);
    test('Simulated Incident Dispatch Logs Active', () => NexusData.getSimulatedIncidents().length > 0);

    // 4. GenAI Core Assistance Engine Checks
    test('NEXUS AI Contextual Retrieval Matcher Active', () => {
      const r1 = NexusData.getAIResponse('Show crowd density');
      const r2 = NexusData.getAIResponse('unknown query test');
      return r1.key === 'crowd' && r2.key === 'default' && r1.text && r2.text;
    });

    const failed = results.filter(r => !r.pass);
    if (failed.length === 0) {
      console.log('%c🟢 ALL SELF-DIAGNOSTICS PASSED SUCCESSFULLY (18/18 TESTS)', 'color: #4DFFBE; font-weight: bold; margin-bottom: 10px;');
    } else {
      console.warn(`%c⚠️ DIAGNOSTICS COMPLETED WITH ${failed.length} FAILURES. REVIEW CONSOLE LOGS.`, 'color: #FFDE73; font-weight: bold; margin-bottom: 10px;');
    }
  }

  // ─── Initialization ────────────────────────────────────────
  /**
   * @description Application entry-point. Binds events, starts the clock and
   * auto-alert cycle, then boots the Command Center module.
   * @returns {void}
   */
  function init() {
    console.log('%c🏟️ NEXUS — FIFA World Cup 2026 Smart Stadium Command Center', 
      'color: #00F7FF; font-size: 16px; font-weight: bold; background: #0a0a0f; padding: 8px 16px; border-radius: 4px;');
    console.log('%cGenAI-Enabled Operations Platform | 16 Venues | 48 Teams | 104 Matches', 
      'color: #94A3B8; font-size: 11px;');

    bindEvents();
    startClock();
    startAutoAlerts();

    try {
      runDiagnostics();
      modules['command-center'].init();
    } catch (err) {
      console.error('Failed to initialize Command Center:', err);
    }
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

window.NexusApp = NexusApp;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NexusApp;
}
