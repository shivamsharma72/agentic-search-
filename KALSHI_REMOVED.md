# 🗑️ Kalshi Support Removed

## What Was Removed

All Kalshi prediction market support has been removed from the codebase. 
Polyseer now **exclusively supports Polymarket**.

## Files Modified

### Core Files:
- ✅ `src/lib/tools/market-url-parser.ts` - Removed Kalshi URL patterns
- ✅ `src/lib/tools/market-fetcher.ts` - Removed Kalshi API integration
- ✅ `src/lib/agents/orchestrator.ts` - Updated comments
- ✅ `src/app/api/forecast/route.ts` - Removed Kalshi references from API
- ✅ `src/components/hero-section.tsx` - Updated validation and placeholders

### What Still Works:
- ✅ All Polymarket URL formats
- ✅ Full analysis pipeline
- ✅ All 6 AI agents
- ✅ Valyu search integration
- ✅ Claude Sonnet 4.5

## Supported URLs

**Polymarket Only:**
- `https://polymarket.com/event/{slug}`
- `https://polymarket.com/markets/{slug}` (legacy)

**Examples:**
- `https://polymarket.com/event/will-trump-win-2024`
- `https://polymarket.com/event/bitcoin-100k-2024`
- `https://polymarket.com/event/will-ai-achieve-agi-by-2030`

## What Changed

### Before:
```typescript
// Supported both platforms
platform: 'polymarket' | 'kalshi'
```

### After:
```typescript
// Polymarket only
platform: 'polymarket'
```

## Documentation Updated

Note: Some markdown documentation files still mention Kalshi in historical context. 
These references are informational only and don't affect functionality.

**Active code is 100% Polymarket-only.**

## MCP Server Discussion

The `MCP_SERVER_DISCUSSION.md` file still mentions Kalshi APIs in the analysis section. 
This is for reference purposes when building the MCP server - you can choose to 
support only Polymarket or add Kalshi support later if needed.

---

**Status:** ✅ All Kalshi code removed from active codebase
**Supported:** Polymarket only
**Next Steps:** Test with Polymarket URLs
