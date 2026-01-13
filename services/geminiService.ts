
import { GoogleGenAI, Type } from "@google/genai";
import { Person } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY ausente.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getFamilyInsights = async (residents: Person[]) => {
  if (residents.length === 0) return [];
  
  const ai = getAIClient();
  if (!ai) return [];

  const summary = residents.map(p => 
    `- ${p.name}, ${p.relationship}, Bairro: ${p.neighborhood || 'N/D'}, Nascimento: ${p.birthDate}`
  ).join('\n');

  const prompt = `Como um analista de políticas públicas, examine estes dados demográficos de uma comunidade e forneça 4 insights estratégicos em JSON.
  Categorias sugeridas: Saúde Comunitária, Educação/Juventude, Desenvolvimento Urbano, Perfil Socioeconômico.
  
  Amostra de dados:
  ${summary}
  
  Responda estritamente em Português do Brasil no formato JSON ARRAY [{title, content, category}].`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Flash é mais rápido para dashboards
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ['title', 'content', 'category']
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Insights Error:", error);
    return [];
  }
};
