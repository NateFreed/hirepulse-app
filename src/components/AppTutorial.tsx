'use client';

import Tutorial from './Tutorial';

const STEPS = [
  {
    title: 'Create a Job Posting',
    description: 'Write your own job description or let AI generate one for you. Publish it and share the application link.',
  },
  {
    title: 'Screen Resumes with AI',
    description: 'Upload resumes in bulk. AI scores each candidate against your job requirements so you focus on the best fits.',
  },
  {
    title: 'Manage Your Pipeline',
    description: 'Drag candidates across stages — Screening, Interview, and Offer. Your hiring funnel at a glance.',
  },
  {
    title: 'Track Hiring Metrics',
    description: 'Monitor applicant volume, screening progress, interview pace, and average AI match scores in real time.',
  },
];

export default function AppTutorial() {
  return (
    <Tutorial
      appName="HirePulse"
      steps={STEPS}
      accentColor="bg-accent"
    />
  );
}
