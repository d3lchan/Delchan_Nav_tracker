'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Filter, Plus, Calendar, Clock, Zap, Target } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { LiquidButton } from '@/components/ui/liquid-button';
import { useAppStore, useUserWorkouts } from '@/store';
import { 
  getWorkoutTypeLabel, 
  getWorkoutTypeColor, 
  getWorkoutTypeMuscleGroups,
  getMuscleGroupColor 
} from '@/lib/muscle-mapping';
import type { WorkoutType, MuscleGroup } from '@/types';

const isValidWorkoutType = (type: string): type is WorkoutType => {
  return ['arms', 'push', 'pull', 'legs'].includes(type);
};

export default function DelchanWorkoutTypePage() {
  const router = useRouter();
  const params = useParams();
  const workoutType = params.type as string;
  
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'rating'>('date');
  const [filterDays, setFilterDays] = useState<number | null>(null);

  const { setCurrentUser, updateDashboardState } = useAppStore();
  const allWorkouts = useUserWorkouts('Delchan');

  useEffect(() => {
    setCurrentUser('Delchan');
    if (isValidWorkoutType(workoutType)) {
      updateDashboardState({ 
        selectedUser: 'Delchan',
        activeWorkoutType: workoutType 
      });
    }
  }, [setCurrentUser, updateDashboardState, workoutType]);

  if (!isValidWorkoutType(workoutType)) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Invalid Workout Type
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The workout type "{workoutType}" is not recognized.
          </p>
          <LiquidButton onClick={() => router.push('/delchan')}>
            Back to Dashboard
          </LiquidButton>
        </GlassCard>
      </div>
    );
  }

  const workouts = allWorkouts.filter(w => w.workoutType === workoutType);
  const muscleGroups = getWorkoutTypeMuscleGroups(workoutType);
  const color = getWorkoutTypeColor(workoutType);

  // Filter workouts by days
  const filteredWorkouts = filterDays 
    ? workouts.filter(w => {
        const workoutDate = new Date(w.date);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filterDays);
        return workoutDate >= cutoffDate;
      })
    : workouts;

  // Sort workouts
  const sortedWorkouts = [...filteredWorkouts].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'duration':
        return (b.duration || 0) - (a.duration || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  // Calculate stats
  const totalWorkouts = workouts.length;
  const avgDuration = workouts.length > 0 
    ? Math.round(workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / workouts.length)
    : 0;
  const avgRating = workouts.length > 0
    ? (workouts.reduce((sum, w) => sum + (w.rating || 0), 0) / workouts.length).toFixed(1)
    : '0';
  const thisWeekWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutDate >= weekAgo;
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
              onClick={() => router.push('/delchan')}
            >
              Back
            </LiquidButton>
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {getWorkoutTypeLabel(workoutType)} Workouts
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Delchan's {getWorkoutTypeLabel(workoutType).toLowerCase()} training sessions
                </p>
              </div>
            </div>
          </div>
          
          <LiquidButton
            icon={<Plus size={16} />}
            onClick={() => router.push(`/delchan/workouts/add?type=${workoutType}`)}
          >
            Add {getWorkoutTypeLabel(workoutType)} Workout
          </LiquidButton>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Target className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {totalWorkouts}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Calendar className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {thisWeekWorkouts}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <Clock className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {avgDuration}m
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Zap className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {avgRating}/10
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Muscle Groups */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Target Muscle Groups
          </h2>
          <div className="flex flex-wrap gap-3">
            {muscleGroups.map((muscleGroup: MuscleGroup) => (
              <div
                key={muscleGroup}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: `${getMuscleGroupColor(muscleGroup)}20`,
                  color: getMuscleGroupColor(muscleGroup)
                }}
              >
                {muscleGroup}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center gap-4 mb-6"
        >
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-gray-900 dark:text-white backdrop-blur-lg"
            >
              <option value="date">Date</option>
              <option value="duration">Duration</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterDays(null)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  filterDays === null
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/20'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterDays(7)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  filterDays === 7
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/20'
                }`}
              >
                7 days
              </button>
              <button
                onClick={() => setFilterDays(30)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  filterDays === 30
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/20'
                }`}
              >
                30 days
              </button>
            </div>
          </div>
        </motion.div>

        {/* Workouts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {sortedWorkouts.length > 0 ? (
            <div className="space-y-4">
              {sortedWorkouts.map((workout, index) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="cursor-pointer"
                  onClick={() => router.push(`/delchan/workouts/${workout.id}`)}
                >
                  <GlassCard className="p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${color}20` }}
                        >
                          <div 
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {new Date(workout.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                            {workout.duration && ` • ${workout.duration} min`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {workout.rating && (
                          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            ⭐ {workout.rating}/10
                          </div>
                        )}
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(workout.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          ) : (
            <GlassCard className="p-12 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                <Target size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  No {getWorkoutTypeLabel(workoutType).toLowerCase()} workouts yet
                </h3>
                <p className="text-sm mb-4">
                  Start tracking your {getWorkoutTypeLabel(workoutType).toLowerCase()} training sessions!
                </p>
                <LiquidButton 
                  onClick={() => router.push(`/delchan/workouts/add?type=${workoutType}`)}
                >
                  Add Your First {getWorkoutTypeLabel(workoutType)} Workout
                </LiquidButton>
              </div>
            </GlassCard>
          )}
        </motion.div>
      </div>
    </div>
  );
}
