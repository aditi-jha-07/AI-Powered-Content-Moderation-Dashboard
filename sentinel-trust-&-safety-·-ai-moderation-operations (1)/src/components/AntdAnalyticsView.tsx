import React from 'react';
import { Row, Col, Card, Statistic, Progress, Typography, Space, Tag, Divider } from 'antd';
import { 
  ArrowDownOutlined, 
  SafetyCertificateOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { ModerationMetrics } from '../types/moderation';

const { Text, Title, Paragraph } = Typography;

interface AntdAnalyticsViewProps {
  metrics: ModerationMetrics;
}

export const AntdAnalyticsView: React.FC<AntdAnalyticsViewProps> = ({ metrics }) => {
  const HOURLY_DATA = [
    { hour: '00:00', stream: 38000, human: 1200, cleared: 1180 },
    { hour: '04:00', stream: 24000, human: 820, cleared: 810 },
    { hour: '08:00', stream: 58000, human: 2100, cleared: 2050 },
    { hour: '12:00', stream: 89000, human: 3400, cleared: 3320 },
    { hour: '16:00', stream: 94000, human: 3800, cleared: 3750 },
    { hour: '20:00', stream: 72000, human: 2600, cleared: 2580 },
  ];

  return (
    <div className="space-y-6">
      {/* 4 Key Outcomes Cards directly reflecting the project results */}
      <Row gutter={[16, 16]}>
        {/* Metric 1 */}
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" className="!bg-slate-900 !border-slate-800 shadow-xs">
            <Statistic
              title={<Text type="secondary" className="text-xs">Human Review Workload</Text>}
              value={metrics.workloadReductionPct}
              precision={1}
              valueStyle={{ color: '#10b981', fontWeight: 800, fontSize: 28 }}
              prefix={<ArrowDownOutlined />}
              suffix="%"
            />
            <Text type="secondary" className="text-[11px] block mt-1">
              Automated 96.7% obvious benign/toxic posts
            </Text>
          </Card>
        </Col>

        {/* Metric 2 */}
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" className="!bg-slate-900 !border-slate-800 shadow-xs">
            <Statistic
              title={<Text type="secondary" className="text-xs">Policy Violation Recall</Text>}
              value={metrics.policyRecallPct}
              precision={1}
              valueStyle={{ color: '#818cf8', fontWeight: 800, fontSize: 28 }}
              prefix={<SafetyCertificateOutlined />}
              suffix="%"
            />
            <Text type="secondary" className="text-[11px] block mt-1">
              Maintained on 1M+ daily post volume
            </Text>
          </Card>
        </Col>

        {/* Metric 3 */}
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" className="!bg-slate-900 !border-slate-800 shadow-xs">
            <Statistic
              title={<Text type="secondary" className="text-xs">Avg Review Time per Item</Text>}
              value={metrics.avgResolutionTimeSec}
              precision={1}
              valueStyle={{ color: '#f59e0b', fontWeight: 800, fontSize: 28 }}
              prefix={<ClockCircleOutlined />}
              suffix="s"
            />
            <Text type="secondary" className="text-[11px] block mt-1">
              Dropped from <span className="line-through text-rose-400">45.0s</span> down to 8s
            </Text>
          </Card>
        </Col>

        {/* Metric 4 */}
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" className="!bg-slate-900 !border-slate-800 shadow-xs">
            <Statistic
              title={<Text type="secondary" className="text-xs">Human · AI Concordance</Text>}
              value={metrics.concordanceRatePct}
              precision={1}
              valueStyle={{ color: '#a855f7', fontWeight: 800, fontSize: 28 }}
              prefix={<CheckCircleOutlined />}
              suffix="%"
            />
            <Text type="secondary" className="text-[11px] block mt-1">
              Agreement on borderline decision band
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Hourly Ingestion vs Clearance Throughput */}
      <Card
        size="small"
        title={
          <Space>
            <LineChartOutlined className="text-indigo-400" />
            <Text strong>Kafka Stream Ingestion vs Moderator Queue Clearance</Text>
          </Space>
        }
        extra={
          <Space size={12} className="text-xs">
            <span><Tag color="default">Stream (1M+/day)</Tag></span>
            <span><Tag color="geekblue">Human Queue</Tag></span>
            <span><Tag color="green">Cleared</Tag></span>
          </Space>
        }
        className="!bg-slate-900 !border-slate-800"
      >
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-6 gap-3 items-end h-40 border-b border-slate-800 pb-2">
            {HOURLY_DATA.map((item) => {
              const streamPct = Math.round((item.stream / 100000) * 100);
              const queuePct = Math.max(12, Math.round((item.human / 4000) * 100));

              return (
                <div key={item.hour} className="flex flex-col items-center h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-32">
                    <div
                      className="w-4 bg-slate-800 hover:bg-slate-700 rounded-t transition-all"
                      style={{ height: `${streamPct}%` }}
                      title={`Stream: ${item.stream.toLocaleString()} events`}
                    />
                    <div
                      className="w-4 bg-indigo-500 hover:bg-indigo-400 rounded-t transition-all"
                      style={{ height: `${queuePct}%` }}
                      title={`Human Queue: ${item.human.toLocaleString()} items`}
                    />
                    <div
                      className="w-4 bg-emerald-500 hover:bg-emerald-400 rounded-t transition-all"
                      style={{ height: `${queuePct * 0.98}%` }}
                      title={`Cleared: ${item.cleared.toLocaleString()} items`}
                    />
                  </div>
                  <Text type="secondary" className="text-[11px] font-mono mt-2 block">
                    {item.hour}
                  </Text>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Violation breakdown & SLA matrix */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={
              <Space>
                <BarChartOutlined className="text-indigo-400" />
                <Text strong>Violation Class Distribution (Hugging Face Multi-Head)</Text>
              </Space>
            }
            className="!bg-slate-900 !border-slate-800"
          >
            <div className="space-y-3 pt-1">
              {[
                { label: 'Hate Speech (Art. 4)', pct: 34, stroke: '#f43f5e' },
                { label: 'Targeted Harassment (Art. 3)', pct: 28, stroke: '#f97316' },
                { label: 'Toxic & Abusive Content (Art. 2)', pct: 21, stroke: '#eab308' },
                { label: 'Violent Threats (Art. 1)', pct: 11, stroke: '#dc2626' },
                { label: 'Spam & Coordinated Disinformation', pct: 6, stroke: '#6366f1' },
              ].map((c) => (
                <div key={c.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <Text type="secondary">{c.label}</Text>
                    <Text strong className="font-mono text-slate-200">{c.pct}%</Text>
                  </div>
                  <Progress
                    percent={c.pct}
                    showInfo={false}
                    size="small"
                    strokeColor={c.stroke}
                    trailColor="#1e293b"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            size="small"
            title={
              <Space>
                <ThunderboltOutlined className="text-emerald-400" />
                <Text strong>Prometheus SLA & Celery Performance</Text>
              </Space>
            }
            className="!bg-slate-900 !border-slate-800"
          >
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <Text type="secondary" className="text-[11px] block">True Positive Recall</Text>
                  <Text strong className="text-emerald-400 text-lg font-mono">98.2%</Text>
                  <Text type="secondary" className="text-[10px] block">Verified via test set audit</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <Text type="secondary" className="text-[11px] block">False Positive Rate</Text>
                  <Text strong className="text-amber-400 text-lg font-mono">1.8%</Text>
                  <Text type="secondary" className="text-[10px] block">Contested via appeals flow</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <Text type="secondary" className="text-[11px] block">TF-Serving P99 Latency</Text>
                  <Text strong className="text-indigo-400 text-lg font-mono">24.6ms</Text>
                  <Text type="secondary" className="text-[10px] block">GPU inference per event</Text>
                </div>
              </Col>
              <Col span={12}>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <Text type="secondary" className="text-[11px] block">Celery Queue Depth</Text>
                  <Text strong className="text-purple-400 text-lg font-mono">12 msgs</Text>
                  <Text type="secondary" className="text-[10px] block">Zero backpressure backlog</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
