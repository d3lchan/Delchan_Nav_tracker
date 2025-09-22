'use client';

import React, { useState } from 'react';
import { WorkoutSession, User } from '@/types';
import StrengthProgression from '@/components/charts/strength-progression';
import VolumeTrends from '@/components/charts/volume-trends';
import BodySchematicDashboard from '@/components/body-schematic/body-schematic-dashboard';

interface AnalyticsDashboardProps {
  user: User;
  workouts: WorkoutSession[];
}

type AnalyticsTab = 'overview' | 'strength' | 'volume' | 'body' | 'performance';
type TimeRange = 'week' | 'month' | '3months' | '6months' | 'year';

export default function AnalyticsDashboard({ user, workouts }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('3months');
  const [selectedWorkouts, setSelectedWorkouts] = useState<WorkoutSession[]>(workouts);

  const userWorkouts = workouts.filter(w => w.user === user);

  // Calculate overview stats
  const overviewStats = {
    totalWorkouts: userWorkouts.length,
    totalVolume: userWorkouts.reduce((sum, workout) =>
      sum + workout.exercises.reduce((exSum, exercise) =>
        exSum + exercise.sets.reduce((setSum, set) => setSum + (set.reps * set.weight), 0), 0), 0),
    averageRating: userWorkouts.filter(w => w.rating).length > 0
      ? userWorkouts.filter(w => w.rating).reduce((sum, w) => sum + (w.rating || 0), 0) / userWorkouts.filter(w => w.rating).length
      : 0,
    totalDuration: userWorkouts.reduce((sum, w) => sum + w.duration, 0),
    uniqueExercises: new Set(userWorkouts.flatMap(w => w.exercises.map(e => e.name))).size,
    workoutTypeDistribution: userWorkouts.reduce((acc, workout) => {
      acc[workout.workoutType] = (acc[workout.workoutType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'strength', label: 'Strength', icon: '💪' },
    { id: 'volume', label: 'Volume', icon: '📈' },
    { id: 'body', label: 'Body Map', icon: '🏃' },
    { id: 'performance', label: 'Performance', icon: '⚡' }
  ];

  const handleBodySchematicWorkoutFilter = (filteredWorkouts: WorkoutSession[]) => {
    setSelectedWorkouts(filteredWorkouts);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Comprehensive insights for {user}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{overviewStats.totalWorkouts}</div>
          <div className="text-sm text-gray-600">Total Workouts</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(overviewStats.totalVolume / 1000)}K
          </div>
          <div className="text-sm text-gray-600">Total Volume (lbs)</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{overviewStats.uniqueExercises}</div>
          <div className="text-sm text-gray-600">Unique Exercises</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {Math.round(overviewStats.totalDuration / 60)}
          </div>
          <div className="text-sm text-gray-600">Hours Trained</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {overviewStats.averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AnalyticsTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Time Range Selector (for applicable tabs) */}
        {['volume', 'performance'].includes(activeTab) && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Time Range:</label>
              <div className="flex gap-2">
                {(['week', 'month', '3months', '6months', 'year'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-sm rounded ${
                      timeRange === range
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {range === '3months' ? '3 months' : 
                     range === '6months' ? '6 months' : 
                     range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Workout Type Distribution */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Workout Type Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(overviewStats.workoutTypeDistribution).map(([type, count]) => {
                  const percentage = (count / overviewStats.totalWorkouts) * 100;
                  const colors = {
                    push: 'bg-red-100 text-red-800',
                    pull: 'bg-blue-100 text-blue-800',
                    legs: 'bg-green-100 text-green-800',
                    arms: 'bg-purple-100 text-purple-800'
                  };
                  return (
                    <div key={type} className="text-center">
                      <div className={`py-3 px-4 rounded-lg ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-sm capitalize">{type}</div>
                        <div className="text-xs">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {userWorkouts
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{new Date(workout.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-600 capitalize">{workout.workoutType} • {workout.exercises.length} exercises</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{workout.duration} min</div>
                        {workout.rating && (
                          <div className="text-xs text-yellow-600">★ {workout.rating}/10</div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'strength' && (
          <StrengthProgression user={user} workouts={userWorkouts} />
        )}

        {activeTab === 'volume' && (
          <VolumeTrends user={user} workouts={userWorkouts} timeRange={timeRange} />
        )}

        {activeTab === 'body' && (
          <BodySchematicDashboard 
            workouts={userWorkouts} 
            onWorkoutSelect={handleBodySchematicWorkoutFilter}
          />
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {(overviewStats.totalWorkouts / Math.max(1, Math.ceil(
                      (new Date().getTime() - new Date(userWorkouts[0]?.date || new Date()).getTime()) / (1000 * 60 * 60 * 24 * 7)
                    ))).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Workouts per Week</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {userWorkouts.length > 0 ? Math.round(overviewStats.totalVolume / overviewStats.totalWorkouts) : 0}
                  </div>
                  <div className="text-sm text-gray-600">Avg Volume per Workout</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {userWorkouts.length > 0 ? Math.round(overviewStats.totalDuration / overviewStats.totalWorkouts) : 0}
                  </div>
                  <div className="text-sm text-gray-600">Avg Duration (min)</div>
                </div>
              </div>
            </div>

            {/* Consistency Calendar would go here */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4">Training Consistency</h3>
              <p className="text-gray-600">
                Consistency tracking coming soon. You've completed {overviewStats.totalWorkouts} workouts
                with an average rating of {overviewStats.averageRating.toFixed(1)}/10.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filtered Workouts Info */}
      {activeTab === 'body' && selectedWorkouts.length !== userWorkouts.length && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            Showing data for {selectedWorkouts.length} filtered workouts. 
            <button 
              onClick={() => setSelectedWorkouts(userWorkouts)}
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              Show all workouts
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
