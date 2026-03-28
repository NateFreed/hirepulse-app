'use client';

import type { Candidate, CandidateStage } from '@/lib/types';
import { STAGES } from '@/lib/types';
import CandidateCard from './CandidateCard';

interface KanbanBoardProps {
  candidates: Candidate[];
  onCandidateClick: (candidate: Candidate) => void;
  onStageChange: (candidateId: string, stage: CandidateStage) => void;
}

export default function KanbanBoard({ candidates, onCandidateClick, onStageChange }: KanbanBoardProps) {
  // Only show active stages (not hired/rejected — those go to separate views)
  const activeStages = STAGES.filter((s) => s.key !== 'hired' && s.key !== 'rejected');

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {activeStages.map((stage) => {
        const stageCandidates = candidates.filter((c) => c.stage === stage.key);

        return (
          <div key={stage.key} className="flex-shrink-0 w-72">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
              <span className="text-sm font-semibold text-foreground">{stage.label}</span>
              <span className="text-xs text-muted bg-surface border border-border rounded-full px-2 py-0.5">
                {stageCandidates.length}
              </span>
            </div>

            {/* Candidate cards */}
            <div className="space-y-2 min-h-[200px] p-2 bg-surface/30 border border-border/50 rounded-xl">
              {stageCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onClick={onCandidateClick}
                  onStageChange={onStageChange}
                />
              ))}
              {stageCandidates.length === 0 && (
                <div className="flex items-center justify-center h-20 text-xs text-muted/40">
                  No candidates
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
