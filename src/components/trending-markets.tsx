"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, TrendingUp, DollarSign } from "lucide-react";

interface TrendingMarket {
  id: string;
  slug: string;
  question: string;
  url: string;
  volume: number;
  liquidity: number;
  active: boolean;
  tags: string[];
  currentPrices: Record<string, number>;
}

// Fallback markets in case API fails
const fallbackMarkets: TrendingMarket[] = [
  {
    id: "1",
    slug: "bitcoin-150k-2025",
    question: "Will Bitcoin reach $150,000 by end of 2025?",
    url: "https://polymarket.com/event/bitcoin-150k-2025",
    volume: 4320000,
    liquidity: 1500000,
    active: true,
    tags: ["Crypto"],
    currentPrices: { Yes: 0.28, No: 0.72 },
  },
  {
    id: "2",
    slug: "us-recession-2025",
    question: "Will the US enter a recession in 2025?",
    url: "https://polymarket.com/event/us-recession-2025",
    volume: 9245000,
    liquidity: 3200000,
    active: true,
    tags: ["Economics"],
    currentPrices: { Yes: 0.085, No: 0.915 },
  },
  {
    id: "3",
    slug: "ethereum-5k-2025",
    question: "Will Ethereum hit $5,000 by 2025?",
    url: "https://polymarket.com/event/ethereum-5k-2025",
    volume: 3899000,
    liquidity: 1100000,
    active: true,
    tags: ["Crypto"],
    currentPrices: { Yes: 0.35, No: 0.65 },
  },
  {
    id: "4",
    slug: "ai-breakthrough-2025",
    question: "Major AI breakthrough in 2025?",
    url: "https://polymarket.com/event/ai-breakthrough-2025",
    volume: 2500000,
    liquidity: 800000,
    active: true,
    tags: ["AI", "Tech"],
    currentPrices: { Yes: 0.42, No: 0.58 },
  },
];

export default function TrendingMarkets() {
  const [markets, setMarkets] = useState<TrendingMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        setIsLoading(true);
        console.log("🔄 [Trending] Fetching markets from MCP...");

        const response = await fetch("/api/trending");
        const data = await response.json();

        if (data.success && data.markets && data.markets.length > 0) {
          console.log("✅ [Trending] Fetched markets:", data.markets);
          setMarkets(data.markets);
        } else {
          console.log("⚠️ [Trending] No markets from API, using fallback");
          setMarkets(fallbackMarkets);
        }
      } catch (error) {
        console.error("❌ [Trending] Error fetching markets:", error);
        setMarkets(fallbackMarkets);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrending();
  }, []);

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`;
    return `$${volume}`;
  };

  const getYesPercentage = (prices?: Record<string, number>) => {
    if (!prices) return 0;
    const yesPrice = prices.Yes || prices.yes || 0;
    return Math.round(yesPrice * 100);
  };

  if (isLoading) {
    return (
      <section className="relative flex-1 overflow-hidden py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-[family-name:var(--font-space)] flex items-center gap-2 justify-center">
              <TrendingUp className="h-6 w-6 text-purple-400 animate-pulse" />
              Loading Trending Markets...
            </h2>
          </div>

          {/* Loading Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 h-40 animate-pulse"
              >
                <div className="h-4 bg-white/20 rounded mb-3 w-3/4"></div>
                <div className="h-3 bg-white/20 rounded mb-2 w-full"></div>
                <div className="h-3 bg-white/20 rounded mb-4 w-2/3"></div>
                <div className="h-2 bg-white/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative flex-1 overflow-hidden py-8">
      <div className="container mx-auto px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white font-[family-name:var(--font-space)] flex items-center gap-2 justify-center">
            <TrendingUp className="h-6 w-6 text-purple-400" />
            Trending Markets
          </h2>
          <p className="text-white/60 text-sm mt-2">
            Top markets by volume • Click to view on Polymarket
          </p>
        </motion.div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {markets.map((market, index) => {
            const yesPercent = getYesPercentage(market.currentPrices);

            return (
              <motion.a
                key={market.id}
                href={market.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 h-full hover:bg-white/15 hover:border-white/30 transition-all duration-300 cursor-pointer">
                  {/* External link icon */}
                  <div className="absolute top-4 right-4">
                    <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                  </div>

                  {/* Market Question */}
                  <h3 className="text-white font-medium text-sm md:text-base pr-6 line-clamp-3 mb-3 group-hover:text-purple-300 transition-colors">
                    {market.question}
                  </h3>

                  {/* Tags */}
                  {market.tags && market.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {market.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-white/60">
                        <DollarSign className="w-3 h-3" />
                        <span>{formatVolume(market.volume)}</span>
                      </div>
                      {yesPercent > 0 && (
                        <div className="text-white/80 font-medium">
                          {yesPercent}% YES
                        </div>
                      )}
                    </div>

                    {/* Probability Bar */}
                    {yesPercent > 0 && (
                      <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all"
                          style={{ width: `${yesPercent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Helper text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-white/40 text-xs mt-6"
        >
          Live data from Polymarket • Markets open in new tab
        </motion.p>
      </div>
    </section>
  );
}
