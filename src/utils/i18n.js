// i18n.js - Turkish & English Internationalization
import { escapeHtml } from './security.js';

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
    statesVisited: 'Eyalet Gezildi',
    provincesVisited: 'İl Gezildi',
    regionsVisited: 'Bölge Gezildi',
    citiesVisited: 'Şehir Gezildi',
    homeCountry: 'Ana Ülke / Memleket',
    homeCountryDesc: 'İstatistiklerde ve harita sayacında takip edilecek kendi ülkeniz',
    travelScore: 'Gezgin Skoru',
    totalWorld: 'Dünya',
    totalTurkey: 'Türkiye',
    selectAvatar: 'Bir Avatar Seç',
    username: 'Kullanıcı Adı',
    usernamePlaceholder: 'Maceracı',
    bio: 'Biyografi (İsteğe Bağlı)',
    bioPlaceholder: 'Dünyayı geziyorum...',
    startMap: 'Haritaya Başla',
    tabProfile: 'Profil',
    tabMedals: 'Madalyalar',
    tabCompare: 'Kıyasla',
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
    feedbackBtn: 'Geri Bildirim & Hata Bildir',
    feedbackTitle: 'Geri Bildirim & Hata Bildirimi',
    feedbackSubtitle: 'Uygulamayı geliştirmemiz için önerilerinizi veya karşılaştığınız hataları bize iletin:',
    feedbackType: 'Bildirim Türü',
    feedbackSuggestion: 'Geliştirme Önerisi',
    feedbackBug: 'Hata Bildirimi',
    feedbackOther: 'Genel Görüş',
    legend: 'Lejant',
    feedbackMsgPlaceholder: 'Mesajınızı veya hata detayını buraya yazın...',
    feedbackEmailPlaceholder: 'E-posta veya kullanıcı adınız (İsteğe bağlı)',
    feedbackSend: 'Gönder',
    feedbackSent: 'Teşekkürler! Geri bildiriminiz başarıyla iletildi.',
    tabNewFeedback: '✍️ Yeni Bildirim',
    tabMyFeedbacks: '📋 Bildirimlerim',
    statusPending: '⏳ İnceleniyor',
    statusConsidering: '💡 Düşünülüyor',
    statusProgress: '🛠️ Hazırlanıyor',
    statusResolved: '✅ Yapıldı',
    statusDeclined: '🛑 Vazgeçildi',
    noFeedbacksYet: 'Henüz bir bildirim göndermediniz.',
    devResponse: 'Geliştirici Yanıtı',
    adminMode: '👑 Geliştirici Modu',
    adminPinPlaceholder: 'Yönetici PIN Kodu',
    statusUpdated: 'Durum güncellendi!',
    tabBucket: 'Hedefler',
    tabFlights: 'Uçuşlar',
    searchPlaceholder: 'Ülke, il veya şehir ara...',
    searchNoResults: 'Eşleşen konum bulunamadı',
    ratingAndNotes: 'Puan & Seyahat Notu',
    rateAndReview: 'Değerlendirme Yap',
    reviewScore: 'Değerlendirme',
    rateThisPlace: 'Puan Verin',
    notePlaceholder: 'Bu yer hakkında anı veya not...',
    save: 'Kaydet',
    saved: 'Kaydedildi!',
    savedFriends: 'Kayıtlı Arkadaşlarım',
    saveFriend: 'Arkadaşı Kaydet',
    friendSaved: 'Arkadaş kaydedildi!',
    createPoster: 'Seyahat Posteri',
    downloadPoster: 'Posteri İndir (PNG)',
    sharePoster: 'Paylaş',
    layer1Countries: '1. Katman: Ülkeler',
    layer2Regions: '2. Katman: Eyaletler / Bölgeler',
    layer3Cities: '3. Katman: İller / Şehirler',
    compareProvinces: 'Türkiye 81 İl Kıyaslaması',
    compareCities: 'Dünya Şehirleri Kıyaslaması',
    airlinesTracked: 'Binilen Havayolları',
    totalFlights: 'Toplam Uçuş',
    customAirline: 'Özel Havayolu Ekle',
    dangerZone: 'Tehlikeli Bölge',
    resetDataDesc: 'Tüm seyahat ve işaretleme verilerinizi temizler. Profiliniz ve hesabınız korunur.',
    themeStudio: 'Tema & Görünüm Stüdyosu',
    themeStudioDesc: 'Harita zeminini ve arayüz atmosferini zevkinize göre seçin:',
    themeOcean: 'Okyanus',
    themeEmerald: 'Zümrüt',
    themeVintage: 'Nostalji',
    uiScaleTitle: 'Arayüz & Yazı Boyutu',
    uiScaleDesc: 'Uygulama yazılarını ve simgelerini ekranınıza en uygun boyuta getirin:',
    uiSizeSmall: 'Kompakt (%88)',
    uiSizeMedium: 'Standart (%100)',
    uiSizeLarge: 'Büyük (%120)',
    profileSettingsTitle: 'Gezgin Kimliği',
    profileSettingsDesc: 'Profil avatarınızı, kullanıcı adınızı ve biyografinizi dilediğiniz an güncelleyin:',
    editProfile: 'Profili Düzenle',
    saveProfile: 'Değişiklikleri Kaydet',
    profileSaved: 'Profiliniz başarıyla güncellendi!',
    backupTitle: 'Veri Yedekleme & Aktarma',
    backupDesc: 'İşaretlemelerinizi, filonuzu, rotalarınızı ve tüm seyahat geçmişinizi JSON dosyası olarak yedekleyin ya da başka cihaza aktarın:',
    downloadBackup: 'JSON Yedeği İndir (Dışa Aktar)',
    restoreBackup: 'Yedekten Geri Yükle (İçe Aktar)',
    backupRestored: 'Yedek başarıyla yüklendi ve haritanız güncellendi!',
    backupError: 'Yedek dosyası okunamadı veya biçim geçersiz!',
    resetColors: 'Varsayılan Renklere Dön',
    colorsReset: 'Durum renkleri varsayılana sıfırlandı.',
    appInfoTitle: 'Gezgin Hakkında',
    appInfoDesc: 'Sürüm 1.4 (Build 5) • %100 Çevrimdışı ve Kişisel Cihaz Güvenliği'
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
    statesVisited: 'States Visited',
    provincesVisited: 'Provinces Visited',
    regionsVisited: 'Regions Visited',
    homeCountry: 'Home Country',
    homeCountryDesc: 'Your native country tracked in statistics and the map counter',
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
    feedbackBtn: 'Feedback & Report Bug',
    feedbackTitle: 'Feedback & Bug Report',
    feedbackSubtitle: 'Send us your suggestions or any bugs you encountered to help us improve:',
    feedbackType: 'Feedback Type',
    feedbackSuggestion: 'Feature Suggestion',
    feedbackBug: 'Bug Report',
    feedbackOther: 'General Feedback',
    legend: 'Legend',
    feedbackMsgPlaceholder: 'Write your suggestion or bug details here...',
    feedbackEmailPlaceholder: 'Email or username (Optional)',
    feedbackSend: 'Send Feedback',
    feedbackSent: 'Thank you! Your feedback has been received.',
    tabNewFeedback: '✍️ New Feedback',
    tabMyFeedbacks: '📋 My Feedbacks',
    statusPending: '⏳ Under Review',
    statusConsidering: '💡 Considering',
    statusProgress: '🛠️ In Progress',
    statusResolved: '✅ Resolved',
    statusDeclined: '🛑 Declined',
    noFeedbacksYet: 'You have not submitted any feedback yet.',
    devResponse: 'Developer Response',
    adminMode: '👑 Admin Mode',
    adminPinPlaceholder: 'Admin PIN Code',
    statusUpdated: 'Status updated!',
    tabBucket: 'Bucket',
    tabFlights: 'Flights',
    searchPlaceholder: 'Search country, province or city...',
    searchNoResults: 'No matching location found',
    ratingAndNotes: 'Rating & Travel Notes',
    rateAndReview: 'Rate & Review',
    reviewScore: 'Review',
    rateThisPlace: 'Rate this place',
    notePlaceholder: 'Add memory or travel notes...',
    save: 'Save',
    saved: 'Saved!',
    savedFriends: 'Saved Friends',
    saveFriend: 'Save Friend',
    friendSaved: 'Friend saved!',
    createPoster: 'Travel Poster',
    downloadPoster: 'Download Poster (PNG)',
    sharePoster: 'Share',
    layer1Countries: 'Layer 1: Countries',
    layer2Regions: 'Layer 2: States / Regions',
    layer3Cities: 'Layer 3: Provinces / Cities',
    compareProvinces: 'Turkey 81 Provinces Comparison',
    compareCities: 'World Cities Comparison',
    airlinesTracked: 'Airlines Flown',
    totalFlights: 'Total Flights',
    customAirline: 'Add Custom Airline',
    dangerZone: 'Danger Zone',
    resetDataDesc: 'Clears all marked travel data from the map. Your profile and account will remain safe.',
    themeStudio: 'Theme & Appearance Studio',
    themeStudioDesc: 'Customize the map background and interface vibe to your liking:',
    themeOcean: 'Ocean',
    themeEmerald: 'Emerald',
    themeVintage: 'Vintage',
    uiScaleTitle: 'UI & Font Scale',
    uiScaleDesc: 'Adjust text size and app controls for your screen:',
    uiSizeSmall: 'Compact (88%)',
    uiSizeMedium: 'Standard (100%)',
    uiSizeLarge: 'Large (120%)',
    profileSettingsTitle: 'Traveler Identity',
    profileSettingsDesc: 'Update your avatar, username, and bio anytime:',
    editProfile: 'Edit Profile',
    saveProfile: 'Save Changes',
    profileSaved: 'Profile updated successfully!',
    backupTitle: 'Data Backup & Transfer',
    backupDesc: 'Safely backup all your visits, fleet, and routes as a JSON file, or restore to another device:',
    downloadBackup: 'Download JSON Backup (Export)',
    restoreBackup: 'Restore from Backup (Import)',
    backupRestored: 'Backup successfully restored and map updated!',
    backupError: 'Failed to read backup file or invalid format!',
    resetColors: 'Reset to Default Colors',
    colorsReset: 'Status colors restored to default.',
    appInfoTitle: 'About Gezgin',
    appInfoDesc: 'Version 1.4 (Build 5) • 100% Offline & Personal Device Privacy'
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

