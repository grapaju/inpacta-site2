const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function seedDocumentStructure() {
  console.log('🌱 Seeding document structure...')

  // ============================================================================
  // ÁREAS
  // ============================================================================

  const transparencia = await prisma.documentArea.upsert({
    where: { slug: 'transparencia' },
    update: {},
    create: {
      slug: 'transparencia',
      name: 'Transparência',
      description: 'Documentos de transparência e prestação de contas',
      icon: 'eye',
      order: 1,
      active: true
    }
  })

  const licitacao = await prisma.documentArea.upsert({
    where: { slug: 'licitacao' },
    update: {},
    create: {
      slug: 'licitacao',
      name: 'Licitações',
      description: 'Processos licitatórios e documentos relacionados',
      icon: 'gavel',
      order: 2,
      active: true
    }
  })

  console.log('✅ Áreas criadas')

  // ============================================================================
  // CATEGORIAS - TRANSPARÊNCIA (FIXAS para /transparencia)
  // ============================================================================

  const transparencySlugs = [
    'atos-normativos-regulamentos',
    'governanca-administracao',
    'prestacao-contas',
  ]

  // Desativar qualquer categoria antiga de Transparência (inclui subcategorias)
  await prisma.documentCategory.updateMany({
    where: {
      areaId: transparencia.id,
      slug: { notIn: transparencySlugs },
    },
    data: {
      active: false,
    },
  })

  await prisma.documentCategory.upsert({
    where: { slug: 'atos-normativos-regulamentos' },
    update: {
      name: 'Atos Normativos e Regulamentos',
      description: 'Atos normativos, regimentos e regulamentos',
      areaId: transparencia.id,
      parentId: null,
      order: 1,
      displayType: 'TABLE',
      icon: 'file-text',
      active: true,
    },
    create: {
      slug: 'atos-normativos-regulamentos',
      name: 'Atos Normativos e Regulamentos',
      description: 'Atos normativos, regimentos e regulamentos',
      areaId: transparencia.id,
      order: 1,
      displayType: 'TABLE',
      icon: 'file-text',
      active: true,
    },
  })

  await prisma.documentCategory.upsert({
    where: { slug: 'governanca-administracao' },
    update: {
      name: 'Governança e Administração',
      description: 'Documentos de governança, gestão e administração',
      areaId: transparencia.id,
      parentId: null,
      order: 2,
      displayType: 'TABLE',
      icon: 'building',
      active: true,
    },
    create: {
      slug: 'governanca-administracao',
      name: 'Governança e Administração',
      description: 'Documentos de governança, gestão e administração',
      areaId: transparencia.id,
      order: 2,
      displayType: 'TABLE',
      icon: 'building',
      active: true,
    },
  })

  await prisma.documentCategory.upsert({
    where: { slug: 'prestacao-contas' },
    update: {
      name: 'Prestação de Contas',
      description: 'Relatórios e documentos de prestação de contas',
      areaId: transparencia.id,
      parentId: null,
      order: 3,
      displayType: 'TABLE',
      icon: 'clipboard-list',
      active: true,
    },
    create: {
      slug: 'prestacao-contas',
      name: 'Prestação de Contas',
      description: 'Relatórios e documentos de prestação de contas',
      areaId: transparencia.id,
      order: 3,
      displayType: 'TABLE',
      icon: 'clipboard-list',
      active: true,
    },
  })

  console.log('✅ Categorias de Transparência criadas')

  // ============================================================================
  // CATEGORIAS - LICITAÇÕES
  // ============================================================================

  // 1. Avisos e Editais
  const avisos = await prisma.documentCategory.upsert({
    where: { slug: 'avisos-editais' },
    update: {},
    create: {
      slug: 'avisos-editais',
      name: 'Avisos e Editais',
      description: 'Editais e avisos de licitação publicados',
      areaId: licitacao.id,
      order: 1,
      displayType: 'CARDS',
      icon: 'bell',
      active: true
    }
  })

  await prisma.documentCategory.createMany({
    data: [
      {
        slug: 'editais-publicados',
        name: 'Editais Publicados',
        areaId: licitacao.id,
        parentId: avisos.id,
        order: 1,
        displayType: 'CARDS',
      },
      {
        slug: 'avisos-licitacao',
        name: 'Avisos de Licitação',
        areaId: licitacao.id,
        parentId: avisos.id,
        order: 2,
        displayType: 'CARDS',
      },
      {
        slug: 'termos-referencia',
        name: 'Termos de Referência',
        areaId: licitacao.id,
        parentId: avisos.id,
        order: 3,
        displayType: 'TABLE',
      }
    ],
    skipDuplicates: true
  })

  // 2. Licitações em Andamento
  const andamento = await prisma.documentCategory.upsert({
    where: { slug: 'licitacoes-andamento' },
    update: {},
    create: {
      slug: 'licitacoes-andamento',
      name: 'Licitações em Andamento',
      description: 'Processos licitatórios em curso',
      areaId: licitacao.id,
      order: 2,
      displayType: 'CARDS',
      icon: 'clock',
      active: true
    }
  })

  await prisma.documentCategory.createMany({
    data: [
      {
        slug: 'pregoes-em-curso',
        name: 'Pregões em Curso',
        areaId: licitacao.id,
        parentId: andamento.id,
        order: 1,
        displayType: 'CARDS',
      },
      {
        slug: 'impugnacoes-recursos',
        name: 'Impugnações e Recursos',
        areaId: licitacao.id,
        parentId: andamento.id,
        order: 2,
        displayType: 'TABLE',
      },
      {
        slug: 'esclarecimentos',
        name: 'Esclarecimentos',
        areaId: licitacao.id,
        parentId: andamento.id,
        order: 3,
        displayType: 'TABLE',
      }
    ],
    skipDuplicates: true
  })

  // 3. Licitações Encerradas
  const encerradas = await prisma.documentCategory.upsert({
    where: { slug: 'licitacoes-encerradas' },
    update: {},
    create: {
      slug: 'licitacoes-encerradas',
      name: 'Licitações Encerradas',
      description: 'Processos licitatórios finalizados',
      areaId: licitacao.id,
      order: 3,
      displayType: 'TABLE',
      icon: 'check-circle',
      active: true
    }
  })

  await prisma.documentCategory.createMany({
    data: [
      {
        slug: 'homologadas',
        name: 'Homologadas',
        areaId: licitacao.id,
        parentId: encerradas.id,
        order: 1,
        displayType: 'TABLE',
      },
      {
        slug: 'adjudicadas',
        name: 'Adjudicadas',
        areaId: licitacao.id,
        parentId: encerradas.id,
        order: 2,
        displayType: 'TABLE',
      },
      {
        slug: 'desertas-fracassadas',
        name: 'Desertas/Fracassadas',
        areaId: licitacao.id,
        parentId: encerradas.id,
        order: 3,
        displayType: 'TABLE',
      }
    ],
    skipDuplicates: true
  })

  // 4. Resultados e Atas
  const resultados = await prisma.documentCategory.upsert({
    where: { slug: 'resultados-atas' },
    update: {},
    create: {
      slug: 'resultados-atas',
      name: 'Resultados e Atas',
      description: 'Resultados e documentos das sessões',
      areaId: licitacao.id,
      order: 4,
      displayType: 'TABLE',
      icon: 'document-duplicate',
      active: true
    }
  })

  await prisma.documentCategory.createMany({
    data: [
      {
        slug: 'atas-sessao',
        name: 'Atas de Sessão',
        areaId: licitacao.id,
        parentId: resultados.id,
        order: 1,
        displayType: 'TABLE',
      },
      {
        slug: 'mapas-comparativos',
        name: 'Mapas Comparativos',
        areaId: licitacao.id,
        parentId: resultados.id,
        order: 2,
        displayType: 'TABLE',
      },
      {
        slug: 'pareceres-tecnicos',
        name: 'Pareceres Técnicos',
        areaId: licitacao.id,
        parentId: resultados.id,
        order: 3,
        displayType: 'TABLE',
      }
    ],
    skipDuplicates: true
  })

  // 5. Contratos Firmados (Licitação)
  const contratosLic = await prisma.documentCategory.upsert({
    where: { slug: 'contratos-licitacao' },
    update: {},
    create: {
      slug: 'contratos-licitacao',
      name: 'Contratos Firmados',
      description: 'Contratos decorrentes de licitações',
      areaId: licitacao.id,
      order: 5,
      displayType: 'TABLE',
      icon: 'document-text',
      active: true
    }
  })

  await prisma.documentCategory.createMany({
    data: [
      {
        slug: 'contratos-vigentes',
        name: 'Contratos Vigentes',
        areaId: licitacao.id,
        parentId: contratosLic.id,
        order: 1,
        displayType: 'TABLE',
      },
      {
        slug: 'aditivos-licitacao',
        name: 'Aditivos',
        areaId: licitacao.id,
        parentId: contratosLic.id,
        order: 2,
        displayType: 'TABLE',
      },
      {
        slug: 'rescisoes',
        name: 'Rescisões',
        areaId: licitacao.id,
        parentId: contratosLic.id,
        order: 3,
        displayType: 'TABLE',
      }
    ],
    skipDuplicates: true
  })

  // 6. Planejamento de Compras
  const planejamento = await prisma.documentCategory.upsert({
    where: { slug: 'planejamento-compras' },
    update: {},
    create: {
      slug: 'planejamento-compras',
      name: 'Planejamento de Compras',
      description: 'Planejamento anual e estudos',
      areaId: licitacao.id,
      order: 6,
      displayType: 'PAGE_WITH_DOCS',
      icon: 'calendar',
      active: true
    }
  })

  await prisma.documentCategory.createMany({
    data: [
      {
        slug: 'plano-anual-compras',
        name: 'Plano Anual de Compras',
        areaId: licitacao.id,
        parentId: planejamento.id,
        order: 1,
        displayType: 'PAGE_WITH_DOCS',
      },
      {
        slug: 'pesquisas-preco',
        name: 'Pesquisas de Preço',
        areaId: licitacao.id,
        parentId: planejamento.id,
        order: 2,
        displayType: 'TABLE',
      },
      {
        slug: 'estudos-tecnicos',
        name: 'Estudos Técnicos',
        areaId: licitacao.id,
        parentId: planejamento.id,
        order: 3,
        displayType: 'TABLE',
      }
    ],
    skipDuplicates: true
  })

  console.log('✅ Categorias de Licitações criadas')
  console.log('✅ Seed de documentos completo!')
}

module.exports = { seedDocumentStructure }
