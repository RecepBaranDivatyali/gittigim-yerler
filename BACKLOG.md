# Yapılacaklar (BACKLOG)

Öncelik: **P0** acil/kırık · **P1** önemli · **P2** iyileştirme. Biten maddeyi `[x]` yapıp `STATE.md` → Son Değişiklikler'e taşı, sonra buradan sil.

## P0 (360° Denetimden Çıkan Kritik Müdahaleler — Sürüm 3.0 Paketi)
- [ ] **Paket Diyeti (-47 MB):** `public/data/` içindeki kullanılmayan ham `ne_admin1_raw.geojson` (40.7 MB), `world-countries.raw.json` (6.26 MB) ve `regions/*_test.json` dosyalarını mobil paketten çıkar; `@turf/turf` ölü bağımlılığını kaldır ve `posterWorldMapSvg` / `universalSearchData` modüllerini lazy-load yap.
- [ ] **Güvenlik Kalkanı:** `firestore.rules` içinde kimliksiz `user_*` / `apple_*` yazma izinlerini sıkılaştır; `WorldMapView.js` ve `ProfileView.js` içindeki kullanıcı girdilerinde (`photoUrl`, `note`, `avatar`) XSS (`escapeHtml`) korumasını tamamla.
- [ ] **Veri & Kota Koruması:** `storage.js` içindeki tüm `localStorage.setItem` çağrılarını güvenli `try/catch` sarmalayıcısına al, Türkçe arama (`İ/ı` `toLocaleLowerCase('tr')`) ve saat dilimi (`00:00-03:00` UTC kayması) hatalarını düzelt, `syncService.js` başlangıç yarış durumunu (race condition) önle.
- [ ] **Mobil & Harita Deneyimi:** Android fiziksel geri tuşu ile açık modal/çekmeceleri kapatma desteği ekle, iOS poster paylaşımında native `navigator.share` kullan, `WorldMapView.js` bellek sızıntılarını (`pointerup`, `dayNightRenderer`) ve 60 sn'lik Gece/Gündüz DOM yeniden yaratımını optimize et.

## P1
- [ ] **UI/UX Ergonomi:** Küçük ekranlarda (375px) üst bar sıkışmasını ve <44px dokunma alanlarını iyileştir; açık temalardaki sabit koyu renkleri (`#0f172a` / `rgba(30,41,59)`) tema değişkenlerine bağla.
- [ ] **Büyüme (Growth) Özellikleri:** İlk açılışta "10 Saniyede Gezdiğin Ülkeleri Seç" sihirbazı, 9:16 Instagram Story paylaşım formatı ve "Dünya Harikaları / Avrupa Başkentleri" hedef (bucket-list) paketleri.
- [ ] iOS: Apple Sign-In'i mağaza onayı sonrası (1.0 Derleme 64) gerçek iPhone'da test et.
