# 🤖 MCP Server Integration Discussion for Polyseer Chatbot

## 📊 Current Architecture Analysis

### **Current Flow:**
```
User Input (URL) 
  → Frontend (paste URL)
  → API Route (/api/forecast)
  → URL Parser (extract slug/ticker)
  → Market Data Fetcher (Polymarket/Kalshi APIs)
  → Orchestrator (coordinates 6 AI agents)
  → Claude Sonnet 4.5 (multi-agent analysis)
  → Valyu Search (academic papers, news, web)
  → Result streaming back to frontend
```

---

## 🔍 What API Calls Are We Making?

### **1. Polymarket API Calls** (`src/lib/tools/polymarket.ts`)
- **Gamma API** (`gamma-api.polymarket.com`):
  - `GET /markets?slug={slug}` - Get market details
  - `GET /events?slug={slug}` - Get event details (multi-candidate markets)
  
- **CLOB API** (`clob.polymarket.com`):
  - `GET /price` - Get current prices
  - `GET /book` - Get order book data (bid/ask spreads)
  - `GET /trades` - Get recent trade history
  
- **Data API** (`data-api.polymarket.com`):
  - `GET /prices/history` - Get historical price data (1h, 4h, 1d, 1w intervals)

**Data Retrieved:**
- Market question, close time, resolution source
- Current prices (bid/ask/mid)
- Historical price series
- Order book depth
- Recent trades
- Volume, liquidity metrics
- Multi-candidate event summaries

### **2. Kalshi API Calls** (`src/lib/tools/kalshi.ts`)
- `GET /markets/{ticker}` - Get market details
- `GET /events/{event_ticker}` - Get event details
- Similar data structure to Polymarket

### **3. Valyu Search Network** (`src/lib/tools/valyu_search.ts`)
- **Deep Search**: Academic papers, proprietary data, web content
- **Web Search**: Real-time web information
- **Search Types**: `all`, `web`, `market`, `academic`, `proprietary`
- **Queries**: AI-generated based on market question
  - Example: "Trump polling data swing states 2024"
  - Example: "AI AGI breakthrough research papers"

**Data Retrieved:**
- Academic papers (titles, URLs, snippets)
- News articles
- Market-related web content
- Dates, relevance scores, costs

### **4. Claude API** (via AI SDK)
- Model: `claude-sonnet-4-5`
- Used by 6 agents: Orchestrator, Planner, Researcher, Analyst, Critic, Reporter
- Structured outputs using Zod schemas
- Tool calling (valyuDeepSearch, valyuWebSearch)

---

## 🎯 MCP Server Opportunities

### **Option 1: Polymarket MCP Server** ⭐ (BEST FIT)

**What it could do:**
```typescript
// MCP Server Tools:
- get_market_by_url(url: string)
- get_market_by_slug(slug: string)
- get_market_prices(slug: string)
- get_market_history(slug: string, interval: string)
- get_order_book(slug: string)
- search_markets(query: string)
- get_trending_markets()
```

**Where it sits:**
```
Chatbot UI
  ↓
Claude with MCP
  ↓ (tool call: get_market_by_url)
MCP Server (Polymarket Tools)
  ↓ (fetches data)
Polymarket APIs
  ↓ (returns structured data)
Your existing analysis pipeline
```

**Benefits:**
- ✅ Claude can **discover markets** via natural language
- ✅ No need to paste URLs - just say "analyze Trump's chances"
- ✅ Can handle multi-turn conversations
- ✅ Can compare multiple markets
- ✅ Can search for related markets

**Example Interaction:**
```
User: "What's the market saying about Trump winning 2024?"
  
Claude (via MCP): 
  → calls get_market_by_search("trump 2024 election")
  → gets slug: "will-trump-win-2024"
  → calls get_market_prices("will-trump-win-2024")
  → gets current odds: 55% Yes, 45% No
  → passes slug to your existing pipeline
  → returns full analysis

User: "Compare that to Biden's chances"
  
Claude (via MCP):
  → calls get_market_by_search("biden 2024")
  → compares data
  → uses your analysis pipeline for both
```

