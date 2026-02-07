import Link from "next/link";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";
import prisma from "@/lib/prisma";
import { formatDateOnlyPtBR } from "@/lib/dateOnly";
import { getSiteUrl } from "@/lib/siteUrl";
import { categoriaMacroLabels, categoriaMacroOptions } from "@/lib/documentosTaxonomy";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const SITE_URL = getSiteUrl();

export const metadata = {
  title: "Transparência — InPACTA",
  description:
    "Acesso à informação pública, documentos institucionais, governança, normativos, contratos, parcerias e prestação de contas do InPACTA, em conformidade com a Lei de Acesso à Informação (Lei 12.527/2011).",
  alternates: {
    canonical: `${SITE_URL}/transparencia`,
  },
};

function formatCurrencyBRL(value) {
  if (value === null || value === undefined) return null;
  const numeric = typeof value === "number" ? value : Number(String(value));
  if (Number.isNaN(numeric)) return null;
  return numeric.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatBytes(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return null;
  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  const value = n / 1024 ** idx;
  const fixed = idx === 0 ? 0 : value < 10 ? 1 : 0;
  return `${value.toFixed(fixed)} ${units[idx]}`;
}

function labelEnum(value, map) {
  const key = String(value || "").trim();
  if (!key) return null;
  return map[key] || key;
}

function MacroIcon({ icon }) {
  if (icon === "chart") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 17l-5-5-4 4-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "clipboard") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (icon === "building") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "handshake") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M7 12l2 2c1 1 3 1 4 0l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 7l2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12l5-5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 12l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function Page() {
  noStore();

  const macroDescriptions = {
    INSTITUCIONAL: "Documentos de criação, estatuto, natureza jurídica e informações institucionais.",
    GOVERNANCA_GESTAO: "Estrutura de governança, organograma, diretoria, conselhos e normas de funcionamento.",
    NORMATIVOS_INTERNOS: "Normativos internos vigentes e revogados, regulamentações e diretrizes aplicáveis.",
    CONTRATOS_PARCERIAS: "Contratos, parcerias institucionais, aditivos e instrumentos correlatos, quando aplicável.",
    PRESTACAO_CONTAS: "Relatórios financeiros, balanços, demonstrativos e prestação de contas.",
    DOCUMENTOS_OFICIAIS: "Portarias, atos administrativos, designações, comunicados e outros atos oficiais.",
  };

  const macroUi = {
    INSTITUCIONAL: { icon: "building", color: "var(--accent)" },
    GOVERNANCA_GESTAO: { icon: "clipboard", color: "var(--green)" },
    NORMATIVOS_INTERNOS: { icon: "file", color: "var(--orange)" },
    CONTRATOS_PARCERIAS: { icon: "handshake", color: "var(--accent)" },
    PRESTACAO_CONTAS: { icon: "chart", color: "var(--green)" },
    DOCUMENTOS_OFICIAIS: { icon: "file", color: "var(--orange)" },
  };

  const emptyMessageByMacro = {
    INSTITUCIONAL: "Ainda não há documentos publicados nesta categoria.",
    GOVERNANCA_GESTAO: "Ainda não há documentos publicados nesta categoria.",
    NORMATIVOS_INTERNOS: "Ainda não há documentos publicados nesta categoria.",
    CONTRATOS_PARCERIAS: "Ainda não há documentos publicados nesta categoria.",
    PRESTACAO_CONTAS: "Ainda não há documentos publicados nesta categoria.",
    DOCUMENTOS_OFICIAIS: "Ainda não há documentos publicados nesta categoria.",
  };

  const statusNormativoLabels = {
    VIGENTE: "Vigente",
    REVOGADO: "Revogado",
  };

  const statusContratoLabels = {
    VIGENTE: "Vigente",
    ENCERRADO: "Encerrado",
  };

  const macroOrder = categoriaMacroOptions.map((o) => o.value);
  const macros = macroOrder.map((value) => ({
    id: value,
    name: categoriaMacroLabels[value] || value,
    description: macroDescriptions[value] || "",
    ui: macroUi[value] || { icon: "file", color: "var(--accent)" },
  }));

  const documentos = await prisma.documento.findMany({
    where: {
      status: "PUBLISHED",
      apareceEm: { has: "TRANSPARENCIA" },
    },
    include: {
      versaoVigente: true,
    },
    orderBy: [{ ordemExibicao: "asc" }, { updatedAt: "desc" }],
  });

  const docsPorMacro = documentos.reduce((acc, doc) => {
    const key = String(doc.categoriaMacro);
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--primary)] to-[var(--green)] text-white relative overflow-hidden">
        <div className="hero-pattern absolute inset-0 opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <ScrollReveal animation="fadeUp">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-16 bg-white rounded-full" />
                <span className="text-white/80 font-medium">Acesso à Informação Pública</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-[var(--green)]">Transparência</span> em primeiro lugar
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                Garantimos o direito fundamental de acesso às informações públicas, promovendo uma gestão aberta, responsável e orientada ao interesse coletivo.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-10">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Informações Públicas</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)] max-w-3xl mx-auto">
              Em conformidade com a Lei nº 12.527/2011 (Lei de Acesso à Informação), disponibilizamos documentos institucionais, 
              normativos, contratos e prestação de contas de forma organizada e acessível.
            </p>
          </div>

          <div className="max-w-5xl mx-auto mb-10">
            <div className="bg-gradient-to-br from-[var(--primary)]/5 via-[var(--card)] to-[var(--green)]/5 rounded-2xl p-8 border-2 border-[var(--primary)]/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[var(--primary)] mb-2">Lei de Acesso à Informação (LAI)</h3>
                  <p className="text-sm text-[color:var(--muted)] leading-relaxed mb-4">
                    Garantimos o direito constitucional de acesso às informações públicas através da transparência ativa. 
                    Caso não encontre a informação desejada, você pode realizar uma solicitação formal através do nosso canal de atendimento.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/contato?assunto=lai#formulario"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity ring-focus text-sm"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Solicitar Informação (LAI)
                      <span aria-hidden="true">→</span>
                    </Link>
                    <Link
                      href="/contato"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[var(--border)] font-semibold hover:bg-[var(--background)] transition-colors ring-focus text-sm"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Atendimento
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-[var(--border)]">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--primary)] mb-1">
                    {Object.values(docsPorMacro).reduce((acc, docs) => acc + docs.length, 0)}
                  </div>
                  <div className="text-xs text-[color:var(--muted)] font-medium">Documentos Publicados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--green)] mb-1">
                    {macros.filter(m => docsPorMacro[m.id]?.length > 0).length}
                  </div>
                  <div className="text-xs text-[color:var(--muted)] font-medium">Categorias Ativas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[var(--accent)] mb-1">100%</div>
                  <div className="text-xs text-[color:var(--muted)] font-medium">Conformidade LAI</div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Seções de documentos */}
        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          {macros.map((macro) => {
            const ui = macro.ui;
            const list = docsPorMacro[macro.id] || [];

            const bySubcategoria = list.reduce((acc, doc) => {
              const key = String(doc.subcategoria || "Outros").trim() || "Outros";
              if (!acc[key]) acc[key] = [];
              acc[key].push(doc);
              return acc;
            }, {});

            const subcategoriasOrdenadas = Object.keys(bySubcategoria).sort((a, b) => a.localeCompare(b, "pt-BR"));

            return (
              <section 
                key={macro.id} 
                id={`macro-${macro.id}`} 
                className="scroll-mt-24 bg-gradient-to-br from-[var(--card)] to-[var(--background)] rounded-2xl border-2 border-[var(--border)] p-6 md:p-8 transition-colors hover:border-[var(--border)]/80"
              >
                <div className="mb-6">
                  <div className="flex items-start gap-4 mb-3">
                    <span
                      className="inline-flex items-center justify-center size-12 rounded-xl border-2 flex-shrink-0"
                      style={{ borderColor: `${ui.color}30`, backgroundColor: `${ui.color}12`, color: ui.color }}
                    >
                      <MacroIcon icon={ui.icon} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl md:text-2xl font-bold text-[var(--primary)]">{macro.name}</h3>
                        <span 
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ backgroundColor: `${ui.color}15`, color: ui.color }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {list.length} {list.length === 1 ? 'documento' : 'documentos'}
                        </span>
                      </div>
                      {macro.description ? (
                        <p className="text-sm text-[color:var(--muted)] leading-relaxed">{macro.description}</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                {list.length === 0 ? (
                  <div className="p-8 rounded-xl bg-gradient-to-br from-[var(--background)] to-[var(--card)] border-2 border-dashed border-[var(--border)] text-center">
                    <div 
                      className="inline-flex items-center justify-center size-16 rounded-full border-2 mb-4"
                      style={{ borderColor: `${ui.color}30`, backgroundColor: `${ui.color}08` }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: ui.color }}>
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-sm text-[color:var(--muted)] font-medium mb-2">
                      {emptyMessageByMacro[macro.id] || "Nenhum documento publicado."}
                    </p>
                    <p className="text-xs text-[color:var(--muted)]">
                      Novos documentos serão adicionados conforme disponibilização.
                    </p>
                    {macro.id === "CONTRATOS_PARCERIAS" ? (
                      <div className="mt-4">
                        <Link
                          href="/licitacao/regulamento"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[var(--border)] font-semibold hover:bg-[var(--card)] transition-colors ring-focus text-sm"
                        >
                          Ver regulamentos de licitações
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {subcategoriasOrdenadas.map((sub) => (
                      <div key={sub}>
                        <div 
                          className="flex items-center gap-2 mb-3"
                        >
                          <div 
                            className="size-1.5 rounded-full"
                            style={{ backgroundColor: ui.color }}
                          />
                          <h4 className="text-sm font-bold text-[var(--foreground)] tracking-wide">{sub}</h4>
                        </div>
                        <div className="bg-[var(--background)] rounded-xl border border-[var(--border)] overflow-hidden">
                          {bySubcategoria[sub].map((doc, idx) => {
                            const vigente = doc.versaoVigente;
                            const arquivoPdf = vigente?.arquivoPdf;
                            const fileSize = formatBytes(vigente?.fileSize);

                            const meta = [];
                            const pushMeta = (label, value) => {
                              const v = String(value || "").trim();
                              if (!v) return;
                              meta.push({ label, value: v });
                            };

                            // Informações essenciais
                            if (doc?.dataDocumento) pushMeta("Data", formatDateOnlyPtBR(doc.dataDocumento));
                            if (doc?.numeroDocumento) pushMeta("Nº", doc.numeroDocumento);
                            if (doc?.orgaoEmissor) pushMeta("Órgão", doc.orgaoEmissor);
                            if (doc?.contratadaParceiro) pushMeta("Contratada", doc.contratadaParceiro);
                            if (doc?.valorGlobal) pushMeta("Valor", formatCurrencyBRL(doc.valorGlobal));
                            
                            // Vigência (apenas se houver)
                            const vigenciaParts = [];
                            if (doc?.vigenciaInicio) vigenciaParts.push(formatDateOnlyPtBR(doc.vigenciaInicio));
                            if (doc?.vigenciaFim) vigenciaParts.push(formatDateOnlyPtBR(doc.vigenciaFim));
                            if (vigenciaParts.length) pushMeta("Vigência", vigenciaParts.join(" a "));
                            
                            // Status relevante
                            if (vigente?.statusNormativo) pushMeta("Status", labelEnum(vigente.statusNormativo, statusNormativoLabels));
                            if (vigente?.statusContrato) pushMeta("Status", labelEnum(vigente.statusContrato, statusContratoLabels));
                            
                            // Arquivo
                            if (fileSize) pushMeta("Tamanho", fileSize);

                            const destinos = Array.isArray(doc?.apareceEm) ? doc.apareceEm : [];
                            const hasLicitacoes = destinos.includes("LICITACOES");

                            return (
                              <div 
                                key={doc.id} 
                                className={`p-4 hover:bg-[var(--card)] transition-colors ${idx === 0 ? "" : "border-t border-[var(--border)]"}`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0 flex-1">
                                    <h5 className="text-sm font-semibold text-[var(--foreground)] leading-snug mb-2">
                                      {doc.titulo}
                                    </h5>

                                    {meta.length > 0 ? (
                                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                                        {meta.map((item) => (
                                          <span key={`${doc.id}-${item.label}`} className="inline-flex items-baseline gap-1.5 text-[color:var(--muted)]">
                                            <span 
                                              className="inline-block size-1 rounded-full flex-shrink-0 mt-1.5"
                                              style={{ backgroundColor: ui.color }}
                                            />
                                            <span>
                                              <strong className="font-semibold text-[var(--foreground)]">{item.label}:</strong> {item.value}
                                            </span>
                                          </span>
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>

                                  <div className="flex-shrink-0">
                                    {arquivoPdf ? (
                                      <a
                                        href={arquivoPdf}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-all ring-focus text-white text-xs whitespace-nowrap"
                                        style={{ backgroundColor: ui.color }}
                                        aria-label={`Abrir PDF: ${doc.titulo}`}
                                      >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        Abrir PDF
                                      </a>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--border)]/30 text-xs text-[color:var(--muted)] font-medium">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                          <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                        Indisponível
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </section>

      {/* CTA Final */}
      <div className="section-alt">
        <section className="max-w-7xl mx-auto px-4 py-20">
          <ScrollReveal animation="scale">
            <div className="bg-gradient-to-br from-[var(--primary)]/5 via-[var(--card)] to-[var(--green)]/5 rounded-3xl p-10 md:p-12 border-2 border-[var(--primary)]/20">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-[var(--green)]/10 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-[var(--primary)] mb-3">
                    Dúvidas sobre acesso à informação?
                  </h2>
                  <p className="text-base text-[color:var(--muted)] leading-relaxed">
                    Nossa equipe está preparada para orientar você e auxiliar no acesso às informações institucionais conforme a LAI.
                  </p>
                </div>
                <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/contato"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--green)] text-white font-semibold hover:opacity-90 transition-opacity ring-focus group whitespace-nowrap"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Fale Conosco
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                  <Link
                    href="/contato?assunto=lai#formulario"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card)] font-semibold hover:bg-[var(--background)] transition-colors ring-focus whitespace-nowrap"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Solicitar (LAI)
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
}
