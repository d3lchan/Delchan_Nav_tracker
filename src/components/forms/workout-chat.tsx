'use client';

import React, { useState, useRef, useEffect } from 'react';
import { WorkoutSession, WorkoutType, User } from '@/types';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface WorkoutChatProps {
  user: User;
  onWorkoutGenerated: (workout: WorkoutSession) => void;
}

interface WorkoutData {
  workoutType?: WorkoutType;
  exercises: Array<{
    name: string;
    sets: Array<{
      reps: number;
      weight: number;
      rpe?: number;
    }>;
  }>;
  duration?: number;
  notes?: string;
  rating?: number;
  date?: string;
}

export default function WorkoutChat({ user, onWorkoutGenerated }: WorkoutChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hey ${user}! 👋 I'm here to help you log your workout. Just tell me about your session - what exercises did you do, how many sets and reps, weights used, etc. I'll ask for any missing details!`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [workoutData, setWorkoutData] = useState<WorkoutData>({ exercises: [] });
  const [conversationStage, setConversationStage] = useState<'initial' | 'gathering' | 'confirming' | 'complete'>('initial');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: 'user' | 'ai', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const analyzeWorkoutInput = async (userInput: string): Promise<string> => {
    try {
      const response = await fetch('/api/analyze-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput,
          currentWorkoutData: workoutData,
          conversationStage,
          user
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze workout');
      }

      const data = await response.json();
      
      // Update workout data if provided
      if (data.workoutData) {
        setWorkoutData(prev => ({
          ...prev,
          ...data.workoutData,
          exercises: data.workoutData.exercises || prev.exercises
        }));
      }

      // Update conversation stage
      if (data.stage) {
        setConversationStage(data.stage);
      }

      // If workout is complete, generate the final JSON
      if (data.stage === 'complete' && data.finalWorkout) {
        const finalWorkout: WorkoutSession = {
          id: `workout-${Date.now()}`,
          user,
          date: data.finalWorkout.date || new Date().toISOString().split('T')[0],
          workoutType: data.finalWorkout.workoutType,
          exercises: data.finalWorkout.exercises,
          duration: data.finalWorkout.duration || 60,
          notes: data.finalWorkout.notes,
          rating: data.finalWorkout.rating
        };
        
        setTimeout(() => {
          onWorkoutGenerated(finalWorkout);
        }, 1000);
      }

      return data.response;
    } catch (error) {
      console.error('Error analyzing workout:', error);
      return "Sorry, I'm having trouble processing that. Could you try rephrasing your workout details?";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const aiResponse = await analyzeWorkoutInput(userMessage);
      addMessage('ai', aiResponse);
    } catch (error) {
      addMessage('ai', "Sorry, I encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: `Hey ${user}! 👋 I'm here to help you log your workout. Just tell me about your session - what exercises did you do, how many sets and reps, weights used, etc. I'll ask for any missing details!`,
        timestamp: new Date()
      }
    ]);
    setWorkoutData({ exercises: [] });
    setConversationStage('initial');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Workout Assistant</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
              {conversationStage !== 'initial' && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {conversationStage === 'gathering' && 'Collecting details'}
                  {conversationStage === 'confirming' && 'Confirming workout'}
                  {conversationStage === 'complete' && 'Workout ready!'}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="text-gray-400 hover:text-gray-600 p-1"
          title="Clear chat"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${
              message.type === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-900'
            } rounded-lg px-4 py-2`}>
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-1 ${
                message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-gray-600 text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Current Workout Data Preview */}
      {workoutData.exercises.length > 0 && (
        <div className="border-t bg-gray-50 p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Current Workout Progress:</div>
          <div className="flex flex-wrap gap-2">
            {workoutData.workoutType && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {workoutData.workoutType}
              </span>
            )}
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
              {workoutData.exercises.length} exercise(s)
            </span>
            {workoutData.duration && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                {workoutData.duration} min
              </span>
            )}
            {workoutData.rating && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                ★ {workoutData.rating}/10
              </span>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me about your workout..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-3">
          {conversationStage === 'initial' && (
            <>
              <button
                type="button"
                onClick={() => setInput("I did a push workout today")}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full"
              >
                Push workout
              </button>
              <button
                type="button"
                onClick={() => setInput("I did pull exercises")}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full"
              >
                Pull workout
              </button>
              <button
                type="button"
                onClick={() => setInput("I trained legs today")}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full"
              >
                Leg workout
              </button>
            </>
          )}
          {conversationStage === 'gathering' && (
            <>
              <button
                type="button"
                onClick={() => setInput("That's all the exercises")}
                className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-full"
              >
                Finished listing exercises
              </button>
              <button
                type="button"
                onClick={() => setInput("The workout took about 60 minutes")}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-full"
              >
                Add duration
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
