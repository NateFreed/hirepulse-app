'use client';

import { useState } from 'react';
import type { Job } from '@/lib/types';

interface JobPostingFormProps {
  onSubmit: (job: Omit<Job, 'id' | 'user_id' | 'share_id' | 'created_at' | 'updated_at'>) => void;
  onGenerateDescription: (title: string, department: string) => Promise<string>;
  loading: boolean;
}

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
] as const;

export default function JobPostingForm({ onSubmit, onGenerateDescription, loading }: JobPostingFormProps) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState<Job['employment_type']>('full_time');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    if (!title.trim()) return;
    setGenerating(true);
    try {
      const desc = await onGenerateDescription(title, department);
      setDescription(desc);
    } catch (err) {
      console.error('Failed to generate:', err);
    } finally {
      setGenerating(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      department: department.trim(),
      location: location.trim(),
      employment_type: employmentType,
      salary_min: salaryMin ? Number(salaryMin) : null,
      salary_max: salaryMax ? Number(salaryMax) : null,
      description: description.trim(),
      requirements: requirements.trim(),
      benefits: benefits.trim(),
      status: 'open',
    });
  }

  const inputClass = "w-full px-4 py-2.5 bg-surface border border-border rounded-xl text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-accent/50 text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basic info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-xs text-muted uppercase tracking-wider font-medium mb-2 block">Job Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Frontend Developer" className={inputClass} required />
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-wider font-medium mb-2 block">Department</label>
          <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g., Engineering" className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-wider font-medium mb-2 block">Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Remote, New York" className={inputClass} />
        </div>
      </div>

      {/* Employment type + salary */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-muted uppercase tracking-wider font-medium mb-2 block">Type</label>
          <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as Job['employment_type'])} className={inputClass}>
            {EMPLOYMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-wider font-medium mb-2 block">Salary Min</label>
          <input type="number" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="50000" className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-muted uppercase tracking-wider font-medium mb-2 block">Salary Max</label>
          <input type="number" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="80000" className={inputClass} />
        </div>
      </div>

      {/* Description with AI */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-muted uppercase tracking-wider font-medium">Description</label>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !title.trim()}
            className="text-xs text-accent hover:text-accent-light font-medium disabled:opacity-50 transition-colors"
          >
            {generating ? 'Generating...' : '✨ Generate with AI'}
          </button>
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder="Describe the role..." className={`${inputClass} resize-none`} />
      </div>

      {/* Requirements */}
      <div>
        <label className="text-xs text-muted uppercase tracking-wider font-medium mb-2 block">Requirements</label>
        <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={4} placeholder="List key requirements..." className={`${inputClass} resize-none`} />
      </div>

      {/* Benefits */}
      <div>
        <label className="text-xs text-muted uppercase tracking-wider font-medium mb-2 block">Benefits</label>
        <textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={3} placeholder="What you offer..." className={`${inputClass} resize-none`} />
      </div>

      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="w-full py-3 bg-accent hover:bg-accent-light disabled:opacity-50 rounded-xl font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
      >
        {loading ? 'Creating...' : 'Create Job Posting'}
      </button>
    </form>
  );
}
