'use client';

import SmartWorkoutPage from '@/components/smart-workout-page';
import type { WorkoutType } from '@/types';

interface PageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function AddWorkoutPage({ searchParams }: PageProps) {
  const typeParam = searchParams?.type;
  const type = typeof typeParam === 'string' ? typeParam : null;
  
  const isValidWorkoutType = (type: string | null): type is WorkoutType => {
    return type !== null && ['arms', 'push', 'pull', 'legs'].includes(type);
  };
  
  const defaultWorkoutType: WorkoutType = isValidWorkoutType(type) ? type : 'arms';

  return <SmartWorkoutPage user="Delchan" defaultWorkoutType={defaultWorkoutType} />;
}