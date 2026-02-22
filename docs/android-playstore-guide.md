# Android Play Store build guide (TWA)

This project is already PWA-ready, so the best Play Store path is **Trusted Web Activity (TWA)**.

## 1) Prerequisites

- Android Studio (with Android SDK + Build Tools)
- Java 17+
- Node.js + npm
- A live HTTPS domain for this site (`https://www.leadsshillong.com`)

## 2) Install Bubblewrap CLI

```bash
npm install -g @bubblewrap/cli
```

If global install is restricted on your machine, use `npx @bubblewrap/cli` instead.

## 3) Create Android wrapper project

From repository root:

```bash
bubblewrap init \
  --manifest https://www.leadsshillong.com/manifest.webmanifest \
  --domain www.leadsshillong.com \
  --applicationId com.leadsshillong.app \
  --name "LEADS Higher Secondary School" \
  --launcherName "LEADS"
```

This generates a folder (usually `twa-build/`) containing an Android project.

## 4) Generate signing key (first time)

Inside the Android project directory:

```bash
keytool -genkeypair \
  -v \
  -keystore leads-release.jks \
  -alias leads \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Keep this keystore safe. You need the same key for all future app updates.

## 5) Get SHA-256 fingerprint for Digital Asset Links

```bash
keytool -list -v -keystore leads-release.jks -alias leads
```

Copy the `SHA256:` fingerprint.

## 6) Create `.well-known/assetlinks.json`

From repository root:

```bash
node scripts/generate-assetlinks.mjs \
  --package=com.leadsshillong.app \
  --fingerprint="AA:BB:CC:DD:..."
```

This writes `.well-known/assetlinks.json`.

Deploy the file so it is publicly available at:

- `https://www.leadsshillong.com/.well-known/assetlinks.json`

Verify in browser that it opens as valid JSON.

## 7) Configure signing in generated Android project

In `twa-build/twa-manifest.json`, set your signing details (keystore file, alias, and passwords).

Then (inside `twa-build/`):

```bash
bubblewrap update
```

## 8) Build Play Store artifacts

Inside `twa-build/`:

```bash
./gradlew bundleRelease
./gradlew assembleRelease
```

Outputs:

- Play Store upload: `app/build/outputs/bundle/release/*.aab`
- APK (testing/sideload): `app/build/outputs/apk/release/*.apk`

## 9) Publish in Google Play Console

1. Create app in Play Console.
2. Upload the `.aab` file.
3. Fill store listing, privacy policy, content rating, and target audience.
4. Complete app access/declarations and release to production.

## Notes

- Prefer `.aab` for production. APK is mainly for direct testing.
- If TWA verification fails, recheck `assetlinks.json`, package name, and SHA-256 fingerprint.
- If you rotate signing key, update `assetlinks.json` accordingly.