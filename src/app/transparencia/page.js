import Link from "next/link";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Transparência — InPACTA",
  description: "Acesso à informação pública, relatórios, prestação de contas e dados transparentes do InPACTA. Compromisso com a Lei de Acesso à Informação.",
};

export default async function Page() {
  const categorias = [
    {
      id: "DOCUMENTOS_OFICIAIS",
      slug: "documentos-oficiais",
      name: "Documentos Oficiais",
      description: "Atos normativos, políticas, regulamentos e documentos institucionais.",
      ui: { icon: "file", color: "var(--orange)" },
    },
    {
      id: "RELATORIOS_FINANCEIROS",
      slug: "relatorios-financeiros",
      name: "Relatórios Financeiros",
      description: "Demonstrativos financeiros, balanços, execuções orçamentárias e relatórios de auditoria.",
      ui: { icon: "chart", color: "var(--accent)" },
    },
    {
      id: "RELATORIOS_GESTAO",
      slug: "relatorios-gestao",
      name: "Relatórios de Gestão",
      description: "Relatórios de atividades, resultados alcançados e informações sobre o impacto dos projetos desenvolvidos.",
      ui: { icon: "clipboard", color: "var(--green)" },
    },
    {
      id: "LICITACOES_E_REGULAMENTOS",
      slug: "licitacoes-regulamentos",
      name: "Licitações e Regulamentos",
      description: "Regulamentos e documentos relacionados a processos de contratação e parcerias institucionais.",
      ui: { icon: "file", color: "var(--accent)" },
    },
  ];

  const emptyMessageByCategoriaMacro = {
    DOCUMENTOS_OFICIAIS: "Nenhum documento oficial publicado nesta seção",
    RELATORIOS_FINANCEIROS: "Não há relatórios financeiros publicados até o momento.",
    RELATORIOS_GESTAO: "Os relatórios de gestão serão disponibilizados conforme a consolidação das atividades institucionais.",
    LICITACOES_E_REGULAMENTOS: "Consulte os regulamentos e documentos normativos na página de Licitações.",
  };

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
        <div className="hero-pattern absolute inset-0 opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <ScrollReveal animation="fadeUp">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-16 bg-white rounded-full"></div>
                <span className="text-white/80 font-medium">Acesso à Informação Pública</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-[var(--green)]">Transparência</span> em primeiro lugar
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                Garantimos o direito fundamental de acesso às informações públicas, promovendo uma gestão aberta,
                responsável e orientada ao interesse coletivo.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Relatórios e Documentos */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Relatórios e Documentos</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)]">
              Acesse informações institucionais, relatórios de gestão, documentos financeiros e atos oficiais do InPACTA.
            </p>
            <div className="mt-8 max-w-3xl mx-auto text-center bg-gradient-to-br from-[var(--green)]/10 via-[var(--card)] to-[var(--accent)]/10 rounded-2xl p-6 border-2 border-[var(--green)]/20">
              <p className="text-sm text-[color:var(--muted)] leading-relaxed">
                <span className="block">O InPACTA iniciou suas atividades em novembro de 2025.</span>
                <span className="block mt-2">
                  A publicação de documentos ocorre de forma progressiva, conforme a consolidação dos processos
                  administrativos e a disponibilização das informações institucionais.
                </span>
              </p>
            </div>
          </div>
        </ScrollReveal>

        <StaggeredReveal staggerDelay={150} className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {categorias.map((category) => {
            const ui = category.ui || { icon: "file", color: "var(--accent)" };
            const list = docsPorMacro[category.id] || [];

            const isDocumentosOficiais = category.id === "DOCUMENTOS_OFICIAIS";
            const isLicitacoes = category.id === "LICITACOES_E_REGULAMENTOS";

            const bySubcategoria = list.reduce((acc, doc) => {
              const key = String(doc.subcategoria || "Outros");
              if (!acc[key]) acc[key] = [];
              acc[key].push(doc);
              return acc;
            }, {});

            const subcategoriasOrdenadas = Object.keys(bySubcategoria).sort((a, b) => a.localeCompare(b, "pt-BR"));

            return (
            <div key={category.id} className="interactive-card bg-[var(--card)] p-8 rounded-2xl border-2 border-[var(--border)]">
              <div className="mb-6">
                <div 
                  className="inline-flex size-16 items-center justify-center rounded-2xl mb-4"
                  style={{ backgroundColor: `${ui.color}15`, color: ui.color }}
                >
                  {ui.icon === "chart" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18 17l-5-5-4 4-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {ui.icon === "clipboard" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                  {ui.icon === "file" && (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-[var(--primary)] mb-3">
                {category.name}
              </h3>
              
              <p className="text-[color:var(--muted)] leading-relaxed mb-6">
                {category.description || ""}
              </p>
              
              <div className="space-y-2">
                {list.length === 0 ? (
                  <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                    <p className="text-sm text-[color:var(--muted)] leading-relaxed">
                      {emptyMessageByCategoriaMacro[category.id] || "Nenhum documento publicado nesta seção"}
                    </p>
                    {isLicitacoes && (
                      <div className="mt-4">
                        <Link
                          href="/licitacao/regulamento"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[var(--border)] font-semibold hover:bg-[var(--card)] transition-colors ring-focus"
                        >
                          Acessar Licitações
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isDocumentosOficiais ? (
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--primary)] mb-2">Atos Normativos</h4>

                        <div className="bg-[var(--background)] rounded-lg border border-[var(--border)] overflow-hidden">
                          {list.map((doc, idx) => {
                            const vigente = doc.versaoVigente;
                            const metaParts = [];
                            if (vigente?.dataAprovacao) {
                              metaParts.push(`Aprovado em ${new Date(vigente.dataAprovacao).toLocaleDateString("pt-BR")}`);
                            }
                            if (typeof vigente?.versao === "number") {
                              metaParts.push(`Versão ${vigente.versao}`);
                            }

                            return (
                              <div
                                key={doc.id}
                                className={`p-4 ${idx === 0 ? "" : "border-t border-[var(--border)]"}`}
                              >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[var(--foreground)] leading-snug whitespace-normal break-words">
                                      {doc.titulo}
                                    </p>
                                    {metaParts.length > 0 && (
                                      <p className="text-xs text-[color:var(--muted)] mt-1">{metaParts.join(" · ")}</p>
                                    )}
                                    {doc.orgaoEmissor && (
                                      <p className="text-xs text-[color:var(--muted)] mt-1">{doc.orgaoEmissor}</p>
                                    )}
                                  </div>

                                  {vigente?.arquivoPdf ? (
                                    <a
                                      href={vigente.arquivoPdf}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition-colors shrink-0"
                                      style={{ color: ui.color }}
                                    >
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                      Download PDF
                                    </a>
                                  ) : (
                                    <span className="text-sm font-medium shrink-0" style={{ color: ui.color }}>
                                      Em breve
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      subcategoriasOrdenadas.map((sub) => (
                        <div key={sub}>
                          <h4 className="text-sm font-semibold text-[var(--primary)] mb-2">{sub}</h4>
                          <div className="space-y-2">
                            {bySubcategoria[sub].map((doc) => {
                              const vigente = doc.versaoVigente;
                              const label = doc.titulo;

                              const metaParts = [];
                              if (vigente?.dataAprovacao) {
                                metaParts.push(`Aprovado em ${new Date(vigente.dataAprovacao).toLocaleDateString("pt-BR")}`);
                              }
                              if (typeof vigente?.versao === "number") {
                                metaParts.push(`Versão ${vigente.versao}`);
                              }
                              if (vigente?.numeroIdentificacao) {
                                metaParts.push(vigente.numeroIdentificacao);
                              }

                              return (
                                <div
                                  key={doc.id}
                                  className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]"
                                >
                                  <div className="min-w-0">
                                    <span className="block text-sm font-medium text-[var(--foreground)] leading-snug whitespace-normal break-words">
                                      {label}
                                    </span>
                                    {metaParts.length > 0 && (
                                      <span className="block text-xs text-[color:var(--muted)] mt-1">
                                        {metaParts.join(" • ")}
                                      </span>
                                    )}
                                  </div>

                                  {vigente?.arquivoPdf ? (
                                    <a
                                      href={vigente.arquivoPdf}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-medium hover:underline transition-colors shrink-0"
                                      style={{ color: ui.color }}
                                    >
                                      Download
                                    </a>
                                  ) : (
                                    <span className="text-sm font-medium shrink-0" style={{ color: ui.color }}>
                                      Em breve
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )})}
        </StaggeredReveal>
      </section>

      {/* CTA */}
      <div className="section-alt">
        <section className="max-w-7xl mx-auto px-4 py-20">
          <ScrollReveal animation="scale">
            <div className="text-center bg-gradient-to-br from-[var(--green)]/10 via-[var(--card)] to-[var(--accent)]/10 rounded-3xl p-12 border-2 border-[var(--green)]/20">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-6">
                Dúvidas sobre acesso à informação?
              </h2>
              <p className="text-lg text-[color:var(--muted)] mb-8 max-w-2xl mx-auto">
                Nossa equipe está preparada para orientar você e auxiliar no acesso às informações institucionais.
              </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contato" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--green)] text-white font-semibold hover:scale-105 transition-transform ring-focus group"
              >
                Fale Conosco
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link 
                href="/contato?assunto=lai#formulario" 
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-[var(--border)] font-semibold hover:bg-[var(--card)] transition-colors ring-focus"
              >
                Solicitar Informação
              </Link>
            </div>
          </div>
        </ScrollReveal>
        </section>
      </div>
    </div>
  );
}
