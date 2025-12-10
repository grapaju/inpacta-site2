export default function robots() {
  const base = "https://inpacta.org.br";
  return {
    rules: [
      { userAgent: "*", allow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
