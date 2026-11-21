import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ExternalLink, Lock, Share2, Sparkles } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LearnerShell } from '../components/Layouts';
import { MasteryBadge, MasteryLegendBar } from '../components/BrandUI';
import { useApp } from '../context/AppContext';
import {
  bktUpdate,
  classifyErrorType,
  pickActiveTopic,
  QUESTION_BANK,
  statusFromMastery,
  type ConfidenceLevel,
  type ErrorType,
} from '../data/mockData';
import { isSafeHttpUrl } from '../lib/api';

const CONF_SCORE: Record<ConfidenceLevel, number> = { low: 35, medium: 65, high: 90 };

export const RecommendationsPage: React.FC = () => {
  const { topics, allTopics } = useApp();
  const navigate = useNavigate();

  const next = pickActiveTopic(topics);
  const blocked = next ? topics.find((t) => t.status === 'locked' && t.prerequisites.includes(next.id)) : undefined;
  const nudge = topics.find((t) => t.status === 'completed' && t.id !== next?.id);

  return (
    <LearnerShell breadcrumb="Recommendations">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Recommendations</h1>
          <p className="text-xs text-slate-500 mt-0.5">Learning suggestions based on your profile and recent evidence.</p>
        </div>

        {next ? (
          <div className="bg-white rounded-2xl border-2 border-[#0052CC] p-6 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0052CC] text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NEXT BEST TOPIC • AI REASONED</span>
              </span>
              <span className={`text-xs font-bold ${next.mastery < 70 ? 'text-red-600' : 'text-[#0052CC]'}`}>
                Current Mastery: {next.mastery}% {next.mastery < 70 ? '(Gap)' : ''}
              </span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 max-w-2xl">
                <h2 className="text-xl font-extrabold text-slate-900">{next.title}</h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900">Recommended because:</strong> your mastery on this topic is{' '}
                  {next.mastery}% with {next.confidence}% self-reported confidence
                  {next.mastery < 70 ? ', below the 70% completion threshold' : ''}.
                  {blocked ? ` Completing it unlocks ${blocked.title}.` : ''}
                </p>
              </div>
              <button
                onClick={() => navigate(`/topics/${next.id}`)}
                className="px-5 py-3 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] text-white text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Study Topic Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-slate-500">Take the diagnostic to get recommendations.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {nudge && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">Review Nudge</span>
                <h3 className="text-base font-bold text-slate-900">{nudge.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You are at {nudge.mastery}% (Completed). A short practice round can push this to ≥90% Mastered.
                </p>
              </div>
              <Link to={`/practice?topic=${nudge.id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0052CC] hover:underline">
                <span>Start Quick Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
          {blocked && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">Upcoming Prerequisite Target</span>
                <h3 className="text-base font-bold text-slate-900">{blocked.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Currently locked. Requires {allTopics.find((t) => t.id === next?.id)?.title} at ≥70% mastery.
                </p>
              </div>
              <Link to="/roadmap" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0052CC] hover:underline">
                <span>View on Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </LearnerShell>
  );
};

const PROGRESS_KEY = 'learnova_topic_progress_v3';
function readProgress(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
  } catch {
    return {};
  }
}

export const TopicStudyPage: React.FC = () => {
  const { id } = useParams();
  const { allTopics } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'concepts' | 'resources'>('concepts');
  const [studied, setStudied] = useState<string[]>(() => readProgress()[id ?? ''] ?? []);

  const topic = allTopics.find((t) => t.id === id);

  const resources = useMemo(
    () =>
      topic
        ? [
            { key: 'r1', title: `${topic.title}: reference overview`, type: 'Documentation', time: '10 min read', url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(topic.title)}` },
            { key: 'r2', title: `${topic.competencies[0] ?? topic.title}: visual explainer`, type: 'Video search', time: '12 min watch', url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${topic.title} ${topic.competencies[0] ?? ''} explained`)}` },
            { key: 'r3', title: `${topic.title}: practice problems`, type: 'Practice Set', time: 'Self-paced', url: `https://www.geeksforgeeks.org/search/?q=${encodeURIComponent(topic.title)}` },
          ]
        : [],
    [topic]
  );

  if (!topic) return <Navigate to="/roadmap" replace />;

  const unmet = topic.prerequisites
    .map((pid) => allTopics.find((t) => t.id === pid))
    .filter((p) => p && p.status !== 'completed' && p.status !== 'mastered');

  if (topic.status === 'locked' || unmet.length > 0) {
    return (
      <LearnerShell breadcrumb={`My Roadmap > ${topic.title}`}>
        <div className="bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto"><Lock className="w-5 h-5" /></div>
          <h1 className="text-lg font-extrabold text-slate-900">{topic.title} is locked</h1>
          <p className="text-xs text-slate-500">Complete these prerequisites (≥70% mastery) first:</p>
          <ul className="text-xs font-semibold text-slate-800 space-y-1">
            {unmet.map((p) => (
              <li key={p!.id}>
                <Link to={`/topics/${p!.id}`} className="text-[#0052CC] hover:underline">{p!.title}</Link> ({p!.mastery}%)
              </li>
            ))}
          </ul>
          <Link to="/roadmap" className="inline-block px-4 py-2.5 rounded-xl bg-[#0052CC] text-white text-xs font-bold">Back to Roadmap</Link>
        </div>
      </LearnerShell>
    );
  }

  const items = [...topic.syllabus.map((s) => `s:${s}`), ...resources.map((r) => `r:${r.key}`)];
  const progressPct = Math.round((studied.filter((k) => items.includes(k)).length / items.length) * 100);

  const markStudied = (key: string) => {
    if (studied.includes(key)) return;
    const next = [...studied, key];
    setStudied(next);
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ ...readProgress(), [topic.id]: next }));
    } catch {
      /* storage unavailable */
    }
  };

  return (
    <LearnerShell breadcrumb={`My Roadmap > ${topic.title}`}>
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0052CC] uppercase">{topic.code}</span>
              <MasteryBadge status={topic.status} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{topic.title}</h1>
            <p className="text-xs text-slate-500 max-w-2xl">{topic.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[11px] text-slate-500 font-medium">Learning Progress</div>
              <div className="text-lg font-extrabold text-[#0052CC]">{progressPct}%</div>
            </div>
            <button
              onClick={() => navigate(`/practice?topic=${topic.id}`)}
              className="px-5 py-3 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <span>Take Micro-Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-slate-200" role="tablist">
          {([['concepts', 'Concepts & Summary'], ['resources', 'Curated Learning Resources']] as const).map(([k, label]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                tab === k ? 'border-[#0052CC] text-[#0052CC]' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'concepts' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-[#0052CC] text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curated concept outline (AI-grounded summary arrives with the backend)</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">What you will cover</h2>
              <div className="space-y-2.5">
                {topic.syllabus.map((item, idx) => {
                  const done = studied.includes(`s:${item}`);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => markStudied(`s:${item}`)}
                      className="w-full text-left p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 cursor-pointer hover:bg-blue-50/40"
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${done ? 'bg-emerald-600 text-white' : 'bg-[#0052CC] text-white'}`}>
                          {done ? '✓' : idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{item}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-[#0052CC]">{done ? 'Studied' : 'Mark Studied ✓'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Core Evaluated Competencies</h3>
              <div className="space-y-2">
                {topic.competencies.map((c) => (
                  <div key={c} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-700" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {resources.map((r) => (
              <div key={r.key} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 rounded bg-blue-50 text-[#0052CC] text-[10px] font-bold">{r.type}</span>
                  <h3 className="text-sm font-bold text-slate-900">{r.title}</h3>
                  <p className="text-xs text-slate-500">{r.time}</p>
                </div>
                {isSafeHttpUrl(r.url) ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => markStudied(`r:${r.key}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0052CC] hover:underline"
                  >
                    <span>{studied.includes(`r:${r.key}`) ? 'Opened ✓ Open again' : 'Open Resource'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">Resource link unavailable</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </LearnerShell>
  );
};

interface AnswerRecord {
  correct: boolean;
  confidence: ConfidenceLevel;
  errorType?: ErrorType;
}

export const PracticeAndMicroAssessmentPage: React.FC = () => {
  const { topics, allTopics, updateTopicMastery, logAssessment } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const topic = allTopics.find((t) => t.id === params.get('topic')) || pickActiveTopic(topics);
  const questions = useMemo(() => {
    if (!topic) return [];
    const own = QUESTION_BANK.filter((q) => q.topicId === topic.id);
    const rest = QUESTION_BANK.filter((q) => q.subjectId === topic.subjectId && q.topicId !== topic.id);
    return [...own, ...rest].slice(0, Math.max(3, Math.min(8, own.length + 2)));
  }, [topic]);

  const [stage, setStage] = useState<'question' | 'complete' | 'roadmap'>('question');
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [outcome, setOutcome] = useState<{ before: number; after: number; unlocked: string[] } | null>(null);
  const revisions = useRef(0);
  const startedAt = useRef<number>(0);
  const beforeMastery = useRef(topic?.mastery ?? 0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, [idx]);

  if (!topic || questions.length === 0) {
    return (
      <LearnerShell breadcrumb="Practice">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto space-y-3">
          <h1 className="text-lg font-extrabold text-slate-900">No practice questions yet</h1>
          <p className="text-xs text-slate-500">Questions for this topic are added by an administrator.</p>
          <Link to="/dashboard" className="inline-block px-4 py-2.5 rounded-xl bg-[#0052CC] text-white text-xs font-bold">Back to Dashboard</Link>
        </div>
      </LearnerShell>
    );
  }

  const q = questions[idx];
  const isCorrect = selected === q.correctOption;
  const last = answers[answers.length - 1];

  const choose = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (checked) return;
    if (selected && opt !== selected) revisions.current += 1;
    setSelected(opt);
  };

  const check = () => {
    if (!selected || !confidence) return;
    const correct = selected === q.correctOption;
    const sec = Math.round((Date.now() - startedAt.current) / 1000);
    setAnswers((a) => [...a, { correct, confidence, errorType: correct ? undefined : classifyErrorType(sec, confidence, revisions.current) }]);
    setChecked(true);
  };

  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      setSelected(null);
      setConfidence(null);
      setChecked(false);
      revisions.current = 0;
      startedAt.current = Date.now();
      return;
    }
    // Finish: BKT starting from the learner's current mastery on this topic.
    let p = Math.max(0.1, beforeMastery.current / 100 || 0.3);
    questions.forEach((qq, i) => (p = bktUpdate(p, answers[i]?.correct ?? false, qq.difficulty)));
    const after = Math.round(p * 100);
    const conf = Math.round(answers.reduce((a, r) => a + CONF_SCORE[r.confidence], 0) / answers.length);
    const lockedDependents = allTopics.filter((t) => t.status === 'locked' && t.prerequisites.includes(topic.id));
    updateTopicMastery(topic.id, after, conf);
    logAssessment({
      courseId: topic.subjectId,
      type: 'Micro-Assessment',
      title: topic.title,
      correct: answers.filter((r) => r.correct).length,
      total: questions.length,
      confidence: conf,
    });
    setOutcome({
      before: beforeMastery.current,
      after,
      unlocked: after >= 70 ? lockedDependents.map((t) => t.title) : [],
    });
    setStage('complete');
  };

  return (
    <LearnerShell breadcrumb="Practice & Micro-Assessment">
      {stage === 'question' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-7 space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#0052CC] uppercase">ADAPTIVE MICRO-ASSESSMENT • {topic.title}</span>
            <span className="font-semibold text-slate-500">Question {idx + 1} of {questions.length}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#0052CC] transition-all" style={{ width: `${((idx + (checked ? 1 : 0)) / questions.length) * 100}%` }} />
          </div>

          <h1 className="text-xl font-extrabold text-slate-900">{q.stem}</h1>

          <div className="space-y-2.5" role="radiogroup" aria-label="Answer options">
            {q.options.map((opt) => {
              const active = selected === opt.id;
              const reveal = checked && opt.id === q.correctOption;
              const wrong = checked && active && opt.id !== q.correctOption;
              return (
                <button
                  key={opt.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => choose(opt.id)}
                  className={`w-full p-4 rounded-xl text-left flex items-center gap-3 border transition-all ${checked ? 'cursor-default' : 'cursor-pointer'} ${
                    reveal ? 'bg-emerald-50 border-emerald-400 text-emerald-950' : wrong ? 'bg-red-50 border-red-400 text-red-950' : active ? 'bg-[#0052CC] text-white border-[#0052CC]' : 'bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-white/30 text-xs font-bold flex items-center justify-center">{opt.id}</span>
                  <span className="text-sm font-semibold">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {checked && last && (
            <div className={`p-5 rounded-2xl border space-y-2 ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-red-50 border-red-200 text-red-950'}`} role="status">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase">
                  {isCorrect ? 'Correct Response ✓' : `Incorrect Response${last.errorType ? ` • ${last.errorType[0].toUpperCase()}${last.errorType.slice(1)} Error` : ''}`}
                </span>
                {!isCorrect && last.errorType && (
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold">Error Type: {last.errorType}</span>
                )}
              </div>
              <p className="text-xs leading-relaxed">{q.explanation}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs" role="radiogroup" aria-label="Confidence">
              <span className="font-bold text-slate-700">Confidence:</span>
              {(['low', 'medium', 'high'] as ConfidenceLevel[]).map((c) => (
                <button
                  key={c}
                  role="radio"
                  aria-checked={confidence === c}
                  disabled={checked}
                  onClick={() => setConfidence(c)}
                  className={`px-3 py-1 rounded-lg font-bold capitalize cursor-pointer disabled:cursor-default ${confidence === c ? 'bg-[#0052CC] text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            {!checked ? (
              <button
                disabled={!selected || !confidence}
                onClick={check}
                className="px-5 py-2.5 rounded-xl bg-[#0052CC] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer"
              >
                Check Answer
              </button>
            ) : (
              <button onClick={next} className="px-5 py-2.5 rounded-xl bg-[#0052CC] text-white text-xs font-bold cursor-pointer">
                {idx + 1 < questions.length ? 'Next Question →' : 'Complete Micro-Assessment →'}
              </button>
            )}
          </div>
        </div>
      )}

      {stage === 'complete' && outcome && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-xl mx-auto text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto"><CheckCircle2 className="w-6 h-6" /></div>
          <h1 className="text-2xl font-extrabold text-slate-900">Micro-Assessment Complete</h1>
          <p className="text-xs text-slate-600">
            {answers.filter((a) => a.correct).length} of {questions.length} correct. Your BKT mastery for <strong>{topic.title}</strong> moved from{' '}
            <strong>{outcome.before}% → {outcome.after}% ({statusFromMastery(outcome.after).replace('_', ' ')})</strong>.
          </p>
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500">Updated Mastery (BKT)</div>
              <div className="text-lg font-extrabold text-[#0052CC]">{outcome.after}%</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500">Unlocked Topics</div>
              <div className="text-sm font-extrabold text-emerald-600">{outcome.unlocked.length ? outcome.unlocked.join(', ') : 'None yet'}</div>
            </div>
          </div>
          <button onClick={() => setStage('roadmap')} className="w-full py-3 rounded-xl bg-[#0052CC] text-white text-xs font-bold cursor-pointer">
            View Roadmap Adaptation →
          </button>
        </div>
      )}

      {stage === 'roadmap' && outcome && (
        <div className="bg-white rounded-2xl border-2 border-[#0052CC] p-8 max-w-xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0052CC] text-[11px] font-bold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CONTINUOUS ADAPTATION LOOP</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Your Roadmap Has Been Updated</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>{topic.title}</strong> is now <strong>{statusFromMastery(outcome.after).replace('_', ' ')} ({outcome.after}%)</strong>.{' '}
            {outcome.unlocked.length
              ? `${outcome.unlocked.join(', ')} ${outcome.unlocked.length > 1 ? 'have' : 'has'} been unlocked as your next target.`
              : outcome.after < 70
              ? 'It stays on your roadmap as a review topic until it reaches 70%.'
              : 'Keep practising to push it toward Mastered (≥90%).'}
          </p>
          <button onClick={() => navigate('/roadmap')} className="w-full py-3 rounded-xl bg-[#0052CC] text-white text-xs font-bold cursor-pointer">
            Open Updated Roadmap
          </button>
        </div>
      )}
    </LearnerShell>
  );
};

export const ProgressPage: React.FC = () => {
  const { topics, activeCourse, snapshots } = useApp();

  const trend = useMemo(
    () =>
      snapshots
        .filter((s) => s.courseId === activeCourse.id)
        .map((s, i) => ({ session: `#${i + 1}`, mastery: s.mastery, confidence: s.confidence })),
    [snapshots, activeCourse.id]
  );

  return (
    <LearnerShell breadcrumb="Progress">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Your Progress</h1>
          <p className="text-xs text-slate-500 mt-0.5">Mastery-based evidence tracking across concepts, procedural execution, and confidence levels.</p>
        </div>
        <MasteryLegendBar />

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Mastery &amp; Confidence Trend (profile snapshots)</h2>
          {trend.length < 2 ? (
            <p className="text-xs text-slate-400 py-10 text-center">
              Complete assessments to build your trend. Each assessment adds a time-stamped snapshot.
            </p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="session" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="mastery" name="Mastery %" stroke="#0052CC" strokeWidth={3} />
                  <Line type="monotone" dataKey="confidence" name="Confidence %" stroke="#0D9488" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Per-Topic Mastery Breakdown</h2>
          {topics.map((t) => (
            <div key={t.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-900">{t.title}</div>
                <div className="text-xs text-slate-500">Confidence: {t.confidence}%</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-extrabold text-slate-900">{t.mastery}%</span>
                <MasteryBadge status={t.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </LearnerShell>
  );
};

export const AssessmentHistoryPage: React.FC = () => {
  const { assessments, activeCourse } = useApp();
  const rows = assessments.filter((a) => a.courseId === activeCourse.id);

  return (
    <LearnerShell breadcrumb="Assessment History">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Assessment History</h1>
          <p className="text-xs text-slate-500 mt-0.5">Review your diagnostic and micro-assessment activity for {activeCourse.name}.</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto">
          {rows.length === 0 ? (
            <p className="text-xs text-slate-400 py-12 text-center">
              No assessments yet. <Link to="/onboarding" className="text-[#0052CC] font-bold">Start the diagnostic</Link> or take a micro-assessment from any topic.
            </p>
          ) : (
            <table className="w-full text-left border-collapse text-xs min-w-[560px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                  <th className="py-3.5 px-5">Assessment Type</th>
                  <th className="py-3.5 px-5">Topic / Track</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Score</th>
                  <th className="py-3.5 px-5">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-4 px-5 font-bold text-slate-900">{r.type}</td>
                    <td className="py-4 px-5 text-slate-700">{r.title}</td>
                    <td className="py-4 px-5 text-slate-500">{new Date(r.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                    <td className="py-4 px-5 font-bold text-[#0052CC]">{Math.round((r.correct / Math.max(1, r.total)) * 100)}% ({r.correct}/{r.total})</td>
                    <td className="py-4 px-5 text-slate-600">{r.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </LearnerShell>
  );
};

export const ProfileAndCertificatesPage: React.FC = () => {
  const { user, certificates } = useApp();
  const [previewCertId, setPreviewCertId] = useState<string | null>(null);
  const previewCert = certificates.find((c) => c.certificateId === previewCertId);
  const mine = certificates.filter((c) => c.learnerName === user?.name);

  return (
    <LearnerShell breadcrumb="Profile & Certificates">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0052CC] text-white text-lg font-extrabold flex items-center justify-center">{user?.avatarInitials}</div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{user?.name}</h1>
              <p className="text-xs text-slate-500">@{user?.username} • Independent Learner • Streak: {user?.streakDays} days</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link to={`/u/${user?.username}`} className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              <span>View Public Profile</span>
            </Link>
            <Link to="/learners" className="px-4 py-2.5 rounded-xl bg-[#0052CC] text-white text-xs font-bold">Find a Learner</Link>
          </div>
        </div>

        {previewCert && (
          <div className="bg-white rounded-2xl border-2 border-[#0052CC] p-8 space-y-5 shadow-md print:border-0 print:shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#0052CC]">OFFICIAL ACADEMIC CREDENTIAL • LEARNOVA PLATFORM</div>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">Certificate of {previewCert.tier} — {previewCert.courseCode} {previewCert.courseName}</h3>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <button onClick={() => window.print()} className="px-3.5 py-2 rounded-xl bg-[#0052CC] text-white text-xs font-bold cursor-pointer">Print / Save PDF</button>
                <button onClick={() => setPreviewCertId(null)} className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer">Close ✕</button>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This certifies that <strong className="text-slate-900">{previewCert.learnerName}</strong> has demonstrated{' '}
              <strong>{previewCert.tier} ({previewCert.score}%)</strong> proficiency in <strong>{previewCert.courseName}</strong> through
              Bayesian Knowledge Tracing micro-assessments across the curriculum knowledge graph.
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <span>Verification ID: <strong className="font-mono text-slate-900">{previewCert.certificateId}</strong></span>
              <span>Issued: {previewCert.issueDate}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-base font-extrabold text-slate-900">Verified Academic Certificates</h2>
          {mine.length === 0 ? (
            <p className="text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 p-6">
              No certificates yet. Reach ≥70% mastery to earn a Completed certificate, ≥90% for Mastered.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {mine.map((cert) => (
                <div key={cert.certificateId} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#0052CC] font-bold text-xs">{cert.certificateId}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px]">{cert.tier} ({cert.score}%)</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400">{cert.courseCode}</div>
                    <h3 className="text-lg font-extrabold text-slate-900">{cert.courseName}</h3>
                    <p className="text-xs text-slate-500 mt-1">{cert.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button onClick={() => setPreviewCertId(cert.certificateId)} className="font-bold text-slate-700 hover:text-[#0052CC] underline cursor-pointer">Preview &amp; Print PDF</button>
                    <Link to={`/verify?id=${cert.certificateId}`} className="font-bold text-[#0052CC] hover:underline">Verify Credential →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LearnerShell>
  );
};
