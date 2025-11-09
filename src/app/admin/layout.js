'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import { usePathname } from 'next/navigation'

export default function Layout({ children }) {
  const pathname = usePathname()
  
  // Não aplicar AdminLayout para a página de login
  if (pathname?.includes('/admin/login')) {
    return children
  }
  
  return <AdminLayout>{children}</AdminLayout>
}