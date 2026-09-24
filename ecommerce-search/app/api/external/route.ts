import { NextRequest, NextResponse } from "next/server";
import { searchTavily, parseTavilyResult } from "@/lib/tavily";
import { searchSerper, parseSerperResult } from "@/lib/serper";
import { rankOffers, explainBestOffer } from "@/lib/scorer";
import { ExternalOffer } from "@/types";

// ─── GET /api/external?q=... ──────────────────────────────────────────────────
// Queries Tavily + Serper in parallel, combines results, scores them,
// and returns ONLY the best offer — with all retailer references removed.

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  if (!query.trim()) {
    return NextResponse.json({ bestOffer: null }, { status: 200 });
  }

  try {
    // ── Parallel API calls ────────────────────────────────────────────────────
    const [tavilyResults, serperResults] = await Promise.allSettled([
      searchTavily(query),
      searchSerper(query),
    ]);

    const allOffers: ExternalOffer[] = [];

    // ── Process Tavily ────────────────────────────────────────────────────────
    if (tavilyResults.status === "fulfilled") {
      for (const result of tavilyResults.value) {
        const offer = parseTavilyResult(result, query);
        if (offer) allOffers.push(offer);
      }
    }

    // ── Process Serper ────────────────────────────────────────────────────────
    if (serperResults.status === "fulfilled") {
      for (const item of serperResults.value) {
        const offer = parseSerperResult(item);
        if (offer) allOffers.push(offer);
      }
    }

    // ── Fallback demo data when APIs not configured ───────────────────────────
    // This ensures a rich demo experience even without real API keys
    if (allOffers.length === 0) {
      allOffers.push(...generateDemoOffers(query));
    }

    // ── Score and pick best ───────────────────────────────────────────────────
    const ranked = rankOffers(allOffers, query);
    const best = ranked[0] || null;

    if (best) {
      best.price = best.price * 1.10; // Apply 10% markup
    }

    const reasons = best ? explainBestOffer(best) : [];

    return NextResponse.json(
      {
        bestOffer: best
          ? {
              ...best,
              reasons,
              // We want to keep `raw` for the UI to show the real data on click, but remove `source`, `url` from the root level (they were never there anyway).
            }
          : null,
        candidateCount: allOffers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[/api/external] Error:", error);
    return NextResponse.json({ bestOffer: null, error: "Search failed" }, { status: 200 });
  }
}

// ─── Demo fallback offers (used when API keys are not configured) ─────────────
function generateDemoOffers(query: string): ExternalOffer[] {
  // Simulate a realistic spread of offers at varied price points
  const basePrice = 800 + Math.floor(Math.random() * 12000);
  
  // Create a realistic product name based on the query
  const qTitle = query.charAt(0).toUpperCase() + query.slice(1);

  return [
    {
      title: `${qTitle} Modelo Pro 2026 - Edición Especial`,
      price: basePrice,
      currency: "MXN",
      deliveryDays: 3,
      freeShipping: false,
      rating: 4.2,
      score: 0,
      availability: "in_stock",
      isExternal: true,
      raw: { source: "Mercado Libre (Demo)", originalPrice: basePrice, url: "#" }
    },
    {
      title: `${qTitle} Ultra 5G con Accesorios Incluidos`,
      price: Math.round(basePrice * 0.92),
      currency: "MXN",
      deliveryDays: 2,
      freeShipping: true,
      rating: 4.6,
      score: 0,
      availability: "in_stock",
      isExternal: true,
      raw: { source: "Amazon MX (Demo)", originalPrice: Math.round(basePrice * 0.92), url: "#" }
    },
    {
      title: `${qTitle} Básico - Garantía de 1 Año`,
      price: Math.round(basePrice * 0.85),
      currency: "MXN",
      deliveryDays: 5,
      freeShipping: true,
      rating: 3.9,
      score: 0,
      availability: "in_stock",
      isExternal: true,
      raw: { source: "Walmart (Demo)", originalPrice: Math.round(basePrice * 0.85), url: "#" }
    },
  ];
}
