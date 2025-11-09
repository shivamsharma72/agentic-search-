"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  
  const pathname = usePathname();
  const isAnalysisPage = pathname === "/analysis";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full">
      {/* Glass background for analysis page */}
      {isAnalysisPage && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>
      )}

      <div className="relative w-full px-2 md:px-4">
        <div className="flex h-16 items-center justify-center">
          {/* Empty header - logo only on homepage */}
        </div>
      </div>
    </header>
  );
}
