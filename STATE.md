# Proje Durumu (STATE)

## Özet
- Uygulama: **Gezgin: Seyahat Haritası** (`com.gittigimyerler.app`)
- Android sürüm: **2.9** (versionCode **16**) — Yeni özelliklerle derlendi, Google Play ve Huawei AppGallery için hazır
- Web: gittigim-yerler.vercel.app (main'den otomatik)
- Çalışma alanları: `PROJELERİM\Gittiğim Yerler` (ana) + `Desktop\GittigimYerler` (ikincil, `git pull` ile senkron)

## Aktif Görev
AKTIF_GOREV: iOS Native Apple Sign-In Derleme & App Store Connect Otomatik Yükleme
MUDUR: 284e5da2-c83e-47f9-a4df-e2a6700d5ee5
- [x] Apple Developer Portal: com.gittigimyerler.app için APPLE_ID_AUTH (Sign In with Apple) yetkisi açıldı ve yeni Provisioning Profile üretildi
- [ ] SceneDelegate.swift WKNavigationActionPolicy düzeltmesi ve LoginPage.js iOS Apple yedek akışı
- [ ] deploy-ios.yml: macos-26 runner + App Store Connect API'den güncel profil indirme ve otomatik yükleme
- [ ] GitHub Actions derlemesinin başarıyla tamamlanıp App Store Connect'e ulaşmasının doğrulanması

## Bilinen Sorunlar
- Apple App Store: 21 Ekim tarihli eski 1.0 (40) sürümü `4.0.0 Design: Preamble` maddesinden döndü (Screenshot-1027-151530.png detayı bekleniyor) + yeni Apple Lisans Sözleşmesi onayı gerekiyor.

## Son Değişiklikler
- 2026-10-30: Sürüm 2.9 (versionCode 16) hazırlandı; Android ve iOS Capacitor senkronize edildi.
- 2026-10-22: Gece gölgesi kaydırma kırpılması çözüldü (L.svg padding: 3.0, kesintisiz 720° boylam ve overflow: visible).
- 2026-10-22: Gece/Gündüz Harita Modu: Gerçek zamanlı güneş zeniti, ay pozisyonu ve solar terminator gölgesi (WorldMapView.js).
- 2026-10-22: Seyahat Cüzdanı & Harcama Yönetimi: Çoklu döviz, 6 kategori, gizlilik modu (👁️) ve mekan çekmecesi harcama girişi (travelBudget.js, ProfileView.js, main.css).
- 2026-10-22: 3 Yeni Özellik: 11 yeni kıta/bölge rozeti (badges.js), haritada uçuş rotaları katmanı (WorldMapView.js), profilde aramalı Seyahat Günlüğü vitrini (ProfileView.js & main.css).
- 2026-10-22: Performans & Kod Bölme: Leaflet ve Firebase modülleri ayrı chunk'lara ayrıldı, ana bundle 1.7 MB'dan 923 kB'a düşürüldü.
- 2026-10-22: Node yerleşik test altyapısı (tests/smoke.test.js & budget.test.js - 10/10 PASS) kuruldu, npm run check'e bağlandı.
- 2026-10-22: Kök dizindeki geçici betikler scratch/'e arşivlendi.
- 2026-10-22: Sürüm 2.8 (vc 15) Google Play'e yüklendi.
- 2026-10-22: Orkestrasyon sistemi kuruldu (AGENTS.md, alt ajanlar, kancalar, ESLint + `npm run check`).
