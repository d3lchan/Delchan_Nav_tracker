'use client';

import React, { useState, useRef } from 'react';
import { WorkoutSession, User } from '@/types';

interface JsonUploadProps {
  onUploadSuccess: (workouts: WorkoutSession[]) => void;
  onUploadError: (error: string) => void;
  targetUser: User;
}

interface UploadResult {
  success: boolean;
  workoutsImported: number;
  errors: string[];
  skipped: number;
}

export default function JsonUpload({ onUploadSuccess, onUploadError, targetUser }: JsonUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateWorkoutData = (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!Array.isArray(data)) {
      errors.push('Data must be an array of workout sessions');
      return { valid: false, errors };
    }

    data.forEach((workout, index) => {
      if (!workout.id) errors.push(`Workout ${index + 1}: Missing id`);
      if (!workout.user) errors.push(`Workout ${index + 1}: Missing user`);
      if (!workout.date) errors.push(`Workout ${index + 1}: Missing date`);
      if (!workout.workoutType) errors.push(`Workout ${index + 1}: Missing workoutType`);
      if (!Array.isArray(workout.exercises)) errors.push(`Workout ${index + 1}: Exercises must be an array`);
      
      if (workout.exercises) {
        workout.exercises.forEach((exercise: any, exerciseIndex: number) => {
          if (!exercise.name) errors.push(`Workout ${index + 1}, Exercise ${exerciseIndex + 1}: Missing name`);
          if (!Array.isArray(exercise.sets)) errors.push(`Workout ${index + 1}, Exercise ${exerciseIndex + 1}: Sets must be an array`);
          
          if (exercise.sets) {
            exercise.sets.forEach((set: any, setIndex: number) => {
              if (typeof set.reps !== 'number') errors.push(`Workout ${index + 1}, Exercise ${exerciseIndex + 1}, Set ${setIndex + 1}: Invalid reps`);
              if (typeof set.weight !== 'number') errors.push(`Workout ${index + 1}, Exercise ${exerciseIndex + 1}, Set ${setIndex + 1}: Invalid weight`);
            });
          }
        });
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const processFile = async (file: File) => {
    setIsUploading(true);
    setUploadResult(null);

    try {
      const text = await file.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Invalid JSON format');
      }

      const validation = validateWorkoutData(data);
      if (!validation.valid) {
        throw new Error(`Validation errors:\n${validation.errors.join('\n')}`);
      }

      // Filter workouts for target user and validate dates
      const validWorkouts: WorkoutSession[] = [];
      const errors: string[] = [];
      let skipped = 0;

      data.forEach((workout: any, index: number) => {
        try {
          // Check if workout is for the target user
          if (workout.user !== targetUser) {
            skipped++;
            return;
          }

          // Validate date format
          const date = new Date(workout.date);
          if (isNaN(date.getTime())) {
            errors.push(`Workout ${index + 1}: Invalid date format`);
            return;
          }

          // Ensure all required fields are present and properly typed
          const processedWorkout: WorkoutSession = {
            id: workout.id,
            user: workout.user,
            date: workout.date,
            workoutType: workout.workoutType,
            exercises: workout.exercises.map((exercise: any) => ({
              name: exercise.name,
              muscleGroups: exercise.muscleGroups || [],
              sets: exercise.sets.map((set: any) => ({
                reps: Number(set.reps),
                weight: Number(set.weight),
                rpe: set.rpe ? Number(set.rpe) : undefined,
                notes: set.notes || undefined,
                restTime: set.restTime ? Number(set.restTime) : undefined
              })),
              equipment: exercise.equipment || undefined,
              category: exercise.category || undefined,
              notes: exercise.notes || undefined
            })),
            duration: Number(workout.duration) || 0,
            notes: workout.notes || undefined,
            rating: workout.rating ? Number(workout.rating) : undefined,
            bodyWeight: workout.bodyWeight ? Number(workout.bodyWeight) : undefined
          };

          validWorkouts.push(processedWorkout);
        } catch (error) {
          errors.push(`Workout ${index + 1}: ${error instanceof Error ? error.message : 'Processing error'}`);
        }
      });

      const result: UploadResult = {
        success: validWorkouts.length > 0,
        workoutsImported: validWorkouts.length,
        errors,
        skipped
      };

      setUploadResult(result);

      if (validWorkouts.length > 0) {
        onUploadSuccess(validWorkouts);
      } else {
        onUploadError('No valid workouts found for the selected user');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setUploadResult({
        success: false,
        workoutsImported: 0,
        errors: [errorMessage],
        skipped: 0
      });
      onUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (jsonFile) {
      processFile(jsonFile);
    } else {
      onUploadError('Please upload a valid JSON file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isUploading ? 'Processing...' : 'Upload workout data'}
            </p>
            <p className="text-sm text-gray-600">
              Drag and drop a JSON file here, or click to select
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Target user: {targetUser}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className={`p-4 rounded-lg ${
          uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className={`flex items-center ${
            uploadResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            <div className="flex-shrink-0">
              {uploadResult.success ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">
                {uploadResult.success ? 'Upload Successful' : 'Upload Failed'}
              </h3>
              <div className="mt-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Workouts imported: {uploadResult.workoutsImported}</li>
                  {uploadResult.skipped > 0 && (
                    <li>Workouts skipped (different user): {uploadResult.skipped}</li>
                  )}
                  {uploadResult.errors.length > 0 && (
                    <li>Errors: {uploadResult.errors.length}</li>
                  )}
                </ul>
              </div>
              {uploadResult.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">
                    View errors ({uploadResult.errors.length})
                  </summary>
                  <div className="mt-2 text-xs bg-white p-2 rounded border">
                    {uploadResult.errors.map((error, index) => (
                      <div key={index} className="py-1">{error}</div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Format Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Expected JSON Format:</h4>
        <pre className="text-xs text-gray-600 overflow-x-auto">
{`[
  {
    "id": "unique-id",
    "user": "Nav" | "Delchan",
    "date": "2024-01-15",
    "workoutType": "push",
    "exercises": [
      {
        "name": "Bench Press",
        "sets": [
          { "reps": 10, "weight": 135 }
        ]
      }
    ],
    "duration": 60
  }
]`}
        </pre>
      </div>
    </div>
  );
}
