import React from 'react';
import { 
  ShieldAlert, 
  Layers, 
  HelpCircle,
  Cpu,
  BarChart3,
  Sliders,
  Radio
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'queue' | 'appeals' | 'playground' | 'analytics';
  setActiveTab: (tab: 'queue' | 'appeals' | 'playground' | 'analytics') => void;
  pendingQueueCount: number;
  pendingAppealsCount: number;
  onOpenArchitecture: () => void;
  onOpenThresholds: () => void;
  onToggleShortcuts: () => void;
  kafkaConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pendingQueueCount,
  pendingAppealsCount,
  onOpenArchitecture,
  onOpenThresholds,
  onToggleShortcuts,
  kafkaConnected,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-rose-950">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap block">
              Sentinel Moderation
            </span>
            <span className="text-[11px] text-slate-400 block -mt-0.5 font-medium">
              Enterprise Trust & Safety
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (4-5 single-line clean nav links) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
              activeTab === 'queue'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span>Review Queue</span>
            {pendingQueueCount > 0 && (
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {pendingQueueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('appeals')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 ${
              activeTab === 'appeals'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span>Appeals & Escalations</span>
            {pendingAppealsCount > 0 && (
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pendingAppealsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'playground'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>NLP Pipeline Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Operations & SLA</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Tools */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenThresholds}
            title="Calibrate NLP Decision Thresholds"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleShortcuts}
            title="Keyboard Shortcuts (?)"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors hidden sm:block"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenArchitecture}
            className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Architecture & Case Study</span>
          </button>
        </div>
      </div>
    </header>
  );
};
