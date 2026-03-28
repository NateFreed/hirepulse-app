'use client';

import type { Candidate } from '@/lib/types';

interface CandidateCardProps {
  candidate: Candidate;
  onClick: (candidate: Candidate) => void;
  onStageChange: (candidateId: string, stage: Candidate['stage']) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-success bg-success/15';
  if (score >= 60) return 'text-accent bg-accent/15';
  if (score >= 40) return 'text-warning bg-warning/15';
  return 'text-danger bg-danger/15';
}

export default function CandidateCard({ candidate, onClick, onStageChange }: CandidateCardProps) {
  return (
    <div
      onClick={() => onClick(candidate)}
      className="glow-card p-4 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{candidate.name}</h4>
          <p className="text-xs text-muted">{candidate.email}</p>
        </div>
        {candidate.ai_score !== null && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getScoreColor(candidate.ai_score)}`}>
            {candidate.ai_score}%
          </span>
        )}
      </div>

      {/* AI Summary */}
      {candidate.ai_summary && (
        <p className="text-xs text-muted/80 line-clamp-2 mb-2">{candidate.ai_summary}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{timeAgo(candidate.applied_at)}</span>
        {candidate.source && <span className="text-muted/60">{candidate.source}</span>}
      </div>
    </div>
  );
}
