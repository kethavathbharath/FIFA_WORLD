/* ============================================================
   NEXUS Data Layer — FIFA World Cup 2026
   Venue data, simulation engine, AI response library
   ============================================================ */

const NexusData = (() => {
  'use strict';

  // ─── Current State ─────────────────────────────────────────
  let currentVenueId = 'metlife';
  let simulationSpeed = 1;

  // ─── 16 Official FIFA World Cup 2026 Venues ────────────────
  const venues = [
    { id: 'metlife', name: 'MetLife Stadium', fifaName: 'New York New Jersey Stadium', city: 'New York/New Jersey', country: 'USA', capacity: 80663, lat: 40.8128, lng: -74.0742, timezone: 'America/New_York', flag: '🇺🇸' },
    { id: 'azteca', name: 'Estadio Azteca', fifaName: 'Mexico City Stadium', city: 'Mexico City', country: 'Mexico', capacity: 80824, lat: 19.3029, lng: -99.1505, timezone: 'America/Mexico_City', flag: '🇲🇽' },
    { id: 'att', name: 'AT&T Stadium', fifaName: 'Dallas Stadium', city: 'Dallas', country: 'USA', capacity: 70649, lat: 32.7473, lng: -97.0945, timezone: 'America/Chicago', flag: '🇺🇸' },
    { id: 'sofi', name: 'SoFi Stadium', fifaName: 'Los Angeles Stadium', city: 'Los Angeles', country: 'USA', capacity: 70492, lat: 33.9535, lng: -118.3392, timezone: 'America/Los_Angeles', flag: '🇺🇸' },
    { id: 'arrowhead', name: 'Arrowhead Stadium', fifaName: 'Kansas City Stadium', city: 'Kansas City', country: 'USA', capacity: 69045, lat: 39.0489, lng: -94.4839, timezone: 'America/Chicago', flag: '🇺🇸' },
    { id: 'levis', name: "Levi's Stadium", fifaName: 'San Francisco Bay Area Stadium', city: 'San Francisco', country: 'USA', capacity: 68827, lat: 37.4033, lng: -121.9694, timezone: 'America/Los_Angeles', flag: '🇺🇸' },
    { id: 'nrg', name: 'NRG Stadium', fifaName: 'Houston Stadium', city: 'Houston', country: 'USA', capacity: 68777, lat: 29.6847, lng: -95.4107, timezone: 'America/Chicago', flag: '🇺🇸' },
    { id: 'lincoln', name: 'Lincoln Financial Field', fifaName: 'Philadelphia Stadium', city: 'Philadelphia', country: 'USA', capacity: 68324, lat: 39.9008, lng: -75.1675, timezone: 'America/New_York', flag: '🇺🇸' },
    { id: 'mercedes', name: 'Mercedes-Benz Stadium', fifaName: 'Atlanta Stadium', city: 'Atlanta', country: 'USA', capacity: 68239, lat: 33.7553, lng: -84.4006, timezone: 'America/New_York', flag: '🇺🇸' },
    { id: 'lumen', name: 'Lumen Field', fifaName: 'Seattle Stadium', city: 'Seattle', country: 'USA', capacity: 66925, lat: 47.5952, lng: -122.3316, timezone: 'America/Los_Angeles', flag: '🇺🇸' },
    { id: 'hardrock', name: 'Hard Rock Stadium', fifaName: 'Miami Stadium', city: 'Miami', country: 'USA', capacity: 64478, lat: 25.9580, lng: -80.2389, timezone: 'America/New_York', flag: '🇺🇸' },
    { id: 'gillette', name: 'Gillette Stadium', fifaName: 'Boston Stadium', city: 'Boston', country: 'USA', capacity: 64146, lat: 42.0909, lng: -71.2643, timezone: 'America/New_York', flag: '🇺🇸' },
    { id: 'bcplace', name: 'BC Place', fifaName: 'BC Place Vancouver', city: 'Vancouver', country: 'Canada', capacity: 52497, lat: 49.2768, lng: -123.1118, timezone: 'America/Vancouver', flag: '🇨🇦' },
    { id: 'bbva', name: 'Estadio BBVA', fifaName: 'Monterrey Stadium', city: 'Monterrey', country: 'Mexico', capacity: 51243, lat: 25.6699, lng: -100.2446, timezone: 'America/Monterrey', flag: '🇲🇽' },
    { id: 'akron', name: 'Estadio Akron', fifaName: 'Guadalajara Stadium', city: 'Guadalajara', country: 'Mexico', capacity: 45664, lat: 20.6826, lng: -103.4626, timezone: 'America/Mexico_City', flag: '🇲🇽' },
    { id: 'bmo', name: 'BMO Field', fifaName: 'Toronto Stadium', city: 'Toronto', country: 'Canada', capacity: 43036, lat: 43.6332, lng: -79.4186, timezone: 'America/Toronto', flag: '🇨🇦' }
  ];

  // ─── 48 Teams with Groups ──────────────────────────────────
  const teams = [
    // Group A
    { name: 'USA', code: 'USA', flag: '🇺🇸', group: 'A' },
    { name: 'Morocco', code: 'MAR', flag: '🇲🇦', group: 'A' },
    { name: 'Scotland', code: 'SCO', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'A' },
    { name: 'Trinidad & Tobago', code: 'TRI', flag: '🇹🇹', group: 'A' },
    // Group B
    { name: 'France', code: 'FRA', flag: '🇫🇷', group: 'B' },
    { name: 'Colombia', code: 'COL', flag: '🇨🇴', group: 'B' },
    { name: 'Saudi Arabia', code: 'KSA', flag: '🇸🇦', group: 'B' },
    { name: 'New Zealand', code: 'NZL', flag: '🇳🇿', group: 'B' },
    // Group C
    { name: 'Argentina', code: 'ARG', flag: '🇦🇷', group: 'C' },
    { name: 'Mexico', code: 'MEX', flag: '🇲🇽', group: 'C' },
    { name: 'Uzbekistan', code: 'UZB', flag: '🇺🇿', group: 'C' },
    { name: 'Jamaica', code: 'JAM', flag: '🇯🇲', group: 'C' },
    // Group D
    { name: 'Portugal', code: 'POR', flag: '🇵🇹', group: 'D' },
    { name: 'Japan', code: 'JPN', flag: '🇯🇵', group: 'D' },
    { name: 'Paraguay', code: 'PAR', flag: '🇵🇾', group: 'D' },
    { name: 'Bolivia', code: 'BOL', flag: '🇧🇴', group: 'D' },
    // Group E
    { name: 'Brazil', code: 'BRA', flag: '🇧🇷', group: 'E' },
    { name: 'Cameroon', code: 'CMR', flag: '🇨🇲', group: 'E' },
    { name: 'Serbia', code: 'SRB', flag: '🇷🇸', group: 'E' },
    { name: 'Bahrain', code: 'BHR', flag: '🇧🇭', group: 'E' },
    // Group F
    { name: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'F' },
    { name: 'Senegal', code: 'SEN', flag: '🇸🇳', group: 'F' },
    { name: 'Poland', code: 'POL', flag: '🇵🇱', group: 'F' },
    { name: 'Panama', code: 'PAN', flag: '🇵🇦', group: 'F' },
    // Group G
    { name: 'Germany', code: 'GER', flag: '🇩🇪', group: 'G' },
    { name: 'South Korea', code: 'KOR', flag: '🇰🇷', group: 'G' },
    { name: 'Ecuador', code: 'ECU', flag: '🇪🇨', group: 'G' },
    { name: 'Indonesia', code: 'IDN', flag: '🇮🇩', group: 'G' },
    // Group H
    { name: 'Spain', code: 'ESP', flag: '🇪🇸', group: 'H' },
    { name: 'Nigeria', code: 'NGA', flag: '🇳🇬', group: 'H' },
    { name: 'Costa Rica', code: 'CRC', flag: '🇨🇷', group: 'H' },
    { name: 'Albania', code: 'ALB', flag: '🇦🇱', group: 'H' },
    // Group I
    { name: 'Netherlands', code: 'NED', flag: '🇳🇱', group: 'I' },
    { name: 'Australia', code: 'AUS', flag: '🇦🇺', group: 'I' },
    { name: 'Canada', code: 'CAN', flag: '🇨🇦', group: 'I' },
    { name: 'Ivory Coast', code: 'CIV', flag: '🇨🇮', group: 'I' },
    // Group J
    { name: 'Italy', code: 'ITA', flag: '🇮🇹', group: 'J' },
    { name: 'Iran', code: 'IRN', flag: '🇮🇷', group: 'J' },
    { name: 'Honduras', code: 'HON', flag: '🇭🇳', group: 'J' },
    { name: 'Peru', code: 'PER', flag: '🇵🇪', group: 'J' },
    // Group K
    { name: 'Belgium', code: 'BEL', flag: '🇧🇪', group: 'K' },
    { name: 'Turkey', code: 'TUR', flag: '🇹🇷', group: 'K' },
    { name: 'Uruguay', code: 'URU', flag: '🇺🇾', group: 'K' },
    { name: 'Guatemala', code: 'GUA', flag: '🇬🇹', group: 'K' },
    // Group L
    { name: 'Croatia', code: 'CRO', flag: '🇭🇷', group: 'L' },
    { name: 'Ghana', code: 'GHA', flag: '🇬🇭', group: 'L' },
    { name: 'Chile', code: 'CHI', flag: '🇨🇱', group: 'L' },
    { name: 'Egypt', code: 'EGY', flag: '🇪🇬', group: 'L' }
  ];

  // ─── Stadium Zones Template ─────────────────────────────────
  const zoneTemplate = [
    { id: 'north-upper', name: 'North Upper', section: 'north', tier: 'upper', capacityPct: 0.10 },
    { id: 'north-lower', name: 'North Lower', section: 'north', tier: 'lower', capacityPct: 0.08 },
    { id: 'south-upper', name: 'South Upper', section: 'south', tier: 'upper', capacityPct: 0.10 },
    { id: 'south-lower', name: 'South Lower', section: 'south', tier: 'lower', capacityPct: 0.08 },
    { id: 'east-upper', name: 'East Upper', section: 'east', tier: 'upper', capacityPct: 0.12 },
    { id: 'east-lower', name: 'East Lower', section: 'east', tier: 'lower', capacityPct: 0.10 },
    { id: 'west-upper', name: 'West Upper', section: 'west', tier: 'upper', capacityPct: 0.12 },
    { id: 'west-lower', name: 'West Lower', section: 'west', tier: 'lower', capacityPct: 0.10 },
    { id: 'vip-north', name: 'VIP North', section: 'north', tier: 'vip', capacityPct: 0.04 },
    { id: 'vip-south', name: 'VIP South', section: 'south', tier: 'vip', capacityPct: 0.04 },
    { id: 'concourse-a', name: 'Concourse A', section: 'north', tier: 'concourse', capacityPct: 0.04 },
    { id: 'concourse-b', name: 'Concourse B', section: 'east', tier: 'concourse', capacityPct: 0.04 },
    { id: 'concourse-c', name: 'Concourse C', section: 'south', tier: 'concourse', capacityPct: 0.04 }
  ];

  // ─── Facilities Template ────────────────────────────────────
  const facilitiesTemplate = [
    { id: 'restroom-n1', name: 'Restroom N1', type: 'restroom', icon: '🚻', section: 'north', x: 200, y: 80 },
    { id: 'restroom-s1', name: 'Restroom S1', type: 'restroom', icon: '🚻', section: 'south', x: 200, y: 520 },
    { id: 'restroom-e1', name: 'Restroom E1', type: 'restroom', icon: '🚻', section: 'east', x: 650, y: 300 },
    { id: 'restroom-w1', name: 'Restroom W1', type: 'restroom', icon: '🚻', section: 'west', x: 50, y: 300 },
    { id: 'concession-a', name: 'Food Court A', type: 'concession', icon: '🍔', section: 'north', x: 350, y: 60 },
    { id: 'concession-b', name: 'Food Court B', type: 'concession', icon: '🍔', section: 'south', x: 350, y: 540 },
    { id: 'concession-c', name: 'Food Court C', type: 'concession', icon: '🍕', section: 'east', x: 680, y: 200 },
    { id: 'concession-d', name: 'Food Court D', type: 'concession', icon: '🌮', section: 'west', x: 30, y: 400 },
    { id: 'medical-1', name: 'Medical Station 1', type: 'medical', icon: '🏥', section: 'north', x: 500, y: 90 },
    { id: 'medical-2', name: 'Medical Station 2', type: 'medical', icon: '🏥', section: 'south', x: 100, y: 510 },
    { id: 'merch-1', name: 'FIFA Store', type: 'merchandise', icon: '🛍️', section: 'east', x: 620, y: 450 },
    { id: 'merch-2', name: 'Team Shop', type: 'merchandise', icon: '👕', section: 'west', x: 80, y: 150 },
    { id: 'gate-a', name: 'Gate A (Main)', type: 'gate', icon: '🚪', section: 'north', x: 350, y: 20 },
    { id: 'gate-b', name: 'Gate B', type: 'gate', icon: '🚪', section: 'east', x: 720, y: 300 },
    { id: 'gate-c', name: 'Gate C', type: 'gate', icon: '🚪', section: 'south', x: 350, y: 580 },
    { id: 'gate-d', name: 'Gate D', type: 'gate', icon: '🚪', section: 'west', x: 10, y: 300 },
    { id: 'fanzone', name: 'Fan Zone', type: 'fanzone', icon: '🎉', section: 'east', x: 660, y: 100 },
    { id: 'info', name: 'Info Desk', type: 'info', icon: 'ℹ️', section: 'north', x: 150, y: 50 }
  ];

  // ─── Simulated Match Data ──────────────────────────────────
  function getSimulatedMatches() {
    const now = new Date();
    const matchPairs = [
      [0, 1], [4, 5], [8, 9], [12, 13], [16, 17], [20, 21],
      [24, 25], [28, 29], [32, 33], [36, 37], [40, 41], [44, 45],
      [2, 3], [6, 7], [10, 11], [14, 15], [18, 19], [22, 23]
    ];
    const venueIds = venues.map(v => v.id);
    const matches = [];

    for (let i = 0; i < 6; i++) {
      const pair = matchPairs[i % matchPairs.length];
      const t1 = teams[pair[0]];
      const t2 = teams[pair[1]];
      const venue = venues[i % venues.length];
      let status, score1, score2, minute;

      if (i === 0) {
        status = 'live';
        minute = 30 + Math.floor(Math.random() * 40);
        score1 = Math.floor(Math.random() * 3);
        score2 = Math.floor(Math.random() * 3);
      } else if (i === 1) {
        status = 'live';
        minute = Math.floor(Math.random() * 45);
        score1 = Math.floor(Math.random() * 2);
        score2 = Math.floor(Math.random() * 2);
      } else if (i < 4) {
        status = 'upcoming';
        minute = 0;
        score1 = 0;
        score2 = 0;
      } else {
        status = 'completed';
        minute = 90;
        score1 = Math.floor(Math.random() * 4);
        score2 = Math.floor(Math.random() * 4);
      }

      matches.push({
        id: `match-${i}`,
        team1: t1,
        team2: t2,
        venue: venue,
        status,
        minute,
        score1,
        score2,
        group: t1.group,
        attendance: status === 'upcoming' ? 0 : Math.floor(venue.capacity * (0.85 + Math.random() * 0.15))
      });
    }
    return matches;
  }

  // ─── Simulated Crowd Data ──────────────────────────────────
  const crowdBaseOccupancy = {};

  function getSimulatedCrowdData(venueId) {
    const venue = venues.find(v => v.id === venueId) || venues[0];
    const base = crowdBaseOccupancy[venueId] || 0.72;
    const jitter = (Math.random() - 0.5) * 0.06;
    const occupancy = Math.min(0.98, Math.max(0.45, base + jitter));
    crowdBaseOccupancy[venueId] = occupancy;

    const zones = zoneTemplate.map(zone => {
      const zoneOcc = Math.min(1.0, Math.max(0.2, occupancy + (Math.random() - 0.5) * 0.25));
      const zoneCapacity = Math.floor(venue.capacity * zone.capacityPct);
      return {
        ...zone,
        capacity: zoneCapacity,
        current: Math.floor(zoneCapacity * zoneOcc),
        occupancy: zoneOcc,
        density: zoneOcc > 0.9 ? 'critical' : zoneOcc > 0.75 ? 'high' : zoneOcc > 0.5 ? 'medium' : 'low',
        trend: Math.random() > 0.5 ? 'rising' : 'falling',
        temperature: 22 + Math.random() * 6,
        noiseLevel: 60 + Math.random() * 35
      };
    });

    const totalCurrent = zones.reduce((sum, z) => sum + z.current, 0);

    return {
      venueId,
      venueName: venue.name,
      capacity: venue.capacity,
      totalCurrent,
      occupancy: totalCurrent / venue.capacity,
      zones,
      entryRate: Math.floor(200 + Math.random() * 500),
      exitRate: Math.floor(100 + Math.random() * 300),
      avgDwellTime: Math.floor(120 + Math.random() * 60),
      peakZone: zones.reduce((max, z) => z.occupancy > max.occupancy ? z : max, zones[0]),
      predictionNext30: Math.min(0.98, occupancy + (Math.random() - 0.3) * 0.1),
      gateFlows: [
        { gate: 'Gate A', entry: Math.floor(300 + Math.random() * 400), exit: Math.floor(50 + Math.random() * 150) },
        { gate: 'Gate B', entry: Math.floor(200 + Math.random() * 300), exit: Math.floor(40 + Math.random() * 120) },
        { gate: 'Gate C', entry: Math.floor(150 + Math.random() * 250), exit: Math.floor(30 + Math.random() * 100) },
        { gate: 'Gate D', entry: Math.floor(100 + Math.random() * 200), exit: Math.floor(20 + Math.random() * 80) }
      ]
    };
  }

  // ─── Simulated Alerts ──────────────────────────────────────
  const alertTemplates = [
    { type: 'crowd', severity: 'critical', title: 'Crowd Density Critical', desc: 'Zone {zone} has exceeded 95% capacity. Immediate action required.', icon: '🚨' },
    { type: 'crowd', severity: 'warning', title: 'Congestion Building', desc: '{gate} ingress rate increasing. Predicted bottleneck in 15 minutes.', icon: '⚠️' },
    { type: 'crowd', severity: 'info', title: 'Crowd Flow Normal', desc: 'All zones within safe capacity thresholds. Current avg: {pct}%', icon: '📊' },
    { type: 'security', severity: 'critical', title: 'Security Alert', desc: 'Unauthorized access attempt detected at {gate}. Security dispatched.', icon: '🔴' },
    { type: 'security', severity: 'warning', title: 'Perimeter Check Required', desc: 'Sensor anomaly detected in Sector {sector}. Verification needed.', icon: '🛡️' },
    { type: 'medical', severity: 'critical', title: 'Medical Emergency', desc: 'Medical assistance requested in {zone}. EMS team en route.', icon: '🚑' },
    { type: 'medical', severity: 'warning', title: 'Medical Station Queue', desc: 'Medical Station {num} queue exceeding 10 persons. Additional staff recommended.', icon: '🏥' },
    { type: 'ops', severity: 'info', title: 'Staff Rotation Alert', desc: 'Shift change in 30 minutes. {count} personnel scheduled for handoff.', icon: '🔄' },
    { type: 'ops', severity: 'warning', title: 'Equipment Alert', desc: 'Radio channel {ch} experiencing interference. Backup channel active.', icon: '📡' },
    { type: 'crowd', severity: 'warning', title: 'AI Prediction Alert', desc: 'AI predicts 40% surge at {gate} during halftime. Pre-position staff recommended.', icon: '🤖' },
    { type: 'ops', severity: 'info', title: 'Weather Update', desc: 'Temperature at {temp}°C. Hydration station demand increasing 25%.', icon: '🌡️' },
    { type: 'security', severity: 'info', title: 'CCTV System Check', desc: 'All {count} cameras operational. Coverage: 100%. Last check: {time}.', icon: '📹' }
  ];

  function getSimulatedAlerts(count = 8) {
    const gates = ['Gate A', 'Gate B', 'Gate C', 'Gate D'];
    const zones = ['North Upper', 'South Lower', 'East Upper', 'West Lower', 'VIP North'];
    const alerts = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
      const time = new Date(now - i * 60000 * (1 + Math.random() * 5));
      let desc = template.desc
        .replace('{zone}', zones[Math.floor(Math.random() * zones.length)])
        .replace('{gate}', gates[Math.floor(Math.random() * gates.length)])
        .replace('{pct}', Math.floor(65 + Math.random() * 25))
        .replace('{sector}', Math.floor(1 + Math.random() * 8))
        .replace('{num}', Math.floor(1 + Math.random() * 3))
        .replace('{count}', Math.floor(12 + Math.random() * 30))
        .replace('{ch}', Math.floor(1 + Math.random() * 12))
        .replace('{temp}', Math.floor(28 + Math.random() * 8))
        .replace('{time}', time.toLocaleTimeString());

      alerts.push({
        id: `alert-${Date.now()}-${i}`,
        ...template,
        desc,
        timestamp: time,
        timeStr: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: i > 3
      });
    }

    return alerts.sort((a, b) => {
      const sev = { critical: 0, warning: 1, info: 2 };
      return (sev[a.severity] - sev[b.severity]) || (b.timestamp - a.timestamp);
    });
  }

  // ─── Simulated Staff Data ──────────────────────────────────
  const staffRoles = ['Security', 'Medical', 'Volunteer', 'Maintenance', 'Operations', 'Crowd Control'];
  const staffStatuses = ['active', 'break', 'standby', 'deployed'];

  function getSimulatedStaffData() {
    const staff = [];
    const zones = zoneTemplate.map(z => z.name);

    for (let i = 0; i < 45; i++) {
      const role = staffRoles[Math.floor(Math.random() * staffRoles.length)];
      staff.push({
        id: `staff-${i}`,
        name: `${['J.', 'M.', 'A.', 'R.', 'S.', 'K.', 'L.', 'D.', 'C.', 'P.'][Math.floor(Math.random() * 10)]} ${['Smith', 'Garcia', 'Kim', 'Müller', 'Santos', 'Tanaka', 'Okafor', 'Dubois', 'Singh', 'Lopez'][Math.floor(Math.random() * 10)]}`,
        role,
        zone: zones[Math.floor(Math.random() * zones.length)],
        status: staffStatuses[Math.floor(Math.random() * staffStatuses.length)],
        shiftStart: '06:00',
        shiftEnd: '14:00',
        radioChannel: Math.floor(1 + Math.random() * 8)
      });
    }

    const summary = {};
    staffRoles.forEach(role => {
      summary[role] = {
        total: staff.filter(s => s.role === role).length,
        active: staff.filter(s => s.role === role && s.status === 'active').length,
        onBreak: staff.filter(s => s.role === role && s.status === 'break').length
      };
    });

    return { staff, summary, totalDeployed: staff.filter(s => s.status === 'active' || s.status === 'deployed').length };
  }

  // ─── Simulated Incidents ───────────────────────────────────
  const incidentTypes = ['Security Breach', 'Medical Emergency', 'Crowd Surge', 'Equipment Failure', 'Lost Child', 'Altercation', 'Facility Issue', 'Weather Alert', 'VIP Incident', 'Traffic Congestion'];
  const incidentSeverities = ['critical', 'high', 'medium', 'low'];

  function getSimulatedIncidents(count = 12) {
    const incidents = [];
    const now = new Date();
    const zones = zoneTemplate.map(z => z.name);

    for (let i = 0; i < count; i++) {
      const time = new Date(now - i * 60000 * (3 + Math.random() * 15));
      const severity = incidentSeverities[Math.floor(Math.random() * incidentSeverities.length)];
      incidents.push({
        id: `INC-${String(1000 + i).padStart(4, '0')}`,
        type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
        severity,
        location: zones[Math.floor(Math.random() * zones.length)],
        status: i < 3 ? 'active' : i < 7 ? 'responding' : 'resolved',
        assignee: `Team ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
        timestamp: time,
        timeStr: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        description: `${incidentTypes[Math.floor(Math.random() * incidentTypes.length)]} reported at ${zones[Math.floor(Math.random() * zones.length)]}`
      });
    }

    return incidents;
  }

  // ─── Simulated Facility Wait Times ─────────────────────────
  function getSimulatedFacilities() {
    return facilitiesTemplate.map(f => {
      let waitTime;
      if (f.type === 'restroom') waitTime = Math.floor(2 + Math.random() * 10);
      else if (f.type === 'concession') waitTime = Math.floor(3 + Math.random() * 15);
      else if (f.type === 'medical') waitTime = Math.floor(0 + Math.random() * 5);
      else if (f.type === 'merchandise') waitTime = Math.floor(5 + Math.random() * 12);
      else waitTime = 0;

      const waitLevel = waitTime > 10 ? 'high' : waitTime > 5 ? 'medium' : 'low';

      return {
        ...f,
        waitTime,
        waitLevel,
        queueLength: Math.floor(waitTime * (2 + Math.random() * 3)),
        isOpen: Math.random() > 0.05
      };
    });
  }

  // ─── Simulated IoT Sensor Data ─────────────────────────────
  function getSimulatedIoTData() {
    return {
      wifi: {
        load: Math.floor(55 + Math.random() * 40),
        connectedDevices: Math.floor(25000 + Math.random() * 35000),
        bandwidth: Math.floor(200 + Math.random() * 300)
      },
      power: {
        consumption: Math.floor(70 + Math.random() * 25),
        solarGeneration: Math.floor(10 + Math.random() * 15),
        backupStatus: 'Ready'
      },
      hvac: {
        temperature: (22 + Math.random() * 4).toFixed(1),
        humidity: Math.floor(40 + Math.random() * 25),
        airQuality: Math.floor(75 + Math.random() * 25)
      },
      security: {
        camerasOnline: Math.floor(95 + Math.random() * 5),
        totalCameras: 100,
        alertLevel: Math.random() > 0.8 ? 'elevated' : 'normal'
      }
    };
  }

  // ─── Historical Data Generator (for charts) ────────────────
  function generateTimeSeriesData(points = 24, base = 50, variance = 20) {
    const data = [];
    let value = base;
    for (let i = 0; i < points; i++) {
      value = Math.max(10, Math.min(100, value + (Math.random() - 0.5) * variance));
      data.push({
        time: `${String(i).padStart(2, '0')}:00`,
        value: Math.round(value * 10) / 10
      });
    }
    return data;
  }

  function generatePredictionData(actualData, futurePoints = 6) {
    const lastValue = actualData[actualData.length - 1].value;
    const prediction = [];
    let value = lastValue;
    for (let i = 0; i < futurePoints; i++) {
      value = Math.max(10, Math.min(100, value + (Math.random() - 0.3) * 8));
      prediction.push({
        time: `${String(actualData.length + i).padStart(2, '0')}:00`,
        value: Math.round(value * 10) / 10,
        predicted: true
      });
    }
    return prediction;
  }

  // ─── GenAI Response Library ────────────────────────────────
  const aiResponses = {
    'crowd': {
      text: "📊 **Current Crowd Analysis**\n\nThe overall stadium occupancy is at **{occupancy}%** with **{total}** fans currently in-venue.\n\n**Hotspots:**\n• {peakZone} is the busiest zone at **{peakPct}%** capacity\n• Gate A has the highest ingress rate: **{entryRate}** fans/min\n\n**AI Recommendation:** Consider redirecting incoming fans from Gate A to Gate D, which currently has 40% less traffic. This could reduce average wait time by **3.5 minutes**.",
      confidence: 'high',
      hasChart: true
    },
    'gate': {
      text: "🚪 **Gate Flow Analysis**\n\nCurrent gate status across the venue:\n\n| Gate | Entry Rate | Exit Rate | Wait Time |\n|------|-----------|-----------|----------|\n| Gate A | {ga_entry}/min | {ga_exit}/min | ~8 min |\n| Gate B | {gb_entry}/min | {gb_exit}/min | ~5 min |\n| Gate C | {gc_entry}/min | {gc_exit}/min | ~3 min |\n| Gate D | {gd_entry}/min | {gd_exit}/min | ~2 min |\n\n**⚡ AI Alert:** Gate A congestion predicted to spike **40%** at halftime based on historical patterns. Recommend opening auxiliary entrance and deploying 4 additional crowd control staff.",
      confidence: 'high',
      hasChart: false
    },
    'security': {
      text: "🛡️ **Security Status Report**\n\nAll security systems are operational:\n• **{cameras}** CCTV cameras online ({cameraPct}% coverage)\n• AI behavioral analysis: **Active** — monitoring for anomalies\n• Threat level: **{threatLevel}**\n• Last perimeter sweep: **{lastSweep}**\n\n**Active Incidents:** {incidents} currently being monitored\n**Staff Deployed:** {securityStaff} security personnel across all zones\n\n**AI Insight:** Based on crowd composition analysis, the South Stand has a higher likelihood of crowd surge during goal celebrations. Recommended to maintain 2 additional crowd barriers in standby.",
      confidence: 'high',
      hasChart: false
    },
    'weather': {
      text: "🌡️ **Weather Impact Analysis**\n\nCurrent conditions at the venue:\n• Temperature: **{temp}°C** (feels like {feelsLike}°C)\n• Humidity: **{humidity}%**\n• Wind: Light breeze, **12 km/h** NW\n\n**AI Impact Predictions:**\n1. High temperature may increase hydration station demand by **35%** — recommend activating 2 additional stations\n2. No rain expected during match window\n3. UV index high — sunscreen distribution recommended at gates\n\n**Fan Comfort Score:** 7.2/10",
      confidence: 'medium',
      hasChart: false
    },
    'match': {
      text: "⚽ **Live Match Intelligence**\n\nCurrent matches in progress:\n\n🏟️ **{team1} {score1} - {score2} {team2}**\nVenue: {venue} | Minute: {minute}'\nAttendance: {attendance}\n\n**Fan Engagement Metrics:**\n• Noise level: **{noise} dB** (above average)\n• Social media mentions: **12.4K/min**\n• Concession sales spike: **+45%** since kickoff\n\n**Upcoming:** {nextTeam1} vs {nextTeam2} at {nextVenue}",
      confidence: 'high',
      hasChart: true
    },
    'staff': {
      text: "👥 **Staff Deployment Overview**\n\n**Total Personnel:** {total}\n• Security: {security} ({securityActive} active)\n• Medical: {medical} ({medicalActive} active)\n• Volunteers: {volunteers} ({volunteersActive} active)\n• Operations: {ops} active\n\n**🤖 AI Recommendation:**\nBased on current crowd patterns and prediction models:\n1. Redeploy **3 volunteers** from Gate A (low traffic) to Gate D (predicted surge in 15 min)\n2. Stage **2 medical staff** near South Lower — high density zone\n3. Next shift handoff in **47 minutes** — pre-brief team ready\n\n**Staff Utilization Score:** 87%",
      confidence: 'high',
      hasChart: false
    },
    'navigate': {
      text: "🗺️ **Smart Navigation Assistance**\n\nI can help with directions! Here are the fastest routes:\n\n**From your location to Concession Area B:**\n📍 Route 1 (Recommended): Via Concourse A → 3 min walk\n   • Traffic: 🟢 Low | Accessibility: ♿ Yes\n📍 Route 2: Via North Gate → 5 min walk\n   • Traffic: 🟡 Medium | Accessibility: ♿ Yes\n\n**Current Wait Times Nearby:**\n• 🚻 Restroom N1: ~4 min\n• 🍔 Food Court A: ~7 min\n• 🏥 Medical Station: ~1 min\n\n**Pro Tip:** The east concourse has 60% less foot traffic right now. Consider food options near Gate B for faster service.",
      confidence: 'high',
      hasChart: false
    },
    'evacuate': {
      text: "🚨 **Evacuation Simulation Results**\n\n**Scenario:** Full venue evacuation at current occupancy ({occupancy}%)\n\n**Estimated Clearance Time:** {evacTime} minutes\n\n**Zone-by-Zone Breakdown:**\n| Zone | Occupancy | Est. Clear Time | Primary Exit |\n|------|-----------|----------------|---------------|\n| North Upper | {nuPct}% | 8.5 min | Gate A |\n| South Lower | {slPct}% | 6.2 min | Gate C |\n| East Upper | {euPct}% | 9.1 min | Gate B |\n| West Lower | {wlPct}% | 5.8 min | Gate D |\n\n**⚠️ Bottleneck Alert:** Gate A corridor may experience congestion — recommend opening emergency exits E1 and E2 for north sections.\n\n**AI Confidence:** High (based on 500+ simulation iterations)",
      confidence: 'high',
      hasChart: true
    },
    'help': {
      text: "🤖 **NEXUS AI — Smart Stadium Assistant**\n\nI'm your intelligent operations partner for FIFA World Cup 2026! Here's what I can help with:\n\n**📊 Crowd Intelligence**\n• \"Show crowd density\" — Real-time occupancy analysis\n• \"Gate flow analysis\" — Entry/exit rate monitoring\n• \"Evacuation simulation\" — Emergency scenario modeling\n\n**🛡️ Security & Operations**\n• \"Security status\" — All-systems monitoring report\n• \"Staff deployment\" — Personnel overview & AI recommendations\n• \"Show incidents\" — Active incident tracking\n\n**🗺️ Navigation & Facilities**\n• \"Navigate to [location]\" — AI-powered wayfinding\n• \"Wait times\" — Real-time facility queue estimates\n\n**⚽ Match & Weather**\n• \"Match update\" — Live scores & fan engagement\n• \"Weather impact\" — Conditions & AI predictions\n\nJust type your question naturally — I understand context! 💡",
      confidence: 'high',
      hasChart: false
    },
    'default': {
      text: "I understand you're asking about **\"{query}\"**.\n\nBased on current operational data, here's what I can tell you:\n\n• The venue is operating normally with **{occupancy}%** occupancy\n• All {cameras} security cameras are online\n• **{staffCount}** staff members currently deployed\n• No critical incidents reported in the last 30 minutes\n\nWould you like me to dig deeper into any specific area? Try asking about **crowd density**, **security**, **staff deployment**, or **navigation**.",
      confidence: 'medium',
      hasChart: false
    }
  };

  function getAIResponse(query) {
    const q = query.toLowerCase();
    let key = 'default';

    if (q.includes('crowd') || q.includes('density') || q.includes('occupancy') || q.includes('capacity')) key = 'crowd';
    else if (q.includes('gate') || q.includes('entry') || q.includes('exit') || q.includes('flow')) key = 'gate';
    else if (q.includes('security') || q.includes('camera') || q.includes('threat') || q.includes('breach')) key = 'security';
    else if (q.includes('weather') || q.includes('temperature') || q.includes('rain') || q.includes('heat')) key = 'weather';
    else if (q.includes('match') || q.includes('score') || q.includes('game') || q.includes('team')) key = 'match';
    else if (q.includes('staff') || q.includes('deploy') || q.includes('personnel') || q.includes('volunteer')) key = 'staff';
    else if (q.includes('navigate') || q.includes('direction') || q.includes('find') || q.includes('where') || q.includes('route') || q.includes('way')) key = 'navigate';
    else if (q.includes('evacuate') || q.includes('evacuation') || q.includes('emergency') || q.includes('clear')) key = 'evacuate';
    else if (q.includes('help') || q.includes('what can') || q.includes('commands') || q.includes('menu')) key = 'help';

    const template = aiResponses[key];
    const crowdData = getSimulatedCrowdData(currentVenueId);
    const iotData = getSimulatedIoTData();
    const staffData = getSimulatedStaffData();
    const matches = getSimulatedMatches();
    const currentMatch = matches.find(m => m.status === 'live') || matches[0];
    const nextMatch = matches.find(m => m.status === 'upcoming') || matches[2];

    let text = template.text
      .replace('{occupancy}', Math.round(crowdData.occupancy * 100))
      .replace('{total}', crowdData.totalCurrent.toLocaleString())
      .replace('{peakZone}', crowdData.peakZone.name)
      .replace('{peakPct}', Math.round(crowdData.peakZone.occupancy * 100))
      .replace('{entryRate}', crowdData.entryRate)
      .replace('{ga_entry}', crowdData.gateFlows[0].entry)
      .replace('{ga_exit}', crowdData.gateFlows[0].exit)
      .replace('{gb_entry}', crowdData.gateFlows[1].entry)
      .replace('{gb_exit}', crowdData.gateFlows[1].exit)
      .replace('{gc_entry}', crowdData.gateFlows[2].entry)
      .replace('{gc_exit}', crowdData.gateFlows[2].exit)
      .replace('{gd_entry}', crowdData.gateFlows[3].entry)
      .replace('{gd_exit}', crowdData.gateFlows[3].exit)
      .replace('{cameras}', iotData.security.camerasOnline)
      .replace('{cameraPct}', iotData.security.camerasOnline)
      .replace('{threatLevel}', iotData.security.alertLevel === 'elevated' ? 'Elevated ⚠️' : 'Normal ✅')
      .replace('{lastSweep}', new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      .replace('{incidents}', Math.floor(1 + Math.random() * 4))
      .replace('{securityStaff}', staffData.summary['Security']?.total || 8)
      .replace('{temp}', iotData.hvac.temperature)
      .replace('{feelsLike}', (parseFloat(iotData.hvac.temperature) + 3).toFixed(1))
      .replace('{humidity}', iotData.hvac.humidity)
      .replace('{team1}', currentMatch.team1.flag + ' ' + currentMatch.team1.name)
      .replace('{score1}', currentMatch.score1)
      .replace('{score2}', currentMatch.score2)
      .replace('{team2}', currentMatch.team2.name + ' ' + currentMatch.team2.flag)
      .replace('{venue}', currentMatch.venue.name)
      .replace('{minute}', currentMatch.minute)
      .replace('{attendance}', currentMatch.attendance?.toLocaleString() || '---')
      .replace('{noise}', Math.floor(75 + Math.random() * 20))
      .replace('{nextTeam1}', nextMatch.team1.name)
      .replace('{nextTeam2}', nextMatch.team2.name)
      .replace('{nextVenue}', nextMatch.venue.name)
      .replace('{total}', staffData.staff.length)
      .replace('{security}', staffData.summary['Security']?.total || 0)
      .replace('{securityActive}', staffData.summary['Security']?.active || 0)
      .replace('{medical}', staffData.summary['Medical']?.total || 0)
      .replace('{medicalActive}', staffData.summary['Medical']?.active || 0)
      .replace('{volunteers}', staffData.summary['Volunteer']?.total || 0)
      .replace('{volunteersActive}', staffData.summary['Volunteer']?.active || 0)
      .replace('{ops}', staffData.summary['Operations']?.total || 0)
      .replace('{staffCount}', staffData.totalDeployed)
      .replace('{query}', query)
      .replace('{evacTime}', Math.floor(12 + Math.random() * 8))
      .replace('{nuPct}', Math.round((crowdData.zones[0]?.occupancy || 0.7) * 100))
      .replace('{slPct}', Math.round((crowdData.zones[3]?.occupancy || 0.6) * 100))
      .replace('{euPct}', Math.round((crowdData.zones[4]?.occupancy || 0.8) * 100))
      .replace('{wlPct}', Math.round((crowdData.zones[7]?.occupancy || 0.5) * 100));

    return {
      text,
      confidence: template.confidence,
      hasChart: template.hasChart,
      key,
      timestamp: new Date()
    };
  }

  // ─── Multi-Language Translations ───────────────────────────
  const languages = [
    { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
    { code: 'fr', name: 'French', flag: '🇫🇷', native: 'Français' },
    { code: 'pt', name: 'Portuguese', flag: '🇧🇷', native: 'Português' },
    { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷', native: '한국어' },
    { code: 'zh', name: 'Mandarin', flag: '🇨🇳', native: '中文' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱', native: 'Nederlands' },
    { code: 'it', name: 'Italian', flag: '🇮🇹', native: 'Italiano' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷', native: 'Türkçe' }
  ];

  const translationTemplates = {
    'Welcome to the FIFA World Cup 2026! Enjoy the match.': {
      es: '¡Bienvenidos a la Copa Mundial de la FIFA 2026! Disfruten del partido.',
      fr: 'Bienvenue à la Coupe du Monde de la FIFA 2026 ! Profitez du match.',
      pt: 'Bem-vindos à Copa do Mundo FIFA 2026! Aproveitem a partida.',
      de: 'Willkommen zur FIFA Fussball-Weltmeisterschaft 2026! Genießen Sie das Spiel.',
      ar: 'مرحبًا بكم في كأس العالم FIFA 2026! استمتعوا بالمباراة.',
      ja: 'FIFA ワールドカップ 2026 へようこそ！試合をお楽しみください。',
      ko: 'FIFA 월드컵 2026에 오신 것을 환영합니다! 경기를 즐기세요.',
      zh: '欢迎来到2026年国际足联世界杯！祝您观赛愉快。',
      hi: 'फीफा विश्व कप 2026 में आपका स्वागत है! मैच का आनंद लें।',
      nl: 'Welkom bij het FIFA WK 2026! Geniet van de wedstrijd.',
      it: 'Benvenuti alla Coppa del Mondo FIFA 2026! Godetevi la partita.',
      tr: 'FIFA Dünya Kupası 2026\'ya hoş geldiniz! Maçın tadını çıkarın.'
    },
    'Emergency evacuation in progress. Please proceed to the nearest exit calmly.': {
      es: 'Evacuación de emergencia en curso. Diríjanse a la salida más cercana con calma.',
      fr: 'Évacuation d\'urgence en cours. Veuillez vous diriger calmement vers la sortie la plus proche.',
      pt: 'Evacuação de emergência em andamento. Por favor, dirija-se calmamente à saída mais próxima.',
      de: 'Notfallevakuierung läuft. Bitte begeben Sie sich ruhig zum nächsten Ausgang.',
      ar: 'جاري الإخلاء الطارئ. يرجى التوجه إلى أقرب مخرج بهدوء.',
      ja: '緊急避難が進行中です。最寄りの出口へ落ち着いて向かってください。',
      ko: '비상 대피가 진행 중입니다. 가장 가까운 출구로 침착하게 이동하세요.',
      zh: '紧急疏散正在进行中。请冷静地前往最近的出口。',
      hi: 'आपातकालीन निकासी जारी है। कृपया शांति से निकटतम निकास की ओर बढ़ें।',
      nl: 'Noodevacuatie in uitvoering. Ga alstublieft kalm naar de dichtstbijzijnde uitgang.',
      it: 'Evacuazione di emergenza in corso. Per favore, dirigetevi con calma verso l\'uscita più vicina.',
      tr: 'Acil tahliye devam ediyor. Lütfen sakin bir şekilde en yakın çıkışa ilerleyin.'
    },
    'The match has been delayed due to weather conditions. Please remain in your seats.': {
      es: 'El partido ha sido retrasado por condiciones climáticas. Permanezcan en sus asientos.',
      fr: 'Le match a été retardé en raison des conditions météorologiques. Veuillez rester à vos places.',
      pt: 'A partida foi adiada devido às condições meteorológicas. Permaneçam em seus assentos.',
      de: 'Das Spiel wurde aufgrund der Wetterbedingungen verschoben. Bitte bleiben Sie auf Ihren Plätzen.',
      ar: 'تم تأجيل المباراة بسبب الظروف الجوية. يرجى البقاء في مقاعدكم.',
      ja: '天候により試合が遅延しています。お席でお待ちください。',
      ko: '기상 상황으로 경기가 지연되었습니다. 좌석에서 대기해 주세요.',
      zh: '比赛因天气原因延迟。请留在您的座位上。',
      hi: 'मौसम की स्थिति के कारण मैच में देरी हुई है। कृपया अपनी सीटों पर बने रहें।',
      nl: 'De wedstrijd is uitgesteld vanwege weersomstandigheden. Blijf alstublieft op uw plaats.',
      it: 'La partita è stata ritardata a causa delle condizioni meteorologiche. Rimanete ai vostri posti.',
      tr: 'Hava koşulları nedeniyle maç ertelendi. Lütfen koltuklarınızda kalın.'
    },
    'Halftime break. Concession stands are open. Nearest food court is to your right.': {
      es: 'Descanso de medio tiempo. Los puestos de comida están abiertos. La zona de comida más cercana está a su derecha.',
      fr: 'Mi-temps. Les stands de restauration sont ouverts. L\'aire de restauration la plus proche est sur votre droite.',
      pt: 'Intervalo. Os pontos de alimentação estão abertos. A praça de alimentação mais próxima fica à sua direita.',
      de: 'Halbzeitpause. Die Imbissstände sind geöffnet. Der nächste Food Court befindet sich rechts von Ihnen.',
      ar: 'استراحة الشوط الأول. منافذ الطعام مفتوحة. أقرب منطقة طعام على يمينكم.',
      ja: 'ハーフタイムです。売店は営業中です。最寄りのフードコートは右手にあります。',
      ko: '하프타임 휴식입니다. 매점이 영업 중입니다. 가장 가까운 푸드코트는 오른쪽입니다.',
      zh: '中场休息。小卖部已开放。最近的美食广场在您的右边。',
      hi: 'हाफ टाइम ब्रेक। खाद्य स्टॉल खुले हैं। निकटतम फूड कोर्ट आपके दाईं ओर है।',
      nl: 'Rust. De eetstandjes zijn open. De dichtstbijzijnde eetzone is rechts van u.',
      it: 'Intervallo. I punti ristoro sono aperti. L\'area ristorazione più vicina è alla vostra destra.',
      tr: 'Devre arası. Yiyecek stantları açıktır. En yakın yemek alanı sağ tarafınızdadır.'
    },
    'Please use Gate B for faster entry. Gate A is currently experiencing high traffic.': {
      es: 'Utilicen la Puerta B para una entrada más rápida. La Puerta A tiene mucho tráfico actualmente.',
      fr: 'Veuillez utiliser la Porte B pour une entrée plus rapide. La Porte A est actuellement très fréquentée.',
      pt: 'Use o Portão B para uma entrada mais rápida. O Portão A está com alto fluxo no momento.',
      de: 'Bitte nutzen Sie Tor B für einen schnelleren Einlass. Tor A ist derzeit stark frequentiert.',
      ar: 'يرجى استخدام البوابة B للدخول الأسرع. البوابة A تشهد حاليًا ازدحامًا كبيرًا.',
      ja: 'ゲートBをご利用いただくとよりスムーズに入場できます。ゲートAは現在混雑しています。',
      ko: '더 빠른 입장을 위해 게이트 B를 이용해 주세요. 게이트 A는 현재 혼잡합니다.',
      zh: '请使用B门入场，速度更快。A门目前人流量较大。',
      hi: 'तेज़ प्रवेश के लिए गेट B का उपयोग करें। गेट A पर वर्तमान में भीड़ है।',
      nl: 'Gebruik Gate B voor snellere toegang. Gate A heeft momenteel veel drukte.',
      it: 'Usate il Gate B per un ingresso più rapido. Il Gate A ha attualmente un alto traffico.',
      tr: 'Daha hızlı giriş için B Kapısı\'nı kullanın. A Kapısı şu anda yoğun trafik yaşamaktadır.'
    }
  };

  const announcementTemplates = [
    'Welcome to the FIFA World Cup 2026! Enjoy the match.',
    'Emergency evacuation in progress. Please proceed to the nearest exit calmly.',
    'The match has been delayed due to weather conditions. Please remain in your seats.',
    'Halftime break. Concession stands are open. Nearest food court is to your right.',
    'Please use Gate B for faster entry. Gate A is currently experiencing high traffic.'
  ];

  function translateText(text, langCode) {
    // Find exact match first
    if (translationTemplates[text] && translationTemplates[text][langCode]) {
      return translationTemplates[text][langCode];
    }

    // Find closest match by checking if text starts with a template
    for (const [template, translations] of Object.entries(translationTemplates)) {
      if (text.includes(template.substring(0, 20)) && translations[langCode]) {
        return translations[langCode];
      }
    }

    // Generic fallback — simulate AI translation with character shuffling
    const chars = 'àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ';
    return text.split(' ').map(word => {
      if (Math.random() > 0.6) {
        const idx = Math.floor(Math.random() * word.length);
        const char = chars[Math.floor(Math.random() * chars.length)];
        return word.substring(0, idx) + char + word.substring(idx + 1);
      }
      return word;
    }).join(' ');
  }

  // ─── Tournament Stats ──────────────────────────────────────
  const tournamentStats = {
    totalMatches: 104,
    matchesPlayed: 38,
    totalGoals: 112,
    totalAttendance: 2847000,
    avgAttendance: 74921,
    tournamentDay: 27,
    totalDays: 39
  };

  // ─── Public API ────────────────────────────────────────────
  return {
    // Data
    venues,
    teams,
    languages,
    zoneTemplate,
    facilitiesTemplate,
    announcementTemplates,
    translationTemplates,
    tournamentStats,

    // State
    get currentVenueId() { return currentVenueId; },
    set currentVenueId(id) { currentVenueId = id; },
    getCurrentVenue() { return venues.find(v => v.id === currentVenueId) || venues[0]; },

    // Simulation Functions
    getSimulatedMatches,
    getSimulatedCrowdData,
    getSimulatedAlerts,
    getSimulatedStaffData,
    getSimulatedIncidents,
    getSimulatedFacilities,
    getSimulatedIoTData,

    // Data Generators
    generateTimeSeriesData,
    generatePredictionData,

    // AI
    getAIResponse,

    // Translation
    translateText,

    // Utilities
    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    },
    getRandomElement(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  };
})();
