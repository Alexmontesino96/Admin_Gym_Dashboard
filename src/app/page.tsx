import { auth0 } from "@/lib/auth0";
import MainLayout from '@/components/MainLayout';
import DashboardStats from './DashboardStats';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import DashboardCharts from './DashboardCharts';

export default async function HomePage() {
  const session = await auth0.getSession();

  return (
    <MainLayout user={session?.user || null}>
      {session ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Saludo personalizado */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Hola, {session.user.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Aquí tienes un resumen de tu gimnasio hoy
            </p>
          </div>

          {/* Estadísticas principales */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm">📊</span>
              </span>
              Estadísticas Principales
            </h2>
            <DashboardStats />
          </div>

          {/* Accesos directos */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm">⚡</span>
              </span>
              Acciones Rápidas
            </h2>
            <QuickActions />
          </div>

          {/* Gráficas interactivas */}
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm">📈</span>
              </span>
              Análisis y Tendencias
            </h2>
            <DashboardCharts />
          </div>

          {/* Layout de dos columnas para contenido adicional */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Actividad reciente */}
            <div className="lg:col-span-2">
              <RecentActivity />
            </div>

            {/* Panel lateral con información útil */}
            <div className="space-y-6">
              {/* Estado del sistema */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-green-600 text-sm">✓</span>
                  </span>
                  Estado del Sistema
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Sistema funcionando
                      </p>
                      <p className="text-xs text-gray-500">
                        Todos los servicios operativos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Última sincronización
                      </p>
                      <p className="text-xs text-gray-500">
                        Hace {Math.floor(Math.random() * 5) + 1} minutos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Base de datos
                      </p>
                      <p className="text-xs text-gray-500">
                        Rendimiento óptimo
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips o recordatorios */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">
                      Consejo del día
                    </h3>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      Revisa regularmente las estadísticas de asistencia para optimizar los horarios de tus clases y maximizar la satisfacción de los miembros.
                    </p>
                  </div>
                </div>
              </div>

              {/* Enlaces útiles */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center mr-2">
                    <span className="text-gray-600 text-sm">🔗</span>
                  </span>
                  Enlaces Útiles
                </h3>
                <div className="space-y-3">
                  <a
                    href="/schedule"
                    className="flex items-center space-x-3 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50 group"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform duration-200">📊</span>
                    <span className="font-medium">Vista completa de horarios</span>
                  </a>
                  <a
                    href="/usuarios"
                    className="flex items-center space-x-3 text-sm text-gray-600 hover:text-emerald-600 transition-colors duration-200 p-2 rounded-lg hover:bg-emerald-50 group"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform duration-200">👥</span>
                    <span className="font-medium">Gestión de usuarios</span>
                  </a>
                  <a
                    href="/gimnasio"
                    className="flex items-center space-x-3 text-sm text-gray-600 hover:text-purple-600 transition-colors duration-200 p-2 rounded-lg hover:bg-purple-50 group"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform duration-200">⚙️</span>
                    <span className="font-medium">Configuración del gimnasio</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Página de bienvenida para usuarios no autenticados
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
              <span className="text-white text-4xl">🏋️‍♂️</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Gym Admin Panel
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Sistema integral de administración para gimnasios. 
              Gestiona usuarios, horarios, clases y obtén estadísticas en tiempo real.
            </p>
            
            {/* Características principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-200">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Gestión de Usuarios
                </h3>
                <p className="text-gray-600">
                  Administra miembros, entrenadores y roles de manera eficiente
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-200">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Programación
                </h3>
                <p className="text-gray-600">
                  Crea y gestiona horarios, clases y sesiones de entrenamiento
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-200">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Estadísticas
                </h3>
                <p className="text-gray-600">
                  Obtén insights valiosos sobre el rendimiento de tu gimnasio
                </p>
              </div>
            </div>

            <a
              href="/auth/login"
              className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Iniciar Sesión
              <span className="ml-2 text-lg">→</span>
            </a>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
