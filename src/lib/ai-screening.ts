import { supabase } from './supabase';
import type { Job, Candidate } from './types';

/**
 * AI Resume Screening — the killer feature.
 * Scores candidates against job requirements using Claude API.
 *
 * V1: Calls Supabase Edge Function with resume text + job requirements.
 * Fallback: Keyword matching scoring.
 */
export async function screenCandidate(
  candidateId: string,
  resumeText: string,
  job: Job
): Promise<{ score: number; summary: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('screen-resume', {
      body: {
        candidate_id: candidateId,
        resume_text: resumeText,
        job_title: job.title,
        job_description: job.description,
        job_requirements: job.requirements,
      },
    });

    if (!error && data?.score !== undefined) {
      // Save to database
      await supabase
        .from('hp_candidates')
        .update({
          ai_score: data.score,
          ai_summary: data.summary,
          updated_at: new Date().toISOString(),
        })
        .eq('id', candidateId);

      return { score: data.score, summary: data.summary };
    }

    return fallbackScreening(resumeText, job);
  } catch {
    return fallbackScreening(resumeText, job);
  }
}

/**
 * Fallback: keyword matching when AI API is unavailable.
 */
function fallbackScreening(resumeText: string, job: Job): { score: number; summary: string } {
  const resume = resumeText.toLowerCase();
  const requirements = (job.requirements + ' ' + job.description).toLowerCase();

  // Extract keywords from requirements
  const keywords = requirements
    .split(/[\s,;.]+/)
    .filter(w => w.length > 3)
    .filter((w, i, arr) => arr.indexOf(w) === i);

  // Score based on keyword matches
  let matches = 0;
  const matchedKeywords: string[] = [];
  for (const keyword of keywords) {
    if (resume.includes(keyword)) {
      matches++;
      if (matchedKeywords.length < 5) matchedKeywords.push(keyword);
    }
  }

  const score = keywords.length > 0
    ? Math.min(95, Math.round((matches / keywords.length) * 100))
    : 50;

  const summary = score >= 70
    ? `Strong match. Resume mentions key skills: ${matchedKeywords.join(', ')}. Recommend advancing to screening.`
    : score >= 40
    ? `Partial match. Some relevant experience found. Review manually for fit.`
    : `Low match against job requirements. Consider other candidates first.`;

  return { score, summary };
}

/**
 * AI Job Description Generator.
 * Creates a professional job posting from a brief description.
 */
export async function generateJobDescription(
  title: string,
  brief: string,
  companyName: string
): Promise<{ description: string; requirements: string; benefits: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-job-description', {
      body: { title, brief, company_name: companyName },
    });

    if (!error && data?.description) {
      return {
        description: data.description,
        requirements: data.requirements || '',
        benefits: data.benefits || '',
      };
    }

    return fallbackJobDescription(title, brief, companyName);
  } catch {
    return fallbackJobDescription(title, brief, companyName);
  }
}

function fallbackJobDescription(title: string, brief: string, companyName: string): {
  description: string; requirements: string; benefits: string;
} {
  return {
    description: `${companyName} is looking for a talented ${title} to join our team. ${brief}\n\nThis is an exciting opportunity to make a real impact in a growing organization. The ideal candidate is passionate, self-motivated, and eager to contribute to our mission.`,
    requirements: `• Relevant experience in ${title.toLowerCase()} or related field\n• Strong communication and collaboration skills\n• Ability to work independently and as part of a team\n• Problem-solving mindset with attention to detail`,
    benefits: `• Competitive salary\n• Flexible work arrangements\n• Professional development opportunities\n• Collaborative team environment`,
  };
}
