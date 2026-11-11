# Yapılacaklar (BACKLOG)

Öncelik: **P0** acil/kırık · **P1** önemli · **P2** iyileştirme. Biten maddeyi `[x]` yapıp `STATE.md` → Son Değişiklikler'e taşı, sonra buradan sil.

## P0
- Şu an açık P0 görev yok.

## P1
- [x] Mağaza vitrin görselleri (App Store 1290x2796, Google Play 1080x2400 + 1024x500 Feature Graphic) setini oluştur (`npm run stores:screenshots`).
- [ ] ASO: Apple App Store için 30 karakterlik vurucu "Alt Başlık" (Subtitle) tanımla (Örn: `Dünya Haritası & Gezi Notları`).
- [ ] iOS: Apple Sign-In'i mağaza onayı sonrası gerçek iPhone'da test et.
- [ ] Yeni özellikler sonrası Sürüm 3.0'ı tek komutla (`node scripts/deploy-stores.mjs deploy-android --bump` + iOS workflow) 3 mağazaya yayınla.

## P2
- [ ] İleride isteğe bağlı Push / Yerel Bildirim (`@capacitor/local-notifications`) hatırlatıcıları.
