import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import CreatePlanClient from './CreatePlanClient';

export default async function CreateNutritionPlanPage() {
  const session = await auth0.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <MainLayout user={session.user}>
      <CreatePlanClient />
    </MainLayout>
  );
} 