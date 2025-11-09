# 🎯 Polyseer - Hackathon Edition

**AI-Powered Prediction Market Analysis** - Simplified for hackathons!

This is a stripped-down, hackathon-ready version with **NO AUTH, NO BILLING, NO LIMITS**.

---

## 🚀 Quick Start (3 Steps)

### 1. Get API Keys

You need two free API keys:

**OpenAI** (for GPT-5 analysis):
- Visit: https://platform.openai.com/api-keys
- Create new key (starts with `sk-`)

**Valyu** (for search network):
- Visit: https://platform.valyu.network
- Sign up and get key (starts with `vl_`)

### 2. Setup Environment

Create `.env.local` in the project root:

```bash
OPENAI_API_KEY=sk-your-actual-key-here
VALYU_API_KEY=vl-your-actual-key-here
NEXT_PUBLIC_APP_MODE=development
NODE_ENV=development
```

### 3. Run

```bash
npm install
npm run dev
```

Open **http://localhost:3000** and paste any Polymarket or Kalshi URL!

---

## ✨ What You Get

### Multi-Agent AI System
- **Planner Agent**: Breaks down questions
- **Researcher Agent**: Finds evidence  
- **Critic Agent**: Identifies gaps
- **Analyst Agent**: Bayesian probability math
- **Reporter Agent**: Generates reports

### Real-Time Analysis
- Watch agents work in real-time
- See evidence gathering
- View probability calculations
- Get final verdict with confidence scores

### Supported Platforms
- **Polymarket**: `https://polymarket.com/event/[slug]`
- **Kalshi**: `https://kalshi.com/markets/[series]/[category]/[ticker]`

---

## 🏗️ What Was Removed

To make this hackathon-ready, we removed:
- ❌ Supabase authentication
- ❌ Polar billing integration  
- ❌ Rate limiting
- ❌ User accounts
- ❌ Subscription tiers
- ❌ Usage tracking
- ❌ Analysis history

---

## 💡 Example Usage

```
1. Open http://localhost:3000
2. Paste: https://polymarket.com/event/will-trump-win-2024
3. Click "Analyze"
4. Watch the magic happen!
```

---

## 💰 Cost Note

You're using YOUR API keys, so you pay for:
- **OpenAI**: ~$0.50-2.00 per analysis (GPT-5)
- **Valyu**: Per search query (check their pricing)

Monitor usage at their dashboards.

---

## 🛠️ Tech Stack

- **Next.js 15.5** with Turbopack
- **React 19** 
- **GPT-5** via OpenAI
- **Valyu Search Network**
- **Tailwind CSS 4**
- **Framer Motion**
- **TypeScript**

---

## 📚 How It Works

1. **Parse URL** → Detect Polymarket or Kalshi
2. **Fetch Market Data** → Get current odds, volume, etc.
3. **Plan Research** → Generate search queries
4. **Research Evidence** → PRO and CON arguments
5. **Critic Analysis** → Find gaps, suggest follow-ups
6. **Aggregate Probabilities** → Bayesian math
7. **Generate Report** → Markdown output with verdict

---

## 🐛 Troubleshooting

**Error: "API key required"**
- Check `.env.local` exists
- Verify keys are correct
- Restart dev server

**Error: "Module not found"**
- Run `npm install` again
- Delete `node_modules` and reinstall

**Slow analysis**
- Normal! Can take 2-5 minutes
- GPT-5 + multiple search queries
- Watch progress updates

---

## 📖 Full Documentation

See main README.md for:
- Architecture details
- Agent system deep dive
- Mathematical formulas
- Evidence classification

---

## 🤝 Contributing

This is open source! Found a bug or have ideas?
- Check the issues
- Submit a PR
- Fork and experiment!

---

**Built with ❤️ for hackathons. Now go build something awesome! 🚀**
