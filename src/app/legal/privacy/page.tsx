import type { Metadata } from 'next'
import { LEGAL } from '@/lib/legal'
import { Bullets, LegalFooter, LegalHeader, Section } from '@/components/LegalDocument'

export const metadata: Metadata = {
  title: `Privacy Policy · ${LEGAL.appName}`,
  description: `What ${LEGAL.appName} collects, why, and what you can do about it.`,
}

export default function PrivacyPage() {
  return (
    <article>
      <LegalHeader title="Privacy Policy" />

      <p className="text-[15px] leading-relaxed text-slate-700">
        This explains what {LEGAL.appName} collects, why we collect it, who else sees it, and what
        you can do about it. It covers the app and the trainer web dashboard.
      </p>

      {/*
        Esta lista tiene que coincidir con lo que declara Gym_API/PrivacyInfo.xcprivacy y con las
        etiquetas de privacidad de App Store Connect. Si se recoge un dato nuevo, se cambian los
        tres sitios a la vez o la ficha deja de ser cierta.
      */}
      <Section title="What we collect">
        <Bullets
          items={[
            <><strong>Account details.</strong> Your name, email address, and profile photo if you add one. Sign-in itself is handled by Auth0, so we never see your password.</>,
            <><strong>Profile details you choose to add.</strong> Date of birth, height, phone number, a short bio, and any health conditions you want your trainer to know about.</>,
            <><strong>Body measurements.</strong> The weight and body composition entries you log, and the goals you set. This is health information and we treat it as sensitive.</>,
            <><strong>Messages and attachments.</strong> What you send in chat, including photos. Messaging runs on Stream, which stores the conversation.</>,
            <><strong>Training and nutrition activity.</strong> Sessions you are booked into, attendance, and the plans you follow.</>,
            <><strong>Device identifiers.</strong> A push notification token, so we can tell you when your trainer writes.</>,
            <><strong>Payment records.</strong> If you pay through the app, Stripe processes the card and we keep a record of the transaction. We never see or store full card numbers.</>,
          ]}
        />
        <p>
          We do not track you across other companies’ apps or websites, and we do not use your
          data for advertising.
        </p>
      </Section>

      <Section title="Why we collect it">
        <p>
          To run the service: to show you your sessions, deliver your messages, let your trainer
          see the progress you choose to share with them, send the notifications you asked for,
          keep accounts secure, and meet our legal obligations. That is the whole list.
        </p>
      </Section>

      <Section title="Who else sees it">
        <Bullets
          items={[
            <><strong>Your trainer.</strong> They see your name, your profile photo, the messages you send them, the sessions you attend, and the measurements you log in their workspace. That is the point of the service.</>,
            <><strong>Nobody else using the app.</strong> Other clients of your trainer do not see your measurements, your messages, or your email.</>,
            <><strong>The companies that run parts of the service.</strong> Auth0 for sign-in, Stream for messaging, OneSignal for notifications, Stripe for payments, and our hosting and database providers. They may only use the data to provide their service to us.</>,
            <><strong>Authorities</strong>, when the law requires it, or to protect someone from harm.</>,
          ]}
        />
        <p className="font-medium text-slate-900">
          We do not sell your personal information, and we do not share it for cross-context
          behavioral advertising.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          We keep your data while your account is open. When you delete your account we remove
          your sign-in, your profile details, and your measurement history. Messages you already
          sent stay in the other person’s conversation, and records we are required to keep for
          tax or accounting stay for as long as the law says.
        </p>
      </Section>

      <Section title="Your choices">
        <Bullets
          items={[
            <><strong>Delete your account</strong> from Profile in the app. It takes effect immediately and it cannot be undone.</>,
            <><strong>Correct your details</strong> from Edit profile.</>,
            <><strong>Turn off notifications</strong> in your device settings.</>,
            <><strong>Ask us for a copy</strong> of what we hold about you, or ask us to correct or delete it, by emailing <a className="underline" href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</a>. We answer within 45 days.</>,
          ]}
        />
        <p>
          Depending on where you live in the United States, you may have the right to know what we
          collect, to get a copy, to correct it, to delete it, to opt out of sale or sharing, and
          not to be treated differently for exercising any of those rights. We honor all of them
          for everyone, whatever state you are in. We do not sell or share your data, so there is
          nothing to opt out of.
        </p>
        <p>
          To make a request, email {LEGAL.supportEmail} from the address on your account, or write
          to us at the postal address below. We may ask you to confirm who you are before we act,
          which is how we keep someone else from making the request for you. An authorized agent
          can act for you with written permission.
        </p>
      </Section>

      <Section title="Children">
        <p>
          The service is for people 18 and older. We do not knowingly collect information from
          anyone under 18. If you believe a minor has an account, email us and we will remove it.
        </p>
      </Section>

      <Section title="Security">
        <p>
          Traffic is encrypted in transit. Access to production data is limited to the people who
          need it to run the service. No system is perfect, and we will tell you if a breach
          affects your data, as required by law.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          If we change this policy in a way that matters, we will tell you in the app and update
          the date at the top.
        </p>
      </Section>

      <LegalFooter />
    </article>
  )
}
