import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  ArrowUpRight, 
  ShieldAlert, 
  User, 
  Clock, 
  Hash, 
  Flag,
  Sparkles,
  Info
} from 'lucide-react';
import { QueueItem, PolicyCategory } from '../types/moderation';
import { formatPolicyCategoryLabel } from '../services/nlpService';

interface ItemInspectorDrawerProps {
  item: QueueItem | null;
  onClose: () => void;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, reason: string, notes?: string) => void;
  onEscalate: (id: string, notes?: string) => void;
}

export const ItemInspectorDrawer: React.FC<ItemInspectorDrawerProps> = ({
  item,
  onClose,
  onApprove,
  onReject,
  onEscalate,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('Hate Speech - Group Denigration');
  const [moderatorNotes, setModeratorNotes] = useState<string>('');

  if (!item) return null;

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 0.85) return 'bg-rose-500';
    if (score >= 0.70) return 'bg-orange-500';
    if (score >= 0.40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] md:w-[600px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-200 ease-in-out">
      {/* Drawer Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-400">
              {item.id}
            </span>
            <span className="text-slate-600">·</span>
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${getRiskBadgeColor(item.riskLevel)}`}>
              {item.riskLevel.toUpperCase()} RISK ({(item.scores.overallRisk * 100).toFixed(0)}%)
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">
            Content Review & Policy Evaluation
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Post Content with Highlighted Trigger Spans */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Flagged Content Payload
            </span>
            <span className="text-xs text-slate-500">
              Type: {item.contentType.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 text-sm leading-relaxed text-slate-200">
            {item.highlightedSpans.length > 0 ? (
              <div>
                {renderHighlightedText(item.content, item.highlightedSpans)}
              </div>
            ) : (
              <p>{item.content}</p>
            )}
          </div>

          {item.highlightedSpans.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-rose-400" />
                Detected Spans:
              </span>
              {item.highlightedSpans.map((span, idx) => (
                <span
                  key={idx}
                  className="bg-rose-950/60 text-rose-300 border border-rose-800/50 px-2 py-0.5 rounded text-[11px] font-mono"
                >
                  "{span.text}" · {(span.score * 100).toFixed(0)}%
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Multi-Head NLP Model Breakdown */}
        <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              Multi-Head NLP Inference Breakdown
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {item.inferenceLatencyMs}ms · {item.modelVersion}
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {[
              { label: 'Overall Risk Score', score: item.scores.overallRisk, threshold: 0.75 },
              { label: 'Toxicity', score: item.scores.toxicity, threshold: 0.70 },
              { label: 'Hate Speech', score: item.scores.hateSpeech, threshold: 0.75 },
              { label: 'Harassment & Bullying', score: item.scores.harassment, threshold: 0.70 },
              { label: 'Threat & Violence', score: item.scores.threatViolence, threshold: 0.65 },
              { label: 'Protected Identity Attack', score: item.scores.identityAttack, threshold: 0.75 },
              { label: 'Profanity / Vulgarity', score: item.scores.profanity, threshold: 0.60 },
            ].map((metric) => (
              <div key={metric.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{metric.label}</span>
                  <span className="font-mono text-slate-200 tabular-nums">
                    {(metric.score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full ${getScoreBarColor(metric.score)}`}
                    style={{ width: `${Math.min(100, metric.score * 100)}%` }}
                  />
                  {/* Calibrated Threshold Marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-white/40" 
                    style={{ left: `${metric.threshold * 100}%` }}
                    title={`Policy threshold: ${(metric.threshold * 100).toFixed(0)}%`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            <span>Vertical white marker indicates automated policy decision boundary.</span>
          </div>
        </div>

        {/* Author Profile Context */}
        <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              Author Trust Profile & History
            </span>
            <span className="font-mono text-xs text-slate-400">{item.author.id}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Trust Score</span>
              <span className="font-mono font-semibold text-slate-200 text-sm">
                {item.author.trustScore}/100
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Active Strikes</span>
              <span className={`font-mono font-semibold text-sm ${item.author.historicalStrikes > 1 ? 'text-rose-400' : 'text-slate-200'}`}>
                {item.author.historicalStrikes}
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Prior (30d)</span>
              <span className="font-mono font-semibold text-slate-200 text-sm">
                {item.author.priorViolations30d} violations
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Account Age</span>
              <span className="font-mono font-semibold text-slate-200 text-sm">
                {item.author.accountAgeDays} days
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Author Handle: @{item.author.username}</span>
            <span>{item.author.isVerified ? 'Verified Account' : 'Standard User'}</span>
          </div>
        </div>

        {/* Telemetry & Metadata */}
        <div className="border border-slate-800/80 rounded-lg p-3 bg-slate-950/30 text-xs text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Kafka Partition / Offset:</span>
            <span className="font-mono text-slate-300">partition-4 / {item.kafkaOffset}</span>
          </div>
          <div className="flex justify-between">
            <span>Primary Detected Violation:</span>
            <span className="text-rose-300 font-medium">
              {formatPolicyCategoryLabel(item.primaryViolation)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Community User Reports:</span>
            <span className="font-mono text-slate-300">{item.reportCount || 0} reports</span>
          </div>
        </div>

        {/* Action Configuration */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-medium text-slate-300">
            Rejection Policy Violation Code (if rejecting):
          </label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="Violent Threat & Physical Harm (Art. 1)">Violent Threat & Physical Harm (Art. 1)</option>
            <option value="Hate Speech - Group Denigration (Art. 4)">Hate Speech - Group Denigration (Art. 4)</option>
            <option value="Targeted Harassment & Cyberbullying (Art. 3)">Targeted Harassment & Cyberbullying (Art. 3)</option>
            <option value="Toxic & Abusive Content (Art. 2)">Toxic & Abusive Content (Art. 2)</option>
            <option value="Protected Identity Attack (Art. 5)">Protected Identity Attack (Art. 5)</option>
            <option value="Coordinated Inauthentic Behavior / Spam">Coordinated Inauthentic Behavior / Spam</option>
          </select>

          <label className="block text-xs font-medium text-slate-300">
            Audit Trail Notes (Optional):
          </label>
          <textarea
            value={moderatorNotes}
            onChange={(e) => setModeratorNotes(e.target.value)}
            placeholder="Add internal moderator context or policy justification..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 h-20 resize-none"
          />
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => onEscalate(item.id, moderatorNotes)}
          className="px-3 py-2 text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <ArrowUpRight className="w-4 h-4 text-amber-400" />
          <span>Escalate to Legal</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onApprove(item.id, moderatorNotes)}
            className="px-4 py-2 text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Approve & Restore</span>
          </button>

          <button
            onClick={() => onReject(item.id, selectedReason, moderatorNotes)}
            className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>Reject & Apply Strike</span>
          </button>
        </div>
      </div>
    </div>
  );
};

function renderHighlightedText(text: string, spans: { text: string; score: number }[]) {
  if (!spans || spans.length === 0) return <span>{text}</span>;

  // Simple safe highlight replacement
  let rendered: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  for (const span of spans) {
    const idx = remaining.toLowerCase().indexOf(span.text.toLowerCase());
    if (idx !== -1) {
      if (idx > 0) {
        rendered.push(<span key={keyIdx++}>{remaining.slice(0, idx)}</span>);
      }
      rendered.push(
        <mark
          key={keyIdx++}
          className="bg-rose-500/25 text-rose-200 border-b border-rose-500 font-semibold px-0.5 rounded-xs"
        >
          {remaining.slice(idx, idx + span.text.length)}
        </mark>
      );
      remaining = remaining.slice(idx + span.text.length);
    }
  }

  if (remaining.length > 0) {
    rendered.push(<span key={keyIdx++}>{remaining}</span>);
  }

  return <>{rendered}</>;
}