export function getCountryFlagHtml(countryCode, fallbackEmoji = '🇹🇷', options = {}) {
  const code = (countryCode || 'TR').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) || 'TR';
  if (code === 'IL') return '';
  const width = parseInt(options.width, 10) || 24;
  const height = parseInt(options.height, 10) || 16;
  const safeClassName = escapeHtml(options.className || 'country-flag-icon');
  const safeStyle = (options.style || '').replace(/[<>"']/g, '');
  const safeFallback = escapeHtml(fallbackEmoji || '🏳️');

  if (code === 'TR') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 -30000 90000 60000" class="${safeClassName}" style="width:${width}px;height:${height}px;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,0.35);vertical-align:middle;display:inline-block;flex-shrink:0;${safeStyle}" aria-label="Türkiye">
      <title>Türkiye</title>
      <path fill="#e30a17" d="m0-30000h90000v60000H0z"/>
      <path fill="#fff" d="m41750 0 13568-4408-8386 11541V-7133l8386 11541zm925 8021a15000 15000 0 1 1 0-16042 12000 12000 0 1 0 0 16042z"/>
    </svg>`;
  }

  const lower = code.toLowerCase();
  return `<span class="${safeClassName}" style="display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;flex-shrink:0;${safeStyle}">
    <img src="https://flagcdn.com/w40/${lower}.png" 
         srcset="https://flagcdn.com/w80/${lower}.png 2x" 
         width="${width}" 
         height="${height}" 
         alt="${code}" 
         style="width:${width}px;height:${height}px;border-radius:3px;object-fit:cover;box-shadow:0 1px 3px rgba(0,0,0,0.35);display:inline-block;" 
         onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='inline-block';" />
    <span style="display:none;font-size:${height}px;line-height:1;">${safeFallback}</span>
  </span>`;
}

export { TRANSLATIONS };


