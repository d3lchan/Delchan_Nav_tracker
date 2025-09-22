# Gemini AI Integration Setup Guide

## Getting Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

## Development Setup

1. Update your `.env.local` file with your actual API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

## Production Deployment on Vercel

### Option 1: Vercel Dashboard
1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Settings → Environment Variables
3. Add new variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your actual API key
   - **Environments**: Production, Preview, Development
4. Redeploy your application

### Option 2: Vercel CLI
```bash
# Set environment variable
vercel env add GEMINI_API_KEY

# When prompted:
# - Enter your API key as the value
# - Select Production, Preview, Development environments

# Redeploy
vercel --prod
```

## How It Works

### AI Workout Generation Flow:
1. **User Input**: User describes their workout in natural language
2. **API Request**: Frontend sends description to `/api/generate-workout`
3. **Gemini Processing**: Backend uses Gemini 2.0 Flash to structure the data
4. **JSON Response**: AI returns structured workout JSON
5. **Data Storage**: Workout is automatically saved to Zustand store
6. **Auto-timestamping**: Date, time, and unique ID are automatically added

### Example Usage:
**User Input**: 
"Did 3 sets of 10 push-ups, 4 sets of 8 pull-ups with 20kg assistance, and finished with 50 burpees. Took about 45 minutes and felt challenging."

**Generated JSON**:
```json
{
  "workoutType": "push",
  "date": "2025-09-22",
  "duration": 45,
  "exercises": [
    {
      "name": "Push-ups",
      "muscleGroups": ["chest-middle", "triceps"],
      "sets": [
        {"reps": 10, "weight": 0},
        {"reps": 10, "weight": 0},
        {"reps": 10, "weight": 0}
      ]
    },
    {
      "name": "Pull-ups",
      "muscleGroups": ["lats", "biceps"],
      "sets": [
        {"reps": 8, "weight": 20},
        {"reps": 8, "weight": 20},
        {"reps": 8, "weight": 20},
        {"reps": 8, "weight": 20}
      ]
    },
    {
      "name": "Burpees",
      "muscleGroups": ["core", "legs"],
      "sets": [{"reps": 50, "weight": 0}]
    }
  ],
  "rating": 7,
  "notes": "Challenging workout",
  "user": "Nav",
  "timestamp": "2025-09-22T10:30:00.000Z",
  "id": "workout_1727012345_abc123"
}
```

## Features

### Smart Recognition:
- ✅ **Exercise Names**: Recognizes common gym exercises
- ✅ **Sets & Reps**: Extracts repetition and set data
- ✅ **Weights**: Identifies weights in kg/lbs
- ✅ **Workout Type**: Auto-categorizes (arms/push/pull/legs)
- ✅ **Duration**: Estimates or uses provided time
- ✅ **Muscle Groups**: Maps exercises to specific muscles
- ✅ **Difficulty Rating**: Estimates workout intensity

### Fallback Options:
- Manual form entry still available
- Toggle between AI and manual input
- Error handling for API failures
- Offline-friendly manual backup

## Security Notes

- ✅ API key is server-side only (never exposed to frontend)
- ✅ Environment variables are properly secured
- ✅ Input validation and sanitization
- ✅ Rate limiting through Gemini API
- ✅ Error handling prevents data leaks

## Cost Management

- Gemini API has generous free tier
- Requests are optimized for efficiency
- Caching could be added for repeated queries
- Manual fallback prevents vendor lock-in

## Testing

Test the AI generation with various inputs:
- Simple: "10 push-ups"
- Complex: "3x8 bench press 80kg, 4x12 lat pulldowns 60kg, 2x15 dips"
- Time-based: "45 minute leg session with squats and deadlifts"
- Descriptive: "Upper body pump session, felt amazing, 8/10 difficulty"
