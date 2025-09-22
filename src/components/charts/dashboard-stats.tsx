'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target, 
  Zap, 
  Award,
  Activity,
  BarChart3
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useUserWorkouts, useUserPersonalRecords } from '@/store';
import { getWorkoutTypeLabel } from '@/lib/muscle-mapping';
import type { User } from '@/types';

interface DashboardStatsProps {
  user: User;
}

export function DashboardStats({ user }: DashboardStatsProps) {
  const workouts = useUserWorkouts(user);
  const personalRecords = useUserPersonalRecords(user);

  const stats = useMemo(() => {
    if (workouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalHours: 0,
        avgDuration: 0,
        avgRating: 0,
        thisWeekWorkouts: 0,
        thisMonthWorkouts: 0,
        longestStreak: 0,
        currentStreak: 0,
        favoriteWorkoutType: null,
        totalVolume: 0,
        personalRecords: 0
      };
    }

    // Basic stats
    const totalWorkouts = workouts.length;
    const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
    const avgDuration = Math.round(totalMinutes / totalWorkouts);
    const avgRating = Number((workouts.reduce((sum, w) => sum + (w.rating || 0), 0) / totalWorkouts).toFixed(1));

    // Time-based stats
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const thisWeekWorkouts = workouts.filter(w => new Date(w.date) >= weekAgo).length;
    const thisMonthWorkouts = workouts.filter(w => new Date(w.date) >= monthAgo).length;

    // Workout streak calculation
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const workoutDates = [...new Set(sortedWorkouts.map(w => w.date))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    for (let i = 0; i < workoutDates.length; i++) {
      const currentDate = new Date(workoutDates[i]);
      const expectedDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      if (Math.abs(currentDate.getTime() - expectedDate.getTime()) < 24 * 60 * 60 * 1000) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
        break;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Favorite workout type
    const workoutTypeCounts = workouts.reduce((acc, w) => {
      acc[w.workoutType] = (acc[w.workoutType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteWorkoutType = Object.entries(workoutTypeCounts)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];

    // Total volume (sets × reps × weight)
    const totalVolume = workouts.reduce((total, workout) => {
      return total + workout.exercises.reduce((exerciseTotal, exercise) => {
        return exerciseTotal + exercise.sets.reduce((setTotal, set) => {
          return setTotal + (set.reps * (set.weight || 0));
        }, 0);
      }, 0);
    }, 0);

    return {
      totalWorkouts,
      totalHours,
      avgDuration,
      avgRating,
      thisWeekWorkouts,
      thisMonthWorkouts,
      longestStreak,
      currentStreak,
      favoriteWorkoutType,
      totalVolume: Math.round(totalVolume),
      personalRecords: personalRecords.length
    };
  }, [workouts, personalRecords]);

  const statCards = [
    {
      icon: TrendingUp,
      label: 'Total Workouts',
      value: stats.totalWorkouts,
      color: 'blue',
      suffix: ''
    },
    {
      icon: Clock,
      label: 'Total Hours',
      value: stats.totalHours,
      color: 'green',
      suffix: 'h'
    },
    {
      icon: Calendar,
      label: 'This Week',
      value: stats.thisWeekWorkouts,
      color: 'purple',
      suffix: ''
    },
    {
      icon: Target,
      label: 'This Month',
      value: stats.thisMonthWorkouts,
      color: 'orange',
      suffix: ''
    },
    {
      icon: Zap,
      label: 'Avg Duration',
      value: stats.avgDuration,
      color: 'yellow',
      suffix: 'min'
    },
    {
      icon: Award,
      label: 'Avg Rating',
      value: stats.avgRating,
      color: 'pink',
      suffix: '/10'
    },
    {
      icon: Activity,
      label: 'Current Streak',
      value: stats.currentStreak,
      color: 'red',
      suffix: ' days'
    },
    {
      icon: BarChart3,
      label: 'Total Volume',
      value: stats.totalVolume > 1000 ? `${(stats.totalVolume / 1000).toFixed(1)}k` : stats.totalVolume,
      color: 'indigo',
      suffix: ' lbs'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500/20 text-blue-600',
      green: 'bg-green-500/20 text-green-600',
      purple: 'bg-purple-500/20 text-purple-600',
      orange: 'bg-orange-500/20 text-orange-600',
      yellow: 'bg-yellow-500/20 text-yellow-600',
      pink: 'bg-pink-500/20 text-pink-600',
      red: 'bg-red-500/20 text-red-600',
      indigo: 'bg-indigo-500/20 text-indigo-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <stat.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {stat.value}{stat.suffix}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Training Insights
            </h3>
            <div className="space-y-3">
              {stats.favoriteWorkoutType && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Favorite Workout:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getWorkoutTypeLabel(stats.favoriteWorkoutType as any)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Longest Streak:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stats.longestStreak} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Personal Records:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {stats.personalRecords}
                </span>
              </div>
              {stats.totalWorkouts > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Weekly Average:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(stats.thisWeekWorkouts).toFixed(1)} workouts
                  </span>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Progress Summary
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Goal</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats.thisWeekWorkouts}/4
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((stats.thisWeekWorkouts / 4) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Goal</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats.thisMonthWorkouts}/16
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((stats.thisMonthWorkouts / 16) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {stats.avgRating > 0 && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Quality Score</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats.avgRating}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(stats.avgRating / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
