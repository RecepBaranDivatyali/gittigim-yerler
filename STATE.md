# Proje Durumu (STATE)

## Özet
- Uygulama: **Gezgin: Seyahat Haritası** (`com.gittigimyerler.app`)
- iOS sürüm: **3.0** (GitHub Actions derlemesi tetiklendi; önceki **1.0 (Derleme 64)** yayında) 🍏
- Android sürüm: **3.0** (versionCode **17**) — Google Play'e **Yüklendi** 🟢, Huawei AppGallery'de **İncelemede** 🌸
- Otomasyon: 3 Mağaza (`Apple + Google Play + Huawei`) canlı durum (`npm run stores:status`) ve tek komutla otomatik imzalama/yayınlama aktif
- Web: gittigim-yerler.vercel.app (main'den otomatik yayında)
- Çalışma alanları: `PROJELERİM\Gittiğim Yerler` (ana) + `Desktop\GittigimYerler` (ikincil, `git pull` ile senkron)

## Aktif Görev
AKTIF_GOREV: yok

## Bilinen Sorunlar
- Bilinen açık sorun yok.

## Son Değişiklikler
- 2026-11-13: Sürüm 3.0 (vc 17) Android paketleri derlendi ve Google Play + Huawei AppGallery'ye gönderildi; deploy-stores.mjs Huawei OBS `fileName` parametresi düzeltildi; iOS 3.0 GitHub Actions derlemesi tetiklendi.
- 2026-11-13: Veritabanı, Auth ve Kullanıcı Adı giriş akışı düzeltildi (E-posta veya Kullanıcı Adı girişi, cihaz içi güvenli hesap hatırlama, maskeli e-posta ipucu, Firestore UID sahiplik kuralları, çıkışta yerel dizin temizliği, eski user_ bulut verisi uyumluluğu; 19/19 test PASS, güvenlik denetimi TEMİZ).
- 2026-11-11: Mağaza vitrin görsellerinde kamera çakışması (bağımsız status bar ile) ve telefonun alt kısmının kesilmesi (4 köşeli tam kasa ve home bar ile) giderildi. Yeni görseller ve artifact güncellendi.
- 2026-11-11: Mağaza vitrin görselleri seti (App Store 1290x2796, Google Play 1080x2400 ve 1024x500 Feature Graphic) Puppeteer otomasyonu ile sıfırdan üretildi (`npm run stores:screenshots`). ProfileView bucket list renderındaki progress alanları ve triggerConfetti çağrısı düzeltildi.
- 2026-11-11: Huawei AppGallery 2.9 sürümü başarıyla onaylandı ve yayına girdi (`State 0`). 3 mağazanın tümü yeşil ve yayında!
- 2026-11-06: Huawei AppGallery 2.9 sürümü gizlilik etiketi form yapılandırması tamamlanarak başarıyla tekrar incelemeye gönderildi (`State 5`).
- 2026-11-06: Apple App Store 1.0 (Derleme 64) resmi olarak onaylandı ve yayına girdi (`READY_FOR_SALE`).
- 2026-10-31: 360° Denetimdeki 6 maddenin tamamı uygulandı (-47 MB temizlik, Hızlı Ülke Seçim Sihirbazı, 6 Keşif Paketi, döviz dönüşümlü bütçe, Android geri tuşu, iOS paylaşım, güvenlik kalkanı, 18/18 test PASS).
- 2026-10-31: Sürüm 2.9 (vc 16) Google Play'de yayına girdi (`completed`).
