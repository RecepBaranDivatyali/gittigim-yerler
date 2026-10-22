# Yapılacaklar (BACKLOG)

Öncelik: **P0** acil/kırık · **P1** önemli · **P2** iyileştirme. Biten maddeyi `[x]` yapıp `STATE.md` → Son Değişiklikler'e taşı, sonra buradan sil.

## P0
- [ ] Sürüm 2.8 (vc 15) imzalı AAB'yi Google Play'e ve Huawei AppGallery'e yükle (kullanıcı adımı) ve telefonda Google girişini + "Bulut Eşitlendi" rozetini doğrula.

## P1
- [ ] ESLint ilk taramasında çıkan gerçek hataları (`no-undef` vb.) düzelt.
- [ ] iOS: Apple Sign-In'i gerçek cihazda test et (native nonce akışı).
- [ ] Firestore kurallarını sıkılaştır: `users/{userId}` için `user_*` önekli kimliksiz yazma izni kaldırılmalı (şu an herkes `user_xxx` dokümanı yazabiliyor).

## P2
- [ ] Ana JS paketini kod bölme ile küçült (`posterWorldMapSvg` gibi dinamik import'lar, harita verileri lazy-load).
- [ ] Kök dizindeki tek seferlik betikleri temizle/`scratch/`'a taşı (`audit.py`, `audit2.py`, `build2.py`, `append_css.py`, `create_*.py`, `collected.js`).
- [ ] Basit smoke test: `getLocalDataPayload()` ve `stripUndefinedDeep()` için Node testi (`npm run check`'e ekle).
