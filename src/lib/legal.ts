/**
 * Datos que aparecen en las páginas legales y de soporte.
 *
 * ⚠️ ANTES DE PUBLICAR EN LA APP STORE: rellenar los cuatro valores de abajo. Aparecen tal cual
 * en los términos, en la política de privacidad y en la ficha de App Store Connect, y un aviso
 * legal con marcadores de posición es peor que no tenerlo.
 *
 * ⚠️ Los textos de /legal/terms y /legal/privacy son un BORRADOR redactado para cubrir lo que
 * exige la revisión de la App Store (guías 1.2 y 5.1.1) y las leyes de privacidad estatales de
 * Estados Unidos. No sustituyen la revisión de un abogado antes de publicar.
 */
export const LEGAL = {
  /** Razón social que firma los términos. */
  companyName: 'TODO_COMPANY_LEGAL_NAME',
  /** Nombre comercial de la app, el que ve el usuario. */
  appName: 'GymFlow',
  /** Estado cuyas leyes rigen el contrato y donde se resuelven las disputas. */
  governingState: 'TODO_STATE',
  /** Dirección postal. Varias leyes estatales exigen una vía de contacto no electrónica. */
  postalAddress: 'TODO_POSTAL_ADDRESS',
  /** Buzón de soporte y de solicitudes de privacidad. */
  supportEmail: 'support@gymapi.app',
  /** Fecha de entrada en vigor. Se actualiza al cambiar el texto, junto con termsVersion. */
  effectiveDate: 'TODO_EFFECTIVE_DATE',
  /**
   * Versión de las condiciones. Tiene que coincidir con la que el backend guarda en
   * `user.terms_version` al aceptar, o no se podrá saber quién aceptó qué.
   */
  termsVersion: '1.0',
} as const
