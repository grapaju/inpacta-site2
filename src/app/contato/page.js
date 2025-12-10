import Link from "next/link";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";
import ContactForm from "@/components/ContactForm";

export const metadata = { 
  title: "Contato e Parcerias — InPACTA",
  description: "Entre em contato conosco para parcerias, projetos ou dúvidas. Estamos prontos para colaborar na transformação digital do setor público."
};

export default function Page() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--green)] to-[var(--primary)] text-white relative overflow-hidden">
        <div className="hero-pattern absolute inset-0 opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <ScrollReveal animation="fadeUp">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-16 bg-white rounded-full"></div>
                <span className="text-white/80 font-medium">Fale Conosco</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Vamos <span style={{ color: '#ff6b35' }}>Colaborar</span>
              </h1>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                Entre em contato para discutir projetos, parcerias ou esclarecer dúvidas. 
                Estamos prontos para transformar ideias em soluções inovadoras.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Formas de Contato */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Como Falar Conosco</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)]">
              Múltiplos canais para facilitar seu contato.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal staggerDelay={150} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "E-mail Institucional",
              info: "contato@inpacta.org.br",
              description: "Canal oficial para comunicação institucional",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ),
              color: "var(--primary)",
              action: "Enviar E-mail",
              href: "mailto:contato@inpacta.org.br"
            },
            {
              title: "Telefone",
              info: "(44) 3127-5400",
              description: "Atendimento de segunda a sexta, 8h às 18h",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ),
              color: "var(--accent)",
              action: "Ligar Agora",
              href: "tel:+5544312754000"
            },
            {
              title: "Endereço",
              info: "Av. XV de novembro, 701, 2º Andar",
              description: "Centro, Maringá - PR, CEP 87013-130",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ),
              color: "var(--green)",
              action: "Como chegar",
              href: "https://maps.google.com/?q=Av.+XV+de+novembro,+701,+2º+Andar,+Centro,+Maringá,+CEP+87013-130"
            },
            {
              title: "Redes Sociais",
              info: "Em breve",
              description: "Nossos perfis oficiais serão divulgados em breve",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ),
              color: "var(--orange)",
              action: "Em breve",
              href: "#"
            }
          ].map((contact, index) => (
            <div key={index} className="interactive-card bg-[var(--card)] p-8 rounded-2xl border-2 border-[var(--border)] text-center flex flex-col h-full">
              <div 
                className="inline-flex size-16 items-center justify-center rounded-2xl mb-6"
                style={{ backgroundColor: `${contact.color}15`, color: contact.color }}
              >
                {contact.icon}
              </div>
              
              <h3 className="text-lg font-bold text-[var(--primary)] mb-2">
                {contact.title}
              </h3>
              
              <p 
                className="text-lg font-semibold mb-3 break-all" 
                style={{ color: contact.color, wordBreak: 'break-word', overflowWrap: 'anywhere' }}
              >
                {contact.info}
              </p>
              
              <p className="text-sm text-[color:var(--muted)] leading-relaxed mb-6">
                {contact.description}
              </p>
              
              <div className="mt-auto">
                <a 
                  href={contact.href}
                  target={contact.href?.startsWith('http') ? '_blank' : undefined}
                  rel={contact.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="inline-block px-4 py-2 text-sm font-medium rounded-lg hover:scale-105 transition-transform ring-focus"
                  style={{ 
                    backgroundColor: `${contact.color}15`, 
                    color: contact.color 
                  }}
                >
                  {contact.action}
                </a>
              </div>
            </div>
          ))}
        </StaggeredReveal>
      </section>

      {/* Formulário de Contato */}
      <div className="section-alt">
        <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <ScrollReveal animation="fadeRight">
            <div>
              <div className="section-title">
                <span className="bar" />
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Envie sua Mensagem</h2>
              </div>
              <div className="mt-8 space-y-6">
                <p className="text-lg text-[color:var(--muted)] leading-relaxed">
                  Preencha o formulário ao lado e nossa equipe entrará em contato 
                  em até <strong className="text-[var(--foreground)]">24 horas úteis</strong>.
                </p>
                
                <div className="space-y-4">
                  {[
                    {
                      title: "Parcerias Institucionais",
                      description: "Colaborações com órgãos públicos e instituições de ensino."
                    },
                    {
                      title: "Consultoria Técnica",
                      description: "Orientação especializada em projetos de transformação digital."
                    },
                    {
                      title: "Desenvolvimento de Projetos",
                      description: "Criação de soluções customizadas para sua necessidade."
                    },
                    {
                      title: "Suporte e Treinamento",
                      description: "Capacitação de equipes e suporte técnico especializado."
                    }
                  ].map((service, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="size-2 bg-[var(--accent)] rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h3 className="font-bold text-[var(--primary)] mb-1">{service.title}</h3>
                        <p className="text-sm text-[color:var(--muted)]">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fadeLeft">
            <div className="bg-[var(--card)] p-8 rounded-2xl border-2 border-[var(--border)]">
              <ContactForm />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ removido conforme solicitação */}

      {/* Mapa e Localização */}
      <div className="section-alt">
        <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal animation="fadeRight">
            <div>
              <div className="section-title">
                <span className="bar" />
                <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Nossa Localização</h2>
              </div>
              <div className="mt-8 space-y-6">
                <p className="text-lg text-[color:var(--muted)] leading-relaxed">
                  Estamos localizados no <strong className="text-[var(--foreground)]">centro de Maringá</strong>, 
                  em um espaço moderno e acessível para receber nossos parceiros.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="size-10 bg-[var(--green)]/15 text-[var(--green)] rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--primary)]">Endereço</h3>
                      <p className="text-[color:var(--muted)]">
                        Av. XV de novembro, 701, 2º Andar<br/>
                        Centro, Maringá - PR<br/>
                        CEP: 87013-130
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="size-10 bg-[var(--accent)]/15 text-[var(--accent)] rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--primary)]">Horário de Atendimento</h3>
                      <p className="text-[color:var(--muted)]">
                        Segunda a Sexta: 8h às 18h<br/>
                        Sábados: 8h às 12h<br/>
                        <em>Agendamento recomendado</em>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <a href="https://maps.google.com/?q=Av.+XV+de+novembro,+701,+2º+Andar,+Centro,+Maringá,+CEP+87013-130" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--green)] text-white font-semibold rounded-xl hover:scale-105 transition-transform ring-focus">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Abrir no Google Maps
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fadeLeft">
            <div className="rounded-2xl border-2 border-[var(--border)] overflow-hidden w-full aspect-video md:aspect-auto md:h-[450px]">
              <iframe
                title="Mapa - InPACTA"
                aria-label="Mapa do endereço do InPACTA"
                src="https://www.google.com/maps?q=Av.+XV+de+novembro,+701,+2º+Andar,+Centro,+Maringá,+CEP+87013-130&hl=pt-BR&z=18&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </ScrollReveal>
        </div>
      </section>
      </div>
      </div>
    </div>
  );
}
