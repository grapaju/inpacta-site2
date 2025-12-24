'use client'

import '@/styles/admin.css'
import '@/styles/tailadmin.css'
import AdminLayout from '@/components/admin/AdminLayout'
import TailAdminLayout from '@/components/admin/TailAdminLayout'
import { usePathname } from 'next/navigation'

export default function Layout({ children }) {
  const pathname = usePathname()
  
  // Não aplicar AdminLayout para a página de login
  if (pathname?.includes('/admin/login')) {
    return children
  }
  
  // Use TailAdmin layout for new modern design
  return <TailAdminLayout>{children}</TailAdminLayout>
}