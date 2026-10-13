import React, { useState } from 'react';
import { 
  Cpu, 
  Send, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Layers, 
  CornerDownRight,
  ShieldAlert
} from 'lucide-react';
import { MultiHeadScores, PolicyCategory, HighlightSpan, QueueItem, RiskLevel } from '../types/moderation';
import { analyzeTextNLP, formatPolicyCategoryLabel } from '../services/nlpService';

interface PipelinePlaygroundProps {
  onInjectItem: (newItem: QueueItem) => void;
  onNavigateToQueue: () => void;
}

export const PipelinePlayground: React.FC<PipelinePlaygroundProps> = ({
  onInjectItem,
  onNavigateToQueue,
}) => {
  const [inputText, setInputText] = useState(
    "If you ever show up at the community office tomorrow, I will track you down and hurt you."
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    scores: MultiHeadScores;
    primaryViolation: PolicyCategory;
    riskLevel: RiskLevel;
    highlightedSpans: HighlightSpan[];
    latencyMs: number;
    modelVersion: string;
  } | null>(null);
  const [injectedSuccess, setInjectedSuccess] = useState(false);

  const PRESETS = [
    {
      title: 'Physical Threat',
      text: 'I will track you down after school and make sure you regret talking to my friend.',
    },
    {
      title: 'Dehumanizing Hate Speech',
      text: 'These foreigners are complete parasites and vermin who deserve to be driven out.',
    },
    {
      title: 'Targeted Bullying',
      text: 'You are the most pathetic excuse for an engineer alive. Delete your account and quit.',
    },
    {
      title: 'Academic / Educational (Context Test)',
      text: "Historians documented how the term 'subhuman' was systematically weaponized in propaganda.",
    },
    {
      title: 'Casual Slang (Edge Case)',
      text: 'Bro you completely killed that guitar solo! You absolutely destroyed the stage tonight! 🔥',
    },
  ];

  const handleRunInference = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setInjectedSuccess(false);

    try {
      const res = await analyzeTextNLP(inputText);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInjectIntoQueue = () => {
    if (!result) return;

    const newItem: QueueItem = {
      id: `POST-${Math.floor(800000 + Math.random() * 100000)}`,
      kafkaOffset: Math.floor(4892100 + Math.random() * 500),
      kafkaTopic: 'events.feed.posts.flagged.v2',
      timestamp: 'Just now',
      contentType: 'post',
      content: inputText,
      author: {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        username: 'lab_tester_' + Math.floor(Math.random() * 99),
        displayName: 'Playground Tester',
        avatarSeed: 'tester',
        accountAgeDays: 45,
        followerCount: 120,
        trustScore: Math.round((1 - result.scores.overallRisk) * 100),
        historicalStrikes: result.scores.overallRisk > 0.8 ? 1 : 0,
        priorViolations30d: result.scores.overallRisk > 0.8 ? 1 : 0,
        isVerified: false,
      },
      scores: result.scores,
      primaryViolation: result.primaryViolation,
      riskLevel: result.riskLevel,
      highlightedSpans: result.highlightedSpans,
      status: 'pending',
      inferenceLatencyMs: result.latencyMs,
      modelVersion: result.modelVersion,
      reportCount: Math.floor(Math.random() * 4) + 1,
    };

    onInjectItem(newItem);
    setInjectedSuccess(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <span>Interactive NLP Pipeline Tester (TensorFlow Serving / Transformers)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate the event pipeline: Tokenization $\to$ Multi-head scoring $\to$ Policy threshold routing $\to$ Kafka queue injection.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Pipeline: RoBERTa-Tox-v3.4.1
          </div>
        </div>

        {/* Preset Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">
            Load Test Benchmark Edge Cases:
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.title}
                onClick={() => {
                  setInputText(p.text);
                  setResult(null);
                  setInjectedSuccess(false);
                }}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 block">
            Input Content String:
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            placeholder="Type or paste any user post, comment, or caption to test NLP inference..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        {/* Run Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-500">
            Evaluates Toxicity, Threat, Hate Speech, Identity Attack, and Harassment heads simultaneously.
          </span>
          <button
            onClick={handleRunInference}
            disabled={isAnalyzing || !inputText.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>Running TF-Serving Inference...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-white" />
                <span>Run NLP Pipeline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inference Results Panel */}
      {result && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>Inference Results & Routing Determination</span>
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Latency: <strong className="text-slate-200">{result.latencyMs}ms</strong></span>
              <span>·</span>
              <span>Model: <strong className="text-slate-200">{result.modelVersion}</strong></span>
            </div>
          </div>

          {/* Decision Recommendation */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Automated Pipeline Routing:</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${
                    result.scores.overallRisk >= 0.90
                      ? 'text-rose-300 bg-rose-950/60 border-rose-800'
                      : result.scores.overallRisk >= 0.50
                      ? 'text-amber-300 bg-amber-950/60 border-amber-800'
                      : 'text-emerald-300 bg-emerald-950/60 border-emerald-800'
                  }`}
                >
                  {result.scores.overallRisk >= 0.90
                    ? 'AUTO-BLOCK / HIGH SEVERITY'
                    : result.scores.overallRisk >= 0.50
                    ? 'ROUTE TO HUMAN MODERATOR QUEUE'
                    : 'AUTO-APPROVE (SAFE TO PUBLISH)'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Primary Classified Category: <strong className="text-white">{formatPolicyCategoryLabel(result.primaryViolation)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!injectedSuccess ? (
                <button
                  onClick={handleInjectIntoQueue}
                  className="px-3.5 py-1.5 text-xs font-semibold text-indigo-200 bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Send to Live Moderator Queue</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Sent to Kafka queue!
                  </span>
                  <button
                    onClick={onNavigateToQueue}
                    className="px-3 py-1 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg underline"
                  >
                    View in Queue
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Multi-Head Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Overall Risk', score: result.scores.overallRisk },
              { label: 'Toxicity', score: result.scores.toxicity },
              { label: 'Hate Speech', score: result.scores.hateSpeech },
              { label: 'Threat / Violence', score: result.scores.threatViolence },
              { label: 'Harassment', score: result.scores.harassment },
              { label: 'Identity Attack', score: result.scores.identityAttack },
            ].map((head) => (
              <div key={head.label} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                <span className="text-[11px] text-slate-400 block truncate">{head.label}</span>
                <span className="text-lg font-bold font-mono text-white block tabular-nums">
                  {(head.score * 100).toFixed(0)}%
                </span>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      head.score >= 0.85
                        ? 'bg-rose-500'
                        : head.score >= 0.65
                        ? 'bg-orange-500'
                        : head.score >= 0.40
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${head.score * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Highlighted trigger tokens */}
          {result.highlightedSpans.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">
                Extracted High-Attention Token Spans:
              </span>
              <div className="flex flex-wrap gap-2">
                {result.highlightedSpans.map((span, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono"
                  >
                    "{span.text}" · {(span.score * 100).toFixed(0)}% confidence
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
