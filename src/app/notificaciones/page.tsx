import { Metadata } from 'next';
import NotificationsClient from './NotificationsClient';

export const metadata: Metadata = {
  title: 'Notificaciones Push | Dashboard',
  description: 'Envía notificaciones push a tus miembros usando OneSignal',
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
