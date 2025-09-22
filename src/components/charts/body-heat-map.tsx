'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/glass-card';
import { useUserWorkouts } from '@/store';
import { getAllMuscleGroups, getMuscleGroupCategory } from '@/lib/muscle-mapping';
import type { User, MuscleGroup } from '@/types';

interface BodyHeatMapProps {
  user: User;
  timeframe?: 'week' | 'month' | 'quarter' | 'all';
}

// Time range options
const timeRangeOptions = [
  { value: 'week', label: 'This Week', days: 7 },
  { value: 'month', label: 'This Month', days: 30 },
  { value: 'quarter', label: 'Last 3 Months', days: 90 },
  { value: 'all', label: 'All Time', days: 365 }
] as const;

// Muscle group color intensity based on activity level
function getIntensityColor(intensity: number): string {
  if (intensity === 0) return 'rgba(107, 114, 128, 0.2)'; // gray for unused
  if (intensity < 0.3) return 'rgba(34, 197, 94, 0.3)'; // light green
  if (intensity < 0.6) return 'rgba(34, 197, 94, 0.6)'; // medium green
  if (intensity < 0.8) return 'rgba(249, 115, 22, 0.7)'; // orange
  return 'rgba(239, 68, 68, 0.8)'; // red for high intensity
}

function getTimeframeDays(timeframe: string): number {
  switch (timeframe) {
    case 'week': return 7;
    case 'month': return 30;
    case 'quarter': return 90;
    default: return 365;
  }
}

