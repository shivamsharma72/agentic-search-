# 🚀 Polyseer Hackathon Setup

This is a **simplified, hackathon-ready version** of Polyseer with:
- ✅ **No authentication required**
- ✅ **No billing/subscriptions**
- ✅ **No rate limits**
- ✅ **Direct API access**

## Quick Start

### 1. Get Your API Keys

You need two API keys:

1. **OpenAI API Key**
   - Go to: https://platform.openai.com/api-keys
   - Create a new key
   - Copy it (starts with `sk-`)

2. **Valyu API Key**
   - Go to: https://platform.valyu.network
   - Sign up and get your key
   - Copy it (starts with `vl_`)

### 2. Create Environment File

Create a file called `.env.local` in the project root:

```bash
OPENAI_API_KEY=sk-your-actual-key-here
VALYU_API_KEY=vl-your-actual-key-here
NEXT_PUBLIC_APP_MODE=development
NODE_ENV=development
```

### 3. Install and Run

```bash
npm install
npm run dev
```

### 4. Open in Browser

Open http://localhost:3000 and start analyzing markets!

## What Can You Do?

- Paste any **Polymarket** or **Kalshi** market URL
- Get AI-powered deep analysis using GPT-5 and multiple research agents
- See Bayesian probability calculations
- View evidence classification and quality scoring

## Example URLs

**Polymarket:**
```
https://polymarket.com/event/will-trump-win-2024
```

**Kalshi:**
```
https://kalshi.com/markets/kxtime/times-person-of-the-year/KXTIME-25
```

## Need Help?

- Check the main README.md for architecture details
- All authentication/billing code has been removed
- This is a pure development mode for hackathons

## Cost Note

You're using your own API keys, so:
- OpenAI charges per token used
- Valyu charges per search query
- Monitor your usage at their respective dashboards
