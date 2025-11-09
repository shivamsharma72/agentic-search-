"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HeroSection from "@/components/hero-section";
import TrendingMarkets from "@/components/trending-markets";
import ResultPanel from "@/components/result-panel";
import ShareModal from "@/components/share-modal";
import TelegramBotModal from "@/components/telegram-bot-modal";
import HowItWorksModal from "@/components/how-it-works-modal";
import LoadingScreen from "@/components/loading-screen";
import { useRouter } from "next/navigation";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [marketUrl, setMarketUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
  const [howItWorksModalOpen, setHowItWorksModalOpen] = useState(false);
  
  const router = useRouter();

  // Track home page visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@vercel/analytics').then(({ track }) => {
        track('Home Page Visited', { 
          userType: 'hackathon',
          tier: 'dev-mode'
        });
      });
    }
  }, []);

  const handleAnalyze = async (url: string) => {
    // Hackathon Mode: No auth required - direct analysis
    router.push(`/analysis?url=${encodeURIComponent(url)}`);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Delay content appearance for smooth transition
    setTimeout(() => {
      setContentVisible(true);
    }, 100);
  };

  // Skip loading screen if already initialized
  useEffect(() => {
    // Skip loading screen in hackathon mode
      setIsLoading(false);
      setContentVisible(true);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen onComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      <motion.div 
        className="relative h-screen overflow-hidden flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: contentVisible ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <HeroSection
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          onShowHowItWorks={() => setHowItWorksModalOpen(true)}
          polymarketUrl={marketUrl}
          setPolymarketUrl={setMarketUrl}
        />

        {showResult && (
          <ResultPanel
            data={resultData}
            isLoading={isAnalyzing}
            onShare={() => setShareModalOpen(true)}
          />
        )}

        <TrendingMarkets />
      </motion.div>

      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        marketTitle={resultData?.marketTitle}
        verdict={resultData?.verdict}
        confidence={resultData?.confidence}
      />

      <TelegramBotModal
        open={telegramModalOpen}
        onOpenChange={setTelegramModalOpen}
      />

      <HowItWorksModal
        open={howItWorksModalOpen}
        onOpenChange={setHowItWorksModalOpen}
      />
    </>
  );
}