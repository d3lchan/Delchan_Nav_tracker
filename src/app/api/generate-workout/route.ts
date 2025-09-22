import { NextRequest, NextResponse } from 'next/server';

interface GenerateWorkoutRequest {
  description: string;
  user: string;
}

interface GenerateWorkoutResponse {
  success: boolean;
  workout?: any;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateWorkoutResponse>> {
  try {
    const { description, user }: GenerateWorkoutRequest = await request.json();

    if (!description || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Description and user are required' 
      }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'API key not configured' 
      }, { status: 500 });
    }

    // Create a detailed prompt for Gemini
    const prompt = `
You are a professional fitness tracker assistant. Convert the following workout description into a structured JSON format.

Workout Description: "${description}"

Please create a JSON object with this exact structure:
{
  "workoutType": "arms" | "push" | "pull" | "legs",
  "date": "${new Date().toISOString().split('T')[0]}",
  "duration": <estimated_duration_in_minutes>,
  "exercises": [
    {
      "name": "<exercise_name>",
      "muscleGroups": ["<muscle_group1>", "<muscle_group2>"],
      "sets": [
        {
          "reps": <number>,
          "weight": <weight_in_kg_or_0_if_bodyweight>
        }
      ]
    }
  ],
  "rating": <estimated_difficulty_1_to_10>,
  "notes": "<any_additional_notes>"
}

Muscle groups should be from: chest-upper, chest-middle, chest-lower, lats, rhomboids, traps-middle, traps-lower, rear-delts, biceps, triceps, forearms, delts-anterior, delts-medial, delts-posterior, quads, hamstrings, glutes, calves, core.

Workout types:
- "arms" for biceps, triceps, forearms focused workouts
- "push" for chest, shoulders, triceps focused workouts  
- "pull" for back, biceps focused workouts
- "legs" for quads, hamstrings, glutes, calves focused workouts

Current date and time: ${new Date().toLocaleString()}

Respond with ONLY the JSON object, no other text.
    `;

    // Make request to Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return NextResponse.json({ 
        success: false, 
        error: `API request failed: ${response.status}` 
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid response from AI' 
      }, { status: 500 });
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    try {
      // Parse the JSON response from Gemini
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
      const workout = JSON.parse(cleanedText);
      
      // Add user and timestamp
      workout.user = user;
      workout.timestamp = new Date().toISOString();
      workout.id = `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return NextResponse.json({ 
        success: true, 
        workout 
      });

    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Generated text:', generatedText);
      
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to parse AI response as JSON' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
