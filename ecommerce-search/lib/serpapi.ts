import axios from "axios";
import { ExternalOffer } from "@/types";

// SerpApi Google Shopping API client.
const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY || "";
const SERPAPI_URL = "https://serpapi.com/search";

interface SerpApiShoppingItem {
  title: string;
  source: string;
  product_link?: string;
  link?: string;
  price?: string;
  extracted_price?: number;
  delivery?: string;
  rating?: number;
  reviews?: number;
  thumbnail?: string;
  position: number;
}

interface SerpApiShoppingResponse {
  shopping_results?: SerpApiShoppingItem[];
}

export async function searchSerpApi(query: string): Promise<SerpApiShoppingItem[]> {
  if (!SERPAPI_API_KEY) {
    console.warn("[SerpApi] API key not configured — skipping.");
    return [];
  }

  try {
    const params = new URLSearchParams({
      engine: "google_shopping",
      q: query,
      gl: "mx",
      hl: "es",
      api_key: SERPAPI_API_KEY,
      num: "10",
    });

    const response = await axios.get<SerpApiShoppingResponse>(
      `${SERPAPI_URL}?${params.toString()}`,
      { timeout: 15000 }
    );

    return response.data.shopping_results || [];
  } catch (error) {
    const errorCode = axios.isAxiosError(error)
      ? error.response?.status ?? error.code
      : "Unknown error";
    console.error("[SerpApi] Search error:", errorCode);
    return [];
  }
}

export function parseSerpApiResult(item: SerpApiShoppingItem): ExternalOffer | null {
  let price = item.extracted_price;
  if (!price) {
    const rawPrice = item.price || "";
    const priceMatch = rawPrice.replace(/[^\d.,]/g, "").replace(/,/g, "");
    price = parseFloat(priceMatch);
  }

  if (!price || price < 10 || price > 500000) return null;

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
    deliveryDays = 3;
  }

  const freeShipping =
    deliveryText.includes("gratis") ||
    deliveryText.includes("free") ||
    deliveryText.includes("sin costo");

  const deliveryScore = deliveryDays * 10;
  const shippingScore = freeShipping ? 0 : 15;
  const positionScore = item.position * 2;
  const ratingPenalty = item.rating ? (5 - item.rating) * 10 : 15;
  const compositeScore = price / 1000 + deliveryScore + shippingScore + positionScore + ratingPenalty;

  return {
    id: `ext_serpapi_${Math.random().toString(36).substr(2, 9)}`,
    title: anonymiseSerpApiTitle(item.title),
    price,
    currency: "MXN",
    deliveryDays,
    freeShipping,
    rating: item.rating,
    score: compositeScore,
    thumbnailUrl: item.thumbnail,
    availability: "in_stock",
    isExternal: true,
    raw: {
      source: item.source || "Proveedor Externo",
      originalPrice: price,
      url: item.product_link || item.link,
    },
  };
}

function anonymiseSerpApiTitle(title: string): string {
  let clean = title.replace(/\s*[-–|]\s*[^-–|]+$/, "").trim();

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
  for (const retailer of retailers) {
    clean = clean.replace(new RegExp(`\\b${retailer}\\b`, "gi"), "").trim();
  }

  return clean || title;
}