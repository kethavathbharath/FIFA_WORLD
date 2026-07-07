# 🏟️ NEXUS — FIFA World Cup 2026 Smart Stadium Command Center

> **GenAI-Powered Tournament Operations Platform for FIFA World Cup 2026™**

NEXUS is a fully functional, GenAI-enabled Smart Stadium Command Center built for the **FIFA World Cup 2026**. It provides a centralized real-time dashboard for stadium operations directors, emergency responders, security personnel, volunteers, and fan assistance staff to manage crowd safety, AI-driven incident response, smart indoor navigation, and multi-language communications across **all 16 host venues** in the USA, Mexico, and Canada.

🔗 **Live Demo:** [https://fifa-world-mu.vercel.app/](https://fifa-world-mu.vercel.app/)

---

## 🎯 Problem Statement Alignment

NEXUS directly addresses the FIFA World Cup 2026 Smart Stadium challenge by implementing **six core operational tracks** required by the problem statement:

### Track 1: Dynamic Crowd Management & AI Predictions
**Problem:** Managing 80,000+ fans across 16 stadiums requires real-time crowd density monitoring, predictive analytics, and automated evacuation planning.

**Solution:**
- **Interactive SVG Stadium Heatmap** ([stadium-map.js](js/stadium-map.js)): Programmatically generated vector stadium layout with 10 clickable zones. Each zone displays real-time occupancy percentage with color-coded density levels (green → yellow → orange → red).
- **AI Crowd Prediction Engine** ([crowd-analytics.js](js/crowd-analytics.js)): Chart.js dual-series line chart showing actual vs. AI-predicted crowd flow with 30-minute lookahead forecasting gate congestion before it happens.
- **Evacuation Time Simulator** ([crowd-analytics.js](js/crowd-analytics.js)): One-click pedestrian flow simulation calculating clearance times based on current zone loads, exit gate capacities, and corridor widths.
- **Gate Flow Analysis** ([crowd-analytics.js](js/crowd-analytics.js)): Horizontal bar charts comparing entry/exit throughput per gate to identify bottleneck access points.

### Track 2: Smart Indoor Navigation & Wayfinding
**Problem:** Fans need real-time guidance to navigate unfamiliar mega-stadiums, find facilities, and access wheelchair-accessible routes.

**Solution:**
- **Interactive Concourse Floor Plan** ([smart-navigation.js](js/smart-navigation.js)): SVG-based indoor map showing Points of Interest (restrooms, food courts, medical stations, merchandise stores, gates).
- **AI Pathfinding Engine** ([smart-navigation.js](js/smart-navigation.js)): Calculates optimal walking routes that avoid high-traffic congestion zones.
- **♿ Accessible Routing** ([smart-navigation.js](js/smart-navigation.js)): Dedicated toggle for step-free wheelchair and stroller navigation, highlighting ramps and elevators.
- **Live Wait Times** ([smart-navigation.js](js/smart-navigation.js)): Real-time estimated wait times for food concessions and restroom facilities.

### Track 3: Real-Time Decision Support & IoT Telemetry
**Problem:** Operations teams need unified situational awareness across Wi-Fi, power, HVAC, and security camera networks with AI-prioritized alerting.

**Solution:**
- **Command Center Dashboard** ([command-center.js](js/command-center.js)): 6 live-updating KPI cards, geographic Leaflet map tracking all 16 venues with status-coded markers, and a live match ticker.
- **IoT System Health Gauges** ([command-center.js](js/command-center.js)): 4 ECharts gauge visualizations monitoring Wi-Fi load, power grid consumption, HVAC air quality, and CCTV camera uptime percentages.
- **AI Alert Feed** ([command-center.js](js/command-center.js)): Priority-sorted operational alerts with severity badges (critical/warning/info), auto-refreshing every 10 seconds.
- **Incident Dispatch Console** ([operations.js](js/operations.js)): Tabular incident tracker with responder assignment, status management, and AI resource reallocation recommendations.

### Track 4: GenAI Conversational Assistant
**Problem:** Operations staff need instant, natural-language access to stadium data without navigating complex dashboards.

**Solution:**
- **NEXUS AI Chat Interface** ([ai-assistant.js](js/ai-assistant.js)): Full conversational UI with streaming token-by-token typing animation, confidence scores, and contextual suggestion chips.
- **Generative Inline Charts** ([ai-assistant.js](js/ai-assistant.js)): AI responses dynamically embed Chart.js sparkline visualizations directly inside chat bubbles.
- **8 Pre-Built Query Templates** ([ai-assistant.js](js/ai-assistant.js)): One-click chips for crowd density, gate flow, security status, weather impact, staff deployment, navigation, match updates, and evacuation scenarios.
- **Markdown Response Formatting** ([ai-assistant.js](js/ai-assistant.js)): AI responses support bold text, bullet lists, tables, and structured data rendering.

### Track 5: Operations & Security Dispatch
**Problem:** Security incidents, medical emergencies, and facility failures require coordinated multi-team response with AI-optimized resource allocation.

**Solution:**
- **Active Incident Log** ([operations.js](js/operations.js)): Real-time incident table tracking security, medical, and facility events with severity levels, timestamps, and assigned responder teams.
- **AI Resource Optimizer** ([operations.js](js/operations.js)): Continuously analyzes gate flows and incident patterns to suggest staff redeployments and medical team staging.
- **Responder Status Grid** ([operations.js](js/operations.js)): Visual grid showing all deployed security, medical, and maintenance teams with their current status and location.

### Track 6: Multi-Language Fan Assistance
**Problem:** FIFA 2026 welcomes fans from 48 nations speaking dozens of languages — PA announcements and fan assistance must be multilingual.

**Solution:**
- **GenAI Translation Engine** ([multi-language.js](js/multi-language.js)): Instantly translates English PA announcements into **12 languages** simultaneously (Spanish, French, Portuguese, German, Arabic, Japanese, Korean, Mandarin, Hindi, Dutch, Italian, Turkish).
- **Language Detection** ([multi-language.js](js/multi-language.js)): Paste any foreign-language text to auto-detect the source language and translate to English.
- **Pre-Built Announcement Templates** ([multi-language.js](js/multi-language.js)): One-click templates for common stadium announcements (emergency evacuations, gate changes, weather delays).

---

## 🛠️ Technology Stack

| Technology | Purpose | Version |
|---|---|---|
| **HTML5** | Semantic page structure with ARIA accessibility | HTML5 |
| **CSS3** | Custom glassmorphic design system with animations | CSS3 |
| **Vanilla JavaScript** | Modular ES5 IIFE architecture, zero frameworks | ES2015+ |
| **Leaflet.js** | Interactive geographic venue maps | 1.9.4 |
| **Chart.js** | Crowd prediction line/bar charts | 4.x |
| **Apache ECharts** | IoT telemetry gauge visualizations | 5.6.0 |
| **Animate.css** | Micro-animation transitions | 4.1.1 |
| **Jest** | Automated unit testing framework | 29.x |
| **ESLint** | Static code quality analysis | 9.x |

---

## 📦 Project Structure

```
FIFA_WORLD/
├── index.html              # Main SPA shell with semantic HTML5 and ARIA roles
├── README.md               # Project documentation and alignment matrix
├── SECURITY.md             # Security policy and vulnerability reporting
├── .eslintrc.json          # ESLint strict linting configuration
├── eslint.config.js        # ESLint flat config for ES2015+ rules
├── jest.config.js          # Jest test runner configuration
├── package.json            # Project metadata and test scripts
├── .gitignore              # Version control exclusions
├── css/
│   └── styles.css          # Glassmorphic design tokens, layouts, and animations
├── js/
│   ├── data.js             # Simulated telemetry database and AI response engine
│   ├── app.js              # SPA router, lazy loader, clock, toast notifications
│   ├── charts.js           # Shared Chart.js and ECharts factory functions
│   ├── command-center.js   # Command center dashboard, Leaflet map, alert feed
│   ├── crowd-analytics.js  # Crowd heatmaps, AI predictions, evacuation simulator
│   ├── smart-navigation.js # Indoor wayfinding, pathfinding, accessible routing
│   ├── ai-assistant.js     # GenAI conversational chat with streaming responses
│   ├── operations.js       # Incident dispatch, responder grid, AI optimizer
│   ├── multi-language.js   # 12-language translation engine and detector
│   └── stadium-map.js      # Programmatic SVG stadium zone renderer
└── tests/
    ├── data.test.js        # Data simulation algorithm unit tests
    ├── charts.test.js      # Chart configuration and color validation tests
    ├── a11y.test.js        # Accessibility attribute verification tests
    └── modules.test.js     # Full module integration and lifecycle tests
```

---

## 🚀 Getting Started

### Quick Start (No Setup Required)
```bash
# Simply open index.html in any modern browser
open index.html
```

### Local Development Server
```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx serve .
```
Then open [http://localhost:8000](http://localhost:8000).

---

## 🧪 Testing & Quality Assurance

### Automated Test Suite
```bash
# Install dependencies
npm install

# Run all unit tests
npm run test

# Run tests with coverage report
npm run test -- --coverage
```

**Current Test Results:** 4 test suites, 17 tests, all passing ✅

### Code Quality
```bash
# Run ESLint static analysis
npx eslint js/

# Result: 0 errors, 0 warnings
```

### Built-In Runtime Diagnostics
When the application loads, an automated self-test suite executes **18 integration checks** in the browser console, verifying:
- External library availability (Leaflet, ECharts, Chart.js)
- Data boundary integrity (venues, matches, teams)
- GenAI response engine readiness
- DOM element presence for all 6 modules

---

## ♿ Accessibility

NEXUS is designed for universal accessibility compliance:
- **Semantic HTML5:** `<main>`, `<nav>`, `<header>`, `<section>` landmark elements
- **ARIA Labels:** All interactive controls have descriptive `aria-label` attributes
- **Keyboard Navigation:** Full `tabindex` support and `Alt+1` through `Alt+6` keyboard shortcuts for module switching
- **Screen Reader Support:** Descriptive text alternatives for all visual elements
- **High Contrast:** Cyan-on-dark color scheme meeting WCAG AA contrast ratios

---

## 🔒 Security

- **Input Sanitization:** All user inputs (chat messages, translations) are HTML-escaped before DOM insertion to prevent XSS
- **Content Security:** No inline `eval()`, no dynamic script injection from user input
- **Vulnerability Reporting:** See [SECURITY.md](SECURITY.md) for responsible disclosure policy

---

## 📄 License

This project was built for the **Hack2Skill FIFA World Cup 2026 Smart Stadium Challenge**.

---

## 🎯 Challenge Tracks Alignment Matrix

| Evaluation Focus Area | Target Objective | Implementation |
|---|---|---|
| **Dynamic Crowd Management** | Crowd flow modeling and ingress predictions | Live vector heatmap sectors ([stadium-map.js](js/stadium-map.js)), Chart.js prediction curves forecasting gate queues, and Evacuation Simulations ([crowd-analytics.js](js/crowd-analytics.js)). |
| **Smart Indoor Navigation** | Contextual wayfinding and facility indexing | Pathfinding coordinate connectors, live wait-time lists, and step-free wheelchair routing ([smart-navigation.js](js/smart-navigation.js)). |
| **Real-time Decision Support** | Threat telemetry tracking and staff resource optimization | Wi-Fi/Power/HVAC IoT gauges, Leaflet maps tracking 16 venues ([command-center.js](js/command-center.js)), active responder dispatch logs, and AI personnel reallocators ([operations.js](js/operations.js)). |
| **Multi-language Assistance** | Simultaneous broadcast translations | Staged translation cards spanning 12 global languages ([multi-language.js](js/multi-language.js)) and a contextual conversational GenAI Assistant ([ai-assistant.js](js/ai-assistant.js)). |
| **Security Standards** | Safe code architecture and sanitization | HTML sanitizers on toast alerts ([app.js](js/app.js)) and XSS input validation on chatbot chat bubbles ([ai-assistant.js](js/ai-assistant.js#L181-188)). |
| **Universal Accessibility** | Inclusive layout usability | Full ARIA roles, tabindex focuses, screen-reader text, and global hotkeys ([index.html](index.html)). |
