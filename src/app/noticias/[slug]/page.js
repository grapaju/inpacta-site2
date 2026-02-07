import { news } from "@/data/news";
import Link from "next/link";
import Image from "next/image";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getSiteUrl } from "@/lib/siteUrl";

// Forçar renderização dinâmica e desabilitar cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// Função para buscar notícia da API
async function fetchNewsItem(slug) {
  console.log('[DEBUG] Buscando notícia com slug:', slug);

  const isProduction = process.env.VERCEL_URL || process.env.NODE_ENV === 'production';
  const isDevelopment = !isProduction;

  // Sempre priorizar acesso direto ao banco (SSR). Em dev isso evita chamadas acidentais
  // para produção quando NEXT_PUBLIC_BASE_URL/SITE_URL estiver configurado.
  try {
    const publishedItem = await prisma.news.findFirst({
      where: {
        AND: [
          { slug: { equals: slug, mode: 'insensitive' } },
          { published: true }
        ]
      },
      include: {
        author: { select: { name: true, email: true } }
      }
    });

    if (publishedItem) {
      console.log('[DEBUG] Notícia publicada encontrada no banco (SSR):', publishedItem.title);
      return publishedItem;
    }

    // Em desenvolvimento, permitir visualizar rascunhos (ajuda no fluxo do admin).
    if (isDevelopment) {
      const draftItem = await prisma.news.findFirst({
        where: { slug: { equals: slug, mode: 'insensitive' } },
        include: {
          author: { select: { name: true, email: true } }
        }
      });

      if (draftItem) {
        console.log('[DEBUG] Notícia encontrada no banco mas está como rascunho (dev):', draftItem.title);
        return draftItem;
      }
    }
  } catch (error) {
    console.error('[DEBUG] Erro ao buscar notícia no banco (SSR):', error);
  }

  // Fallback: em desenvolvimento, tentar dados estáticos (quando DB não está disponível)
  const staticNews = news.find((n) => n.slug === slug);
  console.log('[DEBUG] Verificando dados estáticos:', staticNews?.title || 'Não encontrado');

  if (staticNews) {
    console.log('[DEBUG] Usando dados estáticos (fallback):', staticNews.title);
    return {
      ...staticNews,
      author: staticNews.author || 'InPACTA',
      publishedAt: staticNews.date,
      createdAt: staticNews.date,
      published: true,
      category: staticNews.category || 'geral'
    };
  }

  // Último fallback: API pública (mantém compatibilidade caso prisma não esteja acessível)
  try {
    const baseUrl = getSiteUrl();
    const response = await fetch(`${baseUrl}/api/public/news/${slug}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('[DEBUG] Notícia encontrada via API:', data.title);
      return data;
    }
  } catch (error) {
    console.error('[DEBUG] Erro ao buscar notícia via API:', error);
  }

  console.log('[DEBUG] Nenhuma notícia encontrada para o slug:', slug);
  return null;
}

const shouldUsePlainImg = (src) =>
  typeof src === 'string' && (src.startsWith('data:') || src.includes('/uploads/'));

const normalizeImageSrc = (src) => {
  if (typeof src !== 'string') return src;
  let value = src.trim().replace(/\\/g, '/');
  if (value.startsWith('//')) value = `https:${value}`;
  if (value.startsWith('http://')) value = `https://${value.slice('http://'.length)}`;
  if (value.startsWith('uploads/')) value = `/${value}`;
  return value;
};

// Função para buscar todas as notícias para gerar static params
async function fetchAllNews() {
  try {
    const baseUrl = getSiteUrl();
      
    const response = await fetch(`${baseUrl}/api/public/news`, {
      cache: 'force-cache'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.news && data.news.length > 0) return data.news;
    }
  } catch (error) {
    console.error('Erro ao buscar notícias para static params:', error);
  }
  
  // Fallback para dados estáticos
  return news;
}

// Temporariamente desabilitado para debug
// export async function generateStaticParams() {
//   const allNews = await fetchAllNews();
//   return allNews.map((n) => ({ slug: n.slug }));
// }

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = await fetchNewsItem(slug);
  
  if (!item) return { title: "Notícia • InPACTA" };
  
  return { 
    title: `${item.title} — Notícias InPACTA`, 
    description: item.summary,
    openGraph: {
      title: item.title,
      description: item.summary,
      type: 'article',
      publishedTime: item.date || item.createdAt,
      authors: [item.author || 'InPACTA'],
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.summary,
    }
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  
  console.log('[PAGE DEBUG] Slug recebido nos params:', slug);
  
  const item = await fetchNewsItem(slug);
  
  console.log('[PAGE DEBUG] Item retornado:', item);
  
  if (!item) {
    // Detectar se estamos em produção
    const isProduction = process.env.VERCEL_URL || process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // Em produção, usar notFound() para 404 adequado
      notFound();
    }
    
    // Em desenvolvimento, mostrar debug apenas com dados estáticos
    const availableSlugs = news.map(n => n.slug);
    
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Debug: Notícia não encontrada (Desenvolvimento)</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <p><strong>Slug buscado:</strong> {slug}</p>
            <p><strong>Slugs disponíveis (dados estáticos):</strong> {availableSlugs.join(', ')}</p>
            
            <div className="mt-4">
              <h3 className="font-bold">Notícias disponíveis em desenvolvimento:</h3>
              <ul className="list-disc list-inside mt-2">
                {news.map(n => (
                  <li key={n.slug}>
                    <Link href={`/noticias/${n.slug}`} className="text-blue-600 hover:underline">
                      {n.title} (slug: {n.slug})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-100 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Esta página de debug só é exibida em desenvolvimento. 
                Em produção, uma página 404 adequada será mostrada.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Buscar notícias relacionadas (sempre do banco via API)
  let relatedNews = [];
  try {
    const baseUrl = getSiteUrl();
    const response = await fetch(`${baseUrl}/api/public/news?page=1&limit=12`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      const allNews = data.news || data;
      if (Array.isArray(allNews)) {
        relatedNews = allNews
          .filter(n => (n.slug || '').toLowerCase() !== (slug || '').toLowerCase())
          .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
          .slice(0, 3);
      }
    }
  } catch (error) {
    console.error('Erro ao buscar notícias relacionadas (API):', error);
    relatedNews = [];
  }

  const newsDate = item.date || item.createdAt;
  const formattedDate = new Date(newsDate).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long", 
    year: "numeric"
  });

  const content = item.content || item.summary;
  const readingTime = Math.ceil(content.split(' ').length / 200);

  return (
    <div>
      {/* Hero da Notícia */}
      <section className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white relative overflow-hidden">
        <div className="hero-pattern absolute inset-0 opacity-20"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-20">
          <ScrollReveal animation="fadeUp">
            <div className="mb-6">
              <Link 
                href="/noticias"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium transition-colors mb-6"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Voltar para notícias
              </Link>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
                  {item.category || 'Notícia'}
                </span>
                <time className="text-white/80 text-sm">
                  {formattedDate}
                </time>
                <span className="text-white/60">•</span>
                <span className="text-white/80 text-sm">
                  {readingTime} min de leitura
                </span>
                {item.author && (
                  <>
                    <span className="text-white/60">•</span>
                    <span className="text-white/80 text-sm">
                      Por {typeof item.author === 'object' ? item.author.name || item.author.email : item.author}
                    </span>
                  </>
                )}
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              {item.title}
            </h1>
            
            <p className="text-xl text-white/90 leading-relaxed">
              {item.summary}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Imagem Destacada */}
      {item.featuredImage && (
        <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-10 mb-12">
          <ScrollReveal animation="fadeUp">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
              {(() => {
                const normalizedSrc = normalizeImageSrc(item.featuredImage);
                return shouldUsePlainImg(normalizedSrc) ? (
                <img
                  src={normalizedSrc}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Image 
                  src={normalizedSrc} 
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  priority
                />
              );
              })()}
            </div>
          </ScrollReveal>
        </section>
      )}

      {/* Conteúdo da Notícia */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            <ScrollReveal animation="fadeUp">
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-lg text-[color:var(--muted)] leading-relaxed mb-8 [&>*]:text-[var(--foreground)] [&>h1]:text-[var(--primary)] [&>h2]:text-[var(--primary)] [&>h3]:text-[var(--primary)] [&>a]:text-[var(--accent)] [&>a]:underline"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
                
                {/* Conteúdo expandido simulado apenas se não tiver content detalhado */}
                {content === item.summary && (
                  <div className="space-y-6 text-[var(--foreground)] leading-relaxed">
                    <p>
                      Esta iniciativa representa um marco importante para a transformação digital 
                      do setor público, estabelecendo as bases para uma administração 
                      mais eficiente e transparente.
                    </p>
                    
                    <p>
                      O projeto conta com o apoio de especialistas renomados e utiliza as melhores 
                      práticas da indústria, adaptadas às necessidades específicas da gestão pública.
                    </p>
                    
                    <blockquote className="border-l-4 border-[var(--accent)] pl-6 py-4 bg-[var(--accent)]/5 rounded-r-lg">
                      <p className="text-lg italic text-[var(--foreground)] mb-2">
                        &ldquo;Esta é uma oportunidade única de modernizar nossa gestão pública 
                        e oferecer serviços de qualidade superior aos cidadãos.&rdquo;
                      </p>
                      <cite className="text-sm text-[color:var(--muted)] font-medium">
                        — Equipe InPACTA
                      </cite>
                    </blockquote>
                    
                    <h3 className="text-xl font-bold text-[var(--primary)] mt-8 mb-4">
                      Próximos Passos
                    </h3>
                    
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="size-2 bg-[var(--accent)] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Implementação das primeiras soluções piloto</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="size-2 bg-[var(--accent)] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Capacitação das equipes municipais</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="size-2 bg-[var(--accent)] rounded-full mt-2 flex-shrink-0"></div>
                        <span>Monitoramento e avaliação dos resultados</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Tags e Compartilhamento */}
            <ScrollReveal animation="fadeUp" delay={200}>
              <div className="mt-12 pt-8 border-t border-[var(--border)]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-[color:var(--muted)] mr-2">Tags:</span>
                    {(() => {
                      const tags = item.tags && Array.isArray(item.tags) 
                        ? item.tags 
                        : getTagsForNews(item.slug);
                      return tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-sm rounded-full"
                        >
                          {typeof tag === 'string' ? tag : String(tag)}
                        </span>
                      ));
                    })()}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[color:var(--muted)]">Compartilhar:</span>
                    <div className="flex items-center gap-2">
                      {[
                        { name: "Twitter", icon: "twitter" },
                        { name: "Facebook", icon: "facebook" },
                        { name: "LinkedIn", icon: "linkedin" },
                        { name: "WhatsApp", icon: "whatsapp" }
                      ].map((social) => (
                        <button 
                          key={social.name}
                          className="size-10 rounded-full bg-[var(--card)] hover:bg-[var(--accent)] hover:text-white transition-all flex items-center justify-center ring-focus"
                          title={`Compartilhar no ${social.name}`}
                        >
                          {getSocialIcon(social.icon)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ScrollReveal animation="fadeLeft">
              <div className="sticky top-8 space-y-8">
                {/* Info da Notícia */}
                <div className="bg-[var(--card)] p-6 rounded-2xl border-2 border-[var(--border)]">
                  <h3 className="font-bold text-[var(--primary)] mb-4">Informações</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[color:var(--muted)]">Publicado:</span>
                      <span className="text-[var(--foreground)]">{formattedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[color:var(--muted)]">Leitura:</span>
                      <span className="text-[var(--foreground)]">{readingTime} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[color:var(--muted)]">Categoria:</span>
                      <span className="text-[var(--accent)]">Tecnologia</span>
                    </div>
                  </div>
                </div>

                {/* Newsletter */}
                <div className="bg-gradient-to-br from-[var(--accent)]/10 to-[var(--green)]/10 p-6 rounded-2xl border-2 border-[var(--accent)]/20">
                  <h3 className="font-bold text-[var(--primary)] mb-3">
                    Receba mais notícias
                  </h3>
                  <p className="text-sm text-[color:var(--muted)] mb-4">
                    Assine nossa newsletter e fique por dentro das novidades.
                  </p>
                  <form className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="Seu e-mail"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] ring-focus"
                    />
                    <button 
                      type="submit"
                      className="w-full px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:scale-105 transition-transform"
                    >
                      Assinar
                    </button>
                  </form>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </article>

      {/* Notícias Relacionadas */}
      {relatedNews.length > 0 && (
        <div className="section-alt">
          <section className="max-w-7xl mx-auto px-4 py-20">
            <ScrollReveal animation="fadeUp">
              <div className="text-center mb-12">
                <div className="section-title justify-center">
                  <span className="bar" />
                  <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Mais Notícias</h2>
                </div>
                <p className="mt-4 text-lg text-[color:var(--muted)]">
                  Continue acompanhando as atualizações do InPACTA.
                </p>
              </div>
            </ScrollReveal>

          <StaggeredReveal staggerDelay={150} className="grid md:grid-cols-3 gap-8">
            {relatedNews.map((relatedItem) => (
              <article key={relatedItem.slug} className="interactive-card group bg-[var(--card)] rounded-2xl border-2 border-[var(--border)] overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 relative">
                  <div className="absolute top-4 left-4">
                    <span className="inline-block px-2 py-1 bg-[var(--background)]/80 backdrop-blur text-xs font-medium rounded">
                      Notícia
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <time className="text-xs text-[color:var(--muted)]">
                    {new Date(relatedItem.date).toLocaleDateString("pt-BR")}
                  </time>
                  
                  <h3 className="font-bold text-[var(--primary)] mb-3 mt-2 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                    {relatedItem.title}
                  </h3>
                  
                  <p className="text-sm text-[color:var(--muted)] leading-relaxed mb-4 line-clamp-3">
                    {relatedItem.summary}
                  </p>
                  
                  <Link 
                    href={`/noticias/${relatedItem.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:gap-3 transition-all ring-focus group/link"
                  >
                    Ler notícia
                    <span className="transition-transform group-hover/link:translate-x-1">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </StaggeredReveal>

          <ScrollReveal animation="fadeUp" delay={400}>
            <div className="text-center mt-12">
              <Link 
                href="/noticias"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-[var(--border)] font-semibold rounded-xl hover:bg-[var(--card)] transition-colors ring-focus"
              >
                Ver todas as notícias
              </Link>
            </div>
          </ScrollReveal>
        </section>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getTagsForNews(slug) {
  const tagMap = {
    "lancamento-inpacta": ["Lançamento", "Inovação", "Gestão Pública"],
    "pmo-inovacao": ["PMO", "Projetos", "Estratégia"],
    "dados-abertos": ["Dados", "Transparência", "APIs"],
    "pmspds-sbc-proposta-2025": ["Segurança Pública", "Governança", "PMSPDS", "São Bernardo do Campo"]
  };
  return tagMap[slug] || ["Tecnologia", "Inovação"];
}

function getSocialIcon(type) {
  const icons = {
    twitter: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    facebook: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    linkedin: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" stroke="currentColor" strokeWidth="2"/>
        <rect x="2" y="9" width="4" height="12" stroke="currentColor" strokeWidth="2"/>
        <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    whatsapp: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2"/>
      </svg>
    )
  };
  return icons[type] || icons.twitter;
}
