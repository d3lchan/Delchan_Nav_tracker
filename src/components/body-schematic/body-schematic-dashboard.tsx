'use client';

import React, { useState, useMemo } from 'react';
import BodyDiagram from './body-diagram';
import { analyzeMuscleGroups, getMuscleGroupWorkouts, MuscleGroupData } from '@/lib/muscle-analyzer';
import { WorkoutSession } from '@/types';

interface BodySchematicDashboardProps {
  workouts: WorkoutSession[];
  onWorkoutSelect?: (workouts: WorkoutSession[]) => void;
}

export default function BodySchematicDashboard({ workouts, onWorkoutSelect }: BodySchematicDashboardProps) {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  const muscleData = useMemo(() => {
    return analyzeMuscleGroups(workouts);
  }, [workouts]);

  const handleMuscleClick = (muscleId: string) => {
    if (selectedMuscle === muscleId) {
      setSelectedMuscle(null);
      onWorkoutSelect?.(workouts);
    } else {
      setSelectedMuscle(muscleId);
      const muscleWorkouts = getMuscleGroupWorkouts(workouts, muscleId);
      onWorkoutSelect?.(muscleWorkouts);
    }
  };

  const selectedMuscleData = selectedMuscle 
    ? muscleData.find(m => m.id === selectedMuscle)
    : null;

  const totalWorkouts = workouts.length;
  const totalVolume = muscleData.reduce((sum, muscle) => sum + muscle.totalVolume, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Body Diagram */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Muscle Group Targeting</h3>
          <BodyDiagram
            muscleData={muscleData}
            onMuscleClick={handleMuscleClick}
            selectedMuscle={selectedMuscle || undefined}
          />
        </div>
      </div>

      {/* Muscle Group Stats */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">
            {selectedMuscle ? `${selectedMuscleData?.name} Details` : 'Overall Muscle Group Activity'}
          </h3>

          {selectedMuscleData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Workouts</div>
                  <div className="text-xl font-bold text-blue-600">
                    {selectedMuscleData.workoutCount}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Total Volume</div>
                  <div className="text-xl font-bold text-green-600">
                    {selectedMuscleData.totalVolume.toLocaleString()}
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Exercises</div>
                  <div className="text-xl font-bold text-purple-600">
                    {selectedMuscleData.exercises.length}
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Last Worked</div>
                  <div className="text-sm font-semibold text-orange-600">
                    {selectedMuscleData.lastWorked || 'Never'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Exercises Used:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMuscleData.exercises.map((exercise, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                    >
                      {exercise}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleMuscleClick(selectedMuscle!)}
                className="text-blue-600 text-sm hover:underline"
              >
                ← Back to overview
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded text-center">
                  <div className="text-sm text-gray-600">Total Workouts</div>
                  <div className="text-xl font-bold text-blue-600">{totalWorkouts}</div>
                </div>
                <div className="bg-green-50 p-3 rounded text-center">
                  <div className="text-sm text-gray-600">Total Volume</div>
                  <div className="text-xl font-bold text-green-600">
                    {totalVolume.toLocaleString()}
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded text-center">
                  <div className="text-sm text-gray-600">Active Muscles</div>
                  <div className="text-xl font-bold text-purple-600">
                    {muscleData.filter(m => m.workoutCount > 0).length}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Muscle Group Breakdown:</h4>
                <div className="space-y-2">
                  {muscleData
                    .filter(muscle => muscle.workoutCount > 0)
                    .sort((a, b) => b.workoutCount - a.workoutCount)
                    .map((muscle) => (
                      <div
                        key={muscle.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => handleMuscleClick(muscle.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded bg-blue-500" style={{ 
                            opacity: Math.min(muscle.workoutCount / 20, 1) 
                          }}></div>
                          <span className="font-medium">{muscle.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">{muscle.workoutCount} workouts</div>
                          <div className="text-xs text-gray-600">
                            {muscle.totalVolume.toLocaleString()} volume
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {muscleData.filter(m => m.workoutCount === 0).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-gray-600">Untargeted Muscle Groups:</h4>
                  <div className="flex flex-wrap gap-2">
                    {muscleData
                      .filter(muscle => muscle.workoutCount === 0)
                      .map((muscle) => (
                        <span
                          key={muscle.id}
                          className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm"
                        >
                          {muscle.name}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
