// OnboardingModal.js - Gezgin 2.0 Hoş Geldiniz Turu
import { getLanguage } from '../utils/i18n.js';

export function checkOnboarding() {
  try {
    if (localStorage.getItem('gv_onboarded')) return;
  } catch {
    return;
  }

  const lang = getLanguage();
  const isTr = lang === 'tr';

  const steps = [
    {
      icon: '🌍',
      title: isTr ? 'Dünyayı Keşfet & Boya' : 'Explore & Color the World',
      desc: isTr 
        ? 'Haritadaki ülkelere, eyaletlere ve şehirlere dokun. Gezdiğin yerleri, seyahat planlarını ve hayalindeki rotaları favori renklerine boya!' 
        : 'Tap on countries, states, and cities on the map. Color your visited places, travel plans, and dream bucket list!'
    },
    {
      icon: '🛂',
      title: isTr ? 'Damgalar & Ulaşım Araçları' : 'Stamps & Transport Modes',
      desc: isTr 
        ? 'Her ülkeye giriş ve çıkış damgası bas! Seyahat ettiğin aracı seç: Uçak ✈️, Tren 🚆, Şahsi Araba 🚗, Otobüs 🚌 veya Gemi 🚢 ile anılarını ölümsüzleştir.' 
        : 'Stamp your passport with entry and exit marks! Choose your mode: Flight ✈️, Train 🚆, Car 🚗, Bus 🚌, or Ship 🚢.'
    },
    {
      icon: '🏅',
      title: isTr ? 'Sanal Pasaport & Rozetler' : 'Virtual Passport & Badges',
      desc: isTr 
        ? 'Sınırları aştıkça özel gezgin madalyaları kazan, arkadaşlarınla rotalarını kıyasla ve yüksek çözünürlüklü Sanal Pasaportunu indirip paylaş!' 
        : 'Earn traveler badges as you cross borders, compare journeys with friends, and download your high-res Virtual Passport!'
    }
  ];

  let currentStep = 0;

  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';

  function renderCard() {
    const s = steps[currentStep];
    const isLast = currentStep === steps.length - 1;

    overlay.innerHTML = `
      <div class="onboarding-card">
        <div class="onboarding-icon">${s.icon}</div>
        <div class="onboarding-title">${s.title}</div>
        <div class="onboarding-desc">${s.desc}</div>

        <div class="onboarding-dots-row">
          ${steps.map((_, i) => `<span class="onboarding-dot ${i === currentStep ? 'active' : ''}"></span>`).join('')}
        </div>

        <div class="onboarding-btn-row">
          <button type="button" class="onboarding-btn secondary" id="btn-onboard-skip">${isTr ? 'Atla' : 'Skip'}</button>
          <button type="button" class="onboarding-btn primary" id="btn-onboard-next">${isLast ? (isTr ? 'Keşfe Başla 🚀' : 'Start Exploring 🚀') : (isTr ? 'Devam Et ➔' : 'Continue ➔')}</button>
        </div>
      </div>
    `;

    overlay.querySelector('#btn-onboard-skip')?.addEventListener('click', finish);
    overlay.querySelector('#btn-onboard-next')?.addEventListener('click', () => {
      if (isLast) {
        finish();
      } else {
        currentStep++;
        renderCard();
      }
    });
  }

  function finish() {
    try {
      localStorage.setItem('gv_onboarded', '1');
    } catch {}
    overlay.remove();
  }

  renderCard();
  document.body.appendChild(overlay);
}
