import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();

const requiredTokensByDirective = {
  'script-src': ['https://embed.tawk.to', 'https://*.tawk.to'],
  'connect-src': ['https://embed.tawk.to', 'https://va.tawk.to', 'https://*.tawk.to', 'wss://*.tawk.to'],
  'frame-src': ['https://*.tawk.to']
};

function extractCspContent(html) {
  const match = html.match(/<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*\scontent=(["'])(.*?)\1/i);
  return match ? match[2] : '';
}

function parseDirectives(csp) {
  return csp
    .split(';')
    .map((directive) => directive.trim())
    .filter(Boolean)
    .reduce((accumulator, directive) => {
      const [name, ...tokens] = directive.split(/\s+/);
      accumulator[name] = tokens;
      return accumulator;
    }, {});
}

async function getRootHtmlFiles() {
  const entries = await readdir(rootDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => entry.name)
    .sort();
}

async function main() {
  const htmlFiles = await getRootHtmlFiles();
  const errors = [];

  for (const fileName of htmlFiles) {
    const absolutePath = path.join(rootDir, fileName);
    const html = await readFile(absolutePath, 'utf8');
    const csp = extractCspContent(html);

    if (!csp) {
      errors.push(`${fileName}: missing CSP meta tag`);
      continue;
    }

    const directives = parseDirectives(csp);

    Object.entries(requiredTokensByDirective).forEach(([directiveName, requiredTokens]) => {
      const tokens = directives[directiveName] || [];
      if (tokens.length === 0) {
        errors.push(`${fileName}: missing ${directiveName} directive`);
        return;
      }

      requiredTokens.forEach((requiredToken) => {
        if (!tokens.includes(requiredToken)) {
          errors.push(`${fileName}: ${directiveName} missing ${requiredToken}`);
        }
      });
    });
  }

  if (errors.length > 0) {
    console.error('Tawk CSP check failed:\n');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log(`Tawk CSP check passed for ${htmlFiles.length} HTML files.`);
}

main().catch((error) => {
  console.error('Tawk CSP check runtime error:', error);
  process.exit(1);
});