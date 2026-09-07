import type { Metadata } from 'next'
import { LEGAL } from '@/lib/legal'
import { Bullets, LegalFooter, LegalHeader, Section } from '@/components/LegalDocument'

export const metadata: Metadata = {
  title: `Terms of Service · ${LEGAL.appName}`,
  description: `The agreement between you and ${LEGAL.companyName} for using ${LEGAL.appName}.`,
}

export default function TermsPage() {
  return (
    <article>
      <LegalHeader title="Terms of Service" />

      <p className="text-[15px] leading-relaxed text-slate-700">
        These terms are the agreement between you and {LEGAL.companyName} for {LEGAL.appName}, the
        app and website that connect personal trainers with the people they coach. By creating an
        account or using the service you accept them. If you do not accept them, do not use the
        service.
      </p>

      <Section title="Who can use the service">
        <p>
          You must be 18 or older to create an account. One person, one account. You are
          responsible for what happens under your account, so keep your sign-in details to
          yourself and tell us if you think someone else has them.
        </p>
      </Section>

      <Section title="What the service is, and what it is not">
        <p>
          {LEGAL.appName} is a tool for scheduling sessions, exchanging messages, following
          nutrition and training plans, and keeping track of your own measurements. The training
          and nutrition content is created by the trainer you work with, not by us.
        </p>
        <p className="font-medium text-slate-900">
          Nothing in the service is medical advice. Talk to a qualified professional before you
          start a training or nutrition plan, and stop and seek help if something hurts. You take
          part in physical activity at your own risk.
        </p>
      </Section>

      <Section title="Content you post, and content others post">
        <p>
          You keep ownership of the messages, photos and notes you upload. You give us permission
          to store and display them so the service can work, which means showing them to the
          people you send them to. We do not sell your content and we do not use it to advertise
          to anyone.
        </p>
        <p>
          Other people write things too. We do not review everything before it appears, so we
          cannot promise that everything you see is accurate or appropriate.
        </p>
      </Section>

      {/*
        Cláusula de tolerancia cero. Es un requisito explícito de la guía 1.2 de la App Store para
        cualquier app con contenido generado por usuarios, y el EULA estándar de Apple no la trae.
        No quitar sin sustituirla por una equivalente.
      */}
      <Section title="Zero tolerance for objectionable content and abusive behavior">
        <p>
          There is no tolerance for objectionable content or for people who abuse others. Do not
          post, send, or share anything that:
        </p>
        <Bullets
          items={[
            'harasses, bullies, threatens, or intimidates another person',
            'is hateful toward people because of race, ethnicity, national origin, religion, disability, sex, gender identity, sexual orientation, or age',
            'is sexually explicit, or shows nudity in a sexual context',
            'depicts or encourages violence, self-harm, or eating disorders',
            'involves anyone under 18 in a sexual or exploitative way',
            'is illegal, promotes illegal activity, or offers regulated substances',
            'is spam, a scam, or an attempt to get someone else’s account or payment details',
            'impersonates another person or organization',
            'you do not have the right to share',
          ]}
        />
        <p>
          Anyone can report content or block another person from inside the app. Reports go to a
          person who reviews them, and we act on what breaks these rules, which can mean removing
          content and removing accounts. Accounts used to abuse others are removed without
          warning and without a refund.
        </p>
        <p>
          If you see something that puts someone in immediate danger, contact your local emergency
          services first, then tell us at{' '}
          <a className="underline" href={`mailto:${LEGAL.supportEmail}`}>{LEGAL.supportEmail}</a>.
        </p>
      </Section>

      <Section title="Your trainer, and payments">
        <p>
          The relationship between you and your trainer, including what you pay them and what they
          agree to deliver, is between you and them. We are not a party to it. Trainers pay us
          separately for the software.
        </p>
        <p>
          Where a payment runs through the service, it is processed by Stripe under Stripe’s own
          terms. We never see or store your full card details.
        </p>
      </Section>

      <Section title="Ending your account">
        <p>
          You can delete your account at any time from Profile in the app. Deleting removes your
          sign-in, your profile details and your measurement history, and it cannot be undone.
          Messages you already sent stay in the other person’s conversation, because those records
          are theirs too.
        </p>
        <p>
          We can suspend or end an account that breaks these terms, that we are required to remove
          by law, or that has been inactive for a long time.
        </p>
      </Section>

      <Section title="The service is provided as it is">
        <p>
          We work to keep the service running, but we do not promise it will always be available,
          error free, or that it will produce any particular result. To the fullest extent the law
          allows, {LEGAL.companyName} is not liable for indirect or consequential losses, and our
          total liability is limited to what you paid us in the twelve months before the claim.
        </p>
        <p>
          Some states do not allow these limits, so parts of this section may not apply to you.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          We may update these terms. When we make a material change we will tell you in the app
          and update the version number at the top, and continuing to use the service after that
          means you accept the new version.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by the laws of the State of {LEGAL.governingState}, without
          regard to its conflict of law rules, and any dispute will be resolved in the courts
          located there.
        </p>
      </Section>

      <LegalFooter />
    </article>
  )
}
