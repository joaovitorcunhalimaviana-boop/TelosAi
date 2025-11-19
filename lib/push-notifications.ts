/**
 * Push Notifications Client Library
 * Funções para gerenciar Push Notifications no lado do cliente (PWA)
 */

/**
 * Verifica se o navegador suporta Push Notifications
 */
export function isPushNotificationSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Verifica o status da permissão de notificações
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Solicita permissão para enviar notificações
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications não são suportadas neste navegador');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    throw new Error('Permissão de notificações foi negada. Por favor, habilite nas configurações do navegador.');
  }

  // Solicitar permissão
  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Converte uma chave VAPID pública de base64 para Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Inscreve o usuário para receber push notifications
 */
export async function subscribeToPush(): Promise<PushSubscription> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications não são suportadas neste navegador');
  }

  // Verificar permissão
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    throw new Error('Permissão de notificações negada');
  }

  // Obter VAPID public key do ambiente
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error('VAPID public key não configurada');
  }

  // Obter Service Worker registration
  const registration = await navigator.serviceWorker.ready;

  // Verificar se já existe uma subscription
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    // Criar nova subscription
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true, // Sempre mostrar notificação ao usuário
      applicationServerKey: convertedVapidKey as BufferSource,
    });
  }

  // Enviar subscription para o servidor
  await saveSubscriptionToServer(subscription);

  return subscription;
}

/**
 * Salva a subscription no servidor
 */
async function saveSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  const subscriptionJSON = subscription.toJSON();

  const response = await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint: subscriptionJSON.endpoint,
      keys: {
        p256dh: subscriptionJSON.keys?.p256dh,
        auth: subscriptionJSON.keys?.auth,
      },
      userAgent: navigator.userAgent,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || 'Falha ao salvar subscription');
  }
}

/**
 * Cancela a inscrição de push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    return false;
  }

  // Remover do servidor
  await removeSubscriptionFromServer(subscription);

  // Cancelar localmente
  const success = await subscription.unsubscribe();
  return success;
}

/**
 * Remove a subscription do servidor
 */
async function removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
  const subscriptionJSON = subscription.toJSON();

  await fetch('/api/notifications/subscribe', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint: subscriptionJSON.endpoint,
    }),
  }).catch(err => {
    console.error('Error removing subscription from server:', err);
  });
}

/**
 * Verifica se o usuário já está inscrito para push notifications
 */
export async function isSubscribedToPush(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error('Error checking push subscription:', error);
    return false;
  }
}

/**
 * Envia uma notificação de teste (requer permissão)
 */
export async function sendTestNotification(): Promise<void> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications não são suportadas neste navegador');
  }

  const permission = getNotificationPermission();
  if (permission !== 'granted') {
    throw new Error('Permissão de notificações não concedida');
  }

  const registration = await navigator.serviceWorker.ready;

  await registration.showNotification('Teste de Notificação', {
    body: 'As notificações estão funcionando! Você receberá alertas importantes sobre seus pacientes.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'test-notification',
    data: {
      url: '/dashboard',
    },
  });
}

/**
 * Tipos úteis para Push Notifications
 */
export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  vibrate?: number[];
  actions?: Array<{
    action: string;
    title: string;
    url?: string;
  }>;
}
