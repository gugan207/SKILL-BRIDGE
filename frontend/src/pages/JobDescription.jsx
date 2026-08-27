import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from '../components/Stepper';
import { Briefcase, ArrowRight, AlertCircle } from 'lucide-react';

export default function JobDescription() {
  const navigate = useNavigate();
  const [jdText, setJdText] = useState('');
  const [jdTitle, setJdTitle] = useState('');
  const [jdCompany, setJdCompany] = useState('');
  const [error, setError] = useState('');

  const resumeId = sessionStorage.getItem('sb_resume_id');
  const resumeName = sessionStorage.getItem('sb_resume_name');

  if (!resumeId) {
    navigate('/upload');
    return null;
  }

  const handleContinue = () => {
    if (jdText.trim().length < 50) {
      setError('Please provide a more detailed job description (at least 50 characters).');
      return;
    }
    // Store for processing step
    sessionStorage.setItem('sb_jd_text', jdText.trim());
    sessionStorage.setItem('sb_jd_title', jdTitle);
    sessionStorage.setItem('sb_jd_company', jdCompany);
    navigate('/processing');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Stepper currentStep={2} />

      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Target job description</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Paste the full JD for the role you're targeting. We'll extract every required skill.
        </p>
        {resumeName && (
          <p className="text-xs text-indigo-500 font-medium mt-2">
            Analyzing against: {resumeName}
          </p>
        )}
      </div>

      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg p-6 sm:p-8 space-y-5">
        {/* Optional: Title & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="jd-title" className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
              Job Title <span className="text-[var(--text-muted)] font-normal">(optional)</span>
            </label>
            <input
              id="jd-title"
              type="text"
              placeholder="e.g. Senior Frontend Engineer"
              value={jdTitle}
              onChange={(e) => setJdTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <div>
            <label htmlFor="jd-company" className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
              Company <span className="text-[var(--text-muted)] font-normal">(optional)</span>
            </label>
            <input
              id="jd-company"
              type="text"
              placeholder="e.g. Google"
              value={jdCompany}
              onChange={(e) => setJdCompany(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
        </div>

        {/* JD Text Area */}
        <div>
          <label htmlFor="jd-text" className="block text-sm font-semibold text-[var(--text-primary)] mb-1.5">
            Full Job Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="jd-text"
            value={jdText}
            onChange={(e) => { setJdText(e.target.value); setError(''); }}
            placeholder="Paste the complete job description here. Include responsibilities, requirements, qualifications, and preferred skills for the best analysis..."
            rows={14}
            className="w-full px-4 py-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-sm resize-none"
          />
          <div className="flex justify-between mt-1.5 text-xs text-[var(--text-muted)]">
            <span>{jdText.length} characters</span>
            <span>Min. 50 characters</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-sm text-rose-500">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={jdText.trim().length < 50}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <Briefcase className="w-4 h-4" /> Start AI Analysis <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
