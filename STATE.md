# Proje Durumu (STATE)

## Özet
- Uygulama: **Gezgin: Seyahat Haritası** (`com.gittigimyerler.app`)
- iOS sürüm: **1.0 (Derleme 64)** — App Store Connect'te incelemede (**Waiting for Review**)
- Android sürüm: **2.9** (versionCode **16**) — Google Play'de **Yayında (`completed`)**, Huawei AppGallery'de **İncelemede (`State 5`)**
- Otomasyon: 3 Mağaza (`Apple + Google Play + Huawei`) canlı durum (`npm run stores:status`) ve tek komutla otomatik imzalama/yayınlama (`--bump` destekli) aktif
- Web: gittigim-yerler.vercel.app (main'den otomatik)
- Çalışma alanları: `PROJELERİM\Gittiğim Yerler` (ana) + `Desktop\GittigimYerler` (ikincil, `git pull` ile senkron)

## Aktif Görev
AKTIF_GOREV: yok

## Bilinen Sorunlar
- Bilinen açık sorun yok. (Google Play 2.9 yayında; iOS 1.0 Derleme 64 ve Huawei 2.9 incelemede).

## Son Değişiklikler
- 2026-10-31: 2. Tur Derin Denetim iyileştirmeleri tamamlandı: "🎲 Şansımı Dene (Rota Çevir)" butonu, Keşif Paketlerinden haritaya uçuş, sihirbazda 195 ülke arama ve eski anıları koruma, ProfileView lazy-split (ana paket 770 kB -> 367 kB), çıkışta özel uçuş rotası temizliği, `--bump` sürüm artırma ve 18/18 test PASS.
- 2026-10-31: 2. Tur Derinlemesine (Didik Didik) 360° Denetim tamamlandı.
- 2026-10-31: 360° Denetimdeki 6 maddenin tamamı uygulandı (-47 MB temizlik, Hızlı Ülke Seçim Sihirbazı, 6 Keşif Paketi, döviz dönüşümlü bütçe, Android geri tuşu, iOS paylaşım, güvenlik kalkanı, 17/17 test PASS).
- 2026-10-31: 7 uzman ajanla 1. tur 360° kapsamlı uygulama denetimi tamamlandı.
- 2026-10-31: 3 Mağaza Tam Otomasyon Sistemi (`scripts/deploy-stores.mjs` ve `build.gradle` otomatik imzalama) kuruldu.
- 2026-10-31: Sürüm 2.9 (vc 16) Google Play'de yayına girdi (`completed`), Huawei AppGallery'de incelemede.
- 2026-10-31: Apple App Store reddi (`4.0.0 Design: Preamble`) çözüldü, iOS 1.0 (Derleme 64) yeniden incelemeye gönderildi (`WAITING_FOR_REVIEW`).
- 2026-10-30: Sürüm 2.9 (versionCode 16) hazırlandı; Android ve iOS Capacitor senkronize edildi.
- 2026-10-22: Gece gölgesi kaydırma kırpılması çözüldü.
- 2026-10-22: Gece/Gündüz Harita Modu ve Seyahat Cüzdanı eklendi.
