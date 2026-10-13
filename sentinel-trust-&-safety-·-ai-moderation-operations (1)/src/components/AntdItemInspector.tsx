import React, { useState } from 'react';
import { 
  Drawer, 
  Descriptions, 
  Tag, 
  Progress, 
  Button, 
  Space, 
  Typography, 
  Select, 
  Input, 
  Divider, 
  Card, 
  Badge 
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ArrowUpOutlined, 
  UserOutlined, 
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { QueueItem } from '../types/moderation';
import { formatPolicyCategoryLabel } from '../services/nlpService';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface AntdItemInspectorProps {
  item: QueueItem | null;
  onClose: () => void;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, reason: string, notes?: string) => void;
  onEscalate: (id: string, notes?: string) => void;
}

export const AntdItemInspector: React.FC<AntdItemInspectorProps> = ({
  item,
  onClose,
  onApprove,
  onReject,
  onEscalate,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('Hate Speech - Group Denigration');
  const [moderatorNotes, setModeratorNotes] = useState<string>('');

  if (!item) return null;

  return (
    <Drawer
      title={
        <Space size={8}>
          <Text code className="font-semibold text-indigo-300">
            {item.id}
          </Text>
          <Tag color={item.riskLevel === 'critical' ? 'error' : item.riskLevel === 'high' ? 'volcano' : 'warning'}>
            {item.riskLevel.toUpperCase()} RISK ({(item.scores.overallRisk * 100).toFixed(0)}%)
          </Tag>
        </Space>
      }
      placement="right"
      width={560}
      open={!!item}
      onClose={onClose}
      extra={
        <Text type="secondary" className="text-xs font-mono">
          latency: {item.inferenceLatencyMs}ms
        </Text>
      }
      footer={
        <div className="flex items-center justify-between py-1">
          <Button
            icon={<ArrowUpOutlined />}
            onClick={() => onEscalate(item.id, moderatorNotes)}
          >
            Escalate to Legal
          </Button>

          <Space size={8}>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              style={{ background: '#059669', borderColor: '#059669' }}
              onClick={() => onApprove(item.id, moderatorNotes)}
            >
              Approve & Restore
            </Button>

            <Button
              danger
              type="primary"
              icon={<CloseCircleOutlined />}
              onClick={() => onReject(item.id, selectedReason, moderatorNotes)}
            >
              Reject & Apply Strike
            </Button>
          </Space>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Flagged Content Card */}
        <Card
          size="small"
          title={<Text strong>Flagged Payload ({item.contentType.toUpperCase()})</Text>}
          className="!bg-slate-950 !border-slate-800"
        >
          <Paragraph className="!mb-0 text-xs text-slate-200 leading-relaxed font-sans">
            {item.content}
          </Paragraph>

          {item.highlightedSpans.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1">
              <Text type="secondary" className="text-[11px] block">
                Extracted High-Attention Token Spans:
              </Text>
              <Space size={4} wrap>
                {item.highlightedSpans.map((span, idx) => (
                  <Tag key={idx} color="error" className="font-mono text-[11px]">
                    "{span.text}" · {(span.score * 100).toFixed(0)}%
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </Card>

        {/* Multi-Head NLP Model Breakdown */}
        <Card
          size="small"
          title={
            <div className="flex justify-between items-center w-full">
              <Space>
                <ThunderboltOutlined className="text-indigo-400" />
                <Text strong>TensorFlow Serving / RoBERTa Heads</Text>
              </Space>
              <Text type="secondary" className="text-[11px] font-mono">
                {item.modelVersion}
              </Text>
            </div>
          }
          className="!bg-slate-950 !border-slate-800"
        >
          <div className="space-y-2.5">
            {[
              { label: 'Overall Risk Score', score: item.scores.overallRisk },
              { label: 'Toxicity', score: item.scores.toxicity },
              { label: 'Hate Speech & Bias', score: item.scores.hateSpeech },
              { label: 'Threat & Violence', score: item.scores.threatViolence },
              { label: 'Harassment & Bullying', score: item.scores.harassment },
              { label: 'Protected Identity Attack', score: item.scores.identityAttack },
              { label: 'Profanity', score: item.scores.profanity },
            ].map((metric) => {
              const pct = Math.round(metric.score * 100);
              const strokeColor = pct >= 85 ? '#f43f5e' : pct >= 70 ? '#f97316' : '#eab308';
              return (
                <div key={metric.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <Text type="secondary">{metric.label}</Text>
                    <Text strong className="font-mono tabular-nums text-slate-200">
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
                </div>
              );
            })}
          </div>
        </Card>

        {/* Author Context Descriptions */}
        <Card
          size="small"
          title={
            <Space>
              <UserOutlined />
              <Text strong>Author Profile & Historical Strikes (PostgreSQL)</Text>
            </Space>
          }
          className="!bg-slate-950 !border-slate-800"
        >
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="Username">
              <Text strong className="text-slate-200">@{item.author.username}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Author ID">
              <Text code className="text-xs">{item.author.id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trust Score">
              <Text strong className="text-indigo-400">{item.author.trustScore} / 100</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Strikes">
              <Tag color={item.author.historicalStrikes > 1 ? 'error' : 'default'}>
                {item.author.historicalStrikes} Active
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Prior (30d)">
              {item.author.priorViolations30d} violations
            </Descriptions.Item>
            <Descriptions.Item label="Account Age">
              {item.author.accountAgeDays} days
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Decision Settings */}
        <div className="space-y-3 pt-1">
          <div className="space-y-1">
            <Text strong className="text-xs text-slate-300">
              Select Policy Violation Code (if rejecting):
            </Text>
            <Select
              className="w-full"
              value={selectedReason}
              onChange={setSelectedReason}
              options={[
                { value: 'Violent Threat & Physical Harm (Art. 1)', label: 'Violent Threat & Physical Harm (Art. 1)' },
                { value: 'Hate Speech - Group Denigration (Art. 4)', label: 'Hate Speech - Group Denigration (Art. 4)' },
                { value: 'Targeted Harassment & Cyberbullying (Art. 3)', label: 'Targeted Harassment & Cyberbullying (Art. 3)' },
                { value: 'Toxic & Abusive Content (Art. 2)', label: 'Toxic & Abusive Content (Art. 2)' },
                { value: 'Protected Identity Attack (Art. 5)', label: 'Protected Identity Attack (Art. 5)' },
              ]}
            />
          </div>

          <div className="space-y-1">
            <Text strong className="text-xs text-slate-300">
              Audit Notes for Moderator Log:
            </Text>
            <TextArea
              rows={2}
              value={moderatorNotes}
              onChange={(e) => setModeratorNotes(e.target.value)}
              placeholder="Add rationale notes to persist to PostgreSQL audit_logs table..."
            />
          </div>
        </div>
      </div>
    </Drawer>
  );
};
