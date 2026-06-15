/* =======================================================
   SAANS — Push Notifications (notifications.js)
   Handles permission, subscription, and scheduling.
   ======================================================= */

const VAPID_KEY = 'BEWp_3R7DPHv8qHKPXDGBSwhEHunjx5gwF4R-o-6aTCVsKYJO-CNJC82Pvby4l1a-ANK5fN7nRpdywV-Zb-FxAo';

/* ── Ask for permission ──────────────────────────── */
async function requestNotificationPermission(lang) {
  if (!('Notification' in window)) return false;
  if (!('serviceWorker' in navigator)) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  try {
    await subscribeUserToPush();
    if (typeof showToast === 'function') {
      showToast(lang === 'en'
        ? '🔔 Notifications enabled!'
        : '🔔 اطلاعات فعال ہو گئیں!');
    }
    localStorage.setItem('notificationsEnabled', 'true');
    return true;
  } catch(e) {
    console.warn('Push subscription failed:', e);
    return false;
  }
}

/* ── Subscribe to FCM ────────────────────────────── */
async function subscribeUserToPush() {
  // Load Firebase messaging if not already loaded
  if (typeof firebase === 'undefined') return;

  const messaging = firebase.messaging();
  const token = await messaging.getToken({ vapidKey: VAPID_KEY });
  if (token) {
    localStorage.setItem('fcmToken', token);
    // Save token to Firestore if logged in
    if (typeof _db !== 'undefined' && _db) {
      const uid = localStorage.getItem('lbUid') || 'anon';
      try {
        await _db.collection('users').doc(uid).set(
          { fcmToken: token }, { merge: true }
        );
      } catch(e) {}
    }
  }
  return token;
}

/* ── Schedule local reminder (fallback for when FCM isn't available) ── */
function scheduleLocalReminder(lang) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const checkins  = JSON.parse(localStorage.getItem('checkins') || '{}');
  const today     = new Date().toISOString().slice(0,10);
  const checked   = checkins.hasOwnProperty(today);

  if (checked) return; // Already checked in today

  const hour = new Date().getHours();
  // Show reminder if it's evening (after 7pm) and no check-in yet
  if (hour >= 19) {
    new Notification(lang === 'en' ? 'Saans — Daily Check-in' : 'سانس — روزانہ چیک‑ان', {
      body:  lang === 'en'
        ? "Don't forget to log today. Your streak is counting on you! 🔥"
        : "آج کا چیک‑ان مت بھولیں۔ آپ کی سٹریک انتظار میں ہے! 🔥",
      icon:  '/Saans/icon-192.png',
      badge: '/Saans/icon-192.png',
      tag:   'saans-daily',
    });
  }
}

/* ── Check and show streak at risk warning ─────── */
function checkStreakRiskNotification(lang) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const streak  = typeof getStreak === 'function' ? getStreak() : 0;
  const checkins= JSON.parse(localStorage.getItem('checkins') || '{}');
  const today   = new Date().toISOString().slice(0,10);
  const checked = checkins.hasOwnProperty(today);
  const hour    = new Date().getHours();

  if (streak > 0 && !checked && hour >= 20) {
    new Notification(lang === 'en' ? 'Saans — Streak at Risk! 🔥' : 'سانس — سٹریک خطرے میں! 🔥', {
      body: lang === 'en'
        ? `Your ${streak}-day streak is at risk. Check in now to keep it alive!`
        : `آپ کی ${streak} دن کی سٹریک خطرے میں ہے۔ ابھی چیک‑ان کریں!`,
      icon:  '/Saans/icon-192.png',
      badge: '/Saans/icon-192.png',
      tag:   'saans-streak',
    });
  }
}

/* ── Init — called on every page load ───────────── */
function initNotifications(lang) {
  // Check every 30 mins if reminder needed
  if (Notification.permission === 'granted') {
    scheduleLocalReminder(lang);
    checkStreakRiskNotification(lang);
    setInterval(() => {
      scheduleLocalReminder(lang);
      checkStreakRiskNotification(lang);
    }, 30 * 60 * 1000);
  }
}