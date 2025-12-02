"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { IconSearch, IconX } from './Icons';
import { news } from '@/data/news';
import { services } from '@/data/services';

// Dados mockados para demonstração
const searchableContent = [
  ...news.map(item => ({
    ...item,
    type: 'notícia',
    url: `/noticias/${item.slug}`,
    description: item.summary
  })),
  ...services.map(item => ({
    ...item,
    type: 'serviço',
    url: `/servicos/${item.slug}`,
    description: item.description
  })),
  // Páginas estáticas
  {
    title: "Sobre o InPACTA",
    description: "Conheça nossa história, missão e visão para transformar Maringá em uma cidade mais inteligente.",
    type: "página",
    url: "/sobre",
    slug: "sobre"
  },
  {
    title: "Contato",
    description: "Entre em contato conosco para esclarecimentos, parcerias ou mais informações.",
    type: "página", 
    url: "/contato",
    slug: "contato"
  },
  {
    title: "Transparência",
    description: "Acesso às informações públicas, relatórios e prestação de contas do InPACTA.",
    type: "página",
    url: "/transparencia", 
    slug: "transparencia"
  },
  {
    title: "Governança",
    description: "Estrutura organizacional, processos e práticas de governança institucional.",
    type: "página",
    url: "/governanca",
    slug: "governanca"
  },
  {
    title: "Estrutura Organizacional",
    description: "Organograma, departamentos, núcleos especializados e hierarquia institucional do InPACTA.",
    type: "página",
    url: "/estrutura",
    slug: "estrutura"
  },
  {
    title: "Equipe e Práticas",
    description: "Conheça nossa equipe especializada, metodologias de trabalho e práticas inovadoras.",
    type: "página",
    url: "/equipe",
    slug: "equipe"
  }
];

function SearchIcon({ className = "" }) {
  return (
    <IconSearch width={20} height={20} className={className} />
  );
}

function CloseIcon({ className = "" }) {
  return (
    <IconX width={20} height={20} className={className} />
  );
}

// Hook para busca fuzzy simples
function useSearch(data, query) {
  return data.filter(item => {
    if (!query) return false;
    
    const searchTerm = query.toLowerCase();
    const titleMatch = item.title?.toLowerCase().includes(searchTerm);
    const descriptionMatch = item.description?.toLowerCase().includes(searchTerm);
    const typeMatch = item.type?.toLowerCase().includes(searchTerm);
    
    return titleMatch || descriptionMatch || typeMatch;
  });
}

export default function GlobalSearch({ onClose }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const searchResults = useSearch(searchableContent, query);

  useEffect(() => {
    setResults(searchResults.slice(0, 8)); // Limitar a 8 resultados
    setSelectedIndex(-1);
  }, [searchResults]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      onClose?.();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      // Navegar para o item selecionado
      window.location.href = results[selectedIndex].url;
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    onClose?.();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'notícia': return 'text-[var(--accent)] bg-[var(--accent)]/10';
      case 'serviço': return 'text-[var(--orange)] bg-[var(--orange)]/10';
      case 'página': return 'text-[var(--green)] bg-[var(--green)]/10';
      default: return 'text-[var(--muted)] bg-[var(--card)]';
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-[var(--accent)]/20 text-[var(--accent)] font-medium">
          {part}
        </mark>
      ) : part
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]/30 transition-all ring-focus"
        aria-label="Abrir busca"
      >
        <SearchIcon />
        <span className="hidden sm:inline text-sm">Buscar...</span>
        <kbd className="hidden sm:inline-flex px-2 py-1 text-xs bg-[var(--background)] border border-[var(--border)] rounded">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Search Modal */}
      <div className="relative w-full max-w-2xl bg-[var(--background)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
          <SearchIcon className="text-[var(--muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por serviços, notícias, páginas..."
            className="flex-1 bg-transparent text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none text-lg"
          />
          <button
            onClick={handleClose}
            className="p-1 hover:bg-[var(--card)] rounded-lg transition-colors"
            aria-label="Fechar busca"
          >
            <CloseIcon className="text-[var(--muted)]" />
          </button>
        </div>

        {/* Search Results */}
        <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto">
          {query && results.length === 0 && (
            <div className="p-8 text-center text-[var(--muted)]">
              <SearchIcon className="mx-auto mb-4 w-12 h-12 opacity-50" />
              <p>Nenhum resultado encontrado para "<strong>{query}</strong>"</p>
              <p className="text-sm mt-2">Tente pesquisar por outros termos</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => (
                <Link
                  key={result.slug || result.url}
                  href={result.url}
                  onClick={handleClose}
                  className={`block px-4 py-3 hover:bg-[var(--card)] transition-colors ${
                    selectedIndex === index ? 'bg-[var(--card)]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(result.type)}`}>
                      {result.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[var(--foreground)] mb-1 truncate">
                        {highlightText(result.title, query)}
                      </h3>
                      <p className="text-sm text-[var(--muted)] line-clamp-2">
                        {highlightText(result.description, query)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!query && (
            <div className="p-8 text-center text-[var(--muted)]">
              <SearchIcon className="mx-auto mb-4 w-12 h-12 opacity-50" />
              <p>Digite para começar a buscar</p>
              <p className="text-sm mt-2">Pesquise por serviços, notícias, páginas e mais</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-[var(--card)] border-t border-[var(--border)] text-xs text-[var(--muted)]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded">↑↓</kbd>
              <span>navegar</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded">↵</kbd>
              <span>selecionar</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-[var(--background)] border border-[var(--border)] rounded">esc</kbd>
            <span>fechar</span>
          </div>
        </div>
      </div>
    </div>
  );
}