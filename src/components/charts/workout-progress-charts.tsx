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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
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

  // Prepare data for workout frequency chart
  const workoutFrequencyData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayWorkouts = workouts.filter(w => w.date.startsWith(date));
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        workouts: dayWorkouts.length,
        duration: dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)
      };
    });
  }, [workouts]);

  // Prepare data for workout type distribution
  const workoutTypeData = useMemo(() => {
    const counts = workouts.reduce((acc, workout) => {
      acc[workout.workoutType] = (acc[workout.workoutType] || 0) + 1;
      return acc;
    }, {} as Record<WorkoutType, number>);

    return Object.entries(counts).map(([type, count]) => ({
      name: getWorkoutTypeLabel(type as WorkoutType),
      value: count,
      color: getWorkoutTypeColor(type as WorkoutType)
    }));
  }, [workouts]);

  // Prepare data for volume progression (using weight × reps)
  const volumeProgressionData = useMemo(() => {
    const weeklyData: Record<string, { volume: number, workouts: number }> = {};
    
    workouts.forEach(workout => {
      const date = new Date(workout.date);
      const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      const workoutVolume = workout.exercises.reduce((sum, ex) => 
        sum + ex.sets.reduce((setSum, set) => setSum + (set.reps * (set.weight || 0)), 0), 0
      );
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { volume: 0, workouts: 0 };
      }
      weeklyData[weekKey].volume += workoutVolume;
      weeklyData[weekKey].workouts += 1;
    });

    return Object.entries(weeklyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 weeks
      .map(([weekKey, data]) => ({
        week: new Date(weekKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: Math.round(data.volume),
        avgVolume: Math.round(data.volume / data.workouts),
        workouts: data.workouts
      }));
  }, [workouts]);

  // Prepare data for personal records progression
  const strengthProgressionData = useMemo(() => {
    const exerciseData: Record<string, Array<{ date: string, weight: number }>> = {};
    
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (!exerciseData[exercise.name]) {
          exerciseData[exercise.name] = [];
        }
        
        const maxWeight = Math.max(...exercise.sets.map(set => set.weight || 0));
        if (maxWeight > 0) {
          exerciseData[exercise.name].push({
            date: workout.date,
            weight: maxWeight
          });
        }
      });
    });

    // Get top 3 exercises by data points
    const topExercises = Object.entries(exerciseData)
      .sort(([,a], [,b]) => b.length - a.length)
      .slice(0, 3);

    if (topExercises.length === 0) return [];

    // Create time series data
    const allDates = Array.from(new Set(workouts.map(w => w.date.split('T')[0])))
      .sort()
      .slice(-20); // Last 20 workout dates

    return allDates.map(date => {
      const dataPoint: any = {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      
      topExercises.forEach(([exerciseName, records]) => {
        const dayRecord = records
          .filter(r => r.date.startsWith(date))
          .sort((a, b) => b.weight - a.weight)[0];
        dataPoint[exerciseName] = dayRecord?.weight || null;
      });
      
      return dataPoint;
    });
  }, [workouts]);

  if (workouts.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Data Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Start logging workouts to see your progress charts and analytics.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8">
      {/* Workout Frequency */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Workout Frequency (Last 30 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={workoutFrequencyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.6)"
              fontSize={12}
            />
            <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: 'none',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            <Bar dataKey="workouts" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Workout Type Distribution */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Workout Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={workoutTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Volume Progression */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Weekly Training Volume
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={volumeProgressionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="week" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
                formatter={(value, name) => [
                  `${value} kg`,
                  name === 'volume' ? 'Total Volume' : 'Avg Volume per Workout'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Strength Progression */}
      {strengthProgressionData.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Strength Progression (Top Exercises)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={strengthProgressionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white'
                }}
                formatter={(value) => [`${value} kg`, 'Max Weight']}
              />
              <Legend />
              {Object.keys(strengthProgressionData[0] || {})
                .filter(key => key !== 'date')
                .map((exerciseName, index) => {
                  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                  return (
                    <Line
                      key={exerciseName}
                      type="monotone"
                      dataKey={exerciseName}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ fill: colors[index % colors.length], strokeWidth: 2 }}
                      connectNulls={false}
                    />
                  );
                })}
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      )}
    </div>
  );
}
