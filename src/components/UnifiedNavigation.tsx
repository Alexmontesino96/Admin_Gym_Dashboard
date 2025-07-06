'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface NavigationItem {
  id: string
  label: string
  icon: string
  description: string
  href?: string
  children?: {
    label: string
    href: string
    icon: string
    description?: string
  }[]
}

const navigationItems: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Resumen',
    icon: '🏠',
    description: 'Dashboard general',
    href: '/schedule'
  },
  {
    id: 'management',
    label: 'Gestión',
    icon: '📚',
    description: 'Configuración base',
    children: [
      { 
        label: 'Categorías', 
        href: '/schedule/categories', 
        icon: '🏷️',
        description: 'Tipos de clases'
      },
      { 
        label: 'Clases', 
        href: '/schedule/classes', 
        icon: '🎯',
        description: 'Plantillas de actividades'
      }
    ]
  },
  {
    id: 'scheduling',
    label: 'Programación',
    icon: '📋',
    description: 'Sesiones y eventos',
    children: [
      { 
        label: 'Vista Semanal', 
        href: '/schedule/sessions', 
        icon: '📅',
        description: 'Sesiones programadas'
      },
      { 
        label: 'Nueva Sesión', 
        href: '/schedule/sessions/create', 
        icon: '➕',
        description: 'Programar actividad'
      }
    ]
  },
  {
    id: 'hours',
    label: 'Horarios',
    icon: '🕒',
    description: 'Gestión de horarios',
    children: [
      { 
        label: 'Plantilla Base', 
        href: '/schedule/hours/template', 
        icon: '📝',
        description: 'Horarios semanales'
      },
      { 
        label: 'Días Especiales', 
        href: '/schedule/hours/special', 
        icon: '⭐',
        description: 'Feriados y eventos'
      },
      { 
        label: 'Vista Calendario', 
        href: '/schedule/hours/calendar', 
        icon: '📆',
        description: 'Horarios efectivos'
      }
    ]
  }
]

export default function UnifiedNavigation() {
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (itemId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setOpenDropdown(itemId)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null)
    }, 150)
  }

  const isActiveItem = (item: NavigationItem): boolean => {
    if (!pathname) return false
    if (item.href && pathname === item.href) return true
    if (item.children) {
      return item.children.some(child => pathname.startsWith(child.href))
    }
    return false
  }

  const isActiveChild = (href: string): boolean => {
    if (!pathname) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-0">
          {navigationItems.map(item => {
            const isActive = isActiveItem(item)
            const hasChildren = item.children && item.children.length > 0
            const isOpen = openDropdown === item.id

            return (
              <div
                key={item.id}
                className="relative"
                onMouseEnter={() => hasChildren && handleMouseEnter(item.id)}
                onMouseLeave={handleMouseLeave}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      isActive
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    <span className="hidden sm:block">{item.label}</span>
                    <span className="sm:hidden">{item.icon}</span>
                  </Link>
                ) : (
                  <button
                    className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      isActive
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    <span className="hidden sm:block">{item.label}</span>
                    <span className="sm:hidden">{item.icon}</span>
                    {hasChildren && (
                      <ChevronDownIcon 
                        className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`} 
                      />
                    )}
                  </button>
                )}

                {/* Dropdown Menu */}
                {hasChildren && isOpen && (
                  <div className="absolute top-full left-0 mt-0 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{item.icon}</span>
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{item.label}</h3>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                        </div>
                      </div>
                      {item.children?.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-start px-4 py-3 hover:bg-gray-50 transition-colors ${
                            isActiveChild(child.href) ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                          }`}
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="text-base mr-3 mt-0.5">{child.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              isActiveChild(child.href) ? 'text-blue-600' : 'text-gray-900'
                            }`}>
                              {child.label}
                            </p>
                            {child.description && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {child.description}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
} 