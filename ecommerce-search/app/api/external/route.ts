import { NextRequest, NextResponse } from "next/server";
import { parseSerpApiResult, searchSerpApi } from "@/lib/serpapi";
import { rankOffers } from "@/lib/scorer";
import { ExternalOffer } from "@/types";
import { buildQueryLadder, SearchSpec } from "@/lib/queryBuilder";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body) || !("spec" in body)) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const spec = parseSearchSpec(body.spec);
  if (!spec) return NextResponse.json({ error: "INVALID_SPEC" }, { status: 400 });

  return searchWithLadder(spec);
}

// Keep the earlier query-string contract available for existing callers.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") || "").trim().slice(0, 1300);
  if (!query) {
    return NextResponse.json({ offers: [], bestOffer: null, candidateCount: 0 }, { status: 200 });
  }

  const maxPriceValue = Number(searchParams.get("max_price"));
  const presupuesto_max = searchParams.has("max_price") && Number.isFinite(maxPriceValue) && maxPriceValue > 0
    ? maxPriceValue
    : null;
  return searchWithLadder({
    tipo: query,
    marca: "",
    modelo: "",
    specs: [],
    presupuesto_max,
  });
}

function parseSearchSpec(value: unknown): SearchSpec | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.tipo !== "string" || candidate.tipo.trim().length === 0 || candidate.tipo.length > 200 ||
    typeof candidate.marca !== "string" || candidate.marca.length > 200 ||
    typeof candidate.modelo !== "string" || candidate.modelo.length > 300 ||
    !Array.isArray(candidate.specs) || candidate.specs.length > 12 ||
    !candidate.specs.every(spec => typeof spec === "string" && spec.length <= 200) ||
    !(candidate.presupuesto_max === null ||
      (typeof candidate.presupuesto_max === "number" && Number.isFinite(candidate.presupuesto_max) && candidate.presupuesto_max > 0))
  ) return null;

  return {
    tipo: candidate.tipo.trim(),
    marca: candidate.marca.trim(),
    modelo: candidate.modelo.trim(),
    specs: candidate.specs.map(spec => (spec as string).trim()).filter(Boolean),
    presupuesto_max: candidate.presupuesto_max as number | null,
  };
}

async function searchWithLadder(spec: SearchSpec) {
  const queries = buildQueryLadder(spec);
  let rawResultCount = 0;
  let unparsedResultCount = 0;

  for (const [index, query] of queries.entries()) {
    console.info("[/api/external] Trying SerpApi query:", { attempt: index + 1, query });
    const result = await searchSerpApi(query, {
      maxPrice: spec.presupuesto_max ?? undefined,
    });

    if (result.error) {
      console.error("[/api/external] SerpApi query failed:", result.error.code, result.error.status);
      return NextResponse.json(
        {
          offers: [],
          bestOffer: null,
          error: result.error.code,
          upstreamStatus: result.error.status,
          upstreamMessage: result.error.detail,
          queriesTried: index + 1,
        },
        { status: 502 }
      );
    }

    rawResultCount += result.items.length;
    const parsedOffers = result.items
      .map(parseSerpApiResult)
      .filter((offer): offer is ExternalOffer => offer !== null);
    unparsedResultCount += result.items.length - parsedOffers.length;
    if (!parsedOffers.length) continue;

    console.info("[/api/external] SerpApi query matched:", {
      attempt: index + 1,
      query,
      resultCount: parsedOffers.length,
    });
    const offers = rankOffers(parsedOffers).slice(0, 10);
    for (const offer of offers) offer.price *= 1.1;

    return NextResponse.json({
      offers,
      bestOffer: offers[0] || null,
      candidateCount: offers.length,
      rawResultCount,
      unparsedResultCount,
      queriesTried: index + 1,
      matchedQuery: query,
    });
  }

  console.info("[/api/external] No parseable SerpApi results after query ladder:", queries.length);
  return NextResponse.json({
    offers: [],
    bestOffer: null,
    candidateCount: 0,
    rawResultCount,
    unparsedResultCount,
    queriesTried: queries.length,
  });
}
