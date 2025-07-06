import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import NutritionPlansClient from './NutritionPlansClient';

export default async function NutritionPlansPage() {
  const session = await auth0.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <MainLayout user={session.user}>
      <NutritionPlansClient />
    </MainLayout>
  );
} 