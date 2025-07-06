'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavigationTabs() {
  const pathname = usePathname()

  const tabs = [
    {href:'/schedule/horarios/plantilla', label:'Plantilla', description:'Horarios base semanales'},
    {href:'/schedule/horarios/excepciones', label:'Días especiales', description:'Feriados y eventos'},
    {href:'/schedule/horarios/semana', label:'Vista semanal', description:'Navegación por semanas'},
  ]

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const isActive = pathname === tab.href
            
            return (
              <Link 
                key={tab.href} 
                href={tab.href}
                className={`group py-4 px-1 border-b-2 transition-colors duration-200 ${
                  isActive 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <span className={`text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-blue-600' 
                      : 'text-gray-600 group-hover:text-gray-900'
                  }`}>
                    {tab.label}
                  </span>
                  <span className={`text-xs transition-colors mt-1 hidden sm:block ${
                    isActive 
                      ? 'text-blue-500' 
                      : 'text-gray-400 group-hover:text-gray-600'
                  }`}>
                    {tab.description}
                  </span>
                </div>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
} 