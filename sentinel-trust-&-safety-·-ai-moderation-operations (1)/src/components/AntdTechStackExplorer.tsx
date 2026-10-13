import React, { useState } from 'react';
import { 
  Tabs, 
  Card, 
  Tag, 
  Badge, 
  Button, 
  Typography, 
  Space, 
  Descriptions, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Alert 
} from 'antd';
import { 
  ApiOutlined, 
  CloudServerOutlined, 
  DatabaseOutlined, 
  ThunderboltOutlined, 
  CodeOutlined, 
  SafetyCertificateOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  DeploymentUnitOutlined
} from '@ant-design/icons';
import { WebSocketFrame } from '../hooks/useWebSocket';

const { Text, Paragraph, Title } = Typography;

interface AntdTechStackExplorerProps {
  wsStatus: 'connected' | 'connecting' | 'disconnected';
  wsLatency: number;
  wsFrames: WebSocketFrame[];
  onTriggerWsPing: () => void;
}

export const AntdTechStackExplorer: React.FC<AntdTechStackExplorerProps> = ({
  wsStatus,
  wsLatency,
  wsFrames,
  onTriggerWsPing,
}) => {
  const [fastApiEndpoint, setFastApiEndpoint] = useState<string>('/health');
  const [apiResponse, setApiResponse] = useState<any>({
    status: 'healthy',
    service: 'fastapi-moderation',
    celery_workers: 16,
    tf_serving_status: 'AVAILABLE',
    postgres_pool: 'CONNECTED',
    kafka_consumer: 'ACTIVE',
  });
  const [isCallingApi, setIsCallingApi] = useState(false);

  const handleTestApi = (endpoint: string) => {
    setFastApiEndpoint(endpoint);
    setIsCallingApi(true);

    setTimeout(() => {
      setIsCallingApi(false);
      if (endpoint === '/health') {
        setApiResponse({
          status: 'healthy',
          service: 'fastapi-moderation',
          celery_workers: 16,
          tf_serving_status: 'AVAILABLE',
          postgres_pool: 'CONNECTED',
          kafka_consumer: 'ACTIVE',
        });
      } else if (endpoint === '/metrics') {
        setApiResponse({
          moderation_requests_total: 1148200,
          human_review_routed_total: 38400,
          p99_inference_latency_ms: 24.6,
          kafka_consumer_lag: 12,
          celery_active_tasks: 4,
          celery_worker_nodes: 16,
        });
      } else if (endpoint === '/api/v1/moderate') {
        setApiResponse({
          task_id: 'celery-task-849201',
          content: 'I will track you down and hurt you.',
          scores: {
            overall_risk: 0.96,
            toxicity: 0.91,
            hate_speech: 0.32,
            threat_violence: 0.96,
            harassment: 0.89,
          },
          primary_violation: 'threat_violence',
          routing: 'human_moderator_queue',
          inference_latency_ms: 18.2,
          model_version: 'RoBERTa-Tox-v3.4.1 (TF-Serving)',
        });
      } else if (endpoint === '/api/v1/batch-action') {
        setApiResponse({
          status: 'success',
          action: 'reject',
          affected_count: 3,
          post_ids: ['POST-849201', 'POST-849202', 'POST-849206'],
          reason_code: 'Hate Speech - Group Denigration',
          moderator_id: 'MOD-991',
          persisted_to_db: true,
        });
      }
    }, 280);
  };

  const POSTGRES_SAMPLE_ROWS = [
    { key: '1', id: 'POST-849201', author: 'vex_rebel', violation: 'threat_violence', score: 0.96, status: 'pending', created_at: '2026-10-13 13:30:12' },
    { key: '2', id: 'POST-849202', author: 'hawk_eye_99', violation: 'hate_speech', score: 0.93, status: 'pending', created_at: '2026-10-13 13:28:44' },
    { key: '3', id: 'POST-849203', author: 'critique_pro', violation: 'harassment', score: 0.82, status: 'pending', created_at: '2026-10-13 13:25:01' },
    { key: '4', id: 'POST-849100', author: 'prof_elena_m', violation: 'hate_speech', score: 0.62, status: 'appealed', created_at: '2026-10-13 13:10:19' },
  ];

  return (
    <div className="space-y-6">
      <Card
        size="small"
        className="!bg-slate-900 !border-slate-800"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Title level={4} className="!text-white !mb-0 flex items-center gap-2">
              <DeploymentUnitOutlined className="text-indigo-400" />
              <span>Full Production Tech Stack Architecture</span>
            </Title>
            <Text type="secondary" className="text-xs">
              Direct implementation of: React + Ant Design + WebSockets · FastAPI · Celery · PostgreSQL · Transformers/TFX · Docker/K8s/Prometheus
            </Text>
          </div>
          <Tag color="geekblue" className="font-mono text-xs">
            cluster: prod-k8s-us-east-1
          </Tag>
        </div>
      </Card>

      <Tabs
        defaultActiveKey="backend"
        type="card"
        items={[
          {
            key: 'backend',
            label: (
              <Space>
                <ApiOutlined />
                <span>Python (FastAPI) Backend</span>
              </Space>
            ),
            children: (
              <div className="space-y-4">
                <Card size="small" className="!bg-slate-900 !border-slate-800">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <Text strong className="text-white text-xs">
                        Interactive FastAPI Route Simulator:
                      </Text>
                      <Space size={6}>
                        <Button
                          size="small"
                          type={fastApiEndpoint === '/health' ? 'primary' : 'default'}
                          onClick={() => handleTestApi('/health')}
                        >
                          GET /health
                        </Button>
                        <Button
                          size="small"
                          type={fastApiEndpoint === '/metrics' ? 'primary' : 'default'}
                          onClick={() => handleTestApi('/metrics')}
                        >
                          GET /metrics
                        </Button>
                        <Button
                          size="small"
                          type={fastApiEndpoint === '/api/v1/moderate' ? 'primary' : 'default'}
                          onClick={() => handleTestApi('/api/v1/moderate')}
                        >
                          POST /api/v1/moderate
                        </Button>
                        <Button
                          size="small"
                          type={fastApiEndpoint === '/api/v1/batch-action' ? 'primary' : 'default'}
                          onClick={() => handleTestApi('/api/v1/batch-action')}
                        >
                          POST /api/v1/batch-action
                        </Button>
                      </Space>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 font-mono text-xs">
                      <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-800/60 mb-2">
                        <span>HTTP 200 OK · application/json</span>
                        <span>{isCallingApi ? 'Calling...' : 'Latency: ~18ms'}</span>
                      </div>
                      <pre className="text-emerald-300 overflow-x-auto">
                        {JSON.stringify(apiResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                </Card>
              </div>
            ),
          },
          {
            key: 'websockets',
            label: (
              <Space>
                <ThunderboltOutlined />
                <span>WebSockets Real-Time Feed</span>
              </Space>
            ),
            children: (
              <div className="space-y-4">
                <Row gutter={16}>
                  <Col span={8}>
                    <Card size="small" className="!bg-slate-900 !border-slate-800">
                      <Statistic
                        title="WebSocket Protocol State"
                        value={wsStatus.toUpperCase()}
                        valueStyle={{ color: wsStatus === 'connected' ? '#10b981' : '#f59e0b' }}
                        prefix={<Badge status="processing" />}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" className="!bg-slate-900 !border-slate-800">
                      <Statistic
                        title="Round-Trip Time (RTT)"
                        value={`${wsLatency}ms`}
                        valueStyle={{ color: '#818cf8' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" className="!bg-slate-900 !border-slate-800">
                      <Statistic
                        title="Kafka Topic Subscription"
                        value="events.feed.posts.flagged"
                        valueStyle={{ fontSize: 13, color: '#e2e8f0' }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Card
                  size="small"
                  title="Live WebSocket Wire Frames"
                  extra={
                    <Button size="small" onClick={onTriggerWsPing}>
                      Send Ping Frame
                    </Button>
                  }
                  className="!bg-slate-900 !border-slate-800"
                >
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {wsFrames.slice(0, 8).map((frame) => (
                      <div
                        key={frame.id}
                        className="p-2 rounded bg-slate-950 border border-slate-800/80 font-mono text-xs flex justify-between items-center"
                      >
                        <Space>
                          <Tag color="geekblue">{frame.type}</Tag>
                          <Text type="secondary">{frame.id}</Text>
                        </Space>
                        <Text type="secondary">{frame.timestamp}</Text>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ),
          },
          {
            key: 'celery',
            label: (
              <Space>
                <CloudServerOutlined />
                <span>Celery & Redis Worker Pool</span>
              </Space>
            ),
            children: (
              <div className="space-y-4">
                <Row gutter={16}>
                  <Col span={6}>
                    <Card size="small" className="!bg-slate-900 !border-slate-800">
                      <Statistic title="Worker Concurrency" value={16} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" className="!bg-slate-900 !border-slate-800">
                      <Statistic title="Prefetch Multiplier" value={4} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" className="!bg-slate-900 !border-slate-800">
                      <Statistic title="Broker Type" value="Redis 7.0" />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" className="!bg-slate-900 !border-slate-800">
                      <Statistic title="Active Tasks" value={4} valueStyle={{ color: '#10b981' }} />
                    </Card>
                  </Col>
                </Row>

                <Card size="small" title="Celery Worker Configuration & Python Task Definition" className="!bg-slate-900 !border-slate-800">
                  <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg overflow-x-auto">
{`@celery_app.task(name="tasks.process_post_event", bind=True, max_retries=3)
def process_post_event(self, event_data: dict):
    # 1. Decode event from Kafka topic
    # 2. Invoke TF-Serving RoBERTa inference
    # 3. Apply calibrated thresholds:
    #      auto_pass: < 0.48
    #      human_queue: 0.48 - 0.92
    #      auto_block: >= 0.92
    # 4. Write audit record to PostgreSQL
    # 5. Broadcast to WebSocket feed`}
                  </pre>
                </Card>
              </div>
            ),
          },
          {
            key: 'postgres',
            label: (
              <Space>
                <DatabaseOutlined />
                <span>PostgreSQL Database</span>
              </Space>
            ),
            children: (
              <div className="space-y-4">
                <Card size="small" title="Table: moderated_posts (Sample Rows in PostgreSQL)" className="!bg-slate-900 !border-slate-800">
                  <Table
                    size="small"
                    dataSource={POSTGRES_SAMPLE_ROWS}
                    columns={[
                      { title: 'ID', dataIndex: 'id', key: 'id' },
                      { title: 'Author', dataIndex: 'author', key: 'author' },
                      { title: 'Primary Violation', dataIndex: 'violation', key: 'violation' },
                      { title: 'Risk Score', dataIndex: 'score', key: 'score' },
                      { title: 'Status', dataIndex: 'status', key: 'status', render: (st) => <Tag color={st === 'pending' ? 'gold' : 'blue'}>{st}</Tag> },
                      { title: 'Created At', dataIndex: 'created_at', key: 'created_at' },
                    ]}
                    pagination={false}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: 'ml',
            label: (
              <Space>
                <SafetyCertificateOutlined />
                <span>Hugging Face & TensorFlow Extended</span>
              </Space>
            ),
            children: (
              <div className="space-y-4">
                <Card size="small" title="RoBERTa Multi-Head Model Architecture" className="!bg-slate-900 !border-slate-800">
                  <Descriptions size="small" column={2} bordered>
                    <Descriptions.Item label="Base Transformer">roberta-base (125M parameters)</Descriptions.Item>
                    <Descriptions.Item label="Serving Platform">TensorFlow Serving (TFX) via gRPC</Descriptions.Item>
                    <Descriptions.Item label="Classification Heads">Toxicity, Hate Speech, Threat, Harassment, Identity Attack</Descriptions.Item>
                    <Descriptions.Item label="P99 Inference Latency">24.6ms (GPU-accelerated T4 instances)</Descriptions.Item>
                    <Descriptions.Item label="Token Attention Extraction">Integrated Gradients sub-word attribution</Descriptions.Item>
                    <Descriptions.Item label="Daily Evaluation Capacity">1,148,200 posts / day</Descriptions.Item>
                  </Descriptions>
                </Card>
              </div>
            ),
          },
          {
            key: 'infra',
            label: (
              <Space>
                <CodeOutlined />
                <span>Docker, K8s & Prometheus</span>
              </Space>
            ),
            children: (
              <div className="space-y-4">
                <Row gutter={16}>
                  <Col span={12}>
                    <Card size="small" title="Prometheus Metrics Scraping" className="!bg-slate-900 !border-slate-800">
                      <pre className="text-xs font-mono text-slate-300 bg-slate-950 p-3 rounded-lg overflow-x-auto">
{`# Prometheus Scrape Config
- job_name: 'moderation-service'
  scrape_interval: 10s
  static_configs:
    - targets: ['moderation-api:8000']
  metric_relabel_configs:
    - source_labels: [__name__]
      regex: 'moderation_.*'`}
                      </pre>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" title="Kubernetes Pod Replica Health" className="!bg-slate-900 !border-slate-800">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between p-2 rounded bg-slate-950">
                          <span>moderation-api-deploy (FastAPI)</span>
                          <Tag color="success">4 / 4 Running</Tag>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-slate-950">
                          <span>celery-worker-deploy (Workers)</span>
                          <Tag color="success">8 / 8 Running</Tag>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-slate-950">
                          <span>tf-serving-deploy (Models)</span>
                          <Tag color="success">4 / 4 Running</Tag>
                        </div>
                        <div className="flex justify-between p-2 rounded bg-slate-950">
                          <span>postgres-ha-statefulset</span>
                          <Tag color="success">3 / 3 Healthy</Tag>
                        </div>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
