/**
 * Typed Polymarket Gamma API Client
 * Provides structured market/event data retrieval with strong typing
 */

const BASE_URL = "https://gamma-api.polymarket.com";

// ============================================================================
// Types
// ============================================================================

export interface Outcome {
  id: string;
  name: string;
  price: number;
}

export interface Market {
  id: string;
  slug?: string;
  question: string;
  eventId: string;
  volume24hr: number;
  liquidity: number;
  outcomes: Outcome[];
}

export interface Event {
  id: string;
  slug: string | null;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  active: boolean | null;
  closed: boolean | null;
  liquidity: number | null;
  volume: number | null; // Total volume
  volume24hr: number | null;
  markets: Market[];
}

export interface SearchResults {
  markets: Market[];
  events: Event[];
  tags: { id: string; label: string; slug: string; event_count?: number }[];
  profiles: { id: string; name: string | null; profileImage?: string | null }[];
  hasMore: boolean;
}

// ============================================================================
// Normalization Helpers
// ============================================================================

function mapOutcome(o: any): Outcome {
  return {
    id: String(o.id || ""),
    name: String(o.name || ""),
    price: Number(o.price || 0),
  };
}

function mapMarket(m: any): Market {
  // Parse outcomes if it's a JSON string
  let outcomesArray = m.outcomes || [];
  if (typeof outcomesArray === 'string') {
    try {
      outcomesArray = JSON.parse(outcomesArray);
    } catch (e) {
      console.warn('[Polymarket API] Failed to parse outcomes:', e);
      outcomesArray = [];
    }
  }
  
  // Also handle outcomePrices if available
  let outcomePrices: number[] = [];
  if (m.outcomePrices) {
    if (typeof m.outcomePrices === 'string') {
      try {
        outcomePrices = JSON.parse(m.outcomePrices).map((p: any) => Number(p));
      } catch (e) {
        console.warn('[Polymarket API] Failed to parse outcomePrices:', e);
      }
    } else if (Array.isArray(m.outcomePrices)) {
      outcomePrices = m.outcomePrices.map((p: any) => Number(p));
    }
  }
  
  // Map outcomes to Outcome objects with prices
  const outcomes = Array.isArray(outcomesArray)
    ? outcomesArray.map((name: string, index: number) => ({
        id: String(index),
        name: String(name),
        price: outcomePrices[index] || 0,
      }))
    : [];

  return {
    id: String(m.id || ""),
    slug: m.slug || undefined,
    question: String(m.question || ""),
    eventId: String(m.event_id || m.eventId || ""),
    volume24hr: Number(m.volume_24hr || m.volume24hr || 0),
    liquidity: Number(m.liquidity || 0),
    outcomes,
  };
}

