import { Metadata } from 'next'
import CreateSurveyClient from './CreateSurveyClient'

export const metadata: Metadata = {
  title: 'Crear Encuesta | Dashboard',
  description: 'Crear nueva encuesta',
}

export default function CreateSurveyPage() {
  return <CreateSurveyClient />
}