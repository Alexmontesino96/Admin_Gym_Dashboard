import type { Metadata } from 'next'
import { LEGAL } from '@/lib/legal'
import { Bullets, LegalFooter, LegalHeader, Section } from '@/components/LegalDocument'

export const metadata: Metadata = {
  title: `Support · ${LEGAL.appName}`,
  description: `How to get help with ${LEGAL.appName}, report content, or delete your account.`,
}

/**
 * Página de soporte.
 *
 * Es la URL que se declara como Support URL en App Store Connect y a la que apunta la fila de
 * Ayuda del perfil (Config/SupportConfig.swift). La guía 1.5 exige que exista y funcione, y la
 * 1.2 exige un medio publicado de contacto para una app con contenido de otras personas.
 */
export default function SupportPage() {
  return (
    <article>
      <LegalHeader title="Support" />

      <p className="text-[15px] leading-relaxed text-slate-700">
        Write to{' '}
        <a className="font-medium text-slate-900 underline" href={`mailto:${LEGAL.supportEmail}`}>
          {LEGAL.supportEmail}
        </a>{' '}
        and a person will answer, normally within two business days. Tell us your account email and
        what you were doing when the problem happened, and we will get there faster.
      </p>

      <Section title="Report content or someone’s behavior">
        <p>
          In a conversation, tap the three dots in the top right to report it or block the person.
          To report a single message, press and hold it and choose Report. Reports go to a person
          who reviews them, and we remove content and accounts that break our{' '}
          <a className="underline" href="/legal/terms">Terms of Service</a>.
        </p>
        <p>
          If someone is in immediate danger, contact your local emergency services first, then
          email us.
        </p>
      </Section>

      <Section title="Delete your account">
        <p>
          Open Profile, scroll to the bottom, and tap Delete account. It removes your sign-in, your
          profile details and your measurement history, and it cannot be undone. If you run a
          workspace, it is archived and your clients keep access to their own history.
        </p>
      </Section>

      <Section title="Common questions">
        <Bullets
          items={[
            <><strong>I did not get an invitation code.</strong> Ask your trainer to send you one from their dashboard. Codes expire after 14 days and work once.</>,
            <><strong>I am not getting notifications.</strong> Check that notifications are enabled for the app in your device settings.</>,
            <><strong>My trainer cannot see my check-in.</strong> Make sure you logged it inside their workspace, and tell us if it still does not show up.</>,
            <><strong>I want a copy of my data.</strong> Email us from the address on your account and we will send it within 45 days.</>,
          ]}
        />
      </Section>

      <LegalFooter />
    </article>
  )
}
