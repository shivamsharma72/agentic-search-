'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  
  const pathname = usePathname();
  const isAnalysisPage = pathname === '/analysis';

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className='absolute top-0 left-0 right-0 z-50 w-full'>
      {/* Glass background for analysis page */}
      {isAnalysisPage && (
        <div className='absolute inset-0 bg-black/30 backdrop-blur-md'></div>
      )}

      <div className='relative w-full px-2 md:px-4'>
        <div className='flex h-14 items-center justify-between'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
          >
            <Link href='/' className='inline-block pt-2'>
              <Image
                src='/polyseer.svg'
                alt='Polyseer'
                width={200}
                height={80}
                className='h-24 md:h-24 w-auto drop-shadow-md'
                priority
              />
            </Link>
          </motion.div>

          {/* Center title for analysis page */}
          {isAnalysisPage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className='absolute left-1/2 transform -translate-x-1/2'
            >
              <h1 className='text-lg md:text-2xl font-bold text-white font-[family-name:var(--font-space)] drop-shadow-md'>
                Deep Analysis
              </h1>
            </motion.div>
          )}

          <motion.nav
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className='flex items-center gap-0.5 md:gap-1'
          >
            {/* Hackathon Mode - No authentication UI */}
            <div className="text-white/80 text-sm font-medium bg-purple-500/20 px-3 py-1.5 rounded-md border border-white/20">
              🚀 Hackathon Mode
            </div>
          </motion.nav>
        </div>
      </div>
    </header>
  );
}
