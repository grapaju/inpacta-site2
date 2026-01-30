const PROD_URL = "https://inpacta.org.br";

function normalizeUrl(url) {
  if (!url) return PROD_URL;
  const trimmed = String(url).trim();
  if (!trimmed) return PROD_URL;
  return trimmed.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const candidate =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.SITE_URL ||
    process.env.NEXTAUTH_URL;

  if (candidate) return normalizeUrl(candidate);

  // Em desenvolvimento local, preferir localhost para evitar chamadas para produção.
  if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || 3000;
    return `http://localhost:${port}`;
  }

  return PROD_URL;
}

export function isIndexingDisallowed() {
  if (process.env.ALLOW_INDEXING === "1") return false;
  if (process.env.DISALLOW_INDEXING === "1") return true;

  const base = getSiteUrl();

  try {
    const host = new URL(base).hostname.toLowerCase();

    if (host === "localhost" || host.endsWith(".local")) return true;
    if (host.startsWith("dev.")) return true;
    if (host.includes("staging") || host.includes("preview")) return true;

    // Segurança por padrão: só indexar explicitamente o domínio de produção
    if (host !== "inpacta.org.br") return true;
  } catch {
    return true;
  }

  return process.env.NODE_ENV !== "production";
}
