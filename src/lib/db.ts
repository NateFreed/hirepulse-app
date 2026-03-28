import { supabase } from './supabase';
import type { Job, Candidate, Interview, TeamNote, CandidateStage } from './types';

// Jobs
export async function getJobs(userId: string): Promise<Job[]> {
  const { data, error } = await supabase
    .from('hp_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getJob(jobId: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('hp_jobs')
    .select('*')
    .eq('id', jobId)
    .single();
  if (error) return null;
  return data;
}

export async function getJobByShareId(shareId: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('hp_jobs')
    .select('*')
    .eq('share_id', shareId)
    .eq('status', 'open')
    .single();
  if (error) return null;
  return data;
}

export async function createJob(userId: string, title: string, description = ''): Promise<Job> {
  const shareId = Math.random().toString(36).substring(2, 10);
  const { data, error } = await supabase
    .from('hp_jobs')
    .insert({
      user_id: userId,
      title,
      department: '',
      location: '',
      employment_type: 'full_time',
      description,
      requirements: '',
      benefits: '',
      status: 'draft',
      share_id: shareId,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateJob(jobId: string, updates: Partial<Job>): Promise<Job> {
  const { data, error } = await supabase
    .from('hp_jobs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', jobId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteJob(jobId: string): Promise<void> {
  const { error } = await supabase.from('hp_jobs').delete().eq('id', jobId);
  if (error) throw error;
}

// Candidates
export async function getCandidates(jobId: string): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from('hp_candidates')
    .select('*')
    .eq('job_id', jobId)
    .order('applied_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCandidate(candidateId: string): Promise<Candidate | null> {
  const { data, error } = await supabase
    .from('hp_candidates')
    .select('*')
    .eq('id', candidateId)
    .single();
  if (error) return null;
  return data;
}

export async function createCandidate(
  jobId: string,
  userId: string,
  name: string,
  email: string,
  phone = '',
  resumeText = '',
  coverLetter = '',
  source = 'direct'
): Promise<Candidate> {
  const { data, error } = await supabase
    .from('hp_candidates')
    .insert({
      job_id: jobId,
      user_id: userId,
      name,
      email,
      phone,
      resume_text: resumeText,
      resume_url: '',
      cover_letter: coverLetter,
      source,
      stage: 'applied',
      notes: '',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCandidateStage(candidateId: string, stage: CandidateStage): Promise<void> {
  const { error } = await supabase
    .from('hp_candidates')
    .update({ stage, updated_at: new Date().toISOString() })
    .eq('id', candidateId);
  if (error) throw error;
}

export async function updateCandidate(candidateId: string, updates: Partial<Candidate>): Promise<void> {
  const { error } = await supabase
    .from('hp_candidates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', candidateId);
  if (error) throw error;
}

// Submit application (public, no auth)
export async function submitApplication(
  jobId: string,
  name: string,
  email: string,
  phone: string,
  resumeText: string,
  coverLetter: string
): Promise<void> {
  // Get the job to find the owner
  const job = await getJobByShareId(jobId);
  if (!job) throw new Error('Job not found');

  await supabase.from('hp_candidates').insert({
    job_id: job.id,
    user_id: job.user_id,
    name,
    email,
    phone,
    resume_text: resumeText,
    resume_url: '',
    cover_letter: coverLetter,
    source: 'application_form',
    stage: 'applied',
    notes: '',
  });
}

// Interviews
export async function getInterviews(jobId: string): Promise<Interview[]> {
  const { data, error } = await supabase
    .from('hp_interviews')
    .select('*')
    .eq('job_id', jobId)
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createInterview(
  candidateId: string,
  jobId: string,
  scheduledAt: string,
  duration = 60,
  location = 'Zoom'
): Promise<Interview> {
  const { data, error } = await supabase
    .from('hp_interviews')
    .insert({ candidate_id: candidateId, job_id: jobId, scheduled_at: scheduledAt, duration_minutes: duration, location, notes: '', status: 'scheduled' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Team Notes
export async function getTeamNotes(candidateId: string): Promise<TeamNote[]> {
  const { data, error } = await supabase
    .from('hp_team_notes')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addTeamNote(candidateId: string, authorName: string, content: string, rating: number | null = null): Promise<TeamNote> {
  const { data, error } = await supabase
    .from('hp_team_notes')
    .insert({ candidate_id: candidateId, author_name: authorName, content, rating })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Pipeline stats
export async function getPipelineStats(jobId: string): Promise<Record<CandidateStage, number>> {
  const candidates = await getCandidates(jobId);
  const stats: Record<string, number> = {
    applied: 0, screening: 0, interview: 0, offer: 0, hired: 0, rejected: 0,
  };
  for (const c of candidates) {
    stats[c.stage] = (stats[c.stage] || 0) + 1;
  }
  return stats as Record<CandidateStage, number>;
}
