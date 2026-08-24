// i18n.js - Turkish & English Internationalization

const STORAGE_KEY = 'gv_language';

const TRANSLATIONS = {
  tr: {
    appName: 'Gezgin',
    appSubtitle: 'Keşfet, kaydet, paylaş',
    loading: 'Harita yükleniyor...',
    loadError: 'Harita yüklenemedi. Sayfayı yenileyin.',
    profile: 'Profilim',
    backToMap: '← Haritaya Dön',
    logout: '🚪 Çıkış Yap',
    logoutConfirm: 'Çıkmak istiyor musunuz? Verileriniz silinmeyecek, sadece oturum kapanacaktır.',
    reset: '🗑 Sıfırla',
    resetConfirm: 'Haritadaki tüm işaretlemeleri temizlemek istiyor musunuz? Hesabınız ve profiliniz korunacaktır.',
    notePrivacy: 'Verileriniz yalnızca tarayıcınızda saklanır',
    copy: 'Kopyala',
    copied: 'Kopyalandı!',
    visited: 'Gidildi',
    planned: 'Planlanıyor',
    wishlist: 'İsteniyor',
    unvisited: 'Gidilmedi',
    countriesVisited: 'Ülke Gezildi',
    provincesVisited: 'İl Gezildi',
    citiesVisited: 'Şehir Gezildi',
    travelScore: 'Gezgin Skoru',
    totalWorld: 'Dünya',
    totalTurkey: 'Türkiye',
    selectAvatar: 'Bir Avatar Seç',
    username: 'Kullanıcı Adı',
    usernamePlaceholder: 'Maceracı',
    bio: 'Biyografi (İsteğe Bağlı)',
    bioPlaceholder: 'Dünyayı geziyorum...',
    startMap: 'Haritaya Başla',
    tabProfile: 'Profilim',
    tabMedals: 'Madalyalar',
    tabCompare: 'Karşılaştır',
    shareCodeTitle: 'Profil Paylaşım Kodu',
    shareCodeDesc: 'Bu kodu arkadaşlarınızla paylaşarak seyahat haritanızı gösterebilirsiniz:',
    comparePlaceholder: 'Arkadaşının paylaşım kodunu buraya yapıştır...',
    loadProfile: 'Profili Yükle',
    invalidCode: 'Geçersiz paylaşım kodu!',
    medalsEarned: '{count} / {total} Madalya Kazanıldı (%{percent})',
    markStatus: 'Durumu Değiştir:',
    close: 'Kapat',
    theme: 'Görünüm',
    themeDark: 'Karanlık',
    themeLight: 'Aydınlık',
    language: 'Dil',
    settings: 'Ayarlar',
    customizeColors: 'Harita Renklerini Özelleştir',
    colorVisited: 'Gidildi Rengi',
    colorPlanned: 'Planlanıyor Rengi',
    colorWishlist: 'İsteniyor Rengi',
    feedbackBtn: '💬 Geri Bildirim & Hata Bildir',
    feedbackTitle: '💡 Geri Bildirim & Hata Bildirimi',
    feedbackSubtitle: 'Uygulamayı geliştirmemiz için önerilerinizi veya karşılaştığınız hataları bize iletin:',
    feedbackType: 'Bildirim Türü',
    feedbackSuggestion: '💡 Geliştirme Önerisi',
    feedbackBug: '🐞 Hata Bildirimi',
    feedbackOther: '💬 Genel Görüş',
    feedbackMsgPlaceholder: 'Mesajınızı veya hata detayını buraya yazın...',
    feedbackEmailPlaceholder: 'E-posta veya kullanıcı adınız (İsteğe bağlı)',
    feedbackSend: 'Gönder',
    feedbackSent: 'Teşekkürler! Geri bildiriminiz başarıyla iletildi.',
    dangerZone: 'Tehlikeli Bölge',
    resetDataDesc: 'Tüm seyahat ve işaretleme verilerinizi temizler. Profiliniz ve hesabınız korunur.'
  },
  en: {
    appName: 'Gezgin',
    appSubtitle: 'Explore, track, share',
    loading: 'Loading map...',
    loadError: 'Failed to load map. Please refresh.',
    profile: 'My Profile',
    backToMap: '← Back to Map',
    logout: '🚪 Logout',
    logoutConfirm: 'Are you sure you want to log out? Your travel data will be preserved.',
    reset: '🗑 Reset Map Data',
    resetConfirm: 'Do you want to clear all marked locations? Your profile and account will be kept safe.',
    notePrivacy: 'Your data is stored strictly in your browser',
    copy: 'Copy',
    copied: 'Copied!',
    visited: 'Visited',
    planned: 'Planned',
    wishlist: 'Wishlist',
    unvisited: 'Unvisited',
    countriesVisited: 'Countries Visited',
    provincesVisited: 'Provinces Visited',
    citiesVisited: 'Cities Visited',
    travelScore: 'Travel Score',
    totalWorld: 'World',
    totalTurkey: 'Türkiye',
    selectAvatar: 'Choose an Avatar',
    username: 'Username',
    usernamePlaceholder: 'Adventurer',
    bio: 'Bio (Optional)',
    bioPlaceholder: 'Exploring the world...',
    startMap: 'Start Exploring',
    tabProfile: 'Profile',
    tabMedals: 'Medals',
    tabCompare: 'Compare',
    shareCodeTitle: 'Profile Share Code',
    shareCodeDesc: 'Share this code with friends to show your personal travel map:',
    comparePlaceholder: 'Paste friend\'s share code here...',
    loadProfile: 'Load Profile',
    invalidCode: 'Invalid share code!',
    medalsEarned: '{count} / {total} Medals Earned ({percent}%)',
    markStatus: 'Change Status:',
    close: 'Close',
    theme: 'Appearance',
    themeDark: 'Dark',
    themeLight: 'Light',
    language: 'Language',
    settings: 'Settings',
    customizeColors: 'Customize Map Colors',
    colorVisited: 'Visited Color',
    colorPlanned: 'Planned Color',
    colorWishlist: 'Wishlist Color',
    feedbackBtn: '💬 Feedback & Report Bug',
    feedbackTitle: '💡 Feedback & Bug Report',
    feedbackSubtitle: 'Send us your suggestions or any bugs you encountered to help us improve:',
    feedbackType: 'Feedback Type',
    feedbackSuggestion: '💡 Feature Suggestion',
    feedbackBug: '🐞 Bug Report',
    feedbackOther: '💬 General Feedback',
    feedbackMsgPlaceholder: 'Write your suggestion or bug details here...',
    feedbackEmailPlaceholder: 'Email or username (Optional)',
    feedbackSend: 'Send Feedback',
    feedbackSent: 'Thank you! Your feedback has been received.',
    dangerZone: 'Danger Zone',
    resetDataDesc: 'Clears all marked travel data from the map. Your profile and account will remain safe.'
  }
};

let currentLang = 'tr';
const langListeners = [];

export function getLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'tr' || saved === 'en') {
      currentLang = saved;
    }
  } catch {}
  return currentLang;
}

export function setLanguage(lang) {
  if (lang !== 'tr' && lang !== 'en') return;
  currentLang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {}
  langListeners.forEach(fn => {
    try { fn(lang); } catch {}
  });
}

export function onLanguageChange(fn) {
  langListeners.push(fn);
  return () => {
    const idx = langListeners.indexOf(fn);
    if (idx !== -1) langListeners.splice(idx, 1);
  };
}

export function t(key, params = {}) {
  const lang = getLanguage();
  let str = TRANSLATIONS[lang]?.[key] || TRANSLATIONS.tr?.[key] || key;
  Object.entries(params).forEach(([k, v]) => {
    str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), v);
  });
  return str;
}

export function getCountryDisplayName(c) {
  if (!c) return '';
  const lang = getLanguage();
  if (lang === 'en') {
    return c.nameEn || c.name || '';
  }
  return c.name || c.nameEn || '';
}

export function getLocalizedName(rawName, countryCode) {
  if (!rawName) return '';
  return rawName;
}

