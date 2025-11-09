import { NextRequest, NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import {
  publicSearch,
  getEventBySlug,
  eventToAppMarket,
} from "@/lib/polymarket/client";

// Use Node.js runtime for MCP SDK compatibility
export const runtime = "nodejs";

/**
 * Discovery API - Hybrid MCP + Polymarket API
 * 1. Try MCP search_events first (user requirement)
 * 2. Use typed Polymarket API for enrichment
 * 3. Fallback to direct Polymarket publicSearch if MCP fails
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    console.log("🔍 [Discover API] Query:", query);

    const mcpClient = getMCPClient();

    // Strategy 1: Use MCP search_events to get slugs, then enrich with typed Polymarket API
    console.log("🎯 [Discover API] Strategy 1: MCP search_events...");

    const searchResult = await mcpClient.callTool("search_events", {
      limit: 20,
      closed: false,
      order: "volume",
      ascending: false,
    });

    if (searchResult.success && searchResult.data) {
      // Parse the text response to extract event info
      const events = parseEventsFromMCPText(searchResult.data);

      console.log(`📊 [Discover API] Parsed ${events.length} events from MCP`);

      if (events.length > 0) {
        // Filter by query relevance
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(Boolean);

        const relevantEvents = events
          .map((event: any) => {
            const titleLower = event.title.toLowerCase();

            // Score based on word matches
            let score = 0;
            queryWords.forEach((word: string) => {
              if (titleLower.includes(word)) {
                score += 3; // High score for title matches
              }
            });

            return { event, score };
          })
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 8) // Top 8 relevant events
          .map(({ event }) => event);

        console.log(
          `✅ [Discover API] Found ${relevantEvents.length} relevant events from MCP`
        );

        // If we found fewer than 3 relevant events, the MCP search isn't working well
        // Fall through to Strategy 2 (direct Polymarket publicSearch)
        if (relevantEvents.length >= 3) {
          // Enrich with TYPED Polymarket API client
          console.log(
            `🔄 [Discover API] Enriching ${relevantEvents.length} events with typed Polymarket client...`
          );

          const enrichedMarkets = await Promise.all(
            relevantEvents.map(async (event: any) => {
              try {
                // Use typed client instead of raw fetch
                const fullEvent = await getEventBySlug(event.slug);

                if (fullEvent) {
                  return eventToAppMarket(fullEvent);
                }
              } catch (error) {
                console.error(
                  `⚠️ [Discover API] Failed to enrich ${event.slug}:`,
                  error
                );
              }

              // Fallback to basic event data
              return {
                id: event.slug,
                question: event.title,
                slug: event.slug,
                volume: event.volume || 0,
                liquidity: 0,
                active: event.status === "Active",
                tags: [],
                url: `https://polymarket.com/event/${event.slug}`,
                currentPrices: {},
              };
            })
          );

          const validMarkets = enrichedMarkets.filter((m) => m !== null);

          console.log(
            `✅ [Discover API] Enriched ${validMarkets.length} markets (MCP + Polymarket)`
          );

          return NextResponse.json({
            success: true,
            markets: validMarkets,
            query,
            relevantCount: validMarkets.length,
            source: "mcp_search_events_enriched",
          });
        }
      }
    }

    // Strategy 2: Fallback to direct Polymarket publicSearch
    console.log(
      "🔄 [Discover API] Strategy 2: MCP didn't find enough relevant results, using Polymarket publicSearch..."
    );

    const polymarketResults = await publicSearch(query, 10);

    if (polymarketResults.events.length > 0) {
      const allMarkets = polymarketResults.events.map(eventToAppMarket);

      // Prioritize active markets, but include closed ones if not enough active
      const activeMarkets = allMarkets.filter((m) => m.active);
      const closedMarkets = allMarkets.filter((m) => !m.active);

      // Prefer active markets, fall back to closed if needed
      const markets =
        activeMarkets.length >= 5
          ? activeMarkets.slice(0, 10)
          : [...activeMarkets, ...closedMarkets].slice(0, 10);

      console.log(
        `✅ [Discover API] Found ${markets.length} markets from Polymarket publicSearch (${activeMarkets.length} active, ${closedMarkets.length} closed)`
      );

      return NextResponse.json({
        success: true,
        markets,
        query,
        relevantCount: markets.length,
        source: "polymarket_public_search",
      });
    }

    // Fallback: Use featured resource and filter
    console.log(
      "🔄 [Discover API] MCP failed, falling back to featured resource..."
    );
    const featuredResult = await mcpClient.getResource("polymarket://featured");

    if (!featuredResult.success || !featuredResult.data) {
      return NextResponse.json({
        success: false,
        error: "Failed to discover markets",
      });
    }

    // Parse featured events
    let events = [];
    if (Array.isArray(featuredResult.data)) {
      events = featuredResult.data;
    } else if (typeof featuredResult.data === "string") {
      try {
        events = JSON.parse(featuredResult.data);
      } catch (e) {
        return NextResponse.json({
          success: false,
          error: "Failed to parse featured markets",
        });
      }
    }

    // Filter events by query with scoring
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(Boolean);

    const relevantEvents = events
      .map((event: any) => {
        const searchText = (
          (event.title || "") +
          " " +
          (event.description || "") +
          " " +
          (event.tags?.map((t: any) => t.label || "").join(" ") || "")
        ).toLowerCase();

        let score = 0;
        queryWords.forEach((word: string) => {
          if (searchText.includes(word)) {
            score += 1;
            if ((event.title || "").toLowerCase().includes(word)) {
              score += 2;
            }
          }
        });

        return { event, score };
      })
      .filter(({ score }: { score: number }) => score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .map(({ event }: { event: any }) => event)
      .slice(0, 10);

    // Convert events to markets
    const markets = convertEventsToMarkets(relevantEvents);

    console.log(
      `✅ [Discover API] Returning ${markets.length} markets from featured (filtered)`
    );

    return NextResponse.json({
      success: true,
      markets,
      query,
      relevantCount: markets.length,
      source: "mcp_featured_resource_filtered",
    });
  } catch (error) {
    console.error("❌ [Discover API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Parse events from MCP text response
 * Format: "1. **Title**\n   Slug: `slug`\n   Markets: X\n   Volume: $XXk\n   Status: Active"
 */
function parseEventsFromMCPText(data: any): any[] {
  if (typeof data !== "string") {
    return [];
  }

  const events: any[] = [];
  const lines = data.split("\n");
  let currentEvent: any = null;

  for (const line of lines) {
    // Match event title: "1. **UEFA Champions League Winner**"
    const titleMatch = line.match(/^\d+\.\s+\*\*(.+?)\*\*/);
    if (titleMatch) {
      if (currentEvent && currentEvent.slug) {
        events.push(currentEvent);
      }
      currentEvent = {
        title: titleMatch[1].trim(),
        slug: "",
        volume: 0,
        markets: 0,
        status: "Unknown",
      };
      continue;
    }

    if (!currentEvent) continue;

    // Match slug: "   Slug: `uefa-champions-league-winner`"
    const slugMatch = line.match(/Slug:\s+`([^`]+)`/);
    if (slugMatch) {
      currentEvent.slug = slugMatch[1];
      continue;
    }

    // Match volume: "   Volume: $69230.2k"
    const volumeMatch = line.match(/Volume:\s+\$([0-9.]+)([kKmM])/);
    if (volumeMatch) {
      const value = parseFloat(volumeMatch[1]);
      const multiplier = volumeMatch[2].toLowerCase() === "k" ? 1000 : 1000000;
      currentEvent.volume = value * multiplier;
      continue;
    }

    // Match markets count: "   Markets: 60"
    const marketsMatch = line.match(/Markets:\s+(\d+)/);
    if (marketsMatch) {
      currentEvent.markets = parseInt(marketsMatch[1]);
      continue;
    }

    // Match status: "   Status: Active"
    const statusMatch = line.match(/Status:\s+(\w+)/);
    if (statusMatch) {
      currentEvent.status = statusMatch[1];
      continue;
    }
  }

  // Add last event
  if (currentEvent && currentEvent.slug) {
    events.push(currentEvent);
  }

  return events;
}

/**
 * Convert a single event to market format
 */
function convertEventToMarket(event: any): any {
  const market =
    event.markets && event.markets.length > 0 ? event.markets[0] : null;

  // Parse prices if available
  let currentPrices: Record<string, number> = {};
  if (market && market.outcomePrices) {
    try {
      const pricesArray = JSON.parse(market.outcomePrices);
      const outcomesArray = JSON.parse(market.outcomes || '["Yes", "No"]');
      outcomesArray.forEach((outcome: string, index: number) => {
        currentPrices[outcome] = parseFloat(pricesArray[index] || 0);
      });
    } catch (e) {
      console.error("Failed to parse prices:", e);
    }
  }

  return {
    id: market?.id || event.id,
    question: market?.question || event.title,
    slug: market?.slug || event.slug,
    volume: parseFloat(market?.volume || event.volume || 0),
    liquidity: parseFloat(market?.liquidity || event.liquidity || 0),
    active: event.active !== false && event.closed !== true,
    tags: event.tags?.map((t: any) => t.label || t.slug || t) || [],
    url: `https://polymarket.com/event/${market?.slug || event.slug}`,
    currentPrices,
  };
}

