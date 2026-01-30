import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";
import { IconEye, IconFileText, IconShield } from "@/components/Icons";
import prisma from "@/lib/prisma";
import { getSiteUrl } from "@/lib/siteUrl";
import Link from "next/link";
import EditaisFilters from "./EditaisFilters";

const SITE_URL = getSiteUrl();

export const metadata = {
  title: "Editais — Licitações — InPACTA",
  description: "Listagem de editais e processos licitatórios do InPACTA.",
  alternates: {
    canonical: `${SITE_URL}/licitacao/editais`,
  },
};

const STATUS_OPTIONS = [
  { value: "PUBLICADO", label: "Publicado" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "SUSPENSA", label: "Suspensa" },
  { value: "HOMOLOGADO", label: "Homologado" },
  { value: "ADJUDICADO", label: "Adjudicado" },
  { value: "CONCLUIDA", label: "Concluída" },
  { value: "REVOGADO", label: "Revogado" },
  { value: "ANULADO", label: "Anulado" },
  { value: "DESERTO", label: "Deserto" },
  { value: "FRACASSADO", label: "Fracassado" },
];

const MODALITY_OPTIONS = [
  { value: "PREGAO_ELETRONICO", label: "Pregão Eletrônico" },
  { value: "PREGAO_PRESENCIAL", label: "Pregão Presencial" },
  { value: "CONCORRENCIA", label: "Concorrência" },
  { value: "TOMADA_PRECOS", label: "Tomada de Preços" },
  { value: "CONVITE", label: "Convite" },
  { value: "DISPENSA", label: "Dispensa" },
  { value: "INEXIGIBILIDADE", label: "Inexigibilidade" },
];

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function labelStatus(status) {
  const map = {
    PUBLICADO: "Publicado",
    EM_ANDAMENTO: "Em andamento",
    SUSPENSA: "Suspensa",
    HOMOLOGADO: "Homologado",
    ADJUDICADO: "Adjudicado",
    REVOGADO: "Revogado",
    ANULADO: "Anulado",
    DESERTO: "Deserto",
    FRACASSADO: "Fracassado",
    CONCLUIDA: "Concluída",
    PLANEJAMENTO: "Planejamento",
  };
  return map[String(status)] || String(status || "-");
}

function getStatusBadgeConfig(status) {
  const normalized = String(status || "");

  if (normalized === "EM_ANDAMENTO") {
    return {
      label: labelStatus(status),
      Icon: IconEye,
      style: {
        backgroundColor: "color-mix(in oklab, var(--accent), var(--background) 86%)",
        borderColor: "color-mix(in oklab, var(--accent), var(--background) 70%)",
        color: "var(--foreground)",
      },
    };
  }

  if (normalized === "PUBLICADO") {
    return {
      label: labelStatus(status),
      Icon: IconFileText,
      style: {
        backgroundColor: "color-mix(in oklab, var(--green), var(--background) 88%)",
        borderColor: "color-mix(in oklab, var(--green), var(--background) 72%)",
        color: "var(--foreground)",
      },
    };
  }

  if (["HOMOLOGADO", "CONCLUIDA", "ADJUDICADO"].includes(normalized)) {
    return {
      label: labelStatus(status),
      Icon: IconShield,
      style: {
        backgroundColor: "color-mix(in oklab, var(--foreground), var(--background) 94%)",
        borderColor: "color-mix(in oklab, var(--foreground), var(--background) 82%)",
        color: "var(--foreground)",
      },
    };
  }

  return {
    label: labelStatus(status),
    Icon: IconFileText,
    style: {
      backgroundColor: "var(--background)",
      borderColor: "var(--border)",
      color: "var(--foreground)",
    },
  };
}

function StatusBadge({ status }) {
  const { label, Icon, style } = getStatusBadgeConfig(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border whitespace-nowrap"
      style={style}
      aria-label={`Status do edital: ${label}`}
      title={`Status: ${label}`}
    >
      <Icon width="16" height="16" style={{ opacity: 0.9 }} />
      {label}
    </span>
  );
}

