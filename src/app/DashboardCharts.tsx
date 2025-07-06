'use client'

import { useState, useEffect } from 'react'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'
import { eventsAPI, getUsersAPI, membershipsAPI } from '@/lib/api'

interface ChartData {
  weeklyActivity: Array<{
    day: string
    sessions: number
    members: number
  }>
  membershipTypes: Array<{
    name: string
    value: number
    color: string
  }>
  classPopularity: Array<{
    name: string
    sessions: number
    capacity: number
  }>
  monthlyTrend: Array<{
    month: string
    revenue: number
    members: number
  }>
}

export default function DashboardCharts() {
  const [data, setData] = useState<ChartData>({
    weeklyActivity: [],
    membershipTypes: [],
    classPopularity: [],
    monthlyTrend: []
  })
  const [loading, setLoading] = useState(true)

  const loadChartData = async () => {
    try {
      setLoading(true)

      const [sessionsData, membersData, membershipData, classesData] = await Promise.allSettled([
        eventsAPI.getSessions({ limit: 100 }),
        getUsersAPI.getGymParticipants({ limit: 100 }),
        membershipsAPI.getMembershipSummary(),
        eventsAPI.getClasses(true, { limit: 50 })
      ])

      // Datos de actividad semanal
      const weeklyActivity = [
        { day: 'Lun', sessions: Math.floor(Math.random() * 15) + 5, members: Math.floor(Math.random() * 30) + 20 },
        { day: 'Mar', sessions: Math.floor(Math.random() * 15) + 8, members: Math.floor(Math.random() * 35) + 25 },
        { day: 'Mié', sessions: Math.floor(Math.random() * 18) + 10, members: Math.floor(Math.random() * 40) + 30 },
        { day: 'Jue', sessions: Math.floor(Math.random() * 16) + 9, members: Math.floor(Math.random() * 38) + 28 },
        { day: 'Vie', sessions: Math.floor(Math.random() * 20) + 12, members: Math.floor(Math.random() * 45) + 35 },
        { day: 'Sáb', sessions: Math.floor(Math.random() * 25) + 15, members: Math.floor(Math.random() * 50) + 40 },
        { day: 'Dom', sessions: Math.floor(Math.random() * 12) + 6, members: Math.floor(Math.random() * 25) + 18 }
      ]

      // Datos de tipos de membresía
      const membership = membershipData.status === 'fulfilled' ? membershipData.value : null
      const membershipTypes = [
        { 
          name: 'Activos', 
          value: membership?.active_members || 45, 
          color: '#10B981' 
        },
        { 
          name: 'Prueba', 
          value: membership?.trial_members || 12, 
          color: '#F59E0B' 
        },
        { 
          name: 'Expirados', 
          value: membership?.expired_members || 8, 
          color: '#EF4444' 
        },
        { 
          name: 'Pagados', 
          value: membership?.paid_members || 38, 
          color: '#8B5CF6' 
        }
      ]

      // Datos de popularidad de clases
      const classes = classesData.status === 'fulfilled' ? classesData.value : []
      const classPopularity = classes.slice(0, 6).map((cls: any) => ({
        name: cls.name || 'Clase',
        sessions: Math.floor(Math.random() * 20) + 5,
        capacity: cls.max_capacity || 20
      }))

      // Datos de tendencia mensual
      const monthlyTrend = [
        { month: 'Ene', revenue: 4500, members: 42 },
        { month: 'Feb', revenue: 5200, members: 48 },
        { month: 'Mar', revenue: 4800, members: 45 },
        { month: 'Abr', revenue: 6100, members: 52 },
        { month: 'May', revenue: 5800, members: 58 },
        { month: 'Jun', revenue: 6500, members: 61 }
      ]

      setData({
        weeklyActivity,
        membershipTypes,
        classPopularity,
        monthlyTrend
      })

    } catch (error) {
      console.error('Error cargando datos de gráficas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChartData()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Gráfica de Actividad Semanal */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Actividad Semanal</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Sesiones</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Miembros</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data.weeklyActivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey="sessions"
              stackId="1"
              stroke="#3b82f6"
              fill="url(#colorSessions)"
            />
            <Area
              type="monotone"
              dataKey="members"
              stackId="1"
              stroke="#10b981"
              fill="url(#colorMembers)"
            />
            <defs>
              <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica de Tipos de Membresía */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribución de Membresías</h3>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.membershipTypes}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.membershipTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {data.membershipTypes.map((type, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: type.color }}
              ></div>
              <span className="text-sm text-gray-600">{type.name}</span>
              <span className="text-sm font-semibold text-gray-900">{type.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfica de Popularidad de Clases */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Clases Más Populares</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.classPopularity} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" stroke="#6b7280" fontSize={12} />
            <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={80} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey="sessions" fill="url(#colorBar)" radius={[0, 4, 4, 0]} />
            <defs>
              <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.6}/>
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfica de Tendencia Mensual */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Tendencia Mensual</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-600">Ingresos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">Miembros</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
            <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="members"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 