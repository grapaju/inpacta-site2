import "./globals.css";

export const metadata = {
  title: "InPACTA — Inovação pública para cidades inteligentes",
  description: "O InPACTA acelera a modernização administrativa e tecnológica do setor público em Maringá-PR.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        {children}
      </body>
    </html>
  );
}