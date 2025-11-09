/**
 * Market URL Parser
 * Detects and parses Polymarket URLs
 */

export type MarketPlatform = 'polymarket';

export interface ParsedMarketUrl {
  platform: MarketPlatform;
  identifier: string; // Polymarket slug
  url: string;
  valid: boolean;
  error?: string;
}

/**
 * Polymarket URL patterns:
 * - https://polymarket.com/event/{slug}
 * - https://polymarket.com/markets/{slug} (legacy)
 */
const POLYMARKET_PATTERNS = [
  /^https?:\/\/(?:www\.)?polymarket\.com\/event\/([a-z0-9-]+)/i,
  /^https?:\/\/(?:www\.)?polymarket\.com\/markets\/([a-z0-9-]+)/i,
];

/**
 * Parse a Polymarket URL and extract the slug
 */
function parsePolymarketUrl(url: string): ParsedMarketUrl {
  for (const pattern of POLYMARKET_PATTERNS) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return {
        platform: 'polymarket',
        identifier: match[1],
        url,
        valid: true,
      };
    }
  }

  return {
    platform: 'polymarket',
    identifier: '',
    url,
    valid: false,
    error: 'Invalid Polymarket URL format. Expected: https://polymarket.com/event/{slug}',
  };
}

/**
 * Detect the platform from a URL
 */
export function detectPlatform(url: string): MarketPlatform | null {
  const normalizedUrl = url.toLowerCase();

  if (normalizedUrl.includes('polymarket.com')) {
    return 'polymarket';
  }

  return null;
}

/**
 * Parse a market URL from Polymarket
 */
export function parseMarketUrl(url: string): ParsedMarketUrl {
  if (!url || typeof url !== 'string') {
    return {
      platform: 'polymarket',
      identifier: '',
      url: '',
      valid: false,
      error: 'URL must be a non-empty string',
    };
  }

  const platform = detectPlatform(url);

  if (!platform) {
    return {
      platform: 'polymarket',
      identifier: '',
      url,
      valid: false,
      error: 'Unsupported URL. Only Polymarket URLs are supported.',
    };
  }

    return parsePolymarketUrl(url);
}

/**
 * Validate a market URL (convenience function)
 */
export function isValidMarketUrl(url: string): boolean {
  const parsed = parseMarketUrl(url);
  return parsed.valid;
}

/**
 * Extract identifier from URL (slug for Polymarket)
 */
export function extractIdentifier(url: string): string | null {
  const parsed = parseMarketUrl(url);
  return parsed.valid ? parsed.identifier : null;
}

/**
 * Get user-friendly platform name
 */
export function getPlatformName(platform: MarketPlatform): string {
  return 'Polymarket';
}
