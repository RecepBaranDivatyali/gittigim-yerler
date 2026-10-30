# Yapılacaklar (BACKLOG)

Öncelik: **P0** acil/kırık · **P1** önemli · **P2** iyileştirme. Biten maddeyi `[x]` yapıp `STATE.md` → Son Değişiklikler'e taşı, sonra buradan sil.

## P0
- [ ] Apple App Store: `4.0.0 Design: Preamble` mesajını ve `Screenshot-1027-151530.png` görselini inceleyip yeni iOS derlemesini gönder + Apple Lisans Sözleşmesini onayla.
- [ ] Sürüm 2.9 (vc 16) imzalı AAB/APK paketini Google Play ve Huawei AppGallery'e yükle.

## P1
- [ ] iOS: Apple Sign-In'i mağaza onayı sonrası gerçek iPhone'da test et.
- [ ] Firestore kurallarını sıkılaştır: `users/{userId}` için `user_*` önekli kimliksiz yazma izni kaldırılmalı (güvenlik kalkanı).

## P2
- [ ] Harita ve seyahat veri katmanlarında ek dinamik lazy-load optimizasyonları.
