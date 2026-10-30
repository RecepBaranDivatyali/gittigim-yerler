#!/usr/bin/env node

/**
 * Gezgin — Çoklu Mağaza (Apple App Store, Google Play, Huawei AppGallery)
 * Durum Sorgulama, Android Derleme ve Otomatik Yayınlama Sistemi
 *
 * Kullanım:
 *   node scripts/deploy-stores.mjs [status]
 *   node scripts/deploy-stores.mjs build-android
 *   node scripts/deploy-stores.mjs deploy-google [--name="..."] [--notes="..."]
 *   node scripts/deploy-stores.mjs deploy-huawei [--notes="..."]
 *   node scripts/deploy-stores.mjs deploy-android [--name="..."] [--notes="..."]
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Sabit Tanımlar
const GOOGLE_PACKAGE_NAME = 'com.gittigimyerler.app';
const GOOGLE_SA_PATH = path.join(ROOT_DIR, 'store-secrets', 'google-play-service-account.json');

const HUAWEI_APP_ID = '119214467';
const HUAWEI_SA_PATH = path.join(ROOT_DIR, 'store-secrets', 'huawei-service-account.json');

const APPLE_APP_ID = '6819730129';
const IOS_CERTS_DIR = path.join(ROOT_DIR, 'ios-certs');

const ANDROID_DIR = path.join(ROOT_DIR, 'android');
const RELEASE_AAB_PATH = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab');
const RELEASE_APK_PATH = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');

// Varsayılan Sürüm Notu
const DEFAULT_RELEASE_NOTES = [
  '🌍 Gezgin 2.9 ile Büyük Güncelleme!',
  '• 🌓 Canlı Gece/Gündüz Haritası: Dünyadaki anlık güneş ve ay konumunu, gece/gündüz sınırını harita üzerinde canlı takip edin.',
  '• ✈️ Uçuş ve Seyahat Rotaları: Gezdiğiniz noktalar arasındaki seyahat rotalarınızı haritada görselleştirin.',
  '• 💰 Seyahat Cüzdanı: Gezilerinizdeki harcamalarınızı çoklu döviz ve kategori desteğiyle kaydedin, bütçenizi takip edin.',
  '• 📖 Seyahat Günlüğü Vitrini: Tüm şehir ve ülke anılarınızı profilinizde tek ekrandan arayın ve filtreleyin.'
].join('\n');

const DEFAULT_RELEASE_NAME = '🌍 Gezgin 2.9 ile Büyük Güncelleme!';

// CLI Argümanlarını Ayıkla
function parseCliArgs() {
  const args = process.argv.slice(2);
  const command = (args[0] && !args[0].startsWith('--')) ? args[0] : 'status';
  const options = {
    command,
    name: DEFAULT_RELEASE_NAME,
    notes: DEFAULT_RELEASE_NOTES
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--name=')) {
      options.name = arg.slice(7);
    } else if (arg === '--name' && args[i + 1]) {
      options.name = args[++i];
    } else if (arg.startsWith('--notes=')) {
      options.notes = arg.slice(8);
    } else if (arg === '--notes' && args[i + 1]) {
      options.notes = args[++i];
    }
  }

  return options;
}

// ---------------------------------------------------------------------------
// HTTP İstek Yardımcısı (fetch / https)
// ---------------------------------------------------------------------------
function httpRequest(urlStr, options = {}, bodyBuffer = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const reqOptions = {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || 443,
      path: `${url.pathname}${url.search}`,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Gezgin-Deploy-Bot/1.0',
        ...options.headers
      }
    };

    if (bodyBuffer) {
      reqOptions.headers = {
        ...reqOptions.headers,
        'Content-Length': Buffer.isBuffer(bodyBuffer) ? bodyBuffer.length : Buffer.byteLength(bodyBuffer)
      };
    }

    const req = https.request(reqOptions, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks);
        const str = raw.toString('utf8');
        let parsed = null;
        try {
          parsed = JSON.parse(str);
        } catch {
          parsed = null;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed,
          rawString: str,
          rawBuffer: raw
        });
      });
    });

    req.on('error', reject);

    if (bodyBuffer) {
      req.write(bodyBuffer);
    }
    req.end();
  });
}

// ---------------------------------------------------------------------------
// 1. GOOGLE PLAY STORE SERVİSİ
// ---------------------------------------------------------------------------
async function getGoogleAccessToken() {
  if (!fs.existsSync(GOOGLE_SA_PATH)) {
    throw new Error(`Google Play Service Account JSON bulunamadı: ${GOOGLE_SA_PATH}`);
  }
  const sa = JSON.parse(fs.readFileSync(GOOGLE_SA_PATH, 'utf8'));
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600
  })).toString('base64url');

  const unsigned = `${header}.${payload}`;
  const sig = crypto.sign('sha256', Buffer.from(unsigned), sa.private_key).toString('base64url');
  const assertion = `${unsigned}.${sig}`;

  const postData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${assertion}`;
  const res = await httpRequest(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }, postData);

  if (res.statusCode !== 200 || !res.data?.access_token) {
    throw new Error(`Google OAuth token alınamadı (${res.statusCode}): ${res.rawString}`);
  }

  return res.data.access_token;
}

async function getGooglePlayStatus() {
  try {
    const token = await getGoogleAccessToken();
    const baseUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${GOOGLE_PACKAGE_NAME}`;

    // Geçici bir edit aç
    const editRes = await httpRequest(`${baseUrl}/edits`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (editRes.statusCode !== 200 || !editRes.data?.id) {
      return {
        success: false,
        error: `Google Play edit oluşturulamadı (${editRes.statusCode}): ${editRes.rawString}`
      };
    }

    const editId = editRes.data.id;

    // Production track bilgisini oku
    const trackRes = await httpRequest(`${baseUrl}/edits/${editId}/tracks/production`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Geçici edit'i temizle
    await httpRequest(`${baseUrl}/edits/${editId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(() => {});

    if (trackRes.statusCode === 200 && trackRes.data?.releases?.length) {
      const rel = trackRes.data.releases[0];
      return {
        success: true,
        store: 'Google Play Store',
        packageName: GOOGLE_PACKAGE_NAME,
        track: 'production',
        releaseName: rel.name || 'İsimsiz',
        versionCodes: rel.versionCodes || [],
        status: rel.status || 'Bilinmiyor',
        statusTr: rel.status === 'completed' ? 'Yayında / Tamamlandı' : rel.status === 'inProgress' ? 'Aşamalı Yayında' : rel.status
      };
    }

    return {
      success: true,
      store: 'Google Play Store',
      packageName: GOOGLE_PACKAGE_NAME,
      track: 'production',
      releaseName: 'Aktif sürüm bulunamadı',
      versionCodes: [],
      status: 'Boş',
      statusTr: 'Yayında sürüm yok'
    };
  } catch (err) {
    return { success: false, store: 'Google Play Store', error: err.message };
  }
}

async function deployGooglePlay({ name, notes }) {
  console.log('\n🚀 [1/3] Google Play Store Yükleme Başlıyor...');
  if (!fs.existsSync(RELEASE_AAB_PATH)) {
    throw new Error(`Google Play için AAB paketi bulunamadı: ${RELEASE_AAB_PATH}\nÖnce "npm run stores:build:android" çalıştırın.`);
  }

  const token = await getGoogleAccessToken();
  const baseUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${GOOGLE_PACKAGE_NAME}`;
  const uploadBaseUrl = `https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/${GOOGLE_PACKAGE_NAME}`;

  console.log('  1. Yeni bir yayın düzenleme (edit) oturumu açılıyor...');
  const editRes = await httpRequest(`${baseUrl}/edits`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (editRes.statusCode !== 200 || !editRes.data?.id) {
    throw new Error(`Google Play edit açılamadı (${editRes.statusCode}): ${editRes.rawString}`);
  }

  const editId = editRes.data.id;
  console.log(`  ✓ Edit ID: ${editId}`);

  try {
    console.log('  2. AAB paketi Google Play sunucularına yükleniyor...');
    const aabBuffer = fs.readFileSync(RELEASE_AAB_PATH);
    const aabSizeMb = (aabBuffer.length / (1024 * 1024)).toFixed(2);
    console.log(`     Dosya: app-release.aab (${aabSizeMb} MB)`);

    const uploadRes = await httpRequest(
      `${uploadBaseUrl}/edits/${editId}/bundles?uploadType=media`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/octet-stream'
        }
      },
      aabBuffer
    );

    if (uploadRes.statusCode !== 200 || !uploadRes.data?.versionCode) {
      throw new Error(`AAB yükleme başarısız (${uploadRes.statusCode}): ${uploadRes.rawString}`);
    }

    const uploadedVersionCode = uploadRes.data.versionCode;
    console.log(`  ✓ Paket başarıyla yüklendi. VersionCode: ${uploadedVersionCode}`);

    console.log('  3. Production yayın hattı (track) güncelleniyor...');
    const trackPayload = JSON.stringify({
      track: 'production',
      releases: [{
        name: name || DEFAULT_RELEASE_NAME,
        versionCodes: [String(uploadedVersionCode)],
        status: 'completed',
        releaseNotes: [{
          language: 'tr-TR',
          text: notes || DEFAULT_RELEASE_NOTES
        }]
      }]
    });

    const trackRes = await httpRequest(
      `${baseUrl}/edits/${editId}/tracks/production`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      },
      Buffer.from(trackPayload)
    );

    if (trackRes.statusCode !== 200) {
      throw new Error(`Track güncellenemedi (${trackRes.statusCode}): ${trackRes.rawString}`);
    }
    console.log('  ✓ Production sürüm bilgileri ve Türkçe notlar eklendi.');

    console.log('  4. Düzenleme kaydediliyor ve onaylanıyor (commit)...');
    const commitRes = await httpRequest(`${baseUrl}/edits/${editId}:commit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (commitRes.statusCode !== 200) {
      throw new Error(`Commit işlemi başarısız (${commitRes.statusCode}): ${commitRes.rawString}`);
    }

    console.log(`🎉 Google Play Store yayını başarıyla tamamlandı! (VersionCode: ${uploadedVersionCode})`);
    return { success: true, versionCode: uploadedVersionCode };
  } catch (err) {
    // Hata durumunda edit oturumunu sil
    await httpRequest(`${baseUrl}/edits/${editId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(() => {});
    throw err;
  }
}

// ---------------------------------------------------------------------------
// 2. HUAWEI APPGALLERY SERVİSİ
// ---------------------------------------------------------------------------
function getHuaweiJwt() {
  if (!fs.existsSync(HUAWEI_SA_PATH)) {
    throw new Error(`Huawei Service Account JSON bulunamadı: ${HUAWEI_SA_PATH}`);
  }
  const j = JSON.parse(fs.readFileSync(HUAWEI_SA_PATH, 'utf8'));
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: 'PS256', kid: j.key_id, typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: j.sub_account,
    aud: j.token_uri,
    iat: now,
    exp: now + 3600
  })).toString('base64url');

  const unsigned = `${header}.${payload}`;
  const sig = crypto.sign('sha256', Buffer.from(unsigned), {
    key: j.private_key,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
  }).toString('base64url');

  return {
    jwt: `${unsigned}.${sig}`,
    subAccount: j.sub_account
  };
}

const HUAWEI_STATE_MAP = {
  0: 'Yayında',
  1: 'Yayınlanıyor',
  2: 'Yayın İptal Edildi',
  3: 'Yayından Kaldırıldı',
  4: 'Reddedildi',
  5: 'İncelemede',
  6: 'Güncelleniyor / İnceleme Bekliyor',
  7: 'Taslak'
};

async function getHuaweiStatus() {
  try {
    const { jwt, subAccount } = getHuaweiJwt();
    const url = `https://connect-api.cloud.huawei.com/api/publish/v2/app-info?appId=${HUAWEI_APP_ID}`;

    const res = await httpRequest(url, {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'client_id': subAccount
      }
    });

    if (res.statusCode !== 200 || !res.data?.appInfo) {
      return {
        success: false,
        store: 'Huawei AppGallery',
        error: `Huawei API yanıtı geçersiz (${res.statusCode}): ${res.rawString}`
      };
    }

    const info = res.data.appInfo;
    const releaseState = info.releaseState;
    return {
      success: true,
      store: 'Huawei AppGallery',
      appId: HUAWEI_APP_ID,
      versionNumber: info.versionNumber || '—',
      versionCode: info.versionCode || '—',
      onShelfVersionNumber: info.onShelfVersionNumber || '—',
      releaseState,
      statusTr: HUAWEI_STATE_MAP[releaseState] || `Durum Kodu: ${releaseState}`,
      auditOpinion: res.data.auditInfo?.auditOpinion || null
    };
  } catch (err) {
    return { success: false, store: 'Huawei AppGallery', error: err.message };
  }
}

async function deployHuaweiAppGallery({ notes }) {
  console.log('\n🚀 [2/3] Huawei AppGallery Yükleme Başlıyor...');
  if (!fs.existsSync(RELEASE_APK_PATH)) {
    throw new Error(`Huawei AppGallery için APK paketi bulunamadı: ${RELEASE_APK_PATH}\nÖnce "npm run stores:build:android" çalıştırın.`);
  }

  const { jwt, subAccount } = getHuaweiJwt();
  const apkBuffer = fs.readFileSync(RELEASE_APK_PATH);
  const apkSizeMb = (apkBuffer.length / (1024 * 1024)).toFixed(2);
  const sha256 = crypto.createHash('sha256').update(apkBuffer).digest('hex');
  const contentLength = apkBuffer.length;

  console.log(`  1. Dosya bilgileri hazırlandı: app-release.apk (${apkSizeMb} MB, sha256: ${sha256.slice(0, 12)}...)`);
  console.log('  2. Huawei OBS güvenli yükleme adresi alınıyor...');

  const getUrl = `https://connect-api.cloud.huawei.com/api/publish/v2/upload-url/for-obs?appId=${HUAWEI_APP_ID}&suffix=apk&contentLength=${contentLength}&sha256=${sha256}`;
  const urlRes = await httpRequest(getUrl, {
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'client_id': subAccount
    }
  });

  if (urlRes.statusCode !== 200 || !urlRes.data?.urlInfo?.url) {
    throw new Error(`Huawei OBS upload adresi alınamadı (${urlRes.statusCode}): ${urlRes.rawString}`);
  }

  const { url: uploadUrl, headers: uploadHeaders = {}, objectId } = urlRes.data.urlInfo;
  console.log(`  ✓ OBS yükleme adresi ve objectId alındı (${objectId.slice(0, 20)}...)`);

  console.log('  3. APK paketi Huawei OBS bulut deposuna yükleniyor...');
  const obsHeaders = {
    ...uploadHeaders,
    'Content-Length': contentLength
  };

  const obsRes = await httpRequest(uploadUrl, {
    method: 'PUT',
    headers: obsHeaders
  }, apkBuffer);

  if (obsRes.statusCode < 200 || obsRes.statusCode >= 300) {
    throw new Error(`Huawei OBS yüklemesi başarısız (${obsRes.statusCode}): ${obsRes.rawString}`);
  }
  console.log('  ✓ APK dosyası Huawei OBS sunucusuna başarıyla yüklendi.');

  console.log('  4. Yüklenen APK paketi AppGallery uygulamasına bağlanıyor...');
  const fileInfoPayload = JSON.stringify({
    fileType: 5, // APK
    files: [{
      fileName: 'app-release.apk',
      fileDestUrl: objectId
    }]
  });

  const fileInfoRes = await httpRequest(
    `https://connect-api.cloud.huawei.com/api/publish/v2/app-file-info?appId=${HUAWEI_APP_ID}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'client_id': subAccount,
        'Content-Type': 'application/json'
      }
    },
    Buffer.from(fileInfoPayload)
  );

  if (fileInfoRes.statusCode !== 200 || (fileInfoRes.data?.ret?.code !== 0 && fileInfoRes.data?.ret?.code !== undefined)) {
    throw new Error(`Paket AppGallery'ye bağlanamadı (${fileInfoRes.statusCode}): ${fileInfoRes.rawString}`);
  }
  console.log('  ✓ Paket AppGallery uygulamasına bağlandı.');

  if (notes) {
    console.log('  5. Sürüm notları (tr-TR) güncelleniyor...');
    const langPayload = JSON.stringify({
      lang: 'tr-TR',
      newFeatures: notes
    });

    const langRes = await httpRequest(
      `https://connect-api.cloud.huawei.com/api/publish/v2/app-language-info?appId=${HUAWEI_APP_ID}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'client_id': subAccount,
          'Content-Type': 'application/json'
        }
      },
      Buffer.from(langPayload)
    );

    if (langRes.statusCode === 200 && (!langRes.data?.ret?.code || langRes.data?.ret?.code === 0)) {
      console.log('  ✓ Türkçe sürüm notları başarıyla güncellendi.');
    } else {
      console.warn(`  ⚠️ Sürüm notu güncellenirken uyarı (${langRes.statusCode}): ${langRes.rawString}`);
    }
  }

  console.log('  6. Uygulama Huawei AppGallery incelemesine gönderiliyor...');
  const submitRes = await httpRequest(
    `https://connect-api.cloud.huawei.com/api/publish/v2/app-submit?appId=${HUAWEI_APP_ID}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'client_id': subAccount,
        'Content-Type': 'application/json'
      }
    }
  );

  if (submitRes.statusCode !== 200 || (submitRes.data?.ret?.code !== 0 && submitRes.data?.ret?.code !== undefined)) {
    throw new Error(`İncelemeye gönderme başarısız (${submitRes.statusCode}): ${submitRes.rawString}`);
  }

  console.log('🎉 Huawei AppGallery incelemeye gönderme işlemi tamamlandı!');
  return { success: true };
}

// ---------------------------------------------------------------------------
// 3. APPLE APP STORE CONNECT SERVİSİ
// ---------------------------------------------------------------------------
function resolveAppleCredentials() {
  if (!fs.existsSync(IOS_CERTS_DIR)) {
    throw new Error(`iOS sertifika klasörü bulunamadı: ${IOS_CERTS_DIR}`);
  }

  // Öncelik 1: AuthKey_794W42S97A.p8
  const p8_794 = path.join(IOS_CERTS_DIR, 'AuthKey_794W42S97A.p8');
  if (fs.existsSync(p8_794)) {
    return {
      keyId: '794W42S97A',
      issuerId: process.env.APP_STORE_CONNECT_ISSUER_ID || '8f0ee78a-746b-4aaa-9157-3288d2c6a92f',
      privateKey: fs.readFileSync(p8_794, 'utf8')
    };
  }

  // Öncelik 2: AuthKey_*.p8 eşleşmesi (örn: AuthKey_H39VJD32P3.p8)
  const files = fs.readdirSync(IOS_CERTS_DIR);
  for (const f of files) {
    const match = f.match(/^AuthKey_([A-Z0-9]+)\.p8$/);
    if (match) {
      const kid = match[1];
      const p8Path = path.join(IOS_CERTS_DIR, f);
      let issuerId = process.env.APP_STORE_CONNECT_ISSUER_ID;
      if (!issuerId) {
        if (kid === 'H39VJD32P3') {
          issuerId = 'ba7d6997-0c6f-4d5b-854d-d24e39b522a2';
        } else if (kid === '794W42S97A') {
          issuerId = '8f0ee78a-746b-4aaa-9157-3288d2c6a92f';
        }
      }
      if (!issuerId) {
        throw new Error(`App Store Connect Key ID ${kid} için ISSUER_ID bulunamadı.`);
      }
      return {
        keyId: kid,
        issuerId,
        privateKey: fs.readFileSync(p8Path, 'utf8')
      };
    }
  }

  throw new Error(`ios-certs/ dizininde geçerli bir AuthKey_*.p8 dosyası bulunamadı.`);
}

function getAppleJwt() {
  const { keyId, issuerId, privateKey } = resolveAppleCredentials();
  const now = Math.floor(Date.now() / 1000);

  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: keyId, typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: issuerId,
    iat: now,
    exp: now + 1200,
    aud: 'appstoreconnect-v1'
  })).toString('base64url');

  const unsigned = `${header}.${payload}`;
  const sig = crypto.sign('sha256', Buffer.from(unsigned), {
    key: privateKey,
    dsaEncoding: 'ieee-p1363'
  }).toString('base64url');

  return `${unsigned}.${sig}`;
}

const APPLE_STATE_MAP = {
  PREPARE_FOR_SUBMISSION: 'Hazırlanıyor (Taslak)',
  WAITING_FOR_REVIEW: 'İnceleme Bekliyor (Waiting for Review)',
  IN_REVIEW: 'İncelemede (In Review)',
  PENDING_DEVELOPER_RELEASE: 'Geliştirici Yayını Bekliyor',
  PENDING_APPLE_RELEASE: 'Apple Yayını Bekliyor',
  READY_FOR_SALE: 'Yayında (Ready for Sale)',
  REJECTED: 'Reddedildi (Rejected)',
  METADATA_REJECTED: 'Meta Veri Reddedildi',
  REMOVED_FROM_SALE: 'Satıştan Çekildi',
  DEVELOPER_REMOVED_FROM_SALE: 'Geliştirici Tarafından Çekildi'
};

async function getAppleStatus() {
  try {
    const jwt = getAppleJwt();
    const url = `https://api.appstoreconnect.apple.com/v1/apps/${APPLE_APP_ID}/appStoreVersions?limit=1&include=build`;

    const res = await httpRequest(url, {
      headers: {
        'Authorization': `Bearer ${jwt}`
      }
    });

    if (res.statusCode !== 200 || !res.data?.data) {
      return {
        success: false,
        store: 'Apple App Store',
        error: `App Store Connect API hatası (${res.statusCode}): ${res.rawString}`
      };
    }

    const versionObj = res.data.data[0];
    if (!versionObj) {
      return {
        success: true,
        store: 'Apple App Store',
        appId: APPLE_APP_ID,
        statusTr: 'Sürüm kaydı bulunamadı'
      };
    }

    const versionString = versionObj.attributes?.versionString || '—';
    const appStoreState = versionObj.attributes?.appStoreState || 'UNKNOWN';

    // İlişkili build bilgisi
    let buildVersion = '—';
    let buildUploadedDate = null;
    const includedBuilds = res.data.included?.filter(item => item.type === 'builds') || [];
    if (includedBuilds.length > 0) {
      buildVersion = includedBuilds[0].attributes?.version || '—';
      buildUploadedDate = includedBuilds[0].attributes?.uploadedDate || null;
    }

    return {
      success: true,
      store: 'Apple App Store',
      appId: APPLE_APP_ID,
      versionString,
      buildVersion,
      buildUploadedDate,
      appStoreState,
      statusTr: APPLE_STATE_MAP[appStoreState] || appStoreState
    };
  } catch (err) {
    return { success: false, store: 'Apple App Store', error: err.message };
  }
}

// ---------------------------------------------------------------------------
// 4. ANDROID BUILD İŞLEMİ (Vite + Capacitor + Gradle)
// ---------------------------------------------------------------------------
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n💻 ÇALIŞTIRILIYOR: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Komut başarısız oldu (çıkış kodu ${code}): ${command} ${args.join(' ')}`));
      }
    });

    child.on('error', reject);
  });
}

function resolveJavaHome() {
  if (process.env.JAVA_HOME && fs.existsSync(process.env.JAVA_HOME)) {
    return process.env.JAVA_HOME;
  }
  const defaultJbr = 'C:\\Program Files\\Android\\Android Studio\\jbr';
  if (fs.existsSync(defaultJbr)) {
    return defaultJbr;
  }
  return null;
}

async function buildAndroid() {
  console.log('==============================================================');
  console.log('📱 GEZGİN: ANDROID DERLEME SÜRECİ BAŞLATILIYOR');
  console.log('==============================================================');

  console.log('\n[Adım 1/3] Web varlıkları derleniyor (npm run build)...');
  await runCommand('npm', ['run', 'build'], { cwd: ROOT_DIR });

  console.log('\n[Adım 2/3] Capacitor Android senkronizasyonu yapılıyor (npx cap sync android)...');
  await runCommand('npx', ['cap', 'sync', 'android'], { cwd: ROOT_DIR });

  console.log('\n[Adım 3/3] Android AAB ve APK paketleri derleniyor (Gradle Release)...');
  const javaHome = resolveJavaHome();
  const env = { ...process.env };
  if (javaHome) {
    env.JAVA_HOME = javaHome;
    env.PATH = `${path.join(javaHome, 'bin')}${path.delimiter}${env.PATH}`;
    console.log(`  ✓ JAVA_HOME ayarlandı: ${javaHome}`);
  } else {
    console.warn('  ⚠️ Uyarı: JAVA_HOME ortam değişkeni bulunamadı. Sistem varsayılanı kullanılacak.');
  }

  const isWindows = process.platform === 'win32';
  const gradlewCmd = isWindows ? 'gradlew.bat' : './gradlew';

  await runCommand(gradlewCmd, ['bundleRelease', 'assembleRelease'], {
    cwd: ANDROID_DIR,
    env
  });

  console.log('\n==============================================================');
  console.log('✅ DERLEME TAMAMLANDI - ÇIKTI KONTROLÜ:');
  console.log('==============================================================');

  if (fs.existsSync(RELEASE_AAB_PATH)) {
    const statAab = fs.statSync(RELEASE_AAB_PATH);
    const sizeMb = (statAab.size / (1024 * 1024)).toFixed(2);
    console.log(`  ✓ Google Play Paketi (AAB): ${RELEASE_AAB_PATH}`);
    console.log(`    Boyut: ${sizeMb} MB (${statAab.size} bayt)`);
  } else {
    throw new Error(`AAB dosyası bulunamadı: ${RELEASE_AAB_PATH}`);
  }

  if (fs.existsSync(RELEASE_APK_PATH)) {
    const statApk = fs.statSync(RELEASE_APK_PATH);
    const sizeMb = (statApk.size / (1024 * 1024)).toFixed(2);
    console.log(`  ✓ Huawei AppGallery Paketi (APK): ${RELEASE_APK_PATH}`);
    console.log(`    Boyut: ${sizeMb} MB (${statApk.size} bayt)`);
  } else {
    throw new Error(`APK dosyası bulunamadı: ${RELEASE_APK_PATH}`);
  }

  console.log('\nPaketler başarıyla imzalandı ve mağazalara yüklenmeye hazır!');
}

// ---------------------------------------------------------------------------
// 5. ANA DURUM RAPORU (STATUS)
// ---------------------------------------------------------------------------
async function printAllStatuses() {
  console.log('==============================================================');
  console.log('🌍 GEZGİN: 3 MAĞAZA CANLI DURUM KONTROLÜ');
  console.log(`   Tarih: ${new Date().toLocaleString('tr-TR')}`);
  console.log('==============================================================');

  console.log('Canlı mağaza sunucularından durumlar sorgulanıyor...\n');
  const [google, huawei, apple] = await Promise.all([
    getGooglePlayStatus(),
    getHuaweiStatus(),
    getAppleStatus()
  ]);

  // 1. Google Play Store
  console.log('──────────────────────────────────────────────────────────────');
  console.log('🤖 1. GOOGLE PLAY STORE (Android)');
  console.log('──────────────────────────────────────────────────────────────');
  if (google.success) {
    console.log(`  • Paket Adı       : ${google.packageName}`);
    console.log(`  • Dağıtım Kanalı   : ${google.track.toUpperCase()}`);
    console.log(`  • Sürüm Adı        : ${google.releaseName}`);
    console.log(`  • VersionCode      : ${google.versionCodes.join(', ') || 'Yok'}`);
    console.log(`  • Canlı Durum      : 🟢 ${google.statusTr} (${google.status})`);
  } else {
    console.log(`  • Hata             : ❌ ${google.error}`);
  }

  // 2. Huawei AppGallery
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('🌸 2. HUAWEI APPGALLERY (Android / HarmonyOS)');
  console.log('──────────────────────────────────────────────────────────────');
  if (huawei.success) {
    console.log(`  • App ID           : ${huawei.appId}`);
    console.log(`  • En Son Sürüm     : ${huawei.versionNumber} (Kod: ${huawei.versionCode})`);
    console.log(`  • Yayındaki Sürüm  : ${huawei.onShelfVersionNumber}`);
    const icon = huawei.releaseState === 0 ? '🟢' : huawei.releaseState === 5 ? '🟡' : 'ℹ️';
    console.log(`  • Canlı Durum      : ${icon} ${huawei.statusTr} (State: ${huawei.releaseState})`);
    if (huawei.auditOpinion && huawei.releaseState === 4) {
      console.log(`  • İnceleme Notu    : ${huawei.auditOpinion.trim()}`);
    }
  } else {
    console.log(`  • Hata             : ❌ ${huawei.error}`);
  }

  // 3. Apple App Store
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('🍎 3. APPLE APP STORE (iOS)');
  console.log('──────────────────────────────────────────────────────────────');
  if (apple.success) {
    console.log(`  • App ID           : ${apple.appId}`);
    console.log(`  • Sürüm Numarası   : ${apple.versionString}`);
    console.log(`  • Derleme (Build)  : ${apple.buildVersion}`);
    if (apple.buildUploadedDate) {
      console.log(`  • Yükleme Tarihi   : ${new Date(apple.buildUploadedDate).toLocaleString('tr-TR')}`);
    }
    const icon = apple.appStoreState === 'READY_FOR_SALE' ? '🟢' : (apple.appStoreState === 'WAITING_FOR_REVIEW' || apple.appStoreState === 'IN_REVIEW') ? '🟡' : 'ℹ️';
    console.log(`  • Canlı Durum      : ${icon} ${apple.statusTr} (${apple.appStoreState})`);
  } else {
    console.log(`  • Hata             : ❌ ${apple.error}`);
  }

  console.log('\n==============================================================');
  console.log('✨ Durum kontrolü tamamlandı.');
  console.log('==============================================================');
}

// ---------------------------------------------------------------------------
// ANA GİRİŞ NOKTASI
// ---------------------------------------------------------------------------
async function main() {
  const cli = parseCliArgs();

  try {
    switch (cli.command) {
      case 'status':
        await printAllStatuses();
        break;

      case 'build-android':
        await buildAndroid();
        break;

      case 'deploy-google':
        await deployGooglePlay({ name: cli.name, notes: cli.notes });
        break;

      case 'deploy-huawei':
        await deployHuaweiAppGallery({ notes: cli.notes });
        break;

      case 'deploy-android':
        console.log('🎯 Tek komutla Android derleme ve 2 mağazaya (Google + Huawei) yükleme başlatılıyor...\n');
        await buildAndroid();
        await deployGooglePlay({ name: cli.name, notes: cli.notes });
        await deployHuaweiAppGallery({ notes: cli.notes });
        console.log('\n🎉 TEBRİKLER! Android derlemesi tamamlandı ve Google Play ile Huawei AppGallery\'ye yüklendi.');
        break;

      default:
        console.error(`Bilinmeyen komut: ${cli.command}`);
        console.error('Kullanılabilir komutlar: status, build-android, deploy-google, deploy-huawei, deploy-android');
        process.exit(1);
    }
  } catch (err) {
    console.error('\n❌ İŞLEM SIRASINDA BİR HATA OLUŞTU:');
    console.error(err.message || err);
    process.exit(1);
  }
}

main();
