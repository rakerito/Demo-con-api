// ─── Internal DB Product ──────────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  stock: number;
  images: string[];
  tags: string[];
  sku: string;
  deliveryDays: number;
  freeShipping: boolean;
}

// ─── External Supplier Result (anonymised) ───────────────────────────────────
export interface ExternalOffer {
  id?: string;
  title: string;
  price: number;
  currency: string;
  deliveryDays: number;
  freeShipping: boolean;
  rating?: number;
  score: number;           // composite scoring: lower = better
  thumbnailUrl?: string;
  availability: "in_stock" | "limited" | "out_of_stock";
  isExternal?: boolean;
  raw?: {
    source: string;
    originalPrice: number;
    url?: string;
  };
}

// ─── Search Request & Response ────────────────────────────────────────────────
export interface SearchRequest {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "rating";
}

export interface SearchResponse {
  query: string;
  internalResults: Product[];
  bestExternalOffer: ExternalOffer | null;
  totalInternal: number;
  searchedAt: string;
}

// ─── Scoring weights ──────────────────────────────────────────────────────────
export interface ScoringWeights {
  price: number;
  delivery: number;
  availability: number;
  rating: number;
}
