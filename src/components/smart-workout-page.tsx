'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Edit3, MessageCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { LiquidButton } from '@/components/ui/liquid-button';
import { AIWorkoutInput } from '@/components/forms/ai-workout-input';
import { WorkoutForm } from '@/components/forms/workout-form';
import WorkoutChatSimple from '@/components/forms/workout-chat-simple';
import type { WorkoutType, WorkoutSession } from '@/types';

interface SmartWorkoutPageProps {
  user: 'Nav' | 'Delchan';
  defaultWorkoutType?: WorkoutType;
}

export default function SmartWorkoutPage({ user, defaultWorkoutType = 'arms' }: SmartWorkoutPageProps) {
  const router = useRouter();
  const [inputMethod, setInputMethod] = useState<'ai' | 'chat' | 'manual'>('chat');

  const handleWorkoutGenerated = (workout: WorkoutSession) => {
    // Navigate back to user dashboard after successful generation
    setTimeout(() => {
      router.push(`/${user.toLowerCase()}`);
    }, 2000);
  };

  const handleWorkoutSubmitted = () => {
    // Navigate back after manual form submission
    router.push(`/${user.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <LiquidButton
              variant="outline"
              size="sm"
              onClick={() => router.push(`/${user.toLowerCase()}`)}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Dashboard
            </LiquidButton>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Add Workout
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                for {user}
              </p>
            </div>
            
            <div className="w-24" /> {/* Spacer for centering */}
          </div>

          {/* Input Method Toggle */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInputMethod('chat')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                  inputMethod === 'chat'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/20'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">AI Chat</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInputMethod('ai')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                  inputMethod === 'ai'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/20'
                }`}
              >
                <Brain className="w-5 h-5" />
                <span className="font-medium">Quick AI</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInputMethod('manual')}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                  inputMethod === 'manual'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-white/20'
                }`}
              >
                <Edit3 className="w-5 h-5" />
                <span className="font-medium">Manual</span>
              </motion.button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Content */}
        <motion.div
          key={inputMethod}
          initial={{ opacity: 0, x: inputMethod === 'ai' ? -20 : inputMethod === 'chat' ? 0 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {inputMethod === 'chat' ? (
            <WorkoutChatSimple 
              user={user}
              onWorkoutGenerated={handleWorkoutGenerated}
            />
          ) : inputMethod === 'ai' ? (
            <AIWorkoutInput
              user={user}
              onWorkoutGenerated={handleWorkoutGenerated}
              className="max-w-2xl mx-auto"
            />
          ) : (
            <WorkoutForm
              workoutType={defaultWorkoutType}
              onSubmit={handleWorkoutSubmitted}
              onCancel={() => router.push(`/${user.toLowerCase()}`)}
            />
          )}
        </motion.div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid md:grid-cols-3 gap-6"
        >
          <GlassCard className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                AI Chat Assistant
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Have a conversation with AI to log your workout step by step
              </p>
              <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                <li>💬 Interactive conversation</li>
                <li>❓ Asks follow-up questions</li>
                <li>✅ Confirms all details</li>
                <li>🔄 Handles missing info</li>
              </ul>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Quick AI Generator
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Describe your workout and get instant structured data
              </p>
              <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                <li>✨ Natural language input</li>
                <li>🤖 Intelligent recognition</li>
                <li>📊 Auto-categorization</li>
                <li>⚡ Super fast entry</li>
              </ul>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Manual Entry
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Full control over every detail with comprehensive forms
              </p>
              <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                <li>🎯 Precise control</li>
                <li>📝 Detailed customization</li>
                <li>🔢 Exact set/rep tracking</li>
                <li>💪 Exercise library</li>
              </ul>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
