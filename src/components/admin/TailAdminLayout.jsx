'use client'

import { AdminSidebarProvider, useAdminSidebar } from '@/context/AdminSidebarContext'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminHeader from './AdminHeader'
import AdminSidebar from './AdminSidebar'
import AdminBackdrop from './AdminBackdrop'

const LayoutContent = ({ children }) => {
  const { isExpanded, isHovered, isMobileOpen } = useAdminSidebar()

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AdminSidebar />
        <AdminBackdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
        } ${isMobileOpen ? 'ml-0' : ''}`}
      >
        <AdminHeader />
        <div className="p-4 w-full md:p-6">
          <div className="max-w-none w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TailAdminLayout({ children }) {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const pathname = usePathname()
  
  useEffect(() => {
    // Aguardar um pouco para garantir que o localStorage está disponível
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken')
      const userData = localStorage.getItem('adminUser')
      
      if (!token || !userData) {
        router.push('/admin/login')
        return
      }

      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
        router.push('/admin/login')
      }
    }

    // Aguardar um frame para garantir que o localStorage foi persistido
    setTimeout(checkAuth, 100)
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <AdminSidebarProvider>
      <LayoutContent>
        {children}
      </LayoutContent>
    </AdminSidebarProvider>
  )
}