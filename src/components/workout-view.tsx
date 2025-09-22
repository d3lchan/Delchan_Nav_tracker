'use client';

import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, Star, Target, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { LiquidButton } from '@/components/ui/liquid-button';
import { useAppStore, useUserWorkouts } from '@/store';
import { getWorkoutTypeLabel, getWorkoutTypeColor, getMuscleGroupColor } from '@/lib/muscle-mapping';
import type { User, WorkoutSession } from '@/types';

interface WorkoutViewProps {
  user: User;
}

export default function WorkoutView({ user }: WorkoutViewProps) {
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;
  
  const { deleteWorkoutSession } = useAppStore();
  const workouts = useUserWorkouts(user);
  
  const workout = workouts.find(w => w.id === workoutId);

  if (!workout) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Workout Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The workout you're looking for doesn't exist or has been deleted.
          </p>
          <LiquidButton onClick={() => router.push(`/${user.toLowerCase()}`)}>
            Back to Dashboard
          </LiquidButton>
        </GlassCard>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      deleteWorkoutSession(workoutId);
      router.push(`/${user.toLowerCase()}/workouts/${workout.workoutType}`);
    }
  };

  const color = getWorkoutTypeColor(workout.workoutType);
  const workoutDate = new Date(workout.date);
  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const totalWeight = workout.exercises.reduce((sum, ex) => 
    sum + ex.sets.reduce((setSum, set) => setSum + (set.weight || 0), 0), 0
  );
  const totalVolume = workout.exercises.reduce((sum, ex) => 
    sum + ex.sets.reduce((setSum, set) => setSum + (set.reps * (set.weight || 0)), 0), 0
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
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
              onClick={() => router.push(`/${user.toLowerCase()}/workouts/${workout.workoutType}`)}
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
                  {getWorkoutTypeLabel(workout.workoutType)} Workout
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {workoutDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <LiquidButton
              variant="outline"
              size="sm"
              icon={<Edit size={16} />}
              onClick={() => router.push(`/${user.toLowerCase()}/workouts/edit/${workoutId}`)}
            >
              Edit
            </LiquidButton>
            <LiquidButton
              variant="ghost"
              size="sm"
              icon={<Trash2 size={16} />}
              onClick={handleDelete}
              className="text-red-500 hover:bg-red-500/10"
            >
              Delete
            </LiquidButton>
          </div>
        </motion.div>

        {/* Workout Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Clock className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {workout.duration} min
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <Target className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sets</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {totalSets}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <TrendingUp className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Volume</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {totalVolume.toLocaleString()} kg
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Star className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {workout.rating ? `${workout.rating}/10` : 'N/A'}
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Workout Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
        >
          {/* Time & Date Info */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Session Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar size={16} className="text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {workoutDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock size={16} className="text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {workoutDate.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Target size={16} className="text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getWorkoutTypeLabel(workout.workoutType)}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Muscle Groups */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Muscles Targeted
            </h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(workout.exercises.flatMap(ex => ex.muscleGroups))).map((muscle) => (
                <div
                  key={muscle}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${getMuscleGroupColor(muscle)}20`,
                    color: getMuscleGroupColor(muscle)
                  }}
                >
                  {muscle}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Notes */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Workout Notes
            </h3>
            {workout.notes ? (
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {workout.notes}
              </p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                No notes recorded for this workout.
              </p>
            )}
          </GlassCard>
        </motion.div>

        {/* Exercises */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Exercises ({workout.exercises.length})
          </h2>
          
          <div className="space-y-6">
            {workout.exercises.map((exercise, exerciseIndex) => (
              <motion.div
                key={exerciseIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + exerciseIndex * 0.1 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {exercise.name}
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {exercise.sets.length} set{exercise.sets.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Sets Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 text-gray-600 dark:text-gray-400">Set</th>
                          <th className="text-left py-2 text-gray-600 dark:text-gray-400">Reps</th>
                          <th className="text-left py-2 text-gray-600 dark:text-gray-400">Weight</th>
                          <th className="text-left py-2 text-gray-600 dark:text-gray-400">Volume</th>
                          {exercise.sets.some(set => set.restTime) && (
                            <th className="text-left py-2 text-gray-600 dark:text-gray-400">Rest</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {exercise.sets.map((set, setIndex) => (
                          <tr key={setIndex} className="border-b border-white/5">
                            <td className="py-2 font-medium text-gray-900 dark:text-white">
                              {setIndex + 1}
                            </td>
                            <td className="py-2 text-gray-700 dark:text-gray-300">
                              {set.reps}
                            </td>
                            <td className="py-2 text-gray-700 dark:text-gray-300">
                              {set.weight ? `${set.weight} kg` : '—'}
                            </td>
                            <td className="py-2 text-gray-700 dark:text-gray-300">
                              {set.weight ? `${(set.reps * set.weight).toFixed(1)} kg` : '—'}
                            </td>
                            {exercise.sets.some(set => set.restTime) && (
                              <td className="py-2 text-gray-700 dark:text-gray-300">
                                {set.restTime ? `${set.restTime}s` : '—'}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Exercise Notes */}
                  {exercise.notes && (
                    <div className="mt-4 p-3 bg-white/5 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Notes: </span>
                        {exercise.notes}
                      </p>
                    </div>
                  )}

                  {/* Exercise Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Reps</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {exercise.sets.reduce((sum, set) => sum + set.reps, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Weight</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {exercise.sets.reduce((sum, set) => sum + (set.weight || 0), 0)} kg
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Volume</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {exercise.sets.reduce((sum, set) => sum + (set.reps * (set.weight || 0)), 0)} kg
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
