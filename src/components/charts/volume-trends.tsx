'use client';

import React, { useMemo } from 'react';
import { WorkoutSession, User, WorkoutType } from '@/types';

interface VolumeTrendsProps {
  user: User;
  workouts: WorkoutSession[];
  timeRange?: 'week' | 'month' | '3months' | '6months' | 'year';
}

interface VolumeData {
  date: string;
  totalVolume: number;
  workoutTypeVolumes: Record<WorkoutType, number>;
  exerciseCount: number;
  setCount: number;
}

export default function VolumeTrends({ user, workouts, timeRange = '3months' }: VolumeTrendsProps) {
  const volumeData = useMemo(() => {
    const userWorkouts = workouts.filter(w => w.user === user);
    
    // Filter by time range
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
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
    
    const filteredWorkouts = userWorkouts.filter(
      workout => new Date(workout.date) >= cutoffDate
    );

    // Group by date and calculate volumes
    const volumeMap = new Map<string, VolumeData>();
    
    filteredWorkouts.forEach(workout => {
      const date = workout.date;
      
      if (!volumeMap.has(date)) {
        volumeMap.set(date, {
          date,
          totalVolume: 0,
          workoutTypeVolumes: {
            push: 0,
            pull: 0,
            legs: 0,
            arms: 0
          },
          exerciseCount: 0,
          setCount: 0
        });
      }
      
      const entry = volumeMap.get(date)!;
      
      const workoutVolume = workout.exercises.reduce((sum, exercise) => 
        sum + exercise.sets.reduce((setSum, set) => setSum + (set.reps * set.weight), 0), 0
      );
      
      entry.totalVolume += workoutVolume;
      entry.workoutTypeVolumes[workout.workoutType] += workoutVolume;
      entry.exerciseCount += workout.exercises.length;
      entry.setCount += workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    });

    return Array.from(volumeMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [user, workouts, timeRange]);

  const stats = useMemo(() => {
    if (volumeData.length === 0) return null;

    const totalVolume = volumeData.reduce((sum, data) => sum + data.totalVolume, 0);
    const averageVolume = totalVolume / volumeData.length;
    const maxVolume = Math.max(...volumeData.map(data => data.totalVolume));
    const totalWorkouts = volumeData.length;
    
    // Calculate trends (last 30% vs first 30%)
    const trendsLength = Math.max(1, Math.floor(volumeData.length * 0.3));
    const recentData = volumeData.slice(-trendsLength);
    const earliestData = volumeData.slice(0, trendsLength);
    
    const recentAverage = recentData.reduce((sum, data) => sum + data.totalVolume, 0) / recentData.length;
    const earliestAverage = earliestData.reduce((sum, data) => sum + data.totalVolume, 0) / earliestData.length;
    const trend = earliestAverage > 0 ? ((recentAverage - earliestAverage) / earliestAverage) * 100 : 0;

    // Workout type breakdown
    const workoutTypeBreakdown = {
      push: volumeData.reduce((sum, data) => sum + data.workoutTypeVolumes.push, 0),
      pull: volumeData.reduce((sum, data) => sum + data.workoutTypeVolumes.pull, 0),
      legs: volumeData.reduce((sum, data) => sum + data.workoutTypeVolumes.legs, 0),
      arms: volumeData.reduce((sum, data) => sum + data.workoutTypeVolumes.arms, 0)
    };

    return {
      totalVolume,
      averageVolume,
      maxVolume,
      totalWorkouts,
      trend,
      workoutTypeBreakdown
    };
  }, [volumeData]);

  const getWorkoutTypeColor = (type: WorkoutType) => {
    const colors = {
      push: 'bg-red-500',
      pull: 'bg-blue-500',
      legs: 'bg-green-500',
      arms: 'bg-purple-500'
    };
    return colors[type];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTrendColor = (trend: number) => {
    if (trend > 5) return 'text-green-600';
    if (trend > 0) return 'text-blue-600';
    if (trend === 0) return 'text-gray-600';
    return 'text-red-600';
  };

  if (!stats || volumeData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No volume data</h3>
        <p className="text-gray-600">
          No workouts found in the selected time range
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600">Total Volume</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalVolume.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">lbs</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600">Average per Workout</div>
          <div className="text-2xl font-bold text-green-600">
            {Math.round(stats.averageVolume).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">lbs</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600">Best Single Day</div>
          <div className="text-2xl font-bold text-purple-600">
            {stats.maxVolume.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">lbs</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-600">Volume Trend</div>
          <div className={`text-2xl font-bold ${getTrendColor(stats.trend)}`}>
            {stats.trend > 0 ? '+' : ''}{stats.trend.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">recent vs early</div>
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Volume Progression</h3>
        
        {/* Simple bar chart representation */}
        <div className="space-y-3">
          <div className="flex items-end justify-between h-32 gap-1">
            {volumeData.map((data, index) => {
              const height = (data.totalVolume / stats.maxVolume) * 100;
              return (
                <div
                  key={index}
                  className="flex-1 bg-blue-500 rounded-t opacity-70 hover:opacity-100 transition-opacity relative group"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    <div>{formatDate(data.date)}</div>
                    <div>{data.totalVolume.toLocaleString()} lbs</div>
                    <div>{data.exerciseCount} exercises</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-gray-500">
            {volumeData.length > 0 && (
              <>
                <span>{formatDate(volumeData[0].date)}</span>
                <span>{formatDate(volumeData[volumeData.length - 1].date)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Workout Type Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Volume by Workout Type</h3>
        
        <div className="space-y-4">
          {Object.entries(stats.workoutTypeBreakdown)
            .filter(([_, volume]) => volume > 0)
            .sort(([_, a], [__, b]) => (b as number) - (a as number))
            .map(([type, volume]) => {
              const percentage = (volume / stats.totalVolume) * 100;
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${getWorkoutTypeColor(type as WorkoutType)}`}></div>
                      <span className="font-medium capitalize">{type}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {volume.toLocaleString()} lbs ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getWorkoutTypeColor(type as WorkoutType)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Weekly Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-600 mb-2">Workouts per Week</div>
            <div className="text-2xl font-bold text-blue-600">
              {(stats.totalWorkouts / Math.max(1, volumeData.length / 7)).toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Average Weekly Volume</div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(stats.totalVolume / Math.max(1, volumeData.length / 7)).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">lbs</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">Consistency Score</div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.min(100, (stats.totalWorkouts / Math.max(1, volumeData.length / 7)) * 25).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500">based on 4 workouts/week</div>
          </div>
        </div>
      </div>
    </div>
  );
}
