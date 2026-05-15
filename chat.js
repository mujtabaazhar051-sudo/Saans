/* =======================================================
   SAANS — Floating Chat Bubble (chat.js)
   Self-contained — no CSS variable dependencies.
   Include on every page AFTER utils.js.
   ======================================================= */

(function() {
  'use strict';

  // Don't inject on chat.html itself
  if (window.location.pathname.includes('chat.html')) return;

  function init() {
    const style = document.createElement('style');
    style.textContent = `
      #saansChatBubble {
        position: fixed;
        bottom: 28px;
        left: 28px;
        z-index: 9000;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      body.en-mode #saansChatBubble {
        left: auto;
        right: 28px;
        align-items: flex-end;
      }
      #saansTooltip {
        background: #1a1f2e;
        color: white;
        font-size: 12px;
        font-family: 'DM Sans', sans-serif;
        padding: 6px 12px;
        border-radius: 999px;
        white-space: nowrap;
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 0.25s ease, transform 0.25s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,.25);
        pointer-events: none;
      }
      #saansChatBubble:hover #saansTooltip {
        opacity: 1;
        transform: translateY(0);
      }
      #saansChatBubble.show-tip #saansTooltip {
        opacity: 1;
        transform: translateY(0);
      }
      #saansBubbleBtn {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #1a7a4a, #0d6e5e);
        color: white;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        box-shadow: 0 6px 20px rgba(26,122,74,.45);
        transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
        position: relative;
        text-decoration: none;
        line-height: 1;
      }
      #saansBubbleBtn:hover {
        transform: scale(1.12);
        box-shadow: 0 10px 28px rgba(26,122,74,.55);
      }
      #saansBubbleBtn:active { transform: scale(0.95); }
      #saansNotifDot {
        position: absolute;
        top: 2px; right: 2px;
        width: 13px; height: 13px;
        border-radius: 50%;
        background: #f4a12e;
        border: 2px solid white;
        display: none;
      }
      #saansBubbleBtn.has-notif #saansNotifDot { display: block; }
      @keyframes saansPulse {
        0%   { opacity: 0.8; transform: scale(1); }
        100% { opacity: 0;   transform: scale(1.6); }
      }
      #saansBubbleBtn.pulse-ring::before {
        content: "";
        position: absolute; inset: -8px;
        border-radius: 50%;
        border: 2px solid #1a7a4a;
        animation: saansPulse 2s ease-out 3;
      }
      @media (max-width: 480px) {
        #saansChatBubble { bottom: 20px; left: 16px; }
        body.en-mode #saansChatBubble { left: auto; right: 16px; }
        #saansBubbleBtn { width: 50px; height: 50px; font-size: 20px; }
      }
    `;
    document.head.appendChild(style);

    const bubble = document.createElement('div');
    bubble.id = 'saansChatBubble';

    const tooltip = document.createElement('div');
    tooltip.id = 'saansTooltip';

    const btn = document.createElement('a');
    btn.id   = 'saansBubbleBtn';
    btn.href = 'chat.html';

    const emoji = document.createTextNode('🤖');
    const notifDot = document.createElement('span');
    notifDot.id = 'saansNotifDot';

    btn.appendChild(emoji);
    btn.appendChild(notifDot);
    bubble.appendChild(tooltip);
    bubble.appendChild(btn);
    document.body.appendChild(bubble);

    function updateTooltip() {
      tooltip.textContent = document.body.classList.contains('en-mode')
        ? 'Chat with Saans Coach'
        : 'سانس کوچ سے بات کریں';
    }
    updateTooltip();

    new MutationObserver(updateTooltip).observe(document.body, {
      attributes: true, attributeFilter: ['class']
    });

    try {
      if (!localStorage.getItem('chatBubbleSeen')) {
        btn.classList.add('pulse-ring');
        bubble.classList.add('show-tip');
        localStorage.setItem('chatBubbleSeen', '1');
        setTimeout(() => bubble.classList.remove('show-tip'), 4000);
      }
      if (!localStorage.getItem('chatOpened')) btn.classList.add('has-notif');
    } catch(e) {}

    btn.addEventListener('click', function() {
      try { localStorage.setItem('chatOpened', '1'); } catch(e) {}
      btn.classList.remove('has-notif');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();