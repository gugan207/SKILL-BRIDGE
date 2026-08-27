import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import {
  FileText, Target, Cpu, Map, ArrowRight, Sparkles,
  CheckCircle, Shield, Zap, GitFork, Video, BarChart3,
} from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();

  const steps = [
    { icon: FileText, title: 'Upload Resume', desc: 'PDF, DOCX, or paste text — parsed with OCR fallback.' },
    { icon: Target, title: 'Paste Job Description', desc: 'The role you want. We extract every required skill.' },
    { icon: Cpu, title: 'AI Analysis', desc: 'NVIDIA-powered embeddings & semantic similarity scoring.' },
    { icon: Map, title: 'Roadmap', desc: 'Ranked gaps with curated projects, videos & open-source repos.' },
  ];

  const features = [
    { icon: BarChart3, title: 'Explainable Score', desc: 'Not just a number — see what drives your 0-100 score across 4 factors.' },
    { icon: Sparkles, title: 'AI Explanations', desc: 'Personalized insight for each gap, written by NVIDIA Nemotron.' },
    { icon: Video, title: 'Free Video Guides', desc: 'A curated YouTube tutorial for every missing skill.' },
    { icon: GitFork, title: 'Open Source Projects', desc: 'Real GitHub repos and "good first issue" links to build with.' },
    { icon: Shield, title: 'Private & Secure', desc: 'Your resume is encrypted, never public. Delete anytime.' },
    { icon: Zap, title: 'Instant Results', desc: 'Full analysis in under 30 seconds, streamed in real time.' },
  ];

  return (
    <div className="min-h-screen">
      {/* ═══ Hero Section ═══ */}
      <section className="relative overflow-hidden pt-20 pb-28 sm:pt-28 sm:pb-36">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-indigo-500/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-15%] right-[-8%] w-[45vw] h-[45vw] bg-violet-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-[30%] right-[15%] w-[20vw] h-[20vw] bg-pink-500/8 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-500 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Powered by NVIDIA NIM
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
            <span className="text-[var(--text-primary)]">Stop guessing.</span>
            <br />
            <span className="gradient-text">Know what to build next.</span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            SkillBridge AI compares your resume against any job description and gives you a
            <strong className="text-[var(--text-primary)]"> ranked, explainable skill-gap roadmap</strong> —
            not a keyword edit, but real resources to close each gap.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/upload' : '/signup'}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 hover:opacity-90 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Analyze My Resume <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-medium rounded-2xl text-[var(--text-secondary)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] transition-colors"
            >
              I have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ How It Works — 4-Step Visual ═══ */}
      <section className="py-20 bg-[var(--bg-secondary)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
              How it works
            </h2>
            <p className="mt-2 text-base text-[var(--text-secondary)]">Four steps, under 30 seconds.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="relative p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-indigo-500/20 hover:shadow-lg transition-all group"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white text-sm font-bold flex items-center justify-center shadow-md">
                  {i + 1}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] text-lg">{step.title}</h3>
                <p className="mt-1.5 text-sm text-[var(--text-secondary)] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Features Grid ═══ */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)]">
              Not another ATS scanner
            </h2>
            <p className="mt-2 text-base text-[var(--text-secondary)] max-w-xl mx-auto">
              We don't just tell you what's missing — we give you exactly what to build, watch, and contribute to.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="p-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-indigo-500/20 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3">
                  <feat.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)]">{feat.title}</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            Ready to close the gap?
          </h2>
          <p className="mt-2 text-[var(--text-secondary)]">
            Upload your resume and get your personalized roadmap in seconds.
          </p>
          <Link
            to={user ? '/upload' : '/signup'}
            className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 shadow-lg shadow-indigo-500/25 transition-all"
          >
            Get Started — It's Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-8 border-t border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>SkillBridge AI v2.0</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy Policy</Link>
            <a href="https://github.com/gugan207/SKILL-BRIDGE" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
