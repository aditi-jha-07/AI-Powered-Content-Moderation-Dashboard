import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Percent, 
  ShieldCheck, 
  Activity, 
  Zap, 
  ArrowDownRight,
  Target,
  BarChart2
} from 'lucide-react';
import { ModerationMetrics } from '../types/moderation';

interface AnalyticsViewProps {
  metrics: ModerationMetrics;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ metrics }) => {
  // Sample hourly throughput breakdown
  const HOURLY_DATA = [
    { hour: '00:00', ingested: 38000, humanReview: 1200, cleared: 1180 },
    { hour: '04:00', ingested: 24000, humanReview: 820, cleared: 810 },
    { hour: '08:00', ingested: 58000, humanReview: 2100, cleared: 2050 },
    { hour: '12:00', ingested: 89000, humanReview: 3400, cleared: 3320 },
    { hour: '16:00', ingested: 94000, humanReview: 3800, cleared: 3750 },
    { hour: '20:00', ingested: 72000, humanReview: 2600, cleared: 2580 },
  ];

  const maxIngested = 100000;

  return (
    <div className="space-y-6">
      {/* Top Headline Outcome Cards (Matching the Project Brief's explicit results) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outcome 1: Workload Reduction */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Human Review Workload</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              -{metrics.workloadReductionPct}%
            </span>
          </div>
          <p className="text-xs text-emerald-400 font-medium">
            Automated 96.7% of obvious benign & toxic edge items
          </p>
        </div>

        {/* Outcome 2: Recall SLA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Policy Violation Recall</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {metrics.policyRecallPct}%
            </span>
            <span className="text-xs text-slate-500">SLA target &gt;95%</span>
          </div>
          <p className="text-xs text-slate-400">
            Evaluated across 1M+ daily post volume
          </p>
        </div>

        {/* Outcome 3: Average Resolution Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Resolution Time</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {metrics.avgResolutionTimeSec}s
            </span>
            <span className="text-xs text-rose-400 line-through">
              {metrics.prevManualResolutionTimeSec}s manual
            </span>
          </div>
          <p className="text-xs text-amber-400 font-medium">
            82.6% reduction in per-item review latency
          </p>
        </div>

        {/* Outcome 4: Human-AI Concordance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Human · AI Concordance</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {metrics.concordanceRatePct}%
            </span>
          </div>
          <p className="text-xs text-purple-300">
            Agreement on borderline threshold band
          </p>
        </div>
      </div>

      {/* Ingestion & Review Throughput Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Hourly Event Ingestion & Moderator Clearance Throughput</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily Total: {metrics.totalProcessedToday.toLocaleString()} posts evaluated · {metrics.routedToHumanQueue.toLocaleString()} routed to human review
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span className="text-slate-400">Total Stream (Kafka)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-300">Human Queue Routed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Moderator Cleared</span>
            </div>
          </div>
        </div>

        {/* SVG Visualization */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-6 gap-3 items-end h-44 border-b border-slate-800 pb-2">
            {HOURLY_DATA.map((item) => {
              const streamHeight = Math.round((item.ingested / maxIngested) * 100);
              const queueHeight = Math.max(10, Math.round((item.humanReview / 4000) * 100));

              return (
                <div key={item.hour} className="flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-36">
                    {/* Stream Ingest bar */}
                    <div
                      className="w-4 bg-slate-800 group-hover:bg-slate-700 rounded-t transition-all relative"
                      style={{ height: `${streamHeight}%` }}
                      title={`Stream: ${item.ingested.toLocaleString()} posts`}
                    />
                    {/* Human Queue Routed bar */}
                    <div
                      className="w-4 bg-indigo-500/80 group-hover:bg-indigo-400 rounded-t transition-all relative"
                      style={{ height: `${queueHeight}%` }}
                      title={`Human Queue: ${item.humanReview.toLocaleString()} items`}
                    />
                    {/* Moderator Cleared bar */}
                    <div
                      className="w-4 bg-emerald-500/80 group-hover:bg-emerald-400 rounded-t transition-all relative"
                      style={{ height: `${queueHeight * 0.98}%` }}
                      title={`Cleared: ${item.cleared.toLocaleString()} items`}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 mt-2 block">
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model Performance & Policy Category Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>Policy Violation Class Distribution</span>
          </h3>

          <div className="space-y-3 pt-1">
            {[
              { label: 'Hate Speech (Art. 4)', pct: 34, count: '13,056 items', color: 'bg-rose-500' },
              { label: 'Targeted Harassment (Art. 3)', pct: 28, count: '10,752 items', color: 'bg-orange-500' },
              { label: 'Toxic & Abusive Content (Art. 2)', pct: 21, count: '8,064 items', color: 'bg-amber-500' },
              { label: 'Violent Threats (Art. 1)', pct: 11, count: '4,224 items', color: 'bg-red-600' },
              { label: 'Spam & Coordinated Inauthentic', pct: 6, count: '2,304 items', color: 'bg-indigo-500' },
            ].map((cat) => (
              <div key={cat.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">{cat.label}</span>
                  <span className="font-mono text-slate-400">
                    {cat.count} · <strong className="text-white">{cat.pct}%</strong>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Confusion & SLA Matrix */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Operational Decision Matrix & SLA Health</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[11px]">True Positives (Auto-Enforced)</span>
              <span className="text-lg font-bold font-mono text-emerald-400">98.2%</span>
              <p className="text-[10px] text-slate-400">
                Severe threats & explicit hate speech routed or blocked automatically
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[11px]">False Positive Rate</span>
              <span className="text-lg font-bold font-mono text-amber-400">1.8%</span>
              <p className="text-[10px] text-slate-400">
                Mostly academic quotes or reclaimed colloquial slang (reviewed via appeals)
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[11px]">P95 Moderator Turnaround</span>
              <span className="text-lg font-bold font-mono text-indigo-400">14.2s</span>
              <p className="text-[10px] text-slate-400">
                Well within the 60s emergency response threshold
              </p>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-500 block text-[11px]">Inference P99 (TF-Serving)</span>
              <span className="text-lg font-bold font-mono text-purple-400">24.6ms</span>
              <p className="text-[10px] text-slate-400">
                Containerized RoBERTa-Tox pipeline via Celery worker pool
              </p>
            </div>
          </div>

          <div className="p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-lg text-xs text-indigo-300">
            <strong>System Impact Summary:</strong> Transitioning from manual review to the AI-first event pipeline enabled the platform to scale to 1M+ posts/day with a 70% human workload reduction while achieving 98% recall.
          </div>
        </div>
      </div>
    </div>
  );
};
