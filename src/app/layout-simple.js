import "./globals.css";

export const metadata = {
  title: "InPacta — Inovação pública para cidades inteligentes",
  description: "O InPacta acelera a modernização administrativa e tecnológica do setor público em Maringá-PR.",
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