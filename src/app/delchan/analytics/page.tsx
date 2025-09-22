'use client';

import AnalyticsDashboard from '@/components/analytics-dashboard';

export default function DelchanAnalyticsPage() {
  // This would integrate with your actual data store
  // For now, we'll create a placeholder that shows the structure
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <AnalyticsDashboard
        user="Delchan"
        workouts={[]} // This would come from your store/context
      />
    </div>
  );
}
