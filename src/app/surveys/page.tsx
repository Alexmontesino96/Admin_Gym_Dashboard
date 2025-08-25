import { Metadata } from 'next'
import SurveysClient from './SurveysClient'

export const metadata: Metadata = {
  title: 'Encuestas | Dashboard',
  description: 'Gestión de encuestas y formularios',
}

export default function SurveysPage() {
  return <SurveysClient />
}