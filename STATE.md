# Proje Durumu (STATE)

## Özet
- Uygulama: **Gezgin: Seyahat Haritası** (`com.gittigimyerler.app`)
- iOS sürüm: **1.0 (Derleme 64)** — App Store Connect'te incelemede (**Waiting for Review**)
- Android sürüm: **2.9** (versionCode **16**) — Google Play'de **Yayında (`completed`)**, Huawei AppGallery'de **İncelemede (`State 5`)**
- Otomasyon: 3 Mağaza (`Apple + Google Play + Huawei`) canlı durum (`npm run stores:status`) ve tek komutla otomatik imzalama/yayınlama (`npm run stores:deploy:android` + GitHub Actions iOS) aktif
- Web: gittigim-yerler.vercel.app (main'den otomatik)
- Çalışma alanları: `PROJELERİM\Gittiğim Yerler` (ana) + `Desktop\GittigimYerler` (ikincil, `git pull` ile senkron)

## Aktif Görev
AKTIF_GOREV: yok

## Bilinen Sorunlar
- Bilinen açık sorun yok. (Google Play 2.9 yayında; iOS 1.0 Derleme 64 ve Huawei 2.9 incelemede).

## Son Değişiklikler
- 2026-10-31: 3 Mağaza Tam Otomasyon Sistemi (`scripts/deploy-stores.mjs` ve `build.gradle` otomatik imzalama) kuruldu; Google Play, Huawei AppGallery ve Apple App Store tek komutla bağlı.
- 2026-10-31: Sürüm 2.9 (vc 16) Google Play'de yayına girdi (`completed`), Huawei AppGallery'de incelemede.
- 2026-10-31: Apple App Store reddi (`4.0.0 Design: Preamble`) çözüldü: APPLE_ID_AUTH yetkisi açıldı, profil yenilendi, iOS 1.0 (Derleme 64) GitHub Actions ile derlenip App Store Connect'e yüklendi ve yeniden incelemeye gönderildi (`WAITING_FOR_REVIEW`).
- 2026-10-30: Sürüm 2.9 (versionCode 16) hazırlandı; Android ve iOS Capacitor senkronize edildi.
- 2026-10-22: Gece gölgesi kaydırma kırpılması çözüldü (L.svg padding: 3.0, kesintisiz 720° boylam ve overflow: visible).
- 2026-10-22: Gece/Gündüz Harita Modu: Gerçek zamanlı güneş zeniti, ay pozisyonu ve solar terminator gölgesi (WorldMapView.js).
- 2026-10-22: Seyahat Cüzdanı & Harcama Yönetimi: Çoklu döviz, 6 kategori, gizlilik modu (👁️) ve mekan çekmecesi harcama girişi (travelBudget.js, ProfileView.js, main.css).
- 2026-10-22: 3 Yeni Özellik: 11 yeni kıta/bölge rozeti (badges.js), haritada uçuş rotaları katmanı (WorldMapView.js), profilde aramalı Seyahat Günlüğü vitrini (ProfileView.js & main.css).
- 2026-10-22: Performans & Kod Bölme: Leaflet ve Firebase modülleri ayrı chunk'lara ayrıldı, ana bundle 1.7 MB'dan 923 kB'a düşürüldü.
- 2026-10-22: Node yerleşik test altyapısı (tests/smoke.test.js & budget.test.js - 10/10 PASS) kuruldu, npm run check'e bağlandı.
