"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  DollarSign,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Clock,
} from "lucide-react";
import type { PolymarketMarket } from "@/lib/mcp/types";
import Link from "next/link";

function DiscoverContent() {
  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && q !== query) {
      setQuery(q);
      setMarkets([]); // Clear previous results
      fetchMarkets(q);
    }
  }, [searchParams]);

  const fetchMarkets = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      console.log("🔍 [Discover] Searching for:", searchQuery);

      // Use direct Polymarket API via our discover route (bypasses broken MCP)
      const response = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
        }),
      });

      const result = await response.json();

      console.log("✅ [Discover] Result:", result);

      if (result.success && result.markets) {
        setMarkets(result.markets);
        console.log(
          `📊 [Discover] Displaying ${result.markets.length} markets (${result.relevantCount} relevant)`
        );
      } else {
        console.error("❌ [Discover] No markets found:", result.error);
        setMarkets([]);
      }
    } catch (error) {
      console.error("❌ [Discover] Fetch error:", error);
      setMarkets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = (market: PolymarketMarket) => {
    const url = `https://polymarket.com/event/${market.slug}`;
    router.push(`/analysis?url=${encodeURIComponent(url)}`);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`;
    return `$${volume}`;
  };

  const getYesPercentage = (market: PolymarketMarket) => {
    if (!market.current_prices) return null;
    const yesPrice =
      market.current_prices.Yes || market.current_prices.yes || 0;
    return Math.round(yesPrice * 100);
  };

  const formatEndDate = (endDate?: string) => {
    if (!endDate) return null;
    try {
      const date = new Date(endDate);
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return "Ended";
      if (diffDays === 0) return "Ends today";
      if (diffDays === 1) return "Ends tomorrow";
      if (diffDays < 30) return `Ends in ${diffDays} days`;
      if (diffDays < 365) return `Ends in ${Math.floor(diffDays / 30)} months`;
      return `Ends in ${Math.floor(diffDays / 365)} years`;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              🔍 "{query}"
            </h1>
            <p className="text-white/60 text-sm mt-1">
              {markets.length > 0
                ? `${markets.length} relevant markets found`
                : "Searching..."}
            </p>
          </div>
          <div className="w-20" /> {/* Spacer */}
        </div>

        {/* Markets Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 animate-pulse h-48"
              >
                <div className="h-4 bg-white/10 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-white/10 rounded mb-4 w-1/2"></div>
              </div>
            ))}
          </div>
        ) : markets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {markets.map((market) => {
              const yesPercent = getYesPercentage(market);
              const endDate = formatEndDate(market.end_date);

              return (
                <motion.div
                  key={market.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5 hover:bg-white/10 transition-colors group"
                >
                  {/* Question Title */}
                  <h3 className="text-base font-semibold text-white line-clamp-2 mb-3 leading-tight">
                    {market.question}
                  </h3>

                  {/* Tags and Status */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {market.tags &&
                      market.tags.slice(0, 2).map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="bg-white/10 text-white/70 border-white/20 text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    {market.active && (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs"
                      >
                        Live
                      </Badge>
                    )}
                  </div>

                  {/* Current Probability (if available) */}
                  {yesPercent !== null && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-white/60">
                          Current Prediction
                        </span>
                        <span className="text-white font-semibold">
                          {yesPercent}% YES
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all"
                          style={{ width: `${yesPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="flex flex-col items-center bg-white/5 rounded-lg p-2">
                      <div className="flex items-center gap-1 text-green-400 mb-1">
                        <TrendingUp className="w-3 h-3" />
                      </div>
                      <span className="text-white/80 font-medium text-xs">
                        {formatVolume(market.volume)}
                      </span>
                      <span className="text-white/40 text-[10px]">Volume</span>
                    </div>

                    <div className="flex flex-col items-center bg-white/5 rounded-lg p-2">
                      <div className="flex items-center gap-1 text-blue-400 mb-1">
                        <DollarSign className="w-3 h-3" />
                      </div>
                      <span className="text-white/80 font-medium text-xs">
                        {formatVolume(market.liquidity)}
                      </span>
                      <span className="text-white/40 text-[10px]">
                        Liquidity
                      </span>
                    </div>

                    {endDate && (
                      <div className="flex flex-col items-center bg-white/5 rounded-lg p-2">
                        <div className="flex items-center gap-1 text-purple-400 mb-1">
                          <Clock className="w-3 h-3" />
                        </div>
                        <span className="text-white/80 font-medium text-xs text-center">
                          {endDate}
                        </span>
                        <span className="text-white/40 text-[10px]">
                          Timeline
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {market.active ? (
                      <>
                        <Button
                          onClick={() => handleAnalyze(market)}
                          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                          size="sm"
                        >
                          <Sparkles className="w-3 h-3 mr-2" />
                          Deep Analysis
                        </Button>
                        <Button
                          onClick={() =>
                            window.open(
                              `https://polymarket.com/event/${market.slug}`,
                              "_blank"
                            )
                          }
                          variant="outline"
                          className="border-white/20 text-white/80 hover:bg-white/10"
                          size="sm"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <div className="w-full">
                        <Button
                          disabled
                          className="w-full bg-gray-500/30 text-gray-400 cursor-not-allowed"
                          size="sm"
                          title="This market is closed and may not be available for deep analysis"
                        >
                          <Sparkles className="w-3 h-3 mr-2" />
                          Market Closed
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/60">No markets found for "{query}"</p>
            <p className="text-white/40 text-sm mt-2">
              Try a different search term
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}
