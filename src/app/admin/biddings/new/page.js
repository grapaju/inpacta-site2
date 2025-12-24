/**
 * Página de Criação de Licitação
 * /admin/biddings/new
 */
import BiddingForm from '@/components/admin/BiddingForm';

export const metadata = {
  title: 'Nova Licitação | Admin',
  description: 'Criar nova licitação'
};

export default function NewBiddingPage() {
  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Nova licitação</h1>
          <span className="admin-form-hint">Preencha as informações básicas da licitação.</span>
        </div>
      </header>

      <BiddingForm />
    </div>
  );
}
