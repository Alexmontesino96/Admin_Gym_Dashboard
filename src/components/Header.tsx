'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  ChevronDownIcon, 
  BuildingOfficeIcon, 
  UserGroupIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  CogIcon,
  BellIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import GymSelector from './GymSelector';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backHref?: string;
  user?: {
    name?: string;
    email?: string;
    picture?: string;
  } | null;
  icon?: string;
  showBreadcrumb?: boolean;
}

export default function Header({ 
  title, 
  subtitle, 
  showBackButton = false, 
  backHref = '/',
  user,
  icon = '🏋️',
  showBreadcrumb = true
}: HeaderProps) {
  const [showGymSelector, setShowGymSelector] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const gymSelectorRef = useRef<HTMLDivElement>(null);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: HomeIcon,
      current: pathname === '/'
    },
    {
      name: 'Usuarios',
      href: '/usuarios',
      icon: UserGroupIcon,
      current: pathname === '/usuarios'
    },
    {
      name: 'Eventos',
      href: '/eventos',
      icon: CalendarDaysIcon,
      current: pathname === '/eventos'
    },
    {
      name: 'Gimnasio',
      href: '/gimnasio',
      icon: BuildingOfficeIcon,
      current: pathname === '/gimnasio'
    },
    {
      name: 'Schedule',
      href: '/schedule',
      icon: CalendarDaysIcon,
      current: pathname === '/schedule'
    }
  ];

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (gymSelectorRef.current && !gymSelectorRef.current.contains(event.target as Node)) {
        setShowGymSelector(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);



  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header unificado */}
        <div className="flex items-center justify-between h-16">
          {/* Lado izquierdo: Logo + Navegación */}
          <div className="flex items-center space-x-8">
            {/* Botón de menú móvil */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              {showMobileMenu ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white text-xl">{icon}</span>
              </div>
            </Link>

            {/* Navegación principal - Desktop */}
            {user && (
              <nav className="hidden lg:flex space-x-6">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        item.current
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Lado derecho: Acciones */}
          <div className="flex items-center space-x-4">

            {user && (
              <>
                {/* Notificaciones */}
                <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Selector de gimnasio */}
                <div className="relative" ref={gymSelectorRef}>
                  <button
                    onClick={() => setShowGymSelector(!showGymSelector)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-md"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
                      <BuildingOfficeIcon className="h-3 w-3 text-white" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">Gimnasio</span>
                    <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showGymSelector ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showGymSelector && (
                    <div className="absolute right-0 top-full mt-2 w-80 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                        <GymSelector compact={true} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Menú de usuario */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {user.picture ? (
                      <Image 
                        src={user.picture} 
                        alt="Profile" 
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-all"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown del usuario */}
                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 z-50 animate-in slide-in-from-top-2 duration-200">
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <CogIcon className="h-4 w-4" />
                            <span>Configuración</span>
                          </Link>
                          <a
                            href="/logout"
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <ArrowLeftIcon className="h-4 w-4" />
                            <span>Cerrar Sesión</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón de retroceso */}
                {showBackButton && (
                  <Link
                    href={backHref}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">Volver</span>
                  </Link>
                )}
              </>
            )}

            {!user && (
              <a
                href="/auth/login"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md"
              >
                Iniciar Sesión
              </a>
            )}
          </div>
        </div>

        {/* Navegación móvil */}
        {user && showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      item.current
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Overlay para cerrar menús */}
      {(showGymSelector || showUserMenu || showMobileMenu) && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={() => {
            setShowGymSelector(false);
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </header>
  );
} 