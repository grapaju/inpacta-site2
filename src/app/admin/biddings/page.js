/**
 * Página de Listagem de Licitações
 * /admin/biddings
 */
import BiddingList from '@/components/admin/BiddingList';

export const metadata = {
  title: 'Licitações | Admin',
  description: 'Gerenciar licitações'
};

export default function BiddingsPage() {
  return <BiddingList />;
}
