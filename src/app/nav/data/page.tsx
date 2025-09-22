'use client';

import DataManagementPage from '@/components/data-management-page';

export default function NavDataPage() {
  const handleWorkoutsImported = (workouts: any[]) => {
    // This would integrate with your store to add the workouts
    console.log('Imported workouts for Nav:', workouts);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <DataManagementPage
        user="Nav"
        workouts={[]} // This would come from your store/context
        onWorkoutsImported={handleWorkoutsImported}
      />
    </div>
  );
}
