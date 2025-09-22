'use client';

import React, { useState } from 'react';

interface MuscleGroup {
  id: string;
  name: string;
  workoutCount: number;
  lastWorked?: string;
}

interface BodyDiagramProps {
  muscleData: MuscleGroup[];
  onMuscleClick?: (muscleId: string) => void;
  selectedMuscle?: string;
}

export default function BodyDiagram({ muscleData, onMuscleClick, selectedMuscle }: BodyDiagramProps) {
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  const getMuscleIntensity = (muscleId: string) => {
    const muscle = muscleData.find(m => m.id === muscleId);
    if (!muscle || muscle.workoutCount === 0) return 0;
    
    // Scale intensity from 0 to 1 based on workout count (max 20 for full intensity)
    return Math.min(muscle.workoutCount / 20, 1);
  };

  const getMuscleColor = (muscleId: string) => {
    const intensity = getMuscleIntensity(muscleId);
    const isHovered = hoveredMuscle === muscleId;
    const isSelected = selectedMuscle === muscleId;
    
    if (intensity === 0) {
      return isHovered || isSelected ? '#e5e7eb' : '#f3f4f6';
    }
    
    // Use blue gradient for intensity
    const alpha = isHovered || isSelected ? Math.max(intensity + 0.3, 0.8) : intensity;
    return `rgba(59, 130, 246, ${alpha})`;
  };

  const handleMuscleClick = (muscleId: string) => {
    onMuscleClick?.(muscleId);
  };

  const renderMuscleTooltip = (muscleId: string) => {
    const muscle = muscleData.find(m => m.id === muscleId);
    if (!muscle || hoveredMuscle !== muscleId) return null;

    return (
      <div className="absolute bg-black text-white px-2 py-1 rounded text-sm z-50 pointer-events-none">
        <div className="font-semibold">{muscle.name}</div>
        <div>Workouts: {muscle.workoutCount}</div>
        {muscle.lastWorked && <div>Last worked: {muscle.lastWorked}</div>}
      </div>
    );
  };

  return (
    <div className="relative inline-block">
      <svg
        width="300"
        height="400"
        viewBox="0 0 300 400"
        className="border rounded-lg bg-gray-50"
      >
        {/* Head */}
        <ellipse
          cx="150"
          cy="50"
          rx="25"
          ry="30"
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth="2"
        />

        {/* Neck */}
        <rect
          x="140"
          y="75"
          width="20"
          height="15"
          fill={getMuscleColor('neck')}
          stroke="#d1d5db"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onMouseEnter={() => setHoveredMuscle('neck')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('neck')}
        />

        {/* Shoulders */}
        <ellipse
          cx="120"
          cy="100"
          rx="20"
          ry="15"
          fill={getMuscleColor('shoulders')}
          stroke="#d1d5db"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onMouseEnter={() => setHoveredMuscle('shoulders')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('shoulders')}
        />
        <ellipse
          cx="180"
          cy="100"
          rx="20"
          ry="15"
          fill={getMuscleColor('shoulders')}
          stroke="#d1d5db"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onMouseEnter={() => setHoveredMuscle('shoulders')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('shoulders')}
        />

        {/* Arms */}
        <ellipse
          cx="100"
          cy="130"
          rx="15"
          ry="25"
          fill={getMuscleColor('biceps')}
          stroke="#d1d5db"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onMouseEnter={() => setHoveredMuscle('biceps')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('biceps')}
        />
        <ellipse
          cx="200"
          cy="130"
          rx="15"
          ry="25"
          fill={getMuscleColor('biceps')}
          stroke="#d1d5db"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onMouseEnter={() => setHoveredMuscle('biceps')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('biceps')}
        />

        {/* Forearms */}
        <ellipse
          cx="95"
          cy="170"
          rx="12"
          ry="20"
          fill={getMuscleColor('forearms')}
          stroke="#d1d5db"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onMouseEnter={() => setHoveredMuscle('forearms')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('forearms')}
        />
        <ellipse
          cx="205"
          cy="170"
          rx="12"
          ry="20"
          fill={getMuscleColor('forearms')}
          stroke="#d1d5db"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onMouseEnter={() => setHoveredMuscle('forearms')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('forearms')}
        />

        {/* Chest */}
        <ellipse
          cx="150"
          cy="120"
          rx="35"
          ry="25"
          fill={getMuscleColor('chest')}
          stroke="#d1d5db"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onMouseEnter={() => setHoveredMuscle('chest')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('chest')}
        />

        {/* Abs */}
        <rect
          x="130"
          y="145"
          width="40"
          height="50"
          rx="5"
          fill={getMuscleColor('abs')}
          stroke="#d1d5db"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onMouseEnter={() => setHoveredMuscle('abs')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('abs')}
        />

        {/* Back (visible outline) */}
        <ellipse
          cx="150"
          cy="125"
          rx="40"
          ry="30"
          fill="none"
          stroke={getMuscleColor('back')}
          strokeWidth="3"
          strokeDasharray="5,5"
          className="cursor-pointer"
          onMouseEnter={() => setHoveredMuscle('back')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('back')}
        />

        {/* Legs - Quadriceps */}
        <ellipse
          cx="135"
          cy="230"
          rx="18"
          ry="35"
          fill={getMuscleColor('quadriceps')}
          stroke="#d1d5db"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onMouseEnter={() => setHoveredMuscle('quadriceps')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('quadriceps')}
        />
        <ellipse
          cx="165"
          cy="230"
          rx="18"
          ry="35"
          fill={getMuscleColor('quadriceps')}
          stroke="#d1d5db"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onMouseEnter={() => setHoveredMuscle('quadriceps')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('quadriceps')}
        />

        {/* Hamstrings (back of legs - dashed outline) */}
        <ellipse
          cx="135"
          cy="235"
          rx="20"
          ry="40"
          fill="none"
          stroke={getMuscleColor('hamstrings')}
          strokeWidth="2"
          strokeDasharray="3,3"
          className="cursor-pointer"
          onMouseEnter={() => setHoveredMuscle('hamstrings')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('hamstrings')}
        />
        <ellipse
          cx="165"
          cy="235"
          rx="20"
          ry="40"
          fill="none"
          stroke={getMuscleColor('hamstrings')}
          strokeWidth="2"
          strokeDasharray="3,3"
          className="cursor-pointer"
          onMouseEnter={() => setHoveredMuscle('hamstrings')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('hamstrings')}
        />

        {/* Calves */}
        <ellipse
          cx="135"
          cy="310"
          rx="15"
          ry="25"
          fill={getMuscleColor('calves')}
          stroke="#d1d5db"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onMouseEnter={() => setHoveredMuscle('calves')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('calves')}
        />
        <ellipse
          cx="165"
          cy="310"
          rx="15"
          ry="25"
          fill={getMuscleColor('calves')}
          stroke="#d1d5db"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onMouseEnter={() => setHoveredMuscle('calves')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('calves')}
        />

        {/* Glutes */}
        <ellipse
          cx="150"
          cy="200"
          rx="30"
          ry="20"
          fill={getMuscleColor('glutes')}
          stroke="#d1d5db"
          strokeWidth="1"
          className="cursor-pointer transition-colors"
          onMouseEnter={() => setHoveredMuscle('glutes')}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => handleMuscleClick('glutes')}
        />
      </svg>

      {/* Muscle group tooltip */}
      {renderMuscleTooltip(hoveredMuscle!)}

      {/* Legend */}
      <div className="mt-4 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-blue-200 rounded"></div>
          <span>Low activity</span>
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>High activity</span>
        </div>
        <div className="text-xs text-gray-600">
          Click muscle groups to filter workouts
        </div>
      </div>
    </div>
  );
}
