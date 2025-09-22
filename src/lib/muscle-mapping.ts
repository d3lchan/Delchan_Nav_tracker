import type { MuscleGroupMapping, WorkoutType, MuscleGroup } from '@/types';

export const muscleGroupMapping: MuscleGroupMapping = {
  chest: ['chest-upper', 'chest-middle', 'chest-lower'],
  back: ['lats', 'rhomboids', 'traps-middle', 'traps-lower', 'rear-delts'],
  arms: [
    'biceps-long', 'biceps-short', 'brachialis',
    'triceps-long', 'triceps-lateral', 'triceps-medial',
    'forearms-flexors', 'forearms-extensors'
  ],
  shoulders: ['delts-anterior', 'delts-medial', 'delts-posterior'],
  legs: [
    'quads-vastus-lateralis', 'quads-vastus-medialis', 'quads-rectus-femoris', 'quads-vastus-intermedius',
    'hamstrings-biceps-femoris', 'hamstrings-semitendinosus', 'hamstrings-semimembranosus',
    'glutes-maximus', 'glutes-medius', 'glutes-minimus',
    'calves-gastrocnemius', 'calves-soleus'
  ]
};

export const workoutTypeMuscleGroups: Record<WorkoutType, MuscleGroup[]> = {
  arms: [
    'biceps-long', 'biceps-short', 'brachialis',
    'triceps-long', 'triceps-lateral', 'triceps-medial',
    'forearms-flexors', 'forearms-extensors'
  ],
  push: [
    'chest-upper', 'chest-middle', 'chest-lower',
    'delts-anterior', 'delts-medial', 'delts-posterior',
    'triceps-long', 'triceps-lateral', 'triceps-medial'
  ],
  pull: [
    'lats', 'rhomboids', 'traps-middle', 'traps-lower', 'rear-delts',
    'biceps-long', 'biceps-short', 'brachialis',
    'delts-posterior'
  ],
  legs: [
    'quads-vastus-lateralis', 'quads-vastus-medialis', 'quads-rectus-femoris', 'quads-vastus-intermedius',
    'hamstrings-biceps-femoris', 'hamstrings-semitendinosus', 'hamstrings-semimembranosus',
    'glutes-maximus', 'glutes-medius', 'glutes-minimus',
    'calves-gastrocnemius', 'calves-soleus'
  ]
};

export const muscleGroupLabels: Record<MuscleGroup, string> = {
  // Chest
  'chest-upper': 'Upper Chest',
  'chest-middle': 'Middle Chest',
  'chest-lower': 'Lower Chest',
  
  // Back
  'lats': 'Latissimus Dorsi',
  'rhomboids': 'Rhomboids',
  'traps-middle': 'Middle Traps',
  'traps-lower': 'Lower Traps',
  'rear-delts': 'Rear Deltoids',
  
  // Arms
  'biceps-long': 'Biceps Long Head',
  'biceps-short': 'Biceps Short Head',
  'brachialis': 'Brachialis',
  'triceps-long': 'Triceps Long Head',
  'triceps-lateral': 'Triceps Lateral Head',
  'triceps-medial': 'Triceps Medial Head',
  'forearms-flexors': 'Forearm Flexors',
  'forearms-extensors': 'Forearm Extensors',
  
  // Shoulders
  'delts-anterior': 'Anterior Deltoid',
  'delts-medial': 'Medial Deltoid',
  'delts-posterior': 'Posterior Deltoid',
  
  // Legs
  'quads-vastus-lateralis': 'Vastus Lateralis',
  'quads-vastus-medialis': 'Vastus Medialis',
  'quads-rectus-femoris': 'Rectus Femoris',
  'quads-vastus-intermedius': 'Vastus Intermedius',
  'hamstrings-biceps-femoris': 'Biceps Femoris',
  'hamstrings-semitendinosus': 'Semitendinosus',
  'hamstrings-semimembranosus': 'Semimembranosus',
  'glutes-maximus': 'Gluteus Maximus',
  'glutes-medius': 'Gluteus Medius',
  'glutes-minimus': 'Gluteus Minimus',
  'calves-gastrocnemius': 'Gastrocnemius',
  'calves-soleus': 'Soleus'
};

export const workoutTypeLabels: Record<WorkoutType, string> = {
  arms: 'Arms Day',
  push: 'Push Day',
  pull: 'Pull Day',
  legs: 'Legs Day'
};

export const workoutTypeColors: Record<WorkoutType, string> = {
  arms: '#3B82F6', // Blue
  push: '#10B981', // Green
  pull: '#8B5CF6', // Purple
  legs: '#F59E0B'  // Orange
};

export const muscleGroupColors: Record<MuscleGroup, string> = {
  // Chest - Blues
  'chest-upper': '#60A5FA',
  'chest-middle': '#3B82F6',
  'chest-lower': '#2563EB',
  
  // Back - Purples
  'lats': '#A78BFA',
  'rhomboids': '#8B5CF6',
  'traps-middle': '#7C3AED',
  'traps-lower': '#6D28D9',
  'rear-delts': '#5B21B6',
  
  // Arms - Greens
  'biceps-long': '#34D399',
  'biceps-short': '#10B981',
  'brachialis': '#059669',
  'triceps-long': '#047857',
  'triceps-lateral': '#065F46',
  'triceps-medial': '#064E3B',
  'forearms-flexors': '#6EE7B7',
  'forearms-extensors': '#A7F3D0',
  
  // Shoulders - Oranges
  'delts-anterior': '#FB923C',
  'delts-medial': '#F59E0B',
  'delts-posterior': '#D97706',
  
  // Legs - Reds/Pinks
  'quads-vastus-lateralis': '#F87171',
  'quads-vastus-medialis': '#EF4444',
  'quads-rectus-femoris': '#DC2626',
  'quads-vastus-intermedius': '#B91C1C',
  'hamstrings-biceps-femoris': '#EC4899',
  'hamstrings-semitendinosus': '#DB2777',
  'hamstrings-semimembranosus': '#BE185D',
  'glutes-maximus': '#9D174D',
  'glutes-medius': '#831843',
  'glutes-minimus': '#701A75',
  'calves-gastrocnemius': '#F472B6',
  'calves-soleus': '#F9A8D4'
};

// Utility functions
export function getMuscleGroupsByWorkoutType(workoutType: WorkoutType): MuscleGroup[] {
  return workoutTypeMuscleGroups[workoutType] || [];
}

export function getMuscleGroupLabel(muscleGroup: MuscleGroup): string {
  return muscleGroupLabels[muscleGroup] || muscleGroup;
}

export function getMuscleGroupColor(muscleGroup: MuscleGroup): string {
  return muscleGroupColors[muscleGroup] || '#6B7280';
}

export function getWorkoutTypeLabel(workoutType: WorkoutType): string {
  return workoutTypeLabels[workoutType] || workoutType;
}

export function getWorkoutTypeColor(workoutType: WorkoutType): string {
  return workoutTypeColors[workoutType] || '#6B7280';
}

export function getAllMuscleGroups(): MuscleGroup[] {
  return Object.values(muscleGroupMapping).flat();
}

export function getMuscleGroupCategory(muscleGroup: MuscleGroup): keyof MuscleGroupMapping {
  for (const [category, muscles] of Object.entries(muscleGroupMapping)) {
    if (muscles.includes(muscleGroup)) {
      return category as keyof MuscleGroupMapping;
    }
  }
  return 'arms'; // fallback
}

export function getWorkoutTypeMuscleGroups(workoutType: WorkoutType): MuscleGroup[] {
  return workoutTypeMuscleGroups[workoutType] || [];
}
