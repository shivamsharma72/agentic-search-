"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageCircle,
  Download,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { ForecastCard } from "@/lib/forecasting/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { CustomBackground } from "@/components/ui/custom-background";
import ReportChat from "@/components/report-chat";

interface ProgressEvent {
  type: "connected" | "progress" | "complete" | "error";
  step?: string;
  message?: string;
  details?: any;
  forecast?: ForecastCard;
  error?: string;
  timestamp?: string;
}

interface AnalysisStep {
  id: string;
  name: string;
  message: string;
  status: "pending" | "running" | "complete" | "error";
  details?: any;
  timestamp?: string;
  expanded?: boolean;
}

const STEP_CONFIG: Record<string, { name: string; description: string }> = {
  fetch_initial: {
    name: "Data Collection",
    description: "Fetching market data",
  },
  initial_data: {
    name: "Market Analysis",
    description: "Analyzing market fundamentals",
  },
  optimize_parameters: {
    name: "Parameter Optimization",
    description: "Optimizing analysis parameters",
  },
  parameters_optimized: {
    name: "Configuration Complete",
    description: "Analysis configuration optimized",
  },
  fetch_complete_data: {
    name: "Enhanced Data Fetch",
    description: "Retrieving complete dataset",
  },
  complete_data_ready: {
    name: "Data Processing",
    description: "Processing complete market dataset",
  },
  planning: {
    name: "Research Planning",
    description: "Planning research strategy",
  },
  plan_complete: {
    name: "Strategy Complete",
    description: "Research strategy finalized",
  },
  researching: {
    name: "Initial Research",
    description: "Starting initial evidence research",
  },
  initial_research_complete: {
    name: "Research Cycle 1",
    description: "Initial evidence collection finished",
  },
  criticism: {
    name: "Critical Analysis",
    description: "Running critical analysis to identify gaps",
  },
  criticism_complete: {
    name: "Gap Analysis",
    description: "Critical analysis and gap identification complete",
  },
  followup_research: {
    name: "Follow-up Research",
    description: "Conducting targeted follow-up research",
  },
  followup_research_complete: {
    name: "Research Cycle 2",
    description: "Follow-up research completed",
  },
  followup_research_skipped: {
    name: "Follow-up Skipped",
    description: "Follow-up research skipped - no gaps identified",
  },
  aggregating: {
    name: "Enhanced Analysis",
    description: "Aggregating evidence with critic feedback",
  },
  aggregation_complete: {
    name: "Probability Complete",
    description: "Enhanced probability aggregation finished",
  },
  reporting: {
    name: "Report Generation",
    description: "Generating final report",
  },
  report_complete: {
    name: "Analysis Finished",
    description: "Final report generated",
  },
};

function AnalysisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Hackathon Mode: No auth required
  const url = searchParams.get("url");
  const historyId = searchParams.get("id"); // New: Check for historical analysis ID
  const [mounted, setMounted] = useState(false);
  const [steps, setSteps] = useState<AnalysisStep[]>([]);
  const [forecast, setForecast] = useState<ForecastCard | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historicalAnalysis, setHistoricalAnalysis] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(false);

  // Determine if this is a historical view
  const isHistoricalView = !!historyId;

  const downloadReport = useCallback(
    async (format: "markdown" | "txt", detailed: boolean = false) => {
      if (!forecast) return;

      const reportContent =
        detailed && forecast.detailedReport
          ? forecast.detailedReport
          : forecast.markdownReport;

      const reportType = detailed ? "detailed" : "concise";
      const slug = forecast.question
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 50);
      const filename = `polyseer-${slug}-${reportType}`;

      // Create a blob and download it directly (client-side)
      const blob = new Blob([reportContent], {
        type: format === "markdown" ? "text/markdown" : "text/plain",
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${filename}.${format === "markdown" ? "md" : "txt"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    },
    [forecast]
  );

  const extractIdentifier = useCallback((url: string) => {
    // Try Polymarket first
    const polymarketMatch = url.match(/polymarket\.com\/event\/([^/?]+)/);
    if (polymarketMatch) return polymarketMatch[1];

    // Try Kalshi full path (with ticker)
    const kalshiFullMatch = url.match(
      /kalshi\.com\/markets\/[^/]+\/[^/]+\/([A-Z0-9-]+)/i
    );
    if (kalshiFullMatch) return kalshiFullMatch[1];

    // Try Kalshi series path
    const kalshiSeriesMatch = url.match(/kalshi\.com\/markets\/([a-z0-9-]+)/i);
    if (kalshiSeriesMatch) return kalshiSeriesMatch[1];

    return null;
  }, []);

  const detectPlatform = useCallback((url: string) => {
    if (url.includes("polymarket.com")) return "Polymarket";
    if (url.includes("kalshi.com")) return "Kalshi";
    return "Unknown";
  }, []);

  const formatSlugTitle = useCallback((slug?: string | null) => {
    if (!slug) return "";
    return slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }, []);

  const toggleStepExpanded = useCallback((stepId: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, expanded: !step.expanded } : step
      )
    );
  }, []);

  const fetchHistoricalAnalysis = useCallback(async () => {
    // Hackathon Mode: No historical analysis (requires database)
    setError("Historical analysis not available in hackathon mode");
    setIsLoadingHistory(false);
  }, [historyId]);

  const startAnalysis = useCallback(() => {
    if (!url) return;

    const identifier = extractIdentifier(url);
    const platform = detectPlatform(url);

    if (!identifier) {
      setError(`Invalid ${platform} URL`);
      return;
    }

    // Track URL entered event
    if (typeof window !== "undefined") {
      import("@vercel/analytics").then(({ track }) => {
        track("Analysis Started", {
          url: url,
          identifier: identifier,
          platform: platform,
          userType: "hackathon",
          tier: "dev-mode",
        });
      });
    }

    // Hackathon Mode: No rate limits or auth checks

    fetch("/api/forecast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        marketUrl: url,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          // Try to get the error message from the response body
          let errorMessage = `HTTP error! status: ${response.status}`;

          try {
            const responseText = await response.text();

            if (responseText) {
              try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.error || errorMessage;
              } catch (jsonError) {
                // If it's not JSON, maybe it's plain text
                errorMessage = responseText || errorMessage;
              }
            }
          } catch (readError) {
            // Keep the default errorMessage
          }

          // Check if this is a rate limit error - handle it gracefully without console error
          const isRateLimitError =
            errorMessage.includes("Daily limit exceeded") ||
            errorMessage.includes("limited to 1 free analysis");

          if (isRateLimitError) {
            // Set error state directly without throwing to avoid console error
            setError(errorMessage);
            return; // Exit early, don't throw
          }

          throw new Error(errorMessage);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.trim() === "") continue;
              if (line.startsWith("data: ")) {
                try {
                  const data: ProgressEvent = JSON.parse(line.slice(6));
                  handleProgressEvent(data);
                } catch (e) {
                  console.error("Error parsing SSE data:", e, line);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      })
      .catch((err) => {
        console.error("Analysis failed:", err);
        setError(err.message || "Analysis failed");
      });
  }, [url, extractIdentifier, detectPlatform]);

  const handleProgressEvent = useCallback((event: ProgressEvent) => {
    console.log("Progress event:", event);

    if (event.type === "error") {
      setError(event.error || "Unknown error occurred");

      // Track analysis errors
      if (typeof window !== "undefined") {
        import("@vercel/analytics").then(({ track }) => {
          track("Analysis Error", {
            error: event.error || "Unknown error",
            url: url,
            userType: "hackathon",
            tier: "dev-mode",
          });
        });
      }
      return;
    }

    if (event.type === "complete" && event.forecast) {
      setForecast(event.forecast);
      setIsComplete(true);
      // Mark all steps as complete
      setSteps((prev) =>
        prev.map((step) => ({ ...step, status: "complete" as const }))
      );

      // Track report completion event
      if (typeof window !== "undefined" && event.forecast) {
        import("@vercel/analytics").then(({ track }) => {
          track("Report Completed", {
            url: url,
            identifier: extractIdentifier(url || ""),
            platform: detectPlatform(url || ""),
            userType: "hackathon",
            tier: "dev-mode",
            probability: event.forecast?.pNeutral || 0.5,
            confidence: Math.abs((event.forecast?.pNeutral || 0.5) - 0.5) * 200,
            evidenceCount: event.forecast?.evidenceInfluence?.length || 0,
          });
        });
      }
      return;
    }

    if (event.type === "progress" && event.step) {
      const stepConfig = STEP_CONFIG[event.step];
      if (!stepConfig) return;

      setSteps((prev) => {
        const existingIndex = prev.findIndex((s) => s.id === event.step);

        if (existingIndex >= 0) {
          // Update existing step - if it has response data, mark as complete
          const updated = [...prev];
          const hasResponseData =
            event.details?.response ||
            event.details?.urls ||
            event.details?.plan;
          updated[existingIndex] = {
            ...updated[existingIndex],
            message:
              event.details?.message || event.message || stepConfig.description,
            details: event.details,
            timestamp: event.timestamp,
            status: hasResponseData ? "complete" : "running",
          };
          return updated;
        } else {
          // Mark previous step as complete and COLLAPSE it when starting a new one
          const updated = prev.map(
            (step, index) =>
              index === prev.length - 1 && step.status === "running"
                ? { ...step, status: "complete" as const, expanded: false }
                : { ...step, expanded: false } // Collapse all previous steps
          );

          // Add new step and AUTO-EXPAND it
          const newStep: AnalysisStep = {
            id: event.step!,
            name: stepConfig.name,
            message:
              event.details?.message || event.message || stepConfig.description,
            status: "running",
            details: event.details,
            timestamp: event.timestamp,
            expanded: true, // Auto-expand the current running step
          };

          return [...updated, newStep];
        }
      });
    }
  }, []);

  const openMarketBet = useCallback(() => {
    const targetUrl = isHistoricalView ? historicalAnalysis?.market_url : url;
    if (targetUrl) {
      window.open(targetUrl, "_blank");
    }
  }, [url, isHistoricalView, historicalAnalysis]);

  const getPlatformFromUrl = useCallback((url?: string | null) => {
    if (!url) return "Unknown";
    if (url.includes("polymarket.com")) return "Polymarket";
    if (url.includes("kalshi.com")) return "Kalshi";
    return "Unknown";
  }, []);

  useEffect(() => {
    setMounted(true);
    // Note: Removed authentication redirect to allow anonymous users
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (isHistoricalView) {
      // Load historical analysis (disabled in hackathon mode)
      if (historyId && !isComplete && !isLoadingHistory) {
        fetchHistoricalAnalysis();
      }
    } else {
      // Start live analysis
      if (url && !isComplete && steps.length === 0) {
        startAnalysis();
      }
    }
  }, [
    mounted,
    isHistoricalView,
    historyId,
    url,
    isComplete,
    steps.length,
    isLoadingHistory,
    startAnalysis,
    fetchHistoricalAnalysis,
  ]);

  if (!mounted) return null;

  // Special loading state for historical analysis
  if (isHistoricalView && isLoadingHistory) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"
          />
          <p className="text-white/70">Loading historical analysis...</p>
        </motion.div>
      </div>
    );
  }

  // Special error handling for historical analysis
  if (isHistoricalView && error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Analysis Not Found
          </h1>
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  if (error) {
    // Check if this is a rate limit error
    const isAnonymousRateLimit =
      error.includes("Daily limit exceeded") ||
      error.includes("limited to 2 free analyses");
    const isSignedInRateLimit = error.includes(
      "Signed-in users get 2 free analyses per day"
    );
    const isRateLimitError = isAnonymousRateLimit || isSignedInRateLimit;

    if (isRateLimitError) {
      // Track rate limit hit
      if (typeof window !== "undefined") {
        import("@vercel/analytics").then(({ track }) => {
          track("Rate Limit Hit", {
            userType: "hackathon",
            tier: "dev-mode",
          });
        });
      }

      return (
        <div className="min-h-screen text-white p-4 relative overflow-hidden">
          {/* Custom Animated Background */}
          <CustomBackground />

          {/* Content overlay */}
          <div className="relative z-50 flex items-center justify-center min-h-screen">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Show different UI for signed-in vs anonymous users */}
              {isSignedInRateLimit ? (
                /* Signed-in user rate limit UI */
                <>
                  {/* Main Card */}
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 mb-6 max-w-2xl mx-auto">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 font-[family-name:var(--font-space)]">
                      You&apos;ve Used Your Free Analyses
                    </h1>
                    <p className="text-white/80 mb-4">
                      Upgrade to pay-per-use for unlimited access
                    </p>
                  </div>

                  {/* Pay Per Use Focus */}
                  <div className="max-w-md mx-auto mb-6">
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-300/30 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                      <h3 className="text-white font-semibold text-xl mb-2">
                        Pay Per Use
                      </h3>
                      <p className="text-white/80 mb-4">
                        Pay only for what you use
                      </p>
                      <div className="text-white/90 text-2xl font-bold mb-2">
                        ~$5{" "}
                        <span className="text-sm font-normal">
                          typical cost
                        </span>
                      </div>
                      <p className="text-white/60 text-sm mb-4">
                        Exact cost based on usage
                      </p>
                      <ul className="text-white/80 text-sm space-y-2 mb-6">
                        <li>✓ Pay actual API costs</li>
                        <li>✓ No monthly commitment</li>
                        <li>✓ Transparent pricing</li>
                        <li>✓ Start analyzing immediately</li>
                      </ul>
                      <Button
                        onClick={() => router.push("/?plan=payperuse")}
                        size="lg"
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold border-0"
                      >
                        Upgrade to Pay-Per-Use
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 max-w-md mx-auto">
                    <div className="text-center">
                      <p className="text-white/60 text-sm mb-3">
                        Your free analysis resets daily at midnight
                      </p>
                      <Button
                        onClick={() => router.push("/")}
                        variant="outline"
                        size="sm"
                        className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-4 py-1"
                      >
                        Back to Home
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                /* Anonymous user rate limit UI */
                <>
                  {/* Main Card */}
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 mb-6 max-w-2xl mx-auto">
                    {/* Icon */}
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 font-[family-name:var(--font-space)]">
                      Daily Limit Reached
                    </h1>
                    <p className="text-white/80 mb-4">
                      Choose your plan to continue analyzing markets
                    </p>
                  </div>

                  {/* Pricing Plans */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6 max-w-2xl mx-auto">
                    {/* Pay Per Use */}
                    <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 text-center hover:bg-white/25 transition-all cursor-pointer">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">
                        Pay Per Use
                      </h3>
                      <p className="text-white/70 text-sm mb-3">
                        Pay only for what you use
                      </p>
                      <div className="text-white/90 text-xl font-bold mb-1">
                        ~$5{" "}
                        <span className="text-sm font-normal">
                          typical cost
                        </span>
                      </div>
                      <p className="text-white/60 text-xs mb-3">
                        Exact cost based on usage
                      </p>
                      <ul className="text-white/70 text-sm space-y-1">
                        <li>✓ Pay actual API costs</li>
                        <li>✓ No monthly commitment</li>
                        <li>✓ Transparent pricing</li>
                      </ul>
                    </div>

                    {/* Subscription */}
                    <div className="bg-gradient-to-br from-purple-500/30 to-blue-500/30 backdrop-blur-sm border border-purple-300/50 rounded-2xl p-6 text-center hover:from-purple-500/40 hover:to-blue-500/40 transition-all cursor-pointer relative">
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                        POPULAR
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">
                        Unlimited
                      </h3>
                      <p className="text-white/70 text-sm mb-3">
                        Best value for active traders
                      </p>
                      <div className="text-white/90 text-xl font-bold mb-3">
                        $29{" "}
                        <span className="text-sm font-normal">per month</span>
                      </div>
                      <ul className="text-white/70 text-sm space-y-1">
                        <li>✓ Unlimited analyses</li>
                        <li>✓ Telegram alerts</li>
                        <li>✓ Event monitoring</li>
                        <li>✓ Priority support</li>
                      </ul>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 max-w-2xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-3">
                      <Button
                        onClick={() => router.push("/?plan=subscription")}
                        size="default"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 font-semibold border-0"
                      >
                        Start Unlimited Plan
                      </Button>
                      <Button
                        onClick={() => router.push("/?plan=payperuse")}
                        variant="outline"
                        size="default"
                        className="border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 px-6 py-2"
                      >
                        Pay Per Analysis
                      </Button>
                    </div>

                    {/* Reset Info */}
                    <p className="text-white/60 text-xs text-center">
                      Free analysis resets daily at midnight •{" "}
                      <button
                        onClick={() => router.push("/")}
                        className="underline hover:text-white"
                      >
                        Back to Home
                      </button>
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Bottom fade overlay */}
          <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none z-40"></div>
        </div>
      );
    }

    // Default error state for other errors
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Analysis Failed
          </h1>
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-4 relative overflow-hidden">
      {/* Custom Animated Background - Same as Homepage */}
      <CustomBackground />

      {/* Content overlay */}
      <div className="relative z-50 max-w-4xl mx-auto pt-24">
        {/* Decision Header - Bold and Centered */}
        {forecast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            {/* Market Question */}
            <p className="text-white/70 text-base md:text-lg mb-4 max-w-2xl mx-auto">
              {forecast.question}
            </p>

            {/* Prediction */}
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {forecast.pNeutral > 0.5
                ? "✅ YES"
                : forecast.pNeutral < 0.5
                ? "❌ NO"
                : "⚖️ NEUTRAL"}
            </h1>
            <p className="text-white/70 text-lg">
              {(forecast.pNeutral * 100).toFixed(1)}% Probability
            </p>
          </motion.div>
        )}

        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white font-[family-name:var(--font-space)]">
              {isHistoricalView ? "Historical Analysis" : ""}
            </h1>
            {isHistoricalView && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  Back
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push("/")}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  New Analysis
                </Button>
              </div>
            )}
          </div>

          {isHistoricalView && historicalAnalysis && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-white/60">Started</div>
                  <div className="text-white font-medium">
                    {new Date(historicalAnalysis.started_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-white/60">Completed</div>
                  <div className="text-white font-medium">
                    {new Date(historicalAnalysis.completed_at).toLocaleString()}
                  </div>
                </div>
                {historicalAnalysis.valyu_cost && (
                  <div>
                    <div className="text-white/60">API Cost</div>
                    <div className="text-white font-medium">
                      ${historicalAnalysis.valyu_cost.toFixed(4)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Anonymous User Banner - Hidden in Hackathon Mode */}
        {false && !isHistoricalView && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white/90 mb-1">
                  Free Daily Analysis
                </h3>
                <p className="text-xs text-white/70">
                  You&apos;re using 1 of 1 free analysis per day. Sign up for
                  unlimited access!
                </p>
              </div>
              <Button
                onClick={() => router.push("/")}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1"
              >
                Sign Up
              </Button>
            </div>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4 max-w-4xl mx-auto">
            {isHistoricalView ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    Historical Analysis
                  </Badge>
                  {historicalAnalysis && (
                    <span className="text-white/60 text-sm">
                      {new Date(
                        historicalAnalysis.completed_at
                      ).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <a
                  href={historicalAnalysis?.market_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-white text-sm break-all leading-relaxed hover:underline decoration-white/50 transition-colors"
                >
                  {historicalAnalysis?.market_url || "Loading..."}
                </a>
              </div>
            ) : (
              <a
                href={url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white text-sm break-all leading-relaxed hover:underline decoration-white/50 transition-colors"
              >
                {url}
              </a>
            )}
          </div>
        </motion.div>

        {/* Analysis Progress - Netflix Style Horizontal Bar */}
        <div className="relative mb-12">
          {/* Horizontal Progress Bar */}
          <div className="mb-8">
            <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-2xl p-4 md:p-6 overflow-hidden">
              {/* Progress Track */}
              <div className="relative mb-6">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"
                    initial={{ width: "0%" }}
                    animate={{
                      width: `${
                        (steps.filter((s) => s.status === "complete").length /
                          steps.length) *
                        100
                      }%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Steps Row with proper overflow handling */}
              <div className="relative -mx-4 md:-mx-6 px-4 md:px-6">
                <div className="flex items-start gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col items-center flex-shrink-0 w-24 md:w-28 cursor-pointer group"
                      onClick={() => toggleStepExpanded(step.id)}
                    >
                      {/* Step Icon/Number */}
                      <motion.div
                        className={`
                        w-12 h-12 rounded-full flex items-center justify-center mb-2
                        transition-all duration-300 relative
                        ${
                          step.status === "complete"
                            ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-400/50"
                            : step.status === "running"
                            ? "bg-gradient-to-br from-blue-400 to-cyan-500 shadow-lg shadow-blue-400/50"
                            : step.status === "error"
                            ? "bg-gradient-to-br from-red-400 to-rose-500 shadow-lg shadow-red-400/50"
                            : "bg-white/10 border-2 border-white/20"
                        }
                      `}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {step.status === "complete" && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <CheckCircle className="w-6 h-6 text-white" />
                          </motion.div>
                        )}
                        {step.status === "running" && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Clock className="w-6 h-6 text-white" />
                          </motion.div>
                        )}
                        {step.status === "error" && (
                          <AlertCircle className="w-6 h-6 text-white" />
                        )}
                        {step.status === "pending" && (
                          <span className="text-white/40 text-sm font-semibold">
                            {index + 1}
                          </span>
                        )}

                        {/* Glow effect for active step */}
                        {step.status === "running" && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-blue-400/30"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        )}
                      </motion.div>

                      {/* Step Name */}
                      <div className="text-center">
                        <p
                          className={`
                          text-xs font-medium transition-colors duration-200 line-clamp-2
                          ${
                            step.status === "complete"
                              ? "text-green-400"
                              : step.status === "running"
                              ? "text-blue-400"
                              : step.status === "error"
                              ? "text-red-400"
                              : "text-white/40"
                          }
                          group-hover:text-white
                        `}
                        >
                          {step.name}
                        </p>
                      </div>

                      {/* Connector Line - Hidden on horizontal scroll */}
                      {index < steps.length - 1 && (
                        <div className="hidden absolute top-6 left-[calc(50%+24px)] w-[calc(100%-48px)] h-0.5 -z-10">
                          <div
                            className={`
                            h-full transition-all duration-500
                            ${
                              step.status === "complete"
                                ? "bg-gradient-to-r from-green-400/50 to-white/20"
                                : "bg-white/10"
                            }
                          `}
                          />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Expandable Details Panel */}
          <AnimatePresence mode="wait">
            {steps.filter((s) => s.expanded).length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mb-8"
              >
                {steps
                  .filter((s) => s.expanded)
                  .map((step) => (
                    <div key={step.id}>
                      <Card className="bg-black/60 backdrop-blur-md border-white/30 shadow-2xl overflow-hidden">
                        <CardHeader
                          className="pb-4 cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => toggleStepExpanded(step.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              {/* Status Indicator with Accent Bar */}
                              <div
                                className={`
                                  w-1.5 h-16 rounded-full -ml-6
                                  ${
                                    step.status === "complete"
                                      ? "bg-gradient-to-b from-green-400 to-emerald-500"
                                      : step.status === "running"
                                      ? "bg-gradient-to-b from-blue-400 to-cyan-500"
                                      : step.status === "error"
                                      ? "bg-gradient-to-b from-red-400 to-rose-500"
                                      : "bg-white/20"
                                  }
                                `}
                              />

                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {step.status === "complete" && (
                                    <CheckCircle className="w-5 h-5 text-green-400" />
                                  )}
                                  {step.status === "running" && (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear",
                                      }}
                                    >
                                      <Clock className="w-5 h-5 text-blue-400" />
                                    </motion.div>
                                  )}
                                  {step.status === "error" && (
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                  )}

                                  <CardTitle className="text-white text-xl font-semibold">
                                    {step.name}
                                  </CardTitle>
                                </div>

                                {/* ChatGPT-style message with animated dots */}
                                <div className="flex items-start gap-2">
                                  <span className="text-white/60 text-sm mt-0.5">
                                    •
                                  </span>
                                  <p className="text-white/70 text-sm leading-relaxed flex-1">
                                    {step.message}
                                    {step.status === "running" && (
                                      <motion.span
                                        className="inline-flex ml-1"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                      >
                                        <motion.span
                                          animate={{ opacity: [0.3, 1, 0.3] }}
                                          transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            delay: 0,
                                          }}
                                        >
                                          .
                                        </motion.span>
                                        <motion.span
                                          animate={{ opacity: [0.3, 1, 0.3] }}
                                          transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            delay: 0.2,
                                          }}
                                        >
                                          .
                                        </motion.span>
                                        <motion.span
                                          animate={{ opacity: [0.3, 1, 0.3] }}
                                          transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            delay: 0.4,
                                          }}
                                        >
                                          .
                                        </motion.span>
                                      </motion.span>
                                    )}
                                  </p>
                                </div>

                                {step.timestamp && (
                                  <p className="text-white/40 text-xs mt-2">
                                    {new Date(
                                      step.timestamp
                                    ).toLocaleTimeString()}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Close/Expand Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white/60 hover:text-white hover:bg-white/10"
                            >
                              <ChevronDown className="w-5 h-5" />
                            </Button>
                          </div>
                        </CardHeader>

                        <AnimatePresence>
                          {["initial_data", "complete_data_ready"].includes(
                            step.id
                          )
                            ? step.details && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: "easeInOut",
                                  }}
                                >
                                  <CardContent className="pt-0 pb-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white/80 text-sm">
                                      {typeof step.details.outcomes ===
                                        "number" && (
                                        <div>
                                          <div className="text-white/60">
                                            Outcomes
                                          </div>
                                          <div className="font-semibold">
                                            {step.details.outcomes}
                                          </div>
                                        </div>
                                      )}
                                      {step.details.interval && (
                                        <div>
                                          <div className="text-white/60">
                                            Interval
                                          </div>
                                          <div className="font-semibold">
                                            {step.details.interval}
                                          </div>
                                        </div>
                                      )}
                                      {typeof step.details.historySeries ===
                                        "number" && (
                                        <div>
                                          <div className="text-white/60">
                                            History Series
                                          </div>
                                          <div className="font-semibold">
                                            {step.details.historySeries}
                                          </div>
                                        </div>
                                      )}
                                      {typeof step.details.volume ===
                                        "number" && (
                                        <div>
                                          <div className="text-white/60">
                                            Volume
                                          </div>
                                          <div className="font-semibold">
                                            {step.details.volume.toLocaleString()}
                                          </div>
                                        </div>
                                      )}
                                      {typeof step.details.liquidity ===
                                        "number" && (
                                        <div>
                                          <div className="text-white/60">
                                            Liquidity
                                          </div>
                                          <div className="font-semibold">
                                            {step.details.liquidity.toLocaleString()}
                                          </div>
                                        </div>
                                      )}
                                      {step.details.closeTime && (
                                        <div>
                                          <div className="text-white/60">
                                            Close Time
                                          </div>
                                          <div className="font-semibold">
                                            {new Date(
                                              step.details.closeTime
                                            ).toLocaleString()}
                                          </div>
                                        </div>
                                      )}
                                      {step.details.resolutionSource && (
                                        <div className="col-span-2">
                                          <div className="text-white/60">
                                            Resolution Source
                                          </div>
                                          <div className="font-semibold truncate">
                                            {step.details.resolutionSource}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {Array.isArray(step.details.pricesNow) &&
                                      step.details.pricesNow.length > 0 && (
                                        <div className="mt-4">
                                          <div className="text-white/60 text-sm mb-2">
                                            Top of Book
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {step.details.pricesNow.map(
                                              (p: any, idx: number) => (
                                                <div
                                                  key={idx}
                                                  className="text-white/80 text-sm flex justify-between bg-white/5 rounded p-2"
                                                >
                                                  <span className="truncate mr-2">
                                                    {p.outcome || "Outcome"}
                                                  </span>
                                                  <span className="font-mono">
                                                    bid {p.bid ?? "-"} | ask{" "}
                                                    {p.ask ?? "-"} | mid{" "}
                                                    {p.mid ?? "-"}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    {step.details?.eventSummary
                                      ?.isMultiCandidate &&
                                      Array.isArray(
                                        step.details.eventSummary.topCandidates
                                      ) && (
                                        <div className="mt-4">
                                          <div className="text-white/60 text-sm mb-2">
                                            Top Candidates
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {step.details.eventSummary.topCandidates.map(
                                              (c: any, idx: number) => (
                                                <div
                                                  key={idx}
                                                  className="text-white/80 text-sm bg-white/5 rounded p-2 flex justify-between"
                                                >
                                                  <span className="truncate mr-2">
                                                    {c.name}
                                                  </span>
                                                  <span className="font-mono">
                                                    {c.implied_probability !=
                                                    null
                                                      ? `${(
                                                          c.implied_probability *
                                                          100
                                                        ).toFixed(1)}%`
                                                      : "-"}
                                                    {typeof c.volume ===
                                                    "number"
                                                      ? ` | vol $${c.volume.toLocaleString()}`
                                                      : ""}
                                                    {typeof c.liquidity ===
                                                    "number"
                                                      ? ` | liq $${c.liquidity.toLocaleString()}`
                                                      : ""}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {typeof step.details.withBooks !==
                                      "undefined" && (
                                      <div className="mt-4 text-white/80 text-sm">
                                        Order Books:{" "}
                                        <span className="font-semibold">
                                          {String(step.details.withBooks)}
                                        </span>
                                      </div>
                                    )}
                                    {typeof step.details.withTrades !==
                                      "undefined" && (
                                      <div className="text-white/80 text-sm">
                                        Recent Trades:{" "}
                                        <span className="font-semibold">
                                          {String(step.details.withTrades)}
                                        </span>
                                      </div>
                                    )}
                                  </CardContent>
                                </motion.div>
                              )
                            : step.expanded &&
                              step.details &&
                              Object.keys(step.details).length > 0 && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: "easeInOut",
                                  }}
                                >
                                  <CardContent className="pt-0 pb-6">
                                    <div className="bg-black/50 rounded-lg p-6 border border-white/10">
                                      <pre className="whitespace-pre-wrap text-white/80 text-xs leading-relaxed font-mono overflow-x-auto max-h-96 overflow-y-auto">
                                        {JSON.stringify(step.details, null, 2)}
                                      </pre>
                                    </div>
                                  </CardContent>
                                </motion.div>
                              )}
                        </AnimatePresence>
                      </Card>
                    </div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Final Results */}
        <AnimatePresence>
          {isComplete && forecast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="relative z-10 backdrop-blur-md bg-black/70 border-white/30 shadow-2xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl text-white mb-2">
                    Analysis Complete
                  </CardTitle>
                  <p className="text-white/80">{forecast.question}</p>
                  {url && (
                    <div className="mt-2">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-white/80 underline hover:text-white"
                      >
                        View on {getPlatformFromUrl(url)}{" "}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 min-w-0">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">
                        📊 Analysis Outcome
                      </h3>
                      <p className="text-white/60 text-xs mb-4 leading-relaxed">
                        Our AI analyzed all evidence and calculated these
                        probability estimates for the outcome.
                      </p>
                      <div className="space-y-3">
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white/90 font-medium text-sm">
                              Our Prediction
                            </span>
                            <Badge className="bg-blue-500/20 text-blue-400 font-bold text-base">
                              {(forecast.pNeutral * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <p className="text-white/50 text-xs">
                            Based on all evidence analyzed
                          </p>
                        </div>

                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white/90 font-medium text-sm">
                              Market Price
                            </span>
                            <Badge className="bg-gray-400/20 text-gray-400 text-base">
                              {(forecast.p0 * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <p className="text-white/50 text-xs">
                            What traders currently believe
                          </p>
                        </div>

                        {forecast.pAware && (
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-white/90 font-medium text-sm">
                                Market-Adjusted
                              </span>
                              <Badge className="bg-purple-400/20 text-purple-400 text-base">
                                {(forecast.pAware * 100).toFixed(1)}%
                              </Badge>
                            </div>
                            <p className="text-white/50 text-xs">
                              Prediction adjusted for market wisdom
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-4">
                        Analysis Drivers
                      </h3>
                      <div className="space-y-2">
                        {forecast.drivers.map((driver, i) => (
                          <div
                            key={i}
                            className="text-white/80 text-sm leading-relaxed bg-white/5 rounded-lg p-3 border border-white/10"
                          >
                            <span className="text-white/60 mr-2">•</span>
                            {driver}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="text-center sm:text-left">
                        <p className="text-lg font-semibold text-white mb-1">
                          Prediction: {forecast.pNeutral > 0.5 ? "YES" : "NO"}
                        </p>
                        <p className="text-white/60 text-sm">
                          Probability: {(forecast.pNeutral * 100).toFixed(1)}%
                        </p>
                      </div>

                      <Button
                        onClick={openMarketBet}
                        className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                        size="lg"
                      >
                        {getPlatformFromUrl(url) === "Polymarket" && (
                          <Image
                            src="/polymarket.png"
                            alt="Polymarket"
                            width={20}
                            height={20}
                            className="rounded"
                          />
                        )}
                        {getPlatformFromUrl(url) === "Kalshi" && (
                          <Image
                            src="/kalshi.png"
                            alt="Kalshi"
                            width={20}
                            height={20}
                            className="rounded"
                          />
                        )}
                        Place Bet
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {forecast.markdownReport && (
                <Card className="relative z-10 backdrop-blur-md mt-6 bg-black/70 border-white/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Analysis Report
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {forecast.detailedReport && (
                          <Button
                            onClick={() =>
                              setShowDetailedReport(!showDetailedReport)
                            }
                            variant="outline"
                            size="sm"
                            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                          >
                            {showDetailedReport
                              ? "Show Concise"
                              : "Show Detailed"}
                          </Button>
                        )}
                        <Button
                          onClick={() =>
                            downloadReport("markdown", showDetailedReport)
                          }
                          variant="outline"
                          size="sm"
                          className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download MD
                        </Button>
                        <Button
                          onClick={() =>
                            downloadReport("txt", showDetailedReport)
                          }
                          variant="outline"
                          size="sm"
                          className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download TXT
                        </Button>
                      </div>
                    </div>
                    <p className="text-white/60 text-sm mt-2">
                      {showDetailedReport && forecast.detailedReport
                        ? "Technical deep dive with full methodology"
                        : "Evidence-based summary for quick understanding"}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert prose-sm max-w-none bg-black/30 rounded-lg p-4">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={
                          {
                            h1: ({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) => (
                              <h1 className="text-xl font-bold text-white mb-4">
                                {children}
                              </h1>
                            ),
                            h2: ({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) => (
                              <h2 className="text-lg font-semibold text-white mb-3 mt-6">
                                {children}
                              </h2>
                            ),
                            h3: ({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) => (
                              <h3 className="text-base font-medium text-white mb-2 mt-4">
                                {children}
                              </h3>
                            ),
                            p: ({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) => (
                              <p className="text-white/90 mb-3 leading-relaxed">
                                {children}
                              </p>
                            ),
                            ul: ({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) => (
                              <ul className="list-disc list-inside mb-3 space-y-1">
                                {children}
                              </ul>
                            ),
                            li: ({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) => <li className="text-white/90">{children}</li>,
                            strong: ({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) => (
                              <strong className="text-white font-semibold">
                                {children}
                              </strong>
                            ),
                            em: ({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) => (
                              <em className="text-white/80 italic">
                                {children}
                              </em>
                            ),
                            code: ({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) => (
                              <code className="bg-white/10 text-purple-300 px-1 py-0.5 rounded text-xs">
                                {children}
                              </code>
                            ),
                            table: ({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) => (
                              <div className="overflow-x-auto my-6">
                                <table className="w-full border-collapse border border-white/30 rounded-lg">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) => (
                              <thead className="bg-white/10">{children}</thead>
                            ),
                            tbody: ({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) => (
                              <tbody className="divide-y divide-white/20">
                                {children}
                              </tbody>
                            ),
                            tr: ({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) => (
                              <tr className="hover:bg-white/5 transition-colors">
                                {children}
                              </tr>
                            ),
                            th: ({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) => (
                              <th className="px-4 py-3 text-left text-white font-semibold border-r border-white/20 last:border-r-0">
                                {children}
                              </th>
                            ),
                            td: ({
                              children,
                            }: {
                              children: React.ReactNode;
                            }) => (
                              <td className="px-4 py-3 text-white/90 border-r border-white/20 last:border-r-0">
                                {children}
                              </td>
                            ),
                          } as Components
                        }
                      >
                        {showDetailedReport && forecast.detailedReport
                          ? forecast.detailedReport
                          : forecast.markdownReport}
                      </ReactMarkdown>
                    </div>

                    {forecast.provenance && forecast.provenance.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-white text-lg font-semibold mb-3">
                          Most Influential Sources
                        </h3>
                        <ol className="space-y-2 text-sm list-decimal list-inside">
                          {Array.from(new Set(forecast.provenance)).map(
                            (url, idx) => {
                              let label = url;
                              try {
                                const u = new URL(url);
                                label = `${u.hostname.replace(/^www\./, "")}${
                                  u.pathname
                                }`;
                              } catch {}
                              return (
                                <li key={idx} className="text-white/80">
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-white"
                                  >
                                    {label}
                                  </a>
                                </li>
                              );
                            }
                          )}
                        </ol>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Chat with Report Section */}
              {isComplete && forecast && (
                <Card className="relative z-10 backdrop-blur-md mt-6 bg-black/70 border-white/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Ask Questions About This Report
                    </CardTitle>
                    <p className="text-white/60 text-sm">
                      Get deeper insights by asking questions about the analysis
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ReportChat
                      report={forecast.markdownReport || ""}
                      marketTitle={forecast.question || ""}
                      alpha={forecast.alpha}
                    />
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!isComplete && steps.length === 0 && (
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4"
            />
            <p className="text-white/60">Starting analysis...</p>
          </div>
        )}
      </div>

      {/* Bottom fade overlay */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none z-40"></div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full"
          />
        </div>
      }
    >
      <AnalysisContent />
    </Suspense>
  );
}
