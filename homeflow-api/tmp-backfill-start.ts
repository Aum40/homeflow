import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './src/database/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function main() {
  const projects = await prisma.project.findMany({
    select: { id: true, projectName: true, createdAt: true, startDate: true }
  });

  for (const project of projects) {
    if (project.startDate?.getTime() === project.createdAt.getTime()) continue;
    await prisma.project.update({
      where: { id: project.id },
      data: { startDate: project.createdAt }
    });
    console.log(
      'updated:',
      project.projectName,
      '|',
      project.startDate?.toISOString() ?? null,
      '->',
      project.createdAt.toISOString()
    );
  }
}

main().finally(() => prisma.$disconnect());
