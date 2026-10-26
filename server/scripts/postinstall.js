// Runs after npm install. Must never fail the install: the frontend should work even if Prisma can't generate.
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const run = (args) => spawnSync(process.execPath, args, { cwd: path.join(here, '..'), stdio: 'inherit' });

run([path.join(here, 'init-env.js')]);
run([path.join(here, 'set-provider.js')]);
try {
  const bin = path.join(path.dirname(new URL(import.meta.resolve('prisma/package.json')).pathname.replace(/^\/([A-Za-z]:)/, '$1')), 'build', 'index.js');
  const r = run([bin, 'generate']);
  if (r.status !== 0) throw new Error('prisma generate failed');
} catch {
  console.warn('\n[uidrop] Prisma client was not generated. The frontend still works. Later run: npm run db:setup\n');
}
process.exit(0);
