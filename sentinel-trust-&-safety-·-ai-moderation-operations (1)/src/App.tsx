import React, { useState, useEffect, useCallback } from 'react';
import { ConfigProvider, theme, Layout, notification, message } from 'antd';
import { AntdHeader } from './components/AntdHeader';
import { KafkaMonitorBar } from './components/KafkaMonitorBar';
import { AntdModeratorQueue } from './components/AntdModeratorQueue';
import { AntdItemInspector } from './components/AntdItemInspector';
import { AntdAppealsQueue } from './components/AntdAppealsQueue';
import { AntdAnalyticsView } from './components/AntdAnalyticsView';
import { AntdTechStackExplorer } from './components/AntdTechStackExplorer';
import { PipelinePlayground } from './components/PipelinePlayground';
import { ArchitectureModal } from './components/ArchitectureModal';
import { ThresholdConfigModal } from './components/ThresholdConfigModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

import { useWebSocket } from './hooks/useWebSocket';
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

const { Content } = Layout;

export default function App() {
  const [items, setItems] = useState<QueueItem[]>(INITIAL_QUEUE_ITEMS);
  const [appeals, setAppeals] = useState<AppealItem[]>(INITIAL_APPEALS);
  const [telemetry, setTelemetry] = useState<KafkaTelemetry>(INITIAL_KAFKA_TELEMETRY);
  const [metrics, setMetrics] = useState<ModerationMetrics>(INITIAL_METRICS);

  const [activeTab, setActiveTab] = useState<'queue' | 'appeals' | 'playground' | 'analytics' | 'techstack'>('queue');
  const [statusFilter, setStatusFilter] = useState<ModerationStatus>('pending');
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);

  const [isStreaming, setIsStreaming] = useState(true);
  const [showArchitecture, setShowArchitecture] = useState(false);
  const [showThresholds, setShowThresholds] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Real-time WebSocket hook
  const { status: wsStatus, latencyMs: wsLatency, frames: wsFrames, sendFrame, recordFrame } = useWebSocket();

  const [api, contextHolder] = notification.useNotification();

  const showNotification = (title: string, desc: string, type: 'success' | 'info' | 'warning' = 'info') => {
    api[type]({
      message: title,
      description: desc,
      placement: 'bottomRight',
      duration: 3.5,
    });
  };

  // Real-time Kafka stream simulation emitting frames to WebSocket hook
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
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

      // Record incoming WebSocket message frame
      recordFrame({
        type: 'EVENT_INGEST',
        payload: {
          id: newItem.id,
          topic: newItem.kafkaTopic,
          offset: newItem.kafkaOffset,
          risk: newItem.scores.overallRisk,
        },
      });

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
  }, [isStreaming, recordFrame]);

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

    recordFrame({
      type: 'EVENT_INGEST',
      payload: {
        id: newItem.id,
        topic: newItem.kafkaTopic,
        offset: newItem.kafkaOffset,
      },
    });

    showNotification('Kafka Event Ingested via WebSocket', `Post #${newItem.id} (offset ${newItem.kafkaOffset}) added to queue.`, 'info');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
          const nextIndex = (currentIndex + 1) % pendingList.length;
          setSelectedItem(pendingList[nextIndex]);
        } else if (e.key === 'k') {
          const prevIndex = (currentIndex - 1 + pendingList.length) % pendingList.length;
          setSelectedItem(pendingList[prevIndex]);
        } else if (e.key === 'a' && selectedItem) {
          handleApproveSingle(selectedItem.id);
        } else if (e.key === 'r' && selectedItem) {
          handleRejectSingle(selectedItem.id, 'Hot-key removal');
        } else if (e.key === 'e' && selectedItem) {
          handleEscalateSingle(selectedItem.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, items, statusFilter, activeTab, showArchitecture, showThresholds, showShortcuts]);

  // Actions
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
    showNotification('Item Approved & Restored', `Post ${id} flag dismissed. Content restored.`, 'success');
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
    showNotification('Item Removed & Strike Applied', `Post ${id} rejected under ${reason}. Persisted to PostgreSQL.`, 'warning');
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
    showNotification('Escalated to Legal', `Post ${id} transferred to Tier-2 queue.`, 'info');
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
    sendFrame('BATCH_ACTION', { action: 'approve', ids });
    showNotification('Batch Decision Applied', `Approved ${ids.length} items simultaneously via Celery queue.`, 'success');
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
    sendFrame('BATCH_ACTION', { action: 'reject', ids, reason });
    showNotification('Batch Removal Enforced', `Rejected ${ids.length} items (${reason}). Strikes updated.`, 'warning');
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
    sendFrame('BATCH_ACTION', { action: 'escalate', ids });
    showNotification('Batch Escalation Complete', `Escalated ${ids.length} items to Senior Policy Review.`, 'info');
  };

  // Appeals actions
  const handleOverturnAppeal = (appealId: string, notes?: string) => {
    setAppeals((prev) =>
      prev.map((a) =>
        a.id === appealId
          ? {
              ...a,
              status: 'overturned',
              reviewerNotes: notes || 'Overturned by Senior Reviewer',
              reviewedAt: 'Just now',
            }
          : a
      )
    );
    showNotification('Appeal Overturned', `Restored content and cleared strike for appeal ${appealId}.`, 'success');
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
    showNotification('Appeal Upheld', `Reaffirmed violation penalty for appeal ${appealId}.`, 'warning');
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
    showNotification('Escalation Resolved', `Decision (${action}) persisted to PostgreSQL database.`, 'info');
  };

  const pendingQueueCount = items.filter((i) => i.status === 'pending').length;
  const pendingAppealsCount = appeals.filter((a) => a.status === 'pending').length;

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          colorBgBase: '#020617',
          colorBgContainer: '#0f172a',
          colorBorder: '#1e293b',
          borderRadius: 8,
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        },
      }}
    >
      {contextHolder}
      <Layout className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Ant Design Header */}
        <AntdHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingQueueCount={pendingQueueCount}
          pendingAppealsCount={pendingAppealsCount}
          wsStatus={wsStatus}
          onOpenArchitecture={() => setShowArchitecture(true)}
          onOpenThresholds={() => setShowThresholds(true)}
          onToggleShortcuts={() => setShowShortcuts(true)}
        />

        {/* Real-time Kafka Telemetry Bar with WebSocket Stream */}
        <KafkaMonitorBar
          telemetry={telemetry}
          isStreaming={isStreaming}
          onToggleStreaming={() => setIsStreaming((prev) => !prev)}
          onInjectSynthetic={handleInjectSynthetic}
          queueCount={pendingQueueCount}
        />

        {/* Main Content Area */}
        <Content className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
          {activeTab === 'queue' && (
            <AntdModeratorQueue
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
            <AntdAppealsQueue
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
                recordFrame({
                  type: 'EVENT_INGEST',
                  payload: { id: newItem.id, topic: newItem.kafkaTopic },
                });
                showNotification('Item Injected into Queue', `Event ${newItem.id} generated and queued.`, 'success');
              }}
              onNavigateToQueue={() => {
                setActiveTab('queue');
                setStatusFilter('pending');
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AntdAnalyticsView metrics={metrics} />
          )}

          {activeTab === 'techstack' && (
            <AntdTechStackExplorer
              wsStatus={wsStatus}
              wsLatency={wsLatency}
              wsFrames={wsFrames}
              onTriggerWsPing={() => {
                sendFrame('PONG', { rtt: wsLatency });
                message.success('WebSocket PING/PONG frame transmitted');
              }}
            />
          )}
        </Content>

        {/* Ant Design Item Inspector Drawer */}
        <AntdItemInspector
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
              showNotification(
                'Decision Thresholds Updated',
                `Auto-block ${(th.autoBlock * 100).toFixed(0)}%, Review ${(th.humanReview * 100).toFixed(0)}%`,
                'success'
              );
            }}
          />
        )}

        {showShortcuts && (
          <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />
        )}
      </Layout>
    </ConfigProvider>
  );
}
