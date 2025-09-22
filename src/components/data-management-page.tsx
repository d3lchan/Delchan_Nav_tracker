'use client';

import React, { useState } from 'react';
import JsonUpload from '@/components/forms/json-upload';
import { WorkoutSession, User } from '@/types';

interface DataManagementPageProps {
  user: User;
  workouts: WorkoutSession[];
  onWorkoutsImported: (workouts: WorkoutSession[]) => void;
}

export default function DataManagementPage({ user, workouts, onWorkoutsImported }: DataManagementPageProps) {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleUploadSuccess = (importedWorkouts: WorkoutSession[]) => {
    onWorkoutsImported(importedWorkouts);
    setNotification({
      type: 'success',
      message: `Successfully imported ${importedWorkouts.length} workouts!`
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUploadError = (error: string) => {
    setNotification({
      type: 'error',
      message: error
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const exportToJson = () => {
    const userWorkouts = workouts.filter(workout => workout.user === user);
    const jsonData = JSON.stringify(userWorkouts, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user.toLowerCase()}-workouts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNotification({
      type: 'success',
      message: `Exported ${userWorkouts.length} workouts to JSON file`
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const exportToCsv = () => {
    const userWorkouts = workouts.filter(workout => workout.user === user);
    
    if (userWorkouts.length === 0) {
      setNotification({
        type: 'error',
        message: 'No workouts to export'
      });
      setTimeout(() => setNotification(null), 5000);
      return;
    }

    // Create CSV headers
    const headers = [
      'Date',
      'Workout Type',
      'Exercise',
      'Set Number',
      'Reps',
      'Weight',
      'RPE',
      'Duration (min)',
      'Notes'
    ];

    // Convert workouts to CSV rows
    const rows: string[][] = [headers];
    
    userWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.sets.forEach((set, setIndex) => {
          rows.push([
            workout.date,
            workout.workoutType,
            exercise.name,
            (setIndex + 1).toString(),
            set.reps.toString(),
            set.weight.toString(),
            set.rpe?.toString() || '',
            workout.duration.toString(),
            [workout.notes, exercise.notes, set.notes].filter(Boolean).join('; ')
          ]);
        });
      });
    });

    // Convert to CSV string
    const csvContent = rows.map(row => 
      row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user.toLowerCase()}-workouts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNotification({
      type: 'success',
      message: `Exported ${userWorkouts.length} workouts to CSV file`
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const generateSampleJson = () => {
    const sampleData: WorkoutSession[] = [
      {
        id: `sample-${Date.now()}`,
        user: user,
        date: new Date().toISOString().split('T')[0],
        workoutType: 'push',
        exercises: [
          {
            name: 'Bench Press',
            muscleGroups: [],
            sets: [
              { reps: 10, weight: 135, rpe: 7 },
              { reps: 8, weight: 145, rpe: 8 },
              { reps: 6, weight: 155, rpe: 9 }
            ],
            category: 'compound'
          },
          {
            name: 'Dumbbell Shoulder Press',
            muscleGroups: [],
            sets: [
              { reps: 12, weight: 30, rpe: 6 },
              { reps: 10, weight: 35, rpe: 7 },
              { reps: 8, weight: 40, rpe: 8 }
            ],
            category: 'compound'
          }
        ],
        duration: 45,
        rating: 8,
        notes: 'Great workout, felt strong today'
      }
    ];

    const jsonData = JSON.stringify(sampleData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `sample-workout-format.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNotification({
      type: 'success',
      message: 'Downloaded sample JSON format file'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const userWorkoutCount = workouts.filter(w => w.user === user).length;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
        <p className="text-gray-600 mt-2">
          Import and export workout data for {user}
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Current Data Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Current Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <div className="text-2xl font-bold text-blue-600">{userWorkoutCount}</div>
            <div className="text-sm text-gray-600">Total Workouts</div>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <div className="text-2xl font-bold text-green-600">
              {workouts.reduce((sum, w) => w.user === user ? sum + w.exercises.length : sum, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Exercises</div>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <div className="text-2xl font-bold text-purple-600">
              {workouts.reduce((sum, w) => w.user === user ? sum + w.exercises.reduce((eSum, e) => eSum + e.sets.length, 0) : sum, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Sets</div>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Import Data</h2>
          <button
            onClick={generateSampleJson}
            className="text-sm text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-400 px-3 py-1 rounded"
          >
            Download Sample Format
          </button>
        </div>
        
        <JsonUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          targetUser={user}
        />
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-6">Export Data</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* JSON Export */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">JSON Format</h3>
            <p className="text-sm text-gray-600 mb-4">
              Export as JSON for backup or importing into other applications. 
              Preserves all data structure and metadata.
            </p>
            <button
              onClick={exportToJson}
              disabled={userWorkoutCount === 0}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Export as JSON
            </button>
          </div>

          {/* CSV Export */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">CSV Format</h3>
            <p className="text-sm text-gray-600 mb-4">
              Export as CSV for analysis in spreadsheet applications. 
              Flattened format with one row per set.
            </p>
            <button
              onClick={exportToCsv}
              disabled={userWorkoutCount === 0}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Export as CSV
            </button>
          </div>
        </div>

        {userWorkoutCount === 0 && (
          <p className="text-sm text-gray-500 text-center mt-4">
            No workouts to export. Add some workouts first!
          </p>
        )}
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">💡 Tips</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• JSON files preserve all data and can be re-imported perfectly</li>
          <li>• CSV files are great for analysis but may lose some metadata when re-importing</li>
          <li>• Download the sample format to see the expected JSON structure</li>
          <li>• Only workouts for the current user ({user}) will be imported/exported</li>
        </ul>
      </div>
    </div>
  );
}
