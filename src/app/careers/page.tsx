'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Job } from '@/lib/types';

// Mock data — will load from Supabase by company ID
const MOCK_JOBS: Job[] = [
  { id: '1', user_id: 'u1', title: 'Frontend Developer', department: 'Engineering', location: 'Remote', employment_type: 'full_time', salary_min: 90000, salary_max: 130000, description: 'Build beautiful, performant web applications using React, Next.js, and TypeScript.', requirements: '3+ years React experience\nTypeScript proficiency\nExperience with modern CSS (Tailwind)', benefits: 'Remote work\nHealth insurance\nEquity\n401k matching', status: 'open', share_id: 'abc123', created_at: '2026-03-20T00:00:00Z', updated_at: '2026-03-20T00:00:00Z' },
  { id: '2', user_id: 'u1', title: 'Product Designer', department: 'Design', location: 'New York, NY', employment_type: 'full_time', salary_min: 85000, salary_max: 120000, description: 'Design intuitive user experiences for our growing product suite.', requirements: 'Portfolio required\n3+ years product design\nFigma proficiency', benefits: 'Hybrid work\nDesign conference budget\nHealth insurance', status: 'open', share_id: 'def456', created_at: '2026-03-22T00:00:00Z', updated_at: '2026-03-22T00:00:00Z' },
  { id: '3', user_id: 'u1', title: 'Marketing Intern', department: 'Marketing', location: 'Remote', employment_type: 'internship', salary_min: null, salary_max: null, description: 'Help grow our brand through content creation and social media.', requirements: 'Currently enrolled in university\nStrong writing skills', benefits: 'Flexible hours\nMentorship\nPotential full-time offer', status: 'open', share_id: 'ghi789', created_at: '2026-03-25T00:00:00Z', updated_at: '2026-03-25T00:00:00Z' },
];

const TYPE_LABELS: Record<string, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
};

function CareersContent() {
  const searchParams = useSearchParams();
  const companyName = searchParams.get('company') || 'Our Company';
  const [jobs] = useState(MOCK_JOBS);
  const [filterDept, setFilterDept] = useState('All');

  const departments = ['All', ...new Set(jobs.map((j) => j.department).filter(Boolean))];
  const filtered = filterDept === 'All' ? jobs : jobs.filter((j) => j.department === filterDept);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="text-center py-16 px-4 border-b border-border">
        <h1 className="text-4xl font-bold text-foreground mb-3">Join {companyName}</h1>
        <p className="text-lg text-muted max-w-md mx-auto">
          We&apos;re building something great. Come be a part of it.
        </p>
        <p className="text-sm text-accent mt-2">{jobs.filter((j) => j.status === 'open').length} open positions</p>
      </div>

      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Department filter */}
        {departments.length > 2 && (
          <div className="flex gap-1 p-1 rounded-xl bg-surface border border-border mb-6 overflow-x-auto">
            {departments.map((dept) => (
              <button key={dept} onClick={() => setFilterDept(dept)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  filterDept === dept ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-foreground'
                }`}>
                {dept}
              </button>
            ))}
          </div>
        )}

        {/* Job listings */}
        <div className="space-y-3">
          {filtered.map((job) => (
            <a
              key={job.id}
              href={`/apply?id=${job.share_id}`}
              className="glow-card p-5 block hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{job.title}</h2>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {job.department && <span className="text-xs text-muted bg-surface border border-border rounded-full px-2 py-0.5">{job.department}</span>}
                    <span className="text-xs text-muted bg-surface border border-border rounded-full px-2 py-0.5">{job.location}</span>
                    <span className="text-xs text-muted bg-surface border border-border rounded-full px-2 py-0.5">{TYPE_LABELS[job.employment_type]}</span>
                  </div>
                </div>
                {job.salary_min && job.salary_max && (
                  <span className="text-sm font-medium text-accent flex-shrink-0">
                    ${(job.salary_min / 1000).toFixed(0)}K — ${(job.salary_max / 1000).toFixed(0)}K
                  </span>
                )}
              </div>
              <p className="text-sm text-muted/80 line-clamp-2 mt-2">{job.description}</p>
              <span className="text-xs text-accent font-medium mt-3 inline-block">Apply →</span>
            </a>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted">No open positions in this department right now.</p>
          </div>
        )}
      </div>

      <footer className="py-6 text-center border-t border-border">
        <a href="/" className="text-xs text-muted/40 hover:text-muted transition-colors">Powered by HirePulse</a>
      </footer>
    </div>
  );
}

export default function CareersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>}>
      <CareersContent />
    </Suspense>
  );
}
