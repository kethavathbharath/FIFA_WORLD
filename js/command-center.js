/* ============================================================
   NEXUS Main Dashboard — Command Center Module
   ============================================================ */

const CommandCenter = (() => {
  'use strict';

  let map = null;
  let intervals = [];
  let eChartsInstances = {};
  let mapMarkers = [];

  function init() {
    const container = document.getElementById('page-command-center');
    if (!container) return;

    render(container);
    initMap();
    initAlertFeed();
    initMatchTicker();
    initSystemGauges();

    // Start simulated updates
    const kpiInterval = setInterval(updateKPIs, 3000);
    const gaugeInterval = setInterval(updateGauges, 5000);
    const alertInterval = setInterval(updateAlertFeed, 10000);
    const matchInterval = setInterval(updateMatchTicker, 15000);

    intervals.push(kpiInterval, gaugeInterval, alertInterval, matchInterval);
  }

  function destroy() {
    // Clear all intervals
    intervals.forEach(clearInterval);
    intervals = [];

    // Dispose of Leaflet map
    if (map) {
      map.remove();
      map = null;
    }
    mapMarkers = [];

    // Dispose of ECharts
    Object.values(eChartsInstances).forEach(chart => {
      if (chart && chart.dispose) {
        chart.dispose();
      }
    });
    eChartsInstances = {};
  }

  function render(container) {
    const venue = NexusData.getCurrentVenue();
    const crowdData = NexusData.getSimulatedCrowdData(venue.id);
    const staffData = NexusData.getSimulatedStaffData();

    container.innerHTML = `
      <!-- Venue Banner -->
      <div class="venue-banner animate__animated animate__fadeIn mb-lg">
        <span class="venue-banner-icon">🏟️</span>
        <div class="venue-banner-info">
          <h3>${venue.fifaName} (${venue.name})</h3>
          <span>${venue.flag} ${venue.city}, ${venue.country} &bull; Group Phase Host Venue</span>
        </div>
        <div class="venue-banner-stats">
          <div class="venue-banner-stat">
            <div class="val font-mono">${venue.capacity.toLocaleString()}</div>
            <div class="lbl">FIFA Capacity</div>
          </div>
          <div class="venue-banner-stat">
            <div class="val font-mono" id="banner-occupancy">${Math.round(crowdData.occupancy * 100)}%</div>
            <div class="lbl">Current Load</div>
          </div>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="kpi-grid animate__animated animate__fadeIn">
        <div class="kpi-card cyan">
          <div class="kpi-icon">👥</div>
          <div class="kpi-label">Fans In-Venue</div>
          <div class="kpi-value font-mono" id="kpi-fans">${crowdData.totalCurrent.toLocaleString()}</div>
          <div class="kpi-change up">🟢 Influx Normal</div>
        </div>
        <div class="kpi-card pink">
          <div class="kpi-icon">⚠️</div>
          <div class="kpi-label">Active Incidents</div>
          <div class="kpi-value font-mono" id="kpi-incidents">3</div>
          <div class="kpi-change neutral">⚪ Monitoring Active</div>
        </div>
        <div class="kpi-card green">
          <div class="kpi-icon">👮</div>
          <div class="kpi-label">Staff Deployed</div>
          <div class="kpi-value font-mono" id="kpi-staff">${staffData.totalDeployed}</div>
          <div class="kpi-change up">🟢 98% Shift Coverage</div>
        </div>
        <div class="kpi-card gold">
          <div class="kpi-icon">⏱️</div>
          <div class="kpi-label">Avg Wait Time</div>
          <div class="kpi-value font-mono" id="kpi-wait">6.4m</div>
          <div class="kpi-change down">🔴 Wait Time Rising</div>
        </div>
        <div class="kpi-card purple">
          <div class="kpi-icon">🤖</div>
          <div class="kpi-label">AI Alerts Today</div>
          <div class="kpi-value font-mono" id="kpi-ai-alerts">14</div>
          <div class="kpi-change up">⚡ Real-time Decision Support</div>
        </div>
        <div class="kpi-card orange">
          <div class="kpi-icon">⭐</div>
          <div class="kpi-label">Fan Satisfaction</div>
          <div class="kpi-value font-mono" id="kpi-satisfaction">92%</div>
          <div class="kpi-change up">🟢 High Sentiment Score</div>
        </div>
      </div>

      <!-- Bento Grid -->
      <div class="bento-grid mt-lg">
        <!-- Leaflet Map -->
        <div class="glass-panel col-8 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">📍 FIFA 2026 Venue Network</h3>
              <p class="panel-subtitle">Real-time status of all 16 host stadiums across North America</p>
            </div>
            <div class="panel-actions">
              <button class="panel-action-btn active" id="btn-map-all">All Venues</button>
            </div>
          </div>
          <div class="map-container" id="leaflet-map-container" style="height: 380px;"></div>
        </div>

        <!-- Alert Feed -->
        <div class="glass-panel col-4 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">🤖 Real-Time GenAI Alerts</h3>
              <p class="panel-subtitle">Continuous operations monitoring & recommendations</p>
            </div>
          </div>
          <div class="alert-feed" id="command-alert-feed">
            <div class="loading-spinner"></div>
          </div>
        </div>

        <!-- Live Match Ticker -->
        <div class="glass-panel col-6 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">⚽ Live & Upcoming Matches</h3>
              <p class="panel-subtitle">Tournament schedule and live crowd metrics</p>
            </div>
          </div>
          <div class="match-ticker" id="command-match-ticker">
            <div class="loading-spinner"></div>
          </div>
        </div>

        <!-- System Health Gauges -->
        <div class="glass-panel col-6 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">⚡ Stadium System Health</h3>
              <p class="panel-subtitle">IoT sensors & infrastructure metrics</p>
            </div>
          </div>
          <div class="bento-grid">
            <div class="col-3"><div class="chart-container"><div id="gauge-wifi" class="echart" style="min-height:130px;"></div></div></div>
            <div class="col-3"><div class="chart-container"><div id="gauge-power" class="echart" style="min-height:130px;"></div></div></div>
            <div class="col-3"><div class="chart-container"><div id="gauge-hvac" class="echart" style="min-height:130px;"></div></div></div>
            <div class="col-3"><div class="chart-container"><div id="gauge-security" class="echart" style="min-height:130px;"></div></div></div>
          </div>
        </div>
      </div>
    `;
  }

  // ─── Update KPIs ───────────────────────────────────────────
  function updateKPIs() {
    const venue = NexusData.getCurrentVenue();
    const crowdData = NexusData.getSimulatedCrowdData(venue.id);
    const staffData = NexusData.getSimulatedStaffData();

    const fansEl = document.getElementById('kpi-fans');
    const waitEl = document.getElementById('kpi-wait');
    const staffEl = document.getElementById('kpi-staff');
    const occEl = document.getElementById('banner-occupancy');

    if (fansEl) fansEl.textContent = crowdData.totalCurrent.toLocaleString();
    if (staffEl) staffEl.textContent = staffData.totalDeployed;
    if (occEl) occEl.textContent = Math.round(crowdData.occupancy * 100) + '%';
    
    if (waitEl) {
      const wTime = (5 + Math.random() * 3).toFixed(1);
      waitEl.textContent = wTime + 'm';
    }
  }

  // ─── Initialize Map ────────────────────────────────────────
  function initMap() {
    const mapContainer = document.getElementById('leaflet-map-container');
    if (!mapContainer) return;

    // Initialize Leaflet map
    map = L.map('leaflet-map-container', {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([37.0902, -95.7129], 3); // Centered on US/North America

    // Dark theme CartoDB Basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 10,
      minZoom: 2
    }).addTo(map);

    // Render Markers
    const matches = NexusData.getSimulatedMatches();
    
    NexusData.venues.forEach((v, idx) => {
      // Find matches for this venue
      const liveMatch = matches.find(m => m.venue.id === v.id && m.status === 'live');
      const upcomingMatch = matches.find(m => m.venue.id === v.id && m.status === 'upcoming');
      
      let statusClass = 'idle';
      let statusText = 'Ready / Preparations';
      if (liveMatch) {
        statusClass = 'active-match';
        statusText = `🔴 LIVE: ${liveMatch.team1.code} vs ${liveMatch.team2.code}`;
      } else if (upcomingMatch) {
        statusClass = 'preparing';
        statusText = `⏳ Upcoming: ${upcomingMatch.team1.code} vs ${upcomingMatch.team2.code}`;
      }

      // Create Custom Marker Icon
      const markerIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `<div class="venue-marker ${statusClass}">${v.flag}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([v.lat, v.lng], { icon: markerIcon }).addTo(map);

      // Bind dynamic popup
      marker.bindPopup(`
        <div class="venue-popup">
          <h4>${v.name}</h4>
          <div class="venue-cap">${v.fifaName}</div>
          <div class="venue-cap font-mono" style="margin-top: 4px; color: var(--cyan);">Capacity: ${v.capacity.toLocaleString()}</div>
          <div class="venue-status ${statusClass}" style="font-weight: 600; font-size: 0.72rem; margin-top: 6px;">
            ${statusText}
          </div>
          <button class="panel-action-btn" style="margin-top: 8px; width: 100%; text-align: center;" 
                  onclick="CommandCenter.selectVenue('${v.id}')">
            Enter Command View
          </button>
        </div>
      `);

      mapMarkers.push({ id: v.id, marker });
    });
  }

  // Allow global callback for popup buttons
  window.CommandCenter = {
    selectVenue: (venueId) => {
      NexusData.currentVenueId = venueId;
      NexusApp.showToast('success', 'Venue Focus Swapped', `Now monitoring: ${NexusData.getCurrentVenue().name}`);
      // Re-initialize CommandCenter tab to redraw everything with the new venue
      CommandCenter.destroy();
      CommandCenter.init();
    }
  };

  // ─── Initialize & Update Alert Feed ────────────────────────
  function initAlertFeed() {
    updateAlertFeed();
  }

  function updateAlertFeed() {
    const feed = document.getElementById('command-alert-feed');
    if (!feed) return;

    const alerts = NexusData.getSimulatedAlerts(8);
    feed.innerHTML = '';

    alerts.forEach(alert => {
      const alertEl = document.createElement('div');
      alertEl.className = `alert-item ${alert.severity}`;
      alertEl.innerHTML = `
        <div class="alert-severity">${alert.icon}</div>
        <div class="alert-content">
          <div class="alert-title flex justify-between">
            <span>${alert.title}</span>
            <span class="alert-time font-mono">${alert.timeStr}</span>
          </div>
          <div class="alert-desc">${alert.desc}</div>
          <div class="alert-meta">
            <span class="alert-tag ${alert.type}">${alert.type}</span>
            <span class="alert-time">AI Recommended Action Attached</span>
          </div>
        </div>
      `;
      feed.appendChild(alertEl);
    });
  }

  // ─── Match Ticker ──────────────────────────────────────────
  function initMatchTicker() {
    updateMatchTicker();
  }

  function updateMatchTicker() {
    const ticker = document.getElementById('command-match-ticker');
    if (!ticker) return;

    const matches = NexusData.getSimulatedMatches();
    ticker.innerHTML = '';

    matches.forEach(match => {
      const card = document.createElement('div');
      card.className = `match-card ${match.status === 'live' ? 'live' : ''}`;
      card.innerHTML = `
        <div class="match-status ${match.status}">
          ${match.status === 'live' ? `🔴 LIVE - ${match.minute}'` : match.status}
        </div>
        <div class="match-teams">
          <div class="match-team">
            <span class="match-team-flag">${match.team1.flag}</span>
            <span class="match-team-name">${match.team1.code}</span>
          </div>
          <div class="match-score">
            ${match.status === 'upcoming' ? 'VS' : `${match.score1} - ${match.score2}`}
          </div>
          <div class="match-team">
            <span class="match-team-flag">${match.team2.flag}</span>
            <span class="match-team-name">${match.team2.code}</span>
          </div>
        </div>
        <div class="match-venue truncate" style="font-size:0.6rem; color:var(--text-muted); text-align:center; margin-top:8px;">
          ${match.venue.name}
        </div>
      `;
      ticker.appendChild(card);
    });
  }

  // ─── System Health Gauges ──────────────────────────────────
  function initSystemGauges() {
    const iot = NexusData.getSimulatedIoTData();
    const colors = NexusCharts.colors;

    eChartsInstances.wifi = NexusCharts.createGauge('gauge-wifi', iot.wifi.load, 'Wi-Fi Load', colors.cyan);
    eChartsInstances.power = NexusCharts.createGauge('gauge-power', iot.power.consumption, 'Power Grid', colors.green);
    eChartsInstances.hvac = NexusCharts.createGauge('gauge-hvac', parseFloat(iot.hvac.airQuality), 'Air Quality', colors.gold);
    eChartsInstances.security = NexusCharts.createGauge('gauge-security', iot.security.camerasOnline, 'CCTV Active', colors.pink);
  }

  function updateGauges() {
    const iot = NexusData.getSimulatedIoTData();
    NexusCharts.updateGauge(eChartsInstances.wifi, iot.wifi.load);
    NexusCharts.updateGauge(eChartsInstances.power, iot.power.consumption);
    NexusCharts.updateGauge(eChartsInstances.hvac, parseFloat(iot.hvac.airQuality));
    NexusCharts.updateGauge(eChartsInstances.security, iot.security.camerasOnline);
  }

  return { init, destroy };
})();
