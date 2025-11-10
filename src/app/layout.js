'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { usePathname } from 'next/navigation';
import ThemeToggle from "@/components/ThemeToggle";
import AccessibilityControls from "@/components/AccessibilityControls";
import CookieConsent from "@/components/CookieConsent";
import ThemeProvider from "@/components/ThemeProvider";
import MobileMenu from "@/components/MobileMenu";
import DesktopMenu from "@/components/DesktopMenu";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata movido para ser gerenciado dinamicamente

function Header() {
  return (
    <>
      {/* Top Bar */}
      <div className="bg-[var(--primary)] text-white text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
          <div className="flex items-center justify-between">
            {/* Contatos - Otimizado para mobile */}
            <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
              <a 
                href="mailto:segov_secretario@maringa.pr.gov.br" 
                className="flex items-center gap-1.5 sm:gap-2 hover:text-white/80 transition-colors min-h-[44px] truncate"
                aria-label="Email institucional"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 sm:w-4 sm:h-4">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span className="hidden md:inline truncate">segov_secretario@maringa.pr.gov.br</span>
                <span className="md:hidden">Contato</span>
              </a>
              <a 
                href="tel:+554432215389" 
                className="flex items-center gap-1.5 sm:gap-2 hover:text-white/80 transition-colors min-h-[44px] whitespace-nowrap"
                aria-label="Telefone principal"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 sm:w-4 sm:h-4">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span className="hidden sm:inline">(44) 3221-5389</span>
                <span className="sm:hidden">Tel</span>
              </a>
            </div>
            
            {/* Controles - Compactos no mobile */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <AccessibilityControls />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 bg-[var(--card)]/95 border-b border-[var(--border)] backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16 sm:h-20 relative">
            {/* Logo - Redimensionado para mobile */}
            <Link href="/" className="flex items-center group" aria-label="Página inicial do InPacta">
              <div className="relative h-10 sm:h-12">
                <Image
                  src="/logo-clara.svg?v=20251110"
                  alt="InPacta Logo"
                  width={160}
                  height={50}
                  className="h-10 sm:h-12 w-auto transition-opacity group-hover:opacity-80 logo-light"
                  priority
                />
                <Image
                  src="/logo-escura.svg?v=20251110"
                  alt="InPacta Logo"
                  width={160}
                  height={50}
                  className="h-10 sm:h-12 w-auto transition-opacity group-hover:opacity-80 logo-dark"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <DesktopMenu />

            {/* Mobile Menu Button */}
            <MobileMenu />
          </div>
        </div>
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/95 text-white mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 sm:gap-10 md:gap-12">
          {/* Logo e Descrição - Coluna maior */}
          <div className="sm:col-span-2 md:col-span-4 space-y-4 sm:space-y-6">
            <Link href="/" className="inline-block group">
              <div className="relative h-9 sm:h-10 transition-transform group-hover:scale-105">
                <Image
                  src="/logo-clara.svg?v=20251110"
                  alt="InPacta Logo"
                  width={140}
                  height={48}
                  className="h-9 sm:h-10 w-auto brightness-0 invert"
                />
              </div>
            </Link>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-sm">
              Fortalecendo a governança pública através de inovação, tecnologia e inteligência de dados. 
              Transformando boas práticas em resultados reais para governos e cidadãos.
            </p>
            {/* Redes Sociais/Contato */}
            <div className="flex items-center gap-3 pt-2">
              <Link 
                href="/contato" 
                className="flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-lg bg-white/10 text-white hover:bg-white hover:text-[var(--primary)] transition-all duration-300 ring-focus backdrop-blur border border-white/20"
                aria-label="Contato"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </Link>
              <Link 
                href="/transparencia" 
                className="flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-lg bg-white/10 text-white hover:bg-white hover:text-[var(--primary)] transition-all duration-300 ring-focus backdrop-blur border border-white/20"
                aria-label="Transparência"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                  <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                  <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                </svg>
              </Link>
              <Link 
                href="/governanca" 
                className="flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-lg bg-white/10 text-white hover:bg-white hover:text-[var(--primary)] transition-all duration-300 ring-focus backdrop-blur border border-white/20"
                aria-label="Governança"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M12 2l3.5 7 7.5 1-5.5 5 1.5 7.5L12 19l-6.5 3.5L7 15l-5.5-5 7.5-1L12 2z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Links Principais */}
          <div className="md:col-span-3 space-y-3 sm:space-y-5">
            <h3 className="font-bold text-white text-base sm:text-lg relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-[var(--accent)] after:rounded-full">
              Navegação
            </h3>
            <ul className="space-y-2.5 sm:space-y-3">
              {[
                { href: "/noticias", label: "Notícias" },
                { href: "/contato", label: "Contato" },
                { href: "/acessibilidade", label: "Acessibilidade" },
                { href: "/lgpd", label: "LGPD" },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    className="text-white/70 hover:text-white md:hover:translate-x-1 transition-all duration-200 ring-focus inline-flex items-center gap-2 group text-sm sm:text-base min-h-[44px] sm:min-h-0" 
                    href={link.href}
                  >
                    <span className="text-[var(--accent)] transition-transform md:group-hover:translate-x-1 text-sm">▸</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institucional */}
          <div className="md:col-span-2 space-y-3 sm:space-y-5">
            <h3 className="font-bold text-white text-base sm:text-lg relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-[var(--accent)] after:rounded-full">
              Institucional
            </h3>
            <ul className="space-y-2.5 sm:space-y-3">
              {[
                { href: "/sobre", label: "Sobre" },
                { href: "/governanca", label: "Governança" },
                { href: "/servicos", label: "Serviços" },
                { href: "/projetos", label: "Projetos" },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    className="text-white/70 hover:text-white md:hover:translate-x-1 transition-all duration-200 ring-focus inline-flex items-center gap-2 group text-sm sm:text-base min-h-[44px] sm:min-h-0" 
                    href={link.href}
                  >
                    <span className="text-[var(--accent)] transition-transform md:group-hover:translate-x-1 text-sm">▸</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Transparência */}
          <div className="md:col-span-3 space-y-3 sm:space-y-5">
            <h3 className="font-bold text-white text-base sm:text-lg relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-[var(--accent)] after:rounded-full">
              Transparência
            </h3>
            <ul className="space-y-2.5 sm:space-y-3">
              {[
                { href: "/transparencia", label: "Portal da Transparência" },
                { href: "/dados", label: "Dados Abertos" },
                { href: "/estrutura", label: "Estrutura" },
                { href: "/equipe", label: "Equipe" },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    className="text-white/70 hover:text-white md:hover:translate-x-1 transition-all duration-200 ring-focus inline-flex items-center gap-2 group text-sm sm:text-base min-h-[44px] sm:min-h-0" 
                    href={link.href}
                  >
                    <span className="text-[var(--accent)] transition-transform md:group-hover:translate-x-1 text-sm">▸</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Linha Divisória */}
        <div className="border-t border-white/20 mt-10 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/60">
            <p className="text-center md:text-left order-2 md:order-1">
              © {new Date().getFullYear()} InPacta - Instituto de Projetos Avançados. Todos os direitos reservados.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 order-1 md:order-2">
              <Link href="/lgpd" className="hover:text-white transition-colors ring-focus min-h-[44px] flex items-center">
                Privacidade
              </Link>
              <Link href="/acessibilidade" className="hover:text-white transition-colors ring-focus min-h-[44px] flex items-center">
                Acessibilidade
              </Link>
              <span className="text-white/40 hidden sm:inline">v{process.env.NEXT_PUBLIC_COMMIT_SHA?.slice(0,7) || 'local'}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  return (
    <html lang="pt-br" suppressHydrationWarning>
      <Head>
        <title>InPacta — Inovação pública para cidades inteligentes</title>
        <meta name="description" content="O InPacta acelera a modernização administrativa e tecnológica do setor público em Maringá-PR." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <ThemeProvider>
          {!isAdminRoute && <Header />}
          <main className={isAdminRoute ? 'min-h-screen' : 'flex-1'}>
            {children}
          </main>
          {!isAdminRoute && <Footer />}
          {!isAdminRoute && <CookieConsent />}
        </ThemeProvider>
      </body>
    </html>
  );
}