# Proje Durumu (STATE)

## Özet
- Uygulama: **Gezgin: Seyahat Haritası** (`com.gittigimyerler.app`)
- iOS sürüm: **3.1** (GitHub Actions derlemesi tetiklendi; önceki **3.0 (Derleme 66)** yayında) 🍏
- Android sürüm: **3.1** (versionCode **18**) — Google Play'de **Yayında (`completed`)** 🟢, Huawei AppGallery'de **İncelemede (`State 5`)** 🌸
- Otomasyon: 3 Mağaza (`Apple + Google Play + Huawei`) canlı durum (`npm run stores:status`) ve tek komutla otomatik imzalama/yayınlama aktif
- Web: gittigim-yerler.vercel.app (main'den otomatik yayında)
- Çalışma alanları: `PROJELERİM\Gittiğim Yerler` (ana) + `Desktop\GittigimYerler` (ikincil, `git pull` ile senkron)

## Aktif Görev
AKTIF_GOREV: yok

## Bilinen Sorunlar
- Bilinen açık sorun yok. (Web, Mobil ve Tablet/Katlanabilir ekranların tamamı %100 uyumlu; Sürüm 3.1 tüm mağazalara gönderildi).

## Son Değişiklikler
- 2026-11-24: 7 ileri seviye güvenlik kalkanı uygulandı (`api/feedback.js` ID regex & IP rate-limit, `LoginPage.js` misafir izolasyonu & Apple fallback kaldırma, `storage.js` gerçek Firebase Auth admin kontrolü & `importBackup` prototype pollution/key filtresi, `WorldMapView.js` sabit PIN kaldırma, `syncService.js` `requires-recent-login` hatası fırlatma, `notificationSystem.js` `fromUid` kaydı, `vercel.json` HTTP güvenlik başlıkları, `AndroidManifest.xml` `allowBackup=false`/`usesCleartextTraffic=false`, `firestore.rules` şema/boyut/davet kuralları; 19/19 test PASS).
- 2026-11-23: Gezgin Sürüm 3.1 (vc 18) Android paketleri derlendi ve Google Play (`completed`) + Huawei AppGallery'ye (`State 5`) yüklendi; Genel Müdürlük portföyü 3.1 APK ile güncellendi; iOS 3.1 GitHub Actions derlemesi tetiklendi.
- 2026-11-23: Tablet ve katlanabilir ekranlar (`673x841`, `744x1133`, `768x1024`, `800x1280`, `820x1180`, `834x1194`, `1024x768`, `1024x1366`, `1180x820`) için %100 dikey/yatay responsive uyum sağlandı (Profil `Çıkış Yap` ve 2 satırlı sekme barı, harita üst bar ikon/kompakt geçişi, `#layer-hud` 12px ayrımı, yatay tablet modal kaydırma, `PhoneSimulator.js` iPadOS/Android tablet tespiti, `AndroidManifest.xml` `resizeableActivity="true"`; 9/9 tablet E2E PASS).
- 2026-11-23: 360° Denetimdeki tüm bulgular onarıldı (Keşif paketleri `[object Object]` -> bayraklı tam ülke/harika adı, masaüstü arama çubuğu çakışması, açık tema `light`/`natgeo_atlas` kontrastları, Türkçe `'İ'` araması, Tayvan `CN-TW` ve `XN.json` 404, mobil geri bildirim URL 404, çevrimdışı `ProfileView` preload & kilit koruması, çıkışta `gv_city_notes`/`gv_custom_routes`/`gv_visa_data`/`await deleteAllPhotos` temizliği, açık Telegram token gizleme, `firestore.rules` sahiplik kuralları; 19/19 test + 6/6 E2E PASS).
- 2026-11-21: Canlı web (`gittigim-yerler.vercel.app`) ve mobil uygulama (Android/iOS/Capacitor/Offline/Veritabanı) 4 uzman ajan + 35+ gerçek Puppeteer E2E senaryosu ile ayrı ayrı denetlendi ve kapsamlı rapor hazırlandı.
- 2026-11-19: Mobil önizleme telefon çerçevesi (`PhoneSimulator.js` + `ProfileView.js`) yalnızca yerel geliştirme ortamıyla (`localhost`/`DEV`/`?devsim=1`) sınırlandırıldı; canlı web (`gittigim-yerler.vercel.app`) artık her zaman doğrudan tam ekran açılıyor (19/19 test PASS).
- 2026-11-17: Gezgin Sürüm 3.0 (iOS Derleme 66 + Android vc 17) Apple App Store (`READY_FOR_SALE`), Google Play (`completed`) ve Huawei AppGallery (`State 0`) dahil 3 mağazanın tamamında resmi olarak YAYINDA!
- 2026-11-13: Sürüm 3.0 (vc 17) Android paketleri derlendi ve Google Play + Huawei AppGallery'ye gönderildi; deploy-stores.mjs Huawei OBS `fileName` parametresi düzeltildi; iOS 3.0 GitHub Actions derlemesi tetiklendi.
- 2026-11-13: Veritabanı, Auth ve Kullanıcı Adı giriş akışı düzeltildi (E-posta veya Kullanıcı Adı girişi, cihaz içi güvenli hesap hatırlama, maskeli e-posta ipucu, Firestore UID sahiplik kuralları, çıkışta yerel dizin temizliği, eski user_ bulut verisi uyumluluğu; 19/19 test PASS, güvenlik denetimi TEMİZ).
- 2026-11-11: Mağaza vitrin görsellerinde kamera çakışması (bağımsız status bar ile) ve telefonun alt kısmının kesilmesi (4 köşeli tam kasa ve home bar ile) giderildi. Yeni görseller ve artifact güncellendi.
