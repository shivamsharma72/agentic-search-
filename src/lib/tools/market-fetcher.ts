/**
 * Unified Market Data Fetcher
 * Abstracts market data fetching for Polymarket
 */

import { buildLLMPayloadFromSlug } from './polymarket';
import { parseMarketUrl, MarketPlatform } from './market-url-parser';

// Re-export common types
export type { MarketPlatform };

export interface MarketFetchOptions {
  historyInterval?: string;
  withBooks?: boolean;
  withTrades?: boolean;
  maxCandidates?: number;
}

export interface MarketSummary {
  question: string;
  close_time?: string | number;
  resolution_source?: string;
  volume?: number;
  liquidity?: number;
  token_map: { [outcome: string]: string };
  condition_id?: string; // Polymarket-specific
}

export interface MarketStateNowEntry {
  token_id: string;
  outcome?: string;
  bid?: number | null;
  ask?: number | null;
  mid?: number | null;
  top_bid_size?: number | null;
  top_ask_size?: number | null;
}

export interface MarketPayload {
  platform: MarketPlatform;
  market_facts: MarketSummary;
  market_state_now: MarketStateNowEntry[];
  history: { token_id: string; points: { t: number; p: number }[] }[];
  order_books?: any[];
  recent_trades?: any[];
  event_summary?: {
    is_multi_candidate: boolean;
    total_markets: number;
    active_markets: number;
    top_candidates: Array<{
      name: string;
      question: string;
      implied_probability: number;
      volume: number;
      liquidity: number;
      active: boolean;
      market: any;
    }>;
  };
}

/**
 * Fetch market data from Polymarket using URL
 * This is the main entry point for getting market data
 */
export async function fetchMarketDataFromUrl(
  url: string,
  options: MarketFetchOptions = {}
): Promise<MarketPayload> {
  // Parse the URL to determine platform and identifier
  const parsed = parseMarketUrl(url);

  if (!parsed.valid) {
    throw new Error(parsed.error || 'Invalid market URL');
  }

  console.log(`📊 Fetching ${parsed.platform} market data for: ${parsed.identifier}`);

  // Fetch data from Polymarket
    const data = await buildLLMPayloadFromSlug(parsed.identifier, options);
    return {
      platform: 'polymarket',
      ...data,
    };
}

/**
 * Fetch market data using direct identifier (bypasses URL parsing)
 * Useful when you already know the identifier/slug
 */
export async function fetchMarketDataByIdentifier(
  platform: MarketPlatform,
  identifier: string,
  options: MarketFetchOptions = {}
): Promise<MarketPayload> {
  console.log(`📊 Fetching ${platform} market data for: ${identifier}`);

  if (platform !== 'polymarket') {
    throw new Error(`Unsupported platform: ${platform}`);
  }

    const data = await buildLLMPayloadFromSlug(identifier, options);
    return {
      platform: 'polymarket',
      ...data,
    };
}

/**
 * Get platform-specific market URL
 */
export function buildMarketUrl(platform: MarketPlatform, identifier: string): string {
  if (platform === 'polymarket') {
    return `https://polymarket.com/event/${identifier}`;
  }

  throw new Error(`Unsupported platform: ${platform}`);
}
