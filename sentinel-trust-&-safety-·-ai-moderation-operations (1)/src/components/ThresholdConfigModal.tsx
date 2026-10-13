import React, { useState } from 'react';
import { X, Sliders, Check, Info, ShieldAlert } from 'lucide-react';

interface ThresholdConfigModalProps {
  onClose: () => void;
  onSave: (thresholds: { autoBlock: number; humanReview: number }) => void;
}

export const ThresholdConfigModal: React.FC<ThresholdConfigModalProps> = ({
  onClose,
  onSave,
}) => {
  const [autoBlock, setAutoBlock] = useState(0.92);
  const [humanReview, setHumanReview] = useState(0.48);

  const handleSave = () => {
    onSave({ autoBlock, humanReview });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">
              NLP Decision Boundary Calibration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Configure model confidence boundaries served by TensorFlow Serving. Modifying thresholds directly adjusts the trade-off between automated actions and moderator queue volume.
        </p>

        {/* Sliders */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">
                Auto-Block Threshold (Zero-Human Escalation):
              </span>
              <span className="font-mono text-rose-400 font-bold">
                {(autoBlock * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.80"
              max="0.99"
              step="0.01"
              value={autoBlock}
              onChange={(e) => setAutoBlock(parseFloat(e.target.value))}
              className="w-full accent-rose-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 block">
              Posts scoring &ge; {(autoBlock * 100).toFixed(0)}% are instantly removed without human queue delay.
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">
                Human Review Lower Bound (Auto-Pass Threshold):
              </span>
              <span className="font-mono text-amber-400 font-bold">
                {(humanReview * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.30"
              max="0.70"
              step="0.01"
              value={humanReview}
              onChange={(e) => setHumanReview(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 block">
              Posts between {(humanReview * 100).toFixed(0)}% and {(autoBlock * 100).toFixed(0)}% route to moderator review queue. Posts below {(humanReview * 100).toFixed(0)}% auto-pass.
            </span>
          </div>
        </div>

        {/* Bands representation */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="font-semibold text-slate-300 text-[11px]">
            Simulated Ingestion Routing:
          </div>
          <div className="flex h-3 rounded-full overflow-hidden text-[9px] font-mono text-white text-center font-bold">
            <div
              style={{ width: `${humanReview * 100}%` }}
              className="bg-emerald-600 flex items-center justify-center"
              title="Auto-Pass"
            >
              Pass
            </div>
            <div
              style={{ width: `${(autoBlock - humanReview) * 100}%` }}
              className="bg-amber-600 flex items-center justify-center"
              title="Moderator Review"
            >
              Review Queue
            </div>
            <div
              style={{ width: `${(1 - autoBlock) * 100}%` }}
              className="bg-rose-600 flex items-center justify-center"
              title="Auto-Block"
            >
              Block
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 pt-1">
            <span className="text-emerald-400">Auto-Pass (~96.7%)</span>
            <span className="text-amber-400">Queue (~3.1%)</span>
            <span className="text-rose-400">Auto-Block (~0.2%)</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs"
          >
            Deploy Calibrated Thresholds
          </button>
        </div>
      </div>
    </div>
  );
};
