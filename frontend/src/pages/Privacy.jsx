import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/" className="text-xs text-[var(--text-muted)] hover:text-indigo-500 flex items-center gap-1 mb-6">
        <ArrowLeft className="w-3 h-3" /> Back
      </Link>

      <h1 className="text-3xl font-extrabold text-[var(--text-primary)] flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-indigo-500" />
        Privacy Policy
      </h1>

      <div className="prose prose-sm max-w-none text-[var(--text-secondary)] space-y-6">
        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">What We Collect</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Your email address and name (for authentication)</li>
            <li>Resume files you upload (stored in private encrypted buckets)</li>
            <li>Job descriptions you paste (stored in your private account)</li>
            <li>Analysis results (scores, skill matches, roadmap data)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">How We Use It</h2>
          <p>Your data is used exclusively to generate your skill-gap analysis report. We do not sell, share, or use your data for any other purpose.</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Resume text is sent to NVIDIA NIM for embedding and AI explanation generation</li>
            <li>No data is shared with third parties beyond the AI processing pipeline</li>
            <li>Your files are stored in private Supabase Storage buckets with signed-URL-only access</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Data Retention & Deletion</h2>
          <p>You can delete all your data at any time from Account Settings. This permanently removes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>All uploaded resumes and their parsed text</li>
            <li>All job descriptions</li>
            <li>All analysis reports and PDF files</li>
            <li>Your user profile and authentication data</li>
          </ul>
          <p className="font-semibold text-[var(--text-primary)]">
            Deletion is real and verified in the database — not just hidden in the UI.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Security</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>All data is encrypted in transit (HTTPS) and at rest</li>
            <li>Row Level Security (RLS) ensures you can only access your own data</li>
            <li>API keys are never exposed to the frontend</li>
            <li>Resume files are in private storage buckets — no public access</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Contact</h2>
          <p>
            Questions about your data? Reach out via the{' '}
            <a
              href="https://github.com/gugan207/SKILL-BRIDGE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:underline"
            >
              GitHub repository
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}
