// helpers/openai.js
import { OPENAI_API_KEY } from '@env';

export async function callOpenAI(prompt) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('OpenAI request failed:', error);
    return { error: error.message };
  }
}
