'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink, Github } from 'lucide-react';

interface ProductByPillProps {
  variant?: 'footer' | 'navbar' | 'compact' | 'header';
  className?: string;
}

export const ProductByPill: React.FC<ProductByPillProps> = ({ variant = 'footer', className = '' }) => {
  if (variant === 'navbar' || variant === 'compact') {
    return (
      <a
        href="https://yossikaputra.my.id"
        target="_blank"
        rel="noopener noreferrer"
        className={`group inline-flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-slate-950/90 dark:bg-white/10 hover:bg-slate-900 dark:hover:bg-white/15 border border-slate-800 dark:border-white/15 text-white shadow-sm backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98] ${className}`}
        title="Portofolio Resmi: Yossika Putra Erlangga"
      >
        <div className="relative w-5 h-5 rounded-full overflow-hidden border border-white/40 ring-1 ring-red-500/30 flex-shrink-0">
          <Image
            src="/yossika-avatar.webp"
            alt="Yossika Putra"
            width={20}
            height={20}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-[11.5px] font-semibold tracking-tight text-white group-hover:text-red-300 transition-colors">
          Yossika Putra
        </span>
        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-600 text-white leading-none">
          DEV
        </span>
        <ExternalLink className="w-2.5 h-2.5 text-slate-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>
    );
  }

  // Full Version (Matches Screenshot 2 & Screenshot 3: "Product by [Avatar | Yossika Putra | 103.1K | Red Chip] [GitHub]")
  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 ${className}`}>
      <span className="text-[11.5px] lg:text-[12.5px] font-medium text-slate-500 dark:text-slate-400 select-none whitespace-nowrap">
        Product by
      </span>

      {/* Main Pill matching Screenshot 2 & 3 */}
      <a
        href="https://yossikaputra.my.id"
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-slate-950/95 dark:bg-[#121113] hover:bg-slate-900 border border-slate-800/80 dark:border-white/15 shadow-md shadow-black/15 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        title="Lihat Portofolio Resmi Yossika Putra Erlangga"
      >
        {/* Real photo avatar from portfolio */}
        <div className="relative w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full overflow-hidden border border-white/40 ring-1 ring-red-500/40 flex-shrink-0 shadow-sm">
          <Image
            src="/yossika-avatar.webp"
            alt="Yossika Putra Erlangga"
            width={22}
            height={22}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Creator Name */}
        <span className="text-[11.5px] sm:text-[12px] font-bold text-white tracking-tight group-hover:text-red-200 transition-colors whitespace-nowrap">
          Yossika Putra
        </span>

        {/* Metric / NIM Badge like 34.4K */}
        <span className="text-[10px] sm:text-[10.5px] font-mono font-semibold text-slate-300 dark:text-slate-400">
          103.1K
        </span>

        {/* Red Action Chip (like YouTube icon in screenshot 2 & 3) */}
        <div className="w-4.5 h-3.5 sm:w-5 sm:h-4 rounded bg-red-600 hover:bg-red-500 flex items-center justify-center text-white shadow-sm transition-colors flex-shrink-0">
          <ExternalLink className="w-2.5 h-2.5" />
        </div>
      </a>

      {/* GitHub Icon Button matching Discord icon position */}
      <a
        href="https://github.com/yoshput"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub Yossika Putra"
        className="p-1.5 rounded-full bg-slate-950/95 dark:bg-[#121113] hover:bg-slate-900 border border-slate-800/80 dark:border-white/15 text-slate-300 hover:text-white transition-all shadow-sm hover:scale-105 active:scale-95 flex-shrink-0"
        title="GitHub @yoshput"
      >
        <Github className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};
