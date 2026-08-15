// notifications.js - Achievement Unlock Toast Notifications (Sequential Single Toast Queue)
import confetti from 'canvas-confetti';

let toastContainer = null;
const notificationQueue = [];
let isShowingToast = false;

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
  if (!achievement || !achievement.id) return;
  // Prevent duplicate notifications in queue
  if (!notificationQueue.some(item => item.id === achievement.id)) {
    notificationQueue.push(achievement);
  }
  processNextInQueue();
}

function processNextInQueue() {
  if (isShowingToast || notificationQueue.length === 0) return;
  isShowingToast = true;

  const achievement = notificationQueue.shift();
  showToast(achievement, () => {
    isShowingToast = false;
    // 350ms pause between achievements so each achievement gets its own dedicated spotlight
    if (notificationQueue.length > 0) {
      setTimeout(processNextInQueue, 350);
    }
  });
}

function showToast(achievement, onComplete) {
  const container = ensureToastContainer();
  // Clear any leftover toast element
  container.innerHTML = '';

  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <div class="ach-toast-glow"></div>
    <div class="ach-toast-icon-wrap">
      <span class="ach-toast-icon">${achievement.icon || '🏆'}</span>
    </div>
    <div class="ach-toast-content">
      <div class="ach-toast-header">
        <span class="ach-toast-badge">🎉 YENİ BAŞARIM AÇILDI!</span>
      </div>
      <div class="ach-toast-title">${achievement.title}</div>
      <div class="ach-toast-desc">${achievement.desc || ''}</div>
    </div>
  `;

  container.appendChild(toast);

  // Confetti burst for this achievement
  try {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.12, x: 0.5 }
    });
  } catch {}

  let dismissed = false;
  let timerId = null;

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    if (timerId) clearTimeout(timerId);
    toast.classList.add('dismissing');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
      onComplete();
    }, 350);
  }

  toast.addEventListener('click', dismiss);
  // Auto dismiss after 3.8 seconds so user can read each achievement comfortably
  timerId = setTimeout(dismiss, 3800);
}
