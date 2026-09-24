import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/database";
import { SearchResponse } from "@/types";

// ─── GET /api/search?q=...&category=...&sort=... ───────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || undefined;
  const minPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const maxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;
  const sortBy = searchParams.get("sort") || "relevance";

  try {
    const products = searchProducts(query, category, minPrice, maxPrice, sortBy);

    const response: Partial<SearchResponse> = {
      query,
      internalResults: products,
      totalInternal: products.length,
      searchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[/api/search] Error:", error);
    return NextResponse.json(
      { error: "Internal search failed" },
      { status: 500 }
    );
  }
}
