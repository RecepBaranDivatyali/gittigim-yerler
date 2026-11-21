# Yapılacaklar (BACKLOG)

Öncelik: **P0** acil/kırık · **P1** önemli · **P2** iyileştirme. Biten maddeyi `[x]` yapıp `STATE.md` → Son Değişiklikler'e taşı, sonra buradan sil.

## P0
- [ ] Keşif paketlerindeki `[object Object]` ülke etiketi hatasını, masaüstü arama çubuğu çakışmasını ve açık tema (`Aydınlık`/`Atlas Klasik`) kontrast hatalarını düzelt.
- [ ] Mobil uygulamada geri bildirim 404 URL hatasını (`WorldMapView.js:2160`) ve çevrimdışı ilk Profil açılışında ekran kilitlenmesini (`main.js:117`) düzelt.
- [ ] Çıkışta (`logout`) kalan `gv_city_notes`, `gv_custom_routes`, `gv_visa_data` ve `await deleteAllPhotos()` temizliğini, `storage.js` açık Telegram token'ını ve `firestore.rules` (`feedbacks`, `trip_invitations`, `community_reviews`) kurallarını düzelt.

## P1
- [ ] Harita aramasında Türkçe `'İ'` (`toLocaleLowerCase('tr-TR')`), Tayvan (`CN-TW` -> `TW`), `XN.json` 404 ve İngilizce çeviri / `Sürüm 3.0` metinlerini düzelt.
- [ ] ASO: Apple App Store için 30 karakterlik vurucu "Alt Başlık" (Subtitle) tanımla (Örn: `Dünya Haritası & Gezi Notları`). (Henüz eklenmediyse bir sonraki sürümde).
- [ ] iOS: Apple Sign-In'i mağaza onayı sonrası gerçek iPhone'da test et.

## P2
- [ ] İleride isteğe bağlı Push / Yerel Bildirim (`@capacitor/local-notifications`) hatırlatıcıları.
