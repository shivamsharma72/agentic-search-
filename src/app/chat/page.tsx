"use client";

import { motion } from "framer-motion";
import ChatInterface from "@/components/chat/chat-interface";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  return (
    <div className="fixed inset-0 flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />

      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 px-4 py-3 border-b border-white/10 bg-black/20 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
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

          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold text-white font-[family-name:var(--font-space)]">
              💬 AI Chat Mode
            </h1>
            <p className="text-white/60 text-xs">
              Discover markets conversationally
            </p>
          </div>

          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </motion.div>

      {/* Full-Screen Chat Interface */}
      <div className="flex-1 overflow-hidden px-4 py-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="h-full max-w-7xl mx-auto"
        >
          <ChatInterface />
        </motion.div>
      </div>
    </div>
  );
}

