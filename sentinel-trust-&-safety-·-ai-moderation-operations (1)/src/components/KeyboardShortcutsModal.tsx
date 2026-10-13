import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ onClose }) => {
  const SHORTCUTS = [
    { key: 'J / K', description: 'Navigate down / up through flagged items in the queue' },
    { key: 'A', description: 'Quick Approve focused item (dismiss policy flag)' },
    { key: 'R', description: 'Quick Reject focused item (remove & record strike)' },
    { key: 'E', description: 'Escalate focused item to Tier-2 / Legal counsel' },
    { key: 'X', description: 'Toggle select checkbox for batch actions' },
    { key: 'Enter / Space', description: 'Open detailed Inspector Drawer for focused item' },
    { key: 'Esc', description: 'Close active drawer or modal dialog' },
    { key: '?', description: 'Toggle keyboard shortcuts reference' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white">
            <Keyboard className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold">
              High-Velocity Moderator Shortcuts
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
          Shortcuts power rapid triage, reducing average moderation handle time from 45s down to 8s per flagged post.
        </p>

        <div className="space-y-2 pt-1">
          {SHORTCUTS.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950 border border-slate-800/80"
            >
              <span className="text-slate-300">{s.description}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-mono text-[11px] font-semibold shrink-0">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
