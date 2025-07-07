import EditPlanDaysClient from './EditPlanDaysClient';

export default async function EditPlanDaysPage({ 
  params 
}: { 
  params: Promise<{ planId: string }> 
}) {
  const { planId } = await params;
  return <EditPlanDaysClient planId={parseInt(planId)} />;
} 