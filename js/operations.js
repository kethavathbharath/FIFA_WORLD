/* ============================================================
   NEXUS Management — Operations & Incidents Control Module
   ============================================================ */

const Operations = (() => {
  'use strict';

  let intervals = [];
  let incidents = [];

  function init() {
    const container = document.getElementById('page-operations');
    if (!container) {return;}

    incidents = NexusData.getSimulatedIncidents(7);

    render(container);
    renderMap();
    renderIncidentTable();
    updateLiveMetrics();

    const statsInterval = setInterval(updateLiveMetrics, 4000);
    intervals.push(statsInterval);
  }

  function destroy() {
    intervals.forEach(clearInterval);
    intervals = [];
  }

  function render(container) {
    const staff = NexusData.getSimulatedStaffData();

    container.innerHTML = `
      <!-- Operations Stats Row -->
      <div class="ops-stats animate__animated animate__fadeIn mb-md">
        <div class="ops-stat-card">
          <div class="ops-stat-value text-cyan" id="ops-val-total">${staff.staff.length}</div>
          <div class="ops-stat-label">Total Staff</div>
        </div>
        <div class="ops-stat-card">
          <div class="ops-stat-value text-green" id="ops-val-active">${staff.summary['Volunteer'].active + staff.summary['Security'].active}</div>
          <div class="ops-stat-label">Active Duty</div>
        </div>
        <div class="ops-stat-card">
          <div class="ops-stat-value text-gold" id="ops-val-standby">4</div>
          <div class="ops-stat-label">On Standby</div>
        </div>
        <div class="ops-stat-card">
          <div class="ops-stat-value text-pink" id="ops-val-incidents">3</div>
          <div class="ops-stat-label">Active Incidents</div>
        </div>
      </div>

      <!-- AI Resource Optimizer Recommendations -->
      <div class="ai-recommendation animate__animated animate__fadeIn mb-lg" id="ops-ai-recs">
        <span class="ai-rec-icon">🤖</span>
        <div class="ai-rec-content" style="flex:1;">
          <h4>GenAI Resource Reallocation Recommendations</h4>
          <p id="ops-rec-desc">Recommending staff shift redeployment based on gate crowd predictive spikes...</p>
          <div class="ai-rec-actions">
            <button class="ai-rec-btn primary" id="btn-apply-redeploy">Deploy Personnel Adjustment</button>
            <button class="ai-rec-btn" id="btn-dismiss-redeploy">Dismiss</button>
          </div>
        </div>
      </div>

      <!-- Bento Grid -->
      <div class="bento-grid">
        <!-- Staff & Incident Map -->
        <div class="glass-panel col-6 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">🛡️ Live Security & EMS Staff Coordinates</h3>
              <p class="panel-subtitle">Staff localization map and active dispatch points</p>
            </div>
          </div>
          <div class="stadium-map-container" id="ops-svg-container" style="height:350px;"></div>
        </div>

        <!-- Equipment Status -->
        <div class="glass-panel col-6 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">📡 Tactical Communications</h3>
              <p class="panel-subtitle">Radio channels status and tactical equipment logs</p>
            </div>
          </div>
          <div class="bento-grid">
            <div class="col-6 bg-cyan-dim" style="padding:16px; border-radius:8px; border:1px solid rgba(0,247,255,0.05);">
              <div style="font-size:0.7rem; color:var(--text-secondary); text-transform:uppercase;">Tactical Radios</div>
              <div class="font-mono text-cyan" style="font-size:1.4rem; font-weight:700; margin-top:4px;">98 / 100</div>
              <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">Operational Range &bull; 100% Battery</div>
            </div>
            <div class="col-6 bg-cyan-dim" style="padding:16px; border-radius:8px; border:1px solid rgba(0,247,255,0.05);">
              <div style="font-size:0.7rem; color:var(--text-secondary); text-transform:uppercase;">EMS Medical Kits</div>
              <div class="font-mono text-cyan" style="font-size:1.4rem; font-weight:700; margin-top:4px;">24 / 24</div>
              <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">Staged in sectors &bull; Checked 06:00</div>
            </div>
            <div class="col-6 bg-cyan-dim" style="padding:16px; border-radius:8px; border:1px solid rgba(0,247,255,0.05);">
              <div style="font-size:0.7rem; color:var(--text-secondary); text-transform:uppercase;">Crowd Control Barriers</div>
              <div class="font-mono text-cyan" style="font-size:1.4rem; font-weight:700; margin-top:4px;">150 Staged</div>
              <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">12 deployed at Gate A turnstiles</div>
            </div>
            <div class="col-6 bg-cyan-dim" style="padding:16px; border-radius:8px; border:1px solid rgba(0,247,255,0.05);">
              <div style="font-size:0.7rem; color:var(--text-secondary); text-transform:uppercase;">CCTV AI Processing</div>
              <div class="font-mono text-green" style="font-size:1.4rem; font-weight:700; margin-top:4px;">ACTIVE</div>
              <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">100 cameras processed via Edge AI</div>
            </div>
          </div>
        </div>

        <!-- Incident Log Table -->
        <div class="glass-panel col-12 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">⚠️ Active Incident Dispatch Log</h3>
              <p class="panel-subtitle">Real-time incident dispatch database and responder deployment status</p>
            </div>
          </div>
          <div class="data-table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Incident ID</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Location</th>
                  <th>Assigned Team</th>
                  <th>Logged Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="ops-incident-tbody">
                <!-- Loaded dynamically -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Apply suggestion button click binding
    document.getElementById('btn-apply-redeploy').addEventListener('click', () => {
      NexusApp.showToast('success', 'Staff Redeployed', 'AI staff allocation plan executed. 4 volunteers dispatched to Gate D.');
      document.getElementById('ops-ai-recs').style.display = 'none';
      
      const activeVal = document.getElementById('ops-val-active');
      if (activeVal) {activeVal.textContent = parseInt(activeVal.textContent) + 4;}
    });

    document.getElementById('btn-dismiss-redeploy').addEventListener('click', () => {
      document.getElementById('ops-ai-recs').style.display = 'none';
    });
  }

  // ─── Render Staff Overlay map ─────────────────────────────
  function renderMap() {
    const container = document.getElementById('ops-svg-container');
    if (!container) {return;}

    container.innerHTML = '';

    const width = 740;
    const height = 520;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'stadium-svg');
    svg.style.width = '100%';
    svg.style.height = '100%';

    const cx = width / 2;
    const cy = height / 2;

    // Draw outline
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    ring.setAttribute('cx', cx);
    ring.setAttribute('cy', cy);
    ring.setAttribute('rx', 300);
    ring.setAttribute('ry', 200);
    ring.setAttribute('fill', 'rgba(255,255,255,0.01)');
    ring.setAttribute('stroke', 'rgba(255,255,255,0.08)');
    ring.setAttribute('stroke-width', '4');
    svg.appendChild(ring);

    // Draw pitch
    const pitch = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    pitch.setAttribute('x', cx - 100);
    pitch.setAttribute('y', cy - 60);
    pitch.setAttribute('width', 200);
    pitch.setAttribute('height', 120);
    pitch.setAttribute('class', 'stadium-pitch');
    pitch.setAttribute('rx', 4);
    svg.appendChild(pitch);

    // Render active Staff Pins
    const staffCoords = [
      { x: cx - 150, y: cy - 100, role: 'Volunteer', icon: '🙋' },
      { x: cx + 150, y: cy - 100, role: 'Security', icon: '👮' },
      { x: cx - 220, y: cy + 80, role: 'Medical', icon: '🚑' },
      { x: cx + 220, y: cy + 80, role: 'Security', icon: '👮' },
      { x: cx, y: cy - 180, role: 'Volunteer', icon: '🙋' },
      { x: cx - 250, y: cy, role: 'Volunteer', icon: '🙋' }
    ];

    staffCoords.forEach(s => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', s.x);
      circle.setAttribute('cy', s.y);
      circle.setAttribute('r', 10);
      circle.setAttribute('fill', s.role === 'Security' ? 'rgba(77, 255, 190, 0.2)' : s.role === 'Medical' ? 'rgba(255, 0, 135, 0.2)' : 'rgba(0, 247, 255, 0.2)');
      circle.setAttribute('stroke', s.role === 'Security' ? 'var(--green)' : s.role === 'Medical' ? 'var(--pink)' : 'var(--cyan)');
      circle.setAttribute('stroke-width', '1.5');
      g.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', s.x);
      text.setAttribute('y', s.y + 3);
      text.setAttribute('font-size', '9px');
      text.setAttribute('text-anchor', 'middle');
      text.textContent = s.icon;
      g.appendChild(text);

      svg.appendChild(g);
    });

    // Render active Incidents
    const activeInc = incidents.filter(i => i.status === 'active' || i.status === 'responding');
    const incidentCoords = [
      { x: cx - 120, y: cy + 120 },
      { x: cx + 180, y: cy - 80 }
    ];

    activeInc.forEach((inc, idx) => {
      const coord = incidentCoords[idx % incidentCoords.length];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', coord.x);
      circle.setAttribute('cy', coord.y);
      circle.setAttribute('r', 14);
      circle.setAttribute('fill', 'rgba(255,0,135,0.3)');
      circle.setAttribute('stroke', 'var(--pink)');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('class', 'critical-density'); // Apply density animation for pulse
      g.appendChild(circle);

      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      icon.setAttribute('x', coord.x);
      icon.setAttribute('y', coord.y + 4);
      icon.setAttribute('text-anchor', 'middle');
      icon.setAttribute('font-size', '10px');
      icon.textContent = '🚨';
      g.appendChild(icon);

      svg.appendChild(g);
    });

    container.appendChild(svg);
  }

  // ─── Incident Dispatch Log Table ───────────────────────────
  function renderIncidentTable() {
    const tbody = document.getElementById('ops-incident-tbody');
    if (!tbody) {return;}

    tbody.innerHTML = '';

    incidents.forEach(inc => {
      const tr = document.createElement('tr');
      
      let statusBadge = 'idle';
      if (inc.status === 'active') {statusBadge = 'critical';}
      else if (inc.status === 'responding') {statusBadge = 'warning';}
      else if (inc.status === 'resolved') {statusBadge = 'active';}

      tr.innerHTML = `
        <td class="mono text-cyan">${inc.id}</td>
        <td>${inc.type}</td>
        <td>
          <span class="flex items-center gap-sm">
            <span class="severity-dot ${inc.severity}"></span>
            ${inc.severity.toUpperCase()}
          </span>
        </td>
        <td>${inc.location}</td>
        <td>${inc.assignee}</td>
        <td class="mono">${inc.timeStr}</td>
        <td>
          <span class="status-badge ${statusBadge}">${inc.status.toUpperCase()}</span>
        </td>
        <td>
          ${inc.status !== 'resolved' ? 
            `<button class="panel-action-btn active" onclick="Operations.resolveIncident('${inc.id}')">Resolve</button>` : 
            `<span class="text-muted" style="font-size:0.7rem;">Archived</span>`}
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Update active count
    const activeEl = document.getElementById('ops-val-incidents');
    if (activeEl) {
      activeEl.textContent = incidents.filter(i => i.status !== 'resolved').length;
    }
  }

  // Allow global callback for dispatch buttons
  window.Operations = {
    resolveIncident: (id) => {
      const inc = incidents.find(i => i.id === id);
      if (inc) {
        inc.status = 'resolved';
        NexusApp.showToast('success', 'Incident Resolved', `Incident ${id} (${inc.type}) marked as RESOLVED.`);
        renderIncidentTable();
        renderMap();
      }
    }
  };

  // ─── Live Telemetry Updates ────────────────────────────────
  function updateLiveMetrics() {
    // Random updates to recommendation card
    const desc = document.getElementById('ops-rec-desc');
    if (desc && Math.random() > 0.7) {
      const recs = [
        "🔄 <strong>AI Recommendation:</strong> Redeploy **3 volunteers** from Gate A (low traffic) to Gate D (predicted surge in 15 min).",
        "🚨 <strong>AI recommendation:</strong> Stage **2 medical staff** near South Lower Stand — predicted crowd surge hotspot.",
        "📡 <strong>AI recommendation:</strong> Radio Channel 4 interference building. Automatically shifting Gate operations staff to channel 8."
      ];
      desc.innerHTML = recs[Math.floor(Math.random() * recs.length)];
      document.getElementById('ops-ai-recs').style.display = 'flex';
    }
  }

  return { init, destroy };
})();

window.Operations = Operations;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Operations;
}
