'use client';

import React, { useState, useMemo } from 'react';
import { WorkoutSession, WorkoutType, User } from '@/types';

interface WorkoutHistoryProps {
  user: User;
  workouts: WorkoutSession[];
}

interface FilterState {
  workoutType: WorkoutType | 'all';
  dateRange: 'all' | 'week' | 'month' | '3months' | '6months' | 'year';
  exercise: string;
  sortBy: 'date' | 'duration' | 'volume' | 'rating';
  sortOrder: 'asc' | 'desc';
}

export default function WorkoutHistory({ user, workouts }: WorkoutHistoryProps) {
  const [filters, setFilters] = useState<FilterState>({
    workoutType: 'all',
    dateRange: 'all',
    exercise: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null);

  // Get user workouts and unique exercises
  const userWorkouts = workouts.filter(workout => workout.user === user);
  const uniqueExercises = useMemo(() => {
    const exercises = new Set<string>();
    userWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercises.add(exercise.name);
      });
    });
    return Array.from(exercises).sort();
  }, [userWorkouts]);

  // Filter and sort workouts
  const filteredWorkouts = useMemo(() => {
    let filtered = [...userWorkouts];

    // Filter by workout type
    if (filters.workoutType !== 'all') {
      filtered = filtered.filter(workout => workout.workoutType === filters.workoutType);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(workout => new Date(workout.date) >= cutoffDate);
    }

    // Filter by exercise
    if (filters.exercise) {
      filtered = filtered.filter(workout =>
        workout.exercises.some(exercise =>
          exercise.name.toLowerCase().includes(filters.exercise.toLowerCase())
        )
      );
    }

    // Sort workouts
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'volume':
          const volumeA = a.exercises.reduce((sum, ex) => 
            sum + ex.sets.reduce((setSum, set) => setSum + (set.reps * set.weight), 0), 0);
          const volumeB = b.exercises.reduce((sum, ex) => 
            sum + ex.sets.reduce((setSum, set) => setSum + (set.reps * set.weight), 0), 0);
          comparison = volumeA - volumeB;
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [userWorkouts, filters]);

  const calculateWorkoutVolume = (workout: WorkoutSession) => {
    return workout.exercises.reduce((sum, exercise) =>
      sum + exercise.sets.reduce((setSum, set) => setSum + (set.reps * set.weight), 0), 0
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWorkoutTypeColor = (type: WorkoutType) => {
    const colors = {
      push: 'bg-red-100 text-red-800',
      pull: 'bg-blue-100 text-blue-800',
      legs: 'bg-green-100 text-green-800',
      arms: 'bg-purple-100 text-purple-800'
    };
    return colors[type];
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Workout History</h1>
        <p className="text-gray-600">
          {filteredWorkouts.length} of {userWorkouts.length} workouts for {user}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters & Sorting</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Workout Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workout Type
            </label>
            <select
              value={filters.workoutType}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                workoutType: e.target.value as WorkoutType | 'all' 
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Types</option>
              <option value="push">Push</option>
              <option value="pull">Pull</option>
              <option value="legs">Legs</option>
              <option value="arms">Arms</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: e.target.value as FilterState['dateRange'] 
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          {/* Exercise Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exercise
            </label>
            <input
              type="text"
              placeholder="Search exercises..."
              value={filters.exercise}
              onChange={(e) => setFilters(prev => ({ ...prev, exercise: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                sortBy: e.target.value as FilterState['sortBy'] 
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="date">Date</option>
              <option value="duration">Duration</option>
              <option value="volume">Volume</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                sortOrder: e.target.value as 'asc' | 'desc' 
              }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => setFilters({
            workoutType: 'all',
            dateRange: 'all',
            exercise: '',
            sortBy: 'date',
            sortOrder: 'desc'
          })}
          className="mt-4 text-sm text-blue-600 hover:text-blue-800"
        >
          Clear all filters
        </button>
      </div>

      {/* Workout List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Cards */}
        <div className="space-y-4">
          {filteredWorkouts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
              <div className="text-gray-400 text-6xl mb-4">🏋️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts found</h3>
              <p className="text-gray-600">
                {userWorkouts.length === 0
                  ? "No workouts recorded yet. Start by adding your first workout!"
                  : "Try adjusting your filters to see more workouts."
                }
              </p>
            </div>
          ) : (
            filteredWorkouts.map((workout) => (
              <div
                key={workout.id}
                className={`bg-white rounded-lg shadow-sm border p-6 cursor-pointer transition-shadow hover:shadow-md ${
                  selectedWorkout?.id === workout.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedWorkout(workout)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWorkoutTypeColor(workout.workoutType)}`}>
                        {workout.workoutType}
                      </span>
                      {workout.rating && (
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600 ml-1">{workout.rating}/10</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {formatDate(workout.date)}
                    </h3>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>{workout.duration} min</div>
                    <div>{calculateWorkoutVolume(workout).toLocaleString()} lbs</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <strong>{workout.exercises.length}</strong> exercises, {' '}
                    <strong>{workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}</strong> total sets
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {workout.exercises.slice(0, 3).map((exercise, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {exercise.name}
                      </span>
                    ))}
                    {workout.exercises.length > 3 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{workout.exercises.length - 3} more
                      </span>
                    )}
                  </div>

                  {workout.notes && (
                    <p className="text-sm text-gray-600 italic">"{workout.notes}"</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Workout Details */}
        <div className="lg:sticky lg:top-6">
          {selectedWorkout ? (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Workout Details</h3>
                <button
                  onClick={() => setSelectedWorkout(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Workout Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <div className="font-medium">{formatDate(selectedWorkout.date)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <div className="font-medium capitalize">{selectedWorkout.workoutType}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <div className="font-medium">{selectedWorkout.duration} minutes</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Volume:</span>
                    <div className="font-medium">{calculateWorkoutVolume(selectedWorkout).toLocaleString()} lbs</div>
                  </div>
                </div>

                {/* Exercises */}
                <div>
                  <h4 className="font-medium mb-3">Exercises</h4>
                  <div className="space-y-4">
                    {selectedWorkout.exercises.map((exercise, exerciseIndex) => (
                      <div key={exerciseIndex} className="border-l-2 border-gray-200 pl-4">
                        <h5 className="font-medium text-gray-900 mb-2">{exercise.name}</h5>
                        <div className="space-y-1">
                          {exercise.sets.map((set, setIndex) => (
                            <div key={setIndex} className="text-sm text-gray-600 flex items-center gap-4">
                              <span className="w-8 text-center font-mono">
                                {setIndex + 1}
                              </span>
                              <span className="flex-1">
                                {set.reps} reps × {set.weight} lbs
                              </span>
                              {set.rpe && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  RPE {set.rpe}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                        {exercise.notes && (
                          <p className="text-xs text-gray-500 mt-2 italic">
                            {exercise.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workout Notes */}
                {selectedWorkout.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {selectedWorkout.notes}
                    </p>
                  </div>
                )}

                {/* Rating */}
                {selectedWorkout.rating && (
                  <div>
                    <h4 className="font-medium mb-2">Rating</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(10)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < selectedWorkout.rating! ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {selectedWorkout.rating}/10
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="text-gray-400 text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a workout
              </h3>
              <p className="text-gray-600">
                Click on any workout from the list to view detailed information
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
