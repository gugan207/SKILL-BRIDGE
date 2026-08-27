import React from 'react';
import { Check, FileText, Briefcase, Cpu } from 'lucide-react';

export function Stepper({ currentStep }) {
  const steps = [
    { id: 1, name: 'Upload Resume', icon: FileText },
    { id: 2, name: 'Target Job', icon: Briefcase },
    { id: 3, name: 'AI Analysis', icon: Cpu },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-[var(--border-subtle)] -z-10 rounded-full" />
        
        {/* Active progress bar */}
        <div
          className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 -z-10 rounded-full transition-all duration-300"
          style={{
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
          }}
        />

        {steps.map((step) => {
          const isDone = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-semibold text-sm transition-all duration-200 shadow-md ${
                  isDone
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                    : isCurrent
                    ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-indigo-500/30 ring-4 ring-indigo-500/20 scale-110'
                    : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]'
                }`}
              >
                {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isCurrent
                    ? 'text-[var(--accent-primary)] font-semibold'
                    : isDone
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
