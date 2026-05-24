/* =======================================================
   SAANS — Shared Utilities (utils.js)
   Include on every page AFTER styles.css.
   Provides: LS, date helpers, getDaysSinceQuit, getSavings,
   getStreak, showToast, initNavScroll, initReveal, initLang.
   ======================================================= */

/* =================== LOCAL STORAGE HELPER =================== */
const LS = {
  get(key, defaultVal = null) {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : defaultVal;
    } catch { return defaultVal; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch {}
  }
};

/* =================== DATE HELPERS =================== */

/** Returns today's date as "YYYY-MM-DD" */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Difference in whole days between two Date objects (b - a) */
function daysBetween(a, b) {
  return Math.floor((b - a) / 86400000);
}

/** Returns a Date object from a "YYYY-MM-DD" string at midnight local time */
function parseLocalDate(iso) {
  return new Date(iso + 'T00:00:00');
}

/* =================== QUIT DATA HELPERS =================== */

/**
 * Returns number of days since quit date, or 0 if not set.
 * Uses LS key: 'quitDate'
 */
function getDaysSinceQuit() {
  const qd = LS.get('quitDate', '');
  if (!qd) return 0;
  return Math.max(0, daysBetween(parseLocalDate(qd), new Date()));
}

/**
 * Returns PKR saved since quit date.
 * Uses LS keys: quitDate, cigsPerDay (default 20),
 *               packPrice (default 600 PKR), cigsPerPack (default 20)
 */
function getSavings() {
  const days = getDaysSinceQuit();
  const cpd  = LS.get('cigsPerDay',  20);
  const pp   = LS.get('packPrice',  600);
  const cpp  = LS.get('cigsPerPack', 20);
  const costPerCig = pp / cpp;
  return Math.round(days * cpd * costPerCig);
}

/**
 * Returns current consecutive daily check-in streak.
 * Uses LS key: 'checkins' — object of { "YYYY-MM-DD": true/false }
 */
function getStreak() {
  const checkins = LS.get('checkins', {});
  let streak = 0;
  const cur = new Date();
  for (;;) {
    const iso = cur.toISOString().slice(0, 10);
    if (checkins[iso]) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Returns number of cigarettes not smoked since quit date.
 */
function getCigsAvoided() {
  const days = getDaysSinceQuit();
  const cpd  = LS.get('cigsPerDay', 20);
  return days * cpd;
}

/* =================== TOAST =================== */

/** Injects a toast container once, then reuses it. */
let _toastEl = null;
function _ensureToast() {
  if (!_toastEl) {
    _toastEl = document.createElement('div');
    _toastEl.className = 'toast';
    document.body.appendChild(_toastEl);
  }
  return _toastEl;
}

/**
 * showToast(message, duration?)
 * Shows a brief notification at the bottom of the screen.
 * duration defaults to 2500ms.
 */
function showToast(message, duration = 2500) {
  const el = _ensureToast();
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), duration);
}

/* =================== NAV SCROLL =================== */

/**
 * initNavScroll(navId?)
 * Adds .scrolled class to the nav when page scrolls > 30px.
 * navId defaults to 'mainNav'.
 */
function initNavScroll(navId = 'mainNav') {
  const nav = document.getElementById(navId);
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* =================== REVEAL ON SCROLL =================== */

/**
 * initReveal()
 * Observes all .reveal elements and adds .visible when they enter the viewport.
 * Also adds .visible immediately on DOMContentLoaded as a fallback.
 */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });

  els.forEach(el => obs.observe(el));

  // Fallback: if already in viewport on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () =>
      els.forEach(el => el.classList.add('visible'))
    );
  } else {
    els.forEach(el => el.classList.add('visible'));
  }
}

/* =================== LANGUAGE SYSTEM =================== */

/**
 * initLang(applyFn)
 * Wires up the language toggle buttons (#btn-ur, #btn-en).
 * applyFn(lang) is your page-level function that sets all text.
 * Reads/writes 'lang' to localStorage.
 * Defaults to 'ur' if nothing is saved.
 *
 * Usage in each page:
 *   initLang(function(lang) {
 *     // set document direction, body class, all text IDs
 *   });
 */
function initLang(applyFn) {
  const saved = LS.get('lang', 'ur');

  function apply(lang) {
    LS.set('lang', lang);
    document.documentElement.setAttribute('dir',  lang === 'ur' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    document.body.classList.toggle('en-mode', lang === 'en');

    const btnUr = document.getElementById('btn-ur');
    const btnEn = document.getElementById('btn-en');
    if (btnUr) btnUr.classList.toggle('active', lang === 'ur');
    if (btnEn) btnEn.classList.toggle('active', lang === 'en');

    applyFn(lang);
  }

  const btnUr = document.getElementById('btn-ur');
  const btnEn = document.getElementById('btn-en');
  if (btnUr) btnUr.addEventListener('click', () => apply('ur'));
  if (btnEn) btnEn.addEventListener('click', () => apply('en'));

  // Apply on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => apply(saved));
  } else {
    apply(saved);
  }
}

