import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { constants as fsConstants } from 'node:fs';

const rootDir = process.cwd();
const manifestPath = path.join(rootDir, 'manifest.webmanifest');
const serviceWorkerPath = path.join(rootDir, 'service-worker.js');
const pwaScriptPath = path.join(rootDir, 'js', 'pwa.js');
const offlinePath = path.join(rootDir, 'offline.html');

const errors = [];
const warnings = [];

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function warn(condition, message) {
  if (!condition) {
    warnings.push(message);
  }
}

async function fileExists(absolutePath) {
  try {
    await access(absolutePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function isHexColor(value) {
  return typeof value === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(value.trim());
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

async function loadJson(absolutePath, label) {
  let raw;
  try {
    raw = await readFile(absolutePath, 'utf8');
  } catch {
    errors.push(`${label}: file not found`);
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    errors.push(`${label}: invalid JSON (${error.message})`);
    return null;
  }
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    errors.push('manifest.webmanifest: root must be an object');
    return;
  }

  const requiredStrings = ['name', 'short_name', 'id', 'start_url', 'scope', 'display'];
  requiredStrings.forEach((key) => {
    assert(isNonEmptyString(manifest[key]), `manifest.webmanifest: "${key}" must be a non-empty string`);
  });

  assert(isHexColor(manifest.theme_color), 'manifest.webmanifest: "theme_color" must be a valid hex color');
  assert(isHexColor(manifest.background_color), 'manifest.webmanifest: "background_color" must be a valid hex color');

  assert(Array.isArray(manifest.icons) && manifest.icons.length > 0, 'manifest.webmanifest: "icons" must be a non-empty array');

  const has192 = (manifest.icons || []).some((icon) => String(icon?.sizes || '').includes('192x192'));
  const has512 = (manifest.icons || []).some((icon) => String(icon?.sizes || '').includes('512x512'));
  assert(has192, 'manifest.webmanifest: include a 192x192 icon');
  assert(has512, 'manifest.webmanifest: include a 512x512 icon');

  (manifest.icons || []).forEach((icon, index) => {
    const prefix = `manifest.webmanifest: icons[${index}]`;
    assert(isNonEmptyString(icon?.src), `${prefix}.src must be a non-empty string`);
    assert(isNonEmptyString(icon?.sizes), `${prefix}.sizes must be a non-empty string`);
    assert(isNonEmptyString(icon?.type), `${prefix}.type must be a non-empty string`);
  });

  if (Array.isArray(manifest.shortcuts)) {
    manifest.shortcuts.forEach((shortcut, index) => {
      const prefix = `manifest.webmanifest: shortcuts[${index}]`;
      assert(isNonEmptyString(shortcut?.name), `${prefix}.name must be a non-empty string`);
      assert(isNonEmptyString(shortcut?.url), `${prefix}.url must be a non-empty string`);
    });
  }
}

async function validateManifestIconFiles(manifest) {
  for (const icon of manifest.icons || []) {
    const src = String(icon?.src || '').trim();
    if (!src) {
      continue;
    }

    const normalized = src.startsWith('/') ? src.slice(1) : src;
    const absolutePath = path.join(rootDir, normalized);
    const exists = await fileExists(absolutePath);
    assert(exists, `manifest icon missing on disk: ${src}`);
  }
}

function validateServiceWorkerSource(source) {
  assert(/CACHE_VERSION\s*=\s*['"][^'"]+['"]/.test(source), 'service-worker.js: CACHE_VERSION constant is missing');
  assert(/APP_SHELL_ASSETS\s*=\s*\[/.test(source), 'service-worker.js: APP_SHELL_ASSETS list is missing');
  assert(source.includes("'/manifest.webmanifest'") || source.includes('"/manifest.webmanifest"'), 'service-worker.js: pre-cache should include /manifest.webmanifest');
  assert(source.includes("'/js/pwa.js'") || source.includes('"/js/pwa.js"'), 'service-worker.js: pre-cache should include /js/pwa.js');
  assert(source.includes('OFFLINE_FALLBACK_URL') || source.includes('/offline.html'), 'service-worker.js: offline fallback is not configured');

  warn(/skipWaiting\(/.test(source), 'service-worker.js: skipWaiting() not found');
  warn(/clients\.claim\(/.test(source), 'service-worker.js: clients.claim() not found');
}

function validatePwaScriptSource(source) {
  assert(source.includes("navigator.serviceWorker.register('/service-worker.js'") || source.includes('navigator.serviceWorker.register("/service-worker.js"'), 'js/pwa.js: service worker registration path should be /service-worker.js');
  warn(source.includes('updateViaCache: \'none\'') || source.includes('updateViaCache: "none"'), 'js/pwa.js: updateViaCache none is recommended');
}

async function validateHtmlWiring() {
  const entries = await readdir(rootDir, { withFileTypes: true });
  const htmlFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => entry.name)
    .filter((name) => name !== 'offline.html');

  for (const fileName of htmlFiles) {
    const absolutePath = path.join(rootDir, fileName);
    const source = await readFile(absolutePath, 'utf8');

    assert(
      /<link\s+rel=["']manifest["']\s+href=["']manifest\.webmanifest["']/.test(source),
      `${fileName}: missing manifest link to manifest.webmanifest`
    );

    assert(
      /<script\s+src=["']js\/pwa\.js["']><\/script>/.test(source),
      `${fileName}: missing js/pwa.js script include`
    );
  }
}

async function main() {
  const manifest = await loadJson(manifestPath, 'manifest.webmanifest');
  if (manifest) {
    validateManifest(manifest);
    await validateManifestIconFiles(manifest);
  }

  const serviceWorkerExists = await fileExists(serviceWorkerPath);
  assert(serviceWorkerExists, 'service-worker.js: file not found');
  if (serviceWorkerExists) {
    const serviceWorkerSource = await readFile(serviceWorkerPath, 'utf8');
    validateServiceWorkerSource(serviceWorkerSource);
  }

  const pwaScriptExists = await fileExists(pwaScriptPath);
  assert(pwaScriptExists, 'js/pwa.js: file not found');
  if (pwaScriptExists) {
    const pwaScriptSource = await readFile(pwaScriptPath, 'utf8');
    validatePwaScriptSource(pwaScriptSource);
  }

  const offlineExists = await fileExists(offlinePath);
  assert(offlineExists, 'offline.html: file not found');

  await validateHtmlWiring();

  if (warnings.length > 0) {
    console.warn('PWA warnings:');
    warnings.forEach((warning) => console.warn(`- ${warning}`));
  }

  if (errors.length > 0) {
    console.error('PWA checks failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log('PWA checks passed.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
