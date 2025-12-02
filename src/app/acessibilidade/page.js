export const metadata = { title: "Acessibilidade • InPACTA" };

export default function Page() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[var(--primary)]">Acessibilidade</h1>
      <p className="mt-3 text-[color:var(--muted)]">
        Compromisso com WCAG 2.1 AA: navegação por teclado, contraste adequado, foco visível
        e alternativa para animações.
      </p>
    </section>
  );
}