/* =================== COUNTER ANIMATION =================== */

/**
 * animateCounter(id, target, suffix, steps)
 * Animates a number counting up from 0 to target.
 */
function animateCounter(id, target, suffix = '', steps = 40) {
  const el = document.getElementById(id);
  if (!el) return;
  let count = 0;
  const inc = target / steps;
  const timer = setInterval(() => {
    count += inc;
    if (count >= target) {
      el.textContent = target.toLocaleString() + suffix;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(count).toLocaleString() + suffix;
    }
  }, 40);
}

/* =================== WHATSAPP SHARE =================== */

/**
 * buildShareMessage(lang, context)
 * Builds a personalised WhatsApp message.
 * context: 'app' | 'badges' | 'savings' | 'tracker'
 */
function buildShareMessage(lang, context) {
  const name    = LS.get('userName', '');
  const days    = getDaysSinceQuit();
  const streak  = getStreak();
  const savings = getSavings();
  const cigs    = getCigsAvoided();
  const badges  = (LS.get('earnedBadges', []) || []).length;
  const siteUrl = 'https://mujtabaazhar051-sudo.github.io/Saans';
  if (lang === 'ur') {
    const greeting = name ? `میں ${name} ہوں اور` : 'میں';
    const msgs = {
      app: `🌿 *سانس — میری پیش رفت*\n\n${greeting} سگریٹ چھوڑنے کا سفر شروع کر چکا ہوں!\n\n📅 *${days} دن* سگریٹ فری\n🔥 *${streak} دن* کی سٹریک\n💰 *PKR ${savings.toLocaleString()}* بچائے\n🚬 *${cigs.toLocaleString()}* سگریٹ نہیں پیے\n🏅 *${badges}* بیجز حاصل کیے\n\nآپ بھی شروع کریں 👇\n${siteUrl}`,
      badges: `🏅 *سانس — بیجز*\n\n${greeting} آج تک *${badges} بیجز* حاصل کر چکا ہوں!\n\n📅 ${days} دن سگریٹ فری\n🔥 ${streak} دن کی سٹریک\n\nآپ بھی یہ سفر شروع کریں 👇\n${siteUrl}`,
      savings: `💰 *سانس — بچت*\n\n${greeting} سگریٹ چھوڑ کر *PKR ${savings.toLocaleString()}* بچا چکا ہوں!\n\n📅 ${days} دن سگریٹ فری\n🚬 ${cigs.toLocaleString()} سگریٹ نہیں پیے\n\nآپ بھی شروع کریں 👇\n${siteUrl}`,
      tracker: `🔥 *سانس — سٹریک*\n\n${greeting} *${streak} دن* لگاتار سگریٹ فری ہوں!\n\n📅 مجموعی ${days} دن\n💰 PKR ${savings.toLocaleString()} بچائے\n\nآپ بھی یہ سفر شروع کریں 👇\n${siteUrl}`,
    };
    return msgs[context] || msgs.app;
  } else {
    const greeting = name ? `I'm ${name} and I've` : "I've";
    const msgs = {
      app: `🌿 *Saans — My Progress*\n\n${greeting} started my quit-smoking journey!\n\n📅 *${days} days* smoke-free\n🔥 *${streak}-day* streak\n💰 *PKR ${savings.toLocaleString()}* saved\n🚬 *${cigs.toLocaleString()}* cigarettes avoided\n🏅 *${badges}* badges earned\n\nJoin me 👇\n${siteUrl}`,
      badges: `🏅 *Saans — Badges*\n\nI've earned *${badges} badges* on my quit-smoking journey!\n\n📅 ${days} days smoke-free\n🔥 ${streak}-day streak\n\nStart your journey 👇\n${siteUrl}`,
      savings: `💰 *Saans — Savings*\n\nI've saved *PKR ${savings.toLocaleString()}* by quitting smoking!\n\n📅 ${days} days smoke-free\n🚬 ${cigs.toLocaleString()} cigarettes avoided\n\nStart yours 👇\n${siteUrl}`,
      tracker: `🔥 *Saans — Streak*\n\nI'm on a *${streak}-day* smoke-free streak!\n\n📅 ${days} total days\n💰 PKR ${savings.toLocaleString()} saved\n\nJoin the journey 👇\n${siteUrl}`,
    };
    return msgs[context] || msgs.app;
  }
}

/**
 * shareOnWhatsApp(lang, context)
 * Opens WhatsApp with a pre-written message.
 */
function shareOnWhatsApp(lang, context) {
  const message = buildShareMessage(lang, context);
  const encoded = encodeURIComponent(message);
  const url     = `https://wa.me/?text=${encoded}`;
  window.open(url, '_blank');
}