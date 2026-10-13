import React from 'react';
import { 
  Play, 
  Pause, 
  PlusCircle, 
  Activity, 
  Zap, 
  Database,
  Server
} from 'lucide-react';
import { KafkaTelemetry } from '../types/moderation';

interface KafkaMonitorBarProps {
  telemetry: KafkaTelemetry;
  isStreaming: boolean;
  onToggleStreaming: () => void;
  onInjectSynthetic: () => void;
  queueCount: number;
}

export const KafkaMonitorBar: React.FC<KafkaMonitorBarProps> = ({
  telemetry,
  isStreaming,
  onToggleStreaming,
  onInjectSynthetic,
  queueCount,
}) => {
  return (
    <div className="bg-slate-900/80 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Stream Status & Topic */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isStreaming ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isStreaming ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="font-medium text-slate-300">
              Kafka: {isStreaming ? 'Live Stream Active' : 'Stream Paused'}
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">·</span>

          <div className="flex items-center gap-1.5 text-slate-400 font-mono">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-300">{telemetry.activeTopic}</span>
          </div>

          <span className="text-slate-600 hidden md:inline">·</span>

          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ingestion:</span>
            <span className="font-mono text-slate-200 tabular-nums">
              {telemetry.inflowRatePerSec.toLocaleString()} events/s
            </span>
          </div>

          <span className="text-slate-600 hidden lg:inline">·</span>

          <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>p99 Latency:</span>
            <span className="font-mono text-slate-200 tabular-nums">
              {telemetry.p99LatencyMs}ms
            </span>
          </div>

          <span className="text-slate-600 hidden xl:inline">·</span>

          <div className="hidden xl:flex items-center gap-1.5 text-slate-400">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span>TF Serving Pool:</span>
            <span className="font-mono text-slate-200 tabular-nums">
              {telemetry.activeWorkers} Celery Workers
            </span>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleStreaming}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              isStreaming
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border-emerald-800'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3 h-3 text-amber-400" />
                <span>Pause Feed</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-emerald-400" />
                <span>Resume Feed</span>
              </>
            )}
          </button>

          <button
            onClick={onInjectSynthetic}
            className="px-2.5 py-1 rounded text-xs font-medium bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <PlusCircle className="w-3 h-3 text-indigo-400" />
            <span>Simulate Incoming Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};
