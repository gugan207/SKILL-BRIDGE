import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { api } from '../lib/api';
import { PlusCircle, FileText, BarChart3, ArrowRight, Sparkles, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReports()
      .then((data) => setReports(data.reports || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isEmpty = reports.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
          Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''} 👋
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          {isEmpty ? "You haven't run any analyses yet. Let's get started!" : "Here is a snapshot of your latest analyses."}
        </p>
      </div>

      {/* Empty State */}
      {isEmpty && !loading && (
        <div className="rounded-3xl border-2 border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Ready for your first analysis?</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-sm mx-auto">
            Upload your resume and paste a job description to get your personalized skill-gap roadmap.
          </p>
          <Link
            to="/upload"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 shadow-md shadow-indigo-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Start New Analysis
          </Link>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Reports Grid */}
      {!isEmpty && !loading && (
        <>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Recent Analyses</h2>
            <Link
              to="/upload"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> New
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.slice(0, 6).map((report) => (
              <Link
                key={report.id}
                to={`/report/${report.id}`}
                className="group p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-indigo-500/20 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[160px]">
                      {report.jd_title || 'Untitled Position'}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-indigo-500 transition-colors" />
                </div>

                {report.jd_company && (
                  <p className="text-xs text-[var(--text-secondary)] mb-3">{report.jd_company}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                    <span className="text-2xl font-extrabold text-[var(--text-primary)]">
                      {report.employability_score}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">/100</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                    <Clock className="w-3 h-3" />
                    {new Date(report.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {reports.length > 6 && (
            <div className="text-center mt-6">
              <Link to="/history" className="text-sm font-medium text-indigo-500 hover:underline">
                View all {reports.length} analyses →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
