import React, { useState } from 'react';
import { 
  Tabs, 
  Card, 
  Tag, 
  Button, 
  Descriptions, 
  Space, 
  Typography, 
  Input, 
  Row, 
  Col, 
  Badge, 
  Alert 
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  UndoOutlined, 
  AlertOutlined, 
  UserOutlined, 
  FileTextOutlined 
} from '@ant-design/icons';
import { AppealItem, QueueItem } from '../types/moderation';

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

interface AntdAppealsQueueProps {
  appeals: AppealItem[];
  escalatedItems: QueueItem[];
  onOverturnAppeal: (appealId: string, notes?: string) => void;
  onUpholdAppeal: (appealId: string, notes?: string) => void;
  onResolveEscalation: (itemId: string, action: 'approved' | 'rejected', notes?: string) => void;
}

export const AntdAppealsQueue: React.FC<AntdAppealsQueueProps> = ({
  appeals,
  escalatedItems,
  onOverturnAppeal,
  onUpholdAppeal,
  onResolveEscalation,
}) => {
  const [selectedAppeal, setSelectedAppeal] = useState<AppealItem | null>(appeals[0] || null);
  const [appealReviewNotes, setAppealReviewNotes] = useState('');

  const pendingAppeals = appeals.filter((a) => a.status === 'pending');
  const pendingEscalations = escalatedItems.filter((i) => i.status === 'escalated');

  return (
    <div className="space-y-4">
      <Tabs
        defaultActiveKey="appeals"
        items={[
          {
            key: 'appeals',
            label: (
              <Space>
                <UndoOutlined />
                <span>Contested User Appeals ({pendingAppeals.length})</span>
              </Space>
            ),
            children: (
              <Row gutter={16}>
                {/* Left: Appeal Cards List */}
                <Col xs={24} lg={10} className="space-y-3">
                  {pendingAppeals.length === 0 ? (
                    <Card size="small" className="!bg-slate-900 !border-slate-800 text-center py-8">
                      <CheckCircleOutlined className="text-2xl text-emerald-400 mb-2" />
                      <Text strong className="block text-slate-200">All Appeals Audited</Text>
                      <Text type="secondary" className="text-xs">No pending user dispute tickets.</Text>
                    </Card>
                  ) : (
                    pendingAppeals.map((appeal) => (
                      <Card
                        key={appeal.id}
                        size="small"
                        onClick={() => setSelectedAppeal(appeal)}
                        className={`cursor-pointer transition-all !bg-slate-900 ${
                          selectedAppeal?.id === appeal.id
                            ? '!border-indigo-500 shadow-md !bg-indigo-950/20'
                            : '!border-slate-800 hover:!border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <Text code className="text-xs font-semibold text-indigo-300">
                            {appeal.id}
                          </Text>
                          <Text type="secondary" className="text-[11px]">
                            {appeal.submittedAt}
                          </Text>
                        </div>
                        <Paragraph ellipsis={{ rows: 2 }} className="text-xs !mb-2 text-slate-200">
                          <Text type="secondary">Appeal: </Text>"{appeal.userJustification}"
                        </Paragraph>
                        <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800">
                          <Text type="secondary">@{appeal.author.username}</Text>
                          <Tag color="volcano" className="font-mono text-[10px]">
                            Risk: {(appeal.originalDecision.originalScores.overallRisk * 100).toFixed(0)}%
                          </Tag>
                        </div>
                      </Card>
                    ))
                  )}
                </Col>

                {/* Right: Selected Appeal Detail */}
                <Col xs={24} lg={14}>
                  {selectedAppeal ? (
                    <Card
                      size="small"
                      title={
                        <Space>
                          <FileTextOutlined className="text-indigo-400" />
                          <Text strong>Reviewing Appeal: {selectedAppeal.id}</Text>
                        </Space>
                      }
                      extra={<Tag color="gold">Pending Senior Review</Tag>}
                      className="!bg-slate-900 !border-slate-800"
                    >
                      <div className="space-y-4">
                        {/* Original Content */}
                        <div className="space-y-1">
                          <Text strong className="text-xs text-slate-400 block uppercase">
                            Original Post (Removed)
                          </Text>
                          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-200">
                            {selectedAppeal.postContent}
                          </div>
                          <Text type="secondary" className="text-[11px]">
                            Removal Code: <strong className="text-rose-400">{selectedAppeal.originalDecision.reason}</strong>
                          </Text>
                        </div>

                        {/* User Justification */}
                        <Alert
                          type="info"
                          showIcon
                          className="!bg-indigo-950/30 !border-indigo-900/60"
                          message={
                            <div className="space-y-1">
                              <Text strong className="text-indigo-200 text-xs">
                                User Contestation Statement:
                              </Text>
                              <Paragraph className="!mb-0 text-xs text-indigo-300">
                                "{selectedAppeal.userJustification}"
                              </Paragraph>
                            </div>
                          }
                        />

                        {/* Author Profile */}
                        <Descriptions size="small" column={3} bordered className="!bg-slate-950">
                          <Descriptions.Item label="Trust Score">
                            <Text strong className="text-indigo-400">{selectedAppeal.author.trustScore}%</Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="Account Age">
                            {selectedAppeal.author.accountAgeDays} days
                          </Descriptions.Item>
                          <Descriptions.Item label="Strikes">
                            {selectedAppeal.author.historicalStrikes}
                          </Descriptions.Item>
                        </Descriptions>

                        {/* Audit notes */}
                        <div className="space-y-1">
                          <Text strong className="text-xs text-slate-300">
                            Determination Rationale (PostgreSQL audit log):
                          </Text>
                          <TextArea
                            rows={2}
                            value={appealReviewNotes}
                            onChange={(e) => setAppealReviewNotes(e.target.value)}
                            placeholder="State reason for overturning or upholding appeal..."
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                          <Button
                            danger
                            icon={<CloseCircleOutlined />}
                            onClick={() => {
                              onUpholdAppeal(selectedAppeal.id, appealReviewNotes);
                              setAppealReviewNotes('');
                            }}
                          >
                            Uphold Removal (Reject Appeal)
                          </Button>

                          <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            style={{ background: '#059669', borderColor: '#059669' }}
                            onClick={() => {
                              onOverturnAppeal(selectedAppeal.id, appealReviewNotes);
                              setAppealReviewNotes('');
                            }}
                          >
                            Overturn & Restore Post
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card size="small" className="!bg-slate-900 !border-slate-800 text-center py-12 text-slate-500">
                      Select an appeal on the left to review.
                    </Card>
                  )}
                </Col>
              </Row>
            ),
          },
          {
            key: 'escalations',
            label: (
              <Space>
                <AlertOutlined />
                <span>Tier-2 Legal Escalations ({pendingEscalations.length})</span>
              </Space>
            ),
            children: (
              <div className="space-y-3">
                {pendingEscalations.length === 0 ? (
                  <Card size="small" className="!bg-slate-900 !border-slate-800 text-center py-8">
                    <CheckCircleOutlined className="text-2xl text-emerald-400 mb-2" />
                    <Text strong className="block text-slate-200">Escalations Queue Clear</Text>
                    <Text type="secondary" className="text-xs">All high-severity flags have been audited by legal.</Text>
                  </Card>
                ) : (
                  pendingEscalations.map((item) => (
                    <Card key={item.id} size="small" className="!bg-slate-900 !border-slate-800">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <Space size={8}>
                            <Text code className="font-semibold text-amber-400">{item.id}</Text>
                            <Text type="secondary">Author: @{item.author.username}</Text>
                            <Tag color="error">Risk: {(item.scores.overallRisk * 100).toFixed(0)}%</Tag>
                          </Space>
                          <Paragraph className="!mb-0 text-xs text-slate-200 font-mono bg-slate-950 p-2 rounded border border-slate-800">
                            "{item.content}"
                          </Paragraph>
                        </div>

                        <Space size={8} className="shrink-0">
                          <Button
                            size="small"
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            style={{ background: '#059669', borderColor: '#059669' }}
                            onClick={() => onResolveEscalation(item.id, 'approved', 'Senior approval post legal check')}
                          >
                            Approve & Clear
                          </Button>
                          <Button
                            size="small"
                            danger
                            type="primary"
                            icon={<CloseCircleOutlined />}
                            onClick={() => onResolveEscalation(item.id, 'rejected', 'Senior removal verified')}
                          >
                            Confirm Removal
                          </Button>
                        </Space>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
