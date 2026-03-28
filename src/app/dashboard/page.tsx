'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { getJobs, getCandidates, updateCandidateStage } from '@/lib/db';
import type { Job, Candidate, CandidateStage } from '@/lib/types';
import { STAGES } from '@/lib/types';
import KanbanBoard from '@/components/KanbanBoard';

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const user = await getUser();
        if (!user) return;
        setUserId(user.id);

        const jobList = await getJobs(user.id);
        setJobs(jobList);

        if (jobList.length > 0) {
          setSelectedJobId(jobList[0].id);
          const candidateList = await getCandidates(jobList[0].id);
          setCandidates(candidateList);
        }
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleJobSelect = useCallback(async (jobId: string) => {
    setSelectedJobId(jobId);
    try {
      const candidateList = await getCandidates(jobId);
      setCandidates(candidateList);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    }
  }, []);

  const handleStageChange = useCallback(async (candidateId: string, stage: CandidateStage) => {
    try {
      await updateCandidateStage(candidateId, stage);
      setCandidates((prev) =>
        prev.map((c) => c.id === candidateId ? { ...c, stage } : c)
      );
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  }, []);

  const handleCandidateClick = useCallback((candidate: Candidate) => {
    // TODO: Open candidate detail modal/page
    console.log('Candidate clicked:', candidate.name);
  }, []);

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  // Stats
  const totalCandidates = candidates.length;
  const inScreening = candidates.filter((c) => c.stage === 'screening').length;
  const inInterview = candidates.filter((c) => c.stage === 'interview').length;
  const avgScore = candidates.filter((c) => c.ai_score !== null).length > 0
    ? Math.round(candidates.filter((c) => c.ai_score !== null).reduce((sum, c) => sum + (c.ai_score ?? 0), 0) / candidates.filter((c) => c.ai_score !== null).length)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to HirePulse</h2>
        <p className="text-muted mb-6">Create your first job posting to start hiring.</p>
        <Link href="/jobs/new" className="px-7 py-3 bg-accent hover:bg-accent-light rounded-xl font-semibold text-white shadow-lg shadow-accent/25 transition-all inline-block">
          Create Job Posting
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hiring Pipeline</h1>
          <p className="text-sm text-muted mt-1">{selectedJob?.title ?? 'Select a job'}</p>
        </div>
        <Link
          href="/jobs/new"
          className="px-4 py-2 bg-accent hover:bg-accent-light rounded-xl text-sm font-semibold text-white shadow-sm shadow-accent/10 transition-all"
        >
          + New Job
        </Link>
      </div>

      {/* Job selector */}
      {jobs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => handleJobSelect(job.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                selectedJobId === job.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'bg-surface border border-border text-muted hover:text-foreground'
              }`}
            >
              {job.title}
              <span className={`ml-2 text-xs ${
                job.status === 'open' ? 'text-success' : 'text-muted'
              }`}>
                {job.status === 'open' ? '● Open' : '● Closed'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glow-card p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{totalCandidates}</div>
          <div className="text-xs text-muted">Total Applicants</div>
        </div>
        <div className="glow-card p-4 text-center">
          <div className="text-2xl font-bold text-accent">{inScreening}</div>
          <div className="text-xs text-muted">In Screening</div>
        </div>
        <div className="glow-card p-4 text-center">
          <div className="text-2xl font-bold text-[#6366f1]">{inInterview}</div>
          <div className="text-xs text-muted">In Interview</div>
        </div>
        <div className="glow-card p-4 text-center">
          <div className="text-2xl font-bold text-success">{avgScore}%</div>
          <div className="text-xs text-muted">Avg AI Score</div>
        </div>
      </div>

      {/* Kanban */}
      <KanbanBoard
        candidates={candidates}
        onCandidateClick={handleCandidateClick}
        onStageChange={handleStageChange}
      />
    </div>
  );
}
