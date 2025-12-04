export default function robots() {
  const base = "https://inpacta.tech";
  return {
    rules: [
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