/**
 * Convert events to market format
 */
function convertEventsToMarkets(events: any[]): any[] {
  const markets: any[] = [];

  for (const event of events) {
    if (
      event.markets &&
      Array.isArray(event.markets) &&
      event.markets.length > 0
    ) {
      // Event has markets, use the first one
      const market = event.markets[0];
      markets.push({
        id: market.id || event.id,
        question: market.question || event.title,
        slug: market.slug || event.slug,
        volume: parseFloat(market.volume) || 0,
        liquidity: parseFloat(market.liquidity) || 0,
        active: event.active !== false && event.closed !== true,
        tags: event.tags?.map((t: any) => t.label || t.slug || t) || [],
        url: `https://polymarket.com/event/${market.slug || event.slug}`,
      });
    } else {
      // Event doesn't have markets array, use event itself
      markets.push({
        id: event.id,
        question: event.title,
        slug: event.slug,
        volume: 0,
        liquidity: 0,
        active: event.active !== false && event.closed !== true,
        tags: event.tags?.map((t: any) => t.label || t.slug || t) || [],
        url: `https://polymarket.com/event/${event.slug}`,
      });
    }
  }

  return markets;
}

/**
 * Parse markets from MCP response (handles text or structured data)
 */
function parseMarketsData(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (typeof data === "string") {
    return parseMarketsFromText(data);
  }

  return [];
}

