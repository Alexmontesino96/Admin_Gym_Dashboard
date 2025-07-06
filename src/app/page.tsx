import { auth0 } from "@/lib/auth0";
import { redirect } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import DashboardStats from './DashboardStats';
import DashboardCharts from './DashboardCharts';

export default async function Home() {
  const session = await auth0.getSession();

  // Si no hay sesión, redirigir a login
  if (!session) {
    redirect('/login');
  }

  return (
    <MainLayout user={session.user}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Resumen general de tu gimnasio</p>
        </div>
        
        <div className="space-y-8">
          <DashboardStats />
          <DashboardCharts />
        </div>
      </div>
    </MainLayout>
  );
}
