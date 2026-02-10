
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, ComparisonAnalysis, TrendAnalysis } from '../types';

// Helper to safely access environment variables and initialize AI client
const getAI = () => {
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || '';
  return new GoogleGenAI({ apiKey });
};

const MODEL_NAME = "gemini-2.0-flash";

export const analyzeTitle = async (title: string, year: number, description: string): Promise<AIAnalysis> => {
  const ai = getAI();
  const prompt = `Analyze the ${year} title "${title}". Context: ${description}. 
  FrameDecoded Purpose: Explain why it resonates, why it's divisive, what's misunderstood, and its legacy. 
  Rules: Calm, insightful tone. NO recommendations. Return JSON.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          resonance: { type: Type.STRING },
          divisiveness: { type: Type.STRING },
          misunderstandings: { type: Type.STRING },
          legacy: { type: Type.STRING },
        },
        required: ["resonance", "divisiveness", "misunderstandings", "legacy"],
      },
    },
  });

  return JSON.parse(response.text || '{}');
};

export const getTrailerUrl = async (title: string, year: number): Promise<string | null> => {
  const ai = getAI();
  const prompt = `Find the official YouTube trailer for the ${year} film or show "${title}". Search specifically for high-quality official channels.`;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Strategy 1: Look in grounding chunks (most reliable for Google Search tool)
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      for (const chunk of chunks) {
        const uri = chunk.web?.uri;
        if (uri && (uri.includes('youtube.com/watch') || uri.includes('youtu.be/') || uri.includes('youtube.com/live/'))) {
          return uri;
        }
      }
    }

    // Strategy 2: Look in the text output for any link
    const text = response.text || "";
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/i;
    const match = text.match(youtubeRegex);
    if (match) return match[0];

    return null;
  } catch (e) {
    console.error("Gemini Trailer Search Error:", e);
    return null;
  }
};

export const compareTitles = async (title1: string, title2: string): Promise<ComparisonAnalysis> => {
  const ai = getAI();
  const prompt = `Compare "${title1}" and "${title2}". 
  Explain differences in tone, storytelling approach, and audience reception. 
  Rules: Strictly neutral and informational. NO winner, NO recommendation.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tone: { type: Type.STRING },
          storytelling: { type: Type.STRING },
          reception: { type: Type.STRING },
          context: { type: Type.STRING },
        },
        required: ["tone", "storytelling", "reception", "context"],
      },
    },
  });

  return JSON.parse(response.text || '{}');
};

export const analyzeTrend = async (trend: string): Promise<TrendAnalysis> => {
  const ai = getAI();
  const prompt = `Explain the movie/TV trend: "${trend}". 
  Provide historical background, cultural impact, and why it is happening now. 
  Rules: Insightful, editorial tone. Use data-driven reasoning where possible.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          background: { type: Type.STRING },
          impact: { type: Type.STRING },
          whyNow: { type: Type.STRING },
        },
        required: ["background", "impact", "whyNow"],
      },
    },
  });

  return JSON.parse(response.text || '{}');
};

export const askExplainerGemini = async (question: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: question,
    config: {
      systemInstruction: "You are FrameDecoded, a film scholar. Analyze 'why' movies/shows are cultural touchpoints. NEVER recommend what to watch. When discussing a title, ALWAYS try to find and provide its official YouTube trailer URL using your Google Search tool.",
      tools: [{ googleSearch: {} }]
    }
  });

  let output = response.text || "Analysis unavailable.";
  
  // Ensure the link is appended if found but not present in text
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks && !output.toLowerCase().includes('youtube.com') && !output.toLowerCase().includes('youtu.be')) {
    const trailer = chunks.find(c => c.web?.uri?.includes('youtube.com/watch') || c.web?.uri?.includes('youtu.be/') || c.web?.uri?.includes('youtube.com/live/'));
    if (trailer?.web?.uri) {
      output += `\n\nOfficial Trailer Link: ${trailer.web.uri}`;
    }
  }

  return output;
};
