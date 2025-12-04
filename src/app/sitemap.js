import { news } from "@/data/news";
import { services } from "@/data/services";
import { projects } from "@/data/projects";

export default function sitemap() {
  const base = "https://inpacta.simplifique.click";
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
    "/dados",
    "/licitacao/regulamento",
  ];

  const dynamic = [
    ...news.map((n) => `/noticias/${n.slug}`),
    ...services.map((s) => `/servicos/${s.slug}`),
    ...projects.map((p) => `/projetos/${p.slug}`),
  ];

  const now = new Date().toISOString();
  return [...routes, ...dynamic].map((r) => ({ url: `${base}${r}`, lastModified: now }));
}
