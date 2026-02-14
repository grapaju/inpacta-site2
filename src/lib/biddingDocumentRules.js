export const BIDDING_DOCUMENT_TYPES = [
  'EDITAL',
  'ANEXO',
  'TERMO_REFERENCIA',
  'PROJETO_BASICO',
  'PLANILHA_ORCAMENTARIA',
  'MINUTA_CONTRATO',
  'ATA_SESSAO',
  'RESULTADO_PRELIMINAR',
  'RESULTADO_FINAL',
  'RECURSO',
  'CONTRARRAZAO',
  'DECISAO_RECURSO',
  'CONTRATO',
  'TERMO_ADITIVO',
  'ORDEM_SERVICO',
  'RELATORIO_EXECUCAO',
  'TERMO_ENCERRAMENTO'
];

export const ALLOWED_PHASES_BY_TIPO_DOCUMENTO = {
  EDITAL: ['ABERTURA'],
  ANEXO: ['ABERTURA'],
  TERMO_REFERENCIA: ['ABERTURA'],
  PROJETO_BASICO: ['ABERTURA'],
  PLANILHA_ORCAMENTARIA: ['ABERTURA'],
  MINUTA_CONTRATO: ['ABERTURA', 'CONTRATACAO'],

  ATA_SESSAO: ['JULGAMENTO'],
  RESULTADO_PRELIMINAR: ['JULGAMENTO'],

  RESULTADO_FINAL: ['HOMOLOGACAO'],

  RECURSO: ['RECURSO'],
  CONTRARRAZAO: ['RECURSO'],
  DECISAO_RECURSO: ['RECURSO'],

  CONTRATO: ['CONTRATACAO'],

  TERMO_ADITIVO: ['EXECUCAO'],
  ORDEM_SERVICO: ['CONTRATACAO', 'EXECUCAO'],
  RELATORIO_EXECUCAO: ['EXECUCAO'],

  TERMO_ENCERRAMENTO: ['ENCERRAMENTO']
};

export function normalizeTipoDocumento(value) {
  if (value === null || value === undefined || value === '') return null;
  const normalized = String(value).trim().toUpperCase();
  return BIDDING_DOCUMENT_TYPES.includes(normalized) ? normalized : null;
}

export function normalizeStatusDocumento(value) {
  if (value === null || value === undefined || value === '') return null;
  const raw = String(value).trim().toUpperCase();
  if (raw === 'RASCUNHO') return 'DRAFT';
  if (raw === 'PUBLICADO') return 'PUBLISHED';
  if (raw === 'DRAFT' || raw === 'PUBLISHED') return raw;
  return null;
}

export function validateTipoDocumentoPhase({ tipoDocumento, phase }) {
  if (!tipoDocumento) return null;
  if (!phase) return 'Fase é obrigatória para documento tipado';

  const allowed = ALLOWED_PHASES_BY_TIPO_DOCUMENTO[tipoDocumento];
  if (!allowed) return 'Tipo de documento inválido';
  if (!allowed.includes(phase)) {
    return `Tipo ${tipoDocumento} não é permitido na fase ${phase}`;
  }

  return null;
}

export function validateAnexoFields({ tipoDocumento, numeroAnexo }) {
  if (tipoDocumento !== 'ANEXO') return null;
  if (numeroAnexo === null || numeroAnexo === undefined || numeroAnexo === '') {
    return 'numero_anexo é obrigatório quando tipo_documento=ANEXO';
  }
  const parsed = Number(numeroAnexo);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 'numero_anexo deve ser um número positivo';
  }
  return null;
}

export function formatDocumentoPublicTitle({ tipoDocumento, numeroAnexo, tituloExibicao, title }) {
  if (tipoDocumento === 'ANEXO') {
    const num = numeroAnexo ? String(numeroAnexo) : '?';
    const extra = tituloExibicao ? ` – ${tituloExibicao}` : '';
    return `Anexo ${num}${extra}`;
  }
  return tituloExibicao || title || 'Documento';
}
