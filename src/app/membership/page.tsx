import { redirect } from 'next/navigation';

export default async function MembershipPage() {
  // Redirigir directamente al dashboard de membresías
  redirect('/membership/dashboard');
} 