function labelModality(modality) {
  const map = {
    PREGAO_ELETRONICO: "Pregão Eletrônico",
    PREGAO_PRESENCIAL: "Pregão Presencial",
    CONCORRENCIA: "Concorrência",
    TOMADA_PRECOS: "Tomada de Preços",
    CONVITE: "Convite",
    DISPENSA: "Dispensa",
    INEXIGIBILIDADE: "Inexigibilidade",
  };
  return map[String(modality)] || String(modality || "-");
}
export default async function Page({ searchParams }) {
  const now = new Date();
  const sp = (await searchParams) || {};

  const selectedStatus = (sp.status || "").toString();
  const selectedModality = (sp.modality || "").toString();
  const selectedYear = (sp.year || "").toString();
  const query = (sp.q || "").toString();

  const where = {
    status: { not: "PLANEJAMENTO" },
    publicationDate: { lte: now },
  };

  if (selectedStatus) where.status = selectedStatus;
  if (selectedModality) where.modality = selectedModality;

  if (selectedYear) {
    const yearInt = parseInt(selectedYear, 10);
    if (!Number.isNaN(yearInt)) {
      where.publicationDate = {
        lte: now,
        gte: new Date(`${yearInt}-01-01T00:00:00.000Z`),
        lt: new Date(`${yearInt + 1}-01-01T00:00:00.000Z`),
      };
    }
  }

  if (query) {
    where.OR = [
      { number: { contains: query, mode: "insensitive" } },
      { title: { contains: query, mode: "insensitive" } },
      { object: { contains: query, mode: "insensitive" } },
    ];
  }

  const [biddings, minAgg] = await Promise.all([
    prisma.bidding.findMany({
      where,
      orderBy: [{ publicationDate: "desc" }, { number: "desc" }],
    }),
    prisma.bidding.aggregate({
      where: {
        status: { not: "PLANEJAMENTO" },
        publicationDate: { lte: now },
      },
      _min: { publicationDate: true },
    }),
  ]);

  const currentYear = now.getFullYear();
  const minYear = minAgg?._min?.publicationDate
    ? new Date(minAgg._min.publicationDate).getFullYear()
    : currentYear;

  const years = [];
  for (let y = currentYear; y >= minYear; y -= 1) years.push(String(y));

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] text-white relative overflow-hidden">
        <div className="hero-pattern absolute inset-0 opacity-15" />
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <ScrollReveal animation="fadeUp">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-16 bg-white rounded-full" />
                <span className="text-white/80 font-medium">Licitações</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Editais</h1>
              <p className="text-white/90 text-lg md:text-xl max-w-3xl">
                Acompanhe os processos licitatórios, com informações essenciais para participação e controle social.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Lista */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-10">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--primary)]">Licitações publicadas</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)] max-w-3xl mx-auto">
              Nesta seção, você encontra as licitações cadastradas e publicadas no sistema administrativo do InPACTA.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fadeUp">
          <EditaisFilters
            selectedModality={selectedModality}
            selectedStatus={selectedStatus}
            selectedYear={selectedYear}
            query={query}
            modalityOptions={MODALITY_OPTIONS}
            statusOptions={STATUS_OPTIONS}
            years={years}
          />
        </ScrollReveal>

        {biddings.length === 0 ? (
          <div className="interactive-card bg-[var(--card)] p-8 rounded-2xl border-2 border-[var(--border)]">
            <p className="text-[color:var(--muted)]">
              Ainda não há licitações publicadas.
            </p>
          </div>
        ) : (
          <StaggeredReveal staggerDelay={120} className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {biddings.map((bidding) => (
              <Link
                key={bidding.id}
                href={`/licitacao/editais/${bidding.id}`}
                className="interactive-card bg-[var(--card)] p-6 rounded-2xl border-2 border-[var(--border)] block ring-focus h-full flex flex-col"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--accent)]">{bidding.number}</div>
                    <h3
                      className="mt-1 text-lg font-bold text-[var(--foreground)] leading-snug break-words"
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {bidding.title}
                    </h3>
                  </div>
                  <StatusBadge status={bidding.status} />
                </div>

                <p
                  className="mt-3 text-sm text-[color:var(--muted)] leading-relaxed"
                  style={{
                    minHeight: "3.9em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {bidding.object || ""}
                </p>

                <div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
                  <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                    <div className="text-xs text-[color:var(--muted)]">Modalidade</div>
                    <div className="font-medium text-[var(--foreground)]">{labelModality(bidding.modality)}</div>
                  </div>
                  <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                    <div className="text-xs text-[color:var(--muted)]">Publicação</div>
                    <div className="font-medium text-[var(--foreground)]">{formatDate(bidding.publicationDate)}</div>
                  </div>
                  <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                    <div className="text-xs text-[color:var(--muted)]">Abertura</div>
                    <div className="font-medium text-[var(--foreground)]">{formatDate(bidding.openingDate)}</div>
                  </div>
                  <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background)]">
                    <div className="text-xs text-[color:var(--muted)]">Encerramento</div>
                    <div className="font-medium text-[var(--foreground)]">{formatDate(bidding.closingDate)}</div>
                  </div>
                </div>

                <div className="mt-auto pt-5 flex items-center justify-end">
                  <span className="text-sm font-semibold text-[var(--primary)] underline underline-offset-4">
                    Ver detalhes
                  </span>
                </div>
              </Link>
            ))}
          </StaggeredReveal>
        )}

        <div className="mt-10 text-center">
          <p className="text-sm text-[color:var(--muted)]">
            <strong className="font-semibold text-[var(--foreground)]">Base legal:</strong>{" "}
            <Link href="/licitacao/regulamento" className="font-semibold text-[var(--primary)] underline underline-offset-4">
              Regulamento de Licitações e Contratos do InPACTA
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
