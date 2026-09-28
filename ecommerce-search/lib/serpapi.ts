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
  error?: string;
}

export type SerpApiErrorCode =
  | "API_KEY_MISSING"
  | "INVALID_API_KEY"
  | "INVALID_REQUEST"
  | "ACCOUNT_RESTRICTED"
  | "API_ERROR_RESPONSE"
  | "UPSTREAM_ERROR"
  | "REQUEST_FAILED";

export interface SerpApiSearchError {
  code: SerpApiErrorCode;
  status?: number;
  detail?: string;
}

export interface SerpApiSearchResult {
  items: SerpApiShoppingItem[];
  error?: SerpApiSearchError;
}

export interface SerpApiPriceFilters {
  minPrice?: number;
  maxPrice?: number;
}

export async function searchSerpApi(
  query: string,
  priceFilters: SerpApiPriceFilters = {}
): Promise<SerpApiSearchResult> {
  if (!SERPAPI_API_KEY) {
    return { items: [], error: { code: "API_KEY_MISSING" } };
  }

  const params = new URLSearchParams({
    engine: "google_shopping",
    google_domain: "google.com.mx",
    q: query,
    gl: "mx",
    hl: "es",
    api_key: SERPAPI_API_KEY,
  });
  if (priceFilters.minPrice !== undefined) {
    params.set("min_price", String(priceFilters.minPrice));
  }
  if (priceFilters.maxPrice !== undefined) {
    params.set("max_price", String(priceFilters.maxPrice));
  }

  let lastError: SerpApiSearchError = { code: "REQUEST_FAILED" };
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await axios.get<SerpApiShoppingResponse>(
        `${SERPAPI_URL}?${params.toString()}`,
        { timeout: 15000 }
      );

      if (response.data.error) {
        lastError = {
          code: "API_ERROR_RESPONSE",
          status: response.status,
          detail: sanitizeSerpApiError(response.data.error),
        };
      } else {
        return { items: response.data.shopping_results || [] };
      }
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      lastError = {
        code: getErrorCode(status),
        status,
        detail: axios.isAxiosError(error) && error.code
          ? sanitizeSerpApiError(error.code)
          : undefined,
      };
    }

    console.warn(`[SerpApi] Search attempt ${attempt}/2 failed:`, lastError.code, lastError.status);
  }

  return { items: [], error: lastError };
}

function getErrorCode(status?: number): SerpApiErrorCode {
  if (status === 401) return "INVALID_API_KEY";
  if (status === 400) return "INVALID_REQUEST";
  if (status === 402 || status === 403 || status === 429) return "ACCOUNT_RESTRICTED";
  if (status !== undefined && status >= 500) return "UPSTREAM_ERROR";
  return "REQUEST_FAILED";
}

function sanitizeSerpApiError(message: string): string {
  return message
    .replace(/api_key=[^&\s]+/gi, "api_key=[redacted]")
    .replace(/\b[a-f0-9]{48,}\b/gi, "[redacted]")
    .slice(0, 300);
}

export function parseSerpApiResult(item: SerpApiShoppingItem): ExternalOffer | null {
  let price = item.extracted_price;
  if (!price) {
    const rawPrice = item.price || "";
    const priceMatch = rawPrice.replace(/[^\d.,]/g, "").replace(/,/g, "");
    price = parseFloat(priceMatch);
  }

  if (!Number.isFinite(price) || price <= 0) return null;

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