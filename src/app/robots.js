export default function robots() {
  const base = "https://inpacta.simplifique.click";
  return {
    rules: [
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
