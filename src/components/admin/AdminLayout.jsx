'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

const NavIcon = ({ children }) => (
  <span className="mr-3 flex-shrink-0 text-[var(--sidebar-muted)]">
    {children}
  </span>
)

const navGroups = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    defaultOpen: true,
    items: [
      {
        name: 'Dashboard',
        href: '/admin',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
          </svg>
        )
      }
    ]
  },
  {
    id: 'conteudo',
    label: 'Conteúdo Principal',
    defaultOpen: true,
    items: [
      {
        name: 'Notícias',
        href: '/admin/news',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
          </svg>
        ),
      },
      {
        name: 'Documentos',
        href: '/admin/documentos',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      }
    ]
  },
  {
    id: 'licitacoes',
    label: 'Licitações e Contratos',
    defaultOpen: true,
    items: [
      {
        name: 'Licitações',
        href: '/admin/biddings',
        adminOnly: true,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        )
      },
    ]
  },
  {
    id: 'admin',
    label: 'Administração e Configurações',
    defaultOpen: false,
    items: [
      {
        name: 'Usuários',
        href: '/admin/users',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        )
      },
      {
        name: 'Analytics',
        href: '/admin/seo',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      },
      {
        name: 'Configurações SEO',
        href: '/admin/seo-config',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      }
    ]
  }
]

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const pathname = usePathname()

  const navIndex = navGroups
    .flatMap(group =>
      group.items.map(item => ({
        ...item,
        groupId: group.id,
        groupLabel: group.label,
        defaultOpen: group.defaultOpen
      }))
    )
    .filter(item => !item.adminOnly || user?.role === 'ADMIN')

  const currentNavItem = navIndex
    .filter(item => pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href)))
    .sort((a, b) => b.href.length - a.href.length)[0]

  const pageTitle = currentNavItem?.name || 'Admin'
  const breadcrumbs = currentNavItem
    ? ['Admin', currentNavItem.groupLabel, currentNavItem.name]
    : ['Admin']

  const handleNavigate = () => setSidebarOpen(false)

  const renderNavGroups = ({ onNavigate } = {}) => (
    <nav className="space-y-3">
      {navGroups.map((group) => {
        const visibleItems = group.items.filter(item => !item.adminOnly || user?.role === 'ADMIN')
        if (visibleItems.length === 0) return null

        const hasActive = visibleItems.some(item => pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href)))

        return (
          <details
            key={group.id}
            open={group.defaultOpen || hasActive}
            className="rounded-lg"
          >
            <summary
              className="px-2 py-2 text-xs font-semibold text-[var(--sidebar-muted)] uppercase tracking-wider cursor-pointer select-none"
              style={{ listStyle: 'none' }}
            >
              {group.label}
            </summary>

            <div className="space-y-1">
              {visibleItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[var(--sidebar-active-bg)] text-[var(--sidebar-fg)] border border-transparent'
                        : 'text-[var(--sidebar-fg)] hover:bg-[var(--sidebar-hover-bg)] border border-transparent'
                    }`}
                    title={item.name}
                    onClick={onNavigate}
                  >
                    <NavIcon>
                      <span className={isActive ? 'text-[var(--sidebar-fg)]' : 'text-[var(--sidebar-muted)]'}>
                        {item.icon}
                      </span>
                    </NavIcon>
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </details>
        )
      })}
    </nav>
  )

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

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--primary)]"></div>
      </div>
    )
  }

  return (
    <div className="admin-shell min-h-screen bg-[var(--background)]">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow min-h-0 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-6 py-4">
            <Link href="/" className="flex items-center">
              <img
                src="/logo-escura.svg"
                alt="INPACTA"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 min-h-0 px-4 pb-4 overflow-y-auto admin-scrollbar">
            {renderNavGroups()}
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[var(--sidebar-bg)]">
            {/* Mobile sidebar content - same as desktop but with close button */}
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Same content as desktop sidebar */}
            <div className="flex-1 min-h-0 h-0 px-4 py-4 overflow-y-auto admin-scrollbar">
              <div className="flex items-center justify-between pb-3">
                <Link href="/admin" className="text-sm font-semibold text-[var(--sidebar-fg)]" onClick={handleNavigate}>
                  INPACTA Admin
                </Link>
              </div>
              {renderNavGroups({ onNavigate: handleNavigate })}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="admin-topbar sticky top-0 z-10 bg-[var(--card)] border-b border-[var(--border)]">
          <div className="admin-topbar-inner flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-[var(--foreground)] hover:text-[var(--primary)]"
                aria-label="Abrir menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="min-w-0">
                <div className="admin-breadcrumbs text-xs text-[var(--muted)] truncate">
                  {breadcrumbs.join(' / ')}
                </div>
                <div className="admin-topbar-title text-base font-semibold text-[var(--foreground)] truncate">
                  {pageTitle}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs text-[var(--muted)]">
                {user?.name || user?.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="admin-topbar-logout"
                aria-label="Sair"
                title="Sair"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-shell-main flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}