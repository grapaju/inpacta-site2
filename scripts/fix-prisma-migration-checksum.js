/* eslint-disable no-console */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const migrationName = process.argv[2];
if (!migrationName) {
  console.error('Uso: node scripts/fix-prisma-migration-checksum.js <migration_name>');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const migrationFile = path.join(process.cwd(), 'prisma', 'migrations', migrationName, 'migration.sql');
  const content = fs.readFileSync(migrationFile);
  const checksum = crypto.createHash('sha256').update(content).digest('hex');

  const rows = await prisma.$queryRawUnsafe(
    `SELECT migration_name, checksum FROM "_prisma_migrations" WHERE migration_name = '${migrationName}'`
  );

  console.log('DB row:', rows);
  console.log('File checksum:', checksum);

  const updated = await prisma.$executeRawUnsafe(
    `UPDATE "_prisma_migrations" SET checksum = '${checksum}' WHERE migration_name = '${migrationName}'`
  );

  console.log('Updated rows:', updated);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
