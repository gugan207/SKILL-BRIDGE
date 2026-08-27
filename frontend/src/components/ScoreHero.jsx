import React from 'react';
import { Award, Zap, CheckCircle2, TrendingUp } from 'lucide-react';

export function ScoreHero({ score, breakdown }) {
  const getScoreColor = (val) => {
    if (val >= 80) return { stroke: '#22c55e', text: 'text-emerald-500', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Strong Fit' };
    if (val >= 60) return { stroke: '#6366f1', text: 'text-indigo-500', badge: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', label: 'Competitive' };
    if (val >= 40) return { stroke: '#f59e0b', text: 'text-amber-500', badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Moderate Fit' };
    return { stroke: '#ef4444', text: 'text-rose-500', badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20', label: 'Needs Growth' };
  };

  const status = getScoreColor(score);
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Score Ring */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-[var(--border-subtle)] fill-none"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={status.stroke}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)]">
                {score}
              </span>
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-bold mt-0.5">
                Out of 100
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.badge}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="md:col-span-7 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" />
              Employability Breakdown
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Multi-factor composite calculated from semantic alignment & taxonomy coverage.
            </p>
          </div>

          {breakdown && (
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-500" /> Semantic Alignment (40%)
                  </span>
                  <span className="text-[var(--text-primary)] font-bold">{breakdown.semantic_similarity}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${breakdown.semantic_similarity}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Skill Coverage (35%)
                  </span>
                  <span className="text-[var(--text-primary)] font-bold">{breakdown.skill_coverage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${breakdown.skill_coverage}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-500" /> Skill Depth & Confidence (15%)
                  </span>
                  <span className="text-[var(--text-primary)] font-bold">{breakdown.skill_depth}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${breakdown.skill_depth}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
