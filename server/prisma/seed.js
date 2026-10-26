import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL ||= 'file:./dev.db';
const prisma = new PrismaClient();

const samples = [
  { name: 'Neon Toggle', category: 'Forms', description: 'A glowing on/off switch with a smooth slide animation.', authorName: 'demo-seed' },
  { name: 'Soft Avatar Ring', category: 'Avatars', description: 'Avatar with a gradient ring and online indicator.', authorName: 'demo-seed' },
  { name: 'Ghost Button', category: 'Buttons', description: 'Outline button that fills with colour on hover.', authorName: 'demo-seed' },
];

for (const s of samples) {
  const exists = await prisma.component.findFirst({ where: { name: s.name, authorName: s.authorName } });
  if (!exists) await prisma.component.create({ data: { ...s, status: 'approved', code: '' } });
}
console.log('Seed complete.');
await prisma.$disconnect();
