import { ExternalOffer } from "@/types";

// ─── Composite Scorer ─────────────────────────────────────────────────────────
// Selects the single best offer from a combined pool of Tavily + SerpApi results.

const WEIGHTS = {
  price: 0.45,      // Biggest factor — lowest price wins
  delivery: 0.30,   // Faster is better
  availability: 0.15,
  rating: 0.10,
};

/**
 * Normalises a numeric value to [0, 1] where 1 is best.
 */
function normalise(value: number, min: number, max: number, invert = false): number {
  if (max === min) return 1;
  const norm = (value - min) / (max - min);
  return invert ? 1 - norm : norm;
}

/**
 * Scores a pool of external offers and returns them sorted best → worst.
 * Lower score = better deal. Returns null if pool is empty.
 * Keeps all valid catalog prices and sorts offers by the comparison score.
 */
export function rankOffers(offers: ExternalOffer[]): ExternalOffer[] {
  if (offers.length === 0) return [];

  // Remove out-of-stock items unless they are the only option
  const available = offers.filter((o) => o.availability !== "out_of_stock");
  const pool = available.length > 0 ? available : offers;

  const prices = pool.map((o) => o.price);
  const deliveries = pool.map((o) => o.deliveryDays);
  const ratings = pool.map((o) => o.rating ?? 0);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDelivery = Math.min(...deliveries);
  const maxDelivery = Math.max(...deliveries);
  const maxRating = Math.max(...ratings);
  const minRating = Math.min(...ratings);

  const scored = pool.map((offer) => {
    // 1 = best, 0 = worst for each dimension
    const priceScore = normalise(offer.price, minPrice, maxPrice, true);   // lower price → higher score
    const deliveryScore = normalise(offer.deliveryDays, minDelivery, maxDelivery, true); // faster → higher
    const availabilityScore =
      offer.availability === "in_stock" ? 1 : offer.availability === "limited" ? 0.6 : 0;
    const ratingScore = normalise(offer.rating ?? minRating, minRating, maxRating);

    const total =
      WEIGHTS.price * priceScore +
      WEIGHTS.delivery * deliveryScore +
      WEIGHTS.availability * availabilityScore +
      WEIGHTS.rating * ratingScore;

    // Override composite score (lower = better) — we negate total so best = lowest
    return { ...offer, score: 1 - total };
  });

  // Sort ascending by score (best = lowest)
  return scored.sort((a, b) => a.score - b.score);
}

/**
 * Returns a human-readable explanation of why this offer was chosen.
 */
export function explainBestOffer(offer: ExternalOffer): string[] {
  const reasons: string[] = [];

  if (offer.freeShipping) reasons.push("Envío sin costo");
  if (offer.deliveryDays <= 2) reasons.push(`Llega en ${offer.deliveryDays} día${offer.deliveryDays > 1 ? "s" : ""}`);
  if (offer.availability === "in_stock") reasons.push("Disponible de inmediato");
  if (offer.rating && offer.rating >= 4.5) reasons.push(`Calificación ${offer.rating.toFixed(1)} ★`);
  if (reasons.length === 0) reasons.push("Mejor precio encontrado");

  return reasons;
}
