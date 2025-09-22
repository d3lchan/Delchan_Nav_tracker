'use client';

import WorkoutHistory from '@/components/workout-history';

export default function NavWorkoutHistoryPage() {
  // This would integrate with your actual data store
  // For now, we'll create a placeholder that shows the structure
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <WorkoutHistory
        user="Nav"
        workouts={[]} // This would come from your store/context
      />
    </div>
  );
}
