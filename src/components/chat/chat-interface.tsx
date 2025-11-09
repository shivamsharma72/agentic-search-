"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, TrendingUp, DollarSign, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PolymarketMarket } from "@/lib/mcp/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  markets?: PolymarketMarket[];
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "👋 Hi! I can help you discover and analyze Polymarket predictions. Try asking:\n\n- Show me trending markets\n- AI\n- election\n- trump",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (isLoading) return;

    // Allow empty input for "browse all" functionality
    const searchQuery = input.trim() || ""; // Empty string means "show all markets"

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: searchQuery || "Show me top markets",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: searchQuery,
          action: "search_markets",
        }),
      });

      const result = await response.json();

      console.log("🔍 [Chat] API Response:", result);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.success
          ? Array.isArray(result.data) && result.data.length > 0
            ? `Found ${result.data.length} markets:`
            : typeof result.data === "string"
            ? result.data
            : 'No markets found. Try:\n- "Show me trending markets" (no search filter)\n- "AI" or "election" (simpler keywords)\n- Browse all markets without a search term'
          : `Sorry, I couldn't find markets. ${result.error || ""}`,
        markets:
          result.success && Array.isArray(result.data)
            ? result.data
            : undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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
    const yesPrice = market.current_prices.Yes || market.current_prices.yes || 0;
    return Math.round(yesPrice * 100);
  };

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] ${
                  message.role === "user"
                    ? "bg-purple-500/20 border-purple-500/30"
                    : "bg-white/10 border-white/20"
                } rounded-2xl border p-4`}
              >
                <p className="text-white whitespace-pre-wrap">
                  {message.content}
                </p>

                {/* Market Cards */}
                {message.markets &&
                  Array.isArray(message.markets) &&
                  message.markets.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {message.markets.slice(0, 5).map((market) => {
                        const yesPercent = getYesPercentage(market);

                        return (
                          <Card
                            key={market.id}
                            className="bg-white/5 border-white/10 p-3 hover:bg-white/10 transition-colors"
                          >
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-white line-clamp-2">
                                {market.question}
                              </h4>

                              <div className="flex items-center gap-2 text-xs flex-wrap">
                                <Badge
                                  variant="secondary"
                                  className="bg-green-500/20 text-green-300"
                                >
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  {formatVolume(market.volume)}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="bg-blue-500/20 text-blue-300"
                                >
                                  <DollarSign className="w-3 h-3 mr-1" />
                                  {formatVolume(market.liquidity)}
                                </Badge>
                                {market.active && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-emerald-500/20 text-emerald-300"
                                  >
                                    Live
                                  </Badge>
                                )}
                              </div>

                              {/* Probability Bar */}
                              {yesPercent !== null && (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-white/60">Prediction</span>
                                    <span className="text-white/80 font-medium">
                                      {yesPercent}% YES
                                    </span>
                                  </div>
                                  <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-400 to-blue-400 transition-all"
                                      style={{ width: `${yesPercent}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Market URL - for reference */}
                              <p className="text-[10px] text-white/40 font-mono truncate">
                                polymarket.com/event/{market.slug}
                              </p>

                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAnalyze(market)}
                                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                                >
                                  <Sparkles className="w-3 h-3 mr-2" />
                                  Deep Analysis
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    window.open(
                                      `https://polymarket.com/event/${market.slug}`,
                                      "_blank"
                                    )
                                  }
                                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                                >
                                  View
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                <p
                  className="text-xs text-white/50 mt-2"
                  suppressHydrationWarning
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white/70">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Searching markets...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        {/* Quick Actions */}
        <div className="flex gap-2 mb-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setInput("");
              handleSend(); // Send empty query to get all markets
            }}
            disabled={isLoading}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
          >
            <Flame className="w-3 h-3 mr-1" />
            Top Markets
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInput("AI")}
            disabled={isLoading}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
          >
            AI
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInput("election")}
            disabled={isLoading}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-xs"
          >
            Election
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about markets..."
            disabled={isLoading}
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/50"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && isLoading)}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
