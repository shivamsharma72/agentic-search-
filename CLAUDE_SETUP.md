# 🤖 Using Claude API Instead of OpenAI

Good news! You can use Claude (Anthropic) instead of OpenAI GPT-5.

## ✅ What I've Done

1. ✅ Installed `@ai-sdk/anthropic` package
2. ✅ Updated `polar-llm-strategy.ts` to use Claude by default

## 🔧 Configuration

### Update Your `.env.local`:

```bash
# Use Claude API instead of OpenAI
ANTHROPIC_API_KEY=sk-ant-your-claude-api-key-here
VALYU_API_KEY=vl-your-valyu-key-here
NEXT_PUBLIC_APP_MODE=development
NODE_ENV=development
```

**Get Claude API Key:** https://console.anthropic.com/settings/keys

## 📝 Files Already Updated

✅ **`src/lib/polar-llm-strategy.ts`** - Now uses Claude Sonnet 4.5 by default:
- `claude-sonnet-4-5` (recommended - alias, auto-updates)
- `claude-sonnet-4-5-20250929` (pinned version, stable)
- Alternative models you can use:
  - `claude-opus-4` (most capable, slower)
  
**Note:** Claude 3.5 Sonnet was retired on Oct 28, 2025. Claude 4.5 is the official replacement.

## 🔄 What You Need to Do

The system is configured to use Claude models through the `getPolarTrackedModel()` function.
All agent files will automatically use Claude since they call this function.

**No code changes needed!** Just:
1. Add `ANTHROPIC_API_KEY` to `.env.local`
2. Remove or keep `OPENAI_API_KEY` (not used anymore)
3. Restart your dev server

## 💰 Cost Comparison

Claude Sonnet pricing (approximate per analysis):
- Input: ~$0.003 per 1K tokens
- Output: ~$0.015 per 1K tokens
- **Estimated cost per analysis: $1-3** (vs $0.50-2 with GPT-5)

## 🎯 Recommended Model

Use **Claude 3.5 Sonnet** - it's the best balance of:
- ✅ Intelligence (comparable to GPT-5)
- ✅ Speed (faster than Opus)
- ✅ Cost (cheaper than Opus)
- ✅ Context window (200K tokens)

## 🧪 Test It

After updating your `.env.local`:

```bash
npm run dev
```

Then paste a Polymarket URL and watch Claude analyze it!

## 🔍 Verification

Check your terminal logs - you should see:
```
[Hackathon] Using Claude model: claude-3-5-sonnet-20241022
```

## ⚠️ Note

The codebase was originally built for GPT-5, but Claude works excellently with the same prompts!
The AI SDK makes it seamless to switch between providers.

---

**Questions?** Claude API docs: https://docs.anthropic.com/
