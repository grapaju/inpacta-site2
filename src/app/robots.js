import { getSiteUrl, isIndexingDisallowed } from "@/lib/siteUrl";

export default function robots() {
  const base = getSiteUrl();
  const disallowIndexing = isIndexingDisallowed();

  return {
    rules: [
      disallowIndexing
        ? { userAgent: "*", disallow: "/" }
        : { userAgent: "*", allow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
