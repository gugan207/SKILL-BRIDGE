import React from 'react';
import { Video, GitFork, Star, Lightbulb, FolderGit2, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';

export function GapCard({ item, rank }) {
  const { skill_name, category, project, youtube, github, ai_explanation } = item;

  const categoryBadges = {
    technical: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    tool: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    soft: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    domain: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-indigo-500/30 transition-all duration-200 shadow-md space-y-4">
      {/* Header with Rank and Skill Name */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-bold text-sm flex items-center justify-center shadow-sm">
            #{rank}
          </div>
          <div>
            <h4 className="text-lg font-bold text-[var(--text-primary)] capitalize">
              {skill_name}
            </h4>
            <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${categoryBadges[category] || categoryBadges.technical}`}>
              {category} gap
            </span>
          </div>
        </div>
      </div>

      {/* AI Personalized Explanation */}
      {ai_explanation && (
        <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <span className="font-semibold text-indigo-500 block mb-0.5">AI Strategic Insight</span>
            {ai_explanation}
          </div>
        </div>
      )}

      {/* Recommended Project */}
      {project && (
        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4" /> Recommended Project
            </span>
            {project.difficulty && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                {project.difficulty}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            {project.project_title}
          </p>
          {project.project_description && (
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {project.project_description}
            </p>
          )}
          {project.resource_url && (
            <a
              href={project.resource_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-600 hover:underline pt-1"
            >
              Project Guide <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* External Resources Grid: YouTube + GitHub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* YouTube Tutorial Resource */}
        {youtube ? (
          <a
            href={`https://www.youtube.com/watch?v=${youtube.video_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/15 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase text-rose-500 block">Free Video Guide</span>
              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                {youtube.title || `Learn ${skill_name}`}
              </p>
              {youtube.channel && (
                <p className="text-[10px] text-[var(--text-muted)] truncate">{youtube.channel}</p>
              )}
            </div>
          </a>
        ) : (
          <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-3 opacity-60">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] text-[var(--text-muted)] flex items-center justify-center shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[var(--text-muted)] block">Video Guide</span>
              <p className="text-xs text-[var(--text-muted)] truncate">Curated search available</p>
            </div>
          </div>
        )}

        {/* GitHub Good First Issue / Repo */}
        {github ? (
          <a
            href={github.good_first_issue_url || github.repo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <GitFork className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase text-emerald-500 block">Open Source Opportunity</span>
              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                {github.repo_name || 'Contribute on GitHub'}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                {github.stars && (
                  <span className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {github.stars}
                  </span>
                )}
                {github.good_first_issue_url && (
                  <span className="text-emerald-500 font-medium truncate">Good First Issue</span>
                )}
              </div>
            </div>
          </a>
        ) : (
          <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-3 opacity-60">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] text-[var(--text-muted)] flex items-center justify-center shrink-0">
              <GitFork className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[var(--text-muted)] block">GitHub Repo</span>
              <p className="text-xs text-[var(--text-muted)] truncate">Open source starter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
