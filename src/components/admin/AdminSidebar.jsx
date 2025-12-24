'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminSidebar } from '@/context/AdminSidebarContext'

// Navigation structure from existing AdminLayout
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
        name: 'Serviços',
        href: '/admin/services',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 9H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        name: 'Projetos',
        href: '/admin/projects',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm6 0v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2zm6 0v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
        ),
      }
      ,
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
    label: 'Administração',
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

const AdminSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useAdminSidebar()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  
  const [openSubmenu, setOpenSubmenu] = useState({})
  const [subMenuHeight, setSubMenuHeight] = useState({})
  const subMenuRefs = useRef({})

  const isActive = useCallback(
    (path) => pathname === path || (path !== '/admin' && pathname?.startsWith(path)),
    [pathname]
  )

  useEffect(() => {
    const userData = localStorage.getItem('adminUser')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
      }
    }
  }, [])

  useEffect(() => {
    let submenuMatched = false
    navGroups.forEach((group) => {
      const visibleItems = group.items.filter(item => !item.adminOnly || user?.role === 'ADMIN')
      const hasActive = visibleItems.some(item => isActive(item.href))
      
      if (hasActive) {
        setOpenSubmenu(prev => ({ ...prev, [group.id]: true }))
        submenuMatched = true
      } else if (!group.defaultOpen && !submenuMatched) {
        setOpenSubmenu(prev => ({ ...prev, [group.id]: false }))
      }
    })
  }, [pathname, isActive, user])

  useEffect(() => {
    Object.keys(openSubmenu).forEach(groupId => {
      if (openSubmenu[groupId] && subMenuRefs.current[groupId]) {
        setSubMenuHeight(prevHeights => ({
          ...prevHeights,
          [groupId]: subMenuRefs.current[groupId]?.scrollHeight || 0,
        }))
      }
    })
  }, [openSubmenu])

  const handleSubmenuToggle = (groupId) => {
    setOpenSubmenu(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }

  const renderMenuItems = (group) => {
    const visibleItems = group.items.filter(item => !item.adminOnly || user?.role === 'ADMIN')
    if (visibleItems.length === 0) return null

    const isGroupOpen = openSubmenu[group.id]

    return (
      <li key={group.id}>
        <button
          onClick={() => handleSubmenuToggle(group.id)}
          className={`menu-item group ${
            isGroupOpen ? 'menu-item-active' : 'menu-item-inactive'
          } cursor-pointer ${
            !isExpanded && !isHovered ? 'lg:justify-center' : 'lg:justify-start'
          } w-full`}
        >
          <span
            className={`menu-item-icon-size ${
              isGroupOpen ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
            }`}
          >
            {group.items[0]?.icon}
          </span>
          {(isExpanded || isHovered || isMobileOpen) && (
            <>
              <span className="menu-item-text flex-1 text-left">{group.label}</span>
              <svg
                className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                  isGroupOpen ? 'rotate-180 text-primary' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
        
        {(isExpanded || isHovered || isMobileOpen) && (
          <div
            ref={(el) => {
              subMenuRefs.current[group.id] = el
            }}
            className="overflow-hidden transition-all duration-300"
            style={{
              height: isGroupOpen ? `${subMenuHeight[group.id]}px` : '0px',
            }}
          >
            <ul className="mt-2 space-y-1 ml-9">
              {visibleItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`menu-dropdown-item ${
                      isActive(item.href)
                        ? 'menu-dropdown-item-active'
                        : 'menu-dropdown-item-inactive'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </li>
    )
  }

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r 
        ${
          isExpanded || isMobileOpen
            ? 'w-[290px]'
            : isHovered
            ? 'w-[290px]'
            : 'w-[90px]'
        }
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      style={{
        backgroundColor: 'var(--sidebar-bg, #1c2434)',
        borderColor: 'var(--sidebar-border, rgba(255, 255, 255, 0.08))',
        color: 'var(--sidebar-foreground, #e2e8f0)'
      }}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? 'lg:justify-center' : 'justify-start'
        }`}
      >
        <Link href="/admin">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="h-8 dark:hidden"
                src="/logo-clara.svg?v=20251110"
                alt="INPACTA"
              />
              <img
                className="hidden h-8 dark:block"
                src="/logo-clara.svg?v=20251110"
                alt="INPACTA"
              />
            </>
          ) : (
            <>
              <img
                className="h-8 w-8 dark:hidden"
                src="/favicon.ico"
                alt="INPACTA"
              />
              <img
                className="hidden h-8 w-8 dark:block"
                src="/favicon.ico"
                alt="INPACTA"
              />
            </>
          )}
        </Link>
      </div>
      
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? 'lg:justify-center'
                    : 'justify-start'
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  'Menu'
                ) : (
                  <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
                  </svg>
                )}
              </h2>
              <ul className="flex flex-col gap-4">
                {navGroups.map((group) => renderMenuItems(group))}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default AdminSidebar