'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Save, X } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { LiquidButton } from '@/components/ui/liquid-button';
import type { WorkoutType, MuscleGroup, Exercise, WorkoutSession } from '@/types';
import { getWorkoutTypeLabel, getWorkoutTypeColor, getWorkoutTypeMuscleGroups } from '@/lib/muscle-mapping';

interface SetData {
  reps: number;
  weight?: number;
  duration?: number;
  restTime?: number;
}

interface ExerciseFormData {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  sets: SetData[];
  notes?: string;
}

interface WorkoutFormProps {
  workoutType?: WorkoutType;
  onSubmit: (workout: Omit<WorkoutSession, 'id'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const commonExercises: Record<WorkoutType, string[]> = {
  arms: [
    'Bicep Curls', 'Hammer Curls', 'Tricep Dips', 'Overhead Press',
    'Lateral Raises', 'Front Raises', 'Tricep Extensions', 'Preacher Curls'
  ],
  push: [
    'Push-ups', 'Bench Press', 'Shoulder Press', 'Tricep Dips',
    'Incline Press', 'Decline Press', 'Lateral Raises', 'Chest Flyes'
  ],
  pull: [
    'Pull-ups', 'Lat Pulldowns', 'Rows', 'Face Pulls',
    'Reverse Flyes', 'Deadlifts', 'Shrugs', 'Bicep Curls'
  ],
  legs: [
    'Squats', 'Deadlifts', 'Lunges', 'Leg Press',
    'Calf Raises', 'Leg Curls', 'Leg Extensions', 'Hip Thrusts'
  ]
};

export function WorkoutForm({ workoutType = 'arms', onSubmit, onCancel, isSubmitting = false }: WorkoutFormProps) {
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<WorkoutType>(workoutType);
  const [exercises, setExercises] = useState<ExerciseFormData[]>([]);
  const [duration, setDuration] = useState<number>(60);
  const [rating, setRating] = useState<number>(7);
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const addExercise = () => {
    const newExercise: ExerciseFormData = {
      id: Date.now().toString(),
      name: '',
      muscleGroups: getWorkoutTypeMuscleGroups(selectedWorkoutType),
      sets: [{ reps: 10, weight: 0 }],
      notes: ''
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const updateExercise = (exerciseId: string, updates: Partial<ExerciseFormData>) => {
    setExercises(exercises.map(ex => 
      ex.id === exerciseId ? { ...ex, ...updates } : ex
    ));
  };

  const addSet = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const newSet: SetData = { 
        reps: lastSet?.reps || 10, 
        weight: lastSet?.weight || 0 
      };
      updateExercise(exerciseId, {
        sets: [...exercise.sets, newSet]
      });
    }
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise && exercise.sets.length > 1) {
      updateExercise(exerciseId, {
        sets: exercise.sets.filter((_, index) => index !== setIndex)
      });
    }
  };

  const updateSet = (exerciseId: string, setIndex: number, updates: Partial<SetData>) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (exercise) {
      const updatedSets = exercise.sets.map((set, index) =>
        index === setIndex ? { ...set, ...updates } : set
      );
      updateExercise(exerciseId, { sets: updatedSets });
    }
  };

  const handleSubmit = () => {
    if (exercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    const workout: Omit<WorkoutSession, 'id'> = {
      user: 'Nav', // This will be determined by the calling component
      date: new Date(date).toISOString(),
      workoutType: selectedWorkoutType,
      duration,
      exercises: exercises.map(ex => ({
        name: ex.name,
        muscleGroups: ex.muscleGroups,
        sets: ex.sets.map(set => ({
          reps: set.reps,
          weight: set.weight || 0,
          restTime: set.restTime
        })),
        notes: ex.notes
      })),
      notes,
      rating
    };

    onSubmit(workout);
  };

  const workoutTypes: WorkoutType[] = ['arms', 'push', 'pull', 'legs'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Add New Workout
          </h2>
          <LiquidButton
            variant="ghost"
            icon={<X size={16} />}
            onClick={onCancel}
          >
            Cancel
          </LiquidButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Workout Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Workout Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {workoutTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedWorkoutType(type)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedWorkoutType === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/20'
                  }`}
                >
                  {getWorkoutTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-gray-900 dark:text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min="1"
              max="300"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-gray-900 dark:text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating (1-10)
            </label>
            <input
              type="number"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              min="1"
              max="10"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-gray-900 dark:text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Workout Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did the workout feel? Any observations?"
            rows={3}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-gray-900 dark:text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </GlassCard>

      {/* Exercises */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Exercises
          </h3>
          <LiquidButton
            icon={<Plus size={16} />}
            onClick={addExercise}
          >
            Add Exercise
          </LiquidButton>
        </div>

        {exercises.map((exercise, exerciseIndex) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                  Exercise {exerciseIndex + 1}
                </h4>
                <button
                  onClick={() => removeExercise(exercise.id)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Exercise Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exercise Name
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExercise(exercise.id, { name: e.target.value })}
                      placeholder="Enter exercise name"
                      className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-gray-900 dark:text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          updateExercise(exercise.id, { name: e.target.value });
                        }
                      }}
                      className="p-3 bg-white/10 border border-white/20 rounded-lg text-gray-900 dark:text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select from common</option>
                      {commonExercises[selectedWorkoutType].map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sets */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sets
                    </label>
                    <button
                      onClick={() => addSet(exercise.id)}
                      className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                    >
                      Add Set
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-8">
                          {setIndex + 1}
                        </span>
                        
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Reps
                            </label>
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) => updateSet(exercise.id, setIndex, { reps: Number(e.target.value) })}
                              min="1"
                              className="w-full p-2 bg-white/10 border border-white/20 rounded text-sm text-gray-900 dark:text-white backdrop-blur-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Weight (lbs)
                            </label>
                            <input
                              type="number"
                              value={set.weight || ''}
                              onChange={(e) => updateSet(exercise.id, setIndex, { weight: Number(e.target.value) || undefined })}
                              min="0"
                              step="0.5"
                              className="w-full p-2 bg-white/10 border border-white/20 rounded text-sm text-gray-900 dark:text-white backdrop-blur-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {exercise.sets.length > 1 && (
                          <button
                            onClick={() => removeSet(exercise.id, setIndex)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exercise Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exercise Notes
                  </label>
                  <textarea
                    value={exercise.notes || ''}
                    onChange={(e) => updateExercise(exercise.id, { notes: e.target.value })}
                    placeholder="Form notes, observations, etc."
                    rows={2}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-gray-900 dark:text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}

        {exercises.length === 0 && (
          <GlassCard className="p-12 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <Plus size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No exercises added yet</h3>
              <p className="text-sm mb-4">Add exercises to track your workout</p>
              <LiquidButton onClick={addExercise}>
                Add Your First Exercise
              </LiquidButton>
            </div>
          </GlassCard>
        )}
      </div>

      {/* Submit */}
      {exercises.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex justify-end space-x-4">
            <LiquidButton
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </LiquidButton>
            <LiquidButton
              icon={<Save size={16} />}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Workout'}
            </LiquidButton>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
