import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useTheme } from '../lib/ThemeContext';
import { Layers } from 'lucide-react';

export function SkillRadarChart({ radar }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!radar) return null;

  const chartData = [
    {
      category: 'Technical',
      score: radar.technical?.score ?? 0,
      matched: radar.technical?.matched ?? 0,
      total: radar.technical?.total ?? 0,
    },
    {
      category: 'Tools & DevOps',
      score: radar.tool?.score ?? 0,
      matched: radar.tool?.matched ?? 0,
      total: radar.tool?.total ?? 0,
    },
    {
      category: 'Soft Skills',
      score: radar.soft?.score ?? 0,
      matched: radar.soft?.matched ?? 0,
      total: radar.soft?.total ?? 0,
    },
    {
      category: 'Domain / Industry',
      score: radar.domain?.score ?? 0,
      matched: radar.domain?.matched ?? 0,
      total: radar.domain?.total ?? 0,
    },
  ];

  return (
    <div className="glass-panel p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col h-full shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Competency Radar
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Balanced match across 4 skill dimensions
          </p>
        </div>
      </div>

      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke={isDark ? '#334155' : '#e2e8f0'} />
            <PolarAngleAxis
              dataKey="category"
              tick={{
                fill: isDark ? '#94a3b8' : '#475569',
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10 }}
            />
            <Radar
              name="Match Rate"
              dataKey="score"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={isDark ? 0.35 : 0.25}
              strokeWidth={2.5}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass-panel p-2.5 rounded-xl text-xs shadow-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
                      <p className="font-bold text-[var(--text-primary)]">{data.category}</p>
                      <p className="text-indigo-500 font-semibold mt-0.5">{data.score}% Match</p>
                      <p className="text-[var(--text-muted)] text-[10px]">
                        {data.matched} of {data.total} skills covered
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Mini category badges */}
      <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-[var(--border-subtle)]">
        {chartData.map((item) => (
          <div key={item.category} className="p-2 rounded-xl bg-[var(--bg-secondary)] flex justify-between items-center text-xs">
            <span className="text-[var(--text-secondary)] font-medium truncate">{item.category}</span>
            <span className="font-bold text-[var(--text-primary)]">{item.matched}/{item.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
