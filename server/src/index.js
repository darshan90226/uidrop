import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Zero-config fallback so the API still starts if .env is missing.
process.env.DATABASE_URL ||= 'file:./dev.db';

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',').map((o) => o.trim()).filter(Boolean);
const rawToken = process.env.ADMIN_TOKEN || '';
// The example placeholder must never work as a real credential.
const adminToken = rawToken === 'change-me-to-a-long-random-string' ? '' : rawToken;

const CATEGORIES = ['Buttons', 'Cards', 'Forms', 'Badges', 'Navigation', 'Avatars'];
const STATUSES = ['pending', 'approved', 'rejected'];

app.disable('x-powered-by');
// Hosts like Render put a proxy in front of the app; trust one hop so rate limiting sees real visitor IPs.
const trustProxy = process.env.TRUST_PROXY || (process.env.NODE_ENV === 'production' ? '1' : '');
if (trustProxy) app.set('trust proxy', Number(trustProxy) || trustProxy);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: { directives: { ...helmet.contentSecurityPolicy.getDefaultDirectives(), 'upgrade-insecure-requests': null } },
}));
app.use(cors((req, cb) => {
  const origin = req.get('origin');
  // Allow: no Origin (curl), configured origins, localhost in dev, and this server's own host (production same-origin).
  let allowed = !origin || allowedOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  if (!allowed) { try { allowed = new URL(origin).host === req.get('host'); } catch { allowed = false; } }
  cb(allowed ? null : new Error('Not allowed by CORS'), {
    origin: allowed,
    allowedHeaders: ['Content-Type', 'x-admin-token'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });
}));
app.use(express.json({ limit: '30kb' }));

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions, please try again later.' },
});

const componentSchema = z.object({
  name: z.string().trim().min(2).max(60),
  category: z.enum(CATEGORIES),
  description: z.string().trim().min(8).max(180),
  code: z.string().max(12000).optional().default(''),
});

function requireAdmin(req, res, next) {
  if (!adminToken) return res.status(503).json({ error: 'Admin is disabled. Set ADMIN_TOKEN in server/.env.' });
  const given = Buffer.from(String(req.get('x-admin-token') || ''));
  const expected = Buffer.from(adminToken);
  const ok = given.length === expected.length && crypto.timingSafeEqual(given, expected);
  if (!ok) return res.status(401).json({ error: 'Invalid admin token' });
  next();
}

// ---------- Public routes ----------
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', service: 'uidrop-api', database: 'connected' });
  } catch (error) {
    console.error('Health check DB error:', error.message);
    res.status(503).json({ status: 'degraded', service: 'uidrop-api', database: 'unreachable' });
  }
});

app.get('/api/components', async (req, res, next) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const where = { status: 'approved' };
    if (category && CATEGORIES.includes(category)) where.category = category;
    const components = await prisma.component.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, name: true, category: true, description: true, code: true, authorName: true, createdAt: true },
    });
    res.json({ components });
  } catch (error) { next(error); }
});

app.post('/api/components', submitLimiter, async (req, res, next) => {
  const parsed = componentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid component data', details: parsed.error.flatten() });
  try {
    const component = await prisma.component.create({
      data: { ...parsed.data, status: 'pending', authorName: 'community' },
      select: { id: true, name: true, category: true, description: true, status: true, createdAt: true },
    });
    res.status(201).json({ message: 'Component submitted for review', component });
  } catch (error) { next(error); }
});

// ---------- Admin / moderation routes ----------
app.get('/api/admin/components', requireAdmin, async (req, res, next) => {
  try {
    const status = typeof req.query.status === 'string' && STATUSES.includes(req.query.status) ? req.query.status : 'pending';
    const components = await prisma.component.findMany({ where: { status }, orderBy: { createdAt: 'desc' }, take: 200 });
    res.json({ components });
  } catch (error) { next(error); }
});

app.patch('/api/admin/components/:id', requireAdmin, async (req, res, next) => {
  const parsed = z.object({ status: z.enum(STATUSES) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'status must be pending, approved or rejected' });
  try {
    const component = await prisma.component.update({ where: { id: req.params.id }, data: { status: parsed.data.status } });
    res.json({ component });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Component not found' });
    next(error);
  }
});

app.delete('/api/admin/components/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.component.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Component not found' });
    next(error);
  }
});

// ---------- Fallbacks ----------
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Production: if the client has been built (npm run build), serve it from this server too.
const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use((error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON body' });
  if (error.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' });
  if (error.message === 'Not allowed by CORS') return res.status(403).json({ error: 'Origin not allowed' });
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(port, () => {
  console.log(`UIDrop API listening on http://localhost:${port}`);
  if (!adminToken) console.log('Note: ADMIN_TOKEN is not set, so moderation is disabled. Run: npm run db:setup');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') console.error(`Port ${port} is already in use. Change PORT in server/.env or stop the other process.`);
  else console.error(err);
  process.exit(1);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
