import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Tag, 
  Badge, 
  Space, 
  Input, 
  Select, 
  Radio, 
  Modal, 
  Progress, 
  Tooltip, 
  Popconfirm, 
  Alert,
  Card,
  Typography
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ArrowUpOutlined, 
  EyeOutlined, 
  SearchOutlined, 
  FireOutlined, 
  UserOutlined, 
  ExclamationCircleOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { QueueItem, ModerationStatus, PolicyCategory, RiskLevel } from '../types/moderation';
import { formatPolicyCategoryLabel } from '../services/nlpService';

const { Text, Paragraph } = Typography;

interface AntdModeratorQueueProps {
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

export const AntdModeratorQueue: React.FC<AntdModeratorQueueProps> = ({
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [batchRejectModalOpen, setBatchRejectModalOpen] = useState(false);
  const [batchRejectReason, setBatchRejectReason] = useState('Hate Speech - Group Denigration (Art. 4)');

  // Filtered items
  const filteredData = items.filter((item) => {
    if (item.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && item.primaryViolation !== categoryFilter) return false;
    if (riskFilter !== 'all' && item.riskLevel !== riskFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = item.content.toLowerCase().includes(q);
      const matchAuthor = item.author.username.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      if (!matchText && !matchAuthor && !matchId) return false;
    }
    return true;
  });

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const handleBatchApproveClick = () => {
    onBatchApprove(selectedRowKeys as string[]);
    setSelectedRowKeys([]);
  };

  const handleBatchRejectConfirm = () => {
    onBatchReject(selectedRowKeys as string[], batchRejectReason);
    setSelectedRowKeys([]);
    setBatchRejectModalOpen(false);
  };

  const handleBatchEscalateClick = () => {
    onBatchEscalate(selectedRowKeys as string[]);
    setSelectedRowKeys([]);
  };

  const columns: ColumnsType<QueueItem> = [
    {
      title: 'Offset / ID',
      dataIndex: 'id',
      key: 'id',
      width: 130,
      render: (id: string, record: QueueItem) => (
        <Space direction="vertical" size={2}>
          <Text code className="text-xs font-semibold text-indigo-300">
            {id}
          </Text>
          <Text type="secondary" className="text-[11px] font-mono">
            offset: #{record.kafkaOffset.toString().slice(-4)}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Author Context',
      dataIndex: 'author',
      key: 'author',
      width: 170,
      render: (author) => (
        <Space direction="vertical" size={2}>
          <Space size={4}>
            <UserOutlined className="text-slate-400 text-xs" />
            <Text strong className="text-xs text-slate-200">
              @{author.username}
            </Text>
          </Space>
          <Text type="secondary" className="text-[11px]">
            Trust: <strong className="text-indigo-300">{author.trustScore}%</strong> · {author.historicalStrikes} strikes
          </Text>
        </Space>
      ),
    },
    {
      title: 'Flagged Content & Attention Tokens',
      dataIndex: 'content',
      key: 'content',
      render: (content: string, record: QueueItem) => {
        const getRiskTagColor = (risk: RiskLevel) => {
          switch (risk) {
            case 'critical': return 'error';
            case 'high': return 'volcano';
            case 'medium': return 'warning';
            default: return 'success';
          }
        };

        return (
          <Space direction="vertical" size={4} className="w-full">
            <Space size={6} wrap>
              <Tag color={getRiskTagColor(record.riskLevel)}>
                {formatPolicyCategoryLabel(record.primaryViolation)}
              </Tag>
              <Text type="secondary" className="text-[11px]">
                {record.timestamp}
              </Text>
              {record.reportCount && record.reportCount > 4 && (
                <Tag color="magenta" icon={<FireOutlined />}>
                  {record.reportCount} reports
                </Tag>
              )}
            </Space>
            <Paragraph
              ellipsis={{ rows: 2 }}
              className="!mb-0 text-xs text-slate-200 leading-relaxed font-sans"
            >
              {content}
            </Paragraph>
          </Space>
        );
      },
    },
    {
      title: 'Model Confidence (TF-Serving)',
      dataIndex: 'scores',
      key: 'scores',
      width: 220,
      render: (scores) => {
        const pct = Math.round(scores.overallRisk * 100);
        const strokeColor = pct >= 85 ? '#f43f5e' : pct >= 70 ? '#f97316' : '#eab308';
        return (
          <Space direction="vertical" size={2} className="w-full">
            <div className="flex justify-between items-center text-[11px]">
              <Text type="secondary">Overall Risk</Text>
              <Text strong className="font-mono text-xs text-white">
                {pct}%
              </Text>
            </div>
            <Progress
              percent={pct}
              showInfo={false}
              size="small"
              strokeColor={strokeColor}
              trailColor="#1e293b"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Tox: {Math.round(scores.toxicity * 100)}%</span>
              <span>Hate: {Math.round(scores.hateSpeech * 100)}%</span>
              <span>Threat: {Math.round(scores.threatViolence * 100)}%</span>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 170,
      align: 'right',
      render: (_, record: QueueItem) => (
        <Space size={4}>
          {record.status === 'pending' ? (
            <>
              <Tooltip title="Approve & Restore">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCircleOutlined className="text-emerald-400 text-sm" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onApproveSingle(record.id);
                  }}
                />
              </Tooltip>
              <Tooltip title="Reject & Strike">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<CloseCircleOutlined className="text-rose-400 text-sm" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRejectSingle(record.id, 'Policy Strike');
                  }}
                />
              </Tooltip>
              <Tooltip title="Escalate to Legal">
                <Button
                  type="text"
                  size="small"
                  icon={<ArrowUpOutlined className="text-amber-400 text-sm" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEscalateSingle(record.id);
                  }}
                />
              </Tooltip>
            </>
          ) : (
            <Tag color={record.status === 'approved' ? 'green' : record.status === 'rejected' ? 'red' : 'gold'}>
              {record.status.toUpperCase()}
            </Tag>
          )}
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onSelectItem(record)}
          >
            Inspect
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Ant Design Filters Card */}
      <Card
        size="small"
        className="!bg-slate-900 !border-slate-800 shadow-xs"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Radio Filter */}
          <Radio.Group
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setSelectedRowKeys([]);
            }}
            buttonStyle="solid"
            size="small"
          >
            <Radio.Button value="pending">
              Pending Queue ({items.filter((i) => i.status === 'pending').length})
            </Radio.Button>
            <Radio.Button value="approved">
              Approved ({items.filter((i) => i.status === 'approved').length})
            </Radio.Button>
            <Radio.Button value="rejected">
              Rejected ({items.filter((i) => i.status === 'rejected').length})
            </Radio.Button>
            <Radio.Button value="escalated">
              Escalated ({items.filter((i) => i.status === 'escalated').length})
            </Radio.Button>
          </Radio.Group>

          {/* Search Input */}
          <Input
            placeholder="Search post text, @username, or ID..."
            prefix={<SearchOutlined className="text-slate-500" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 260 }}
            size="small"
            allowClear
          />
        </div>

        {/* Category & Risk dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-3 text-xs">
          <Space size={6}>
            <FilterOutlined className="text-slate-400" />
            <Text type="secondary">Policy:</Text>
            <Select
              size="small"
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 170 }}
              options={[
                { value: 'all', label: 'All Policy Types' },
                { value: 'hate_speech', label: 'Hate Speech' },
                { value: 'threat_violence', label: 'Violent Threats' },
                { value: 'harassment', label: 'Harassment' },
                { value: 'toxicity', label: 'Toxicity & Abuse' },
                { value: 'identity_attack', label: 'Identity Attack' },
                { value: 'spam_misinfo', label: 'Spam / Misinfo' },
              ]}
            />
          </Space>

          <Space size={6}>
            <Text type="secondary">Risk Tier:</Text>
            <Select
              size="small"
              value={riskFilter}
              onChange={setRiskFilter}
              style={{ width: 150 }}
              options={[
                { value: 'all', label: 'All Risk Tiers' },
                { value: 'critical', label: 'Critical (≥0.90)' },
                { value: 'high', label: 'High (≥0.75)' },
                { value: 'medium', label: 'Medium (≥0.50)' },
                { value: 'low', label: 'Low (<0.50)' },
              ]}
            />
          </Space>

          <div className="ml-auto text-xs font-mono text-slate-400">
            Showing <Text strong className="text-white">{filteredData.length}</Text> items
          </div>
        </div>
      </Card>

      {/* Batch Action Bar using Ant Design Alert */}
      {selectedRowKeys.length > 0 && (
        <Alert
          type="info"
          showIcon
          className="!bg-indigo-950/60 !border-indigo-800"
          message={
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Space>
                <Text strong className="text-white">
                  {selectedRowKeys.length} items selected for batch decision
                </Text>
                <Button
                  type="link"
                  size="small"
                  onClick={() => setSelectedRowKeys([])}
                  className="!text-indigo-300"
                >
                  Clear Selection
                </Button>
              </Space>

              <Space size={8}>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  style={{ background: '#059669', borderColor: '#059669' }}
                  onClick={handleBatchApproveClick}
                >
                  Batch Approve ({selectedRowKeys.length})
                </Button>

                <Button
                  danger
                  type="primary"
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => setBatchRejectModalOpen(true)}
                >
                  Batch Reject ({selectedRowKeys.length})
                </Button>

                <Button
                  size="small"
                  icon={<ArrowUpOutlined />}
                  onClick={handleBatchEscalateClick}
                >
                  Batch Escalate ({selectedRowKeys.length})
                </Button>
              </Space>
            </div>
          }
        />
      )}

      {/* Ant Design Table */}
      <Card
        size="small"
        className="!bg-slate-900 !border-slate-800 !p-0 overflow-hidden shadow-xs"
        bodyStyle={{ padding: 0 }}
      >
        <Table
          rowKey="id"
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 8, showSizeChanger: false, size: 'small' }}
          size="middle"
          onRow={(record) => ({
            onClick: () => onSelectItem(record),
            className: selectedItem?.id === record.id ? 'bg-indigo-950/40 cursor-pointer' : 'cursor-pointer hover:bg-slate-800/40',
          })}
        />
      </Card>

      {/* Ant Design Modal for Batch Reject */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined className="text-rose-500 text-base" />
            <span className="text-white font-bold">
              Confirm Batch Rejection & Strike Application
            </span>
          </Space>
        }
        open={batchRejectModalOpen}
        onOk={handleBatchRejectConfirm}
        onCancel={() => setBatchRejectModalOpen(false)}
        okText="Confirm Removal & Apply Strikes"
        okButtonProps={{ danger: true }}
      >
        <div className="space-y-4 py-2 text-xs">
          <Paragraph className="text-slate-300">
            You are enforcing content removal on <strong className="text-rose-400">{selectedRowKeys.length}</strong> flagged items. This will remove items from user feeds and add a policy strike to the author accounts in PostgreSQL.
          </Paragraph>

          <div className="space-y-1.5">
            <Text strong className="text-slate-200">
              Policy Violation Reason Code:
            </Text>
            <Select
              className="w-full"
              value={batchRejectReason}
              onChange={setBatchRejectReason}
              options={[
                { value: 'Hate Speech - Group Denigration (Art. 4)', label: 'Hate Speech - Group Denigration (Art. 4)' },
                { value: 'Violent Threat & Physical Harm (Art. 1)', label: 'Violent Threat & Physical Harm (Art. 1)' },
                { value: 'Targeted Harassment & Cyberbullying (Art. 3)', label: 'Targeted Harassment & Cyberbullying (Art. 3)' },
                { value: 'Toxic & Abusive Content (Art. 2)', label: 'Toxic & Abusive Content (Art. 2)' },
                { value: 'Protected Identity Attack (Art. 5)', label: 'Protected Identity Attack (Art. 5)' },
              ]}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
