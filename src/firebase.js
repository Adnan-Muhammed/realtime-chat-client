// ═══════════════════════════════════════════════════════════════
// src/firebase.js — Firebase Client SDK Initialization
//
// Initializes Firebase and exports a helper that:
//   1. Requests notification permission from the browser
//   2. Generates an FCM registration token using the VAPID key
//
// The token is then sent to the backend via saveFcmToken() in api.js
// to be stored on the user's document for offline push notifications.
// ═══════════════════════════════════════════════════════════════

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
 
// ─── Firebase Config ─────────────────────────────────────────
// These public config values are safe to expose in client code.
// They are pulled from your .env file (VITE_ prefix required for Vite).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton — safe to call multiple times)
const app = initializeApp(firebaseConfig);

// Get the messaging service
export const messaging = getMessaging(app);

// ─── Request Permission & Get FCM Token ──────────────────────
// Call this function after the user logs in.
// Returns the FCM token string, or null if permission was denied.
export const requestNotificationPermission = async () => {
  try {
    // Ask the browser for notification permission
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.warn('Notification permission denied by user.');
      return null;
    }

    // 1. Manually register the standard Service Worker
    const swUrl = '/firebase-messaging-sw.js';
    const registration = await navigator.serviceWorker.register(swUrl);

    // 2. Generate the FCM token using the custom registration
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log('FCM Token generated:', token);
      return token;
    } else {
      console.warn('No FCM token available. Ensure the service worker is registered.');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

// ─── Foreground Message Listener ─────────────────────────────
// When the app IS open, FCM won't show a browser notification automatically.
// Call this to handle foreground messages (e.g., show a toast instead).
// Usage: onForegroundMessage((payload) => showToast(payload.notification.body))
export const onForegroundMessage = (callback) => {
  return onMessage(messaging, callback);
};
