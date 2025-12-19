import { auth0 } from "@/lib/auth0";
import { redirect } from 'next/navigation';
import LandingPage from '@/components/LandingPage';

export default async function Home() {
  const session = await auth0.getSession();

  // Si ya está autenticado, redirigir al dashboard
  // El middleware manejará la redirección a /select-gym si no hay gimnasio seleccionado
  if (session) {
    redirect('/dashboard');
  }

  // Si no hay sesión, mostrar landing page
  return <LandingPage />;
}
