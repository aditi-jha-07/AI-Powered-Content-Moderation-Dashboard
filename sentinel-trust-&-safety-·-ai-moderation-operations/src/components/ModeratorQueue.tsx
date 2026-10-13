import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  ArrowUpRight, 
  ChevronRight, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  User, 
  Layers, 
  CheckSquare, 
  Square,
  Eye,
  CornerDownRight,
  Flame
} from 'lucide-react';
import { QueueItem, PolicyCategory, RiskLevel, ModerationStatus } from '../types/moderation';
import { formatPolicyCategoryLabel } from '../services/nlpService';

interface ModeratorQueueProps {
  items: QueueItem[];
  selectedItem: QueueItem | null;
  onSelectItem: (item: QueueItem) => void;
  onApproveSingle: (id: string) => void;
  onRejectSingle: (id: string, reason: string) => void;
  onEscalateSingle: (id: string) => void;
  onBatchApprove: (ids: string[]) => void;
  onBatchReject: (ids: string[], reason: string) => void;
  onBatchEscalate: (ids: string[]) => void;
  statusFilter: ModerationStatus;
  setStatusFilter: (status: ModerationStatus) => void;
}

export const ModeratorQueue: React.FC<ModeratorQueueProps> = ({
  items,
  selectedItem,
  onSelectItem,
  onApproveSingle,
  onRejectSingle,
  onEscalateSingle,
  onBatchApprove,
  onBatchReject,
  onBatchEscalate,
  statusFilter,
  setStatusFilter,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [batchRejectReason, setBatchRejectReason] = useState<string>('Hate Speech - Group Denigration (Art. 4)');
  const [showBatchRejectModal, setShowBatchRejectModal] = useState(false);

  // Filtering
  const filteredItems = items.filter((item) => {
    if (item.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && item.primaryViolation !== categoryFilter) return false;
    if (riskFilter !== 'all' && item.riskLevel !== riskFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = item.content.toLowerCase().includes(q);
      const matchAuthor = item.author.username.toLowerCase().includes(q) || item.author.displayName.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      if (!matchText && !matchAuthor && !matchId) return false;
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchApproveClick = () => {
    if (selectedIds.length === 0) return;
    onBatchApprove(selectedIds);
    setSelectedIds([]);
  };

  const handleBatchRejectConfirm = () => {
    if (selectedIds.length === 0) return;
    onBatchReject(selectedIds, batchRejectReason);
    setSelectedIds([]);
    setShowBatchRejectModal(false);
  };

  const handleBatchEscalateClick = () => {
    if (selectedIds.length === 0) return;
    onBatchEscalate(selectedIds);
    setSelectedIds([]);
  };

  const getRiskBadgeColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'critical': return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/15 border-orange-500/30';
      case 'medium': return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      default: return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            {(['pending', 'approved', 'rejected', 'escalated'] as ModerationStatus[]).map((st) => {
              const count = items.filter((i) => i.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setSelectedIds([]);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap capitalize flex items-center gap-1.5 ${
                    statusFilter === st
                      ? 'bg-slate-800 text-white shadow-xs font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{st === 'pending' ? 'Pending Queue' : st}</span>
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search text, author, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Category & Risk Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Policy:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="hate_speech">Hate Speech</option>
              <option value="threat_violence">Violent Threats</option>
              <option value="harassment">Harassment</option>
              <option value="toxicity">Toxicity & Abuse</option>
              <option value="identity_attack">Identity Attack</option>
              <option value="spam_misinfo">Spam / Misinfo</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Risk Level:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Risk Tiers</option>
              <option value="critical">Critical (≥0.90)</option>
              <option value="high">High (≥0.75)</option>
              <option value="medium">Medium (≥0.50)</option>
              <option value="low">Low (&lt;0.50)</option>
            </select>
          </div>

          <div className="ml-auto text-slate-400 font-mono text-xs">
            Showing <span className="text-white font-medium">{filteredItems.length}</span> items
          </div>
        </div>
      </div>

      {/* Floating / Sticky Batch Action Bar (when items selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-950/90 border border-indigo-700/80 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-3 shadow-lg backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-indigo-200 flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <span>{selectedIds.length} items selected for batch action</span>
            </span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-indigo-300 hover:text-white underline"
            >
              Clear selection
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchApproveClick}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-200 bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Batch Approve ({selectedIds.length})</span>
            </button>

            <button
              onClick={() => setShowBatchRejectModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-rose-200 bg-rose-900/60 hover:bg-rose-800 border border-rose-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Batch Reject ({selectedIds.length})</span>
            </button>

            <button
              onClick={handleBatchEscalateClick}
              className="px-3 py-1.5 text-xs font-semibold text-amber-200 bg-amber-900/60 hover:bg-amber-800 border border-amber-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
              <span>Batch Escalate ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Queue Items Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-4 py-3 grid grid-cols-12 gap-3 text-xs font-semibold text-slate-400 items-center">
          <div className="col-span-1 flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              title="Select all"
            >
              {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-indigo-400" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
            <span className="hidden sm:inline">Offset</span>
          </div>

          <div className="col-span-2 hidden md:block">Author & Trust</div>
          <div className="col-span-11 md:col-span-5">Flagged Content Snippet</div>
          <div className="col-span-2 hidden lg:block">Model Confidence</div>
          <div className="col-span-2 text-right">Quick Actions</div>
        </div>

        {/* Table Rows */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-300">
              No items in this queue view
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All items in the selected status filter have been resolved or filtered out by current criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isDrawerOpen = selectedItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className={`px-4 py-3.5 grid grid-cols-12 gap-3 items-center text-xs transition-colors cursor-pointer group ${
                    isDrawerOpen
                      ? 'bg-indigo-950/30'
                      : isSelected
                      ? 'bg-slate-800/40'
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  {/* Col 1: Select Checkbox & Offset */}
                  <div className="col-span-1 flex items-center gap-2">
                    <button
                      onClick={(e) => toggleSelectOne(item.id, e)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                      )}
                    </button>
                    <span className="font-mono text-slate-500 text-[11px] hidden sm:inline">
                      #{item.kafkaOffset.toString().slice(-4)}
                    </span>
                  </div>

                  {/* Col 2: Author Context */}
                  <div className="col-span-2 hidden md:block">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-[10px] shrink-0">
                        {item.author.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <span className="font-medium text-slate-200 truncate block">
                          @{item.author.username}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Trust: {item.author.trustScore}% · {item.author.historicalStrikes} strikes
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Col 3: Content Snippet & Primary Violation */}
                  <div className="col-span-11 md:col-span-5 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${getRiskBadgeColor(item.riskLevel)}`}>
                        {formatPolicyCategoryLabel(item.primaryViolation)}
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {item.timestamp}
                      </span>
                      {item.reportCount && item.reportCount > 5 && (
                        <span className="text-[10px] text-rose-400 flex items-center gap-0.5">
                          <Flame className="w-3 h-3 text-rose-500" />
                          {item.reportCount} rpts
                        </span>
                      )}
                    </div>

                    <p className="text-slate-300 line-clamp-2 leading-relaxed">
                      {item.content}
                    </p>
                  </div>

                  {/* Col 4: Model Confidence Scores */}
                  <div className="col-span-2 hidden lg:block space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Risk Score</span>
                      <span className="font-mono text-slate-200 font-semibold tabular-nums">
                        {(item.scores.overallRisk * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.scores.overallRisk >= 0.85
                            ? 'bg-rose-500'
                            : item.scores.overallRisk >= 0.70
                            ? 'bg-orange-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.scores.overallRisk * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>Tox: {(item.scores.toxicity * 100).toFixed(0)}%</span>
                      <span>Hate: {(item.scores.hateSpeech * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Col 5: Actions */}
                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    {item.status === 'pending' ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onApproveSingle(item.id);
                          }}
                          title="Quick Approve (Dismiss Flag)"
                          className="p-1.5 rounded-md text-emerald-400 hover:bg-emerald-950/60 hover:text-emerald-300 border border-transparent hover:border-emerald-800 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRejectSingle(item.id, 'Policy Violation Strike');
                          }}
                          title="Quick Reject (Remove & Strike)"
                          className="p-1.5 rounded-md text-rose-400 hover:bg-rose-950/60 hover:text-rose-300 border border-transparent hover:border-rose-800 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEscalateSingle(item.id);
                          }}
                          title="Escalate to Legal/Senior"
                          className="p-1.5 rounded-md text-amber-400 hover:bg-amber-950/60 hover:text-amber-300 border border-transparent hover:border-amber-800 transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] font-medium capitalize text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                        {item.status}
                      </span>
                    )}

                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Batch Reject Modal */}
      {showBatchRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                Batch Reject {selectedIds.length} Flagged Items
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are applying policy removal actions to {selectedIds.length} items. Content will be taken down and strikes recorded on the author accounts.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Primary Policy Reason Code:
              </label>
              <select
                value={batchRejectReason}
                onChange={(e) => setBatchRejectReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="Hate Speech - Group Denigration (Art. 4)">Hate Speech - Group Denigration (Art. 4)</option>
                <option value="Violent Threat & Physical Harm (Art. 1)">Violent Threat & Physical Harm (Art. 1)</option>
                <option value="Targeted Harassment & Cyberbullying (Art. 3)">Targeted Harassment & Cyberbullying (Art. 3)</option>
                <option value="Toxic & Abusive Content (Art. 2)">Toxic & Abusive Content (Art. 2)</option>
                <option value="Protected Identity Attack (Art. 5)">Protected Identity Attack (Art. 5)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBatchRejectModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchRejectConfirm}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs"
              >
                Confirm Batch Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
