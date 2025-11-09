import { NextRequest, NextResponse } from "next/server";

// Switch to Edge runtime for better performance
export const runtime = "edge";

/**
 * Trending Markets API
 * Fetches top 4 events by volume directly from Polymarket Gamma API
 *
 * NOTE: This bypasses MCP and calls Polymarket directly for reliable, structured data.
 * MCP is still used in /api/chat for conversational discovery.
 */
export async function GET(req: NextRequest) {
  try {
    console.log(
      "🔄 [Trending API] Fetching events from Polymarket Gamma API..."
    );

    // Call Polymarket Gamma API directly
    const response = await fetch(
      "https://gamma-api.polymarket.com/events?" +
        new URLSearchParams({
          limit: "4",
          closed: "false",
          active: "true",
          order: "volume",
          ascending: "false",
        }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        "❌ [Trending API] Polymarket API error:",
        response.status,
        response.statusText
      );
      return NextResponse.json({
        success: false,
        error: `Polymarket API error: ${response.status}`,
        useFallback: true,
      });
    }

    const events = await response.json();

    console.log(
      "📊 [Trending API] Received",
      events.length,
      "events from Polymarket"
    );

    if (!Array.isArray(events) || events.length === 0) {
      console.log("⚠️ [Trending API] No events found");
      return NextResponse.json({
        success: false,
        error: "No events found",
        useFallback: true,
      });
    }

    // Transform Polymarket events to our format
    // Each event can have multiple markets, we'll take the first market or aggregate
    const markets = events.slice(0, 4).map((event: any) => {
      // Get the first market if available
      const firstMarket = event.markets?.[0];

      return {
        id: event.id,
        slug: event.slug,
        question: event.title || firstMarket?.question || "Untitled Event",
        url: `https://polymarket.com/event/${event.slug}`,
        volume: event.volume || 0,
        liquidity: event.liquidity || 0,
        active: event.active ?? true,
        tags:
          event.tags
            ?.map((tag: any) => tag.label || tag.slug)
            .filter(Boolean) || [],
        currentPrices: firstMarket?.outcomePrices
          ? (() => {
              try {
                const prices = JSON.parse(firstMarket.outcomePrices);
                const outcomes = JSON.parse(firstMarket.outcomes || "[]");
                const priceMap: Record<string, number> = {};
                outcomes.forEach((outcome: string, i: number) => {
                  if (prices[i]) priceMap[outcome] = parseFloat(prices[i]);
                });
                return priceMap;
              } catch {
                return {};
              }
            })()
          : {},
      };
    });

    console.log("✅ [Trending API] Returning", markets.length, "markets");

    return NextResponse.json({
      success: true,
      markets,
    });
  } catch (error) {
    console.error("❌ [Trending API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        useFallback: true,
      },
      { status: 500 }
    );
  }
}
