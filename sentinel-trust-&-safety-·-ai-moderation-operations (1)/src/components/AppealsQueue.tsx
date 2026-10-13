import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  User, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  AlertCircle,
  FileText,
  RotateCcw
} from 'lucide-react';
import { AppealItem, QueueItem } from '../types/moderation';

interface AppealsQueueProps {
  appeals: AppealItem[];
  escalatedItems: QueueItem[];
  onOverturnAppeal: (appealId: string, notes?: string) => void;
  onUpholdAppeal: (appealId: string, notes?: string) => void;
  onResolveEscalation: (itemId: string, action: 'approved' | 'rejected', notes?: string) => void;
}

export const AppealsQueue: React.FC<AppealsQueueProps> = ({
  appeals,
  escalatedItems,
  onOverturnAppeal,
  onUpholdAppeal,
  onResolveEscalation,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'appeals' | 'escalations'>('appeals');
  const [selectedAppeal, setSelectedAppeal] = useState<AppealItem | null>(appeals[0] || null);
  const [appealReviewNotes, setAppealReviewNotes] = useState<string>('');

  const pendingAppeals = appeals.filter((a) => a.status === 'pending');
  const pendingEscalations = escalatedItems.filter((i) => i.status === 'escalated');

  return (
    <div className="space-y-4">
      {/* Sub navigation between User Appeals & Internal Escalations */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('appeals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'appeals'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Contested User Appeals</span>
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
              {pendingAppeals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('escalations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'escalations'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Tier-2 Legal Escalations</span>
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
              {pendingEscalations.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden sm:block">
          SLA Target: &lt; 24h turn-around for appeals
        </div>
      </div>

      {activeSubTab === 'appeals' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* List of Appeals */}
          <div className="lg:col-span-5 space-y-3">
            {pendingAppeals.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                <p className="text-xs font-semibold text-slate-300">Appeals Queue Clear</p>
                <p className="text-[11px] text-slate-500 mt-1">All user dispute cases have been audited.</p>
              </div>
            ) : (
              pendingAppeals.map((appeal) => (
                <div
                  key={appeal.id}
                  onClick={() => setSelectedAppeal(appeal)}
                  className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-colors space-y-2.5 ${
                    selectedAppeal?.id === appeal.id
                      ? 'border-indigo-500/80 bg-indigo-950/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400 font-semibold">{appeal.id}</span>
                    <span className="text-slate-500">{appeal.submittedAt}</span>
                  </div>

                  <div className="text-xs text-slate-300 line-clamp-2">
                    <span className="text-slate-500">Appeal: </span>"{appeal.userJustification}"
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">@{appeal.author.username}</span>
                    <span className="text-rose-400 font-mono text-[10px]">
                      Risk: {(appeal.originalDecision.originalScores.overallRisk * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Active Appeal Review Detail */}
          <div className="lg:col-span-7">
            {selectedAppeal ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Case Review: {selectedAppeal.id}</span>
                    </h3>
                    <span className="text-xs text-slate-400">
                      Disputing decision on {selectedAppeal.originalPostId}
                    </span>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
                    Pending Senior Review
                  </span>
                </div>

                {/* Original Flagged Content */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    1. Original Content Removed
                  </span>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                    {selectedAppeal.postContent}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span>Decision Reason: <strong className="text-rose-300">{selectedAppeal.originalDecision.reason}</strong></span>
                    <span>·</span>
                    <span>Applied: {selectedAppeal.originalDecision.timestamp}</span>
                  </div>
                </div>

                {/* User Justification Statement */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    2. User's Written Appeal Statement
                  </span>
                  <div className="p-4 bg-indigo-950/20 border border-indigo-900/40 rounded-lg text-xs text-indigo-200 leading-relaxed">
                    "{selectedAppeal.userJustification}"
                  </div>
                </div>

                {/* Author Trust Context */}
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Author Trust Score</span>
                    <span className="font-mono text-slate-200 font-semibold">{selectedAppeal.author.trustScore}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Account Tenure</span>
                    <span className="font-mono text-slate-200 font-semibold">{selectedAppeal.author.accountAgeDays} days</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Prior Penalties</span>
                    <span className="font-mono text-slate-200 font-semibold">{selectedAppeal.author.historicalStrikes} strikes</span>
                  </div>
                </div>

                {/* Reviewer notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">
                    Appeals Determination Justification:
                  </label>
                  <textarea
                    value={appealReviewNotes}
                    onChange={(e) => setAppealReviewNotes(e.target.value)}
                    placeholder="State reason for overturning or upholding (e.g. 'Verified educational / academic exception under Policy §4.3')..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 h-16 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      onUpholdAppeal(selectedAppeal.id, appealReviewNotes);
                      setAppealReviewNotes('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Uphold Removal (Reject Appeal)</span>
                  </button>

                  <button
                    onClick={() => {
                      onOverturnAppeal(selectedAppeal.id, appealReviewNotes);
                      setAppealReviewNotes('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-emerald-200 bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Overturn & Restore Post</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">
                Select an appeal case from the left to inspect and resolve.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Escalations Tab */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Tier-2 Internal Escalations & Legal Review</span>
            </h3>
            <span className="text-xs text-slate-400">
              High-severity, ambiguous, or regulatory compliance items
            </span>
          </div>

          {pendingEscalations.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-400" />
              <p className="text-xs font-semibold text-slate-300">No Pending Escalations</p>
              <p className="text-[11px] text-slate-500">All escalated cases have been addressed by senior teams.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingEscalations.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-amber-400">{item.id}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">Author: @{item.author.username}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-400">Report Count: {item.reportCount || 0}</span>
                    </div>
                    <p className="text-xs text-slate-200 font-mono bg-slate-900 p-2 rounded border border-slate-800/60">
                      "{item.content}"
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Risk: {(item.scores.overallRisk * 100).toFixed(0)}%</span>
                      <span>·</span>
                      <span>Threat: {(item.scores.threatViolence * 100).toFixed(0)}%</span>
                      <span>·</span>
                      <span>Hate Speech: {(item.scores.hateSpeech * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onResolveEscalation(item.id, 'approved', 'Senior approval post legal check')}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Approve & Clear</span>
                    </button>

                    <button
                      onClick={() => onResolveEscalation(item.id, 'rejected', 'Senior removal verified')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5 text-white" />
                      <span>Confirm Removal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
