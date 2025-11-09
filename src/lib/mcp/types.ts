/**
 * MCP Types for Smithery Polymarket MCP Server
 * Based on: @aryankeluskar/polymarket-mcp
 */

export interface PolymarketMarket {
  id: string;
  question: string;
  slug: string;
  description?: string;
  outcomes: string[];
  volume: number;
  liquidity: number;
  end_date?: string;
  active: boolean;
  tags?: string[];
  current_prices?: Record<string, number>;
}

export interface PolymarketEvent {
  id: string;
  slug: string;
  title: string;
  description?: string;
  markets: PolymarketMarket[];
  tags?: string[];
}

export interface PolymarketTag {
  id: string;
  label: string;
  slug: string;
}

export interface SearchMarketsParams {
  query?: string;
  tag?: string;
  limit?: number;
  closed?: boolean; // false = exclude closed markets, true = include closed
  ascending?: boolean;
  order?: 'volume' | 'liquidity' | 'end_date';
}

export interface MCPToolResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