export function BodyHeatMap({ user, timeframe: initialTimeframe = 'month' }: BodyHeatMapProps) {
  const workouts = useUserWorkouts(user);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'all'>(initialTimeframe);

  // Calculate muscle group activity for current and previous periods
  const { muscleActivity, previousPeriodActivity, totalWorkouts } = useMemo(() => {
    const currentPeriodDays = getTimeframeDays(selectedTimeframe);
    const currentCutoffDate = new Date();
    currentCutoffDate.setDate(currentCutoffDate.getDate() - currentPeriodDays);
    
    const previousCutoffDate = new Date();
    previousCutoffDate.setDate(previousCutoffDate.getDate() - (currentPeriodDays * 2));

    const currentWorkouts = workouts.filter(w => new Date(w.date) >= currentCutoffDate);
    const previousWorkouts = workouts.filter(w => {
      const date = new Date(w.date);
      return date >= previousCutoffDate && date < currentCutoffDate;
    });

    // Helper function to calculate activity for a set of workouts
    const calculateActivity = (workoutSet: typeof workouts) => {
      const activityCount: Record<string, number> = {};
      const categories = ['chest', 'back', 'arms', 'shoulders', 'legs', 'core'];
      categories.forEach(cat => {
        activityCount[cat] = 0;
      });

      workoutSet.forEach(workout => {
        workout.exercises.forEach(exercise => {
          exercise.muscleGroups.forEach(muscle => {
            const category = getMuscleGroupCategory(muscle);
            activityCount[category] = (activityCount[category] || 0) + exercise.sets.length;
          });
        });
      });

      // Normalize to 0-1 scale
      const maxActivity = Math.max(...Object.values(activityCount));
      const normalized: Record<string, number> = {};
      
      Object.entries(activityCount).forEach(([muscle, count]) => {
        normalized[muscle] = maxActivity > 0 ? count / maxActivity : 0;
      });

      return normalized;
    };

    return {
      muscleActivity: calculateActivity(currentWorkouts),
      previousPeriodActivity: calculateActivity(previousWorkouts),
      totalWorkouts: currentWorkouts.length
    };
  }, [workouts, selectedTimeframe]);

  // Get top and bottom muscle groups with trend data
  const muscleStats = useMemo(() => {
    const sorted = Object.entries(muscleActivity)
      .map(([muscle, currentIntensity]) => {
        const previousIntensity = previousPeriodActivity[muscle] || 0;
        const trend = currentIntensity - previousIntensity;
        return {
          muscle,
          currentIntensity,
          previousIntensity,
          trend,
          trendPercent: previousIntensity > 0 ? ((trend / previousIntensity) * 100) : (currentIntensity > 0 ? 100 : 0)
        };
      })
      .sort((a, b) => b.currentIntensity - a.currentIntensity);
    
    return {
      mostWorked: sorted.slice(0, 3),
      leastWorked: sorted.slice(-3).reverse()
    };
  }, [muscleActivity, previousPeriodActivity]);

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Muscle Group Activity Heatmap
          </h3>
          
          {/* Time Range Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 sm:mr-2">
              Time Range:
            </span>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 overflow-x-auto">
              {timeRangeOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTimeframe(option.value)}
                  className={`flex-shrink-0 px-2 sm:px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                    selectedTimeframe === option.value
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.value === 'week' ? 'Week' : option.value === 'month' ? 'Month' : option.value === 'quarter' ? '3M' : 'All'}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Period Info */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-medium">
                Showing activity for: {timeRangeOptions.find(opt => opt.value === selectedTimeframe)?.label}
              </span>
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                ({timeRangeOptions.find(opt => opt.value === selectedTimeframe)?.days} days)
              </span>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-medium">{totalWorkouts}</span> 
              <span className="ml-1">workouts tracked</span>
            </div>
          </div>
        </div>

        {/* Body Diagram */}
        <div className="flex justify-center mb-8">
          <svg 
            width="400" 
            height="500" 
            viewBox="0 0 400 500" 
            className="max-w-full h-auto"
          >
            {/* Head */}
            <circle
              cx="200"
              cy="50"
              r="25"
              fill="rgba(107, 114, 128, 0.2)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            
            {/* Torso */}
            <rect
              x="160"
              y="75"
              width="80"
              height="120"
              rx="20"
              fill={getIntensityColor(muscleActivity['chest'] || 0)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            
            {/* Arms */}
            <rect
              x="120"
              y="85"
              width="35"
              height="80"
              rx="15"
              fill={getIntensityColor(muscleActivity['arms'] || 0)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            <rect
              x="245"
              y="85"
              width="35"
              height="80"
              rx="15"
              fill={getIntensityColor(muscleActivity['arms'] || 0)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            
            {/* Shoulders */}
            <circle
              cx="140"
              cy="95"
              r="18"
              fill={getIntensityColor(muscleActivity['shoulders'] || 0)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            <circle
              cx="260"
              cy="95"
              r="18"
              fill={getIntensityColor(muscleActivity['shoulders'] || 0)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            
            {/* Core */}
            <rect
              x="170"
              y="195"
              width="60"
              height="60"
              rx="10"
              fill={getIntensityColor(muscleActivity['core'] || 0)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            
            {/* Back (shown as darker overlay on torso) */}
            <rect
              x="165"
              y="80"
              width="70"
              height="110"
              rx="15"
              fill={getIntensityColor(muscleActivity['back'] || 0)}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              opacity="0.5"
            />
            
            {/* Legs */}
            <rect
              x="170"
              y="255"
              width="25"
              height="120"
              rx="12"
              fill={getIntensityColor(muscleActivity['legs'] || 0)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            <rect
              x="205"
              y="255"
              width="25"
              height="120"
              rx="12"
              fill={getIntensityColor(muscleActivity['legs'] || 0)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            
            {/* Calves */}
            <rect
              x="175"
              y="375"
              width="15"
              height="60"
              rx="8"
              fill={getIntensityColor(muscleActivity['legs'] || 0)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            <rect
              x="210"
              y="375"
              width="15"
              height="60"
              rx="8"
              fill={getIntensityColor(muscleActivity['legs'] || 0)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            
            {/* Glutes */}
            <ellipse
              cx="200"
              cy="245"
              rx="30"
              ry="15"
              fill={getIntensityColor(muscleActivity['legs'] || 0)}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />

            {/* Labels */}
            <text x="200" y="25" textAnchor="middle" className="fill-white text-xs font-medium">
              {user.toUpperCase()}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(107, 114, 128, 0.2)' }}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Unused</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(34, 197, 94, 0.4)' }}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Light</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(249, 115, 22, 0.7)' }}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Moderate</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)' }}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Heavy</span>
          </div>
        </div>
      </GlassCard>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            Most Worked Muscle Groups
          </h4>
          <div className="space-y-3">
            {muscleStats.mostWorked.map((muscleData, index) => (
              <div key={muscleData.muscle} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {muscleData.muscle.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-2 rounded-full"
                    style={{ backgroundColor: getIntensityColor(muscleData.currentIntensity) }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
                    {(muscleData.currentIntensity * 100).toFixed(0)}%
                  </span>
                  {/* Trend indicator */}
                  {muscleData.trend !== 0 && (
                    <span className={`text-xs ${muscleData.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {muscleData.trend > 0 ? '↑' : '↓'} {Math.abs(muscleData.trendPercent).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            Least Worked Muscle Groups
          </h4>
          <div className="space-y-3">
            {muscleStats.leastWorked.map((muscleData, index) => (
              <div key={muscleData.muscle} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">
                    !
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {muscleData.muscle.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-2 rounded-full"
                    style={{ backgroundColor: getIntensityColor(muscleData.currentIntensity) }}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">
                    {(muscleData.currentIntensity * 100).toFixed(0)}%
                  </span>
                  {/* Trend indicator */}
                  {muscleData.trend !== 0 && (
                    <span className={`text-xs ${muscleData.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {muscleData.trend > 0 ? '↑' : '↓'} {Math.abs(muscleData.trendPercent).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
