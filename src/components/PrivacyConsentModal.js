// PrivacyConsentModal.js - İlk Açılış Gizlilik ve Veri Güvenliği Onayı (Huawei Rule 7.5 & App Store Compliance)
import { getLanguage } from '../utils/i18n.js';

export function checkPrivacyConsent(onAccepted) {
  try {
    if (localStorage.getItem('gv_privacy_agreed') === '1') {
      if (typeof onAccepted === 'function') onAccepted();
      return;
    }
  } catch {
    if (typeof onAccepted === 'function') onAccepted();
    return;
  }

  const lang = getLanguage();
  const isTr = lang === 'tr';

  const overlay = document.createElement('div');
  overlay.id = 'privacy-consent-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(11, 17, 32, 0.92);
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
    z-index: 20000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    animation: fadeIn 0.3s ease;
  `;

  overlay.innerHTML = `
    <div style="
      background: #1e293b;
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 24px;
      width: min(460px, 94vw);
      padding: 28px 24px;
      text-align: center;
      box-shadow: 0 25px 70px -15px rgba(0, 0, 0, 0.85);
      position: relative;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="font-size: 3rem; margin-bottom: 12px; line-height: 1;">🛡️</div>
      <h2 style="font-size: 1.3rem; font-weight: 800; color: #60a5fa; margin-bottom: 10px; letter-spacing: -0.01em;">
        ${isTr ? 'Gizlilik ve Veri Güvenliği' : 'Privacy & Data Protection'}
      </h2>
      <p style="font-size: 0.88rem; color: #94a3b8; line-height: 1.55; margin-bottom: 18px; text-align: left;">
        ${isTr
          ? 'Gezgin: Seyahat Haritası\'na hoş geldiniz! Uygulamamızı kullanırken kişisel gizliliğiniz ve verilerinizin güvenliği en temel önceliğimizdir.'
          : 'Welcome to Gezgin: Travel Map! Protecting your personal data and privacy is our highest priority.'}
      </p>

      <div style="
        background: rgba(15, 23, 42, 0.8);
        border: 1px solid rgba(51, 65, 85, 0.7);
        border-radius: 14px;
        padding: 14px 16px;
        text-align: left;
        margin-bottom: 20px;
        font-size: 0.82rem;
        line-height: 1.5;
        color: #cbd5e1;
      ">
        <div style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
          <span style="font-size: 1rem;">☁️</span>
          <span><strong>${isTr ? 'Bulut Senkronizasyonu:' : 'Cloud Sync:'}</strong> ${isTr ? 'Giriş bilgileriniz haritanızı senkronize etmek için Firebase altyapısında şifreli saklanır.' : 'Account data is securely stored with Firebase to sync your travel map.'}</span>
        </div>
        <div style="margin-bottom: 8px; display: flex; align-items: flex-start; gap: 8px;">
          <span style="font-size: 1rem;">📍</span>
          <span><strong>${isTr ? 'Konum Gizliliği:' : 'Location Privacy:'}</strong> ${isTr ? 'GPS yalnızca haritada yerinizi bulmak için anlık kullanılır; arka planda ASLA izlenmez.' : 'GPS is only used on-demand to center the map; never tracked in background.'}</span>
        </div>
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span style="font-size: 1rem;">🔒</span>
          <span><strong>${isTr ? 'Sıfır Reklam & Satış:' : 'No Ads / No Sale:'}</strong> ${isTr ? 'Verileriniz reklam şirketlerine satılmaz ve üçüncü şahıslarla paylaşılmaz.' : 'Your data is never sold to advertisers or shared with third parties.'}</span>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <button type="button" id="btn-read-privacy-doc" style="
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.35);
          color: #93c5fd;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        ">
          📄 ${isTr ? 'Gizlilik Politikasını Oku' : 'Read Full Privacy Policy'} ↗
        </button>
      </div>

      <button type="button" id="btn-accept-privacy-consent" style="
        width: 100%;
        padding: 14px 20px;
        border-radius: 14px;
        border: none;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
        transition: transform 0.15s, background 0.15s;
      ">
        ✓ ${isTr ? 'Kabul Ediyorum ve Başla' : 'Accept and Continue'}
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  const btnRead = overlay.querySelector('#btn-read-privacy-doc');
  if (btnRead) {
    btnRead.addEventListener('click', () => {
      window.open('https://gittigim-yerler.vercel.app/privacy.html', '_blank', 'noopener,noreferrer');
    });
  }

  const btnAccept = overlay.querySelector('#btn-accept-privacy-consent');
  if (btnAccept) {
    btnAccept.addEventListener('click', () => {
      try {
        localStorage.setItem('gv_privacy_agreed', '1');
      } catch {}
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s ease';
      setTimeout(() => {
        overlay.remove();
        if (typeof onAccepted === 'function') onAccepted();
      }, 200);
    });
  }
}
