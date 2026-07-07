/* ============================================================
   NEXUS AI Assistant — Conversational Operations Agent
   ============================================================ */

const AIAssistant = (() => {
  'use strict';

  let messagesContainer = null;
  let isTyping = false;
  let chartIndex = 0;

  function init() {
    const container = document.getElementById('page-ai-assistant');
    if (!container) return;

    render(container);
    messagesContainer = document.getElementById('chat-messages');

    // Add first message on load
    addMessage('ai', "Welcome to NEXUS AI Operations Command Assistant. 🤖\n\nI am connected to all in-stadium IoT systems, crowd density cameras, security telemetry feeds, and staff channels for the **FIFA World Cup 2026**.\n\nHow can I support venue operations today?");

    bindEvents();
  }

  function destroy() {
    messagesContainer = null;
    isTyping = false;
  }

  function render(container) {
    container.innerHTML = `
      <div class="glass-panel ai-chat-container animate__animated animate__fadeIn">
        <!-- Chat Header -->
        <div class="ai-chat-header">
          <div class="flex items-center gap-md">
            <div class="ai-avatar">🤖</div>
            <div class="ai-info">
              <h3>NEXUS AI</h3>
              <span><span class="status-dot"></span> Active Operations Assistant</span>
            </div>
          </div>
          <div class="text-secondary font-mono" style="font-size:0.7rem; text-align:right;">
            MODEL: GEMINI 2.5 FLASH<br/>
            VERSION: 2.0.4-STADIUM-SCALE
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="chat-messages" id="chat-messages"></div>

        <!-- Chat Input Area -->
        <div class="chat-input-area">
          <div class="chat-suggestions">
            <button class="suggestion-chip">Show crowd density</button>
            <button class="suggestion-chip">Gate flow analysis</button>
            <button class="suggestion-chip">Security status</button>
            <button class="suggestion-chip">Weather impact</button>
            <button class="suggestion-chip">Staff deployment</button>
            <button class="suggestion-chip">Match update</button>
            <button class="suggestion-chip">Evacuation simulation</button>
          </div>
          
          <div class="chat-input-wrapper">
            <input type="text" id="chat-user-input" class="chat-input" placeholder="Query crowd density, gate bottlenecks, or ask for operational recommendations..." aria-label="Type operational query for NEXUS AI" />
            <button class="chat-send-btn" id="chat-send-btn" aria-label="Send query">➔</button>
          </div>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    const sendBtn = document.getElementById('chat-send-btn');
    const input = document.getElementById('chat-user-input');

    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => sendMessage());
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          sendMessage();
        }
      });
    }

    // Chips click binding
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (isTyping) return;
        input.value = chip.textContent;
        sendMessage();
      });
    });
  }

  function sendMessage() {
    if (isTyping) return;
    
    const input = document.getElementById('chat-user-input');
    const query = input.value.trim();
    if (!query) return;

    // Add user bubble
    addMessage('user', query);
    input.value = '';

    // Simulate AI response processing
    showTypingIndicator();
    
    setTimeout(() => {
      hideTypingIndicator();
      const response = NexusData.getAIResponse(query);
      addMessage('ai', response.text, response);
    }, 1000 + Math.random() * 800);
  }

  function showTypingIndicator() {
    isTyping = true;
    const indicator = document.createElement('div');
    indicator.className = 'chat-msg ai animate__animated animate__fadeIn';
    indicator.id = 'chat-typing-indicator';
    indicator.innerHTML = `
      <div class="chat-msg-avatar">🤖</div>
      <div class="chat-msg-bubble">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(indicator);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    const indicator = document.getElementById('chat-typing-indicator');
    if (indicator) indicator.remove();
    isTyping = false;
  }

  function addMessage(role, content, responseData = null) {
    if (!messagesContainer) return;

    const msg = document.createElement('div');
    msg.className = `chat-msg ${role} animate__animated animate__fadeInUp`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const avatar = role === 'ai' ? '🤖' : '👤';

    msg.innerHTML = `
      <div class="chat-msg-avatar">${avatar}</div>
      <div class="chat-msg-bubble">
        <div class="chat-msg-text" id="msg-text-${Date.now()}"></div>
        ${role === 'ai' && responseData ? `
          <div class="ai-confidence ${responseData.confidence}">
            Confidence: ${responseData.confidence.toUpperCase()}
          </div>
        ` : ''}
        <div class="chat-msg-time">${time}</div>
      </div>
    `;

    messagesContainer.appendChild(msg);
    scrollToBottom();

    const textEl = msg.querySelector('.chat-msg-text');
    
    if (role === 'ai') {
      typeEffect(textEl, formatResponse(content)).then(() => {
        // If response requires an inline chart
        if (responseData && responseData.hasChart) {
          renderInlineChart(textEl.parentElement, responseData.key);
        }
        scrollToBottom();
      });
    } else {
      textEl.innerHTML = formatResponse(content);
    }
  }

  function formatResponse(text) {
    // Escape HTML tags to prevent XSS
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Basic Markdown parser for HTML safe tags
    let formatted = escaped
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="font-mono" style="background:rgba(255,255,255,0.06); padding:2px 4px; border-radius:4px;">$1</code>')
      .replace(/\n/g, '<br/>');

    // Parse bullet points
    formatted = formatted.replace(/(?:^|<br\/>)[•-]\s(.*?)(?=$|<br\/>)/g, '<li style="margin-left:20px; list-style-type:square;">$1</li>');

    // Parse tables
    if (formatted.includes('|')) {
      const lines = formatted.split('<br/>');
      let tableHtml = '<table class="data-table" style="margin-top: 10px; margin-bottom: 10px;">';
      let inTable = false;

      lines.forEach(line => {
        if (line.includes('|')) {
          const cells = line.split('|').map(c => c.trim()).filter(c => c !== '');
          if (cells.length > 0 && !cells[0].includes('---')) {
            inTable = true;
            tableHtml += '<tr>' + cells.map(c => `<td style="padding:6px; border:1px solid rgba(255,255,255,0.05);">${c}</td>`).join('') + '</tr>';
          }
        }
      });
      tableHtml += '</table>';
      
      // Remove raw table lines and insert tableHtml
      formatted = formatted.replace(/\|[\s\S]*?\|/g, '');
      formatted += tableHtml;
    }

    return formatted;
  }

  async function typeEffect(element, htmlContent, speed = 20) {
    // Process HTML formatting tags instead of printing raw codes
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const cursor = document.createElement('span');
    cursor.className = 'ai-cursor';
    element.appendChild(cursor);

    // Stream elements/text nodes recursively
    await streamNodes(tempDiv, element, cursor, speed);
    
    cursor.remove();
  }

  async function streamNodes(sourceNode, targetNode, cursor, speed) {
    for (const child of sourceNode.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        // Stream text char-by-char
        for (let i = 0; i < child.nodeValue.length; i++) {
          const charNode = document.createTextNode(child.nodeValue.charAt(i));
          targetNode.insertBefore(charNode, cursor);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
          await new Promise(r => setTimeout(r, speed + Math.random() * 15));
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        // Clone element node, insert it before cursor, and recursively stream inside it
        const elementClone = child.cloneNode(false);
        targetNode.insertBefore(elementClone, cursor);
        await streamNodes(child, elementClone, cursor, speed);
      }
    }
  }

  function renderInlineChart(parentBubble, key) {
    chartIndex++;
    const canvasId = `ai-inline-chart-${chartIndex}`;
    
    const chartDiv = document.createElement('div');
    chartDiv.className = 'chat-inline-chart';
    chartDiv.innerHTML = `<canvas id="${canvasId}"></canvas>`;
    parentBubble.insertBefore(chartDiv, parentBubble.querySelector('.chat-msg-time'));

    const colors = NexusCharts.colors;

    if (key === 'crowd' || key === 'evacuate') {
      // Line Chart for crowd trend / evac decay curve
      NexusCharts.createLineChart(canvasId, ['T-30m', 'T-20m', 'T-10m', 'Now', 'T+10m', 'T+20m', 'T+30m'], [
        {
          label: 'Load Capacity %',
          data: [52, 60, 68, 74, 82, 85, 87],
          borderColor: colors.cyan,
          backgroundColor: colors.cyanFill,
          fill: true
        }
      ], {
        plugins: { legend: { display: false } }
      });
    } else if (key === 'match') {
      // Polar area chart for match noise levels
      new Chart(document.getElementById(canvasId).getContext('2d'), {
        type: 'polarArea',
        data: {
          labels: ['South Stand', 'North Stand', 'East concourse', 'VIP Suites'],
          datasets: [{
            data: [92, 84, 68, 55],
            backgroundColor: [colors.pinkDim, colors.cyanDim, colors.greenDim, colors.goldDim],
            borderColor: 'rgba(255,255,255,0.1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            r: {
              grid: { color: colors.gridLine },
              angleLines: { color: colors.gridLine },
              ticks: { display: false }
            }
          }
        }
      });
    }
  }

  function scrollToBottom() {
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  return { init, destroy };
})();
