/**
 * Envoltorio de las páginas legales y de soporte.
 *
 * Son públicas a propósito: la App Store las abre sin sesión, desde la ficha y desde la propia
 * app, así que no pueden vivir detrás del login. Están registradas en `publicRoutes` de
 * src/middleware.ts.
 */
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <main className="mx-auto max-w-3xl px-6 py-16">{children}</main>
    </div>
  )
}
