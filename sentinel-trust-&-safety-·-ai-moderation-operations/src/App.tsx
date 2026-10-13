import React, { useState, useEffect, useCallback } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  KafkaMonitorBar 
} from './components/KafkaMonitorBar';
import { 
  ModeratorQueue 
} from './components/ModeratorQueue';
import { 
  ItemInspectorDrawer 
} from './components/ItemInspectorDrawer';
import { 
  AppealsQueue 
} from './components/AppealsQueue';
import { 
  AnalyticsView 
} from './components/AnalyticsView';
import { 
  PipelinePlayground 
} from './components/PipelinePlayground';
import { 
  ArchitectureModal 
} from './components/ArchitectureModal';
import { 
  ThresholdConfigModal 
} from './components/ThresholdConfigModal';
import { 
  KeyboardShortcutsModal 
} from './components/KeyboardShortcutsModal';

import { 
  QueueItem, 
  AppealItem, 
  KafkaTelemetry, 
  ModerationMetrics, 
  ModerationStatus 
} from './types/moderation';
import { 
  INITIAL_QUEUE_ITEMS, 
  INITIAL_APPEALS, 
  INITIAL_KAFKA_TELEMETRY, 
  INITIAL_METRICS,
  SYNTHETIC_INCOMING_TEMPLATES
} from './data/mockData';

