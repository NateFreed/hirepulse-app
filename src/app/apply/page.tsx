'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getJobByShareId, submitApplication } from '@/lib/db';
import type { Job } from '@/lib/types';

function ApplicationContent() {
  const searchParams = useSearchParams();
  const shareId = searchParams.get('id');
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeText, setResumeText] = useState('');

  useEffect(() => {
    async function load() {
      if (!shareId) { setLoading(false); return; }
      try {
        const data = await getJobByShareId(shareId);
        setJob(data);
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, [shareId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!job || !name.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      await submitApplication(
        job.share_id,
        name.trim(),
        email.trim(),
        phone.trim(),
        resumeText.trim(),
        coverLetter.trim()
      );
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit:', err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">Job Not Found</h1>
        <p className="text-muted">This position may have been filled or the link is incorrect.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h1>
        <p className="text-muted max-w-md">Thank you for applying for {job.title}. We'll review your application and get back to you soon.</p>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Job info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{job.title}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-muted mb-4">
            {job.department && <span>{job.department}</span>}
            {job.location && <span>📍 {job.location}</span>}
            <span>{job.employment_type.replace('_', '-')}</span>
            {job.salary_min && job.salary_max && (
              <span>${job.salary_min.toLocaleString()} — ${job.salary_max.toLocaleString()}</span>
            )}
          </div>
          {job.description && (
            <div className="glow-card p-5 mb-4">
              <h2 className="text-sm font-semibold text-foreground mb-2">About the Role</h2>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </div>
          )}
          {job.requirements && (
            <div className="glow-card p-5 mb-4">
              <h2 className="text-sm font-semibold text-foreground mb-2">Requirements</h2>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
            </div>
          )}
          {job.benefits && (
            <div className="glow-card p-5">
              <h2 className="text-sm font-semibold text-foreground mb-2">Benefits</h2>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{job.benefits}</p>
            </div>
          )}
        </div>

        {/* Application form */}
        <div className="glow-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Apply for this Position</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-wider font-medium mb-2 block">Full Name *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" className={inputClass} required />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider font-medium mb-2 block">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className={inputClass} required />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-medium mb-2 block">Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-medium mb-2 block">Resume / Experience</label>
              <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={6} placeholder="Paste your resume or describe your relevant experience..." className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wider font-medium mb-2 block">Cover Letter (Optional)</label>
              <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={4} placeholder="Why are you interested in this role?" className={`${inputClass} resize-none`} />
            </div>
            <button
              type="submit"
              disabled={submitting || !name.trim() || !email.trim()}
              className="w-full py-3 bg-accent hover:bg-accent-light disabled:opacity-50 rounded-xl font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:-translate-y-0.5"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        <p className="text-xs text-muted/40 text-center mt-6">Powered by HirePulse</p>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    }>
      <ApplicationContent />
    </Suspense>
  );
}
