/**
 * @file modules.test.js
 * @description Unit tests verifying all core modules compile and export methods
 */

// Mock external browser libraries
global.L = {
  map: jest.fn(() => ({
    setView: jest.fn().mockReturnThis(),
    remove: jest.fn()
  })),
  divIcon: jest.fn(),
  marker: jest.fn(() => ({
    addTo: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis()
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn()
  }))
};

global.echarts = {
  init: jest.fn(() => ({
    setOption: jest.fn(),
    dispose: jest.fn(),
    resize: jest.fn()
  }))
};

global.Chart = class {
  constructor() {}
  destroy() {}
};

// Mock ResizeObserver which is missing in JSDOM
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock HTMLCanvasElement.prototype.getContext to prevent console warnings in JSDOM
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(),
  putImageData: jest.fn(),
  createImageData: jest.fn(),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  closePath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  fill: jest.fn(),
  rect: jest.fn(),
  arc: jest.fn(),
  fillText: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  scale: jest.fn(),
  rotate: jest.fn(),
  translate: jest.fn(),
  transform: jest.fn()
}));

// Mock document container elements with all required bindings to prevent null pointer crashes
document.body.innerHTML = `
  <div id="page-command-center"></div>
  <div id="page-crowd-analytics"></div>
  <div id="page-smart-navigation"></div>
  <div id="page-ai-assistant"></div>
  <div id="page-operations"></div>
  <div id="page-multi-language"></div>
  <div id="toast-container"></div>
  <span id="clock-time"></span>
  <span id="header-notifications-badge"></span>
  <div id="sidebar"></div>
  <button id="btn-fullscreen"></button>
  <button id="btn-notifications"></button>
  <span id="notification-count"></span>
  <button id="mobile-menu-btn"></button>
  <div class="nav-item" data-page="command-center"></div>
  
  <!-- Header elements for page routing -->
  <span id="header-page-icon"></span>
  <span id="header-page-title"></span>
  <span id="header-breadcrumb"></span>
  
  <!-- Additional DOM targets for module renders -->
  <div id="leaflet-map-container"></div>
  <div id="alert-feed-list"></div>
  <div id="live-match-ticker"></div>
  <div id="gauge-wifi"></div>
  <div id="gauge-power"></div>
  <div id="gauge-hvac"></div>
  <div id="gauge-security"></div>
  
  <div id="crowd-venue-select"></div>
  <div id="crowd-prediction-chart"></div>
  <div id="crowd-gate-flow-chart"></div>
  <div id="crowd-heatmap-grid"></div>
  <div id="crowd-ai-insights"></div>
  <div id="evac-simulator-container"></div>
  <div id="crowd-zone-details"></div>
  
  <div id="nav-facilities-grid"></div>
  <div id="nav-route-status"></div>
  <div id="nav-map-container"></div>
  
  <div id="ops-responder-grid"></div>
  <div id="ops-incident-table"></div>
  <div id="ops-map-container"></div>
`;

// Require and bind modules to global context so they resolve each other
const NexusData = require('../js/data.js');
global.NexusData = NexusData;

const NexusCharts = require('../js/charts.js');
global.NexusCharts = NexusCharts;

const NexusStadiumMap = require('../js/stadium-map.js');
global.NexusStadiumMap = NexusStadiumMap;

const CommandCenter = require('../js/command-center.js');
global.CommandCenter = CommandCenter;

const CrowdAnalytics = require('../js/crowd-analytics.js');
global.CrowdAnalytics = CrowdAnalytics;

const SmartNavigation = require('../js/smart-navigation.js');
global.SmartNavigation = SmartNavigation;

const AIAssistant = require('../js/ai-assistant.js');
global.AIAssistant = AIAssistant;

const Operations = require('../js/operations.js');
global.Operations = Operations;

const MultiLanguage = require('../js/multi-language.js');
global.MultiLanguage = MultiLanguage;

const NexusApp = require('../js/app.js');
global.NexusApp = NexusApp;

describe('Core Module Integration & Lifecycle Tests', () => {

  test('Verify all modular namespaces compile correctly', () => {
    expect(CommandCenter).toBeDefined();
    expect(CrowdAnalytics).toBeDefined();
    expect(SmartNavigation).toBeDefined();
    expect(AIAssistant).toBeDefined();
    expect(Operations).toBeDefined();
    expect(MultiLanguage).toBeDefined();
    expect(NexusApp).toBeDefined();
    expect(NexusStadiumMap).toBeDefined();
  });

  test('Verify window/global namespace bindings are set correctly', () => {
    expect(window.CommandCenter).toBe(CommandCenter);
    expect(window.CrowdAnalytics).toBe(CrowdAnalytics);
    expect(window.SmartNavigation).toBe(SmartNavigation);
    expect(window.AIAssistant).toBe(AIAssistant);
    expect(window.Operations).toBe(Operations);
    expect(window.MultiLanguage).toBe(MultiLanguage);
    expect(window.NexusApp).toBe(NexusApp);
  });

  test('Verify module initialization and destroy cycles run clean', () => {
    // Test command center
    expect(() => CommandCenter.init()).not.toThrow();
    expect(() => CommandCenter.destroy()).not.toThrow();

    // Test crowd analytics
    expect(() => CrowdAnalytics.init()).not.toThrow();
    expect(() => CrowdAnalytics.destroy()).not.toThrow();

    // Test smart navigation
    expect(() => SmartNavigation.init()).not.toThrow();
    expect(() => SmartNavigation.destroy()).not.toThrow();

    // Test AI assistant
    expect(() => AIAssistant.init()).not.toThrow();
    expect(() => AIAssistant.destroy()).not.toThrow();

    // Test operations
    expect(() => Operations.init()).not.toThrow();
    expect(() => Operations.destroy()).not.toThrow();

    // Test multi-language
    expect(() => MultiLanguage.init()).not.toThrow();
    expect(() => MultiLanguage.destroy()).not.toThrow();
  });

  test('Verify app operations router and toast dispatch triggers', () => {
    // Trigger navigation routes to verify routing coverage
    expect(() => NexusApp.navigateTo('crowd-analytics')).not.toThrow();
    expect(() => NexusApp.navigateTo('smart-navigation')).not.toThrow();
    expect(() => NexusApp.navigateTo('ai-assistant')).not.toThrow();
    expect(() => NexusApp.navigateTo('operations')).not.toThrow();
    expect(() => NexusApp.navigateTo('multi-language')).not.toThrow();
    expect(() => NexusApp.navigateTo('command-center')).not.toThrow();

    // Trigger toast alerts to verify toast coverage
    expect(() => NexusApp.showToast('info', 'Test Title', 'Test message content')).not.toThrow();
  });
});
