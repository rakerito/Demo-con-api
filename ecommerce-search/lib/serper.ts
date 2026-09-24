import axios from "axios";
import { ExternalOffer } from "@/types";

// ─── SerpApi Google Shopping API Client ─────────────────────────────────────────
// SerpApi provides Google Shopping results via a clean REST API.

const SERPER_API_KEY = process.env.SERPER_API_KEY || "";
const SERPAPI_BASE_URL = "https://serpapi.com/search?engine=google";

interface SerperShoppingItem {
  title: string;
  source: string;
  link: string;
  price?: string;       // e.g. "$1,299.00"
  extracted_price?: number;
  delivery?: string;   // e.g. "Free shipping"
  rating?: number;
  reviews?: number;
  thumbnail?: string;
  position: number;
}

interface SerperShoppingResponse {
  shopping_results?: SerperShoppingItem[];
}

/**
 * Queries SerpApi Google Shopping for product listings.
 */
export async function searchSerper(query: string): Promise<SerperShoppingItem[]> {
  if (!SERPER_API_KEY) {
    console.warn("[SerpApi] API key not configured — skipping.");
    return [];
  }

  try {
    const params = new URLSearchParams({
      engine: "google_shopping",
      q: query,
      gl: "mx",
      hl: "es",
      api_key: SERPER_API_KEY,
      num: "10"
    });

    const response = await axios.get<SerperShoppingResponse>(
      `${SERPAPI_BASE_URL}?${params.toString()}`,
      { timeout: 15000 }
    );

    return response.data.shopping_results || [];
  } catch (error) {
    console.error("[SerpApi] Search error:", error);
    return [];
  }
}

/**
 * Parses a SerpApi Shopping result into a normalised ExternalOffer.
 */
export function parseSerperResult(item: SerperShoppingItem): ExternalOffer | null {
  // ── Price extraction ────────────────────────────────────────────────────────
  let price = item.extracted_price;
  if (!price) {
    const rawPrice = item.price || "";
    // Strip currency symbols and commas, then parse
    const priceMatch = rawPrice.replace(/[^\d.,]/g, "").replace(/,/g, "");
    price = parseFloat(priceMatch);
  }

  if (!price || price < 10 || price > 500000) return null;

  // ── Delivery ────────────────────────────────────────────────────────────────
  const deliveryText = (item.delivery || "").toLowerCase();
  let deliveryDays = 5;

  if (deliveryText.includes("hoy") || deliveryText.includes("mismo día")) {
    deliveryDays = 1;
  } else if (deliveryText.includes("mañana") || deliveryText.includes("1 día")) {
    deliveryDays = 1;
  } else if (/2\s*(?:a\s*3\s*)?d[íi]as/.test(deliveryText)) {
    deliveryDays = 2;
  } else if (/3\s*(?:a\s*5\s*)?d[íi]as/.test(deliveryText)) {
    deliveryDays = 3;
  } else if (deliveryText.includes("express")) {
    deliveryDays = 2;
  } else if (deliveryText.includes("gratis") || deliveryText.includes("free")) {
    deliveryDays = 3; // usually standard with free shipping
  }

  const freeShipping =
    deliveryText.includes("gratis") ||
    deliveryText.includes("free") ||
    deliveryText.includes("sin costo");

  // ── Score (lower = better) ──────────────────────────────────────────────────
  const deliveryScore = deliveryDays * 10;
  const shippingScore = freeShipping ? 0 : 15;
  const positionScore = item.position * 2; // Google position bonus
  const ratingPenalty = item.rating ? (5 - item.rating) * 10 : 15;

  const compositeScore = price / 1000 + deliveryScore + shippingScore + positionScore + ratingPenalty;

  return {
    id: `ext_serpapi_${Math.random().toString(36).substr(2, 9)}`,
    title: anonymiseSerperTitle(item.title),
    price, // We will apply the markup later
    currency: "MXN",
    deliveryDays,
    freeShipping,
    rating: item.rating,
    score: compositeScore,
    thumbnailUrl: item.thumbnail,
    availability: "in_stock", // SerpApi Shopping only shows available items
    isExternal: true,
    raw: {
      source: item.source || "Proveedor Externo",
      originalPrice: price,
      url: item.link,
    }
  };
}

/**
 * Removes retailer names from Shopping titles.
 */
function anonymiseSerperTitle(title: string): string {
  // Remove anything after a dash or pipe (usually the store name)
  let clean = title.replace(/\s*[-–|]\s*[^-–|]+$/, "").trim();

  // Remove known retailer names
  const retailers = [
    "Amazon",
    "Liverpool",
    "Walmart",
    "Mercado Libre",
    "Best Buy",
    "Costco",
    "Coppel",
    "Elektra",
    "Falabella",
    "Palacio de Hierro",
  ];
  for (const r of retailers) {
    clean = clean.replace(new RegExp(`\\b${r}\\b`, "gi"), "").trim();
  }

  return clean || title;
}
