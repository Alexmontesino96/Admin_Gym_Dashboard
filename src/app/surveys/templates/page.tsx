import { Metadata } from 'next'
import TemplatesClient from './TemplatesClient'

export const metadata: Metadata = {
  title: 'Plantillas de Encuestas | Dashboard',
  description: 'Gestión de plantillas de encuestas',
}

export default function TemplatesPage() {
  return <TemplatesClient />
}