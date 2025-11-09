# 🚀 START HERE - Polyseer Hackathon Edition

## ⚡ Quick Start (3 Steps!)

### 1️⃣ Set Your API Keys

Edit `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
VALYU_API_KEY=vl-your-actual-key-here
NEXT_PUBLIC_APP_MODE=development
NODE_ENV=development
```

**Get your keys:**
- 🔑 Claude: https://console.anthropic.com/settings/keys
- 🔑 Valyu: https://platform.valyu.network

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Run the App

```bash
npm run dev
```

Open: **http://localhost:3000**

---

## 🎯 What This App Does

**Polyseer** is an AI-powered prediction market analysis platform that uses a **multi-agent AI system** to deeply analyze any Polymarket or Kalshi market.

### How It Works:

1. **Paste a market URL** (Polymarket or Kalshi)
2. **Watch 6 AI agents work together:**
   - 🔮 **Orchestrator** - Coordinates the entire analysis
   - 📋 **Planner** - Breaks down the question into research areas
   - 🔍 **Researcher** - Searches academic papers & news via Valyu
   - 📊 **Analyst** - Applies Bayesian probability reasoning
   - 🧐 **Critic** - Validates evidence quality
   - 📝 **Reporter** - Synthesizes final forecast
3. **Get a probability forecast** with confidence intervals and reasoning

---

## 🧠 What We Removed (Hackathon Mode)

✅ **No authentication** - Direct access, no signup
✅ **No billing** - Unlimited analysis (for demo)
✅ **No database** - Runs entirely in-memory
✅ **No rate limits** - Test as much as you want

---

## 🛠️ Tech Stack

- **AI**: Claude Sonnet 4.5 (Anthropic) - Latest model!
- **Framework**: Next.js 15 + React 19
- **Styling**: Tailwind CSS + Framer Motion
- **Search**: Valyu Search Network (academic papers + news)
- **Markets**: Polymarket & Kalshi integrations

---

## 📂 Key Files to Know

### Core AI Agents:
- `src/lib/agents/orchestrator.ts` - Main coordinator
- `src/lib/agents/planner.ts` - Research planning
- `src/lib/agents/researcher.ts` - Evidence gathering
- `src/lib/agents/analyst.ts` - Probability calculation
- `src/lib/agents/critic.ts` - Evidence validation
- `src/lib/agents/reporter.ts` - Final synthesis

### API Routes:
- `src/app/api/forecast/route.ts` - Main analysis endpoint
- `src/app/api/featured-markets/route.ts` - Featured markets

### Pages:
- `src/app/page.tsx` - Landing page
- `src/app/analysis/page.tsx` - Live analysis view

---

## 🐛 Troubleshooting

### Build Errors?
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Missing API Key Error?
- Check `.env.local` has both `ANTHROPIC_API_KEY` and `VALYU_API_KEY`
- Restart dev server after adding keys

### Port Already In Use?
```bash
# Kill the process on port 3000
npx kill-port 3000
npm run dev
```

---

## 🎨 Test URLs

Try these markets:

**Polymarket:**
- https://polymarket.com/event/will-trump-win-2024
- https://polymarket.com/event/will-ai-achieve-agi-by-2030

**Kalshi:**
- https://kalshi.com/markets/INXD

---

## 📚 Documentation

- `FINAL_AUDIT_REPORT.md` - Complete cleanup report
- `CLAUDE_SETUP.md` - Claude API details
- `HACKATHON_README.md` - Technical overview
- `SETUP_COMPLETE.md` - Original setup guide

---

## 🏆 Demo Tips

1. **Start with a simple question** to understand the flow
2. **Watch the agent step-by-step progress** in the UI
3. **Show the Bayesian reasoning** in the forecast card
4. **Highlight the Valyu search integration** for evidence
5. **Explain the multi-agent architecture** (6 agents working together)

---

## ⚡ Performance Notes

- First analysis takes ~30-60 seconds (Claude + Valyu searches)
- Each agent logs its progress to the UI
- Real-time streaming of analysis steps
- Uses Claude Sonnet 4.5 for high-quality reasoning (latest model!)

---

## 🎉 You're All Set!

```bash
npm run dev
# Visit http://localhost:3000
# Paste a market URL
# Watch the AI magic! ✨
```

---

**Questions?** Check the other documentation files or review the code!

**Status:** 🟢 100% Hackathon Ready!
