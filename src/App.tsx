/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, Shield, RefreshCw, KeyRound, ExternalLink, Cpu } from 'lucide-react';

export default function App() {
  const [key, setKey] = useState(0);

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-green-400 font-mono overflow-hidden select-none">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-green-800 bg-[#001004] text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-black text-red-500 tracking-wider text-sm">
            <span className="text-lg">☠</span> ROOT Terminal
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-green-950/80 border border-green-600/40 text-[11px] text-green-300">
            Dev.Yousf_Alkurdi
          </span>
          <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            24/7 سێرڤەر ئامادەیە
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-zinc-400 text-[11px]">
            <KeyRound className="w-3.5 h-3.5 text-yellow-400" />
            <span>ناوی بەکارهێنەر: <strong className="text-green-300">yusf</strong></span>
            <span>|</span>
            <span>پاسۆرد: <strong className="text-green-300">12345678rk</strong></span>
          </div>

          <button
            onClick={() => setKey((k) => k + 1)}
            title="نوێکردنەوەی تێرمیناڵ"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 hover:border-green-500 text-zinc-300 hover:text-green-300 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">نوێکردنەوە</span>
          </button>

          <a
            href="/"
            target="_top"
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-950/60 border border-red-700 hover:bg-red-900 text-red-300 text-xs transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>شاشەی تەواو</span>
          </a>
        </div>
      </header>

      {/* Main Terminal Frame */}
      <main className="flex-1 w-full h-full relative bg-black">
        <iframe
          key={key}
          src="/ui.html"
          title="ROOT Terminal"
          className="w-full h-full border-none"
          allow="clipboard-read; clipboard-write"
        />
      </main>
    </div>
  );
}
