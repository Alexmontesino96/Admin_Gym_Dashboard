import Link from 'next/link'
import { LEGAL } from '@/lib/legal'

/** Cabecera común: título, fecha de entrada en vigor y vuelta al resto de documentos. */
export function LegalHeader({ title }: { title: string }) {
  return (
    <header className="mb-10 border-b border-slate-200 pb-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {LEGAL.appName}
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-3 text-sm text-slate-500">
        Effective {LEGAL.effectiveDate} · Version {LEGAL.termsVersion}
      </p>
    </header>
  )
}

export function LegalFooter() {
  return (
    <footer className="mt-14 border-t border-slate-200 pt-6 text-sm text-slate-500">
      <p>
        Questions? Email{' '}
        <a className="text-slate-900 underline" href={`mailto:${LEGAL.supportEmail}`}>
          {LEGAL.supportEmail}
        </a>
        , or write to {LEGAL.companyName}, {LEGAL.postalAddress}.
      </p>
      <nav className="mt-4 flex gap-4">
        <Link className="underline hover:text-slate-900" href="/legal/terms">Terms</Link>
        <Link className="underline hover:text-slate-900" href="/legal/privacy">Privacy</Link>
        <Link className="underline hover:text-slate-900" href="/support">Support</Link>
      </nav>
    </footer>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-700">{children}</div>
    </section>
  )
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="ml-5 list-disc space-y-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}
