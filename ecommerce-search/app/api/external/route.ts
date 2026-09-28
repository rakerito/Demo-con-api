import { NextRequest, NextResponse } from "next/server";
import { searchSerpApi, parseSerpApiResult, SerpApiError } from "@/lib/serpapi";
import { rankOffers } from "@/lib/scorer";
import { ExternalOffer } from "@/types";

// ─── GET /api/external?q=... ──────────────────────────────────────────────────
// Searches Google Shopping through SerpApi after the assistant has clarified the request.

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim().slice(0, 1300);
  const minPriceValue = Number(searchParams.get("min_price"));
  const maxPriceValue = Number(searchParams.get("max_price"));
  const minPrice = searchParams.has("min_price") && Number.isFinite(minPriceValue) && minPriceValue > 0
    ? minPriceValue
    : undefined;
  const maxPrice = searchParams.has("max_price") && Number.isFinite(maxPriceValue) && maxPriceValue > 0
    ? maxPriceValue
    : undefined;

  if (!query.trim()) {
    return NextResponse.json({ offers: [], bestOffer: null, candidateCount: 0 }, { status: 200 });
  }

  try {
    const items = await searchSerpApi(query, { minPrice, maxPrice });
    const parsedOffers = items
      .map(parseSerpApiResult)
      .filter((offer): offer is ExternalOffer => offer !== null);
    const offers = rankOffers(parsedOffers).slice(0, 10);

    for (const offer of offers) offer.price *= 1.1;

    return NextResponse.json(
      {
        offers,
        bestOffer: offers[0] || null,
        candidateCount: offers.length,
        rawResultCount: items.length,
        unparsedResultCount: items.length - parsedOffers.length,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorCode = error instanceof SerpApiError ? error.code : "REQUEST_FAILED";
    const upstreamStatus = error instanceof SerpApiError ? error.status : undefined;
    const upstreamMessage = error instanceof SerpApiError ? error.detail : undefined;
    console.error("[/api/external] Search failed:", errorCode);
    return NextResponse.json(
      { offers: [], bestOffer: null, error: errorCode, upstreamStatus, upstreamMessage },
      { status: 502 }
    );
  }
}
