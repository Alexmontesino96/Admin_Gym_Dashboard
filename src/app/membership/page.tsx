import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import MainLayout from '@/components/MainLayout';
import { Suspense } from 'react';
import { CreditCard, Users, DollarSign, TrendingUp, Activity, ArrowRight, Plus, FileText } from 'lucide-react';
import Link from 'next/link';

// Skeleton para el contenido lazy
const MembershipSkeleton = () => (
  <div className="space-y-6 animate-pulse">
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

export default async function MembershipPage() {
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
                <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                  💳
                </span>
                Gestión de Membresías
              </h1>
              <p className="text-lg text-slate-600">Sistema completo de planes y suscripciones</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/membership/planes"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <Plus size={20} />
                <span className="font-semibold">Gestionar Planes</span>
              </Link>
              <Link
                href="/membership/dashboard"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                <Activity size={20} />
                <span className="font-semibold">Dashboard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas - datos estáticos para carga inmediata */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">+5%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">12</h3>
            <p className="text-sm text-slate-600">Planes Activos</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">847</h3>
            <p className="text-sm text-slate-600">Miembros Activos</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">+18%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">€12,450</h3>
            <p className="text-sm text-slate-600">Ingresos Mensuales</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">+7%</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">95%</h3>
            <p className="text-sm text-slate-600">Tasa de Retención</p>
          </div>
        </div>

        {/* Contenido con lazy loading */}
        <Suspense fallback={<MembershipSkeleton />}>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-white p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Activity size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Planes Populares</h2>
                    <p className="text-slate-600">Los planes más demandados por los usuarios</p>
                  </div>
                </div>
                <Link
                  href="/membership/planes"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1 transition-colors"
                >
                  <span>Ver todos</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            
            <div className="divide-y divide-slate-100">
              {[
                { 
                  id: 1, 
                  name: "Premium Mensual", 
                  price: "29.99", 
                  users: 234,
                  growth: "+12%",
                  type: "monthly"
                },
                { 
                  id: 2, 
                  name: "Básico Mensual", 
                  price: "19.99", 
                  users: 156,
                  growth: "+8%", 
                  type: "monthly"
                },
                { 
                  id: 3, 
                  name: "Premium Anual", 
                  price: "299.99", 
                  users: 89,
                  growth: "+25%",
                  type: "yearly"
                }
              ].map((plan) => (
                <div key={plan.id} className="p-6 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        plan.type === 'yearly' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        <CreditCard size={24} className={
                          plan.type === 'yearly' ? 'text-purple-600' : 'text-blue-600'
                        } />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {plan.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                          <span>€{plan.price} / {plan.type === 'yearly' ? 'año' : 'mes'}</span>
                          <span>•</span>
                          <span>{plan.users} usuarios</span>
                          <span>•</span>
                          <span className="text-green-600">{plan.growth}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activo
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
          <Link
            href="/membership/dashboard"
            className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Activity className="text-white" size={24} />
              </div>
              <ArrowRight className="text-white/70 group-hover:text-white transition-colors" size={20} />
            </div>
            <h3 className="text-xl font-bold mb-2">Ver Dashboard</h3>
            <p className="text-white/80">Analiza métricas y estadísticas detalladas</p>
          </Link>

          <Link
            href="/membership/planes"
            className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <CreditCard className="text-white" size={24} />
              </div>
              <ArrowRight className="text-white/70 group-hover:text-white transition-colors" size={20} />
            </div>
            <h3 className="text-xl font-bold mb-2">Gestionar Planes</h3>
            <p className="text-white/80">Crea, edita y administra planes de membresía</p>
          </Link>

          <Link
            href="/membership/reportes"
            className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileText className="text-white" size={24} />
              </div>
              <ArrowRight className="text-white/70 group-hover:text-white transition-colors" size={20} />
            </div>
            <h3 className="text-xl font-bold mb-2">Ver Reportes</h3>
            <p className="text-white/80">Reportes financieros y de suscripciones</p>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
} 