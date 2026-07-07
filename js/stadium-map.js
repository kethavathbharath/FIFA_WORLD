/* ============================================================
   NEXUS Stadium Map — SVG Stadium Renderer
   ============================================================ */

const NexusStadiumMap = (() => {
  'use strict';

  /**
   * Render an interactive SVG stadium map into a container
   * @param {string} containerId - DOM element ID to render into
   * @param {Array} zones - Zone data from NexusData.getSimulatedCrowdData().zones
   * @param {Object} options - { onClick, onHover, showLabels, showValues }
   * @returns {SVGElement} The created SVG element
   */
  function render(containerId, zones, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {return null;}

    const { onClick, onHover, showLabels = true, showValues = true, compact = false } = options;
    
    const width = 740;
    const height = 520;

    // Clear existing content
    container.innerHTML = '';

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'stadium-svg');
    svg.style.width = '100%';
    svg.style.height = '100%';

    // ─── Defs (gradients, filters) ───────────────────────────
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Glow filter
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'glow');
    filter.innerHTML = '<feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>';
    defs.appendChild(filter);
    svg.appendChild(defs);

    // ─── Background ──────────────────────────────────────────
    createRect(svg, 0, 0, width, height, { fill: 'rgba(10, 10, 15, 0.3)', rx: 12 });

    // ─── Zone Definitions with SVG paths ─────────────────────
    const cx = width / 2;
    const cy = height / 2;
    const outerRx = 320;
    const outerRy = 220;
    const innerRx = 240;
    const innerRy = 150;
    const midRx = 280;
    const midRy = 185;

    const zoneShapes = [
      // Upper tiers (outer ring)
      {
        id: 'north-upper',
        path: describeArc(cx, cy, outerRx, outerRy, -135, -45, midRx, midRy),
        labelX: cx, labelY: cy - outerRy + 25
      },
      {
        id: 'south-upper',
        path: describeArc(cx, cy, outerRx, outerRy, 45, 135, midRx, midRy),
        labelX: cx, labelY: cy + outerRy - 25
      },
      {
        id: 'east-upper',
        path: describeArc(cx, cy, outerRx, outerRy, -45, 45, midRx, midRy),
        labelX: cx + outerRx - 30, labelY: cy
      },
      {
        id: 'west-upper',
        path: describeArc(cx, cy, outerRx, outerRy, 135, 225, midRx, midRy),
        labelX: cx - outerRx + 30, labelY: cy
      },
      // Lower tiers (inner ring)
      {
        id: 'north-lower',
        path: describeArc(cx, cy, midRx, midRy, -135, -45, innerRx, innerRy),
        labelX: cx, labelY: cy - midRy + 25
      },
      {
        id: 'south-lower',
        path: describeArc(cx, cy, midRx, midRy, 45, 135, innerRx, innerRy),
        labelX: cx, labelY: cy + midRy - 25
      },
      {
        id: 'east-lower',
        path: describeArc(cx, cy, midRx, midRy, -45, 45, innerRx, innerRy),
        labelX: cx + midRx - 30, labelY: cy
      },
      {
        id: 'west-lower',
        path: describeArc(cx, cy, midRx, midRy, 135, 225, innerRx, innerRy),
        labelX: cx - midRx + 30, labelY: cy
      },
      // VIP sections
      {
        id: 'vip-north',
        path: describeArc(cx, cy, innerRx, innerRy, -160, -20, innerRx - 25, innerRy - 18),
        labelX: cx, labelY: cy - innerRy + 12
      },
      {
        id: 'vip-south',
        path: describeArc(cx, cy, innerRx, innerRy, 20, 160, innerRx - 25, innerRy - 18),
        labelX: cx, labelY: cy + innerRy - 12
      }
    ];

    // ─── Draw zones ──────────────────────────────────────────
    const zoneGroups = {};
    
    zoneShapes.forEach(shape => {
      const zoneData = zones.find(z => z.id === shape.id);
      if (!zoneData) {return;}

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', `stadium-zone ${zoneData.density}-density`);
      group.setAttribute('data-zone-id', shape.id);
      group.style.cursor = 'pointer';

      // Zone path
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', shape.path);
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('fill-opacity', '0.6');
      group.appendChild(path);

      // Zone label
      if (showLabels && !compact) {
        const label = createText(svg, shape.labelX, shape.labelY - 6, zoneData.name, 'stadium-zone-label');
        group.appendChild(label);
      }

      // Zone occupancy value
      if (showValues) {
        const valueY = compact ? shape.labelY : shape.labelY + 10;
        const value = createText(svg, shape.labelX, valueY, Math.round(zoneData.occupancy * 100) + '%', 'stadium-zone-value');
        group.appendChild(value);
      }

      // Events
      if (onClick) {
        group.addEventListener('click', () => onClick(zoneData));
      }

      if (onHover) {
        group.addEventListener('mouseenter', (e) => onHover(zoneData, e, true));
        group.addEventListener('mouseleave', (e) => onHover(zoneData, e, false));
      }

      svg.appendChild(group);
      zoneGroups[shape.id] = group;
    });

    // ─── Draw Pitch ──────────────────────────────────────────
    const pitchW = 200;
    const pitchH = 110;
    const pitchGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Pitch rectangle
    const pitch = createRect(svg, cx - pitchW/2, cy - pitchH/2, pitchW, pitchH, {
      class: 'stadium-pitch',
      rx: 4
    });
    pitchGroup.appendChild(pitch);

    // Center circle
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', cx);
    centerCircle.setAttribute('cy', cy);
    centerCircle.setAttribute('r', 25);
    centerCircle.setAttribute('fill', 'none');
    centerCircle.setAttribute('stroke', 'rgba(77, 255, 190, 0.3)');
    centerCircle.setAttribute('stroke-width', '1');
    centerCircle.setAttribute('stroke-dasharray', '4 2');
    pitchGroup.appendChild(centerCircle);

    // Center line
    const centerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    centerLine.setAttribute('x1', cx);
    centerLine.setAttribute('y1', cy - pitchH/2);
    centerLine.setAttribute('x2', cx);
    centerLine.setAttribute('y2', cy + pitchH/2);
    centerLine.setAttribute('stroke', 'rgba(77, 255, 190, 0.2)');
    centerLine.setAttribute('stroke-width', '1');
    centerLine.setAttribute('stroke-dasharray', '4 2');
    pitchGroup.appendChild(centerLine);

    // Pitch label
    const pitchLabel = createText(svg, cx, cy, '⚽ PITCH', 'stadium-zone-label');
    pitchLabel.setAttribute('fill', 'rgba(77, 255, 190, 0.4)');
    pitchLabel.setAttribute('font-size', '12');
    pitchGroup.appendChild(pitchLabel);

    svg.appendChild(pitchGroup);

    // ─── Gate indicators ─────────────────────────────────────
    if (!compact) {
      const gates = [
        { label: 'GATE A', x: cx, y: 15 },
        { label: 'GATE B', x: width - 25, y: cy },
        { label: 'GATE C', x: cx, y: height - 15 },
        { label: 'GATE D', x: 25, y: cy }
      ];

      gates.forEach(gate => {
        const gateLabel = createText(svg, gate.x, gate.y, gate.label, 'stadium-zone-label');
        gateLabel.setAttribute('fill', 'rgba(255, 222, 115, 0.6)');
        gateLabel.setAttribute('font-size', '9');
        gateLabel.setAttribute('letter-spacing', '1.5');
        svg.appendChild(gateLabel);
      });
    }

    container.appendChild(svg);

    return {
      svg,
      zoneGroups,
      update: (newZones) => updateZones(zoneGroups, newZones, showValues)
    };
  }

  // ─── Update Zone Colors & Values ───────────────────────────
  function updateZones(zoneGroups, zones, showValues) {
    zones.forEach(zone => {
      const group = zoneGroups[zone.id];
      if (!group) {return;}

      // Update density class
      group.className.baseVal = `stadium-zone ${zone.density}-density`;

      // Update value text
      if (showValues) {
        const valueText = group.querySelector('.stadium-zone-value');
        if (valueText) {
          valueText.textContent = Math.round(zone.occupancy * 100) + '%';
        }
      }
    });
  }

  // ─── SVG Helper: Arc Path for Stadium Sections ─────────────
  function describeArc(cx, cy, outerRx, outerRy, startAngle, endAngle, innerRx, innerRy) {
    const start1 = polarToCartesian(cx, cy, outerRx, outerRy, endAngle);
    const end1 = polarToCartesian(cx, cy, outerRx, outerRy, startAngle);
    const start2 = polarToCartesian(cx, cy, innerRx, innerRy, startAngle);
    const end2 = polarToCartesian(cx, cy, innerRx, innerRy, endAngle);

    const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

    return [
      'M', start1.x, start1.y,
      'A', outerRx, outerRy, 0, largeArc, 0, end1.x, end1.y,
      'L', start2.x, start2.y,
      'A', innerRx, innerRy, 0, largeArc, 1, end2.x, end2.y,
      'Z'
    ].join(' ');
  }

  function polarToCartesian(cx, cy, rx, ry, angleDeg) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return {
      x: cx + rx * Math.cos(rad),
      y: cy + ry * Math.sin(rad)
    };
  }

  // ─── SVG Helpers ───────────────────────────────────────────
  function createRect(parent, x, y, w, h, attrs = {}) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    Object.entries(attrs).forEach(([k, v]) => rect.setAttribute(k, v));
    return rect;
  }

  function createText(parent, x, y, text, className) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    el.setAttribute('x', x);
    el.setAttribute('y', y);
    el.setAttribute('class', className);
    el.textContent = text;
    return el;
  }

  // ─── Tooltip Helper ────────────────────────────────────────
  function showTooltip(zoneData, event) {
    const tooltip = document.getElementById('zone-tooltip');
    if (!tooltip) {return;}

    document.getElementById('tooltip-title').textContent = zoneData.name;
    document.getElementById('tooltip-capacity').textContent = zoneData.capacity?.toLocaleString() || '---';
    document.getElementById('tooltip-current').textContent = zoneData.current?.toLocaleString() || '---';
    document.getElementById('tooltip-occupancy').textContent = Math.round(zoneData.occupancy * 100) + '%';
    document.getElementById('tooltip-temp').textContent = (zoneData.temperature?.toFixed(1) || '24.0') + '°C';

    tooltip.style.left = (event.clientX + 16) + 'px';
    tooltip.style.top = (event.clientY - 60) + 'px';
    tooltip.classList.add('visible');
  }

  function hideTooltip() {
    const tooltip = document.getElementById('zone-tooltip');
    if (tooltip) {tooltip.classList.remove('visible');}
  }

  return {
    render,
    showTooltip,
    hideTooltip
  };
})();

window.NexusStadiumMap = NexusStadiumMap;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = NexusStadiumMap;
}
