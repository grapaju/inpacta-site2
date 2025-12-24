'use client'

import { useAdminSidebar } from '@/context/AdminSidebarContext'

const AdminBackdrop = () => {
  const { isMobileOpen, toggleMobileSidebar } = useAdminSidebar()

  if (!isMobileOpen) return null

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      onClick={toggleMobileSidebar}
    />
  )
}

export default AdminBackdrop