function mapEvent(e: any): Event {
  return {
    id: String(e.id || ""),
    slug: e.slug || null,
    title: e.title || null,
    subtitle: e.subtitle || null,
    description: e.description || null,
    image: e.image || null,
    active: e.active ?? null,
    closed: e.closed ?? null,
    liquidity: e.liquidity ? Number(e.liquidity) : null,
    volume: e.volume ? Number(e.volume) : null, // Total volume
    volume24hr: e.volume24hr ? Number(e.volume24hr) : null,
    markets: (e.markets || []).map(mapMarket),
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Search only markets (lightweight)
 * GET /markets/search?query=<query>
 */
export async function searchMarkets(query: string): Promise<Market[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/markets/search?query=${encodeURIComponent(query)}`
    );
    if (!res.ok) {
      throw new Error(`Polymarket API error: ${res.status}`);
    }
    const data = await res.json();
    return (data.markets || []).map(mapMarket);
  } catch (error) {
    console.error("[Polymarket API] searchMarkets error:", error);
    return [];
  }
}

/**
 * Unified search (markets + events + tags + profiles)
 * GET /public-search?q=<query>
 * This is the BEST endpoint for discovery!
 */
export async function publicSearch(
  query: string,
  limitPerType = 20
): Promise<SearchResults> {
  try {
    const url = `${BASE_URL}/public-search?q=${encodeURIComponent(query)}&limit_per_type=${limitPerType}`;
    console.log(`🔍 [Polymarket API] publicSearch: ${url}`);
    
    const res = await fetch(url);
    
    console.log(`📡 [Polymarket API] Response status: ${res.status}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ [Polymarket API] Error response:`, errorText);
      throw new Error(`Polymarket API error: ${res.status}`);
    }
    
    const data = await res.json();
    
    console.log(`📦 [Polymarket API] Raw response:`, {
      eventsCount: data.events?.length || 0,
      tagsCount: data.tags?.length || 0,
      profilesCount: data.profiles?.length || 0,
      firstEvent: data.events?.[0]?.title || 'none',
      firstEventActive: data.events?.[0]?.active,
      firstEventClosed: data.events?.[0]?.closed,
      firstEventVolume: data.events?.[0]?.volume,
    });

    const results = {
      markets: (data.events?.flatMap((e: any) => e.markets) || []).map(
        mapMarket
      ),
      events: (data.events || []).map(mapEvent),
      tags: data.tags || [],
      profiles: data.profiles || [],
      hasMore: data.pagination?.hasMore ?? false,
    };
    
    console.log(`✅ [Polymarket API] Returning ${results.events.length} events with ${results.markets.length} markets`);
    console.log(`📊 [Polymarket API] Event status breakdown:`, {
      active: results.events.filter(e => e.active === true).length,
      closed: results.events.filter(e => e.closed === true).length,
      neither: results.events.filter(e => e.active === null && e.closed === null).length,
    });
    
    return results;
  } catch (error) {
    console.error("[Polymarket API] publicSearch error:", error);
    return {
      markets: [],
      events: [],
      tags: [],
      profiles: [],
      hasMore: false,
    };
  }
}

/**
 * Get market by slug
 * GET /markets/slug/<slug>
 */
export async function getMarketBySlug(slug: string): Promise<Market | null> {
  try {
    const res = await fetch(`${BASE_URL}/markets/slug/${slug}`);
    if (!res.ok) {
      throw new Error(`Polymarket API error: ${res.status}`);
    }
    return mapMarket(await res.json());
  } catch (error) {
    console.error(`[Polymarket API] getMarketBySlug(${slug}) error:`, error);
    return null;
  }
}

/**
 * Get event by slug
 * GET /events/slug/<slug>
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const res = await fetch(`${BASE_URL}/events/slug/${slug}`);
    if (!res.ok) {
      throw new Error(`Polymarket API error: ${res.status}`);
    }
    return mapEvent(await res.json());
  } catch (error) {
    console.error(`[Polymarket API] getEventBySlug(${slug}) error:`, error);
    return null;
  }
}

/**
 * List events (paginated)
 * GET /events?closed=false&limit=<n>&offset=<n>
 */
export async function listEvents(
  limit = 50,
  offset = 0
): Promise<Event[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/events?closed=false&limit=${limit}&offset=${offset}`
    );
    if (!res.ok) {
      throw new Error(`Polymarket API error: ${res.status}`);
    }
    const data = await res.json();
    return (data.events || []).map(mapEvent);
  } catch (error) {
    console.error("[Polymarket API] listEvents error:", error);
    return [];
  }
}

/**
 * Fetch all active markets via events
 */
export async function listAllMarketsFromEvents(
  limit = 100,
  offset = 0
): Promise<Market[]> {
  const events = await listEvents(limit, offset);
  return events.flatMap((e) => e.markets);
}

/**
 * Fetch markets by tag
 * GET /markets?tag_id=<id>
 */
export async function getMarketsByTag(
  tagId: number,
  limit = 50,
  offset = 0
): Promise<Market[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/markets?tag_id=${tagId}&closed=false&limit=${limit}&offset=${offset}`
    );
    if (!res.ok) {
      throw new Error(`Polymarket API error: ${res.status}`);
    }
    const data = await res.json();
    return (data.markets || []).map(mapMarket);
  } catch (error) {
    console.error(`[Polymarket API] getMarketsByTag(${tagId}) error:`, error);
    return [];
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract YES / NO prices from a market
 */
export function extractPrices(market: Market | null): {
  yes?: number;
  no?: number;
} {
  if (!market) return {};

  const yes = market.outcomes.find(
    (o) => o.name.toLowerCase() === "yes"
  )?.price;
  const no = market.outcomes.find((o) => o.name.toLowerCase() === "no")?.price;

  return { yes, no };
}

/**
 * Convert Event to our app's Market format
 */
export function eventToAppMarket(event: Event) {
  const firstMarket = event.markets[0];
  const prices = extractPrices(firstMarket);

  return {
    id: event.id,
    question: event.title || firstMarket?.question || "",
    slug: event.slug || firstMarket?.slug || "",
    volume: event.volume || event.volume24hr || 0, // Prefer total volume over 24hr
    liquidity: event.liquidity || 0,
    active: event.active !== false && event.closed !== true,
    tags: [], // Would need to be populated from event data if available
    url: `https://polymarket.com/event/${event.slug || firstMarket?.slug}`,
    currentPrices: prices.yes !== undefined ? {
      Yes: prices.yes,
      No: prices.no || 0,
    } : undefined,
  };
}

