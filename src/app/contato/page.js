import Link from "next/link";
import { ScrollReveal, StaggeredReveal } from "@/hooks/useScrollAnimations";

export const metadata = { 
  title: "Contato e Parcerias — InPacta",
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
                Vamos <span className="text-[var(--accent)]">Colaborar</span>
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
              info: "segov_secretario@maringa.pr.gov.br",
              description: "Canal oficial para comunicação institucional",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ),
              color: "var(--primary)",
              action: "Enviar E-mail",
              href: "mailto:segov_secretario@maringa.pr.gov.br"
            },
            {
              title: "Telefone",
              info: "(44) 3221-5389",
              description: "Atendimento de segunda a sexta, 8h às 18h",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ),
              color: "var(--accent)",
              action: "Ligar Agora",
              href: "tel:+554432215389"
            },
            {
              title: "Endereço",
              info: "Av. Getúlio Vargas, 220",
              description: "Centro, Maringá - PR, 87013-130",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ),
              color: "var(--green)",
              action: "Como chegar",
              href: "https://maps.google.com/?q=Av.+Getúlio+Vargas,+220,+Maringá+-+PR"
            },
            {
              title: "Redes Sociais",
              info: "@InPactaMaringa",
              description: "Acompanhe nosso trabalho nas redes sociais",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              ),
              color: "var(--orange)",
              action: "Seguir",
              href: "https://instagram.com/InPactaMaringa"
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
      <section className="section-alt max-w-7xl mx-auto px-4 py-20">
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
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--primary)] mb-2">
                      Nome *
                    </label>
                    <input 
                      type="text"
                      name="nome"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] ring-focus transition-colors"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--primary)] mb-2">
                      E-mail *
                    </label>
                    <input 
                      type="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] ring-focus transition-colors"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--primary)] mb-2">
                    Organização
                  </label>
                  <input 
                    type="text"
                    name="organizacao"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] ring-focus transition-colors"
                    placeholder="Nome da sua organização"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--primary)] mb-2">
                    Assunto *
                  </label>
                  <select 
                    name="assunto"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--accent)] ring-focus transition-colors"
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="parceria">Parceria Institucional</option>
                    <option value="consultoria">Consultoria Técnica</option>
                    <option value="projeto">Desenvolvimento de Projeto</option>
                    <option value="suporte">Suporte e Treinamento</option>
                    <option value="imprensa">Imprensa</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--primary)] mb-2">
                    Mensagem *
                  </label>
                  <textarea 
                    name="mensagem"
                    rows={6}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] ring-focus transition-colors resize-none"
                    placeholder="Descreva sua necessidade, projeto ou dúvida..."
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox"
                    id="privacy"
                    name="privacy"
                    required
                    className="mt-1 size-4 text-[var(--accent)] border-[var(--border)] rounded focus:ring-[var(--accent)]"
                  />
                  <label htmlFor="privacy" className="text-sm text-[color:var(--muted)]">
                    Concordo com o tratamento dos meus dados conforme a{" "}
                    <Link href="/lgpd" className="text-[var(--accent)] hover:underline">
                      Política de Privacidade (LGPD)
                    </Link>
                    .
                  </label>
                </div>

                <button 
                  type="submit"
                  className="w-full px-8 py-4 bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold rounded-xl hover:scale-105 transition-transform ring-focus"
                >
                  Enviar Mensagem
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <ScrollReveal animation="fadeUp">
          <div className="text-center mb-16">
            <div className="section-title justify-center">
              <span className="bar" />
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)]">Perguntas Frequentes</h2>
            </div>
            <p className="mt-4 text-lg text-[color:var(--muted)]">
              Respostas às dúvidas mais comuns sobre nossos serviços.
            </p>
          </div>
        </ScrollReveal>

        <StaggeredReveal staggerDelay={100} className="grid md:grid-cols-2 gap-8">
          {[
            {
              question: "Qual o prazo médio para desenvolvimento de projetos?",
              answer: "O prazo varia conforme a complexidade, mas projetos médios levam de 3 a 6 meses, incluindo análise, desenvolvimento e implantação."
            },
            {
              question: "Vocês atendem órgãos de outros municípios?",
              answer: "Sim, atendemos órgãos públicos de todo o Brasil, com foco especial na região Sul e parcerias estratégicas."
            },
            {
              question: "Como funciona o processo de consultoria?",
              answer: "Iniciamos com diagnóstico, seguido de proposta técnica, desenvolvimento da solução e acompanhamento pós-implantação."
            },
            {
              question: "Há custos para consultas iniciais?",
              answer: "Consultas iniciais e diagnósticos básicos são gratuitos. Cobramos apenas por projetos de desenvolvimento e implementação."
            },
            {
              question: "Vocês oferecem treinamento para equipes?",
              answer: "Sim, oferecemos capacitação técnica, workshops e treinamentos específicos para equipes que utilizarão nossas soluções."
            },
            {
              question: "Como garantem a segurança dos dados?",
              answer: "Seguimos rigorosamente a LGPD e melhores práticas de segurança, com criptografia, backups seguros e auditoria constante."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-[var(--card)] p-6 rounded-2xl border-2 border-[var(--border)]">
              <h3 className="font-bold text-[var(--primary)] mb-3">
                {faq.question}
              </h3>
              <p className="text-[color:var(--muted)] leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </StaggeredReveal>
      </section>

      {/* Mapa e Localização */}
      <section className="section-alt max-w-7xl mx-auto px-4 py-20">
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
                        Av. Getúlio Vargas, 220<br/>
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
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--green)] text-white font-semibold rounded-xl hover:scale-105 transition-transform ring-focus">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Abrir no Google Maps
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fadeLeft">
            <div className="aspect-square bg-gradient-to-br from-[var(--green)]/20 to-[var(--accent)]/20 rounded-2xl border-2 border-[var(--border)] relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="size-16 bg-[var(--green)] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--primary)] mb-2">InPacta</h3>
                  <p className="text-sm text-[color:var(--muted)]">
                    Centro de Maringá<br/>
                    Clique para ver no mapa
                  </p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 size-4 bg-[var(--accent)]/30 rounded-full"></div>
              <div className="absolute top-8 right-6 size-2 bg-[var(--green)]/40 rounded-full"></div>
              <div className="absolute bottom-6 left-8 size-3 bg-[var(--primary)]/20 rounded-full"></div>
              <div className="absolute bottom-4 right-4 size-6 bg-[var(--accent)]/10 rounded-full"></div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
