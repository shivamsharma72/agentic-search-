# 🔧 Claude Model Name Fix - UPDATED

## ❌ The Problem

The error was:
```
model: claude-3-5-sonnet-20240620
statusCode: 404
"type":"not_found_error"
```

**Claude 3.5 Sonnet was RETIRED on October 28, 2025!** ⚠️

Anthropic deprecated both snapshots:
- ❌ `claude-3-5-sonnet-20240620` (retired)
- ❌ `claude-3-5-sonnet-20241022` (retired)

## ✅ The Fix - Claude Sonnet 4.5

Updated to use the **official replacement: Claude Sonnet 4.5**

```typescript
'claude-sonnet-4-5'  // ✅ CORRECT (alias, auto-updates)
```

Or use the pinned version:
```typescript
'claude-sonnet-4-5-20250929'  // ✅ CORRECT (stable snapshot)
```

### Updated Model Mapping:

```typescript
'gpt-5' → 'claude-sonnet-4-5'
'gpt-5-mini' → 'claude-sonnet-4-5'
'gpt-4' → 'claude-sonnet-4-5'
'gpt-4-turbo' → 'claude-opus-4'
```

## 📝 Valid Claude Model Names (2025)

According to Anthropic API (current as of Nov 2025):

### Claude 4.5 Family (Recommended):
- `claude-sonnet-4-5` ✅ (Alias - auto-updates, **Default**)
- `claude-sonnet-4-5-20250929` ✅ (Pinned version)
- `claude-opus-4` ✅ (Most capable)

### Retired Models (DO NOT USE):
- ❌ `claude-3-5-sonnet-20240620` (retired Oct 28, 2025)
- ❌ `claude-3-5-sonnet-20241022` (retired)
- ❌ `claude-3-opus-20240229` (deprecated)

## 📚 References

- [Claude Sonnet 4.5 Alias](https://docs.anthropic.com/en/docs/about-claude/models#model-names)
- [Claude Sonnet 4.5 Pinned Version](https://docs.anthropic.com/en/docs/about-claude/models#model-recommendations)
- [Deprecation Notice](https://docs.anthropic.com/en/docs/resources/model-deprecations)

## 🚀 Next Steps

1. **The fix is already applied!**
2. **Restart your dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```
3. **Test again** with any Polymarket URL

The 404 error should now be resolved with Claude Sonnet 4.5! 🎉

## 🎯 Why Use the Alias vs Pinned Version?

**`claude-sonnet-4-5` (Alias - Recommended):**
- ✅ Always uses the latest snapshot
- ✅ Automatic performance improvements
- ✅ Better for hackathons/demos

**`claude-sonnet-4-5-20250929` (Pinned):**
- ✅ Stable, predictable behavior
- ✅ Better for production
- ✅ No surprise changes

**For your hackathon, the alias is perfect!**
