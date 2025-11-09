"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface UnifiedInputProps {
  onAnalyze?: (url: string) => void;
  onChat?: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function UnifiedInput({
  onAnalyze,
  onChat,
  isLoading = false,
  placeholder = "Paste a Polymarket URL or ask a question..."
}: UnifiedInputProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Detect if input is a URL or a question
  const detectInputType = (value: string): 'url' | 'question' => {
    const polymarketRegex = /^https?:\/\/(www\.)?polymarket\.com\/.+/i;
    return polymarketRegex.test(value) ? 'url' : 'question';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!input.trim()) {
      setError("Please enter a URL or ask a question");
      return;
    }

    const inputType = detectInputType(input);

    if (inputType === 'url') {
      // Deep analysis pipeline
      if (onAnalyze) {
        onAnalyze(input);
      } else {
        router.push(`/analysis?url=${encodeURIComponent(input)}`);
      }
    } else {
      // Chat/discovery pipeline
      if (onChat) {
        onChat(input);
      } else {
        // Search for markets using MCP
        router.push(`/discover?q=${encodeURIComponent(input)}`);
      }
    }
  };

  const getIcon = () => {
    if (isLoading) {
      return <Sparkles className="h-4 w-4 animate-pulse" />;
    }
    
    if (!input) {
      return <Search className="h-5 w-5 md:h-6 md:w-6" />;
    }

    const inputType = detectInputType(input);
    return inputType === 'url' ? (
      <ArrowRight className="h-5 w-5 md:h-6 md:w-6" />
    ) : (
      <Search className="h-5 w-5 md:h-6 md:w-6" />
    );
  };

  const getHelpText = () => {
    if (!input) return null;
    
    const inputType = detectInputType(input);
    return (
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute -bottom-6 left-0 text-xs text-white/60"
      >
        {inputType === 'url' ? '🔍 Deep Analysis Mode' : '💬 Discovery Mode'}
      </motion.p>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex gap-2 transition-all duration-300">
        <motion.div 
          className="relative flex-1"
        >
          <Input
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            className={`h-12 md:h-14 text-base px-4 md:px-6 bg-white/95 backdrop-blur-sm border-white/20 focus:bg-white focus:border-white/40 placeholder:text-neutral-500 w-full ${
              error ? "border-red-500 animate-shake" : ""
            }`}
            disabled={isLoading}
          />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-6 left-0 text-sm text-red-400 drop-shadow-md"
            >
              {error}
            </motion.p>
          )}
          {getHelpText()}
        </motion.div>
        
        <AnimatePresence>
          {input && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, width: 0 }}
              animate={{ opacity: 1, scale: 1, width: "auto" }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="h-12 md:h-14 px-6 bg-black text-white hover:bg-black/90 transition-all font-medium"
              >
                {getIcon()}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

