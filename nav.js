/* =======================================================
   SAANS — Bottom Navigation Bar (nav.js)
   Injects a fixed bottom nav on every inner page.
   Tabs: Home · Track · Coach · More
   ======================================================= */

(function () {
  'use strict';

  // Don't inject on index or login
  const path = window.location.pathname;
  if (path.includes('index.html') || path.includes('login.html')) return;

  /* ---- Styles ---- */
  const style = document.createElement('style');
  style.textContent = `
    #saansBottomNav {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 8500;
      background: rgba(255,255,255,0.97);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-top: 1px solid #dde4de;
      display: flex;
      align-items: stretch;
      height: 60px;
      box-shadow: 0 -4px 20px rgba(0,0,0,.06);
    }
    .sbn-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      text-decoration: none;
      color: #6b7280;
      font-size: 0.62rem;
      font-weight: 600;
      font-family: 'DM Sans', sans-serif;
      cursor: pointer;
      border: none;
      background: none;
      padding: 6px 4px 8px;
      transition: color 0.2s ease;
      position: relative;
    }
    .sbn-tab:hover { color: #1a7a4a; }
    .sbn-tab.active { color: #1a7a4a; }
    .sbn-tab.active::before {
      content: "";
      position: absolute;
      top: 0; left: 20%; right: 20%;
      height: 2px;
      background: #1a7a4a;
      border-radius: 0 0 999px 999px;
    }
    .sbn-icon {
      font-size: 1.25rem;
      line-height: 1;
      transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
    }
    .sbn-tab.active .sbn-icon { transform: scale(1.15); }
    .sbn-label { line-height: 1; letter-spacing: 0.01em; }

    /* Bump page content above nav */
    body { padding-bottom: 68px !important; }

    /* More menu */
    #saansMoreMenu {
      position: fixed;
      bottom: 68px; left: 0; right: 0;
      z-index: 8400;
      background: white;
      border-top: 1px solid #dde4de;
      border-radius: 20px 20px 0 0;
      padding: 16px 20px 20px;
      display: none;
      box-shadow: 0 -8px 32px rgba(0,0,0,.12);
      animation: slideUp 0.25s ease both;
    }
    #saansMoreMenu.show { display: block; }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .smm-handle {
      width: 36px; height: 4px;
      background: #dde4de; border-radius: 999px;
      margin: 0 auto 16px;
    }
    .smm-title {
      font-size: 0.72rem; font-weight: 700;
      color: #6b7280; text-transform: uppercase;
      letter-spacing: 0.08em; font-family: 'DM Sans', sans-serif;
      margin-bottom: 12px;
    }
    .smm-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .smm-item {
      display: flex; flex-direction: column;
      align-items: center; gap: 5px;
      text-decoration: none; color: #1a1f2e;
      padding: 12px 6px;
      border-radius: 12px;
      background: #f7faf8;
      border: 1px solid #dde4de;
      transition: all 0.2s ease;
      font-family: 'DM Sans', sans-serif;
    }
    .smm-item:hover { background: #e8f5ee; border-color: #2a9d64; }
    .smm-item-icon { font-size: 1.4rem; line-height: 1; }
    .smm-item-label {
      font-size: 0.65rem; font-weight: 600;
      text-align: center; line-height: 1.2;
      color: #3d4459;
    }

    /* Backdrop */
    #saansMoreBackdrop {
      display: none;
      position: fixed; inset: 0;
      z-index: 8300;
      background: rgba(0,0,0,.3);
    }
    #saansMoreBackdrop.show { display: block; }
  `;
  document.head.appendChild(style);

  /* ---- Determine active tab ---- */
  function getActiveTab() {
    if (path.includes('tracker') || path.includes('savings') ||
        path.includes('badges')  || path.includes('health'))  return 'track';
    if (path.includes('chat'))                                  return 'coach';
    if (path.includes('breathing') || path.includes('motivation') ||
        path.includes('tips')    || path.includes('nicotine') ||
        path.includes('stories') || path.includes('about')    ||
        path.includes('helplines')|| path.includes('resources')||
        path.includes('settings'))                             return 'more';
    return 'home'; // app.html
  }

  /* ---- Label lookup ---- */
  function getLabels() {
    const isEn = document.body.classList.contains('en-mode');
    return {
      home:  isEn ? 'Home'  : 'ہوم',
      track: isEn ? 'Track' : 'ٹریک',
      coach: isEn ? 'Coach' : 'کوچ',
      more:  isEn ? 'More'  : 'مزید',
      moreTitle: isEn ? 'More Tools' : 'مزید ٹولز',
      items: isEn ? [
        { icon:'🫁', label:'Breathing',  url:'breathing.html'  },
        { icon:'💬', label:'Motivation', url:'motivation.html' },
        { icon:'💡', label:'Tips',       url:'tips.html'       },
        { icon:'🎉', label:'Stories',    url:'stories.html'    },
        { icon:'💊', label:'NRT',        url:'nicotine.html'   },
        { icon:'📞', label:'Helplines',  url:'helplines.html'  },
        { icon:'🗂️', label:'Resources',  url:'resources.html'  },
        { icon:'ℹ️',  label:'About',      url:'about.html'      },
        { icon:'🏆', label:'Leaderboard', url:'leaderboard.html' },
      ] : [
        { icon:'🫁', label:'سانس',       url:'breathing.html'  },
        { icon:'💬', label:'موٹیویشن',   url:'motivation.html' },
        { icon:'💡', label:'مشورے',      url:'tips.html'       },
        { icon:'🎉', label:'کہانیاں',    url:'stories.html'    },
        { icon:'💊', label:'نکوٹین',     url:'nicotine.html'   },
        { icon:'📞', label:'ہیلپ لائن',  url:'helplines.html'  },
        { icon:'🗂️', label:'وسائل',      url:'resources.html'  },
        { icon:'ℹ️',  label:'بارے میں',  url:'about.html'      },
        { icon:'🏆', label:'لیڈر بورڈ',   url:'leaderboard.html' },
      ],
    };
  }

  /* ---- Build nav ---- */
  const active = getActiveTab();

  const nav = document.createElement('nav');
  nav.id = 'saansBottomNav';

  function buildNav() {
    const L = getLabels();
    nav.innerHTML = `
      <a href="app.html" class="sbn-tab ${active === 'home'  ? 'active' : ''}">
        <span class="sbn-icon">🏠</span>
        <span class="sbn-label" id="sbnHome">${L.home}</span>
      </a>
      <a href="tracker.html" class="sbn-tab ${active === 'track' ? 'active' : ''}">
        <span class="sbn-icon">📅</span>
        <span class="sbn-label" id="sbnTrack">${L.track}</span>
      </a>
      <a href="chat.html" class="sbn-tab ${active === 'coach' ? 'active' : ''}">
        <span class="sbn-icon">🤖</span>
        <span class="sbn-label" id="sbnCoach">${L.coach}</span>
      </a>
      <button class="sbn-tab ${active === 'more'  ? 'active' : ''}" id="sbnMoreBtn">
        <span class="sbn-icon">⋯</span>
        <span class="sbn-label" id="sbnMore">${L.more}</span>
      </button>
    `;
  }

  /* ---- More menu ---- */
  const backdrop = document.createElement('div');
  backdrop.id = 'saansMoreBackdrop';
  backdrop.addEventListener('click', closeMore);

  const menu = document.createElement('div');
  menu.id = 'saansMoreMenu';

  function buildMore() {
    const L = getLabels();
    let itemsHtml = L.items.map(item => `
      <a href="${item.url}" class="smm-item" onclick="closeMore()">
        <span class="smm-item-icon">${item.icon}</span>
        <span class="smm-item-label">${item.label}</span>
      </a>
    `).join('');
    menu.innerHTML = `
      <div class="smm-handle"></div>
      <div class="smm-title">${L.moreTitle}</div>
      <div class="smm-grid">${itemsHtml}</div>
    `;
  }

  function openMore() {
    buildMore();
    menu.classList.add('show');
    backdrop.classList.add('show');
  }
  window.closeMore = function() {
    menu.classList.remove('show');
    backdrop.classList.remove('show');
  };

  /* ---- Append to DOM ---- */
  function init() {
    buildNav();
    document.body.appendChild(backdrop);
    document.body.appendChild(menu);
    document.body.appendChild(nav);

    // Wire up More button
    const moreBtn = document.getElementById('sbnMoreBtn');
    if (moreBtn) moreBtn.addEventListener('click', openMore);

    // Watch language changes and rebuild labels
    new MutationObserver(() => {
      buildNav();
      const moreBtn2 = document.getElementById('sbnMoreBtn');
      if (moreBtn2) moreBtn2.addEventListener('click', openMore);
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();