/**
 * Parse markets from MCP text response
 */
function parseMarketsFromText(text: string): any[] {
  const markets: any[] = [];
  const lines = text.split("\n");

  let currentMarket: any = null;

  for (const line of lines) {
    // Match market title: "1. **Will Trump say..."
    const titleMatch = line.match(/^\d+\.\s+\*\*(.+?)\*\*/);
    if (titleMatch) {
      if (currentMarket && currentMarket.slug) {
        markets.push(currentMarket);
      }
      currentMarket = {
        id: `market-${markets.length}`,
        question: titleMatch[1],
        slug: "",
        volume: 0,
        liquidity: 0,
        active: true,
        tags: [],
      };
      continue;
    }

    if (!currentMarket) continue;

    // Match slug
    const slugMatch = line.match(/Slug:\s+`([^`]+)`/);
    if (slugMatch) {
      currentMarket.slug = slugMatch[1];
      currentMarket.url = `https://polymarket.com/event/${slugMatch[1]}`;
      continue;
    }

    // Match volume
    const volumeMatch = line.match(/Volume:\s+\$([0-9.]+)([kKmM])/);
    if (volumeMatch) {
      const value = parseFloat(volumeMatch[1]);
      const multiplier = volumeMatch[2].toLowerCase() === "k" ? 1000 : 1000000;
      currentMarket.volume = value * multiplier;
      continue;
    }

    // Match liquidity
    const liquidityMatch = line.match(/Liquidity:\s+\$([0-9.]+)([kKmM])/);
    if (liquidityMatch) {
      const value = parseFloat(liquidityMatch[1]);
      const multiplier =
        liquidityMatch[2].toLowerCase() === "k" ? 1000 : 1000000;
      currentMarket.liquidity = value * multiplier;
      continue;
    }

    // Match status
    const statusMatch = line.match(/Status:\s+(\w+)/);
    if (statusMatch) {
      currentMarket.active = statusMatch[1].toLowerCase() !== "closed";
      if (!currentMarket.active) {
        currentMarket.tags = ["Closed"];
      }
      continue;
    }
  }

  // Add last market
  if (currentMarket && currentMarket.slug) {
    markets.push(currentMarket);
  }

  return markets;
}
