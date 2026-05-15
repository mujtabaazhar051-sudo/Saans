/* =======================================================
   SAANS — Firebase Config & Auth Helpers (firebase.js)
   Include on every page that needs auth, AFTER utils.js.
   Uses Firebase CDN — no npm needed.
   ======================================================= */

// Firebase config
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCle5cJcgH_uIZC4tOoD-wTqAfghLJIOFA",
  authDomain:        "saans-3206a.firebaseapp.com",
  projectId:         "saans-3206a",
  storageBucket:     "saans-3206a.firebasestorage.app",
  messagingSenderId: "203356336705",
  appId:             "1:203356336705:web:00c8ded21431df1c8cccc0",
  measurementId:     "G-7HBVT7Y3P7"
};

// We load Firebase from CDN dynamically so every page can just
// include <script src="firebase.js"></script>
let _app, _auth, _db;
window._firebaseReady = false;
let _firebaseReady = false;
const _firebaseReadyCallbacks = [];

function onFirebaseReady(cb) {
  if (_firebaseReady) { cb(); return; }
  _firebaseReadyCallbacks.push(cb);
}

(function loadFirebase() {
  const scripts = [
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js',
  ];

  let loaded = 0;
  scripts.forEach(src => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => {
      loaded++;
      if (loaded === scripts.length) {
        _app  = firebase.initializeApp(FIREBASE_CONFIG);
        _auth = firebase.auth();
        _db   = firebase.firestore();
        _firebaseReady = true;
        window._firebaseReady = true;
        _firebaseReadyCallbacks.forEach(cb => cb());
      }
    };
    document.head.appendChild(s);
  });
})();

/* =================== AUTH HELPERS =================== */

/** Returns current user or null */
function getCurrentUser() {
  return _auth ? _auth.currentUser : null;
}

/** Sign in with Google popup */
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  return _auth.signInWithPopup(provider);
}

/** Sign in with email + password */
async function signInWithEmail(email, password) {
  return _auth.signInWithEmailAndPassword(email, password);
}

/** Create account with email + password */
async function signUpWithEmail(email, password) {
  return _auth.createUserWithEmailAndPassword(email, password);
}

/** Send password reset email */
async function sendPasswordReset(email) {
  return _auth.sendPasswordResetEmail(email);
}

/** Sign out */
async function signOut() {
  return _auth.signOut();
}

/** Listen to auth state changes */
function onAuthChange(callback) {
  onFirebaseReady(() => _auth.onAuthStateChanged(callback));
}

/* =================== FIRESTORE SYNC =================== */

/**
 * Save all localStorage quit data to Firestore for the current user.
 * Called after login and after any data change.
 */
async function syncToCloud(user) {
  if (!user || !_db) return;
  const data = {
    quitDate:      LS.get('quitDate', ''),
    cigsPerDay:    LS.get('cigsPerDay', 20),
    packPrice:     LS.get('packPrice', 600),
    cigsPerPack:   LS.get('cigsPerPack', 20),
    smokingYears:  LS.get('smokingYears', 1),
    userName:      LS.get('userName', ''),
    userCity:      LS.get('userCity', ''),
    motivation:    LS.get('motivation', ''),
    quitDecision:  LS.get('quitDecision', ''),
    triggers:      LS.get('triggers', []),
    checkins:      LS.get('checkins', {}),
    earnedBadges:  LS.get('earnedBadges', []),
    favQuotes:     LS.get('favQuotes', []),
    lang:          LS.get('lang', 'ur'),
    updatedAt:     new Date().toISOString(),
  };
  try {
    await _db.collection('users').doc(user.uid).set(data, { merge: true });
  } catch(e) {
    console.warn('Firestore sync failed:', e.message);
  }
}

/**
 * Load data from Firestore into localStorage for the current user.
 * Called right after login.
 */
async function syncFromCloud(user) {
  if (!user || !_db) return false;
  try {
    const doc = await _db.collection('users').doc(user.uid).get();
    if (!doc.exists) return false;
    const data = doc.data();
    const keys = ['quitDate','cigsPerDay','packPrice','cigsPerPack','smokingYears',
                  'userName','userCity','motivation','quitDecision','triggers',
                  'checkins','earnedBadges','favQuotes','lang'];
    keys.forEach(k => { if (data[k] !== undefined) LS.set(k, data[k]); });
    return true;
  } catch(e) {
    console.warn('Firestore load failed:', e.message);
    return false;
  }
}

/**
 * getUserProfile — returns display name, email, photo from Firebase user object
 */
function getUserProfile(user) {
  if (!user) return null;
  return {
    uid:         user.uid,
    name:        user.displayName || LS.get('userName', ''),
    email:       user.email || '',
    photo:       user.photoURL || '',
    provider:    user.providerData[0]?.providerId || 'email',
  };
}