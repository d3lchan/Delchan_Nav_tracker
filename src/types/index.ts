// User types
export type User = 'Nav' | 'Delchan';

// Workout types
export type WorkoutType = 'arms' | 'push' | 'pull' | 'legs';

// Muscle group types - detailed breakdown
export type ChestMuscle = 'chest-upper' | 'chest-middle' | 'chest-lower';
export type BackMuscle = 'lats' | 'rhomboids' | 'traps-middle' | 'traps-lower' | 'rear-delts';
export type ArmsMuscle = 
  | 'biceps-long' | 'biceps-short' | 'brachialis'
  | 'triceps-long' | 'triceps-lateral' | 'triceps-medial'
  | 'forearms-flexors' | 'forearms-extensors';
export type ShoulderMuscle = 'delts-anterior' | 'delts-medial' | 'delts-posterior';
export type LegsMuscle = 
  | 'quads-vastus-lateralis' | 'quads-vastus-medialis' | 'quads-rectus-femoris' | 'quads-vastus-intermedius'
  | 'hamstrings-biceps-femoris' | 'hamstrings-semitendinosus' | 'hamstrings-semimembranosus'
  | 'glutes-maximus' | 'glutes-medius' | 'glutes-minimus'
  | 'calves-gastrocnemius' | 'calves-soleus';

export type MuscleGroup = ChestMuscle | BackMuscle | ArmsMuscle | ShoulderMuscle | LegsMuscle;

// Exercise and set types
export interface ExerciseSet {
  reps: number;
  weight: number;
  rpe?: number; // Rate of Perceived Exertion (1-10)
  notes?: string;
  restTime?: number; // in seconds
}

export interface Exercise {
  name: string;
  muscleGroups: MuscleGroup[];
  sets: ExerciseSet[];
  equipment?: string;
  category?: 'compound' | 'isolation' | 'accessory';
  notes?: string;
}

// Workout session types
export interface WorkoutSession {
  id: string;
  user: User;
  date: string; // YYYY-MM-DD format
  workoutType: WorkoutType;
  exercises: Exercise[];
  duration: number; // in minutes
  notes?: string;
  rating?: number; // 1-10 workout quality rating
  bodyWeight?: number; // optional body weight tracking
}

// Progress tracking types
export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  date: string;
  user: User;
}

export interface ProgressMetrics {
  totalWorkouts: number;
  totalVolume: number; // sets x reps x weight
  averageIntensity: number;
  strengthGains: number;
  consistencyScore: number;
  muscleGroupBalance: Record<string, number>;
}

// Analytics types
export interface WorkoutAnalytics {
  weeklyVolume: number[];
  strengthProgression: { exercise: string; data: { date: string; weight: number }[] }[];
  muscleGroupFrequency: Record<MuscleGroup, number>;
  workoutTypeDistribution: Record<WorkoutType, number>;
  averageWorkoutDuration: number;
  recoveryTime: number; // average days between sessions
}

// UI State types
export interface DashboardState {
  selectedUser: User | null;
  activeWorkoutType: WorkoutType | null;
  dateRange: {
    start: string;
    end: string;
  };
  viewMode: 'overview' | 'detailed' | 'analytics';
}

// Data upload types
export interface DataUploadResponse {
  success: boolean;
  message: string;
  workoutsImported?: number;
  errors?: string[];
}

// Muscle group mapping
export interface MuscleGroupMapping {
  chest: ChestMuscle[];
  back: BackMuscle[];
  arms: ArmsMuscle[];
  shoulders: ShoulderMuscle[];
  legs: LegsMuscle[];
}

// Chart data types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ProgressChartData {
  exercise: string;
  data: ChartDataPoint[];
  color: string;
}

// Body schematic types
export interface BodyPart {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
  coordinates: string; // SVG path coordinates
  color: string;
  intensity: number; // 0-100 for heat mapping
}

// Goal tracking types
export interface Goal {
  id: string;
  user: User;
  type: 'strength' | 'volume' | 'frequency' | 'bodyweight';
  target: number;
  current: number;
  deadline: string;
  description: string;
  achieved: boolean;
}

// Store types for Zustand
export interface AppStore {
  // User state
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Workout data
  workoutSessions: WorkoutSession[];
  addWorkoutSession: (session: WorkoutSession) => void;
  updateWorkoutSession: (id: string, session: Partial<WorkoutSession>) => void;
  deleteWorkoutSession: (id: string) => void;
  
  // Personal records
  personalRecords: PersonalRecord[];
  updatePersonalRecord: (record: PersonalRecord) => void;
  
  // Goals
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  
  // UI state
  dashboardState: DashboardState;
  updateDashboardState: (state: Partial<DashboardState>) => void;
  
  // Data management
  importData: (sessions: WorkoutSession[]) => Promise<DataUploadResponse>;
  exportData: () => WorkoutSession[];
  clearAllData: () => void;
}
