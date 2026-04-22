import Groq from 'groq-sdk';

const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export const groq = new Groq({
  apiKey: apiKey || 'dummy-key-for-build',
});
