const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function seedBiddingsAndDocuments() {
  console.log('🌱 Seeding biddings and documents...')

  // Criar usuário admin se não existir
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@inpacta.com.br' },
    update: {},
    create: {
      email: 'admin@inpacta.com.br',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN'
    }
  })

  console.log('✅ Usuário admin criado')

  // Buscar áreas e categorias
  const areaLicitacao = await prisma.documentArea.findUnique({
    where: { slug: 'licitacao' }
  })

  const areaTransparencia = await prisma.documentArea.findUnique({
    where: { slug: 'transparencia' }
  })

  const categoriaOrcamento = await prisma.documentCategory.findFirst({
    where: { slug: 'orcamento-financas' }
  })

  // ============================================================================
  // LICITAÇÕES
  // ============================================================================

  // Licitação 1: Pregão Eletrônico - Software de Gestão
  const licitacao001 = await prisma.bidding.upsert({
    where: { number: '001/2024' },
    update: {},
    create: {
      number: '001/2024',
      title: 'Contratação de Software de Gestão',
      object: 'Contratação de empresa especializada para fornecimento de software de gestão integrada (ERP) com módulos financeiro, contábil, recursos humanos e gestão de contratos, incluindo implantação, migração de dados, treinamento e suporte técnico pelo período de 12 (doze) meses.',
      description: 'Solução completa de ERP para modernização dos processos internos da instituição, visando maior eficiência operacional e transparência na gestão.',
      modality: 'PREGAO_ELETRONICO',
      type: 'MENOR_PRECO',
      status: 'HOMOLOGADO',
      legalBasis: 'Lei nº 14.133/2021 - Nova Lei de Licitações',
      srp: false,
      publicationDate: new Date('2024-10-01'),
      openingDate: new Date('2024-10-25T09:00:00'),
      closingDate: new Date('2024-11-15'),
      estimatedValue: 150000.00,
      finalValue: 135000.00,
      winner: 'TechSolutions Ltda',
      winnerDocument: '12.345.678/0001-90',
      notes: 'Processo homologado sem intercorrências. Empresa vencedora apresentou a menor proposta e atendeu todos os requisitos técnicos.'
    }
  })

  // Movimentações da Licitação 001
  await prisma.biddingMovement.createMany({
    data: [
      {
        biddingId: licitacao001.id,
        phase: 'ABERTURA',
        description: 'Publicação do Edital no Portal Nacional de Contratações Públicas (PNCP)',
        date: new Date('2024-10-01T10:00:00'),
        createdById: admin.id
      },
      {
        biddingId: licitacao001.id,
        phase: 'QUESTIONAMENTOS',
        description: 'Recebidas 3 solicitações de esclarecimento. Respostas publicadas em 48 horas.',
        date: new Date('2024-10-10T14:30:00'),
        createdById: admin.id
      },
      {
        biddingId: licitacao001.id,
        phase: 'JULGAMENTO',
        description: 'Realizada sessão pública de abertura e julgamento das propostas. Participaram 5 empresas.',
        date: new Date('2024-10-25T09:00:00'),
        createdById: admin.id
      },
      {
        biddingId: licitacao001.id,
        phase: 'HOMOLOGACAO',
        description: 'Processo homologado pelo diretor executivo. Adjudicado à empresa TechSolutions Ltda.',
        date: new Date('2024-11-15T16:00:00'),
        createdById: admin.id
      }
    ],
    skipDuplicates: true
  })

  // Documentos da Licitação 001
  await prisma.document.createMany({
    data: [
      {
        title: 'Edital Pregão Eletrônico 001/2024',
        description: 'Edital completo do processo licitatório para contratação de software de gestão',
        fileName: 'edital-pregao-001-2024.pdf',
        filePath: '/uploads/licitacoes/001-2024/abertura/edital-pregao-001-2024.pdf',
        fileSize: 2450000,
        fileType: 'application/pdf',
        module: 'LICITACAO',
        phase: 'ABERTURA',
        order: 1,
        areaId: areaLicitacao.id,
        categoryId: categoriaOrcamento.id,
        year: 2024,
        publishedAt: new Date('2024-10-01'),
        referenceDate: new Date('2024-10-01'),
        status: 'PUBLISHED',
        biddingId: licitacao001.id,
        createdById: admin.id,
        approvedById: admin.id,
        approvedAt: new Date('2024-10-01')
      },
      {
        title: 'Termo de Referência - Software ERP',
        description: 'Especificações técnicas detalhadas do software de gestão',
        fileName: 'termo-referencia-erp.pdf',
        filePath: '/uploads/licitacoes/001-2024/abertura/termo-referencia-erp.pdf',
        fileSize: 1820000,
        fileType: 'application/pdf',
        module: 'LICITACAO',
        phase: 'ABERTURA',
        order: 2,
        areaId: areaLicitacao.id,
        categoryId: categoriaOrcamento.id,
        year: 2024,
        publishedAt: new Date('2024-10-01'),
        referenceDate: new Date('2024-10-01'),
        status: 'PUBLISHED',
        biddingId: licitacao001.id,
        createdById: admin.id,
        approvedById: admin.id,
        approvedAt: new Date('2024-10-01')
      },
      {
        title: 'Respostas aos Questionamentos',
        description: 'Compilado de perguntas e respostas sobre o edital',
        fileName: 'respostas-questionamentos.pdf',
        filePath: '/uploads/licitacoes/001-2024/questionamentos/respostas-questionamentos.pdf',
        fileSize: 450000,
        fileType: 'application/pdf',
        module: 'LICITACAO',
        phase: 'QUESTIONAMENTOS',
        order: 1,
        areaId: areaLicitacao.id,
        categoryId: categoriaOrcamento.id,
        year: 2024,
        publishedAt: new Date('2024-10-10'),
        referenceDate: new Date('2024-10-10'),
        status: 'PUBLISHED',
        biddingId: licitacao001.id,
        createdById: admin.id,
        approvedById: admin.id,
        approvedAt: new Date('2024-10-10')
      },
      {
        title: 'Ata de Sessão Pública',
        description: 'Ata da sessão de abertura e julgamento das propostas',
        fileName: 'ata-sessao-publica.pdf',
        filePath: '/uploads/licitacoes/001-2024/julgamento/ata-sessao-publica.pdf',
        fileSize: 680000,
        fileType: 'application/pdf',
        module: 'LICITACAO',
        phase: 'JULGAMENTO',
        order: 1,
        areaId: areaLicitacao.id,
        categoryId: categoriaOrcamento.id,
        year: 2024,
        publishedAt: new Date('2024-10-25'),
        referenceDate: new Date('2024-10-25'),
        status: 'PUBLISHED',
        biddingId: licitacao001.id,
        createdById: admin.id,
        approvedById: admin.id,
        approvedAt: new Date('2024-10-25')
      },
      {
        title: 'Termo de Homologação',
        description: 'Termo oficial de homologação do processo licitatório',
        fileName: 'termo-homologacao.pdf',
        filePath: '/uploads/licitacoes/001-2024/homologacao/termo-homologacao.pdf',
        fileSize: 320000,
        fileType: 'application/pdf',
        module: 'LICITACAO',
        phase: 'HOMOLOGACAO',
        order: 1,
        areaId: areaLicitacao.id,
        categoryId: categoriaOrcamento.id,
        year: 2024,
        publishedAt: new Date('2024-11-15'),
        referenceDate: new Date('2024-11-15'),
        status: 'PUBLISHED',
        biddingId: licitacao001.id,
        createdById: admin.id,
        approvedById: admin.id,
        approvedAt: new Date('2024-11-15')
      }
    ],
    skipDuplicates: true
  })

  console.log('✅ Licitação 001/2024 criada com documentos')

  // Licitação 2: Em andamento
  const licitacao002 = await prisma.bidding.upsert({
    where: { number: '002/2024' },
    update: {},
    create: {
      number: '002/2024',
      title: 'Aquisição de Equipamentos de Informática',
      object: 'Registro de preços para eventual aquisição de equipamentos de informática, incluindo desktops, notebooks, monitores, impressoras e acessórios, conforme especificações técnicas do anexo I.',
      description: 'Sistema de Registro de Preços válido por 12 meses para atender as demandas de modernização do parque tecnológico.',
      modality: 'PREGAO_ELETRONICO',
      type: 'MENOR_PRECO',
      status: 'EM_ANDAMENTO',
      legalBasis: 'Lei nº 14.133/2021, Art. 82 - Sistema de Registro de Preços',
      srp: true,
      publicationDate: new Date('2024-12-01'),
      openingDate: new Date('2024-12-20T10:00:00'),
      estimatedValue: 250000.00
    }
  })

  await prisma.biddingMovement.createMany({
    data: [
      {
        biddingId: licitacao002.id,
        phase: 'ABERTURA',
        description: 'Edital publicado no PNCP e site institucional',
        date: new Date('2024-12-01T09:00:00'),
        createdById: admin.id
      },
      {
        biddingId: licitacao002.id,
        phase: 'QUESTIONAMENTOS',
        description: 'Prazo para questionamentos até 15/12/2024',
        date: new Date('2024-12-01T09:00:00'),
        createdById: admin.id
      }
    ],
    skipDuplicates: true
  })

  await prisma.document.createMany({
    data: [
      {
        title: 'Edital Pregão Eletrônico 002/2024',
        description: 'Edital de registro de preços para equipamentos de informática',
        fileName: 'edital-pregao-002-2024.pdf',
        filePath: '/uploads/licitacoes/002-2024/abertura/edital-pregao-002-2024.pdf',
        fileSize: 1950000,
        fileType: 'application/pdf',
        module: 'LICITACAO',
        phase: 'ABERTURA',
        order: 1,
        areaId: areaLicitacao.id,
        categoryId: categoriaOrcamento.id,
        year: 2024,
        publishedAt: new Date('2024-12-01'),
        referenceDate: new Date('2024-12-01'),
        status: 'PUBLISHED',
        biddingId: licitacao002.id,
        createdById: admin.id,
        approvedById: admin.id,
        approvedAt: new Date('2024-12-01')
      },
      {
        title: 'Anexo I - Especificações Técnicas',
        description: 'Detalhamento técnico dos equipamentos a serem adquiridos',
        fileName: 'anexo-i-especificacoes.pdf',
        filePath: '/uploads/licitacoes/002-2024/abertura/anexo-i-especificacoes.pdf',
        fileSize: 890000,
        fileType: 'application/pdf',
        module: 'LICITACAO',
        phase: 'ABERTURA',
        order: 2,
        areaId: areaLicitacao.id,
        categoryId: categoriaOrcamento.id,
        year: 2024,
        publishedAt: new Date('2024-12-01'),
        referenceDate: new Date('2024-12-01'),
        status: 'PUBLISHED',
        biddingId: licitacao002.id,
        createdById: admin.id,
        approvedById: admin.id,
        approvedAt: new Date('2024-12-01')
      }
    ],
    skipDuplicates: true
  })

  console.log('✅ Licitação 002/2024 criada')

  // ============================================================================
  // DOCUMENTOS DE TRANSPARÊNCIA (sem licitação)
  // ============================================================================

  await prisma.document.createMany({
    data: [
      {
        title: 'Balanço Patrimonial 2023',
        description: 'Demonstração do balanço patrimonial referente ao exercício de 2023',
        fileName: 'balanco-patrimonial-2023.pdf',
        filePath: '/uploads/documentos/2023/transparencia/financeiro/balanco-patrimonial-2023.pdf',
        fileSize: 1250000,
        fileType: 'application/pdf',
        module: 'TRANSPARENCIA',
        areaId: areaTransparencia.id,
        categoryId: categoriaOrcamento.id,
        year: 2023,
        publishedAt: new Date('2024-03-31'),
        referenceDate: new Date('2023-12-31'),
        status: 'PUBLISHED',
        createdById: admin.id,
        approvedById: admin.id,
        approvedAt: new Date('2024-03-31')
      },
      {
        title: 'Relatório de Execução Orçamentária - 1º Trimestre 2024',
        description: 'Acompanhamento da execução orçamentária do primeiro trimestre',
        fileName: 'execucao-orcamentaria-1tri-2024.pdf',
        filePath: '/uploads/documentos/2024/transparencia/financeiro/execucao-orcamentaria-1tri-2024.pdf',
        fileSize: 780000,
        fileType: 'application/pdf',
        module: 'TRANSPARENCIA',
        areaId: areaTransparencia.id,
        categoryId: categoriaOrcamento.id,
        year: 2024,
        publishedAt: new Date('2024-04-30'),
        referenceDate: new Date('2024-03-31'),
        status: 'PUBLISHED',
        createdById: admin.id,
        approvedById: admin.id,
        approvedAt: new Date('2024-04-30')
      },
      {
        title: 'Plano Anual de Contratações 2024',
        description: 'Planejamento de contratações previstas para o exercício de 2024',
        fileName: 'plano-contratacoes-2024.pdf',
        filePath: '/uploads/documentos/2024/transparencia/institucional/plano-contratacoes-2024.pdf',
        fileSize: 650000,
        fileType: 'application/pdf',
        module: 'TRANSPARENCIA',
        areaId: areaTransparencia.id,
        categoryId: categoriaOrcamento.id,
        year: 2024,
        publishedAt: new Date('2024-01-15'),
        referenceDate: new Date('2024-01-01'),
        status: 'PUBLISHED',
        createdById: admin.id,
        approvedById: admin.id,
        approvedAt: new Date('2024-01-15')
      }
    ],
    skipDuplicates: true
  })

  console.log('✅ Documentos de transparência criados')
}

module.exports = { seedBiddingsAndDocuments }
