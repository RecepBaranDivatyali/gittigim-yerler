# Proje Durumu (STATE)

## Özet
- Uygulama: **Gezgin: Seyahat Haritası** (`com.gittigimyerler.app`)
- iOS sürüm: **1.0 (Derleme 64)** — App Store Connect'te incelemede (**Waiting for Review**)
- Android sürüm: **2.9** (versionCode **16**) — Google Play'de **Yayında (`completed`)**, Huawei AppGallery'de **İncelemede (`State 5`)**
- Otomasyon: 3 Mağaza (`Apple + Google Play + Huawei`) canlı durum (`npm run stores:status`) ve tek komutla otomatik imzalama/yayınlama aktif
- Web: gittigim-yerler.vercel.app (main'den otomatik)
- Çalışma alanları: `PROJELERİM\Gittiğim Yerler` (ana) + `Desktop\GittigimYerler` (ikincil, `git pull` ile senkron)

## Aktif Görev
AKTIF_GOREV: yok

## Bilinen Sorunlar
- Bilinen açık sorun yok. (Google Play 2.9 yayında; iOS 1.0 Derleme 64 ve Huawei 2.9 incelemede).

## Son Değişiklikler
- 2026-10-31: 360° Denetimdeki 6 maddenin tamamı uygulandı: -47 MB ham GeoJSON temizliği, ana JS paketinin 955 kB'dan 220 kB'a (%77 küçülme!) düşürülmesi, "⚡ 10 Saniyede Gezdiğin Ülkeleri Seç" hızlı başlangıç sihirbazı, 6 adet "🎯 Hazır Keşif & Hedef Paketi", çevrimdışı veri birleştirme, döviz dönüşümlü bütçe, Android geri tuşu, iOS native poster paylaşımı, 10 tema/ergonomi düzeltmesi ve güvenlik kalkanı (13/13 test PASS).
- 2026-10-31: 7 uzman ajanla (`guvenlikci`, `haritaci`, `arayuzcu`, `kodlayici`, `mobilci`, `pazarlamaci`, `testci`) 360° kapsamlı uygulama denetimi tamamlandı.
- 2026-10-31: 3 Mağaza Tam Otomasyon Sistemi (`scripts/deploy-stores.mjs` ve `build.gradle` otomatik imzalama) kuruldu.
- 2026-10-31: Sürüm 2.9 (vc 16) Google Play'de yayına girdi (`completed`), Huawei AppGallery'de incelemede.
- 2026-10-31: Apple App Store reddi (`4.0.0 Design: Preamble`) çözüldü, iOS 1.0 (Derleme 64) yeniden incelemeye gönderildi (`WAITING_FOR_REVIEW`).
- 2026-10-30: Sürüm 2.9 (versionCode 16) hazırlandı; Android ve iOS Capacitor senkronize edildi.
- 2026-10-22: Gece gölgesi kaydırma kırpılması çözüldü.
- 2026-10-22: Gece/Gündüz Harita Modu ve Seyahat Cüzdanı eklendi.
- 2026-10-22: 3 Yeni Özellik: 11 yeni kıta/bölge rozeti, haritada uçuş rotaları katmanı, profilde Seyahat Günlüğü vitrini.
- 2026-10-22: Performans & Kod Bölme: Leaflet ve Firebase modülleri ayrı chunk'lara ayrıldı.
