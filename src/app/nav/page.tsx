'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, TrendingUp, Calendar, Target } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { LiquidButton } from '@/components/ui/liquid-button';
import { useAppStore, useUserWorkouts, useUserPersonalRecords } from '@/store';
import { getWorkoutTypeLabel, getWorkoutTypeColor } from '@/lib/muscle-mapping';
import { ProgressCharts } from '@/components/charts/workout-progress-charts';
import { BodyHeatMap } from '@/components/charts/body-heat-map';
import { DashboardStats } from '@/components/charts/dashboard-stats';
import type { WorkoutType } from '@/types';

const workoutTypes: WorkoutType[] = ['arms', 'push', 'pull', 'legs'];

export default function NavDashboard() {
  const router = useRouter();
  const { setCurrentUser, updateDashboardState } = useAppStore();
  const workouts = useUserWorkouts('Nav');
  const personalRecords = useUserPersonalRecords('Nav');

  useEffect(() => {
    setCurrentUser('Nav');
    updateDashboardState({ selectedUser: 'Nav' });
  }, [setCurrentUser, updateDashboardState]);

  const handleWorkoutTypeClick = (workoutType: WorkoutType) => {
    updateDashboardState({ activeWorkoutType: workoutType });
    router.push(`/nav/workout-types/${workoutType}`);
  };

  const recentWorkouts = workouts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const totalWorkouts = workouts.length;
  const thisMonthWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date);
    const now = new Date();
    return workoutDate.getMonth() === now.getMonth() && 
           workoutDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <LiquidButton
              variant="ghost"
              size="sm"
              icon={<ArrowLeft size={16} />}
              onClick={() => router.push('/')}
            >
              Back
            </LiquidButton>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Nav's Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your fitness journey with precision
              </p>
            </div>
          </div>
          
          <LiquidButton
            icon={<Plus size={16} />}
            onClick={() => router.push('/nav/workouts/add')}
          >
            Add Workout
          </LiquidButton>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Workouts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalWorkouts}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Calendar className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {thisMonthWorkouts}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Target className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Personal Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {personalRecords.length}
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Workout Types Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Workout Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workoutTypes.map((workoutType, index) => {
              const workoutCount = workouts.filter(w => w.workoutType === workoutType).length;
              const color = getWorkoutTypeColor(workoutType);
              
              return (
                <motion.div
                  key={workoutType}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="cursor-pointer"
                  onClick={() => handleWorkoutTypeClick(workoutType)}
                >
                  <GlassCard className="p-6 h-full">
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <div 
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {getWorkoutTypeLabel(workoutType)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {workoutCount} workout{workoutCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Dashboard Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <DashboardStats user="Nav" />
        </motion.div>

        {/* Progress Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <ProgressCharts user="Nav" />
        </motion.div>

        {/* Body Heat Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mb-8"
        >
          <BodyHeatMap user="Nav" />
        </motion.div>

        {/* Recent Workouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Workouts
            </h2>
            <LiquidButton
              variant="outline"
              size="sm"
              onClick={() => router.push('/nav/workouts')}
            >
              View All
            </LiquidButton>
          </div>
          
          {recentWorkouts.length > 0 ? (
            <div className="space-y-4">
              {recentWorkouts.map((workout, index) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <GlassCard className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${getWorkoutTypeColor(workout.workoutType)}20` }}
                        >
                          <div 
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: getWorkoutTypeColor(workout.workoutType) }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {getWorkoutTypeLabel(workout.workoutType)}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(workout.date).toLocaleDateString()} • {workout.duration} min
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                        </p>
                        {workout.rating && (
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Rating: {workout.rating}/10
                          </p>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          ) : (
            <GlassCard className="p-12 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No workouts yet</h3>
                <p className="text-sm mb-4">Start tracking your fitness journey!</p>
                <LiquidButton onClick={() => router.push('/nav/workouts/add')}>
                  Add Your First Workout
                </LiquidButton>
              </div>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}
