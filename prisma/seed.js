const { PrismaClient } = require('@prisma/client')
const { seedDocumentStructure } = require('./seeds/documentStructure')
const { seedBiddingsAndDocuments } = require('./seeds/biddingsAndDocuments')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Seed da estrutura de documentos
  await seedDocumentStructure()

  // Seed de licitações e documentos de exemplo
  await seedBiddingsAndDocuments()

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
