-- Add per-area classification overrides for Licitações
ALTER TABLE "documentos"
ADD COLUMN "categoria_macro_licitacoes" "CategoriaMacroDocumento",
ADD COLUMN "subcategoria_licitacoes" TEXT;
