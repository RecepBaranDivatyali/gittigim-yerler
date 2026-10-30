# Yapılacaklar (BACKLOG)

Öncelik: **P0** acil/kırık · **P1** önemli · **P2** iyileştirme. Biten maddeyi `[x]` yapıp `STATE.md` → Son Değişiklikler'e taşı, sonra buradan sil.

## P0 (2. Tur Didik Didik Denetimden Çıkan İnce Düzeltmeler)
- [ ] **Keşif Paketi Bulut Senkronizasyonu (`bucketLists.js`):** "Kalanları Hedefe Ekle" (`applyBucketListToWishlist`) çağrıldığında `queueCloudSync()` tetiklenmiyor ve `updatedAt` sayısal `Date.now()` yerine ISO string yazılıyor; bulut senkronizasyonu ve sayısal zaman damgası bağlanmalı.
- [ ] **Sihirbazda Veri Koruma (`OnboardingTour.js`):** Hızlı Ülke Seçim Sihirbazı sadece 30 ülke yerine arama yapıldığında tüm 195 dünya ülkesini göstermeli; zaten gezilmiş bir ülkenin tiki kaldırıldığında içindeki eski not/puan/harcamalar silinmeden sadece `status: 'unvisited'` yapılmalı ve sihirbaz ilk kayıtta otomatik açılmalı (`main.js` -> `checkOnboarding`).
- [ ] **Türkiye Sayacı & Yedek Güvenliği (`storage.js`, `ProfileView.js`):** Sihirbazdan Türkiye (`TR`) seçildiğinde Harita, Profil ve Poster sayaçları birebir aynı sayıyı göstermeli; JSON yedek yüklemede (`import`) `photoDataUrl` / `avatar` / `custom_routes` alanları `sanitizePhotoUrl` ve `escapeHtml` ile temizlenmeli; çıkışta `gittigim_yerler_custom_routes_v1` sıfırlanmalı.
- [ ] **Otomatik Sürüm Artırma & İnce UI (`deploy-stores.mjs`, `ProfileView.js`):** `deploy-stores.mjs` içine `--bump` (otomatik `versionCode + 1`) eklenmeli; `ProfileView.js` dinamik import ile ayrılarak ana JS paketi 770 kB'dan ~350 kB'a düşürülmeli; açık temalarda sihirbaz yazıları görünür yapılmalı.

## P1
- [ ] **"🎲 Sıradaki Rotam Nereye? (Kader Çarkı)" ve Keşif Paketi Kutlaması:** Hedef listesinden veya vizesiz ülkelerden tek tuşla rastgele seyahat öneren eğlenceli mini özellik ve %100 tamamlanan Keşif Paketlerine özel kutlama/rozet.
- [ ] iOS 1.0 (Derleme 64) ve Huawei 2.9 onaylandıktan sonra Sürüm 3.0'ı tek komutla 3 mağazaya yayınla.
