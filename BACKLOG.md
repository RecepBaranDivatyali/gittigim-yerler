# Yapılacaklar (BACKLOG)

Öncelik: **P0** acil/kırık · **P1** önemli · **P2** iyileştirme. Biten maddeyi `[x]` yapıp `STATE.md` → Son Değişiklikler'e taşı, sonra buradan sil.

## P0
- [ ] Mağaza onayları sonrası telefonda canlı doğrulamalar: Google ile Giriş ve "Bulut Eşitlendi" rozeti kontrolü.

## P1
- [ ] iOS: Apple Sign-In'i mağaza onayı sonrası gerçek iPhone'da test et.
- [ ] Firestore kurallarını sıkılaştır: `users/{userId}` için `user_*` önekli kimliksiz yazma izni kaldırılmalı (güvenlik kalkanı).

## P2
- [ ] Harita ve seyahat veri katmanlarında ek dinamik lazy-load optimizasyonları.
