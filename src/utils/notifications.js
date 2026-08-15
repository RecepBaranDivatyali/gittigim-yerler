// notifications.js - Achievement Unlock Toast Notifications
import confetti from 'canvas-confetti';

let toastContainer = null;
const notificationQueue = [];
let isProcessingQueue = false;

function ensureToastContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'achievement-toast-container';
    toastContainer.className = 'achievement-toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function notifyAchievementUnlocked(achievement) {
  notificationQueue.push(achievement);
  processQueue();
}

function processQueue() {
  if (isProcessingQueue || notificationQueue.length === 0) return;
  isProcessingQueue = true;

  const achievement = notificationQueue.shift();
  showToast(achievement, () => {
    isProcessingQueue = false;
    if (notificationQueue.length > 0) {
      setTimeout(processQueue, 300);
    }
  });
}

function showToast(achievement, onComplete) {
  const container = ensureToastContainer();

  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="ach-toast-glow"></div>
    <div class="ach-toast-icon-wrap">
      <span class="ach-toast-icon">${achievement.icon || '🏆'}</span>
    </div>
    <div class="ach-toast-content">
      <div class="ach-toast-header">
        <span class="ach-toast-badge">🎉 YENİ BAŞARIM!</span>
      </div>
      <div class="ach-toast-title">${achievement.title}</div>
      <div class="ach-toast-desc">${achievement.desc || ''}</div>
    </div>
    <button class="ach-toast-close" aria-label="Kapat">✕</button>
  `;

  container.appendChild(toast);

  // Confetti burst
  try {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.12, x: 0.5 }
    });
  } catch {}

  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    toast.classList.add('dismissing');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
      onComplete();
    }, 400);
  }

  toast.querySelector('.ach-toast-close').addEventListener('click', (e) => {
    e.stopPropagation();
    dismiss();
  });

  toast.addEventListener('click', dismiss);

  // Auto dismiss after 4.5 seconds
  setTimeout(dismiss, 4500);
}
