import { NextResponse } from 'next/server';
// Hackathon Mode: No database, return static featured markets

export interface FeaturedMarket {
  id: number;
  slug: string;
  question: string;
  category: string | null;
  polymarket_url: string;
  volume: number;
  end_date: string;
  current_odds: any;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
}

export interface FeaturedMarketsResponse {
  success: boolean;
  markets: FeaturedMarket[];
  count: number;
  last_updated?: string;
}

// Static featured markets for hackathon mode
const STATIC_FEATURED_MARKETS: FeaturedMarket[] = [
  {
    id: 1,
    slug: 'will-trump-win-2024',
    question: 'Will Trump win the 2024 Presidential Election?',
    category: 'Politics',
    polymarket_url: 'https://polymarket.com/event/will-trump-win-2024',
    volume: 100000000,
    end_date: '2024-11-05T00:00:00Z',
    current_odds: { yes: 0.55, no: 0.45 },
    sort_order: 1,
    is_active: true,
    updated_at: new Date().toISOString()
  }
];

export async function GET() {
  try {
    console.log('[API] Returning static featured markets (hackathon mode)');

    const response: FeaturedMarketsResponse = {
      success: true,
      markets: STATIC_FEATURED_MARKETS,
      count: STATIC_FEATURED_MARKETS.length,
      last_updated: new Date().toISOString()
    };

    // Cache for 1 hour
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800'
      }
    });

  } catch (error) {
    console.error('[API] Unexpected error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        markets: [], 
        count: 0 
      },
      { status: 500 }
    );
  }
}

// Optional: Handle CORS for client-side requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}