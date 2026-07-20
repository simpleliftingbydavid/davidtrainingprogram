// ============================================================
// DAVID TRAINING PROGRAM — Firebase bootstrap
// ============================================================
// Single source of truth for the Firebase config + app/auth/db
// instances. Every training-app page imports {auth, db} from here
// rather than initializing Firebase itself.
//
// Loaded via the CDN modular SDK (ES modules) — no npm/build step.
// IMPORTANT: ES module imports are blocked on file://. Pages that
// import this module must be served over http:// (see serve.ps1 /
// the "david-coaching" launch.json config, http://localhost:8090/).
//
// This config object is NOT a secret — it's meant to be public in
// client code. Real access control is enforced entirely by the
// Firestore Security Rules published in the Firebase Console (see the
// plan file's "Security rules" section), not by hiding these values.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

// TODO(Firebase setup): replace with the real config from
// Firebase Console -> Project settings -> Your apps -> Web app.
// Until this is filled in, every page that imports this module will
// throw on load (see the guard below) rather than fail silently.
const firebaseConfig = {
  apiKey: 'AIzaSyDlTefizZQFNI_0RrYxYSnJb-KaDt6lQMI',
  authDomain: 'david-training-program.firebaseapp.com',
  projectId: 'david-training-program',
  storageBucket: 'david-training-program.firebasestorage.app',
  messagingSenderId: '180076967136',
  appId: '1:180076967136:web:0a41efede57d805ed1cc85',
};

const isConfigured = !Object.values(firebaseConfig).some((v) => String(v).includes('REPLACE_ME'));

if (!isConfigured) {
  // Fail loud and early with a Vietnamese message the coach will
  // actually see on screen, instead of a cryptic Firebase SDK error.
  document.addEventListener('DOMContentLoaded', () => {
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#14213d;color:#fff;' +
      'display:flex;align-items:center;justify-content:center;padding:32px;text-align:center;' +
      'font-family:sans-serif;font-size:1rem;line-height:1.6;';
    banner.textContent = 'Chưa cấu hình Firebase. Dán firebaseConfig thật vào assets/js/firebase-init.js rồi tải lại trang.';
    document.body.appendChild(banner);
  });
  throw new Error('firebase-init.js: firebaseConfig is still a placeholder. See TODO comment in this file.');
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
