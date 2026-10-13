import React from 'react';
import { 
  X, 
  Layers, 
  Database, 
  Cpu, 
  Server, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  Radio, 
  Code2, 
  Clock, 
  TrendingDown, 
  Lock
} from 'lucide-react';

interface ArchitectureModalProps {
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                CASE STUDY & ARCHITECTURE
              </span>
              <span className="text-xs text-slate-500">6 Month Project</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white mt-1">
              AI-Powered Content Moderation Dashboard
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Role: Full-Stack Engineer · Client: Anonymised Social Media Platform (1M+ Posts/Day)
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NDA Statement */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-200">NDA Statement:</strong> Social media platform and exact post volume are anonymised. The ML pipeline, event architecture, and moderation dashboard represent my work.
          </p>
        </div>

        {/* Problem & Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-rose-400 uppercase tracking-wider block text-[11px]">
              The Problem
            </span>
            <p className="text-slate-300 leading-relaxed">
              Manual moderation of 1,000,000+ posts/day was unsustainable for trust and safety teams. Reviewers were overwhelmed, leading to high burnout and critical policy violations slipping through.
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
            <span className="font-bold text-emerald-400 uppercase tracking-wider block text-[11px]">
              The Solution
            </span>
            <p className="text-slate-300 leading-relaxed">
              Integrated a Python NLP pipeline (toxicity, hate speech, violent threats) into an event-driven architecture. A React dashboard surfaces flagged items with confidence scores and allows instant batch actions.
            </p>
          </div>
        </div>

        {/* Interactive Architecture Flow Diagram */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            End-to-End System Pipeline
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
            {/* Step 1 */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-center">
              <Radio className="w-5 h-5 mx-auto text-amber-400" />
              <div className="font-bold text-white text-xs">1. Kafka Ingest</div>
              <p className="text-[10px] text-slate-400">
                1M+ post events partitioned across topics
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-center">
              <Server className="w-5 h-5 mx-auto text-indigo-400" />
              <div className="font-bold text-white text-xs">2. Celery Workers</div>
              <p className="text-[10px] text-slate-400">
                Distributed async batch consumers in Python
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-center">
              <Cpu className="w-5 h-5 mx-auto text-purple-400" />
              <div className="font-bold text-white text-xs">3. TF Serving / HF</div>
              <p className="text-[10px] text-slate-400">
                Multi-head RoBERTa NLP inference (&lt;25ms)
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-center">
              <Database className="w-5 h-5 mx-auto text-cyan-400" />
              <div className="font-bold text-white text-xs">4. PostgreSQL</div>
              <p className="text-[10px] text-slate-400">
                Audit logs, strikes, and calibrated scores
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-center">
              <Code2 className="w-5 h-5 mx-auto text-emerald-400" />
              <div className="font-bold text-white text-xs">5. React Console</div>
              <p className="text-[10px] text-slate-400">
                WebSockets real-time queue & batch actions
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack Specs */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Production Tech Stack
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Frontend</span>
              <span className="font-medium text-slate-200">React, Tailwind, WebSockets</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Backend</span>
              <span className="font-medium text-slate-200">Python (FastAPI), Celery, Postgres</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Machine Learning</span>
              <span className="font-medium text-slate-200">Hugging Face, TF Extended</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Infrastructure</span>
              <span className="font-medium text-slate-200">Docker, Kubernetes, Prometheus</span>
            </div>
          </div>
        </div>

        {/* Measured Outcomes */}
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
            Key Measurable Outcomes
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-slate-200">
                <strong>70% Workload Reduction:</strong> Reduced human review workload by 70% while maintaining 98% recall on policy violations.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-slate-200">
                <strong>8s vs 45s Resolution:</strong> Average moderation time per item dropped from 45 seconds down to 8 seconds.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
