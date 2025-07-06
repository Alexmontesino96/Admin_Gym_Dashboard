import { auth0 } from "@/lib/auth0";
import MainLayout from '@/components/MainLayout';
import { 
  Apple, 
  FileText, 
  PlusCircle, 
  Target, 
  Users, 
  Calendar, 
  TrendingUp, 
  Award, 
  Activity,
  Zap,
  Heart,
  Star,
  ArrowRight,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';

export default async function NutritionPage() {
  const session = await auth0.getSession();
  return (
    <MainLayout user={session?.user || null}>
      <div className="space-y-8">
        {/* Header Principal */}
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 rounded-2xl p-8 text-white relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Apple size={36} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Centro de Nutrición</h1>
                  <p className="text-green-100 text-lg">Gestiona planes nutricionales y ayuda a tus miembros a alcanzar sus objetivos</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-white/90 text-sm">Última actualización</p>
                  <p className="text-white font-semibold">Hace 2 minutos</p>
                </div>
              </div>
            </div>
            
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FileText size={20} className="text-white" />
                  </div>
                  <TrendingUp size={16} className="text-green-200" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">12</p>
                <p className="text-green-100 text-sm">Planes Activos</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Users size={20} className="text-white" />
                  </div>
                  <Activity size={16} className="text-green-200" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">245</p>
                <p className="text-green-100 text-sm">Usuarios Activos</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Target size={20} className="text-white" />
                  </div>
                  <Award size={16} className="text-green-200" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">87%</p>
                <p className="text-green-100 text-sm">Objetivos Alcanzados</p>
              </div>
              
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Star size={20} className="text-white" />
                  </div>
                  <Heart size={16} className="text-green-200" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">4.8</p>
                <p className="text-green-100 text-sm">Satisfacción Media</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ver Planes */}
          <a
            href="/nutricion/planes"
            className="group bg-white rounded-2xl p-8 border border-slate-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-green-100 group-hover:bg-green-200 rounded-2xl transition-colors duration-300">
                  <FileText size={32} className="text-green-600" />
                </div>
                <ArrowRight size={24} className="text-slate-400 group-hover:text-green-600 transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-green-600 transition-colors duration-300 mb-3">
                Gestionar Planes
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                Explora, edita y gestiona todos los planes nutricionales disponibles para tus miembros
              </p>
              <div className="flex items-center space-x-4 text-sm text-slate-500">
                <div className="flex items-center space-x-1">
                  <BarChart3 size={16} />
                  <span>12 planes activos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>Actualizado hoy</span>
                </div>
              </div>
            </div>
          </a>

          {/* Crear Plan */}
          <a
            href="/nutricion/crear"
            className="group bg-white rounded-2xl p-8 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="p-4 bg-blue-100 group-hover:bg-blue-200 rounded-2xl transition-colors duration-300">
                  <PlusCircle size={32} className="text-blue-600" />
                </div>
                <ArrowRight size={24} className="text-slate-400 group-hover:text-blue-600 transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-300 mb-3">
                Crear Nuevo Plan
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                Diseña un plan nutricional personalizado con macronutrientes específicos para diferentes objetivos
              </p>
              <div className="flex items-center space-x-4 text-sm text-slate-500">
                <div className="flex items-center space-x-1">
                  <Zap size={16} />
                  <span>Plantillas disponibles</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle size={16} />
                  <span>Cálculo automático</span>
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Sección de Planes Recientes */}
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
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      plan.status === 'active' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {plan.status === 'active' ? 'Activo' : 'Borrador'}
                    </span>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección de Consejos Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target size={20} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900">Definir Objetivos</h3>
            </div>
            <p className="text-blue-800 text-sm leading-relaxed">
              Establece metas claras y alcanzables para cada plan nutricional según el perfil del usuario.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 size={20} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900">Seguimiento</h3>
            </div>
            <p className="text-green-800 text-sm leading-relaxed">
              Monitorea el progreso de tus miembros y ajusta los planes según sus resultados.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Heart size={20} className="text-purple-600" />
              </div>
              <h3 className="font-semibold text-purple-900">Personalización</h3>
            </div>
            <p className="text-purple-800 text-sm leading-relaxed">
              Adapta cada plan a las necesidades específicas, restricciones y preferencias del usuario.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 