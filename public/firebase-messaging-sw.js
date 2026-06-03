// Firebase Messaging Service Worker
// 此檔案必須放在網站根目錄（與 housekeeping.html 同層）

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCFDq7PjC5j--bnHJ9SBglao4_avOCEge8",
  authDomain: "lakeshore-guest-service.firebaseapp.com",
  databaseURL: "https://lakeshore-guest-service-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lakeshore-guest-service",
  storageBucket: "lakeshore-guest-service.firebasestorage.app",
  messagingSenderId: "1026886642744",
  appId: "1:1026886642744:web:225dccc902e0a7d9e00acd"
});

const messaging = firebase.messaging();

// 處理背景推播訊息（APP 縮小或手機休眠時）
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] 收到背景推播：', payload);

  const { title, body, icon } = payload.notification || {};
  const notificationTitle = title || '🛎 新服務需求';
  const notificationOptions = {
    body: body || '有新的服務需求',
    icon: icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'hk-fcm-' + Date.now(),
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: payload.data || {},
    actions: [
      { action: 'open', title: '立即查看' },
      { action: 'dismiss', title: '稍後處理' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 點擊通知時開啟 APP
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 如果 APP 已開啟，切換到前台
      for (const client of clientList) {
        if (client.url.includes('housekeeping') && 'focus' in client) {
          return client.focus();
        }
      }
      // APP 未開啟，重新開啟
      if (clients.openWindow) {
        return clients.openWindow('./housekeeping.html');
      }
    })
  );
});
