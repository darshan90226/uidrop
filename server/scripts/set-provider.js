// Picks the Prisma database provider from DATABASE_URL: postgres:// -> postgresql, anything else -> sqlite.
// Lets the same code run on SQLite locally and PostgreSQL in production with no manual edits.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schemaPath = path.join(root, 'prisma', 'schema.prisma');
const envPath = path.join(root, '.env');

let url = process.env.DATABASE_URL || '';
if (!url && fs.existsSync(envPath)) {
  const m = fs.readFileSync(envPath, 'utf8').match(/^DATABASE_URL=["']?([^"'\r\n]*)/m);
  url = m ? m[1] : '';
}
const provider = /^postgres(ql)?:/i.test(url) ? 'postgresql' : 'sqlite';
const schema = fs.readFileSync(schemaPath, 'utf8');
const next = schema.replace(/^(\s*provider\s*=\s*)"(sqlite|postgresql)"/m, `$1"${provider}"`);
if (next !== schema) fs.writeFileSync(schemaPath, next);
console.log(`[uidrop] database provider: ${provider}`);
