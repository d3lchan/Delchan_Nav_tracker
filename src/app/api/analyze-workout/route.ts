import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface WorkoutData {
  workoutType?: string;
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

interface AnalysisRequest {
  userInput: string;
  currentWorkoutData: WorkoutData;
  conversationStage: 'initial' | 'gathering' | 'confirming' | 'complete';
  user: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userInput, currentWorkoutData, conversationStage, user }: AnalysisRequest = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Build the context for the AI
    const systemPrompt = `You are a helpful workout logging assistant for ${user}. Your job is to have a conversation with the user to gather complete workout information and then generate a structured workout JSON.

CURRENT CONVERSATION STAGE: ${conversationStage}

CURRENT WORKOUT DATA:
${JSON.stringify(currentWorkoutData, null, 2)}

INSTRUCTIONS:
1. Be conversational and friendly
2. If this is the initial stage, analyze their input for workout details
3. If information is missing, ask specific follow-up questions
4. When you have enough information, confirm the details
5. Finally, generate the complete workout JSON

WORKOUT DATA STRUCTURE NEEDED:
- workoutType: "push" | "pull" | "legs" | "arms"
- exercises: Array of exercises with name and sets (reps, weight, optional rpe)
- duration: number in minutes
- notes: optional string
- rating: optional number 1-10
- date: today's date if not specified

RESPONSE FORMAT:
Always respond with a JSON object containing:
{
  "response": "Your conversational response to the user",
  "workoutData": { updated workout data object or null },
  "stage": "initial" | "gathering" | "confirming" | "complete",
  "finalWorkout": { complete workout object when stage is "complete" or null }
}

EXAMPLE RESPONSES:

If user says "I did bench press 3 sets of 10 reps at 135 lbs":
{
  "response": "Great! I've got bench press - 3 sets of 10 reps at 135 lbs. What other exercises did you do today? Also, what type of workout was this - push, pull, legs, or arms?",
  "workoutData": {
    "exercises": [{"name": "Bench Press", "sets": [{"reps": 10, "weight": 135}, {"reps": 10, "weight": 135}, {"reps": 10, "weight": 135}]}]
  },
  "stage": "gathering",
  "finalWorkout": null
}

If user confirms they're done and you have all info:
{
  "response": "Perfect! I've logged your push workout with 3 exercises totaling 45 minutes. Your workout has been saved! 🎉",
  "workoutData": null,
  "stage": "complete",
  "finalWorkout": { complete workout object }
}

Be natural and helpful in your responses!`;

    const prompt = `${systemPrompt}

USER INPUT: "${userInput}"

Please analyze this input and respond appropriately.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Try to parse the JSON response
    let parsedResponse;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', responseText);
      // Fallback response
      parsedResponse = {
        response: "I understand you want to log your workout. Could you tell me more details about the exercises you did, including sets, reps, and weights?",
        workoutData: null,
        stage: conversationStage === 'initial' ? 'gathering' : conversationStage,
        finalWorkout: null
      };
    }

    // Validate and clean the response
    const cleanResponse = {
      response: parsedResponse.response || "Could you provide more details about your workout?",
      workoutData: parsedResponse.workoutData || null,
      stage: parsedResponse.stage || conversationStage,
      finalWorkout: parsedResponse.finalWorkout || null
    };

    return NextResponse.json(cleanResponse);

  } catch (error) {
    console.error('Error in workout analysis:', error);
    return NextResponse.json(
      { 
        response: "I'm having trouble processing that right now. Could you try describing your workout again?",
        workoutData: null,
        stage: 'gathering',
        finalWorkout: null
      },
      { status: 200 } // Return 200 to avoid breaking the chat flow
    );
  }
}