---

### **Option 2: Valyu Search MCP Server** (NICE TO HAVE)

**What it could do:**
```typescript
// MCP Server Tools:
- search_academic(query: string)
- search_news(query: string)
- search_market_data(query: string)
```

**Where it sits:**
```
Chatbot Claude
  ↓ (decides to search for evidence)
MCP Server (Valyu Tools)
  ↓
Valyu API
  ↓
Return search results to Claude
```

**Benefits:**
- ✅ Claude can pull real-time research during conversation
- ✅ Can fact-check claims on the fly
- ✅ Can do follow-up research based on user questions

**Example:**
```
User: "What's driving the AI AGI market?"

Claude (via MCP):
  → calls search_academic("AI AGI recent breakthroughs")
  → calls search_news("OpenAI GPT-5 announcements")
  → synthesizes findings
  → provides contextual analysis
```

---

### **Option 3: Custom Polyseer MCP Server** 🚀 (MOST POWERFUL)

**What it could do:**
```typescript
// Combine everything into one MCP server:
- analyze_market(url: string)
- search_markets(query: string)
- compare_markets(url1: string, url2: string)
- get_market_trends(category: string)
- explain_forecast(slug: string)
- get_evidence_for_claim(claim: string, market: string)
```

**Where it sits:**
```
Chatbot UI (any MCP-compatible client)
  ↓
Claude with Polyseer MCP Server
  ↓ (calls any tool)
Your Entire Backend
  ↓
Returns rich, conversational responses
```

**Benefits:**
- ✅ Full conversational interface
- ✅ Multi-turn reasoning
- ✅ Context-aware analysis
- ✅ Can ask follow-up questions
- ✅ Can compare markets
- ✅ Can explain reasoning

**Example Flow:**
```
User: "I'm worried about the election outcome"

Claude (via MCP):
  → calls search_markets("2024 presidential election")
  → finds relevant markets
  → calls analyze_market() on top 3
  → synthesizes comprehensive view
  
User: "What's the biggest uncertainty?"

Claude:
  → uses previous context
  → calls get_evidence_for_claim("swing state uncertainty", market)
  → provides detailed breakdown
  
User: "Show me the polling data"

Claude (via MCP):
  → Already has context from analysis
  → Extracts polling evidence from previous research
  → Formats and presents
```

---

## 🏗️ Recommended Architecture

### **Phase 1: Polymarket MCP Server (Quick Win)**

**Create a simple MCP server with these tools:**

1. **`get_market_by_url(url: string)`**
   - Wraps your `parseMarketUrl()` + `fetchMarketDataFromUrl()`
   - Returns: slug, question, current prices, volume, liquidity

2. **`search_markets(query: string)`**
   - Wraps Polymarket search API
   - Returns: list of matching markets with slugs

3. **`analyze_market(url: string, options?)`**
   - Calls your entire `/api/forecast` pipeline
   - Returns: ForecastCard with streaming support

**Integration Point:**
```
Your existing API routes remain unchanged!
MCP server acts as a "smart wrapper" around them.

src/mcp-server/
  ├── index.ts (MCP server entry)
  ├── tools/
  │   ├── polymarket-tools.ts
  │   └── analysis-tools.ts
  └── types.ts
```

**Chatbot Flow:**
```
User message
  ↓
Claude (with Polyseer MCP)
  ↓ (calls MCP tools)
MCP Server
  ↓ (calls your APIs)
Your existing backend (unchanged!)
  ↓
Results stream back
```

---

### **Phase 2: Add Valyu Search MCP Tools**

Add these to your MCP server:
- `search_evidence(query: string, type: string)`
- `get_recent_news(topic: string)`
- `find_academic_papers(query: string)`

