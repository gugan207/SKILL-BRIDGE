import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { History as HistoryIcon, BarChart3, Clock, ArrowRight, FileText, Inbox } from 'lucide-react';

export default function History() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReports()
      .then((data) => setReports(data.reports || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] flex items-center gap-3">
            <HistoryIcon className="w-7 h-7 text-indigo-500" />
            Analysis History
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {reports.length} {reports.length === 1 ? 'analysis' : 'analyses'} completed
          </p>
        </div>
        <Link
          to="/upload"
          className="px-4 py-2 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          + New Analysis
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center">
          <Inbox className="w-14 h-14 text-[var(--text-muted)] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">No analyses yet</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Your completed analyses will appear here.</p>
          <Link
            to="/upload"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Start Your First Analysis
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const score = report.employability_score || 0;
            const scoreColor =
              score >= 80 ? 'text-emerald-500' :
              score >= 60 ? 'text-indigo-500' :
              score >= 40 ? 'text-amber-500' : 'text-rose-500';

            return (
              <Link
                key={report.id}
                to={`/report/${report.id}`}
                className="group flex items-center gap-5 p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-indigo-500/20 hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-indigo-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--text-primary)] truncate">
                    {report.jd_title || 'Untitled Position'}
                  </h3>
                  {report.jd_company && (
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{report.jd_company}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(report.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className={`text-3xl font-extrabold ${scoreColor}`}>{score}</span>
                    <span className="text-xs text-[var(--text-muted)] block">/100</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-indigo-500 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
