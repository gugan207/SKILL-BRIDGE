import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ScoreHero } from '../components/ScoreHero';
import { SkillRadarChart } from '../components/SkillRadarChart';
import { GapCard } from '../components/GapCard';
import {
  Download, ArrowLeft, CheckCircle2, XCircle,
  BarChart3, Target, Sparkles, Loader2,
} from 'lucide-react';

export default function ReportView() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Try sessionStorage first (just completed analysis)
    const cached = sessionStorage.getItem('sb_last_report');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.id === reportId) {
          setReport(parsed);
          setLoading(false);
          sessionStorage.removeItem('sb_last_report');
          return;
        }
      } catch {}
    }

    // Fetch from API
    api.getReport(reportId)
      .then(setReport)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [reportId]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await api.downloadPdf(reportId, report?.jd_title || 'Job_Report');
    } catch (err) {
      alert('Failed to download PDF: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Report not found</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-2">{error || 'This report may have been deleted.'}</p>
        <Link to="/dashboard" className="mt-4 inline-block text-sm text-indigo-500 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const matched = report.matched_skills || [];
  const missing = report.missing_skills || [];
  const roadmap = report.roadmap || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/dashboard" className="text-xs text-[var(--text-muted)] hover:text-indigo-500 flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            {report.jd_title || 'Analysis Report'}
          </h1>
          {report.jd_company && (
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{report.jd_company}</p>
          )}
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 shadow-md disabled:opacity-50 transition-all"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download Report
        </button>
      </div>

      {/* Score + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-7">
          <ScoreHero
            score={report.employability_score}
            breakdown={report.score_breakdown}
          />
        </div>
        <div className="lg:col-span-5">
          <SkillRadarChart radar={report.skill_radar} />
        </div>
      </div>

      {/* Matched Skills */}
      {matched.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Matched Skills ({matched.length})
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {matched.map((skill) => (
              <div
                key={skill.name}
                className="px-3.5 py-1.5 rounded-xl text-sm font-medium border bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {skill.name}
                <span className="text-xs opacity-60">
                  {Math.round((skill.confidence || skill.resume_confidence || 0) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skill Gaps & Roadmap */}
      {roadmap.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Skill Gaps & Personalized Roadmap ({missing.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {roadmap.map((item, i) => (
              <GapCard key={item.skill_name} item={item} rank={item.rank || i + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state when no gaps */}
      {roadmap.length === 0 && matched.length > 0 && (
        <div className="rounded-3xl border-2 border-dashed border-emerald-500/20 bg-emerald-500/5 p-10 text-center">
          <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Perfect match!</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Your resume covers all the skills required for this role. 🎉
          </p>
        </div>
      )}
    </div>
  );
}
