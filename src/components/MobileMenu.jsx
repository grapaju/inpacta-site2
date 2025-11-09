"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { IconX, IconMenu, IconChevronDown } from "./Icons";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Habilita portal apenas no client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloqueia scroll do body quando o drawer está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  const menuItems = [
    {
      label: "O Instituto",
      submenu: [
        { href: "/sobre", label: "Quem Somos", description: "Propósito, Missão e Visão do InPacta" },
        { href: "/estrutura", label: "Estrutura", description: "Conselho de Administração e membros" },
        { href: "/equipe", label: "Equipe e Práticas", description: "Nossa equipe e experiência" },
        { href: "/transparencia", label: "Lei Acesso à Informação", description: "Direito de acesso às informações públicas" },
      ],
    },
    {
      label: "Serviços",
      submenu: [
        { href: "/servicos/governanca-seguranca-publica", label: "Governança e Segurança Pública", description: "Planos municipais e protocolos operacionais" },
        { href: "/servicos/observatorios-inteligencia-dados", label: "Observatórios e Inteligência", description: "Núcleos de dados e portais de transparência" },
        { href: "/servicos/planejamento-estrategico-pmo", label: "Planejamento Estratégico e PMO", description: "Gestão de portfólio e governança de projetos" },
      ],
    },
    { href: "/noticias", label: "Notícias" },
    { href: "/contato", label: "Contato" },
  ];

  // Drawer via portal para evitar clipping/stacking do header
  const drawer = (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[998] md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[var(--background)] border-r border-[var(--border)] z-[9999] transform transition-transform duration-300 ease-in-out md:hidden overflow-y-auto flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menu principal"
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] flex-shrink-0">
          <h2 className="font-semibold text-[var(--primary)]">Menu</h2>
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-[var(--card)] ring-focus"
            onClick={() => {
              setIsOpen(false);
              setExpandedMenu(null);
            }}
            aria-label="Fechar menu"
          >
            <IconX width={20} height={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={item.href || item.label}>
                {item.submenu ? (
                  <div>
                    <button
                      type="button"
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ring-focus text-left font-medium ${
                        expandedMenu === index 
                          ? 'bg-[var(--accent)]/10 text-[var(--accent)]' 
                          : 'bg-[var(--card)]/30 hover:bg-[var(--card)]'
                      }`}
                      onClick={() => setExpandedMenu(expandedMenu === index ? null : index)}
                      aria-expanded={expandedMenu === index ? "true" : "false"}
                      aria-controls={`submenu-${index}`}
                    >
                      <span className="font-semibold">{item.label}</span>
                      <IconChevronDown 
                        width={18} 
                        height={18} 
                        className={`transition-transform duration-200 ${expandedMenu === index ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <div
                      id={`submenu-${index}`}
                      className={`mt-2 ml-2 border-l-2 border-[var(--accent)] pl-2 ${expandedMenu === index ? 'block' : 'hidden'}`}
                      role="region"
                      aria-label={`${item.label} submenu`}
                      aria-hidden={expandedMenu === index ? 'false' : 'true'}
                    >
                      <ul className="space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className="block px-3 py-2.5 rounded-lg hover:bg-[var(--card)] transition-colors ring-focus"
                              onClick={() => {
                                setIsOpen(false);
                                setExpandedMenu(null);
                              }}
                            >
                              <div className="font-medium text-[var(--foreground)] text-sm">{subItem.label}</div>
                              <div className="text-xs text-[var(--muted)] mt-0.5 leading-tight">{subItem.description}</div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center px-4 py-3 rounded-lg hover:bg-[var(--card)] transition-colors ring-focus font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        className="md:hidden p-2 rounded-lg hover:bg-[var(--card)] ring-focus"
        onClick={() => {
          setIsOpen(true);
          setExpandedMenu(0);
        }}
        aria-label="Abrir menu"
        aria-expanded={isOpen}
      >
        <IconMenu width={20} height={20} />
      </button>

      {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}