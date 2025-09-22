'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useMemo } from 'react';
import type { 
  AppStore, 
  User, 
  WorkoutSession, 
  PersonalRecord, 
  Goal, 
  DashboardState,
  DataUploadResponse 
} from '@/types';
import { generateId, getDateRange } from '@/lib/utils';

const initialDashboardState: DashboardState = {
  selectedUser: null,
  activeWorkoutType: null,
  dateRange: getDateRange(30), // Last 30 days
  viewMode: 'overview'
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // User state
      currentUser: null,
      setCurrentUser: (user: User | null) => {
        set({ currentUser: user });
        if (user) {
          set({
            dashboardState: {
              ...get().dashboardState,
              selectedUser: user
            }
          });
        }
      },

      // Workout data
      workoutSessions: [],
      addWorkoutSession: (session: WorkoutSession) => {
        const sessionWithId = { ...session, id: session.id || generateId() };
        set(state => ({
          workoutSessions: [...state.workoutSessions, sessionWithId]
        }));
        
        // Update personal records if applicable
        session.exercises.forEach(exercise => {
          exercise.sets.forEach(set => {
            const existingPR = get().personalRecords.find(
              pr => pr.exerciseName === exercise.name && pr.user === session.user
            );
            
            if (!existingPR || set.weight > existingPR.weight || 
                (set.weight === existingPR.weight && set.reps > existingPR.reps)) {
              get().updatePersonalRecord({
                exerciseName: exercise.name,
                weight: set.weight,
                reps: set.reps,
                date: session.date,
                user: session.user
              });
            }
          });
        });
      },

      updateWorkoutSession: (id: string, updates: Partial<WorkoutSession>) => {
        set(state => ({
          workoutSessions: state.workoutSessions.map(session =>
            session.id === id ? { ...session, ...updates } : session
          )
        }));
      },

      deleteWorkoutSession: (id: string) => {
        set(state => ({
          workoutSessions: state.workoutSessions.filter(session => session.id !== id)
        }));
      },

      // Personal records
      personalRecords: [],
      updatePersonalRecord: (record: PersonalRecord) => {
        set(state => {
          const existingIndex = state.personalRecords.findIndex(
            pr => pr.exerciseName === record.exerciseName && pr.user === record.user
          );
          
          if (existingIndex >= 0) {
            const updated = [...state.personalRecords];
            updated[existingIndex] = record;
            return { personalRecords: updated };
          } else {
            return { personalRecords: [...state.personalRecords, record] };
          }
        });
      },

      // Goals
      goals: [],
      addGoal: (goal: Goal) => {
        set(state => ({
          goals: [...state.goals, goal]
        }));
      },

      updateGoal: (id: string, updates: Partial<Goal>) => {
        set(state => ({
          goals: state.goals.map(goal =>
            goal.id === id ? { ...goal, ...updates } : goal
          )
        }));
      },

      // UI state
      dashboardState: initialDashboardState,
      updateDashboardState: (updates: Partial<DashboardState>) => {
        set(state => ({
          dashboardState: { ...state.dashboardState, ...updates }
        }));
      },

      // Data management
      importData: async (sessions: WorkoutSession[]): Promise<DataUploadResponse> => {
        try {
          const validSessions = sessions.filter(session => 
            session.user && session.date && session.exercises && session.exercises.length > 0
          );

          if (validSessions.length === 0) {
            return {
              success: false,
              message: 'No valid workout sessions found in the uploaded data.',
              errors: ['Invalid data format']
            };
          }

          // Add IDs to sessions that don't have them
          const sessionsWithIds = validSessions.map(session => ({
            ...session,
            id: session.id || generateId()
          }));

          set(state => ({
            workoutSessions: [...state.workoutSessions, ...sessionsWithIds]
          }));

          return {
            success: true,
            message: `Successfully imported ${validSessions.length} workout sessions.`,
            workoutsImported: validSessions.length
          };
        } catch (error) {
          return {
            success: false,
            message: 'Failed to import data. Please check the file format.',
            errors: [error instanceof Error ? error.message : 'Unknown error']
          };
        }
      },

      exportData: () => {
        return get().workoutSessions;
      },

      clearAllData: () => {
        set({
          workoutSessions: [],
          personalRecords: [],
          goals: [],
          dashboardState: initialDashboardState
        });
      }
    }),
    {
      name: 'gym-tracker-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        workoutSessions: state.workoutSessions,
        personalRecords: state.personalRecords,
        goals: state.goals,
        currentUser: state.currentUser,
        dashboardState: state.dashboardState
      })
    }
  )
);

// Selectors for better performance
export const useCurrentUser = () => useAppStore(state => state.currentUser);
export const useWorkoutSessions = () => useAppStore(state => state.workoutSessions);
export const usePersonalRecords = () => useAppStore(state => state.personalRecords);
export const useGoals = () => useAppStore(state => state.goals);
export const useDashboardState = () => useAppStore(state => state.dashboardState);

// Computed selectors with proper memoization
export const useUserWorkouts = (user: User) => {
  const workoutSessions = useAppStore(state => state.workoutSessions);
  return useMemo(
    () => workoutSessions.filter(session => session.user === user),
    [workoutSessions, user]
  );
};

export const useUserPersonalRecords = (user: User) => {
  const personalRecords = useAppStore(state => state.personalRecords);
  return useMemo(
    () => personalRecords.filter(record => record.user === user),
    [personalRecords, user]
  );
};

export const useUserGoals = (user: User) => {
  const goals = useAppStore(state => state.goals);
  return useMemo(
    () => goals.filter(goal => goal.user === user),
    [goals, user]
  );
};
