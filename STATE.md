# Proje Durumu (STATE)

## Özet
- Uygulama: **Gezgin: Seyahat Haritası** (`com.gittigimyerler.app`)
- iOS sürüm: **1.0 (Derleme 64)** — Apple App Store'da **Yayında / Onaylandı (`READY_FOR_SALE`)** 🎉🍏
- Android sürüm: **2.9** (versionCode **16**) — Google Play'de **Yayında (`completed`)** 🟢, Huawei AppGallery'de **Yayında (`State 0`)** 🌸
- Otomasyon: 3 Mağaza (`Apple + Google Play + Huawei`) canlı durum (`npm run stores:status`) ve tek komutla otomatik imzalama/yayınlama aktif
- Web: gittigim-yerler.vercel.app (main'den otomatik yayında)
- Çalışma alanları: `PROJELERİM\Gittiğim Yerler` (ana) + `Desktop\GittigimYerler` (ikincil, `git pull` ile senkron)

## Aktif Görev
AKTIF_GOREV: yok

## Bilinen Sorunlar
- Bilinen açık sorun yok. (Apple App Store, Google Play ve Huawei AppGallery'de tüm sürümler onaylandı ve YAYINDA 🎉).

## Son Değişiklikler
- 2026-11-13: Veritabanı, Auth ve Kullanıcı Adı giriş akışı düzeltildi (E-posta veya Kullanıcı Adı girişi, cihaz içi güvenli hesap hatırlama, maskeli e-posta ipucu, Firestore UID sahiplik kuralları, çıkışta yerel dizin temizliği, eski user_ bulut verisi uyumluluğu; 19/19 test PASS, güvenlik denetimi TEMİZ).
- 2026-11-11: Mağaza vitrin görsellerinde kamera çakışması (bağımsız status bar ile) ve telefonun alt kısmının kesilmesi (4 köşeli tam kasa ve home bar ile) giderildi. Yeni görseller ve artifact güncellendi.
- 2026-11-11: Mağaza vitrin görselleri seti (App Store 1290x2796, Google Play 1080x2400 ve 1024x500 Feature Graphic) Puppeteer otomasyonu ile sıfırdan üretildi (`npm run stores:screenshots`). ProfileView bucket list renderındaki progress alanları ve triggerConfetti çağrısı düzeltildi.
- 2026-11-11: Huawei AppGallery 2.9 sürümü başarıyla onaylandı ve yayına girdi (`State 0`). 3 mağazanın tümü yeşil ve yayında!
- 2026-11-06: Huawei AppGallery 2.9 sürümü gizlilik etiketi form yapılandırması tamamlanarak başarıyla tekrar incelemeye gönderildi (`State 5`).
- 2026-11-06: Apple App Store 1.0 (Derleme 64) resmi olarak onaylandı ve yayına girdi (`READY_FOR_SALE`).
- 2026-10-31: 360° Denetimdeki 6 maddenin tamamı uygulandı (-47 MB temizlik, Hızlı Ülke Seçim Sihirbazı, 6 Keşif Paketi, döviz dönüşümlü bütçe, Android geri tuşu, iOS paylaşım, güvenlik kalkanı, 18/18 test PASS).
- 2026-10-31: Sürüm 2.9 (vc 16) Google Play'de yayına girdi (`completed`).
