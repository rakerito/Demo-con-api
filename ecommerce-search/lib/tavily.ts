import axios from "axios";
import { ExternalOffer } from "@/types";

// ─── Tavily Search API Client ─────────────────────────────────────────────────
// Tavily is a search engine built for AI agents — returns clean, structured results.

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || "";
const TAVILY_BASE_URL = "https://api.tavily.com";

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string;
}

interface TavilyResponse {
  results: TavilyResult[];
  answer?: string;
}

/**
 * Searches Tavily for product listings from e-commerce and retail suppliers.
 * Returns raw results — caller is responsible for scoring & anonymising.
 */
export async function searchTavily(query: string): Promise<TavilyResult[]> {
  if (!TAVILY_API_KEY) {
    console.warn("[Tavily] API key not configured — skipping.");
    return [];
  }

  try {
    const response = await axios.post<TavilyResponse>(
      `${TAVILY_BASE_URL}/search`,
      {
        api_key: TAVILY_API_KEY,
        query: `comprar ${query} precio envio disponible tienda`,
        search_depth: "advanced",
        include_answer: false,
        include_raw_content: false,
        max_results: 10,
        include_domains: [
          "amazon.com.mx",
          "mercadolibre.com.mx",
          "liverpool.com.mx",
          "walmart.com.mx",
          "bestbuy.com.mx",
          "costco.com.mx",
          "elektra.com.mx",
          "falabella.com.mx",
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      }
    );

    return response.data.results || [];
  } catch (error) {
    console.error("[Tavily] Search error:", error);
    return [];
  }
}

/**
 * Parses a Tavily result and extracts an ExternalOffer if possible.
 * Uses heuristics on the content text to extract price and delivery info.
 */
export function parseTavilyResult(
  result: TavilyResult,
  baseQuery: string
): ExternalOffer | null {
  const text = `${result.title} ${result.content}`.toLowerCase();

  // ── Price extraction ────────────────────────────────────────────────────────
  // Matches patterns like: $1,299, $1299, MXN 1299, 1,299.00 pesos
  const pricePatterns = [
    /\$\s?([\d,]+(?:\.\d{1,2})?)/g,
    /mxn\s?([\d,]+(?:\.\d{1,2})?)/gi,
    /([\d,]+(?:\.\d{1,2})?)\s*pesos/gi,
  ];

  let price: number | null = null;
  for (const pattern of pricePatterns) {
    const match = pattern.exec(`${result.title} ${result.content}`);
    if (match) {
      const raw = parseFloat(match[1].replace(/,/g, ""));
      // Sanity check: products should cost between $100 and $500,000 MXN
      if (raw >= 100 && raw <= 500000) {
        price = raw;
        break;
      }
    }
  }

  if (!price) return null;

  // ── Delivery extraction ─────────────────────────────────────────────────────
  let deliveryDays = 5; // default
  if (text.includes("mismo día") || text.includes("hoy")) deliveryDays = 1;
  else if (text.includes("mañana") || text.includes("1 día")) deliveryDays = 1;
  else if (text.includes("2 días") || text.includes("2 a 3")) deliveryDays = 2;
  else if (text.includes("3 días") || text.includes("3 a 5")) deliveryDays = 3;
  else if (text.includes("express")) deliveryDays = 2;
  else if (text.includes("envío rápido")) deliveryDays = 2;

  // ── Free shipping ───────────────────────────────────────────────────────────
  const freeShipping =
    text.includes("envío gratis") ||
    text.includes("envio gratis") ||
    text.includes("shipping free") ||
    text.includes("free shipping") ||
    text.includes("sin costo de envío");

  // ── Availability ────────────────────────────────────────────────────────────
  let availability: ExternalOffer["availability"] = "in_stock";
  if (text.includes("agotado") || text.includes("sin stock") || text.includes("out of stock")) {
    availability = "out_of_stock";
  } else if (text.includes("últimas unidades") || text.includes("pocas unidades")) {
    availability = "limited";
  }

  // ── Rating ──────────────────────────────────────────────────────────────────
  const ratingMatch = /(\d\.\d)\s*(?:\/5|\s*estrellas|\s*stars)/.exec(
    `${result.title} ${result.content}`
  );
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

  // ── Score (lower = better) ──────────────────────────────────────────────────
  // Combine price, delivery, availability and Tavily relevance into one score
  const deliveryScore = deliveryDays * 10;
  const availabilityScore =
    availability === "in_stock" ? 0 : availability === "limited" ? 20 : 100;
  const shippingScore = freeShipping ? 0 : 15;
  const tavilyScore = (1 - result.score) * 50; // invert so lower is better

  const compositeScore =
    price / 1000 + deliveryScore + availabilityScore + shippingScore + tavilyScore;

  return {
    id: `ext_tavily_${Math.random().toString(36).substr(2, 9)}`,
    title: anonymiseTitle(result.title, baseQuery),
    price, // We will apply the 10% markup later, either in API or UI.
    currency: "MXN",
    deliveryDays,
    freeShipping,
    rating,
    score: compositeScore,
    availability,
    isExternal: true,
    raw: {
      source: "Tavily Search", // Or try to extract domain
      originalPrice: price,
      url: result.url,
    }
  };
}

/**
 * Strips retailer brand names from titles so the source remains anonymous.
 */
function anonymiseTitle(title: string, query: string): string {
  const knownBrands = [
    "Amazon",
    "Mercado Libre",
    "MercadoLibre",
    "Liverpool",
    "Walmart",
    "Best Buy",
    "BestBuy",
    "Costco",
    "Elektra",
    "Falabella",
  ];

  let clean = title;
  for (const brand of knownBrands) {
    clean = clean.replace(new RegExp(brand, "gi"), "").trim();
  }

  // Remove common suffixes like "| Tienda oficial"
  clean = clean.replace(/\|\s*.+$/, "").trim();
  clean = clean.replace(/[-–]\s*.+$/, "").trim();

  // If the result is too short after stripping, use the query as title base
  if (clean.length < 10) {
    clean = `${query} – Oferta disponible`;
  }

  return clean;
}
