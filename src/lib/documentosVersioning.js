// Regras centrais de versionamento de documentos (admin)
// Baseado nas regras de negócio fornecidas (31/01/2026).

const safeUpper = (value) => String(value || '').trim().toUpperCase();
const safeLower = (value) => String(value || '').trim().toLowerCase();

function includesAny(haystackLower, needlesLower) {
  return needlesLower.some((needle) => needle && haystackLower.includes(needle));
}

/**
 * Retorna true quando a combinação categoria + tipo permite criar nova versão.
 *
 * IMPORTANTe: esta função é a fonte única da verdade do versionamento.
 */
export function canCreateNewVersion(categoriaMacro, tipoDocumento) {
  const macro = safeUpper(categoriaMacro);
  const tipo = safeLower(tipoDocumento);

  // 1. Institucional: NÃO versiona.
  if (macro === 'INSTITUCIONAL') return false;

  // 2. Governança e Gestão: DEPENDE do tipo.
  // Regra prática: se for REGRA -> versiona; se for INFORMAÇÃO institucional -> novo documento.
  if (macro === 'GOVERNANCA_GESTAO') {
    // Heurística baseada em palavras-chave típicas de "regra".
    // Mantém compatibilidade com tipos atuais (Diretoria/Organograma/Estrutura...), que não versionam.
    const ruleKeywords = [
      'regimento',
      'norma',
      'normas',
      'politica',
      'política',
      'diretriz',
      'procedimento',
      'manual',
      'codigo',
      'código',
      'resolucao',
      'resolução',
      'instrucao',
      'instrução',
    ];

    return includesAny(tipo, ruleKeywords);
  }

  // 3. Normativos Internos: SEMPRE versiona.
  if (macro === 'NORMATIVOS_INTERNOS') return true;

  // 4. Contratos e Parcerias: PARCIAL.
  // NÃO versiona contrato original; VERSIONA aditivos/retificações/prorrogações/apostilamentos.
  if (macro === 'CONTRATOS_PARCERIAS') {
    const versionableKeywords = ['aditivo', 'retificacao', 'retificação', 'prorrogacao', 'prorrogação', 'apostilamento'];
    return includesAny(tipo, versionableKeywords);
  }

  // 6. Prestação de Contas: NÃO versiona.
  if (macro === 'PRESTACAO_CONTAS') return false;

  // 7. Documentos Oficiais: NÃO versiona.
  if (macro === 'DOCUMENTOS_OFICIAIS') return false;

  return false;
}

export function getVersioningLabel(categoriaMacro, tipoDocumento) {
  return canCreateNewVersion(categoriaMacro, tipoDocumento) ? 'Versionável' : 'Não versionável';
}
