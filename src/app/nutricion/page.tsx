import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { Suspense } from 'react';
import { Activity, TrendingUp, Users, Apple, Target, ArrowRight } from 'lucide-react';

// Lazy load de componentes pesados
import dynamic from 'next/dynamic';

// Componente de loading para skeleton
const NutritionSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header skeleton */}
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
    </div>
    
    {/* Stats skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200">
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
    
    {/* Content skeleton */}
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

export default async function NutritionPage() {
  const session = await auth0.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <MainLayout user={session.user}>
      <div className="space-y-8">
        {/* Header - carga inmediata */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center">
                <span className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                  🥗
                </span>
                Gestión Nutricional
              </h1>
              <p className="text-lg text-slate-600">Sistema integral de planes y seguimiento nutricional</p>
            </div>
            <div className="flex space-x-4">
              <a
                href="/nutricion/crear"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <span className="text-lg">➕</span>
                <span className="font-semibold">Crear Plan</span>
              </a>
              <a
                href="/nutricion/planes"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <Apple size={20} />
                <span className="font-semibold">Ver Planes</span>
              </a>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas - datos estáticos para carga inmediata */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Apple className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">156</h3>
            <p className="text-sm text-slate-600">Planes Activos</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">+8%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">2,341</h3>
            <p className="text-sm text-slate-600">Usuarios Siguiendo</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">+15%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">89%</h3>
            <p className="text-sm text-slate-600">Tasa de Adherencia</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">+22%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">4.8</h3>
            <p className="text-sm text-slate-600">Satisfacción Promedio</p>
          </div>
        </div>

        {/* Contenido con lazy loading */}
        <Suspense fallback={<NutritionSkeleton />}>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Activity size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Planes Recientes</h2>
                    <p className="text-slate-600">Últimos planes creados y actualizados</p>
                  </div>
                </div>
                <a
                  href="/nutricion/planes"
                  className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1 transition-colors"
                >
                  <span>Ver todos</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {[
                { 
                  id: 1, 
                  title: "Plan de Volumen - Avanzado", 
                  days: 2, 
                  calories: 3200, 
                  followers: 45,
                  goal: "bulk",
                  status: "active"
                },
                { 
                  id: 2, 
                  title: "Definición Muscular - Intermedio", 
                  days: 5, 
                  calories: 1800, 
                  followers: 32,
                  goal: "cut",
                  status: "active"
                },
                { 
                  id: 3, 
                  title: "Mantenimiento - Principiante", 
                  days: 7, 
                  calories: 2200, 
                  followers: 28,
                  goal: "maintain",
                  status: "draft"
                }
              ].map((plan) => (
                <div key={plan.id} className="p-6 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        plan.goal === 'bulk' ? 'bg-blue-100' :
                        plan.goal === 'cut' ? 'bg-red-100' :
                        'bg-green-100'
                      }`}>
                        <Apple size={24} className={
                          plan.goal === 'bulk' ? 'text-blue-600' :
                          plan.goal === 'cut' ? 'text-red-600' :
                          'text-green-600'
                        } />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-green-600 transition-colors">
                          {plan.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                          <span>Creado hace {plan.days} días</span>
                          <span>•</span>
                          <span>{plan.calories} kcal</span>
                          <span>•</span>
                          <span>{plan.followers} seguidores</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.status === 'active' ? 'Activo' : 'Borrador'}
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Suspense>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/nutricion/crear"
            className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <ArrowRight className="text-white/70 group-hover:text-white transition-colors" size={20} />
            </div>
            <h3 className="text-xl font-bold mb-2">Crear Plan Nuevo</h3>
            <p className="text-white/80">Diseña un plan nutricional personalizado</p>
          </a>

          <a
            href="/nutricion/planes"
            className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Apple className="text-white" size={24} />
              </div>
              <ArrowRight className="text-white/70 group-hover:text-white transition-colors" size={20} />
            </div>
            <h3 className="text-xl font-bold mb-2">Gestionar Planes</h3>
            <p className="text-white/80">Edita y administra planes existentes</p>
          </a>

          <a
            href="/nutricion/reportes"
            className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <TrendingUp className="text-white" size={24} />
              </div>
              <ArrowRight className="text-white/70 group-hover:text-white transition-colors" size={20} />
            </div>
            <h3 className="text-xl font-bold mb-2">Ver Reportes</h3>
            <p className="text-white/80">Analiza métricas y rendimiento</p>
          </a>
        </div>
      </div>
    </MainLayout>
  );
} 