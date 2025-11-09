'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/hooks/useScrollAnimations";

export default function NotFound() {
  const [availableNews, setAvailableNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar notícias disponíveis para mostrar como sugestão
    fetch('/api/public/news?limit=10') // Buscar mais notícias para debug
      .then(res => res.json())
      .then(data => {
        if (data.news) {
          setAvailableNews(data.news);
          
          // Debug: verificar se o slug atual existe nas notícias retornadas
          const currentSlug = window.location.pathname.split('/').pop();
          const foundNews = data.news.find(n => n.slug === currentSlug);
          if (foundNews) {
            console.log('DEBUG: Notícia encontrada no banco, mas não foi retornada pela busca individual:', foundNews);
            console.log('DEBUG: Slug buscado:', currentSlug);
            console.log('DEBUG: Slug da notícia no banco:', foundNews.slug);
          }
        }
      })
      .catch(err => console.log('Não foi possível carregar notícias sugeridas'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <ScrollReveal animation="fadeUp">
          <div className="text-6xl mb-6">📰</div>
          <h1 className="text-3xl font-bold text-[var(--primary)] mb-4">
            Notícia não encontrada
          </h1>
          <p className="text-[color:var(--muted)] mb-6 leading-relaxed">
            A notícia que você está procurando não existe ou ainda não foi publicada.
          </p>
          <div className="text-sm text-[color:var(--muted)] mb-8 p-4 bg-[var(--card)] rounded-lg border">
            <p>Possíveis motivos:</p>
            <ul className="mt-2 text-left list-disc list-inside space-y-1">
              <li>A notícia foi removida ou arquivada</li>
              <li>O link pode estar incorreto</li>
              <li>A notícia ainda não foi publicada</li>
            </ul>
          </div>

          {!loading && availableNews.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[var(--primary)] mb-4">
                Notícias mais recentes:
              </h3>
              <div className="space-y-3">
                {availableNews.map(news => (
                  <div key={news.id} className="p-3 bg-[var(--card)] rounded-lg border text-left">
                    <Link 
                      href={`/noticias/${news.slug}`}
                      className="text-[var(--accent)] hover:underline font-medium"
                    >
                      {news.title}
                    </Link>
                    <p className="text-sm text-[color:var(--muted)] mt-1">
                      {news.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Link 
              href="/noticias"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-xl hover:scale-105 transition-transform ring-focus"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Ver todas as notícias
            </Link>
            <div className="flex gap-4 justify-center text-sm">
              <Link 
                href="/"
                className="text-[var(--accent)] hover:underline"
              >
                Voltar ao início
              </Link>
              <span className="text-[color:var(--muted)]">•</span>
              <Link 
                href="/contato"
                className="text-[var(--accent)] hover:underline"
              >
                Entrar em contato
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}