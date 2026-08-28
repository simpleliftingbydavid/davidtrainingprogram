/* global firebase */
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDgqXEHn9AF1Wy80eWWcWjyh8BOQdm1lAM',
  authDomain: 'david-training-program.firebaseapp.com',
  projectId: 'david-training-program',
  storageBucket: 'david-training-program.firebasestorage.app',
  messagingSenderId: '180076967136',
  appId: '1:180076967136:web:0a41efede57d805ed1cc85',
});

firebase.messaging().onBackgroundMessage((payload) => {
  const title = payload.data?.title || 'Feedback bài tập mới';
  const options = {
    body: payload.data?.body || 'Một học viên vừa gửi feedback cho David.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: payload.data?.noteId || 'exercise-feedback',
    data: { link: payload.data?.link || '/coach.html' },
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.link || '/coach.html', self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => client.url.startsWith(self.location.origin));
    if (existing) return existing.focus().then(() => existing.navigate(target));
    return clients.openWindow(target);
  }));
});
