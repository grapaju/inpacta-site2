// Opções exibidas no select do admin (UI)
// Observação: CONTRATOS_PARCERIAS existe no enum do banco e agora é uma categoria ativa no admin.
export const categoriaMacroOptions = [
  { value: 'INSTITUCIONAL', label: 'Institucional' },
  { value: 'GOVERNANCA_GESTAO', label: 'Governança e Gestão' },
  { value: 'NORMATIVOS_INTERNOS', label: 'Normativos Internos' },
  { value: 'CONTRATOS_PARCERIAS', label: 'Contratos e Parcerias' },
  { value: 'PRESTACAO_CONTAS', label: 'Prestação de Contas' },
  { value: 'DOCUMENTOS_OFICIAIS', label: 'Documentos Oficiais' },
];

// Labels (inclui valores legados do banco)
export const categoriaMacroLabels = {
  INSTITUCIONAL: 'Institucional',
  GOVERNANCA_GESTAO: 'Governança e Gestão',
  NORMATIVOS_INTERNOS: 'Normativos Internos',
  CONTRATOS_PARCERIAS: 'Contratos e Parcerias',
  PRESTACAO_CONTAS: 'Prestação de Contas',
  DOCUMENTOS_OFICIAIS: 'Documentos Oficiais',
};

export const subcategoriasPorMacro = {
  INSTITUCIONAL: ['Estatuto Social', 'Atos de Criação', 'Natureza Jurídica'],
  GOVERNANCA_GESTAO: [
    // Informações institucionais (não versionáveis)
    'Diretoria Executiva',
    'Conselho de Administração',
    'Organograma',
    'Estrutura Administrativa',
    // Regras (potencialmente versionáveis)
    'Regimento Interno',
    'Normas de Funcionamento',
  ],
  NORMATIVOS_INTERNOS: [
    'Regulamentos Internos',
    'Resoluções',
    'Instruções Normativas',
  ],
  CONTRATOS_PARCERIAS: [
    // Legado (mantém compatibilidade com registros existentes)
    'Contratos Vigentes',
    'Parcerias Institucionais',
    'Contratos Encerrados',
    // Tipos orientados a versionamento (novos)
    'Contrato (Original)',
    'Aditivo',
    'Retificação',
    'Prorrogação',
    'Apostilamento',
  ],
  PRESTACAO_CONTAS: ['Relatórios Financeiros', 'Balanços', 'Demonstrativos'],
  DOCUMENTOS_OFICIAIS: ['Portarias', 'Atos Administrativos', 'Designações', 'Comunicados Oficiais'],
};

export const camposEspecificos = [
  'orgao_emissor',
  'numero_documento',
  'contratada_parceiro',
  'valor_global',
  'vigencia_meses',
  'vigencia_inicio',
  'vigencia_fim',
  'periodo',
];

export function getCamposVisiveis(categoriaMacro, subcategoria) {
  const macro = String(categoriaMacro || '').trim();

  // Regras por categoria (macro).
  // A categoria define campos visíveis, obrigatórios, tipos permitidos e status padrão.
  // Mantemos o parâmetro subcategoria por compatibilidade com as telas existentes.
  if (macro === 'NORMATIVOS_INTERNOS') {
    return new Set(['orgao_emissor', 'numero_documento']);
  }

  if (macro === 'CONTRATOS_PARCERIAS') {
    return new Set([
      'numero_documento',
      'contratada_parceiro',
      'valor_global',
      'vigencia_meses',
      'vigencia_inicio',
      'vigencia_fim',
    ]);
  }

  if (macro === 'PRESTACAO_CONTAS') {
    return new Set(['periodo']);
  }

  if (macro === 'DOCUMENTOS_OFICIAIS') {
    return new Set(['numero_documento', 'orgao_emissor']);
  }

  return new Set([]);
}

export function getCamposObrigatorios(categoriaMacro, subcategoria) {
  const macro = String(categoriaMacro || '').trim();
  const tipo = String(subcategoria || '').trim();

  // Regras por categoria (macro). Mantemos subcategoria por compatibilidade.
  if (macro === 'NORMATIVOS_INTERNOS') {
    return new Set(['orgao_emissor', 'numero_documento']);
  }

  if (macro === 'CONTRATOS_PARCERIAS') {
    // Vigência pode ser informada por meses ou por datas; por isso não marcamos como obrigatório.
    const required = new Set();

    // Para Parcerias Institucionais, estes campos ficam opcionais.
    // Para os demais tipos (contratos), continuam obrigatórios.
    if (tipo !== 'Parcerias Institucionais') {
      required.add('numero_documento');
      required.add('contratada_parceiro');
      required.add('valor_global');
    }

    return required;
  }

  if (macro === 'PRESTACAO_CONTAS') {
    return new Set(['periodo']);
  }

  if (macro === 'DOCUMENTOS_OFICIAIS') {
    // Número é opcional, mas Órgão emissor deve existir.
    return new Set(['orgao_emissor']);
  }

  return new Set([]);
}

export function getRegrasVersaoPorTipo(categoriaMacro, subcategoria) {
  const macro = String(categoriaMacro || '').trim();

  // Regras por categoria (macro). Mantemos subcategoria por compatibilidade.
  if (macro === 'NORMATIVOS_INTERNOS') {
    return { requiresStatusNormativo: true, requiresStatusContrato: false };
  }
  if (macro === 'CONTRATOS_PARCERIAS') {
    return { requiresStatusNormativo: false, requiresStatusContrato: true };
  }

  return { requiresStatusNormativo: false, requiresStatusContrato: false };
}

export function limparCamposNaoVisiveis(formData, categoriaMacro, subcategoria) {
  const visible = getCamposVisiveis(categoriaMacro, subcategoria);
  const next = { ...formData };

  for (const campo of camposEspecificos) {
    if (!visible.has(campo)) {
      next[campo] = '';
    }
  }

  return next;
}

export const statusPublicacaoOptions = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'PUBLISHED', label: 'Publicado' },
  // No banco o enum é ARCHIVED; no UI chamamos de Revogado
  { value: 'ARCHIVED', label: 'Revogado' },
];

export const statusNormativoOptions = [
  { value: 'VIGENTE', label: 'Vigente' },
  { value: 'REVOGADO', label: 'Revogado' },
];

export const statusContratoOptions = [
  { value: 'VIGENTE', label: 'Vigente' },
  { value: 'ENCERRADO', label: 'Encerrado' },
];
