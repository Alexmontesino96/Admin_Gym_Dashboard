'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Users,
  Calendar,
  DollarSign,
  Dumbbell,
  Settings,
  Search,
  MessageCircle,
  Home,
  Building,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Building2,
  Bell,
  Settings as SettingsIcon,
  ArrowLeft,
  X,
  Menu,
  Clock,
  Star,
  CalendarCheck,
  Target,
  Tag,
  Plus,
  Apple,
  FileText,
  PlusCircle
} from 'lucide-react';
import GymSelector from './GymSelector';

interface MainLayoutProps {
  children: React.ReactNode;
  user?: {
    name?: string;
    email?: string;
    picture?: string;
  } | null;
}

export default function MainLayout({ children, user }: MainLayoutProps) {
  const [showGymSelector, setShowGymSelector] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);
  const [isNutritionExpanded, setIsNutritionExpanded] = useState(false);
  const pathname = usePathname();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const gymSelectorRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { key: "dashboard", label: "Dashboard", href: "/", icon: Home },
    { key: "usuarios", label: "Usuarios", href: "/usuarios", icon: Users },
    { key: "eventos", label: "Eventos", href: "/eventos", icon: MessageCircle },
    { 
      key: "schedule", 
      label: "Schedule", 
      href: "/schedule", 
      icon: Calendar,
      hasSubmenu: true,
      submenu: [
        { key: "categories", label: "Categorías", href: "/schedule/categories", icon: Tag },
        { key: "classes", label: "Clases", href: "/schedule/classes", icon: Target },
        { key: "sessions", label: "Sesiones", href: "/schedule/sessions", icon: CalendarCheck },
        { key: "hours-template", label: "Plantilla Horarios", href: "/schedule/hours/template", icon: Clock },
        { key: "hours-special", label: "Días Especiales", href: "/schedule/hours/special", icon: Star },
        { key: "hours-calendar", label: "Calendario", href: "/schedule/hours/calendar", icon: CalendarDays },
      ]
    },
    { 
      key: "nutrition", 
      label: "Nutrición", 
      href: "/nutricion", 
      icon: Apple,
      hasSubmenu: true,
      submenu: [
        { key: "nutrition-plans", label: "Ver Planes", href: "/nutricion/planes", icon: FileText },
        { key: "create-plan", label: "Crear Plan", href: "/nutricion/crear", icon: PlusCircle },
      ]
    },
    { key: "gimnasio", label: "Gimnasio", href: "/gimnasio", icon: Building },
    { key: "chat", label: "Chat", href: "/chat", icon: MessageCircle },
    { key: "settings", label: "Configuración", href: "/settings", icon: Settings },
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

  // Auto-expandir schedule si estamos en una ruta de schedule
  useEffect(() => {
    if (pathname?.startsWith('/schedule')) {
      setIsScheduleExpanded(true);
    }
    if (pathname?.startsWith('/nutricion')) {
      setIsNutritionExpanded(true);
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 text-slate-900 flex flex-col font-inter">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/60 border-b border-slate-200 h-16 flex items-center px-6">
        {/* Botón de menú móvil */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors mr-4"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        <h1 className="text-2xl font-semibold tracking-tight text-indigo-600">Gym Admin</h1>
        
        <div className="ml-auto flex gap-4 items-center">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              placeholder="Buscar…"
              className="pl-10 pr-4 py-2 rounded-full bg-slate-100 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-300 transition border-0 outline-none"
            />
          </div>

          {user && (
            <>
              {/* Notificaciones */}
              <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-indigo-100 rounded-full transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Selector de gimnasio */}
              <div className="relative" ref={gymSelectorRef}>
                <button
                  onClick={() => setShowGymSelector(!showGymSelector)}
                  className="flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-full transition-all duration-200 hover:shadow-md"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Building2 className="h-3 w-3 text-white" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-slate-700">Gimnasio</span>
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showGymSelector ? 'rotate-180' : ''}`} />
                </button>
                
                {showGymSelector && (
                  <div className="absolute right-0 top-full mt-2 w-80 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
                      <GymSelector compact={true} />
                    </div>
                  </div>
                )}
              </div>

              {/* Avatar y menú de usuario */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-indigo-100 transition-colors"
                >
                  {user.picture ? (
                    <Image 
                      src={user.picture} 
                      alt="Profile" 
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full ring-2 ring-indigo-500/20 hover:ring-indigo-500/40 transition-all"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </button>

                {/* Dropdown del usuario */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 z-50 animate-in slide-in-from-top-2 duration-200">
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 py-2">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <SettingsIcon className="h-4 w-4" />
                          <span>Configuración</span>
                        </Link>
                        <a
                          href="/auth/logout"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>Cerrar Sesión</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {!user && (
            <a
              href="/auth/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:shadow-md"
            >
              Iniciar Sesión
            </a>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Siempre visible en desktop */}
        <aside className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-white/90 border-r border-slate-200 backdrop-blur-md transition-transform duration-300 ease-in-out flex flex-col shadow-sm`}>
                    <nav className="flex-1 py-8 px-6">
            <ul className="space-y-1 font-medium">
              {menuItems.map((item) => {
                const { key, label, href, icon: Icon, hasSubmenu, submenu } = item;
                const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href));
                
                if (hasSubmenu) {
                  return (
                    <li key={key} className="space-y-1">
                      {/* Item principal con flecha */}
                      <div className="flex items-center">
                        <Link
                          href={href}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition group flex-1 ${
                            isActive 
                              ? "bg-indigo-50 text-indigo-600" 
                              : "hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-600"
                          }`}
                        >
                          <Icon
                            className={`h-5 w-5 ${
                              isActive 
                                ? "text-indigo-600" 
                                : "text-slate-500 group-hover:text-indigo-600"
                            }`}
                          />
                          <span className={isActive ? "text-indigo-600" : "group-hover:text-indigo-600"}>
                            {label}
                          </span>
                        </Link>
                        
                        {/* Botón de expandir/contraer */}
                        <button
                          onClick={() => {
                            if (key === 'schedule') {
                              setIsScheduleExpanded(!isScheduleExpanded);
                            } else if (key === 'nutrition') {
                              setIsNutritionExpanded(!isNutritionExpanded);
                            }
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            isActive 
                              ? "text-indigo-600 hover:bg-indigo-100" 
                              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <ChevronRight 
                            className={`h-4 w-4 transition-transform duration-200 ${
                              (key === 'schedule' && isScheduleExpanded) || (key === 'nutrition' && isNutritionExpanded) ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                      </div>
                      
                      {/* Submenú */}
                      {((key === 'schedule' && isScheduleExpanded) || (key === 'nutrition' && isNutritionExpanded)) && submenu && (
                        <ul className="ml-6 space-y-1 border-l border-slate-200 pl-4">
                          {submenu.map(({ key: subKey, label: subLabel, href: subHref, icon: SubIcon }) => {
                            const isSubActive = pathname === subHref;
                            return (
                              <li key={subKey}>
                                <Link
                                  href={subHref}
                                  onClick={() => setIsSidebarOpen(false)}
                                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition group text-sm ${
                                    isSubActive 
                                      ? "bg-indigo-50 text-indigo-600" 
                                      : "hover:bg-indigo-50/70 text-slate-600 hover:text-indigo-600"
                                  }`}
                                >
                                  <SubIcon
                                    className={`h-4 w-4 ${
                                      isSubActive 
                                        ? "text-indigo-600" 
                                        : "text-slate-400 group-hover:text-indigo-600"
                                    }`}
                                  />
                                  <span className={isSubActive ? "text-indigo-600" : "group-hover:text-indigo-600"}>
                                    {subLabel}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }
                
                // Items normales sin submenú
                return (
                  <li key={key}>
                    <Link
                      href={href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition group ${
                        isActive 
                          ? "bg-indigo-50 text-indigo-600" 
                          : "hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-600"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isActive 
                            ? "text-indigo-600" 
                            : "text-slate-500 group-hover:text-indigo-600"
                        }`}
                      />
                      <span className={isActive ? "text-indigo-600" : "group-hover:text-indigo-600"}>
                        {label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Overlay para móvil */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto p-8 md:p-12 md:ml-0">
          {children}
        </main>
      </div>

      {/* Overlay para cerrar menús */}
      {(showGymSelector || showUserMenu) && (
        <div 
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm"
          onClick={() => {
            setShowGymSelector(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </div>
  );
} 