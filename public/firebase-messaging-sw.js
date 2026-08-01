// ═══════════════════════════════════════════════════════════════
// public/firebase-messaging-sw.js — FCM Background Service Worker
//
// This service worker file MUST be placed in the /public folder
// so that it is served from the root of the domain (/firebase-messaging-sw.js).
// Firebase requires this exact location.
//
// It handles push notifications when the app tab is:
//   • Closed
//   • In the background
//   • Not focused
//
// IMPORTANT: This file cannot import from node_modules or use ES module
// syntax (import/export). Use importScripts() and compat SDK instead.
// ═══════════════════════════════════════════════════════════════

// ─── Import Firebase SDKs via CDN ────────────────────────────
// Use the compat (v8-style) scripts — required for service workers
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ─── Firebase Config ─────────────────────────────────────────
// IMPORTANT: Copy-paste your Firebase web app config values here.
// Service workers cannot access import.meta.env or process.env,
// so these values must be hardcoded in this file.
// NOTE: These values are PUBLIC identifiers and are completely safe to hardcode.

firebase.initializeApp({
  apiKey: "AIzaSyBHwO-KporteBVSkG0kPuXEkm1vQTZvNBU",
  authDomain: "swila-app.firebaseapp.com",
  projectId: "swila-app",
  storageBucket: "swila-app.firebasestorage.app",
  messagingSenderId: "248522079133",
  appId: "1:248522079133:web:d258f87af1344070184d74",
});

// ─── Get Messaging Instance ───────────────────────────────────
const messaging = firebase.messaging();

// ─── Handle Background Messages ──────────────────────────────
// This fires when a push is received and the app is NOT in the foreground.
// The browser will automatically show the notification.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);

  const { title, body } = payload.notification;

  const notificationOptions = {
    body,
    icon: '/icons/icon-192x192.png', // Optional: add a notification icon in /public/icons/
    badge: '/icons/badge-72x72.png', // Optional: small badge icon for mobile
    data: payload.data,              // Pass-through data for click handling
  };

  // Show the notification via the Service Worker API
  self.registration.showNotification(title, notificationOptions);
});

// ─── Handle Notification Click ────────────────────────────────
// When the user clicks the push notification, bring the app into focus
// or open a new tab if it's not already open.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();


  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open in a tab, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new tab
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
