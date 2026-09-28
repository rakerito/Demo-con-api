import axios from "axios";

// Tavily Search API client used to generate contextual follow-up questions.

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || "";
const TAVILY_BASE_URL = "https://api.tavily.com";

interface TavilyResponse {
  answer?: string;
}

/** Uses Tavily's generated search answer to ask one focused shopping question. */
export async function askTavilyForNextQuestion(
  conversation: string,
  focus: string
): Promise<string | null> {
  if (!TAVILY_API_KEY) return null;

  try {
    const response = await axios.post<TavilyResponse>(
      `${TAVILY_BASE_URL}/search`,
      {
        api_key: TAVILY_API_KEY,
        query: [
          "Actúa como asesor de compra de tecnología en México.",
          "Haz una sola pregunta breve en español y no recomiendes productos todavía.",
          `Necesitas averiguar lo siguiente: ${focus}.`,
          "No repitas datos que el usuario ya haya dicho.",
          `Conversación: ${conversation}`,
          "Devuelve únicamente la pregunta, empezando con ¿ y terminando con ?.",
        ].join("\n"),
        search_depth: "basic",
        include_answer: "basic",
        include_raw_content: false,
        max_results: 3,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 12000,
      }
    );

    const answer = (response.data.answer || "").replace(/\s+/g, " ");
    const question = answer.match(/¿[^?]{4,240}\?/)?.[0]?.trim();
    return question || null;
  } catch (error) {
    const errorCode = axios.isAxiosError(error)
      ? error.response?.status ?? error.code
      : "Unknown error";
    console.error("[Tavily] Assistant error:", errorCode);
    return null;
  }
}
