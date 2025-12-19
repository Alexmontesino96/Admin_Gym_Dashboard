'use client'

import { useWorkspace } from './useWorkspace'

export function useTerminology() {
  const { workspace, isTrainer, isGym, loading } = useWorkspace()

  // Valores por defecto seguros
  const defaultTerminology = {
    userSingular: 'miembro',
    userPlural: 'miembros',
    workspace: 'gimnasio',
    relationship: 'membresía'
  }

  // Usar terminología del workspace o valores por defecto
  const terminology = workspace?.terminology
  const userSingular = terminology?.member || defaultTerminology.userSingular
  const userPlural = terminology?.members || defaultTerminology.userPlural
  const workspaceTerm = terminology?.gym || defaultTerminology.workspace
  const relationship = terminology?.membership || defaultTerminology.relationship

  // Capitalizar de forma segura
  const capitalizeFirst = (str: string) => {
    if (!str || typeof str !== 'string') return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  return {
    // Usuarios
    userSingular,
    userPlural,
    addUser: `Agregar ${userSingular}`,
    userList: `Lista de ${userPlural}`,
    totalUsers: `Total de ${userPlural}`,
    activeUsers: `${capitalizeFirst(userPlural)} activos`,
    inviteUser: `Invitar ${userSingular}`,
    removeUser: `Dar de baja ${userSingular}`,

    // Workspace
    workspace: workspaceTerm,
    workspaceName: workspace?.workspace?.name || 'Gimnasio',
    myWorkspace: `Mi ${workspaceTerm}`,
    workspaceInfo: `Información del ${workspaceTerm}`,

    // Relaciones
    relationship,
    activeRelationship: `${relationship} activa`,
    expiredRelationship: `${relationship} vencida`,
    relationshipStatus: `Estado de ${relationship}`,

    // Estado
    isTrainer,
    isGym,
    loading
  }
}
