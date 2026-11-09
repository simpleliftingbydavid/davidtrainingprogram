import { app } from './firebase-init.js';
import { WEB_PUSH_VAPID_KEY } from './notification-config.js';
import {
  deleteCoachNotificationDevice, deleteStudentNotificationDevice, saveCoachNotificationDevice, saveStudentNotificationDevice,
} from './training-data.js';

// Coach (feedback, alerts) or student (meal-logging reminder): same device flow, different owner.
const STORE = {
  coach: { save: saveCoachNotificationDevice, remove: deleteCoachNotificationDevice },
  student: { save: saveStudentNotificationDevice, remove: deleteStudentNotificationDevice },
};

const DEVICE_KEY = 'dtp_push_device_id';
const ENABLED_KEY = 'dtp_push_enabled';
let messagingModule = null;
let messaging = null;

function deviceId() {
  let value = localStorage.getItem(DEVICE_KEY);
  if (!value) {
    value = globalThis.crypto?.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(DEVICE_KEY, value);
  }
  return value;
}

async function loadMessaging() {
  if (!messagingModule) messagingModule = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging.js');
  if (!(await messagingModule.isSupported())) return null;
  messaging ||= messagingModule.getMessaging(app);
  return messaging;
}

export async function pushNotificationStatus() {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return { state: 'unsupported' };
  if (!WEB_PUSH_VAPID_KEY) return { state: 'needs-config' };
  const instance = await loadMessaging();
  if (!instance) return { state: 'unsupported' };
  if (Notification.permission === 'denied') return { state: 'denied' };
  return {
    state: Notification.permission === 'granted' && localStorage.getItem(ENABLED_KEY) === '1'
      ? 'enabled'
      : 'available',
  };
}

export async function enablePushNotifications(ownerUid, onForegroundMessage = () => {}, { owner = 'coach' } = {}) {
  if (!WEB_PUSH_VAPID_KEY) throw new Error('Chưa cấu hình Web Push VAPID key trong notification-config.js.');
  const instance = await loadMessaging();
  if (!instance) throw new Error('Trình duyệt này chưa hỗ trợ Web Push.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Bạn chưa cho phép trình duyệt gửi thông báo.');
  const registration = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
  const token = await messagingModule.getToken(instance, { vapidKey: WEB_PUSH_VAPID_KEY, serviceWorkerRegistration: registration });
  if (!token) throw new Error('Không lấy được mã nhận thông báo cho thiết bị này.');
  await STORE[owner].save(ownerUid, deviceId(), {
    token, enabled: true, platform: navigator.userAgent.slice(0, 300),
  });
  localStorage.setItem(ENABLED_KEY, '1');
  messagingModule.onMessage(instance, (payload) => {
    onForegroundMessage(payload);
    if (Notification.permission === 'granted' && payload?.data) {
      new Notification(payload.data.title || 'David Coaching', { body: payload.data.body || '', tag: payload.data.tag || payload.data.noteId || 'exercise-feedback' });
    }
  });
  return { state: 'enabled' };
}

export async function disablePushNotifications(ownerUid, { owner = 'coach' } = {}) {
  const instance = await loadMessaging();
  if (instance) await messagingModule.deleteToken(instance).catch(() => false);
  await STORE[owner].remove(ownerUid, deviceId());
  localStorage.removeItem(ENABLED_KEY);
  return { state: 'available' };
}
