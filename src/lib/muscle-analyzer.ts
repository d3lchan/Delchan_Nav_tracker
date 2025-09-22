import { WorkoutSession, Exercise, ExerciseSet } from '@/types';

export interface MuscleGroupData {
  id: string;
  name: string;
  workoutCount: number;
  totalVolume: number;
  lastWorked?: string;
  exercises: string[];
}

export const MUSCLE_GROUPS = {
  chest: ['chest', 'pectorals', 'pecs'],
  back: ['back', 'lats', 'latissimus', 'rhomboids', 'traps', 'trapezius'],
  shoulders: ['shoulders', 'delts', 'deltoids'],
  biceps: ['biceps', 'bicep'],
  triceps: ['triceps', 'tricep'],
  forearms: ['forearms', 'forearm'],
  abs: ['abs', 'core', 'abdominals'],
  quadriceps: ['quadriceps', 'quads', 'quad'],
  hamstrings: ['hamstrings', 'hamstring'],
  glutes: ['glutes', 'glute', 'buttocks'],
  calves: ['calves', 'calf'],
  neck: ['neck']
};

export function analyzeMuscleGroups(workouts: WorkoutSession[]): MuscleGroupData[] {
  const muscleData: { [key: string]: MuscleGroupData } = {};

  // Initialize all muscle groups
  Object.keys(MUSCLE_GROUPS).forEach(muscleId => {
    muscleData[muscleId] = {
      id: muscleId,
      name: muscleId.charAt(0).toUpperCase() + muscleId.slice(1),
      workoutCount: 0,
      totalVolume: 0,
      exercises: []
    };
  });

  // Process each workout
  workouts.forEach(workout => {
    const workoutDate = new Date(workout.date).toLocaleDateString();
    
    workout.exercises.forEach((exercise: Exercise) => {
      const exerciseName = exercise.name.toLowerCase();
      
      // Check which muscle groups this exercise targets
      Object.entries(MUSCLE_GROUPS).forEach(([muscleId, keywords]) => {
        const isTargeted = keywords.some(keyword => 
          exerciseName.includes(keyword.toLowerCase())
        );
        
        if (isTargeted) {
          const muscle = muscleData[muscleId];
          muscle.workoutCount++;
          
          // Calculate volume (sets × reps × weight)
          exercise.sets.forEach((set: ExerciseSet) => {
            if (set.reps && set.weight) {
              muscle.totalVolume += set.reps * set.weight;
            }
          });
          
          // Update last worked date
          if (!muscle.lastWorked || new Date(workout.date) > new Date(muscle.lastWorked)) {
            muscle.lastWorked = workoutDate;
          }
          
          // Add exercise to list (avoid duplicates)
          if (!muscle.exercises.includes(exercise.name)) {
            muscle.exercises.push(exercise.name);
          }
        }
      });
    });
  });

  return Object.values(muscleData);
}

export function getMuscleGroupWorkouts(workouts: WorkoutSession[], muscleGroupId: string): WorkoutSession[] {
  const keywords = MUSCLE_GROUPS[muscleGroupId as keyof typeof MUSCLE_GROUPS] || [];
  
  return workouts.filter(workout => 
    workout.exercises.some((exercise: Exercise) =>
      keywords.some(keyword =>
        exercise.name.toLowerCase().includes(keyword.toLowerCase())
      )
    )
  );
}
