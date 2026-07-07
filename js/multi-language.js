/**
 * @file multi-language.js
 * @description NEXUS Translation Hub — GenAI-powered simultaneous translation engine
 * supporting 12 languages, language detection, and pre-built PA announcement templates.
 * @module MultiLanguage
 */

const MultiLanguage = (() => {
  'use strict';

  let currentAnnouncement = "Welcome to the FIFA World Cup 2026! Enjoy the match.";
  let isTranslating = false;

  function init() {
    const container = document.getElementById('page-multi-language');
    if (!container) {return;}

    render(container);
    renderTranslations();
    bindEvents();
  }

  function destroy() {
    isTranslating = false;
  }

  function render(container) {
    const templates = NexusData.announcementTemplates;

    container.innerHTML = `
      <!-- Announcement Input Area -->
      <div class="glass-panel announcement-input-area animate__animated animate__fadeIn mb-lg">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">📢 Smart Announcement Broadcaster</h3>
            <p class="panel-subtitle">Enter announcements in English to translate and broadcast across all stadium PA & digital signage systems</p>
          </div>
        </div>

        <div class="announcement-templates">
          <span style="font-size:0.75rem; color:var(--text-secondary); align-self:center;" class="font-mono">TEMPLATES:</span>
          ${templates.map((t, idx) => `<button class="template-chip" data-idx="${idx}" aria-label="Load template: ${t.substring(0, 30)}">${t.substring(0, 30)}...</button>`).join('')}
        </div>

        <textarea id="announcement-input" class="announcement-textarea" placeholder="Type announcement message in English here..." aria-label="Announcement message text in English">${currentAnnouncement}</textarea>
        
        <div class="flex justify-between items-center mt-md">
          <button class="translate-btn" id="btn-translate-submit" aria-label="Translate and stage announcement for broadcast">
            🤖 Translate & Stage for Broadcast
          </button>
          <div class="status-badge warning hidden" id="translation-loader" style="padding: 10px 16px;">
            <span class="live-dot"></span> AI Translation Model Running...
          </div>
        </div>
      </div>

      <!-- Bento Grid -->
      <div class="bento-grid">
        <!-- Translation Grid -->
        <div class="glass-panel col-12 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">🌐 GenAI Live Translation Feeds (12 Languages)</h3>
              <p class="panel-subtitle">Simultaneous translation outputs matched against official FIFA match day phrase dictionaries</p>
            </div>
          </div>
          <div class="translation-grid" id="language-translation-cards">
            <!-- Loaded dynamically -->
          </div>
        </div>

        <!-- Language Detector Simulator -->
        <div class="glass-panel col-6 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">🔍 AI Language Detector</h3>
              <p class="panel-subtitle">Paste foreign text to identify language and translate to English</p>
            </div>
          </div>
          <div class="flex-col gap-md">
            <input type="text" id="detector-input" class="announcement-textarea" style="min-height:50px;" placeholder="Paste text here... (e.g. 'Bienvenidos al estadio')" aria-label="Paste foreign language text to identify" />
            <button class="panel-action-btn active" id="btn-detect-lang" style="padding: 10px; font-weight:600;" aria-label="Identify language and translate to English">Identify Language</button>
            <div id="detector-result" class="bg-cyan-dim hidden" style="padding:16px; border-radius:8px; border:1.5px dashed var(--cyan); font-size:0.8rem;">
              <!-- Result rendered here -->
            </div>
          </div>
        </div>

        <!-- Phrase Book Quick Reference -->
        <div class="glass-panel col-6 animate__animated animate__fadeIn">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">📖 Phrase Book Quick-Reference</h3>
              <p class="panel-subtitle">Essential stadium operations sentences translated into tournament host languages</p>
            </div>
          </div>
          <div class="phrasebook-grid">
            <div class="phrase-card">
              <div class="phrase-original">Where is the nearest medical unit?</div>
              <div class="phrase-translated">¿Dónde está la unidad médica más cercana?</div>
              <div class="phrase-lang">Spanish &bull; 🇲🇽</div>
            </div>
            <div class="phrase-card">
              <div class="phrase-original">Please show your ticket barrier code.</div>
              <div class="phrase-translated">Veuillez présenter le code de votre billet.</div>
              <div class="phrase-lang">French &bull; 🇨🇦</div>
            </div>
            <div class="phrase-card">
              <div class="phrase-original">Keep the corridor pathway clear.</div>
              <div class="phrase-translated">Mantenga despejado el pasillo.</div>
              <div class="phrase-lang">Spanish &bull; 🇺🇸</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    // Template chips
    document.querySelectorAll('.template-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const idx = chip.dataset.idx;
        const text = NexusData.announcementTemplates[idx];
        document.getElementById('announcement-input').value = text;
        currentAnnouncement = text;
        renderTranslations();
      });
    });

    // Translate submit button
    const submitBtn = document.getElementById('btn-translate-submit');
    const loader = document.getElementById('translation-loader');
    
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        if (isTranslating) {return;}

        const text = document.getElementById('announcement-input').value.trim();
        if (!text) {return;}

        currentAnnouncement = text;
        isTranslating = true;
        loader.classList.remove('hidden');
        submitBtn.disabled = true;

        setTimeout(() => {
          loader.classList.add('hidden');
          submitBtn.disabled = false;
          isTranslating = false;
          renderTranslations(true); // Stream on submit
          NexusApp.showToast('success', 'Translation Complete', 'AI translated staging values staged for audio broadcast.');
        }, 1500);
      });
    }

    // Language detector
    const detectBtn = document.getElementById('btn-detect-lang');
    if (detectBtn) {
      detectBtn.addEventListener('click', () => {
        const input = document.getElementById('detector-input').value.trim();
        const resultDiv = document.getElementById('detector-result');
        if (!input) {return;}

        // Basic mock logic for detection
        let detectedLang = "Spanish (es)";
        let detectedFlag = "🇲🇽";
        let englishTranslation = "Welcome to the stadium, please follow the arrows.";

        if (input.toLowerCase().includes('bienvenidos') || input.toLowerCase().includes('gracias') || input.toLowerCase().includes('dónde')) {
          detectedLang = "Spanish";
          detectedFlag = "🇪🇸";
          englishTranslation = "Welcome / Thank you / Where is...";
        } else if (input.toLowerCase().includes('bienvenue') || input.toLowerCase().includes('merci')) {
          detectedLang = "French";
          detectedFlag = "🇫🇷";
          englishTranslation = "Welcome / Thank you";
        } else if (input.toLowerCase().includes('wilkommen') || input.toLowerCase().includes('danke')) {
          detectedLang = "German";
          detectedFlag = "🇩🇪";
          englishTranslation = "Welcome / Thank you";
        } else {
          detectedLang = "Detected Language (Simulated)";
          detectedFlag = "🌐";
          englishTranslation = "Translating text input into English command lines...";
        }

        resultDiv.classList.remove('hidden');
        resultDiv.innerHTML = `
          <div class="flex items-center gap-sm mb-sm">
            <span style="font-size:1.3rem;">${detectedFlag}</span>
            <span style="font-weight:700; color:var(--text-primary);">Language Identified: ${detectedLang}</span>
          </div>
          <div style="color:var(--text-secondary);">English Translation: <strong>${englishTranslation}</strong></div>
        `;
      });
    }
  }

  // ─── Render Language Cards ─────────────────────────────────
  function renderTranslations(stream = false) {
    const grid = document.getElementById('language-translation-cards');
    if (!grid) {return;}

    grid.innerHTML = '';

    const languages = NexusData.languages;

    languages.forEach((lang, idx) => {
      const card = document.createElement('div');
      card.className = 'translation-card';
      
      const cardId = `lang-card-text-${lang.code}`;
      
      card.innerHTML = `
        <div class="translation-card-header">
          <div class="translation-lang">
            <span class="lang-flag">${lang.flag}</span>
            <div>
              <div class="lang-name">${lang.native}</div>
              <div class="text-muted" style="font-size:0.65rem;">${lang.name}</div>
            </div>
          </div>
          <span class="status-badge active" style="font-size:0.6rem;">READY</span>
        </div>
        <div class="translation-text" id="${cardId}"></div>
        <div class="translation-actions">
          <button class="translation-btn" onclick="MultiLanguage.copyText('${cardId}')">📋 Copy</button>
          <button class="translation-btn broadcast" onclick="MultiLanguage.broadcastText('${lang.name}', '${cardId}')">🔊 PA Broadcast</button>
        </div>
      `;

      grid.appendChild(card);

      const targetTextEl = document.getElementById(cardId);
      const translated = NexusData.translateText(currentAnnouncement, lang.code);

      if (stream) {
        // Stream translation typing animation
        typeText(targetTextEl, translated, 15 + idx * 2);
      } else {
        targetTextEl.textContent = translated;
      }
    });
  }

  // Simple typing effect
  function typeText(element, text, speed) {
    element.textContent = '';
    let i = 0;
    
    const cursor = document.createElement('span');
    cursor.className = 'ai-cursor';
    element.appendChild(cursor);

    function type() {
      if (i < text.length) {
        element.insertBefore(document.createTextNode(text.charAt(i)), cursor);
        i++;
        setTimeout(type, speed);
      } else {
        cursor.remove();
      }
    }
    type();
  }

  // Allow global callback for actions
  window.MultiLanguage = {
    copyText: (id) => {
      const el = document.getElementById(id);
      if (el) {
        navigator.clipboard.writeText(el.textContent).catch(() => {});
        NexusApp.showToast('success', 'Copied', 'Translation text copied to clipboard.');
      }
    },
    broadcastText: (langName, id) => {
      const el = document.getElementById(id);
      if (el) {
        NexusApp.showToast('info', 'PA Broadcast Activated', `Broadcasting announcement in ${langName}: "${el.textContent.substring(0, 30)}..."`);
      }
    }
  };

  return { init, destroy };
})();

window.MultiLanguage = MultiLanguage;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MultiLanguage;
}
