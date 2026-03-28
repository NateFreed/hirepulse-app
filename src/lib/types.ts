export interface Job {
  id: string;
  user_id: string;
  title: string;
  department: string;
  location: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship';
  salary_min: number | null;
  salary_max: number | null;
  description: string;       // AI-generated or manual
  requirements: string;
  benefits: string;
  status: 'draft' | 'open' | 'closed';
  share_id: string;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  job_id: string;
  user_id: string;           // the hiring manager
  name: string;
  email: string;
  phone: string;
  resume_text: string;       // extracted text from resume
  resume_url: string;        // stored file URL
  cover_letter: string;
  source: string;            // where they applied from
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  ai_score: number | null;   // 0-100 AI match score
  ai_summary: string | null; // AI-generated candidate summary
  notes: string;
  applied_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  candidate_id: string;
  job_id: string;
  scheduled_at: string;
  duration_minutes: number;
  location: string;          // "Zoom", "Office", etc.
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface TeamNote {
  id: string;
  candidate_id: string;
  author_name: string;
  content: string;
  rating: number | null;     // 1-5 team rating
  created_at: string;
}

export type CandidateStage = Candidate['stage'];

export const STAGES: { key: CandidateStage; label: string; color: string }[] = [
  { key: 'applied', label: 'Applied', color: '#6b7a99' },
  { key: 'screening', label: 'Screening', color: '#f59e0b' },
  { key: 'interview', label: 'Interview', color: '#6366f1' },
  { key: 'offer', label: 'Offer', color: '#8b5cf6' },
  { key: 'hired', label: 'Hired', color: '#34d399' },
  { key: 'rejected', label: 'Rejected', color: '#ef4444' },
];
