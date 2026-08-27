import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/database/generated/prisma/client';
import { UserRole } from '../src/database/generated/prisma/enums';

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const existingAdmin = await prisma.user.findFirst({
    where: { role: UserRole.ADMIN }
  });
  if (existingAdmin) {
    console.log(`Admin already exists (${existingAdmin.email}), skipping.`);
    return;
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST_NAME ?? 'Admin';
  const lastName = process.env.ADMIN_LAST_NAME ?? 'Homeflow';

  if (!email || !password) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to seed the first admin account'
    );
  }

  const hash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hash,
      firstName,
      lastName,
      role: UserRole.ADMIN
    }
  });

  console.log(`Created first admin account: ${admin.email}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
