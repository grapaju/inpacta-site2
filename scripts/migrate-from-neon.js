/**
 * Script de Migração de Dados do Neon para aaPanel
 * 
 * Uso:
 * 1. Configure as variáveis de ambiente:
 *    DATABASE_URL_SOURCE=postgresql://user:pass@neon.tech/db
 *    DATABASE_URL=postgresql://user:pass@localhost/db
 * 
 * 2. Execute:
 *    node scripts/migrate-from-neon.js
 */

const { PrismaClient } = require('@prisma/client')

// Conexão origem (Neon)
const prismaSource = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_SOURCE || process.env.DATABASE_URL
    }
  }
})

// Conexão destino (aaPanel)
const prismaTarget = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function migrate() {
  console.log('🚀 Iniciando migração de dados...\n')
  
  try {
    // Testar conexões
    console.log('🔌 Testando conexão com origem...')
    await prismaSource.$connect()
    console.log('✅ Conectado à origem\n')
    
    console.log('🔌 Testando conexão com destino...')
    await prismaTarget.$connect()
    console.log('✅ Conectado ao destino\n')
    
    // Migrar Usuários
    console.log('👥 Migrando usuários...')
    const users = await prismaSource.user.findMany()
    console.log(`   Encontrados: ${users.length} usuários`)
    
    for (const user of users) {
      await prismaTarget.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          password: user.password,
          role: user.role,
          updatedAt: user.updatedAt
        },
        create: user
      })
    }
    console.log(`✅ ${users.length} usuários migrados\n`)
    
    // Migrar Notícias
    console.log('📰 Migrando notícias...')
    const news = await prismaSource.news.findMany({
      include: {
        author: true
      }
    })
    console.log(`   Encontradas: ${news.length} notícias`)
    
    for (const item of news) {
      // Garantir que o autor existe no destino
      const authorExists = await prismaTarget.user.findUnique({
        where: { id: item.authorId }
      })
      
      if (authorExists) {
        await prismaTarget.news.upsert({
          where: { slug: item.slug },
          update: {
            title: item.title,
            summary: item.summary,
            content: item.content,
            published: item.published,
            publishedAt: item.publishedAt,
            featuredImage: item.featuredImage,
            metaTitle: item.metaTitle,
            metaDescription: item.metaDescription,
            ogImage: item.ogImage,
            category: item.category,
            tags: item.tags,
            updatedAt: item.updatedAt
          },
          create: item
        })
      } else {
        console.log(`   ⚠️  Pulando notícia "${item.title}" - autor não encontrado`)
      }
    }
    console.log(`✅ ${news.length} notícias migradas\n`)
    
    // Migrar Serviços
    console.log('🛠️  Migrando serviços...')
    const services = await prismaSource.service.findMany({
      include: {
        author: true
      }
    })
    console.log(`   Encontrados: ${services.length} serviços`)
    
    for (const service of services) {
      const authorExists = await prismaTarget.user.findUnique({
        where: { id: service.authorId }
      })
      
      if (authorExists) {
        await prismaTarget.service.upsert({
          where: { slug: service.slug },
          update: {
            title: service.title,
            summary: service.summary,
            description: service.description,
            active: service.active,
            features: service.features,
            benefits: service.benefits,
            price: service.price,
            priceType: service.priceType,
            duration: service.duration,
            metaTitle: service.metaTitle,
            metaDescription: service.metaDescription,
            ogImage: service.ogImage,
            category: service.category,
            color: service.color,
            icon: service.icon,
            updatedAt: service.updatedAt
          },
          create: service
        })
      } else {
        console.log(`   ⚠️  Pulando serviço "${service.title}" - autor não encontrado`)
      }
    }
    console.log(`✅ ${services.length} serviços migrados\n`)
    
    // Migrar Projetos
    console.log('📊 Migrando projetos...')
    const projects = await prismaSource.project.findMany({
      include: {
        author: true
      }
    })
    console.log(`   Encontrados: ${projects.length} projetos`)
    
    for (const project of projects) {
      const authorExists = await prismaTarget.user.findUnique({
        where: { id: project.authorId }
      })
      
      if (authorExists) {
        await prismaTarget.project.upsert({
          where: { slug: project.slug },
          update: {
            title: project.title,
            description: project.description,
            content: project.content,
            published: project.published,
            publishedAt: project.publishedAt,
            featuredImage: project.featuredImage,
            category: project.category,
            tags: project.tags,
            status: project.status,
            startDate: project.startDate,
            endDate: project.endDate,
            updatedAt: project.updatedAt
          },
          create: project
        })
      } else {
        console.log(`   ⚠️  Pulando projeto "${project.title}" - autor não encontrado`)
      }
    }
    console.log(`✅ ${projects.length} projetos migrados\n`)
    
    // Resumo
    console.log('========================================')
    console.log('✅ MIGRAÇÃO CONCLUÍDA!')
    console.log('========================================')
    console.log(`👥 Usuários:  ${users.length}`)
    console.log(`📰 Notícias:  ${news.length}`)
    console.log(`🛠️  Serviços:  ${services.length}`)
    console.log(`📊 Projetos:  ${projects.length}`)
    console.log('========================================\n')
    
    console.log('💡 Próximos passos:')
    console.log('1. Verifique os dados no novo banco')
    console.log('2. Migre os arquivos de upload (public/uploads)')
    console.log('3. Atualize a DATABASE_URL no .env.production')
    console.log('4. Reinicie a aplicação')
    
  } catch (error) {
    console.error('\n❌ Erro durante migração:', error)
    process.exit(1)
  } finally {
    await prismaSource.$disconnect()
    await prismaTarget.$disconnect()
  }
}

// Executar
migrate()
  .then(() => {
    console.log('\n✨ Processo finalizado com sucesso!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Falha na migração:', error)
    process.exit(1)
  })
