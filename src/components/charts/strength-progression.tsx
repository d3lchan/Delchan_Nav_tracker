'use client';

import React, { useMemo } from 'react';
import { WorkoutSession, User } from '@/types';

interface StrengthProgressionProps {
  user: User;
  workouts: WorkoutSession[];
  selectedExercise?: string;
}

interface ProgressionData {
  exercise: string;
  data: {
    date: string;
    maxWeight: number;
    maxReps: number;
    volume: number;
    oneRepMax: number;
  }[];
}

export default function StrengthProgression({ user, workouts, selectedExercise }: StrengthProgressionProps) {
  const progressionData = useMemo(() => {
    const userWorkouts = workouts.filter(w => w.user === user);
    const exerciseMap = new Map<string, ProgressionData['data']>();

    userWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (!exerciseMap.has(exercise.name)) {
          exerciseMap.set(exercise.name, []);
        }

        const exerciseData = exerciseMap.get(exercise.name)!;
        const maxWeight = Math.max(...exercise.sets.map(set => set.weight));
        const maxReps = Math.max(...exercise.sets.map(set => set.reps));
        const volume = exercise.sets.reduce((sum, set) => sum + (set.reps * set.weight), 0);
        
        // Estimate 1RM using Brzycki formula: weight / (1.0278 - 0.0278 * reps)
        const oneRepMax = Math.max(...exercise.sets.map(set => {
          if (set.reps === 1) return set.weight;
          return set.weight / (1.0278 - 0.0278 * set.reps);
        }));

        // Check if we already have data for this date, if so, take the maximum values
        const existingIndex = exerciseData.findIndex(data => data.date === workout.date);
        if (existingIndex >= 0) {
          const existing = exerciseData[existingIndex];
          exerciseData[existingIndex] = {
            date: workout.date,
            maxWeight: Math.max(existing.maxWeight, maxWeight),
            maxReps: Math.max(existing.maxReps, maxReps),
            volume: existing.volume + volume,
            oneRepMax: Math.max(existing.oneRepMax, oneRepMax)
          };
        } else {
          exerciseData.push({
            date: workout.date,
            maxWeight,
            maxReps,
            volume,
            oneRepMax
          });
        }
      });
    });

    // Sort data by date and return as array
    return Array.from(exerciseMap.entries()).map(([exercise, data]) => ({
      exercise,
      data: data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })).filter(item => item.data.length > 1); // Only include exercises with multiple data points

  }, [user, workouts]);

  const filteredData = selectedExercise 
    ? progressionData.filter(item => item.exercise === selectedExercise)
    : progressionData;

  const calculateGrowthRate = (data: ProgressionData['data'], metric: keyof ProgressionData['data'][0]) => {
    if (data.length < 2) return 0;
    const first = data[0][metric] as number;
    const last = data[data.length - 1][metric] as number;
    return first > 0 ? ((last - first) / first) * 100 : 0;
  };

  const getMetricColor = (value: number) => {
    if (value > 10) return 'text-green-600';
    if (value > 0) return 'text-blue-600';
    if (value === 0) return 'text-gray-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (progressionData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">📈</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No progression data</h3>
        <p className="text-gray-600">
          Need at least 2 workouts with the same exercise to show progression
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600">Tracked Exercises</div>
          <div className="text-2xl font-bold text-blue-600">{progressionData.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600">Best Improvement</div>
          <div className="text-lg font-bold text-green-600">
            {Math.max(...progressionData.map(item => 
              calculateGrowthRate(item.data, 'oneRepMax')
            )).toFixed(1)}%
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600">Total Data Points</div>
          <div className="text-2xl font-bold text-purple-600">
            {progressionData.reduce((sum, item) => sum + item.data.length, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600">Avg Sessions/Exercise</div>
          <div className="text-2xl font-bold text-orange-600">
            {(progressionData.reduce((sum, item) => sum + item.data.length, 0) / progressionData.length).toFixed(1)}
          </div>
        </div>
      </div>

      {/* Progression Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Strength Progression Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exercise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max Weight Growth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1RM Growth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume Growth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Best
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {progressionData.map((item) => {
                const weightGrowth = calculateGrowthRate(item.data, 'maxWeight');
                const rmGrowth = calculateGrowthRate(item.data, 'oneRepMax');
                const volumeGrowth = calculateGrowthRate(item.data, 'volume');
                const currentBest = item.data[item.data.length - 1];

                return (
                  <tr key={item.exercise} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.exercise}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.data.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getMetricColor(weightGrowth)}`}>
                        {weightGrowth > 0 ? '+' : ''}{weightGrowth.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getMetricColor(rmGrowth)}`}>
                        {rmGrowth > 0 ? '+' : ''}{rmGrowth.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getMetricColor(volumeGrowth)}`}>
                        {volumeGrowth > 0 ? '+' : ''}{volumeGrowth.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {currentBest.maxWeight} lbs × {currentBest.maxReps}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Charts for Selected/Top Exercises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredData.slice(0, 4).map((item) => (
          <div key={item.exercise} className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4">{item.exercise}</h4>
            
            {/* Mini Chart - Simple line representation */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>1RM Progression</span>
                  <span>{item.data[item.data.length - 1].oneRepMax.toFixed(0)} lbs</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000"
                    style={{ 
                      width: `${Math.min(
                        (item.data[item.data.length - 1].oneRepMax / Math.max(...item.data.map(d => d.oneRepMax))) * 100,
                        100
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Volume Trend</span>
                  <span>{item.data[item.data.length - 1].volume.toLocaleString()} lbs</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-1000"
                    style={{ 
                      width: `${Math.min(
                        (item.data[item.data.length - 1].volume / Math.max(...item.data.map(d => d.volume))) * 100,
                        100
                      )}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Data Points */}
              <div className="mt-4">
                <div className="text-xs text-gray-500 mb-2">Recent Sessions:</div>
                <div className="space-y-1">
                  {item.data.slice(-3).map((dataPoint, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{formatDate(dataPoint.date)}</span>
                      <span className="font-medium">
                        {dataPoint.maxWeight} lbs × {dataPoint.maxReps}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {progressionData.length > 4 && !selectedExercise && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Showing top 4 exercises. Select a specific exercise to see detailed progression.
          </p>
        </div>
      )}
    </div>
  );
}
