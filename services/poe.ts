
const POE_API_KEY = '_Z3Mx1FKsVupSDjN7BSlQ5EJG2sqwlDQ2hzQMqpaiuw';
const POE_MODEL = 'GPT-5-nano';
const BASE_URL = 'https://api.poe.com/v1/chat/completions';

export interface PoeAnalysisResponse {
  resonance: string;
  divisiveness: string;
  misunderstandings: string;
  legacy: string;
  trailer_url?: string;
}

export const askPoe = async (question: string): Promise<string> => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POE_API_KEY}`
      },
      body: JSON.stringify({
        model: POE_MODEL,
        messages: [
          {
            role: 'system',
            content: "You are FrameDecoded, a professional film scholar and analyst. Your purpose is to explain and analyze movies and TV shows—never to recommend them. Focus on the 'why': why is it loved, divisive, or culturally significant? \n\nIMPORTANT: Use your web search capabilities to find the official YouTube trailer URL for any titles discussed. Always include a direct YouTube link (e.g., https://www.youtube.com/watch?v=...) clearly in your response. Maintain a calm, intelligent, and unhurried editorial tone."
          },
          {
            role: 'user',
            content: question
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Poe API Error:', errorData);
      throw new Error(`Poe API returned ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "I'm sorry, I couldn't generate an analysis at this moment.";
  } catch (error) {
    console.error('Poe Service Error:', error);
    return "I'm having trouble connecting to my scholarly database. Please try again in a moment.";
  }
};

export const analyzeTitleWithPoe = async (title: string, year: number, description: string): Promise<PoeAnalysisResponse> => {
  try {
    const prompt = `Perform a deep analysis of the ${year} title "${title}".
    Database description: ${description}
    
    Tasks:
    1. Analyze why it resonates with audiences.
    2. Analyze why it is or was divisive.
    3. Identify common misunderstandings.
    4. Discuss its cultural legacy and how it has aged.
    5. CRITICAL: Use web search to find the official, current, and embeddable YouTube trailer for this exact title.
    
    Return your response EXCLUSIVELY in the following JSON format:
    {
      "resonance": "...",
      "divisiveness": "...",
      "misunderstandings": "...",
      "legacy": "...",
      "trailer_url": "https://www.youtube.com/watch?v=..."
    }`;

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${POE_API_KEY}`
      },
      body: JSON.stringify({
        model: POE_MODEL,
        messages: [
          {
            role: 'system',
            content: "You are an AI that provides structured film analysis in JSON. You must use web search to find valid YouTube trailers."
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    return JSON.parse(content || '{}');
  } catch (error) {
    console.error('Poe Analysis Error:', error);
    return {
      resonance: "Analysis unavailable.",
      divisiveness: "Analysis unavailable.",
      misunderstandings: "Analysis unavailable.",
      legacy: "Analysis unavailable.",
    };
  }
};