**Now Claude can:**
```
User: "Why is the AGI market at 30%?"

Claude:
  → get_market_by_url("polymarket.com/agi-2030")
  → search_evidence("AGI breakthrough research 2024")
  → search_recent_news("artificial general intelligence")
  → Synthesizes comprehensive answer
```

---

### **Phase 3: Full Conversational Agent**

**Add memory and context:**
- Store conversation history
- Track analyzed markets
- Remember user preferences

**Add advanced tools:**
- `compare_markets(url1, url2)`
- `track_market_changes(url, since)`
- `explain_probability(market, outcome)`

---

## 💡 Key Insights

### **What Makes This Powerful:**

1. **No URL Required**: 
   - Current: User must find and paste URL
   - MCP: "What's the market saying about X?" → Claude finds it

2. **Multi-Market Analysis**:
   - Current: One market at a time
   - MCP: "Compare all AI markets" → Claude analyzes multiple

3. **Conversational Depth**:
   - Current: One-shot analysis
   - MCP: Multi-turn Q&A with context

4. **Real-Time Research**:
   - Current: Research happens during analysis
   - MCP: Claude can research during conversation

5. **Discovery**:
   - Current: User must know what markets exist
   - MCP: "Show me trending prediction markets" → Claude explores

---

## 🛠️ Technical Considerations

### **MCP Server Location:**

**Option A: Separate Node.js Server**
```
polyseer-mcp/
  ├── src/
  │   ├── index.ts (MCP server)
  │   ├── tools/ (tool implementations)
  │   └── api-client.ts (calls your Next.js APIs)
  └── package.json
```

**Option B: Next.js API Routes as MCP**
```
src/app/api/mcp/
  ├── tools/
  ├── server.ts
  └── route.ts
```

### **Data Flow:**

```
┌─────────────────┐
│   Chat UI       │ (Claude Desktop, Custom UI, etc.)
│   (MCP Client)  │
└────────┬────────┘
         │ MCP Protocol (stdio/SSE)
         ↓
┌─────────────────┐
│   MCP Server    │ (Your new layer)
│  - Polymarket   │
│  - Analysis     │
│  - Search       │
└────────┬────────┘
         │ HTTP/Fetch
         ↓
┌─────────────────┐
│  Your Existing  │ (No changes needed!)
│  Next.js APIs   │
│  - /api/forecast│
│  - Polymarket   │
│  - Valyu        │
└─────────────────┘
```

### **What Stays the Same:**

- ✅ Your entire agent pipeline
- ✅ All API routes
- ✅ Polymarket/Kalshi fetching
- ✅ Valyu search integration
- ✅ Claude analysis
- ✅ Frontend (if you want)

### **What Changes:**

- ➕ Add MCP server as new entry point
- ➕ Expose tools via MCP protocol
- ➕ Enable conversational interface

---

## 🚦 Recommendation

**For your hackathon, I recommend:**

### **Quick Path (2-3 hours):**
Build a **Polymarket MCP Server** with 3 tools:
1. `search_markets(query)` - Find markets by description
2. `get_market_data(url)` - Get market details
3. `analyze_market(url)` - Trigger full analysis

Hook it up to Claude Desktop → **Instant chatbot!**

### **Why This Works:**
- ✅ Minimal code (mostly wrapping existing functions)
- ✅ Your backend stays unchanged
- ✅ Impressive demo: "Ask Claude about any market"
- ✅ Shows MCP integration
- ✅ Conversational + your deep analysis

### **Demo Script:**
```
User: "What's happening with the election markets?"
  → Claude searches, finds markets
  → Presents options

User: "Analyze Trump's chances"
  → Claude triggers your full pipeline
  → Shows streaming analysis

User: "What about swing states?"
  → Claude does follow-up research
  → Pulls specific evidence
```

**This combines:**
- 🤖 Conversational AI (MCP)
- 🧠 Deep analysis (your existing agents)
- 📊 Real data (Polymarket APIs)
- 🔬 Research (Valyu)

**Much more impressive than just "paste URL"!**
