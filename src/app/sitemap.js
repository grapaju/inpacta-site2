import { services } from "@/data/services";
import { projects } from "@/data/projects";
import prisma from "@/lib/prisma";
import { getSiteUrl, isIndexingDisallowed } from "@/lib/siteUrl";

export default async function sitemap() {
  if (isIndexingDisallowed()) return [];

  const base = getSiteUrl();
  const routes = [
    "",
    "/sobre",
    "/servicos",
    "/projetos",
    "/transparencia",
    "/governanca",
    "/noticias",
    "/contato",
    "/lgpd",
    "/acessibilidade",
    "/licitacao/editais",
    "/licitacao/regulamento",
  ];

  const dynamic = [
    ...services.map((s) => `/servicos/${s.slug}`),
    ...projects.map((p) => `/projetos/${p.slug}`),
  ];

  let biddingUrls = [];
  let newsUrls = [];

  try {
    const publishedNews = await prisma.news.findMany({
      where: { published: true },
      select: {
        slug: true,
        publishedAt: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { publishedAt: "desc" },
    });

    newsUrls = publishedNews.map((n) => ({
      url: `${base}/noticias/${n.slug}`,
      lastModified: (n.publishedAt || n.updatedAt || n.createdAt).toISOString(),
    }));

    const biddings = await prisma.bidding.findMany({
      where: {
        status: { not: "PLANEJAMENTO" },
        publicationDate: { lte: new Date() },
      },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    biddingUrls = biddings.map((b) => ({
      url: `${base}/licitacao/editais/${b.id}`,
      lastModified: b.updatedAt.toISOString(),
    }));
  } catch {
    // Se o banco estiver indisponível, ainda expõe as rotas estáticas.
  }

  const now = new Date().toISOString();
  const staticAndDynamic = [...routes, ...dynamic].map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
  }));

  return [...staticAndDynamic, ...newsUrls, ...biddingUrls];
}
