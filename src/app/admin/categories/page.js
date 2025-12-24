
'use client';

import Link from 'next/link';

export default function ManageCategoriesPage() {
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Categorias (desativado)</h1>
          <p className="admin-meta" style={{ marginTop: '0.5rem' }}>
            As categorias de Transparência estão fixas para a página /transparencia.
          </p>
        </div>

        <Link href="/admin/documentos" className="admin-btn-secondary">
          ← Voltar
        </Link>
      </header>

      <div className="admin-card">
        <p>
          Esta sessão foi desativada temporariamente para evitar inconsistências.
          No momento, o Portal da Transparência utiliza apenas estas categorias:
        </p>

        <ul style={{ marginTop: '0.75rem', paddingLeft: '1.25rem' }}>
          <li>Atos Normativos e Regulamentos</li>
          <li>Governança e Administração</li>
          <li>Prestação de Contas</li>
        </ul>
      </div>
    </div>
  );
}
