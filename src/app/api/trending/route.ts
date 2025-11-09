import { NextRequest, NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp/client";
import { listEvents, eventToAppMarket } from "@/lib/polymarket/client";

// Switch to Node.js runtime for MCP SDK compatibility
export const runtime = "nodejs";

/**
 * Trending Markets API - Hybrid MCP + Polymarket API
 * 1. Try MCP featured resource first
 * 2. Fallback to direct Polymarket API
 */
export async function GET(req: NextRequest) {
  try {
    console.log(
      "🔥 [Trending API] Fetching featured markets via MCP resource..."
    );

    const mcpClient = getMCPClient();

    // Strategy 1: Use MCP featured resource
    const resourceResult = await mcpClient.getResource("polymarket://featured");

    if (resourceResult.success && resourceResult.data) {
      console.log("✅ [Trending API] Got featured events from MCP");

      // Parse the featured events
      let events = [];
      if (Array.isArray(resourceResult.data)) {
        events = resourceResult.data;
      } else if (typeof resourceResult.data === "string") {
        try {
          events = JSON.parse(resourceResult.data);
        } catch (e) {
          console.error("❌ [Trending API] Failed to parse JSON:", e);
        }
      }

      if (events.length > 0) {
        // Extract markets from events (each event has a list of markets)
        const markets: any[] = [];
        for (const event of events.slice(0, 6)) {
          if (event.markets && Array.isArray(event.markets)) {
            // Get the first market from each event
            const market = event.markets[0];
            if (market) {
              // Parse outcomePrices if it exists
              let currentPrices: Record<string, number> = {};
              if (market.outcomePrices) {
                try {
                  const pricesArray = JSON.parse(market.outcomePrices);
                  const outcomesArray = JSON.parse(
                    market.outcomes || '["Yes", "No"]'
                  );
                  // Create a map of outcome -> price
                  outcomesArray.forEach((outcome: string, index: number) => {
                    currentPrices[outcome] = parseFloat(
                      pricesArray[index] || 0
                    );
                  });
                } catch (e) {
                  console.error("❌ [Trending API] Failed to parse prices:", e);
                }
              }

              markets.push({
                id: market.id || event.id,
                question: market.question || event.title,
                slug: market.slug || event.slug,
                volume: parseFloat(market.volume) || 0,
                liquidity: parseFloat(market.liquidity) || 0,
                active: event.active !== false,
                tags: event.tags?.map((t: any) => t.label || t) || [],
                url: `https://polymarket.com/event/${
                  market.slug || event.slug
                }`,
                currentPrices,
              });
            }
          } else {
            // Event doesn't have markets array, use event itself
            markets.push({
              id: event.id,
              question: event.title,
              slug: event.slug,
              volume: 0,
              liquidity: 0,
              active: event.active !== false,
              tags: event.tags?.map((t: any) => t.label || t) || [],
              url: `https://polymarket.com/event/${event.slug}`,
              currentPrices: {},
            });
          }
        }

        const topMarkets = markets.slice(0, 4);

        console.log(
          `✅ [Trending API] Returning ${topMarkets.length} featured markets (MCP)`
        );

        return NextResponse.json({
          success: true,
          markets: topMarkets,
          source: "mcp_featured_resource",
        });
      }
    }

    // Strategy 2: Fallback to direct Polymarket API
    console.log("🔄 [Trending API] Fallback: Using typed Polymarket client...");

    const events = await listEvents(20, 0);

    if (events.length > 0) {
      // Sort by volume and take top 4
      const sortedEvents = events
        .sort((a, b) => (b.volume24hr || 0) - (a.volume24hr || 0))
        .slice(0, 4);

      const markets = sortedEvents.map(eventToAppMarket);

      console.log(
        `✅ [Trending API] Returning ${markets.length} markets from Polymarket API`
      );

      return NextResponse.json({
        success: true,
        markets,
        source: "polymarket_direct_api",
      });
    }

    // No markets found
    return NextResponse.json({
      success: false,
      error: "No trending markets found",
    });
  } catch (error) {
    console.error("❌ [Trending API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
