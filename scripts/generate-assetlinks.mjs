#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);

const getArg = (key) => {
  const prefix = `${key}=`;
  const valueArg = args.find((arg) => arg.startsWith(prefix));
  return valueArg ? valueArg.slice(prefix.length).trim() : '';
};

const packageName = getArg('--package');
const fingerprint = getArg('--fingerprint').toUpperCase();

if (!packageName || !fingerprint) {
  console.error('Usage: node scripts/generate-assetlinks.mjs --package=com.example.app --fingerprint="AA:BB:..."');
  process.exit(1);
}

const payload = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: packageName,
      sha256_cert_fingerprints: [fingerprint]
    }
  }
];

const targetDir = resolve(process.cwd(), '.well-known');
const targetFile = resolve(targetDir, 'assetlinks.json');

mkdirSync(targetDir, { recursive: true });
writeFileSync(targetFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

console.log(`Created ${targetFile}`);