export default function App() {
  const [items, setItems] = useState<QueueItem[]>(INITIAL_QUEUE_ITEMS);
  const [appeals, setAppeals] = useState<AppealItem[]>(INITIAL_APPEALS);
  const [telemetry, setTelemetry] = useState<KafkaTelemetry>(INITIAL_KAFKA_TELEMETRY);
  const [metrics, setMetrics] = useState<ModerationMetrics>(INITIAL_METRICS);

  const [activeTab, setActiveTab] = useState<'queue' | 'appeals' | 'playground' | 'analytics'>('queue');
  const [statusFilter, setStatusFilter] = useState<ModerationStatus>('pending');
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);

  const [isStreaming, setIsStreaming] = useState(true);
  const [showArchitecture, setShowArchitecture] = useState(false);
  const [showThresholds, setShowThresholds] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Real-time Kafka stream simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // Periodic incoming post injection
      const template = SYNTHETIC_INCOMING_TEMPLATES[Math.floor(Math.random() * SYNTHETIC_INCOMING_TEMPLATES.length)];
      const randomOffset = Math.floor(4892020 + Math.random() * 900);
      const randomId = `POST-${Math.floor(849300 + Math.random() * 2000)}`;

      const newItem: QueueItem = {
        id: randomId,
        kafkaOffset: randomOffset,
        kafkaTopic: 'events.feed.posts.flagged.v2',
        timestamp: 'Just now',
        contentType: 'post',
        content: template.content,
        author: {
          id: `USR-${Math.floor(2000 + Math.random() * 8000)}`,
          username: `${template.authorName}_${Math.floor(Math.random() * 99)}`,
          displayName: template.authorName,
          avatarSeed: 'stream',
          accountAgeDays: Math.floor(20 + Math.random() * 400),
          followerCount: Math.floor(10 + Math.random() * 1200),
          trustScore: Math.floor(20 + Math.random() * 40),
          historicalStrikes: 1,
          priorViolations30d: 1,
          isVerified: false,
        },
        scores: template.scores,
        primaryViolation: template.primaryViolation,
        riskLevel: template.riskLevel,
        highlightedSpans: [],
        status: 'pending',
        inferenceLatencyMs: Math.floor(14 + Math.random() * 8),
        modelVersion: 'RoBERTa-Tox-v3.4.1 (TF-Serving)',
        reportCount: Math.floor(1 + Math.random() * 5),
      };

      setItems((prev) => [newItem, ...prev]);
      setTelemetry((prev) => ({
        ...prev,
        eventsIngestedTotal: prev.eventsIngestedTotal + 1,
        lagOffset: Math.max(0, prev.lagOffset + 1),
      }));
      setMetrics((prev) => ({
        ...prev,
        totalProcessedToday: prev.totalProcessedToday + 1,
        routedToHumanQueue: prev.routedToHumanQueue + 1,
        queueBacklog: prev.queueBacklog + 1,
      }));
    }, 28000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Synthetic item injection helper
  const handleInjectSynthetic = () => {
    const template = SYNTHETIC_INCOMING_TEMPLATES[Math.floor(Math.random() * SYNTHETIC_INCOMING_TEMPLATES.length)];
    const randomOffset = Math.floor(4892020 + Math.random() * 900);
    const randomId = `POST-${Math.floor(849300 + Math.random() * 2000)}`;

    const newItem: QueueItem = {
      id: randomId,
      kafkaOffset: randomOffset,
      kafkaTopic: 'events.feed.posts.flagged.v2',
      timestamp: 'Just now',
      contentType: 'post',
      content: template.content,
      author: {
        id: `USR-${Math.floor(2000 + Math.random() * 8000)}`,
        username: `${template.authorName}_${Math.floor(Math.random() * 99)}`,
        displayName: template.authorName,
        avatarSeed: 'stream',
        accountAgeDays: Math.floor(20 + Math.random() * 400),
        followerCount: Math.floor(10 + Math.random() * 1200),
        trustScore: Math.floor(20 + Math.random() * 40),
        historicalStrikes: 1,
        priorViolations30d: 1,
        isVerified: false,
      },
      scores: template.scores,
      primaryViolation: template.primaryViolation,
      riskLevel: template.riskLevel,
      highlightedSpans: [],
      status: 'pending',
      inferenceLatencyMs: Math.floor(14 + Math.random() * 8),
      modelVersion: 'RoBERTa-Tox-v3.4.1 (TF-Serving)',
      reportCount: Math.floor(1 + Math.random() * 5),
    };

    setItems((prev) => [newItem, ...prev]);
    showToast(`Injected event #${newItem.kafkaOffset} into active queue.`);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if typing in input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === '?') {
        setShowShortcuts((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (selectedItem) setSelectedItem(null);
        if (showArchitecture) setShowArchitecture(false);
        if (showThresholds) setShowThresholds(false);
        if (showShortcuts) setShowShortcuts(false);
      } else if (activeTab === 'queue' && items.length > 0) {
        const pendingList = items.filter((i) => i.status === statusFilter);
        const currentIndex = selectedItem ? pendingList.findIndex((i) => i.id === selectedItem.id) : -1;

        if (e.key === 'j') {
          // Next item
          const nextIndex = (currentIndex + 1) % pendingList.length;
          setSelectedItem(pendingList[nextIndex]);
        } else if (e.key === 'k') {
          // Prev item
          const prevIndex = (currentIndex - 1 + pendingList.length) % pendingList.length;
          setSelectedItem(pendingList[prevIndex]);
        } else if (e.key === 'a' && selectedItem) {
          // Quick approve focused
          handleApproveSingle(selectedItem.id);
        } else if (e.key === 'r' && selectedItem) {
          // Quick reject focused
          handleRejectSingle(selectedItem.id, 'Hot-key removal action');
        } else if (e.key === 'e' && selectedItem) {
          // Quick escalate
          handleEscalateSingle(selectedItem.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, items, statusFilter, activeTab, showArchitecture, showThresholds, showShortcuts]);

  // Actions on Items
  const handleApproveSingle = useCallback((id: string, notes?: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'approved',
              moderatorDecision: {
                action: 'approved',
                moderatorId: 'MOD-991',
                decidedAt: 'Just now',
                notes,
              },
            }
          : item
      )
    );
    if (selectedItem?.id === id) setSelectedItem(null);
    showToast(`Approved item ${id}. Policy flag dismissed.`);
  }, [selectedItem]);

  const handleRejectSingle = useCallback((id: string, reason: string, notes?: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'rejected',
              moderatorDecision: {
                action: 'rejected',
                reason,
                moderatorId: 'MOD-991',
                decidedAt: 'Just now',
                notes,
              },
            }
          : item
      )
    );
    if (selectedItem?.id === id) setSelectedItem(null);
    showToast(`Rejected & removed item ${id} under ${reason}.`);
  }, [selectedItem]);

  const handleEscalateSingle = useCallback((id: string, notes?: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'escalated',
              moderatorDecision: {
                action: 'escalated',
                moderatorId: 'MOD-991',
                decidedAt: 'Just now',
                notes,
              },
            }
          : item
      )
    );
    if (selectedItem?.id === id) setSelectedItem(null);
    showToast(`Escalated item ${id} to Legal / Tier-2 queue.`);
  }, [selectedItem]);

  // Batch actions
  const handleBatchApprove = (ids: string[]) => {
    setItems((prev) =>
      prev.map((item) =>
        ids.includes(item.id)
          ? {
              ...item,
              status: 'approved',
              moderatorDecision: {
                action: 'approved',
                moderatorId: 'MOD-991',
                decidedAt: 'Just now',
              },
            }
          : item
      )
    );
    showToast(`Batch approved ${ids.length} items.`);
  };

  const handleBatchReject = (ids: string[], reason: string) => {
    setItems((prev) =>
      prev.map((item) =>
        ids.includes(item.id)
          ? {
              ...item,
              status: 'rejected',
              moderatorDecision: {
                action: 'rejected',
                reason,
                moderatorId: 'MOD-991',
                decidedAt: 'Just now',
              },
            }
          : item
      )
    );
    showToast(`Batch removed ${ids.length} items (${reason}).`);
  };

  const handleBatchEscalate = (ids: string[]) => {
    setItems((prev) =>
      prev.map((item) =>
        ids.includes(item.id)
          ? {
              ...item,
              status: 'escalated',
              moderatorDecision: {
                action: 'escalated',
                moderatorId: 'MOD-991',
                decidedAt: 'Just now',
              },
            }
          : item
      )
    );
    showToast(`Batch escalated ${ids.length} items.`);
  };

  // Appeals actions
  const handleOverturnAppeal = (appealId: string, notes?: string) => {
    setAppeals((prev) =>
      prev.map((a) =>
        a.id === appealId
          ? {
              ...a,
              status: 'overturned',
              reviewerNotes: notes || 'Overturned by Senior Moderator post-audit',
              reviewedAt: 'Just now',
            }
          : a
      )
    );
    showToast(`Appeal ${appealId} OVERTURNED. Post restored & strike cleared.`);
  };

  const handleUpholdAppeal = (appealId: string, notes?: string) => {
    setAppeals((prev) =>
      prev.map((a) =>
        a.id === appealId
          ? {
              ...a,
              status: 'upheld',
              reviewerNotes: notes || 'Policy violation upheld on re-review',
              reviewedAt: 'Just now',
            }
          : a
      )
    );
    showToast(`Appeal ${appealId} UPHELD. Penalty reaffirmed.`);
  };

  const handleResolveEscalation = (itemId: string, action: 'approved' | 'rejected', notes?: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: action,
              moderatorDecision: {
                action,
                moderatorId: 'LEGAL-COUNSEL-01',
                decidedAt: 'Just now',
                notes,
              },
            }
          : item
      )
    );
    showToast(`Tier-2 Escalation ${itemId} resolved (${action}).`);
  };

  const pendingQueueCount = items.filter((i) => i.status === 'pending').length;
  const pendingAppealsCount = appeals.filter((a) => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/20 selection:text-rose-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingQueueCount={pendingQueueCount}
        pendingAppealsCount={pendingAppealsCount}
        onOpenArchitecture={() => setShowArchitecture(true)}
        onOpenThresholds={() => setShowThresholds(true)}
        onToggleShortcuts={() => setShowShortcuts(true)}
        kafkaConnected={telemetry.status === 'connected'}
      />

      {/* Real-time Kafka Topic Monitor Strip */}
      <KafkaMonitorBar
        telemetry={telemetry}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming((prev) => !prev)}
        onInjectSynthetic={handleInjectSynthetic}
        queueCount={pendingQueueCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'queue' && (
          <ModeratorQueue
            items={items}
            selectedItem={selectedItem}
            onSelectItem={(item) => setSelectedItem(item)}
            onApproveSingle={handleApproveSingle}
            onRejectSingle={handleRejectSingle}
            onEscalateSingle={handleEscalateSingle}
            onBatchApprove={handleBatchApprove}
            onBatchReject={handleBatchReject}
            onBatchEscalate={handleBatchEscalate}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        )}

        {activeTab === 'appeals' && (
          <AppealsQueue
            appeals={appeals}
            escalatedItems={items}
            onOverturnAppeal={handleOverturnAppeal}
            onUpholdAppeal={handleUpholdAppeal}
            onResolveEscalation={handleResolveEscalation}
          />
        )}

        {activeTab === 'playground' && (
          <PipelinePlayground
            onInjectItem={(newItem) => {
              setItems((prev) => [newItem, ...prev]);
              showToast(`Created & queued event ${newItem.id}.`);
            }}
            onNavigateToQueue={() => {
              setActiveTab('queue');
              setStatusFilter('pending');
            }}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView metrics={metrics} />
        )}
      </main>

      {/* Item Inspector Slide-Over Drawer */}
      <ItemInspectorDrawer
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onApprove={handleApproveSingle}
        onReject={handleRejectSingle}
        onEscalate={handleEscalateSingle}
      />

      {/* Modals */}
      {showArchitecture && (
        <ArchitectureModal onClose={() => setShowArchitecture(false)} />
      )}

      {showThresholds && (
        <ThresholdConfigModal
          onClose={() => setShowThresholds(false)}
          onSave={(th) => {
            showToast(`Applied thresholds: Auto-block ${(th.autoBlock * 100).toFixed(0)}%, Review ${(th.humanReview * 100).toFixed(0)}%`);
          }}
        />
      )}

      {showShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-slate-700 text-white text-xs px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
