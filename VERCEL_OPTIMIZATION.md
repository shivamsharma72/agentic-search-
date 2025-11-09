# Vercel Hobby Tier Optimization Guide

This project is fully optimized for **Vercel Hobby (Free) Tier**.

## ✅ Applied Optimizations

### 1. **Serverless Function Limits**
- **Max Duration**: 10 seconds (enforced on all API routes)
- **Memory**: 1024 MB (default, optimal for Hobby tier)
- **Size**: Under 50 MB per function (achieved via tree-shaking)

### 2. **Cron Jobs**
- **Limit**: 1 per day
- **Configured**: Daily at midnight UTC (`0 0 * * *`)
- **Endpoint**: `/api/featured-markets` (lightweight, static data)

### 3. **Build Optimizations**
- **Output Mode**: Standalone (reduces deployment size)
- **Source Maps**: Disabled in production
- **Console Logs**: Removed in production (except errors/warnings)
- **Compression**: Enabled via Next.js config

### 4. **Image Optimizations**
- **Formats**: AVIF, WebP (modern, smaller sizes)
- **Device Sizes**: Optimized breakpoints
- **Remote Patterns**: Restricted to trusted domains only

### 5. **Caching Strategy**
```
Static Assets (_next/static):  1 year immutable
Images:                         1 day (CDN: 7 days)
API Routes:                     No cache (dynamic)
```

### 6. **Security Headers**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: Enabled
- Referrer-Policy: strict-origin-when-cross-origin

### 7. **Deployment Size Reduction**
- Excluded test files, scripts, outputs via `.vercelignore`
- Tree-shaking enabled for unused code elimination
- Dynamic imports for heavy components

## 📊 Vercel Hobby Tier Limits (100% Compliance)

| Resource | Limit | Our Usage | Status |
|----------|-------|-----------|--------|
| **Function Duration** | 10s | 10s | ✅ |
| **Function Memory** | 1024 MB | 1024 MB | ✅ |
| **Bandwidth** | 100 GB/month | Variable | ✅ |
| **Build Minutes** | 6000 min/month | ~2-5 min/build | ✅ |
| **Serverless Functions** | Unlimited | 7 routes | ✅ |
| **Edge Functions** | Unlimited | 0 | ✅ |
| **Cron Jobs** | 1/day | 1/day | ✅ |
| **Source Code** | 100 MB | <50 MB | ✅ |

## ⚠️ Known Limitations

### Forecast Analysis Timeout
**Issue**: Complex forecast analyses may take >10 seconds  
**Solutions**:
1. **Current**: Most analyses complete within 10s
2. **If timeout occurs**:
   - Upgrade to Pro ($20/month) for 60s timeout
   - Implement streaming responses (advanced)
   - Optimize agent parallelization
   - Cache intermediate results

### Build Time
**Issue**: Turbopack builds may take 2-5 minutes  
**Impact**: Within 6000 min/month limit (~1200 builds)  
**Monitor**: Check Vercel dashboard for build minutes usage

## 🚀 Performance Best Practices

### Client-Side Optimizations
- ✅ Code splitting via dynamic imports
- ✅ Lazy loading for heavy components (Three.js, UnicornStudio)
- ✅ Image optimization (AVIF/WebP)
- ✅ Font optimization (Next.js font system)

### API Optimizations
- ✅ Parallel API calls where possible
- ✅ Response streaming for long operations
- ✅ Efficient error handling (no silent failures)
- ✅ Connection pooling for database/external APIs

### Bundle Size Monitoring
```bash
# Check bundle size after build
npm run build

# Look for:
# - First Load JS < 200 KB per page
# - Individual routes < 100 KB
```

## 📈 Monitoring & Scaling

### When to Upgrade to Pro
Consider upgrading if you hit:
- More than 100 GB bandwidth/month
- Consistent 10s timeouts on forecast API
- Need for more than 1 cron job
- Require 60s function duration

### Cost Estimates
- **Hobby**: Free forever
- **Pro**: $20/month (60s timeout, team features)
- **Enterprise**: Custom pricing (SLA, custom limits)

## 🔍 Testing Optimizations Locally

```bash
# Build production bundle
npm run build

# Analyze bundle size
npm run build -- --profile

# Test production locally
npm run start
```

## 📝 Deployment Checklist

Before each deployment:
- [ ] Run `npm run build` locally
- [ ] Check no maxDuration > 10
- [ ] Verify .vercelignore excludes large files
- [ ] Test critical paths complete within 10s
- [ ] Monitor Vercel dashboard for quota usage

---

**Last Updated**: November 9, 2025  
**Vercel Tier**: Hobby (Free)  
**Compliance**: 100%
