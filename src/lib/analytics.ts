import { supabase } from './supabase';
import type { Candidate, Job, CandidateStage } from './types';

// Analytics types
export interface HiringAnalytics {
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
  avgTimeToHire: number;        // days
  pipelineBreakdown: { stage: CandidateStage; count: number }[];
  sourceBreakdown: { source: string; count: number; hiredCount: number }[];
  dailyApplications: { date: string; count: number }[];
  avgAIScore: number;
}

export async function fetchHiringAnalytics(userId: string): Promise<HiringAnalytics> {
  const [jobsRes, candidatesRes] = await Promise.all([
    supabase.from('hp_jobs').select('*').eq('user_id', userId),
    supabase.from('hp_candidates').select('*').eq('user_id', userId).order('applied_at', { ascending: true }),
  ]);

  const jobs: Job[] = jobsRes.data || [];
  const candidates: Candidate[] = candidatesRes.data || [];

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.status === 'open').length;
  const totalCandidates = candidates.length;

  // Pipeline breakdown
  const stageCounts = new Map<CandidateStage, number>();
  for (const c of candidates) {
    stageCounts.set(c.stage, (stageCounts.get(c.stage) || 0) + 1);
  }
  const pipelineBreakdown = (['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'] as CandidateStage[])
    .map(stage => ({ stage, count: stageCounts.get(stage) || 0 }));

  // Source breakdown
  const sourceMap = new Map<string, { count: number; hired: number }>();
  for (const c of candidates) {
    const src = c.source || 'direct';
    const existing = sourceMap.get(src) || { count: 0, hired: 0 };
    existing.count++;
    if (c.stage === 'hired') existing.hired++;
    sourceMap.set(src, existing);
  }
  const sourceBreakdown = Array.from(sourceMap.entries())
    .map(([source, data]) => ({ source, count: data.count, hiredCount: data.hired }))
    .sort((a, b) => b.count - a.count);

  // Daily applications
  const byDate = new Map<string, number>();
  for (const c of candidates) {
    const date = c.applied_at.slice(0, 10);
    byDate.set(date, (byDate.get(date) || 0) + 1);
  }
  const dailyApplications = Array.from(byDate.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Avg time to hire (for hired candidates)
  const hired = candidates.filter(c => c.stage === 'hired');
  let avgTimeToHire = 0;
  if (hired.length > 0) {
    const totalDays = hired.reduce((sum, c) => {
      const applied = new Date(c.applied_at).getTime();
      const updated = new Date(c.updated_at).getTime();
      return sum + (updated - applied) / 86400000;
    }, 0);
    avgTimeToHire = Math.round(totalDays / hired.length);
  }

  // Avg AI score
  const scored = candidates.filter(c => c.ai_score !== null);
  const avgAIScore = scored.length > 0
    ? Math.round(scored.reduce((sum, c) => sum + (c.ai_score || 0), 0) / scored.length)
    : 0;

  return {
    totalJobs, activeJobs, totalCandidates, avgTimeToHire,
    pipelineBreakdown, sourceBreakdown, dailyApplications, avgAIScore,
  };
}
