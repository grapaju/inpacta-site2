'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from "next/link"
import Image from "next/image"
import { news as staticNews } from "@/data/news"
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations"

export default function Page() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'inovacao', label: 'Inovação' },
    { value: 'mercado', label: 'Mercado' },
    { value: 'negocios', label: 'Negócios' },
    { value: 'sustentabilidade', label: 'Sustentabilidade' },
    { value: 'capacitacao', label: 'Capacitação' }
  ]

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: '1',
        limit: '12'
      })
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/public/news?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        // Se não há notícias no banco, usar notícias estáticas
        if (data.news.length === 0) {
          const filteredStatic = selectedCategory === 'all' 
            ? staticNews 
            : staticNews.filter(item => item.category === selectedCategory)
          setNews(filteredStatic.sort((a, b) => (a.date < b.date ? 1 : -1)))
        } else {
          // Converter dados do banco para formato compatível
          const convertedNews = data.news.map(item => ({
            ...item,
            date: item.publishedAt || item.createdAt,
            link: `/noticias/${item.slug}`,
            author: item.author.name || item.author.email
          }))
          setNews(convertedNews)
        }
      } else {
        // Fallback para notícias estáticas
        const filteredStatic = selectedCategory === 'all' 
          ? staticNews 
          : staticNews.filter(item => item.category === selectedCategory)
        setNews(filteredStatic.sort((a, b) => (a.date < b.date ? 1 : -1)))
      }
    } catch (error) {
      console.error('Erro ao carregar notícias:', error)
      // Fallback para notícias estáticas
      const filteredStatic = selectedCategory === 'all' 
        ? staticNews 
        : staticNews.filter(item => item.category === selectedCategory)
      setNews(filteredStatic.sort((a, b) => (a.date < b.date ? 1 : -1)))
    } finally {
      setLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  const items = news
  const featuredNews = items.slice(0, 3)
  const otherNews = items.slice(3)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--green)] to-[var(--accent)] text-white relative overflow-hidden">
        <div className="hero-pattern absolute inset-0 opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <ScrollReveal animation="fadeUp">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-16 bg-white rounded-full"></div>
                <span className="text-white/80 font-medium">Comunicação</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Notícias e <span className="text-[var(--primary)]">Atualizações</span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                Acompanhe as últimas novidades, projetos em desenvolvimento 
                e atualizações do InPacta.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <StaggeredReveal staggerDelay={150} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: items.length.toString(), label: "Notícias Publicadas", icon: "news", color: "var(--primary)" },
            { number: "12", label: "Categorias", icon: "tag", color: "var(--accent)" },
            { number: "3.2K", label: "Leitores Mensais", icon: "users", color: "var(--green)" },
            { number: "24/7", label: "Atualizações", icon: "clock", color: "var(--orange)" },
          ].map((stat, index) => (
            <div key={index} className="interactive-card text-center p-6 rounded-2xl bg-[var(--card)] border-2 border-[var(--border)]">
              <div 
                className="inline-flex size-16 items-center justify-center rounded-2xl mb-4"
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                {stat.icon === "news" && (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {stat.icon === "tag" && (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l3.09 6.26L22 9l-5 4.87 1.18 6.88L12 17.77l-6.18 3.98L7 14.87 2 10l6.91-1.74L12 2z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {stat.icon === "users" && (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                {stat.icon === "clock" && (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </div>
              <div className="text-3xl font-bold mb-2" style={{ color: stat.color }}>
                {stat.number}
              </div>
              <div className="text-sm text-[color:var(--muted)] font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </StaggeredReveal>
      </section>

      {/* Category Filter */}
      <section className="section-alt max-w-7xl mx-auto px-4 py-12">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-[var(--primary)] mb-4">
              Filtrar por Categoria
            </h3>
            <p className="text-[color:var(--muted)]">
              Explore nossas notícias por área de interesse
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="fadeUp" delay={200}>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 border-2 ${
                  selectedCategory === category.value
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg scale-105'
                    : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {loading && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--card)] rounded-full border-2 border-[var(--border)]">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--accent)]"></div>
              <span className="text-[color:var(--muted)] font-medium">Carregando notícias...</span>
            </div>
          </div>
        )}
      </section>

      {/* Notícias em Destaque */}
      {featuredNews.length > 0 && (
        <section className="section-alt max-w-7xl mx-auto px-4 py-20">
          <ScrollReveal animation="fadeUp">
            <div className="text-center mb-16">
              <div className="section-title justify-center">
                <span className="bar" />
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Destaques</h2>
              </div>
              <p className="mt-4 text-lg text-[color:var(--muted)]">
                As notícias mais importantes e recentes do InPacta.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Notícia Principal */}
            <ScrollReveal animation="fadeUp" className="lg:col-span-2">
              <article className="interactive-card group bg-[var(--card)] rounded-2xl border-2 border-[var(--border)] overflow-hidden h-full">
                <div className="aspect-video bg-gradient-to-br from-[var(--accent)]/20 to-[var(--green)]/20 relative overflow-hidden">
                  {featuredNews[0].featuredImage && (
                    <Image 
                      src={featuredNews[0].featuredImage} 
                      alt={featuredNews[0].title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="inline-block px-3 py-1 bg-[var(--accent)] text-xs font-medium rounded-full mb-2">
                      DESTAQUE
                    </span>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <time className="text-sm text-[color:var(--muted)]">
                      {new Date(featuredNews[0].date).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </time>
                    <span className="size-1 bg-[var(--muted)] rounded-full"></span>
                    <span className="text-sm text-[var(--accent)] font-medium">
                      Tecnologia
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-[var(--primary)] mb-4 group-hover:text-[var(--accent)] transition-colors">
                    {featuredNews[0].title}
                  </h2>
                  
                  <p className="text-[color:var(--muted)] leading-relaxed mb-6">
                    {featuredNews[0].summary}
                  </p>
                  
                  <Link 
                    href={`/noticias/${featuredNews[0].slug}`}
                    className="inline-flex items-center gap-2 font-semibold text-[var(--accent)] hover:gap-3 transition-all ring-focus group/link"
                  >
                    Ler notícia completa
                    <span className="transition-transform group-hover/link:translate-x-1">→</span>
                  </Link>
                </div>
              </article>
            </ScrollReveal>

            {/* Notícias Secundárias */}
            <div className="space-y-6">
              {featuredNews.slice(1, 3).map((newsItem, index) => (
                <ScrollReveal key={newsItem.slug} animation="fadeUp" delay={200 + index * 100}>
                  <article className="interactive-card group bg-[var(--card)] p-6 rounded-2xl border-2 border-[var(--border)]">
                    <div className="flex items-center gap-3 mb-3">
                      <time className="text-xs text-[color:var(--muted)]">
                        {new Date(newsItem.date).toLocaleDateString("pt-BR")}
                      </time>
                      <span className="text-xs px-2 py-1 bg-[var(--green)]/10 text-[var(--green)] rounded-full">
                        Novidade
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-[var(--primary)] mb-3 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                      {newsItem.title}
                    </h3>
                    
                    <p className="text-sm text-[color:var(--muted)] leading-relaxed mb-4 line-clamp-3">
                      {newsItem.summary}
                    </p>
                    
                    <Link 
                      href={`/noticias/${newsItem.slug}`}
                      className="text-sm font-medium text-[var(--accent)] hover:underline ring-focus"
                    >
                      Ler mais →
                    </Link>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Todas as Notícias */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">
                {selectedCategory === 'all' ? 'Todas as Notícias' : `Notícias: ${categories.find(c => c.value === selectedCategory)?.label}`}
              </h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)]">
              {selectedCategory === 'all' 
                ? 'Acompanhe todas as atualizações e novidades do InPacta.'
                : `Explore nossas notícias de ${categories.find(c => c.value === selectedCategory)?.label.toLowerCase()}.`
              }
            </p>
          </div>
        </ScrollReveal>

        {items.length > 0 ? (
          <>
            <StaggeredReveal staggerDelay={100} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((newsItem, index) => (
                <article key={newsItem.slug} className="interactive-card group bg-[var(--card)] rounded-2xl border-2 border-[var(--border)] overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 relative">
                    {newsItem.featuredImage && (
                      <Image 
                        src={newsItem.featuredImage} 
                        alt={newsItem.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-2 py-1 bg-[var(--background)]/80 backdrop-blur text-xs font-medium rounded text-[var(--foreground)]">
                        {newsItem.category || getCategoryByIndex(index)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <time className="text-xs text-[color:var(--muted)]">
                        {new Date(newsItem.date).toLocaleDateString("pt-BR")}
                      </time>
                      <span className="size-1 bg-[var(--muted)] rounded-full"></span>
                      <span className="text-xs text-[var(--accent)]">
                        {getReadingTime(newsItem.summary)} min de leitura
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-[var(--primary)] mb-3 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                      {newsItem.title}
                    </h3>
                    
                    <p className="text-sm text-[color:var(--muted)] leading-relaxed mb-4 line-clamp-3">
                      {newsItem.summary}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/noticias/${newsItem.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:gap-3 transition-all ring-focus group/link"
                      >
                        Ler mais
                        <span className="transition-transform group-hover/link:translate-x-1">→</span>
                      </Link>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          className="size-8 rounded-full bg-[var(--background)] hover:bg-[var(--border)] transition-colors flex items-center justify-center ring-focus"
                          title="Compartilhar"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="2"/>
                            <polyline points="16,6 12,2 8,6" stroke="currentColor" strokeWidth="2"/>
                            <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </StaggeredReveal>

            {/* Load More */}
            {items.length > 9 && (
              <ScrollReveal animation="fadeUp" delay={300}>
                <div className="text-center mt-12">
                  <button className="px-8 py-4 bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold rounded-xl hover:scale-105 transition-transform ring-focus">
                    Carregar mais notícias
                  </button>
                </div>
              </ScrollReveal>
            )}
          </>
        ) : (
          <ScrollReveal animation="fadeUp">
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📰</div>
              <h3 className="text-2xl font-bold text-[var(--primary)] mb-4">
                Nenhuma notícia encontrada
              </h3>
              <p className="text-[color:var(--muted)] mb-8 max-w-md mx-auto">
                {selectedCategory === 'all' 
                  ? 'Ainda não temos notícias publicadas. Volte em breve!'
                  : `Não encontramos notícias para a categoria "${categories.find(c => c.value === selectedCategory)?.label}".`
                }
              </p>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-6 py-3 bg-[var(--accent)] text-white font-semibold rounded-xl hover:scale-105 transition-transform ring-focus"
                >
                  Ver todas as notícias
                </button>
              )}
            </div>
          </ScrollReveal>
        )}
      </section>

      {/* Newsletter */}
      <section className="section-alt max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="scale">
          <div className="text-center bg-gradient-to-br from-[var(--green)]/10 via-[var(--card)] to-[var(--accent)]/10 rounded-3xl p-12 border-2 border-[var(--green)]/20">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] mb-6">
              Receba nossas atualizações
            </h2>
            <p className="text-lg text-[color:var(--muted)] mb-8 max-w-2xl mx-auto">
              Assine nossa newsletter e seja o primeiro a saber sobre novos projetos, 
              atualizações e oportunidades.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] ring-focus"
                required
              />
              <button 
                type="submit"
                className="px-6 py-3 bg-[var(--green)] text-white font-semibold rounded-xl hover:scale-105 transition-transform ring-focus whitespace-nowrap"
              >
                Assinar Newsletter
              </button>
            </form>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}

// Helper functions
function getCategoryByIndex(index) {
  const categories = ["Tecnologia", "Projetos", "Inovação", "Governança", "Smart Cities", "Dados", "Equipe"];
  return categories[index % categories.length];
}

function getReadingTime(text) {
  const wordsPerMinute = 200;
  const words = text.split(' ').length;
  return Math.ceil(words / wordsPerMinute);
}
