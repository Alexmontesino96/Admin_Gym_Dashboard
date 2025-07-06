import EditPlanDaysClient from './EditPlanDaysClient';

export default function EditPlanDaysPage({ params }: { params: { planId: string } }) {
  return <EditPlanDaysClient planId={parseInt(params.planId)} />;
} 