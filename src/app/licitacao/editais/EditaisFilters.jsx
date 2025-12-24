'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

export default function EditaisFilters({
  selectedModality = '',
  selectedStatus = '',
  selectedYear = '',
  query = '',
  modalityOptions = [],
  statusOptions = [],
  years = [],
}) {
  const formRef = useRef(null);
  const [q, setQ] = useState(query);

  const debouncedQuery = useMemo(() => q, [q]);

  useEffect(() => {
    setQ(query);
  }, [query]);

  useEffect(() => {
    if (!formRef.current) return;
    const handle = setTimeout(() => {
      // Evita navegação redundante (digitação não muda nada)
      if ((query || '') === (debouncedQuery || '')) return;
      formRef.current.requestSubmit();
    }, 450);

    return () => clearTimeout(handle);
  }, [debouncedQuery, query]);

  const submitNow = () => {
    if (!formRef.current) return;
    formRef.current.requestSubmit();
  };

  return (
    <div className="interactive-card bg-[var(--card)] p-6 rounded-2xl border-2 border-[var(--border)] mb-10">
      <form ref={formRef} method="GET" className="grid gap-4 md:grid-cols-4">
        <div>
          <label className="block text-sm font-semibold text-[var(--foreground)] mb-1" htmlFor="filter-modality">
            Modalidade
          </label>
          <select
            id="filter-modality"
            name="modality"
            defaultValue={selectedModality}
            onChange={submitNow}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
          >
            <option value="">Todas</option>
            {modalityOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--foreground)] mb-1" htmlFor="filter-status">
            Status
          </label>
          <select
            id="filter-status"
            name="status"
            defaultValue={selectedStatus}
            onChange={submitNow}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
          >
            <option value="">Todos</option>
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--foreground)] mb-1" htmlFor="filter-year">
            Ano
          </label>
          <select
            id="filter-year"
            name="year"
            defaultValue={selectedYear}
            onChange={submitNow}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
          >
            <option value="">Todos</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--foreground)] mb-1" htmlFor="filter-q">
            Palavra-chave
          </label>
          <input
            id="filter-q"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onBlur={submitNow}
            placeholder="Buscar por número, título ou objeto"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
          />
        </div>

        <div className="md:col-span-4 flex flex-wrap items-center justify-end gap-3">
          <Link
            href="/licitacao/editais"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
          >
            Limpar
          </Link>
        </div>
      </form>
    </div>
  );
}
