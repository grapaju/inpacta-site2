import prisma from '@/lib/prisma';

export async function registrarHistoricoLicitacao({ licitacaoId, acao, descricao, usuarioId }) {
  try {
    if (!licitacaoId || !acao || !descricao) return;
    await prisma.licitacaoHistorico.create({
      data: {
        licitacaoId,
        acao,
        descricao,
        usuarioId: usuarioId || null
      }
    });
  } catch {
    // Compat: não bloquear fluxo se a tabela não existir ainda ou o DB estiver legado.
  }
}
