'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { LiquidButton } from '@/components/ui/liquid-button';
import { useAppStore } from '@/store';
import type { User, WorkoutSession } from '@/types';

interface AIWorkoutInputProps {
  user: User;
  onWorkoutGenerated?: (workout: WorkoutSession) => void;
  className?: string;
}

export function AIWorkoutInput({ user, onWorkoutGenerated, className }: AIWorkoutInputProps) {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  const addWorkoutSession = useAppStore(state => state.addWorkoutSession);

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setIsGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          user,
        }),
      });

      const data = await response.json();

      if (data.success && data.workout) {
        // Add to store
        addWorkoutSession(data.workout);
        
        // Call callback if provided
        onWorkoutGenerated?.(data.workout);
        
        setResult({
          type: 'success',
          message: `✨ Generated ${data.workout.exercises.length} exercises for your ${data.workout.workoutType} workout!`
        });
        
        // Clear description after successful generation
        setDescription('');
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Failed to generate workout'
        });
      }
    } catch (error) {
      console.error('Error generating workout:', error);
      setResult({
        type: 'error',
        message: 'Failed to connect to AI service'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <GlassCard className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Workout Generator
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Describe what you did and I'll create the workout JSON automatically
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your workout... e.g., 'Did 3 sets of 10 push-ups, 4 sets of 8 pull-ups with 20kg, and finished with 100 burpees'"
              className="w-full h-24 px-4 py-3 bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent backdrop-blur-sm"
              disabled={isGenerating}
            />
            
            {/* Character counter */}
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {description.length}/500
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end">
            <LiquidButton
              onClick={handleGenerate}
              disabled={!description.trim() || isGenerating}
              className="px-6 py-2"
            >
              {isGenerating ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Generate Workout</span>
                </div>
              )}
            </LiquidButton>
          </div>
        </div>

        {/* Result Messages */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-xl border ${
                result.type === 'success'
                  ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-300'
                  : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                {result.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                )}
                <p className="text-sm">{result.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pro Tips */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            💡 Pro Tips for Better Results:
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Include exercise names, sets, reps, and weights</li>
            <li>• Mention workout duration if known</li>
            <li>• Add any notes about difficulty or feeling</li>
            <li>• Example: "3x8 bench press 80kg, 4x12 lat pulldowns 60kg, felt great!"</li>
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}
