'use client';

import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { GlassCard } from '@/components/ui/glass-card';
import { useUserWorkouts } from '@/store';
import { getWorkoutTypeColor, getWorkoutTypeLabel } from '@/lib/muscle-mapping';
import type { User, WorkoutType } from '@/types';

interface ProgressChartsProps {
  user: User;
}

export function ProgressCharts({ user }: ProgressChartsProps) {
  const workouts = useUserWorkouts(user);

  // Weekly Progress Data
  const weeklyData = useMemo(() => {
    const last12Weeks = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (11 - i) * 7);
      return {
        week: date.toISOString().split('T')[0],
        weekLabel: `${date.getMonth() + 1}/${date.getDate()}`,
        workouts: 0,
        totalDuration: 0,
        avgRating: 0
      };
    });

    workouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      const weekIndex = last12Weeks.findIndex(week => {
        const weekDate = new Date(week.week);
        const timeDiff = workoutDate.getTime() - weekDate.getTime();
        return timeDiff >= 0 && timeDiff < 7 * 24 * 60 * 60 * 1000;
      });

      if (weekIndex !== -1) {
        last12Weeks[weekIndex].workouts += 1;
        last12Weeks[weekIndex].totalDuration += workout.duration || 0;
        last12Weeks[weekIndex].avgRating += workout.rating || 0;
      }
    });

    return last12Weeks.map(week => ({
      ...week,
      avgRating: week.workouts > 0 ? (week.avgRating / week.workouts).toFixed(1) : 0
    }));
  }, [workouts]);

  // Workout Type Distribution
  const workoutTypeData = useMemo(() => {
    const distribution: Record<WorkoutType, number> = {
      arms: 0,
      push: 0,
      pull: 0,
      legs: 0
    };

    workouts.forEach(workout => {
      distribution[workout.workoutType] += 1;
    });

    return Object.entries(distribution).map(([type, count]) => ({
      name: getWorkoutTypeLabel(type as WorkoutType),
      value: count,
      color: getWorkoutTypeColor(type as WorkoutType)
    }));
  }, [workouts]);

  // Monthly Comparison
  const monthlyData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        workouts: 0,
        hours: 0
      };
    });

    workouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      const monthIndex = last6Months.findIndex(month => {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - (5 - last6Months.indexOf(month)));
        return workoutDate.getMonth() === monthDate.getMonth() && 
               workoutDate.getFullYear() === monthDate.getFullYear();
      });

      if (monthIndex !== -1) {
        last6Months[monthIndex].workouts += 1;
        last6Months[monthIndex].hours += (workout.duration || 0) / 60;
      }
    });

    return last6Months.map(month => ({
      ...month,
      hours: Number(month.hours.toFixed(1))
    }));
  }, [workouts]);

  // Personal Records Progression
  const strengthData = useMemo(() => {
    const exerciseMaxes: Record<string, Array<{ date: string; weight: number }>> = {};
    
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (!exerciseMaxes[exercise.name]) {
          exerciseMaxes[exercise.name] = [];
        }
        
        const maxWeight = Math.max(...exercise.sets.map(set => set.weight || 0));
        if (maxWeight > 0) {
          exerciseMaxes[exercise.name].push({
            date: workout.date,
            weight: maxWeight
          });
        }
      });
    });

    // Get top 3 exercises by frequency
    const topExercises = Object.entries(exerciseMaxes)
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 3);

    // Create timeline data
    const dates = [...new Set(workouts.map(w => w.date))].sort();
    
    return dates.map(date => {
      const dataPoint: any = { date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
      
      topExercises.forEach(([exerciseName, records]) => {
        const recordsUpToDate = records.filter(r => r.date <= date);
        if (recordsUpToDate.length > 0) {
          dataPoint[exerciseName] = Math.max(...recordsUpToDate.map(r => r.weight));
        }
      });
      
      return dataPoint;
    });
  }, [workouts]);

  const strengthExercises = useMemo(() => {
    const exerciseMaxes: Record<string, number> = {};
    
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const maxWeight = Math.max(...exercise.sets.map(set => set.weight || 0));
        if (maxWeight > 0) {
          exerciseMaxes[exercise.name] = Math.max(exerciseMaxes[exercise.name] || 0, maxWeight);
        }
      });
    });

    return Object.entries(exerciseMaxes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  }, [workouts]);

  if (workouts.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <h3 className="text-lg font-medium mb-2">No workout data available</h3>
          <p className="text-sm">Add some workouts to see your progress charts!</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Progress */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Weekly Workout Frequency
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="weekLabel" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.9)',
                  border: '1px solid rgba(75, 85, 99, 0.3)',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="workouts" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Type Distribution */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Workout Type Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workoutTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {workoutTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Monthly Hours */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Training Hours
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="hours" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Strength Progression */}
      {strengthExercises.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Strength Progression (Top Exercises)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strengthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Legend />
                {strengthExercises.map(([exerciseName], index) => (
                  <Line
                    key={exerciseName}
                    type="monotone"
                    dataKey={exerciseName}
                    stroke={['#3B82F6', '#10B981', '#F59E0B'][index]}
                    strokeWidth={2}
                    dot={{ strokeWidth: 2, r: 3 }}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
