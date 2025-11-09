"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { IconChevronDown } from "./Icons";

export default function DesktopMenu() {
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = (index) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredMenu(index);
  };

  const handleMouseLeave = () => {
    // Add a delay before closing the dropdown
    timeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 300); // 300ms delay
  };

  const menuItems = [
    {
      label: "O Instituto",
      submenu: [
        { 
          href: "/sobre", 
          label: "Quem Somos",
          description: "Propósito, Missão e Visão do InPacta"
        },
        { 
          href: "/estrutura", 
          label: "Estrutura",
          description: "Conselho de Administração e membros"
        },
        { 
          href: "/equipe", 
          label: "Equipe e Práticas",
          description: "Nossa equipe e experiência"
        },
        { 
          href: "/transparencia", 
          label: "Lei Acesso à Informação",
          description: "Direito de acesso às informações públicas"
        },
      ]
    },
    {
      label: "Serviços",
      submenu: [
        { 
          href: "/servicos/governanca-seguranca-publica", 
          label: "Governança e Segurança Pública",
          description: "Planos municipais e protocolos operacionais"
        },
        { 
          href: "/servicos/observatorios-inteligencia-dados", 
          label: "Observatórios e Inteligência",
          description: "Núcleos de dados e portais de transparência"
        },
        { 
          href: "/servicos/planejamento-estrategico-pmo", 
          label: "Planejamento Estratégico e PMO",
          description: "Gestão de portfólio e governança de projetos"
        },
      ]
    },
    { href: "/noticias", label: "Notícias" },
    { href: "/contato", label: "Contato" },
  ];

  return (
    <nav aria-label="Principal" className="hidden md:flex items-center gap-2 text-sm">
      {menuItems.map((item, index) => (
        <div 
          key={item.href || item.label}
          className={`relative ${item.submenu ? 'dropdown-container' : ''}`}
          onMouseEnter={() => item.submenu && handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
        >
          {item.submenu ? (
            // Item com submenu
            <>
              <button 
                className="nav-link flex items-center gap-1"
                aria-expanded={hoveredMenu === index ? "true" : "false"}
                aria-haspopup="menu"
              >
                {item.label}
                <IconChevronDown 
                  width={14} 
                  height={14} 
                  className={`transition-transform ${hoveredMenu === index ? 'rotate-180' : ''}`}
                />
              </button>
              
              {hoveredMenu === index && (
                <div 
                  className="absolute top-full left-0 mt-2 w-80 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl z-[100] overflow-hidden"
                  style={{ 
                    animation: 'fadeIn 0.2s ease-in-out',
                  }}
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="py-2">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className="dropdown-item block px-4 py-3 transition-all duration-200 ring-focus group"
                        onClick={() => setHoveredMenu(null)}
                      >
                        <div className="font-medium text-[var(--foreground)] mb-1 group-hover:text-[var(--accent)] transition-colors">
                          {subItem.label}
                        </div>
                        <div className="text-sm text-[color:var(--muted)] leading-tight group-hover:text-[var(--foreground)] transition-colors">
                          {subItem.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Item simples
            <Link className="nav-link" href={item.href}>
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}