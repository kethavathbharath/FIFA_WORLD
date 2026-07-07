/**
 * @file crowd-analytics.js
 * @namespace CrowdAnalytics
 * @description Crowd intelligence module providing stand density heatmaps, AI forecasts, and evacuation simulators.
 * @module CrowdAnalytics
 */
const CrowdAnalytics = (() => {
  'use strict';

  let intervals = [];
  let charts = {};
  let mapInstance = null;
  let selectedZoneId = 'north-lower';
  let cachedDom = {};

  /**
   * Initializes views, maps, ECharts matrix grids, and updates cached DOM selectors.
   */
  function init() {
    const container = document.getElementById('page-crowd-analytics');
    if (!container) {return;}

    render(container);
    
    // Cache DOM selections to eliminate dynamic querySelector calls
    cachedDom = {
      occupancy: document.getElementById('crowd-kpi-occ'),
      fans: document.getElementById('crowd-kpi-fans'),
      entry: document.getElementById('crowd-kpi-entry'),
      exit: document.getElementById('crowd-kpi-exit')
    };

    renderStadiumMap();
    initPredictionChart();
    initGateFlowChart();
    initHeatmapGrid();
    renderAIInsights();
    renderEvacSimulator();
    selectZone(selectedZoneId);

    // Dynamic Updates
    const fastUpdate = setInterval(() => {
      updateRealTimeData();
    }, 4000);

    const slowUpdate = setInterval(() => {
      renderAIInsights();
      updateCharts();
    }, 10000);

    intervals.push(fastUpdate, slowUpdate);
  }

  /**
   * Clears active timers and disposes of chart references.
   */
  function destroy() {
    intervals.forEach(clearInterval);
    intervals = [];
    cachedDom = {};

    // Destroy Chart.js instances
    Object.values(charts).forEach(chart => {
      NexusCharts.destroyChart(chart);
    });
    charts = {};
    mapInstance = null;
  }

  /**
   * @description Renders the full Crowd Analytics HTML layout including venue selector, KPI cards, stadium map container, prediction charts, gate flow charts, AI insights panel, heatmap grid, and evacuation simulator.
   * @param {HTMLElement} container - The parent DOM element to inject rendered HTML into.
   * @returns {void}
   */
  function render(container) {
    const venues = NexusData.venues;
    const currentVenue = NexusData.getCurrentVenue();
    const crowdData = NexusData.getSimulatedCrowdData(currentVenue.id);

    container.innerHTML = `
      <!-- Venue Selector and Info Banner -->
      <div class="venue-selector animate__animated animate__fadeIn mb-lg">
        <label for="crowd-venue-select" class="text-secondary font-mono" style="font-size:0.8rem; text-transform:uppercase;">Focus Venue:</label>
        <select id="crowd-venue-select" class="venue-select">
          ${venues.map(v => `<option value="${v.id}" ${v.id === currentVenue.id ? 'selected' : ''}>${v.flag} ${v.name} (${v.city})</option>`).join('')}
        </select>
      </div>

      <!-- KPI Grid -->
      <div class="kpi-grid animate__animated animate__fadeIn">
        <div class="kpi-card cyan">
          <div class="kpi-icon">👥</div>
          <div class="kpi-label">Current Occupancy</div>
          <div class="kpi-value font-mono" id="crowd-kpi-occ">${Math.round(crowdData.occupancy * 100)}%</div>
          <div class="kpi-change up">🟢 Within Operations Limit</div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-icon">🚶</div>
          <div class="kpi-label">Total Attendance</div>
          <div class="kpi-value font-mono" id="crowd-kpi-fans">${crowdData.totalCurrent.toLocaleString()}</div>
          <div class="kpi-change up">🟢 Steady Flow Rate</div>
        </div>
        <div class="kpi-card gold">
          <div class="kpi-icon">📥</div>
          <div class="kpi-label">Entry Flow Rate</div>
          <div class="kpi-value font-mono" id="crowd-kpi-entry">${crowdData.entryRate}/min</div>
          <div class="kpi-change down">🔴 Wait Time: ~7 min</div>
        </div>
        <div class="kpi-card purple">
          <div class="kpi-icon">📤</div>
          <div class="kpi-label">Exit Flow Rate</div>
          <div class="kpi-value font-mono" id="crowd-kpi-exit">${crowdData.exitRate}/min</div>
          <div class="kpi-change neutral">⚪ Egress Routes Open</div>
        </div>
      </div>

      <!-- Bento Grid -->
      <div class="bento-grid mt-lg">
        <!-- Stadium Map -->
        <div class="glass-panel col-8 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">🗺️ Interactive Zone Heatmap</h3>
              <p class="panel-subtitle">Real-time occupancy density by seating sectors and concourses</p>
            </div>
            <div class="flex gap-sm">
              <span class="status-badge active">🟢 Low (&lt;50%)</span>
              <span class="status-badge warning">🟡 Med (50-80%)</span>
              <span class="status-badge critical">🔴 High (&gt;80%)</span>
            </div>
          </div>
          <div class="stadium-map-container" id="stadium-svg-container"></div>
        </div>

        <!-- Zone Details Panel -->
        <div class="glass-panel col-4 animate__animated animate__fadeIn" id="zone-details-panel">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">🔍 Sector Breakdown</h3>
              <p class="panel-subtitle">Select any stadium sector on the map to inspect</p>
            </div>
          </div>
          <div id="zone-detail-content">
            <p class="text-muted">Click on a zone on the stadium map to inspect telemetry data.</p>
          </div>
        </div>

        <!-- AI Crowd Prediction Chart -->
        <div class="glass-panel col-6 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">🤖 AI Crowd Flow Forecast</h3>
              <p class="panel-subtitle">Actual vs 30-minute predictive occupancy mapping</p>
            </div>
          </div>
          <div class="chart-container" style="height: 250px;">
            <canvas id="chart-crowd-prediction"></canvas>
          </div>
        </div>

        <!-- Gate Ingress Flow Chart -->
        <div class="glass-panel col-6 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">📥 Gate Ingress Flow</h3>
              <p class="panel-subtitle">Live fan throughput rate per gate entrance</p>
            </div>
          </div>
          <div class="chart-container" style="height: 250px;">
            <canvas id="chart-gate-flow"></canvas>
          </div>
        </div>

        <!-- AI Insights Panel -->
        <div class="glass-panel col-12 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">⚡ GenAI Operations Recommendations</h3>
              <p class="panel-subtitle">AI-predicted bottleneck mitigations and crowd routing adjustments</p>
            </div>
          </div>
          <div class="bento-grid" id="crowd-ai-insights"></div>
        </div>

        <!-- Heatmap Grid -->
        <div class="glass-panel col-6 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">📊 Sector Density Matrix</h3>
              <p class="panel-subtitle">ECharts density heatmap by section and tier</p>
            </div>
          </div>
          <div id="echart-heatmap-matrix" style="height: 260px; width: 100%;"></div>
        </div>

        <!-- Evacuation Simulator -->
        <div class="glass-panel col-6 animate__animated animate__fadeIn" id="evac-panel">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">🚨 AI Evacuation Simulator</h3>
              <p class="panel-subtitle">Agent-based crowd model evacuation timeline estimation</p>
            </div>
          </div>
          <div class="flex-col gap-md">
            <div class="evac-controls">
              <button class="evac-btn" id="btn-run-evac">🏃 Run Evacuation Simulation</button>
              <div class="status-badge warning hidden" id="evac-simulating-status">
                <span class="live-dot"></span> Simulating...
              </div>
            </div>
            <div class="flex justify-between items-center bg-pink-dim" style="padding: 16px; border: 1px dashed var(--pink); border-radius: 8px;">
              <div>
                <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:uppercase;">Estimated Total Evacuation Time</div>
                <div class="evac-result text-pink" id="evac-time-result">--:--</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size:0.7rem; color:var(--text-muted);">Simulation Method</div>
                <div style="font-size:0.8rem; font-weight:600; color:var(--text-primary);">GenAI Multimodal Pedestrian Model</div>
              </div>
            </div>
            <div class="alert-desc mt-sm" style="font-size: 0.72rem;">
              Simulation runs 500 parallel Monte Carlo iterations factoring in current zone densities, gate flow capacities, concourse blockages, and predicted pedestrian speed deceleration curves.
            </div>
          </div>
        </div>
      </div>
    `;

    // Dropdown change binding
    document.getElementById('crowd-venue-select').addEventListener('change', (e) => {
      NexusData.currentVenueId = e.target.value;
      NexusApp.showToast('info', 'Active Venue Changed', `Focusing analytics on: ${NexusData.getCurrentVenue().name}`);
      // Re-init module
      destroy();
      init();
    });
  }

  // ─── Render Stadium SVG Map ────────────────────────────────
  /**
   * @description Renders an interactive SVG stadium heatmap into the designated container using zone occupancy data, with click and hover event handlers for zone selection and tooltip display.
   * @returns {void}
   */
  function renderStadiumMap() {
    const venue = NexusData.getCurrentVenue();
    const crowdData = NexusData.getSimulatedCrowdData(venue.id);

    mapInstance = NexusStadiumMap.render('stadium-svg-container', crowdData.zones, {
      onClick: (zone) => {
        selectZone(zone.id);
      },
      onHover: (zone, e, show) => {
        if (show) {
          NexusStadiumMap.showTooltip(zone, e);
        } else {
          NexusStadiumMap.hideTooltip();
        }
      }
    });
  }

  /**
   * @description Selects a stadium zone by ID, highlights it on the SVG map, and renders detailed telemetry data (capacity, occupancy, temperature, noise level) in the zone details panel.
   * @param {string} zoneId - The unique identifier of the stadium zone to select.
   * @returns {void}
   */
  function selectZone(zoneId) {
    selectedZoneId = zoneId;
    const venue = NexusData.getCurrentVenue();
    const crowdData = NexusData.getSimulatedCrowdData(venue.id);
    const zone = crowdData.zones.find(z => z.id === zoneId) || crowdData.zones[0];

    const content = document.getElementById('zone-detail-content');
    if (!content) {return;}

    // Highlight zone visually on SVG
    document.querySelectorAll('.stadium-zone').forEach(el => {
      el.style.strokeWidth = el.dataset.zoneId === zoneId ? '3' : '1.5';
      el.style.filter = el.dataset.zoneId === zoneId ? 'drop-shadow(0 0 8px var(--cyan))' : 'none';
    });

    const isHigh = zone.occupancy > 0.8;

    content.innerHTML = `
      <div class="flex-col gap-md">
        <div class="flex justify-between items-center">
          <h4 class="font-mono text-cyan" style="font-size: 1.1rem;">${zone.name}</h4>
          <span class="status-badge ${zone.density === 'critical' || zone.density === 'high' ? 'critical' : 'active'}">${zone.density.toUpperCase()} DENSITY</span>
        </div>
        
        <div class="bento-grid">
          <div class="col-6 bg-cyan-dim" style="padding: 12px; border-radius: 8px; border: 1px solid rgba(0,247,255,0.1);">
            <div style="font-size:0.65rem; color:var(--text-tertiary); text-transform:uppercase;">Capacity</div>
            <div class="font-mono text-cyan" style="font-size:1.2rem; font-weight:700;">${zone.capacity.toLocaleString()}</div>
          </div>
          <div class="col-6 bg-cyan-dim" style="padding: 12px; border-radius: 8px; border: 1px solid rgba(0,247,255,0.1);">
            <div style="font-size:0.65rem; color:var(--text-tertiary); text-transform:uppercase;">Current Load</div>
            <div class="font-mono text-cyan" style="font-size:1.2rem; font-weight:700;">${zone.current.toLocaleString()}</div>
          </div>
        </div>

        <div style="background:var(--bg-card); padding: 12px; border-radius: 8px; border: 1px solid var(--glass-border);">
          <div class="flex justify-between mb-sm" style="font-size:0.75rem;">
            <span>Occupancy Ratio</span>
            <span class="font-mono text-cyan">${Math.round(zone.occupancy * 100)}%</span>
          </div>
          <div style="background:rgba(255,255,255,0.05); height: 8px; border-radius: 4px; overflow:hidden;">
            <div style="background: ${isHigh ? 'var(--pink)' : 'var(--cyan)'}; width: ${zone.occupancy * 100}%; height: 100%;"></div>
          </div>
        </div>

        <div class="bento-grid">
          <div class="col-6">
            <div style="font-size:0.65rem; color:var(--text-muted); text-transform:uppercase;">Temperature</div>
            <div class="font-mono" style="font-size:0.95rem; font-weight:600; color:var(--text-primary);">${zone.temperature.toFixed(1)}°C</div>
          </div>
          <div class="col-6">
            <div style="font-size:0.65rem; color:var(--text-muted); text-transform:uppercase;">Ambient Noise</div>
            <div class="font-mono" style="font-size:0.95rem; font-weight:600; color:var(--text-primary);">${Math.round(zone.noiseLevel)} dB</div>
          </div>
        </div>

        ${isHigh ? `
          <div class="ai-recommendation mt-sm" style="margin-bottom: 0; padding: var(--space-md);">
            <span class="ai-rec-icon">🤖</span>
            <div class="ai-rec-content">
              <h4>Congestion Alert Recommendation</h4>
              <p style="font-size: 0.72rem;">Zone ${zone.name} is currently crowded. AI suggests holding further entries from nearby turnstiles and rerouting foot traffic via Concourse C.</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  // ─── Update Real-Time Data ────────────────────────────────
  /**
   * @description Fetches the latest simulated crowd data and refreshes KPI elements, SVG zone heatmap, and the selected zone detail panel in real time.
   * @returns {void}
   */
  function updateRealTimeData() {
    const venue = NexusData.getCurrentVenue();
    const crowdData = NexusData.getSimulatedCrowdData(venue.id);

    if (cachedDom.occupancy) {cachedDom.occupancy.textContent = Math.round(crowdData.occupancy * 100) + '%';}
    if (cachedDom.fans) {cachedDom.fans.textContent = crowdData.totalCurrent.toLocaleString();}
    if (cachedDom.entry) {cachedDom.entry.textContent = crowdData.entryRate + '/min';}
    if (cachedDom.exit) {cachedDom.exit.textContent = crowdData.exitRate + '/min';}

    // Update SVG map
    if (mapInstance && mapInstance.update) {
      mapInstance.update(crowdData.zones);
    }

    // Refresh selected zone detail
    selectZone(selectedZoneId);
  }

  // ─── Chart.js: Prediction Chart ───────────────────────────
  /**
   * @description Initializes a Chart.js line chart comparing actual occupancy time-series data against AI-predicted forecast values with a dashed projection line.
   * @returns {void}
   */
  function initPredictionChart() {
    const actualData = NexusData.generateTimeSeriesData(12, 60, 15);
    const predictionData = NexusData.generatePredictionData(actualData, 6);

    const labels = [...actualData.map(d => d.time), ...predictionData.map(d => d.time)];
    const actualSeries = actualData.map(d => d.value);
    const predictedSeries = [...Array(actualData.length - 1).fill(null), actualData[actualData.length - 1].value, ...predictionData.map(d => d.value)];

    const colors = NexusCharts.colors;

    charts.prediction = NexusCharts.createLineChart('chart-crowd-prediction', labels, [
      {
        label: 'Actual Occupancy %',
        data: actualSeries,
        borderColor: colors.cyan,
        backgroundColor: colors.cyanFill,
        fill: true
      },
      {
        label: 'AI Predicted Forecast %',
        data: predictedSeries,
        borderColor: colors.purple,
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        fill: false
      }
    ], {
      scales: {
        y: { min: 0, max: 100 }
      }
    });
  }

  // ─── Chart.js: Gate Flow Chart ────────────────────────────
  /**
   * @description Initializes a horizontal Chart.js bar chart showing ingress and egress flow rates per gate entrance for the current venue.
   * @returns {void}
   */
  function initGateFlowChart() {
    const venue = NexusData.getCurrentVenue();
    const crowdData = NexusData.getSimulatedCrowdData(venue.id);
    const gates = crowdData.gateFlows.map(f => f.gate);
    const entryRates = crowdData.gateFlows.map(f => f.entry);
    const exitRates = crowdData.gateFlows.map(f => f.exit);

    const colors = NexusCharts.colors;

    charts.gateFlow = NexusCharts.createBarChart('chart-gate-flow', gates, [
      {
        label: 'Ingress Rate (/min)',
        data: entryRates,
        backgroundColor: colors.cyan
      },
      {
        label: 'Egress Rate (/min)',
        data: exitRates,
        backgroundColor: colors.pink
      }
    ], {
      horizontal: true
    });
  }

  // ─── ECharts: Heatmap Grid Matrix ──────────────────────────
  /**
   * @description Initializes an ECharts heatmap matrix showing sector density values organized by cardinal direction (North, East, South, West) and tier level (Lower, Upper, Concourse).
   * @returns {void}
   */
  function initHeatmapGrid() {
    const yLabels = ['North', 'East', 'South', 'West'];
    const xLabels = ['Lower Tier', 'Upper Tier', 'Concourse'];
    
    // Matrix data [xIndex, yIndex, value]
    const data = [
      [0, 0, 72], [1, 0, 84], [2, 0, 48], // North stand tiers
      [0, 1, 65], [1, 1, 91], [2, 1, 55], // East
      [0, 2, 88], [1, 2, 78], [2, 2, 42], // South
      [0, 3, 50], [1, 3, 62], [2, 3, 35]  // West
    ];

    charts.heatmapMatrix = NexusCharts.createHeatmap('echart-heatmap-matrix', data, xLabels, yLabels);
  }

  // ─── Update Charts ─────────────────────────────────────────
  /**
   * @description Refreshes the gate flow bar chart datasets with the latest simulated ingress and egress rate values.
   * @returns {void}
   */
  function updateCharts() {
    const venue = NexusData.getCurrentVenue();
    const crowdData = NexusData.getSimulatedCrowdData(venue.id);

    // Update Gate Flow chart data
    if (charts.gateFlow) {
      const entryRates = crowdData.gateFlows.map(f => f.entry);
      const exitRates = crowdData.gateFlows.map(f => f.exit);
      
      charts.gateFlow.data.datasets[0].data = entryRates;
      charts.gateFlow.data.datasets[1].data = exitRates;
      charts.gateFlow.update();
    }
  }

  // ─── AI Insights Recommendations ───────────────────────────
  /**
   * @description Renders AI-generated operational recommendation cards (gate bottleneck alerts, sector load balancing, egress pre-checks) into the insights container.
   * @returns {void}
   */
  function renderAIInsights() {
    const container = document.getElementById('crowd-ai-insights');
    if (!container) {return;}

    const venue = NexusData.getCurrentVenue();
    const crowdData = NexusData.getSimulatedCrowdData(venue.id);

    const insights = [
      {
        title: 'Gate Bottleneck Alert',
        desc: `AI models predict **Gate A** ingress load will exceed capacity by **32%** at Halftime. Recommended action: Open auxiliary Gate C and redirect crowd buffers.`,
        severity: 'warning',
        icon: '🚨'
      },
      {
        title: 'Sector Load Balance Recommender',
        desc: `South Lower is currently at **${Math.round((crowdData.zones[3]?.occupancy || 0.8) * 100)}%** load while East Upper is at **52%**. Suggest routing incoming fans through East concourses.`,
        severity: 'info',
        icon: '📊'
      },
      {
        title: 'Egress Evacuation Pre-Check',
        desc: `Stadium structural pathways cleared. Evacuation simulations show optimal egress routing. Average venue clearance predicted: **14.8 minutes**.`,
        severity: 'success',
        icon: '✅'
      }
    ];

    container.innerHTML = '';
    insights.forEach(insight => {
      const card = document.createElement('div');
      card.className = `col-4 bg-cyan-dim`;
      card.style.cssText = `
        padding: 16px;
        border-radius: 12px;
        border: 1px solid var(--glass-border);
        border-left: 4px solid ${insight.severity === 'warning' ? 'var(--pink)' : insight.severity === 'success' ? 'var(--green)' : 'var(--cyan)'};
      `;
      card.innerHTML = `
        <div class="flex items-center gap-sm mb-sm">
          <span style="font-size:1.1rem;">${insight.icon}</span>
          <h4 style="font-size:0.85rem; font-weight:600; color:var(--text-primary);">${insight.title}</h4>
        </div>
        <p style="font-size:0.75rem; color:var(--text-secondary); line-height:1.5;">${insight.desc}</p>
      `;
      container.appendChild(card);
    });
  }

  // ─── Evacuation Simulator ──────────────────────────────────
  /**
   * @description Binds click handlers to the evacuation simulator run button, executes a simulated Monte Carlo evacuation model with a 2.5-second delay, and displays the estimated clearance time result.
   * @returns {void}
   */
  function renderEvacSimulator() {
    const runBtn = document.getElementById('btn-run-evac');
    const simStatus = document.getElementById('evac-simulating-status');
    const resultEl = document.getElementById('evac-time-result');

    if (!runBtn) {return;}

    runBtn.addEventListener('click', () => {
      runBtn.disabled = true;
      simStatus.classList.remove('hidden');
      resultEl.textContent = '--:--';

      // Simulate delay for simulation processing
      setTimeout(() => {
        const time = (11.5 + Math.random() * 5).toFixed(1);
        resultEl.textContent = time + ' mins';
        simStatus.classList.add('hidden');
        runBtn.disabled = false;
        
        NexusApp.showToast('success', 'Simulation Complete', `Clearance path model calculated: ${time} minutes estimated.`);
      }, 2500);
    });
  }

  return { init, destroy };
})();

window.CrowdAnalytics = CrowdAnalytics;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CrowdAnalytics;
}
