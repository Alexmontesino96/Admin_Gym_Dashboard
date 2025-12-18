import { auth0 } from "@/lib/auth0";
import { redirect } from 'next/navigation';
import LandingPage from '@/components/LandingPage';

export default async function Home() {
  const session = await auth0.getSession();

  // Si ya está autenticado, redirigir al selector de gimnasio
  if (session) {
    redirect('/select-gym');
  }

  // Si no hay sesión, mostrar landing page
  return <LandingPage />;
}
