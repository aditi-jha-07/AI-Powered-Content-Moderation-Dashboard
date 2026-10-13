export type RiskLevel = 'critical' | 'high' | 'medium' | 'low';

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'escalated';

export type PolicyCategory = 
  | 'hate_speech'
  | 'toxicity'
  | 'harassment'
  | 'threat_violence'
  | 'identity_attack'
  | 'sexual_explicit'
  | 'spam_misinfo';

export interface MultiHeadScores {
  overallRisk: number; // 0.0 - 1.0
  toxicity: number;
  hateSpeech: number;
  harassment: number;
  threatViolence: number;
  identityAttack: number;
  profanity: number;
}

export interface HighlightSpan {
  text: string;
  category: PolicyCategory;
  score: number;
  startIndex: number;
  endIndex: number;
}

export interface AuthorProfile {
  id: string;
  username: string;
  displayName: string;
  avatarSeed: string;
  accountAgeDays: number;
  followerCount: number;
  trustScore: number; // 0 - 100
  historicalStrikes: number;
  priorViolations30d: number;
  isVerified: boolean;
}

export interface QueueItem {
  id: string;
  kafkaOffset: number;
  kafkaTopic: string;
  timestamp: string;
  contentType: 'post' | 'comment' | 'media_caption' | 'user_bio';
  content: string;
  author: AuthorProfile;
  scores: MultiHeadScores;
  primaryViolation: PolicyCategory;
  riskLevel: RiskLevel;
  highlightedSpans: HighlightSpan[];
  status: ModerationStatus;
  moderatorDecision?: {
    action: 'approved' | 'rejected' | 'escalated';
    reason?: string;
    moderatorId: string;
    decidedAt: string;
    notes?: string;
  };
  inferenceLatencyMs: number;
  modelVersion: string;
  reportCount?: number;
}

export interface AppealItem {
  id: string;
  originalPostId: string;
  author: AuthorProfile;
  postContent: string;
  originalDecision: {
    action: 'rejected' | 'suspended';
    reason: string;
    timestamp: string;
    originalScores: MultiHeadScores;
  };
  userJustification: string;
  submittedAt: string;
  status: 'pending' | 'upheld' | 'overturned';
  reviewerNotes?: string;
  reviewedAt?: string;
}

export interface KafkaTelemetry {
  status: 'connected' | 'paused' | 'buffering';
  activeTopic: string;
  eventsIngestedTotal: number;
  inflowRatePerSec: number;
  lagOffset: number;
  p99LatencyMs: number;
  activeWorkers: number;
}

export interface ModerationMetrics {
  totalProcessedToday: number;
  routedToHumanQueue: number;
  autoActionedCount: number;
  workloadReductionPct: number; // e.g. 70.4%
  policyRecallPct: number; // e.g. 98.2%
  avgResolutionTimeSec: number; // e.g. 7.8s
  prevManualResolutionTimeSec: number; // 45.0s
  queueBacklog: number;
  concordanceRatePct: number; // 96.5% agreement between human & AI
}
