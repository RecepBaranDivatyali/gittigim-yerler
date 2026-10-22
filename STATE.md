# Proje Durumu (STATE)

## Özet
- Uygulama: **Gezgin: Seyahat Haritası** (`com.gittigimyerler.app`)
- Android sürüm: **2.8** (versionCode **15**) — derleme başarılı, mağazaya yüklenmeyi bekliyor
- Web: gittigim-yerler.vercel.app (main'den otomatik)
- Çalışma alanları: `PROJELERİM\Gittiğim Yerler` (ana) + `Desktop\GittigimYerler` (ikincil, `git pull` ile senkron)

## Aktif Görev
AKTIF_GOREV: yok
MUDUR:

## Bilinen Sorunlar
- Ana JS paketi ~1.7 MB (kod bölme yapılmadı).
- iOS Apple Sign-In gerçek cihazda henüz test edilmedi.

## Son Değişiklikler
- 2026-10-22: Orkestrasyon sistemi kuruldu (AGENTS.md, alt ajanlar, kancalar, ESLint + `npm run check`).
- 2026-10-22: Sürüm 2.8 / versionCode 15.
- 2026-10-22: "Eşitleme Hatası" kök nedeni düzeltildi (`unlockedAchievements` kapsam hatası, `syncService.js`).
- 2026-10-22: Firebase Android uygulaması + Play imzalama SHA-1 eklendi (Google girişi `ApiException: 10` çözümü). Apple sağlayıcısı etkin.
- 2026-10-22: Avatar ızgarası kaydırılabilir, hesap verisi izolasyonu, arkadaş arama istatistikleri, uzun kullanıcı adı sığdırma.
