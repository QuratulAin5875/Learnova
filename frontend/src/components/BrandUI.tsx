import React from 'react';
import { GraduationCap } from 'lucide-react';
import { cn } from '../lib/utils';
import type { MasteryStatus } from '../data/mockData';

export const BrandLogo: React.FC<{
  badge?: string;
  subtitle?: string;
  variant?: 'icon' | 'letter';
  className?: string;
}> = ({ badge, subtitle, variant = 'icon', className }) => (
  <div className={cn('inline-flex items-center gap-2.5 select-none', className)}>
    {variant === 'letter' ? (
      <div className="w-8 h-8 rounded-lg bg-[#0052CC] text-white font-bold text-base flex items-center justify-center shadow-xs">
        L
      </div>
    ) : (
      <div className="w-8 h-8 rounded-lg bg-[#0052CC] text-white flex items-center justify-center shadow-xs">
        <GraduationCap className="w-5 h-5" />
      </div>
    )}
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg tracking-tight text-slate-900">Learnova</span>
        {badge && (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0052CC] rounded-md border border-blue-200">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <span className="text-[11px] text-slate-500 -mt-0.5">{subtitle}</span>}
    </div>
  </div>
);

export const MasteryBadge: React.FC<{ status: MasteryStatus; className?: string }> = ({ status, className }) => {
  const map: Record<MasteryStatus, { label: string; style: string }> = {
    mastered: {
      label: 'Mastered',
      style: 'bg-[#0052CC] text-white',
    },
    completed: {
      label: 'Completed',
      style: 'bg-[#E0E7FF] text-[#3730A3]',
    },
    not_completed: {
      label: 'Not Completed',
      style: 'bg-[#DC2626] text-white',
    },
    locked: {
      label: 'Locked',
      style: 'bg-slate-100 text-slate-600 border border-slate-200',
    },
  };
  const item = map[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide',
        item.style,
        className
      )}
    >
      {item.label}
    </span>
  );
};

export const MasteryLegendBar: React.FC<{ showLocked?: boolean }> = ({ showLocked = false }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs">
    <span className="font-semibold text-slate-700">Mastery Thresholds:</span>
    <div className="flex flex-wrap items-center gap-4 font-medium text-slate-700">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#0052CC]" />
        Mastered (≥90%)
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
        Completed (70%–89%)
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
        Not Completed (&lt;70%)
      </span>
      {showLocked && (
        <span className="inline-flex items-center gap-1.5 text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          Locked
        </span>
      )}
    </div>
  </div>
);
