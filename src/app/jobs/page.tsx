'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Job } from '@/lib/types';

function JobBoardContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('company') || '';
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState('');

  useEffect(() => {
    async function load() {
      let query = supabase.from('hp_jobs').select('*').eq('status', 'open').order('created_at', { ascending: false });
      if (companyId) {
        query = query.eq('user_id', companyId);
      }
      const { data } = await query;
      setJobs(data ?? []);

      if (data && data.length > 0) {
        setCompanyName(data[0].department || 'Open Positions');
      }
      setLoading(false);
    }
    load();
  }, [companyId]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-2">{companyName || 'Open Positions'}</h1>
      <p className="text-muted mb-8">{jobs.length} open position{jobs.length !== 1 ? 's' : ''}</p>

      {jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted">No open positions right now. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <a
              key={job.id}
              href={`/apply?job=${job.share_id}`}
              className="glow-card block p-6 hover:border-accent/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{job.title}</h2>
                  <div className="flex gap-3 mt-1 text-sm text-muted">
                    {job.location && <span>{job.location}</span>}
                    <span className="capitalize">{job.employment_type.replace('_', '-')}</span>
                    {job.salary_min && job.salary_max && (
                      <span>${(job.salary_min / 1000).toFixed(0)}K - ${(job.salary_max / 1000).toFixed(0)}K</span>
                    )}
                  </div>
                </div>
                <span className="text-sm text-accent font-medium">Apply →</span>
              </div>
              {job.description && (
                <p className="mt-3 text-sm text-muted line-clamp-2">{job.description.substring(0, 200)}...</p>
              )}
            </a>
          ))}
        </div>
      )}

      <footer className="mt-12 text-center text-xs text-muted">
        Powered by <span className="text-accent font-medium">HirePulse</span>
      </footer>
    </div>
  );
}

export default function JobBoardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>}>
      <JobBoardContent />
    </Suspense>
  );
}
