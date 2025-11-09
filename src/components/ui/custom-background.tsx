"use client";

import { motion } from "framer-motion";

/**
 * Beautiful Animated Background - BRIGHT VERSION
 */
export function CustomBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      {/* Large animated orb 1 - Purple - MUCH BRIGHTER */}
      <motion.div
        className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full opacity-50 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgb(147, 51, 234) 0%, rgb(120, 40, 200) 30%, transparent 70%)",
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, 150, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Large animated orb 2 - Blue - MUCH BRIGHTER */}
      <motion.div
        className="absolute top-1/4 right-0 w-[700px] h-[700px] rounded-full opacity-50 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgb(59, 130, 246) 0%, rgb(30, 100, 220) 30%, transparent 70%)",
        }}
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Large animated orb 3 - Pink - MUCH BRIGHTER */}
      <motion.div
        className="absolute bottom-0 left-1/3 w-[900px] h-[900px] rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgb(236, 72, 153) 0%, rgb(200, 50, 130) 30%, transparent 70%)",
        }}
        animate={{
          x: [0, 150, 0],
          y: [0, -80, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Gradient overlay for better blend */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />

      {/* Grid overlay - BRIGHTER */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(147, 51, 234, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(147, 51, 234, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}
