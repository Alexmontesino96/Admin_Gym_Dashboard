import DayMealsClient from './DayMealsClient';

export default async function DayMealsPage({ 
  params 
}: { 
  params: Promise<{ planId: string; dayId: string }> 
}) {
  const { planId, dayId } = await params;
  return <DayMealsClient planId={parseInt(planId)} dayId={parseInt(dayId)} />;
} 