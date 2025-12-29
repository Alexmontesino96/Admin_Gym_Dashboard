import PlanAnalyticsClient from './PlanAnalyticsClient';

interface PageProps {
  params: Promise<{
    planId: string;
  }>;
}

export default async function PlanAnalyticsPage({ params }: PageProps) {
  const { planId } = await params;

  return <PlanAnalyticsClient planId={parseInt(planId, 10)} />;
}
