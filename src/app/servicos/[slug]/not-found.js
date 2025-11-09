import Link from "next/link";
import { ScrollReveal } from "@/hooks/useScrollAnimations";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <ScrollReveal animation="fadeUp">
          <div className="text-6xl mb-6">🔧</div>
          <h1 className="text-3xl font-bold text-[var(--primary)] mb-4">
            Serviço não encontrado
          </h1>
          <p className="text-[color:var(--muted)] mb-8 leading-relaxed">
            O serviço que você está procurando não existe ou foi removido.
          </p>
          <div className="space-y-4">
            <Link 
              href="/servicos"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-xl hover:scale-105 transition-transform ring-focus"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Ver todos os serviços
            </Link>
            <div>
              <Link 
                href="/"
                className="text-[var(--accent)] hover:underline text-sm"
              >
                Voltar ao início
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}