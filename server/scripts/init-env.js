// Creates server/.env on first run and generates a random ADMIN_TOKEN. Safe to run repeatedly.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, '.env');
const examplePath = path.join(root, '.env.example');
const PLACEHOLDER = 'change-me-to-a-long-random-string';

let text = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : fs.readFileSync(examplePath, 'utf8');
const match = text.match(/^ADMIN_TOKEN=["']?([^"'\r\n]*)["']?\s*$/m);
const current = match ? match[1] : '';

let generated = '';
if (!current || current === PLACEHOLDER) {
  generated = crypto.randomBytes(24).toString('hex');
  text = match ? text.replace(/^ADMIN_TOKEN=.*$/m, `ADMIN_TOKEN="${generated}"`) : `${text.trimEnd()}\nADMIN_TOKEN="${generated}"\n`;
}
if (!/^DATABASE_URL=/m.test(text)) text = `DATABASE_URL="file:./dev.db"\n${text}`;

if (generated || !fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, text);
  console.log(`\n[uidrop] server/.env ready.${generated ? `\n[uidrop] Your admin token (for /#admin): ${generated}\n` : ''}`);
}
