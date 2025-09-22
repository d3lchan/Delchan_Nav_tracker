// Test file for the AI Chat functionality
// You can run this in the browser console or create a proper test file

const testAIChat = async () => {
  const testData = {
    userInput: "I did bench press 3 sets of 10 reps at 135 lbs",
    currentWorkoutData: { exercises: [] },
    conversationStage: "initial",
    user: "Nav"
  };

  try {
    const response = await fetch('/api/analyze-workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('AI Response:', result);
    return result;
  } catch (error) {
    console.error('Error testing AI chat:', error);
  }
};

// Example test cases to try:
const testCases = [
  {
    input: "I did a push workout today",
    stage: "initial",
    description: "Initial workout type mention"
  },
  {
    input: "Bench press 3x10 at 135, shoulder press 3x8 at 40",
    stage: "gathering", 
    description: "Adding exercises with sets/reps/weight"
  },
  {
    input: "That's all, workout took 45 minutes, rate it 8/10",
    stage: "gathering",
    description: "Finalizing workout details"
  },
  {
    input: "Yes, save it",
    stage: "confirming",
    description: "Confirming to save workout"
  }
];

console.log('AI Chat Test Cases:', testCases);
console.log('Run testAIChat() to test the endpoint');

export { testAIChat, testCases };
