import { OPENAI_API_KEY } from '@env';
import { OPENAI_API_KEY } from '@env';

export async function analyzeINR(inrReading, mealLog) {
  const prompt = `
You are an INR monitoring assistant helping someone on warfarin.
Analyze the following:
- INR reading: ${inrReading}
- Meal log: ${mealLog.map(m => `${m.time}: ${m.foodName} (${m.nutrients.vitaminK} µg vitamin K)`).join('\n')}

Determine if any foods may have caused INR to increase or decrease. Highlight vitamin K risks or stabilizers.
Respond in a friendly and medically informed tone with advice on what to adjust, if anything.
  `;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
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

    const data = await res.json();
    return data.choices?.[0]?.message?.content;
  } catch (error) {
    console.error('INR Analyzer error:', error);
    return 'An error occurred while analyzing INR.';
  }
}
