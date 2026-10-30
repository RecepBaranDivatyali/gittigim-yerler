# Proje Durumu (STATE)

## Özet
- Uygulama: **Gezgin: Seyahat Haritası** (`com.gittigimyerler.app`)
- iOS sürüm: **1.0 (Derleme 64)** — Native Apple Sign-In (Face ID / Touch ID) ile derlendi, App Store Connect'e yüklendi ve yeniden incelemeye gönderildi (**Waiting for Review**)
- Android sürüm: **2.9** (versionCode **16**) — Yeni özelliklerle derlendi, Google Play ve Huawei AppGallery için hazır
- Web: gittigim-yerler.vercel.app (main'den otomatik)
- Çalışma alanları: `PROJELERİM\Gittiğim Yerler` (ana) + `Desktop\GittigimYerler` (ikincil, `git pull` ile senkron)

## Aktif Görev
AKTIF_GOREV: yok

## Bilinen Sorunlar
- Bilinen açık sorun yok. (iOS 1.0 Derleme 64 Apple incelemesinde).

## Son Değişiklikler
- 2026-10-31: Apple App Store reddi (`4.0.0 Design: Preamble`) çözüldü: APPLE_ID_AUTH yetkisi açıldı, profil yenilendi, iOS 1.0 (Derleme 64) GitHub Actions ile derlenip App Store Connect'e yüklendi ve yeniden incelemeye gönderildi (`WAITING_FOR_REVIEW`).
- 2026-10-30: Sürüm 2.9 (versionCode 16) hazırlandı; Android ve iOS Capacitor senkronize edildi.
- 2026-10-22: Gece gölgesi kaydırma kırpılması çözüldü (L.svg padding: 3.0, kesintisiz 720° boylam ve overflow: visible).
- 2026-10-22: Gece/Gündüz Harita Modu: Gerçek zamanlı güneş zeniti, ay pozisyonu ve solar terminator gölgesi (WorldMapView.js).
- 2026-10-22: Seyahat Cüzdanı & Harcama Yönetimi: Çoklu döviz, 6 kategori, gizlilik modu (👁️) ve mekan çekmecesi harcama girişi (travelBudget.js, ProfileView.js, main.css).
- 2026-10-22: 3 Yeni Özellik: 11 yeni kıta/bölge rozeti (badges.js), haritada uçuş rotaları katmanı (WorldMapView.js), profilde aramalı Seyahat Günlüğü vitrini (ProfileView.js & main.css).
- 2026-10-22: Performans & Kod Bölme: Leaflet ve Firebase modülleri ayrı chunk'lara ayrıldı, ana bundle 1.7 MB'dan 923 kB'a düşürüldü.
- 2026-10-22: Node yerleşik test altyapısı (tests/smoke.test.js & budget.test.js - 10/10 PASS) kuruldu, npm run check'e bağlandı.
- 2026-10-22: Kök dizindeki geçici betikler scratch/'e arşivlendi.
- 2026-10-22: Sürüm 2.8 (vc 15) Google Play'e yüklendi.
