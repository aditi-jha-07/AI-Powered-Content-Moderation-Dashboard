import React from 'react';
import { Layout, Menu, Button, Space, Badge, Typography, Tag, Tooltip } from 'antd';
import { 
  SafetyCertificateOutlined, 
  DeploymentUnitOutlined, 
  BarChartOutlined, 
  SlidersOutlined, 
  QuestionCircleOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  UndoOutlined
} from '@ant-design/icons';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface AntdHeaderProps {
  activeTab: 'queue' | 'appeals' | 'playground' | 'analytics' | 'techstack';
  setActiveTab: (tab: 'queue' | 'appeals' | 'playground' | 'analytics' | 'techstack') => void;
  pendingQueueCount: number;
  pendingAppealsCount: number;
  wsStatus: 'connected' | 'connecting' | 'disconnected';
  onOpenArchitecture: () => void;
  onOpenThresholds: () => void;
  onToggleShortcuts: () => void;
}

export const AntdHeader: React.FC<AntdHeaderProps> = ({
  activeTab,
  setActiveTab,
  pendingQueueCount,
  pendingAppealsCount,
  wsStatus,
  onOpenArchitecture,
  onOpenThresholds,
  onToggleShortcuts,
}) => {
  return (
    <AntHeader className="!bg-slate-900/95 !border-b !border-slate-800 !px-4 sm:!px-8 !h-16 flex items-center justify-between sticky top-0 z-40 backdrop-blur">
      {/* Brand Zone */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
          <SafetyCertificateOutlined className="text-lg" />
        </div>
        <div>
          <Text strong className="text-white text-sm block leading-tight">
            Sentinel Moderation
          </Text>
          <Text type="secondary" className="text-[11px] block -mt-0.5">
            Ant Design · WebSockets · FastAPI · Celery
          </Text>
        </div>
      </div>

      {/* Nav Menu Tabs */}
      <div className="hidden md:flex items-center gap-1">
        <Button
          type={activeTab === 'queue' ? 'primary' : 'text'}
          size="small"
          onClick={() => setActiveTab('queue')}
        >
          Review Queue
          {pendingQueueCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono">
              {pendingQueueCount}
            </span>
          )}
        </Button>

        <Button
          type={activeTab === 'appeals' ? 'primary' : 'text'}
          size="small"
          icon={<UndoOutlined />}
          onClick={() => setActiveTab('appeals')}
        >
          Appeals & Escalations
          {pendingAppealsCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">
              {pendingAppealsCount}
            </span>
          )}
        </Button>

        <Button
          type={activeTab === 'playground' ? 'primary' : 'text'}
          size="small"
          icon={<ExperimentOutlined />}
          onClick={() => setActiveTab('playground')}
        >
          NLP Lab (RoBERTa)
        </Button>

        <Button
          type={activeTab === 'analytics' ? 'primary' : 'text'}
          size="small"
          icon={<BarChartOutlined />}
          onClick={() => setActiveTab('analytics')}
        >
          Operations & SLA
        </Button>

        <Button
          type={activeTab === 'techstack' ? 'primary' : 'text'}
          size="small"
          icon={<DeploymentUnitOutlined className="text-indigo-400" />}
          onClick={() => setActiveTab('techstack')}
        >
          Tech Stack Architecture
        </Button>
      </div>

      {/* Actions & Status */}
      <Space size={8}>
        <Tooltip title="WebSocket Live Stream Status">
          <Tag
            color={wsStatus === 'connected' ? 'success' : 'warning'}
            className="font-mono text-[11px] flex items-center gap-1 cursor-default"
          >
            <Badge status={wsStatus === 'connected' ? 'processing' : 'warning'} />
            <span>WS: {wsStatus.toUpperCase()}</span>
          </Tag>
        </Tooltip>

        <Tooltip title="Calibrate Decision Thresholds">
          <Button
            size="small"
            icon={<SlidersOutlined />}
            onClick={onOpenThresholds}
          />
        </Tooltip>

        <Tooltip title="Keyboard Shortcuts (?)">
          <Button
            size="small"
            icon={<QuestionCircleOutlined />}
            onClick={onToggleShortcuts}
            className="hidden sm:inline-flex"
          />
        </Tooltip>

        <Button
          type="primary"
          size="small"
          ghost
          icon={<DeploymentUnitOutlined />}
          onClick={onOpenArchitecture}
        >
          Case Study
        </Button>
      </Space>
    </AntHeader>
  );
};
