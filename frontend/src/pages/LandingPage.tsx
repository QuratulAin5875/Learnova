import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Clock,
  Code2,
  Compass,
  GitBranch,
  Lock,
  Network,
  Rocket,
  Sparkles,
  Target,
} from 'lucide-react';
import { PublicLayout } from '../components/Layouts';
import { COURSES } from '../data/mockData';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  // Toggle between p74 (Marketing Hero) and p01 (Diagnostic Welcome Banner)
  const [heroMode, setHeroMode] = useState<'marketing' | 'welcome'>('welcome');
  const { showFigmaPresets } = useApp();
  const navigate = useNavigate();

  return (
    <PublicLayout rightMode="landing">
      <div className="max-w-6xl w-full mx-auto px-6 py-8 space-y-10">
        {/* Mode Switcher Bar for reviewing both Figma landing variants (p01 & p74) */}
        {showFigmaPresets && (
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs">
            <span className="text-slate-500 font-medium">
              Figma Landing Variants: switch between Pre-Diagnostic Welcome (p01) and Public Overview (p74)
            </span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
              <button
                onClick={() => setHeroMode('welcome')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  heroMode === 'welcome' ? 'bg-white text-[#0052CC] shadow-2xs' : 'text-slate-600'
                }`}
              >
                Diagnostic Welcome (p01)
              </button>
              <button
                onClick={() => setHeroMode('marketing')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  heroMode === 'marketing' ? 'bg-white text-[#0052CC] shadow-2xs' : 'text-slate-600'
                }`}
              >
                Platform Overview (p74)
              </button>
            </div>
          </div>
        )}

        {heroMode === 'welcome' ? (
          <>
            {/* Hero Gradient Banner (exact match to Figma p01) */}
            <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0041A8] via-[#0052CC] to-[#045D75] text-white p-8 md:p-12 shadow-md">
              <div className="relative z-10 max-w-xl space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider">
                  <Rocket className="w-3.5 h-3.5 text-sky-300" />
                  <span>WELCOME TO LEARNOVA</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  Let&apos;s discover where you are.
                </h1>
                <p className="text-sm md:text-base text-blue-100 leading-relaxed">
                  Complete your initial diagnostic assessment to build your personalized learning roadmap.
                  This AI-driven evaluation identifies your current strengths and knowledge gaps to ensure
                  we start exactly at your level.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => navigate('/onboarding')}
                    className="inline-flex items-center gap-2 bg-[#7DD3FC] hover:bg-[#38BDF8] text-slate-950 font-bold text-sm px-5 py-3 rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Start Diagnostic</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="inline-flex items-center gap-1.5 text-xs text-blue-100/90 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    Takes ~15 minutes
                  </span>
                </div>
              </div>

              {/* Right Radar Target Graphic from p01 */}
              <div className="hidden lg:flex items-center justify-center absolute right-12 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-dashed border-white/25">
                <div className="w-44 h-44 rounded-full bg-white/5 border border-white/15 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-white/10 border border-white/25 flex items-center justify-center">
                    <Target className="w-11 h-11 text-white" />
                  </div>
                </div>
              </div>
            </section>

            {/* Locked Preview Cards (Your Roadmap, AI Recommendations, Mastery Overview from p01) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Compass className="w-4 h-4 text-slate-600" />
                  <span>Your Roadmap</span>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-sky-300 p-10 flex flex-col items-center justify-center text-center min-h-[220px]">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Available after assessment</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Your personalized learning path will appear here once we understand your baseline.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Sparkles className="w-4 h-4 text-[#0052CC]" />
                  <span>AI Recommendations</span>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-sky-300 p-10 flex flex-col items-center justify-center text-center min-h-[220px]">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
                    <Brain className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">AI initializing...</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Take the diagnostic so our engine can generate targeted practice recommendations.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <BarChart3 className="w-4 h-4 text-slate-600" />
                <span>Mastery Overview</span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-sky-300 p-10 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Awaiting Data</h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Complete exercises to start tracking your topic mastery across disciplines.
                </p>
              </div>
            </div>
          </>
        ) : (
          /* Marketing Landing Variant (exact match to Figma p74) */
          <div className="space-y-14 py-6">
            <section className="text-center max-w-2xl mx-auto space-y-5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0052CC] text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>PERSONALIZED LEARNING FOR INDEPENDENT LEARNERS</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
                Learn what you need next, in the right order.
              </h1>
              <p className="text-base text-slate-600">
                Take a short diagnostic and get a personalized roadmap that adapts as you learn. No
                instructor or schedule needed.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 bg-[#0052CC] hover:bg-[#0043A8] text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-xs transition-colors"
                >
                  <span>Sign up</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                >
                  Log in
                </Link>
              </div>
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-[#0052CC] font-semibold hover:underline">
                  Log in
                </Link>
              </p>
            </section>

            {/* How it works (from p74) */}
            <section className="space-y-5">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#0052CC]">
                  METHODOLOGY
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">How it works</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  {
                    num: '1',
                    title: 'Take a short diagnostic',
                    desc: 'Show what you already know in about 5–8 minutes.',
                  },
                  {
                    num: '2',
                    title: 'Get your roadmap',
                    desc: 'A step-by-step path, with a reason for every topic.',
                  },
                  {
                    num: '3',
                    title: 'Learn and earn certificates',
                    desc: 'Your roadmap updates after each assessment, and you earn certificates you can share.',
                  },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-2xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052CC] font-bold text-sm flex items-center justify-center">
                      {step.num}
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Subjects available (from p74) */}
            <section className="space-y-5">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#0052CC]">
                    CURRICULUM
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    Subjects available
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Foundational Computer Science Sequence
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {COURSES.map((c, idx) => (
                  <div
                    key={c.id}
                    className="bg-slate-100/80 hover:bg-white rounded-2xl border border-slate-200 p-5 space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-white text-[#0052CC] font-bold text-[11px] border border-slate-200">
                        {c.code}
                      </span>
                      {idx === 0 ? (
                        <Code2 className="w-4 h-4 text-slate-400" />
                      ) : idx === 1 ? (
                        <GitBranch className="w-4 h-4 text-slate-400" />
                      ) : (
                        <Network className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{c.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};
