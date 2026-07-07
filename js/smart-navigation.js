/**
 * @file smart-navigation.js
 * @description NEXUS Wayfinding — Indoor navigation module with AI pathfinding,
 * accessible routing, facility wait times, and concourse floor plan rendering.
 * @module SmartNavigation
 */

const SmartNavigation = (() => {
  'use strict';

  let intervals = [];
  let originId = 'gate-a';
  let destId = 'concession-b';
  let showAccessibility = false;

  function init() {
    const container = document.getElementById('page-smart-navigation');
    if (!container) {return;}

    render(container);
    renderFloorPlan();
    updateRoute();

    const updateInterval = setInterval(updateFacilityWaitTimes, 5000);
    intervals.push(updateInterval);
  }

  function destroy() {
    intervals.forEach(clearInterval);
    intervals = [];
  }

  function render(container) {
    const facilities = NexusData.getSimulatedFacilities();
    
    // Split facilities into origin/dest dropdown lists
    const originList = facilities.filter(f => f.type === 'gate' || f.type === 'info' || f.type === 'fanzone');
    const destList = facilities.filter(f => f.type === 'concession' || f.type === 'restroom' || f.type === 'medical' || f.type === 'merchandise');

    container.innerHTML = `
      <!-- Route Selection Controls -->
      <div class="nav-controls animate__animated animate__fadeIn mb-md">
        <div>
          <label for="nav-origin" class="text-secondary font-mono" style="font-size:0.75rem; text-transform:uppercase; display:block; margin-bottom:4px;">Origin Point</label>
          <select id="nav-origin" class="nav-select">
            ${originList.map(f => `<option value="${f.id}" ${f.id === originId ? 'selected' : ''}>${f.icon} ${f.name} (${f.section.toUpperCase()})</option>`).join('')}
          </select>
        </div>
        <div class="flex items-center justify-center font-mono text-cyan" style="font-size:1.4rem; padding-top:18px;">➔</div>
        <div>
          <label for="nav-dest" class="text-secondary font-mono" style="font-size:0.75rem; text-transform:uppercase; display:block; margin-bottom:4px;">Destination</label>
          <select id="nav-dest" class="nav-select">
            ${destList.map(f => `<option value="${f.id}" ${f.id === destId ? 'selected' : ''}>${f.icon} ${f.name} (${f.section.toUpperCase()})</option>`).join('')}
          </select>
        </div>
        <div style="padding-top:20px; display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="nav-access-toggle" style="width:16px; height:16px; cursor:pointer;" ${showAccessibility ? 'checked' : ''} />
          <label for="nav-access-toggle" style="font-size:0.8rem; cursor:pointer; user-select:none;">♿ Wheelchair Accessible Route</label>
        </div>
      </div>

      <!-- Route Info Banner -->
      <div class="route-info animate__animated animate__fadeIn mb-lg" id="navigation-route-banner">
        <!-- Re-rendered dynamically -->
      </div>

      <!-- Bento Grid -->
      <div class="bento-grid">
        <!-- SVG Floor Plan -->
        <div class="glass-panel col-8 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">🗺️ Stadium Concourse Floor Plan</h3>
              <p class="panel-subtitle">Interactive indoor navigation map and live POI overlays</p>
            </div>
          </div>
          <div class="stadium-map-container" id="nav-svg-container"></div>
        </div>

        <!-- Facility Wait Times -->
        <div class="glass-panel col-4 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">⏱️ Live Facility Queues</h3>
              <p class="panel-subtitle">Real-time wait times for nearest stadium facilities</p>
            </div>
          </div>
          <div class="facility-grid" id="nav-facility-grid" style="display:flex; flex-direction:column; gap:8px; max-height:460px; overflow-y:auto;">
            <!-- Loaded dynamically -->
          </div>
        </div>
      </div>
    `;

    // Dropdown change binding
    document.getElementById('nav-origin').addEventListener('change', (e) => {
      originId = e.target.value;
      updateRoute();
    });

    document.getElementById('nav-dest').addEventListener('change', (e) => {
      destId = e.target.value;
      updateRoute();
    });

    document.getElementById('nav-access-toggle').addEventListener('change', (e) => {
      showAccessibility = e.target.checked;
      updateRoute();
    });

    updateFacilityWaitTimes();
  }

  // ─── Render Stadium SVG Floor Plan ────────────────────────
  function renderFloorPlan() {
    const container = document.getElementById('nav-svg-container');
    if (!container) {return;}

    container.innerHTML = '';

    const width = 740;
    const height = 520;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'stadium-svg');
    svg.style.width = '100%';
    svg.style.height = '100%';

    // Draw main stadium background rings
    const cx = width / 2;
    const cy = height / 2;

    // Concourse Ring (Outer boundary)
    const oRing = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    oRing.setAttribute('cx', cx);
    oRing.setAttribute('cy', cy);
    oRing.setAttribute('rx', 300);
    oRing.setAttribute('ry', 200);
    oRing.setAttribute('fill', 'none');
    oRing.setAttribute('stroke', 'rgba(255,255,255,0.06)');
    oRing.setAttribute('stroke-width', '24');
    svg.appendChild(oRing);

    // Inner Ring
    const iRing = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    iRing.setAttribute('cx', cx);
    iRing.setAttribute('cy', cy);
    iRing.setAttribute('rx', 220);
    iRing.setAttribute('ry', 130);
    iRing.setAttribute('fill', 'none');
    iRing.setAttribute('stroke', 'rgba(255,255,255,0.04)');
    iRing.setAttribute('stroke-width', '8');
    svg.appendChild(iRing);

    // Draw central pitch
    const pitch = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    pitch.setAttribute('x', cx - 100);
    pitch.setAttribute('y', cy - 60);
    pitch.setAttribute('width', 200);
    pitch.setAttribute('height', 120);
    pitch.setAttribute('class', 'stadium-pitch');
    pitch.setAttribute('rx', 4);
    svg.appendChild(pitch);

    // Draw Facility POI Dots
    const facilities = NexusData.getSimulatedFacilities();
    facilities.forEach(f => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('id', `poi-${f.id}`);
      g.setAttribute('class', 'poi-marker');
      g.style.cursor = 'pointer';

      // Marker circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', f.x);
      circle.setAttribute('cy', f.y);
      circle.setAttribute('r', 12);
      circle.setAttribute('fill', 'rgba(20, 26, 36, 0.8)');
      circle.setAttribute('stroke', 'var(--cyan)');
      circle.setAttribute('stroke-width', '1.5');
      g.appendChild(circle);

      // Icon text
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      icon.setAttribute('x', f.x);
      icon.setAttribute('y', f.y + 4);
      icon.setAttribute('text-anchor', 'middle');
      icon.setAttribute('font-size', '10px');
      icon.textContent = f.icon;
      g.appendChild(icon);

      // Popup tooltips on hover
      g.addEventListener('mouseenter', (e) => {
        // Reuse zone tooltip showing facility queue details
        const tooltip = document.getElementById('zone-tooltip');
        if (tooltip) {
          document.getElementById('tooltip-title').textContent = f.name;
          document.getElementById('tooltip-capacity').textContent = 'Queue Length';
          document.getElementById('tooltip-current').textContent = f.queueLength + ' persons';
          document.getElementById('tooltip-occupancy').textContent = 'Wait Time';
          document.getElementById('tooltip-temp').textContent = f.waitTime + ' mins';
          tooltip.style.left = (e.clientX + 16) + 'px';
          tooltip.style.top = (e.clientY - 60) + 'px';
          tooltip.classList.add('visible');
        }
      });

      g.addEventListener('mouseleave', () => {
        const tooltip = document.getElementById('zone-tooltip');
        if (tooltip) {tooltip.classList.remove('visible');}
      });

      svg.appendChild(g);
    });

    // Create Path layer (to draw navigation line)
    const routePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    routePath.setAttribute('id', 'navigation-route-line');
    routePath.setAttribute('fill', 'none');
    routePath.setAttribute('stroke', 'var(--cyan)');
    routePath.setAttribute('stroke-width', '4');
    routePath.setAttribute('stroke-dasharray', '8 4');
    routePath.setAttribute('filter', 'url(#glow)');
    svg.appendChild(routePath);

    container.appendChild(svg);
  }

  // ─── Calculate & Draw Route Path ─────────────────────────
  function updateRoute() {
    const facilities = NexusData.getSimulatedFacilities();
    const origin = facilities.find(f => f.id === originId);
    const dest = facilities.find(f => f.id === destId);

    if (!origin || !dest) {return;}

    // Re-highlight POI Markers
    document.querySelectorAll('.poi-marker circle').forEach(c => {
      c.setAttribute('stroke', 'rgba(255,255,255,0.2)');
      c.setAttribute('stroke-width', '1.5');
      c.setAttribute('r', '12');
    });

    const oCircle = document.querySelector(`#poi-${originId} circle`);
    const dCircle = document.querySelector(`#poi-${destId} circle`);
    
    if (oCircle) {
      oCircle.setAttribute('stroke', 'var(--green)');
      oCircle.setAttribute('stroke-width', '3');
      oCircle.setAttribute('r', '15');
    }
    if (dCircle) {
      dCircle.setAttribute('stroke', 'var(--pink)');
      dCircle.setAttribute('stroke-width', '3');
      dCircle.setAttribute('r', '15');
    }

    // Draw route path line
    const pathEl = document.getElementById('navigation-route-line');
    if (pathEl) {
      // Connect origin and destination with a curved arc path
      const midX = (origin.x + dest.x) / 2 + (dest.y - origin.y) * 0.15;
      const midY = (origin.y + dest.y) / 2 + (origin.x - dest.x) * 0.15;
      
      const d = `M ${origin.x} ${origin.y} Q ${midX} ${midY} ${dest.x} ${dest.y}`;
      pathEl.setAttribute('d', d);
      pathEl.setAttribute('stroke', showAccessibility ? 'var(--green)' : 'var(--cyan)');
    }

    // Render Route Info Banner
    const distance = Math.round(Math.sqrt(Math.pow(dest.x - origin.x, 2) + Math.pow(dest.y - origin.y, 2)) * 0.8);
    const time = Math.round(distance / (showAccessibility ? 45 : 75));
    
    const banner = document.getElementById('navigation-route-banner');
    if (banner) {
      banner.innerHTML = `
        <div class="route-stat">
          <span class="route-stat-value text-green">🟢 Suggested Path</span>
          <span class="route-stat-label">Route Status</span>
        </div>
        <div class="clock-divider"></div>
        <div class="route-stat">
          <span class="route-stat-value font-mono">${time} min</span>
          <span class="route-stat-label">Estimated Time</span>
        </div>
        <div class="clock-divider"></div>
        <div class="route-stat">
          <span class="route-stat-value font-mono">${distance}m</span>
          <span class="route-stat-label">Total Distance</span>
        </div>
        <div class="clock-divider"></div>
        <div style="flex:1; font-size:0.78rem; line-height:1.4; color:var(--text-secondary);">
          🤖 <strong>AI Navigation recommendation:</strong> ${showAccessibility ? 
            `Wheelchair-accessible route activated. Highlights step-free concourse access lanes and lifts near Sector ${dest.section.toUpperCase()}.` : 
            `Fastest route is via outer Concourse Ring. Sector ${origin.section.toUpperCase()} flow is steady. Avoid the inner concourse corridor which has high foot traffic.`}
        </div>
      `;
    }
  }

  // ─── Facility Wait Times List ──────────────────────────────
  function updateFacilityWaitTimes() {
    const grid = document.getElementById('nav-facility-grid');
    if (!grid) {return;}

    const facilities = NexusData.getSimulatedFacilities();

    // Sort concessions/restrooms by wait times descending to highlight queues
    const sorted = facilities
      .filter(f => f.type === 'concession' || f.type === 'restroom' || f.type === 'merchandise')
      .sort((a, b) => b.waitTime - a.waitTime);

    grid.innerHTML = '';
    sorted.forEach(f => {
      const card = document.createElement('div');
      card.className = 'facility-card';
      card.innerHTML = `
        <div class="facility-icon">${f.icon}</div>
        <div style="flex:1;">
          <div class="facility-name">${f.name}</div>
          <div class="text-muted" style="font-size:0.65rem; text-transform:uppercase;">Sector: ${f.section} &bull; Queue: ${f.queueLength} fans</div>
        </div>
        <div class="facility-wait ${f.waitLevel}">
          ${f.waitTime} min
        </div>
      `;
      grid.appendChild(card);
    });
  }

  return { init, destroy };
})();

window.SmartNavigation = SmartNavigation;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartNavigation;
}
