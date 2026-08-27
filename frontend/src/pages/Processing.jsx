import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Stepper } from '../components/Stepper';
import { Cpu, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const STAGE_LABELS = {
  skills: { label: 'Extracting skills', icon: '🔍', color: 'text-indigo-500' },
  embedding: { label: 'Computing semantic vectors', icon: '🧠', color: 'text-violet-500' },
  matching: { label: 'Matching & scoring', icon: '⚡', color: 'text-amber-500' },
  roadmap: { label: 'Building roadmap', icon: '🗺️', color: 'text-emerald-500' },
  explaining: { label: 'Generating AI insights', icon: '✨', color: 'text-pink-500' },
  assembling: { label: 'Assembling report', icon: '📄', color: 'text-blue-500' },
  complete: { label: 'Analysis complete!', icon: '✅', color: 'text-emerald-500' },
  error: { label: 'Something went wrong', icon: '❌', color: 'text-rose-500' },
};

export default function Processing() {
  const navigate = useNavigate();
  const [stages, setStages] = useState([]);
  const [currentStage, setCurrentStage] = useState(null);
  const [error, setError] = useState('');
  const [reportId, setReportId] = useState(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const resumeId = sessionStorage.getItem('sb_resume_id');
    const jdText = sessionStorage.getItem('sb_jd_text');
    const jdTitle = sessionStorage.getItem('sb_jd_title');
    const jdCompany = sessionStorage.getItem('sb_jd_company');

    if (!resumeId || !jdText) {
      navigate('/upload');
      return;
    }

    api.streamAnalysis(
      {
        resume_id: resumeId,
        jd_text: jdText,
        jd_title: jdTitle || null,
        jd_company: jdCompany || null,
      },
      (update) => {
        setCurrentStage(update.stage);
        setStages((prev) => [...prev, update]);
      },
      (err) => {
        setError(err.message || 'Analysis failed. Please try again.');
        setCurrentStage('error');
      },
      (report) => {
        setCurrentStage('complete');
        setStages((prev) => [...prev, { stage: 'complete', message: 'Analysis complete!' }]);
        setReportId(report.id);
        // Store for report view
        sessionStorage.setItem('sb_last_report', JSON.stringify(report));
        // Clean up
        sessionStorage.removeItem('sb_jd_text');
        sessionStorage.removeItem('sb_jd_title');
        sessionStorage.removeItem('sb_jd_company');
        // Auto-navigate after brief delay
        setTimeout(() => navigate(`/report/${report.id}`), 1500);
      }
    );
  }, [navigate]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Stepper currentStep={3} />

      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Analyzing your profile</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          NVIDIA-powered AI is working through your resume and job description.
        </p>
      </div>

      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg p-6 sm:p-8">
        {/* Pipeline Progress */}
        <div className="space-y-4">
          {Object.entries(STAGE_LABELS).filter(([key]) => key !== 'error').map(([key, info]) => {
            const reached = stages.some((s) => s.stage === key) || currentStage === key;
            const isActive = currentStage === key;
            const isDone = stages.some((s) => s.stage === key) && currentStage !== key;

            if (key === 'complete' && currentStage !== 'complete') return null;

            return (
              <div
                key={key}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-indigo-500/5 border border-indigo-500/20' :
                  isDone ? 'opacity-100' :
                  reached ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                  ) : (
                    <span className="text-lg">{info.icon}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${
                    isActive ? info.color :
                    isDone ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                  }`}>
                    {info.label}
                  </p>
                  {isActive && stages.length > 0 && (
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {stages[stages.length - 1]?.message}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-rose-500">Analysis failed</p>
                <p className="text-xs text-rose-400 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="mt-3 px-4 py-2 rounded-xl text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Taking longer notice */}
        {!error && currentStage && currentStage !== 'complete' && stages.length > 3 && (
          <p className="text-center text-xs text-[var(--text-muted)] mt-6 animate-pulse">
            Taking longer than usual... hang tight, AI is thinking hard. ⏳
          </p>
        )}
      </div>
    </div>
  );
}
