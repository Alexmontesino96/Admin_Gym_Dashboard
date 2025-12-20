import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth0 } from '@/lib/auth0';
import MainLayout from '@/components/MainLayout';
import FeaturesClient from './FeaturesClient';

export const metadata: Metadata = {
  title: 'Más Características | Gym Admin',
  description:
    'Descubre todas las funcionalidades disponibles para potenciar tu gimnasio. Desde nutrición con IA hasta historias 24h. Más de 12,500 gimnasios confían en nosotros.',
  keywords:
    'gimnasio, software, módulos, características, nutrición, IA, tracking, gestión',
  openGraph: {
    title: 'Potencia tu gimnasio con nuevas funcionalidades',
    description: 'Módulos premium usados por más de 12,500 gimnasios',
  },
};

export default async function FeaturesPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <MainLayout user={session.user}>
      <div className="space-y-10">
        <FeaturesClient />
      </div>
    </MainLayout>
  );
}
