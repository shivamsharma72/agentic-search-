"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ZoomTransition from "@/components/zoom-transition";
import UnifiedInput from "@/components/unified-input";

interface HeroSectionProps {
  onAnalyze: (url: string) => void;
  isAnalyzing: boolean;
  onShowHowItWorks: () => void;
  polymarketUrl?: string;
  setPolymarketUrl?: (url: string) => void;
}

export default function HeroSection({
  onAnalyze,
  isAnalyzing,
}: HeroSectionProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetUrl, setTargetUrl] = useState("");
  const router = useRouter();

  const handleAnalyze = (url: string) => {
    setTargetUrl(url);
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    if (targetUrl) {
      router.push(`/analysis?url=${encodeURIComponent(targetUrl)}`);
    }
  };

  return (
    <section className="relative flex-shrink-0 flex items-center justify-center px-4 pt-20 pb-4">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: 0.5,
            ease: [0.215, 0.61, 0.355, 1],
          }}
          className="text-center space-y-8"
        >
          {/* Large Logo Above Input */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 1,
              delay: 0.3,
              ease: [0.215, 0.61, 0.355, 1],
            }}
            className="flex flex-col items-center gap-4 mb-8"
          >
            <Image
              src="/logo-icon.png"
              alt="Polymarket Analysis"
              width={200}
              height={200}
              className="h-32 md:h-40 w-auto"
              priority
            />
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
              OmniSense
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: 0.7,
              ease: [0.215, 0.61, 0.355, 1],
            }}
            className="space-y-4 max-w-2xl mx-auto"
          >
            <UnifiedInput
              onAnalyze={handleAnalyze}
              isLoading={isAnalyzing || isTransitioning}
              placeholder="Paste a Polymarket URL or ask a question..."
            />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-white/60 text-sm"
            >
              💡 Try: "AI markets" or paste a Polymarket URL
            </motion.p>
          </motion.div>
        </motion.div>
      </div>

      <ZoomTransition
        isActive={isTransitioning}
        onComplete={handleTransitionComplete}
      />
    </section>
  );
}
