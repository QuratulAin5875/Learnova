import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  Clock,
  Code2,
  Flag,
  GraduationCap,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Send,
  Sparkles,
} from 'lucide-react';
import { BrandLogo, MasteryLegendBar } from '../components/BrandUI';
import { LearnerShell } from '../components/Layouts';
import { useApp } from '../context/AppContext';
import {
  bktUpdate,
  classifyErrorType,
  QUESTION_BANK,
  selectNextDifficulty,
  statusFromMastery,
  type ConfidenceLevel,
  type DiagnosticQuestion,
  type DifficultyTier,
  type ErrorType,
} from '../data/mockData';
import { sanitizeText } from '../lib/api';
import { createClientId, enqueueAnswer, removeQueuedAnswer } from '../lib/offlineQueue';

const TREE_TOPICS = new Set(['dsa-bst', 'dsa-tree-traversal']);
const CONF_SCORE: Record<ConfidenceLevel, number> = { low: 35, medium: 65, high: 90 };
const DIFF_ORDER: DifficultyTier[] = ['easy', 'medium', 'hard'];

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  time: string;
  text: string;
}

const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** Picks the next unused question, preferring the target difficulty then the nearest one. */
function pickQuestion(
  pool: DiagnosticQuestion[],
  usedIds: string[],
  target: DifficultyTier
): DiagnosticQuestion | undefined {
  const unused = pool.filter((q) => !usedIds.includes(q.id));
  if (unused.length === 0) return undefined;
  const t = DIFF_ORDER.indexOf(target);
  return [...unused].sort(
    (a, b) =>
      Math.abs(DIFF_ORDER.indexOf(a.difficulty) - t) - Math.abs(DIFF_ORDER.indexOf(b.difficulty) - t)
  )[0];
}

export const OnboardingPage: React.FC = () => {
  const { user, logout, updateUserProfile, setActiveCourseId, courses, allTopics, showFigmaPresets } =
    useApp();
  const navigate = useNavigate();
  const firstName = user?.name.split(' ')[0] || 'there';

  const [mode, setMode] = useState<'chat' | 'form'>('chat');
  const [step, setStep] = useState<1 | 2>(1);

  const [eduLevel, setEduLevel] = useState(user?.educationLevel ?? '');
  const [priorExp, setPriorExp] = useState(user?.priorExperience ?? '');
  const [goal, setGoal] = useState(user?.learningGoal ?? '');
  const [chatInput, setChatInput] = useState('');
  const [stage, setStage] = useState<'background' | 'goal' | 'done'>(
    user?.learningGoal ? 'done' : user?.priorExperience ? 'goal' : 'background'
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const m: ChatMessage[] = [
      {
        id: 'm1',
        sender: 'ai',
        time: nowTime(),
        text: `Hi ${firstName}! To establish your baseline, what is your current academic background and prior coding experience?`,
      },
    ];
    if (user?.priorExperience) {
      m.push({ id: 'm2', sender: 'user', time: nowTime(), text: user.priorExperience });
      m.push({
        id: 'm3',
        sender: 'ai',
        time: nowTime(),
        text: 'Got it. What is your primary learning objective with Learnova this term?',
      });
    }
    if (user?.learningGoal) m.push({ id: 'm4', sender: 'user', time: nowTime(), text: user.learningGoal });
    return m;
  });

  const [selectedCourseId, setSelectedCourseId] = useState(user?.activeCourseId ?? 'cs-250');
  const courseTopics = useMemo(
    () => allTopics.filter((t) => t.subjectId === selectedCourseId),
    [allTopics, selectedCourseId]
  );
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(() =>
    allTopics
      .filter((t) => t.subjectId === (user?.activeCourseId ?? 'cs-250'))
      .slice(0, 3)
      .map((t) => t.id)
  );

  const selectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedTopicIds(
      allTopics
        .filter((t) => t.subjectId === courseId)
        .slice(0, 3)
        .map((t) => t.id)
    );
  };

  const questionCount = useMemo(() => {
    const n = QUESTION_BANK.filter(
      (q) => q.subjectId === selectedCourseId && selectedTopicIds.includes(q.topicId)
    ).length;
    return Math.min(8, n);
  }, [selectedCourseId, selectedTopicIds]);

  const toggleTopic = (id: string) =>
    setSelectedTopicIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const text = sanitizeText(chatInput, 400);
    if (!text) return;
    const t = nowTime();
    setChatInput('');
    const next: ChatMessage[] = [{ id: `u_${Date.now()}`, sender: 'user', time: t, text }];
    let reply = '';

    if (stage === 'background') {
      const yr = text.match(/(\d)(?:st|nd|rd|th)\s+year/i);
      setPriorExp(text);
      setEduLevel(yr ? `${yr[1]}${['st', 'nd', 'rd', 'th'][+yr[1] - 1] ?? 'th'} Year Student` : 'Self-described learner');
      setStage('goal');
      reply = 'Got it. What is your primary learning objective with Learnova this term?';
    } else {
      setGoal(text);
      setStage('done');
      const lower = text.toLowerCase();
      let track = selectedCourseId;
      if (/\boop\b|object|class|inherit/.test(lower)) track = 'cs-201';
      else if (/dynamic programming|np-|complexity|design and analysis|daa/.test(lower)) track = 'cs-310';
      else if (/beginner|fundamental|basics|pointer/.test(lower)) track = 'cs-101';
      else if (/data structure|dsa|tree|graph|linked|array/.test(lower)) track = 'cs-250';
      setSelectedCourseId(track);
      const name = courses.find((c) => c.id === track)?.name ?? 'your track';
      reply = `Thanks! I've updated your calibration summary and pre-selected ${name}. Review the summary card below and confirm when ready.`;
    }
    setMessages((prev) => [...prev, ...next]);
    setTimeout(
      () => setMessages((prev) => [...prev, { id: `ai_${Date.now()}`, sender: 'ai', time: t, text: reply }]),
      350
    );
  };

  const canConfirm = eduLevel.trim() && priorExp.trim() && goal.trim();

  const handleConfirmStep1 = () => {
    if (!canConfirm) return;
    updateUserProfile({
      educationLevel: sanitizeText(eduLevel, 120),
      priorExperience: sanitizeText(priorExp, 400),
      learningGoal: sanitizeText(goal, 400),
    });
    setStep(2);
  };

  const handleStartDiagnostic = () => {
    if (selectedTopicIds.length === 0 || questionCount === 0) return;
    setActiveCourseId(selectedCourseId);
    updateUserProfile({ onboardingCompleted: true, activeCourseId: selectedCourseId });
    navigate('/diagnostic', { state: { topicIds: selectedTopicIds } });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <button
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-950 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Diagnostic Setup</span>
          </button>
          <button onClick={handleLogout} className="text-xs text-slate-500 hover:underline cursor-pointer">
            Exit to Login
          </button>
        </header>

        <main className="max-w-6xl w-full mx-auto px-6 py-8 space-y-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0052CC] font-bold text-[11px] uppercase">
                STEP 2 OF 4
              </span>
              <span className="text-xs text-slate-500 font-medium">Adaptive Scope Configuration</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Learning Scope &amp; Topic Selection</h1>
            <p className="text-xs text-slate-600 max-w-2xl">
              Select one core curriculum track, then pick the specific focus topics you want evaluated.
              Learnova configures your diagnostic questions based on your active selections.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">1. Select Core Computer Science Track</h2>
                  <span className="text-xs text-slate-500">Select 1 active course track</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {courses.map((c) => {
                    const isSelected = c.id === selectedCourseId;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectCourse(c.id)}
                        aria-pressed={isSelected}
                        className={`relative text-left rounded-2xl p-5 transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-white border-2 border-[#0052CC] shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#0052CC]">{c.code}</span>
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-[#0052CC] text-white' : 'border border-slate-300 bg-slate-100'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">{c.name}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed mb-4">{c.description}</p>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#0052CC]">
                          <span>{c.topicCount} Master Topics Available</span>
                          <span>{isSelected ? 'Active Scope ✓' : 'Select →'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">2. Select Focus Sub-Topics</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose multiple focus topics to include in this diagnostic.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0052CC]">
                    <button
                      type="button"
                      onClick={() => setSelectedTopicIds(courseTopics.map((t) => t.id))}
                      className="underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTopicIds([])}
                      className="text-slate-500 underline cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {courseTopics.map((t) => {
                    const active = selectedTopicIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTopic(t.id)}
                        aria-pressed={active}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                          active ? 'bg-[#0052CC] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-xs flex items-center justify-center border ${
                            active ? 'bg-white text-[#0052CC] border-white' : 'border-slate-400'
                          }`}
                        >
                          {active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </span>
                        <span>{t.title}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-l-sky-400 flex items-start gap-3">
                  <Brain className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-600">
                    <div className="font-bold text-teal-900 mb-0.5">Diagnostic Adaptivity Vector</div>
                    {selectedTopicIds.length === 0
                      ? 'Select at least one topic to configure the diagnostic.'
                      : `With ${selectedTopicIds.length} focus topic${selectedTopicIds.length > 1 ? 's' : ''} selected, questions will adapt in difficulty as you answer.`}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 lg:sticky lg:top-20">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Diagnostic Scope Summary</h3>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-[#0052CC] font-bold text-xs">
                  {selectedTopicIds.length} Selected
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 min-h-12">
                {selectedTopicIds.length === 0 && <span className="text-xs text-slate-400">No topics selected</span>}
                {courseTopics
                  .filter((t) => selectedTopicIds.includes(t.id))
                  .map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-[#0052CC]" />
                      {t.title}
                    </div>
                  ))}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700">Diagnostic Questions</span>
                  <span className="text-[#0052CC]">{questionCount}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0052CC] rounded-full transition-all"
                    style={{ width: `${(questionCount / 8) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#0052CC]" />
                <div>
                  <div className="text-[11px] text-slate-500">Estimated completion time</div>
                  <div className="text-sm font-extrabold text-slate-900">~{Math.max(2, questionCount)}–{Math.max(4, questionCount + 2)} mins</div>
                </div>
              </div>

              <button
                onClick={handleStartDiagnostic}
                disabled={selectedTopicIds.length === 0 || questionCount === 0}
                className="w-full py-3 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Start Adaptive Diagnostic</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {questionCount === 0 && selectedTopicIds.length > 0 && (
                <p className="text-[11px] text-amber-700 text-center">
                  The question bank has no items for these topics yet. Pick other topics.
                </p>
              )}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Lock className="w-3 h-3" />
                <span>Settings will be locked upon starting test</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <BrandLogo variant="letter" />
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-[#0052CC]" />
          <span className="w-5 h-1.5 rounded-full bg-[#0052CC]" />
          <span className="w-2 h-2 rounded-full bg-slate-200" />
          <span className="w-2 h-2 rounded-full bg-slate-200" />
          <span className="ml-2">Onboarding Assessment</span>
        </div>
        <Link to="/help" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800">
          <span>Need assistance?</span>
          <HelpCircle className="w-4 h-4" />
        </Link>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 space-y-5">
        {showFigmaPresets && (
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs">
            <span className="text-slate-500 font-medium">Figma Onboarding Modes: AI Assistant (p17) vs Form Fallback (p16)</span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
              {(['chat', 'form'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    mode === m ? 'bg-white text-[#0052CC] shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {m === 'chat' ? 'AI Chat Assistant (p17)' : 'Form Fallback (p16)'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#0052CC] text-white text-xs font-bold flex items-center justify-center">1</div>
            <div className="leading-tight">
              <div className="text-xs font-bold text-slate-900">Step 1 of 4</div>
              <div className="text-[11px] text-slate-500">Profile Onboarding</div>
            </div>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer">
            <span>Log out</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-7 space-y-6 shadow-2xs">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#0052CC]" />
              <span>{mode === 'chat' ? 'AI ACADEMIC ASSISTANT' : 'STANDARD ONBOARDING MODE'}</span>
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Welcome, {firstName}. Let&apos;s calibrate your learning path.
            </h1>
            <p className="text-xs text-slate-600">
              Answer a few quick questions about your background and target goals so Learnova can tailor your
              curriculum and diagnostic scope.
            </p>
          </div>

          {mode === 'chat' ? (
            <div className="space-y-4">
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1" aria-live="polite">
                {messages.map((m) =>
                  m.sender === 'ai' ? (
                    <div key={m.id} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0 mt-1">
                        <Brain className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1 max-w-lg">
                        <div className="text-[11px] font-bold text-slate-700">
                          Learnova Core <span className="text-slate-400 font-normal ml-1">{m.time}</span>
                        </div>
                        <div className="p-3.5 rounded-2xl rounded-tl-xs bg-slate-100 text-xs text-slate-800">{m.text}</div>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="flex items-start justify-end gap-3">
                      <div className="space-y-1 max-w-lg text-right">
                        <div className="text-[11px] font-bold text-slate-700">
                          <span className="text-slate-400 font-normal mr-1">{m.time}</span> {user?.name}
                        </div>
                        <div className="p-3.5 rounded-2xl rounded-tr-xs bg-slate-200/80 text-xs text-slate-900 text-left">{m.text}</div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#0052CC] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-1">
                        {user?.avatarInitials}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="rounded-2xl border-2 border-[#0052CC] bg-slate-50/70 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900">Profile Summary &amp; Calibration Result</span>
                  <Sparkles className="w-4 h-4 text-[#0052CC]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-[#0052CC]" /> Current Academic Level
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">{eduLevel || '—'}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <Code2 className="w-3 h-3 text-[#0052CC]" /> Prior Experience
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">{priorExp || '—'}</div>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <Flag className="w-3 h-3 text-[#0052CC]" /> Target Objective
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1">{goal || '—'}</div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setMode('form')}
                    className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Edit Responses
                  </button>
                  <button
                    type="button"
                    disabled={!canConfirm}
                    onClick={handleConfirmStep1}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Confirm &amp; Continue to Topic Selection</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  maxLength={400}
                  aria-label="Type your answer"
                  placeholder={stage === 'background' ? 'Describe your background...' : stage === 'goal' ? 'Describe your learning goal...' : 'Update your goal (e.g. "I want to learn OOP classes")...'}
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#0052CC]"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] text-white cursor-pointer"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-3">
                <Info className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Assistant Temporarily Unavailable</div>
                  <p className="text-slate-600 mt-0.5">
                    Our conversational AI assistant is offline right now. Please fill in this short form instead
                    to complete your calibration without interruption.
                  </p>
                </div>
              </div>
              {[
                { label: 'Education level', value: eduLevel, set: setEduLevel, rows: 1 },
                { label: 'Prior experience', value: priorExp, set: setPriorExp, rows: 2 },
                { label: 'Learning goal', value: goal, set: setGoal, rows: 2 },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">{f.label}</label>
                  <textarea
                    rows={f.rows}
                    value={f.value}
                    maxLength={400}
                    onChange={(e) => f.set(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#0052CC]"
                  />
                </div>
              ))}
              <button
                type="button"
                disabled={!canConfirm}
                onClick={handleConfirmStep1}
                className="w-full py-3 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Topic Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

interface SignalRecord {
  questionId: string;
  topicId: string;
  topicName: string;
  correct: boolean;
  confidence: ConfidenceLevel;
  responseSec: number;
  revisions: number;
  difficulty: DifficultyTier;
  errorType?: ErrorType;
}

const BST_DIAGRAM = (
  <svg viewBox="0 0 420 140" className="w-full h-32" role="img" aria-label="Binary search tree with root 50">
    <g stroke="#94A3B8" strokeWidth="1.5">
      <line x1="210" y1="30" x2="130" y2="75" strokeDasharray="3 3" />
      <line x1="210" y1="30" x2="290" y2="75" strokeDasharray="3 3" />
      <line x1="130" y1="75" x2="90" y2="120" stroke="#CBD5E1" />
      <line x1="130" y1="75" x2="170" y2="120" stroke="#CBD5E1" />
      <line x1="290" y1="75" x2="330" y2="120" stroke="#CBD5E1" />
    </g>
    <circle cx="210" cy="30" r="16" fill="#0052CC" />
    <text x="210" y="34" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">50</text>
    {[
      [130, 75, 30, 14],
      [290, 75, 70, 14],
    ].map(([x, y, v, r]) => (
      <g key={v}>
        <circle cx={x} cy={y} r={r} fill="#E2E8F0" stroke="#64748B" />
        <text x={x} y={y + 4} textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="bold">{v}</text>
      </g>
    ))}
    {[
      [90, 120, 20],
      [170, 120, 40],
      [330, 120, 85],
    ].map(([x, y, v]) => (
      <g key={v}>
        <circle cx={x} cy={y} r="11" fill="#F1F5F9" />
        <text x={x} y={y + 4} textAnchor="middle" fill="#334155" fontSize="9">{v}</text>
      </g>
    ))}
  </svg>
);

export const DiagnosticPage: React.FC = () => {
  const { activeCourse, topics, updateTopicMastery } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const chosenTopicIds = (location.state as { topicIds?: string[] } | null)?.topicIds;

  const pool = useMemo(() => {
    const own = QUESTION_BANK.filter((q) => q.subjectId === activeCourse.id);
    const scoped = chosenTopicIds?.length ? own.filter((q) => chosenTopicIds.includes(q.topicId)) : own;
    return scoped.length ? scoped : own;
  }, [activeCourse.id, chosenTopicIds]);
  const total = Math.min(8, pool.length);

  const [usedIds, setUsedIds] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<DifficultyTier>('medium');
  const [question, setQuestion] = useState<DiagnosticQuestion | undefined>(() => pickQuestion(pool, [], 'medium'));
  const [signals, setSignals] = useState<SignalRecord[]>([]);
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [revisions, setRevisions] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [completed, setCompleted] = useState(false);
  const startedAt = useRef<number>(0);
  const assessmentId = useRef(createClientId());
  const queuedIds = useRef<string[]>([]);

  const index = signals.length; // 0-based position of the current question

  useEffect(() => {
    if (completed) return;
    startedAt.current = Date.now();
    const t = setInterval(() => setElapsedSec(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [completed, question?.id]);

  const resetQuestionSignals = () => {
    startedAt.current = Date.now();
    setElapsedSec(0);
    setRevisions(0);
    setSelected(null);
    setConfidence(null);
  };

  const choose = (opt: 'A' | 'B' | 'C' | 'D') => {
    if (selected && opt !== selected) setRevisions((r) => r + 1);
    setSelected(opt);
  };

  const finish = (all: SignalRecord[]) => {
    const byTopic = new Map<string, SignalRecord[]>();
    all.forEach((s) => byTopic.set(s.topicId, [...(byTopic.get(s.topicId) ?? []), s]));
    byTopic.forEach((list, topicId) => {
      let p = 0.45;
      list.forEach((s) => (p = bktUpdate(p, s.correct, s.difficulty)));
      const conf = Math.round(list.reduce((a, s) => a + CONF_SCORE[s.confidence], 0) / list.length);
      updateTopicMastery(topicId, Math.round(p * 100), conf);
    });
    // Placeholder for POST /assessments/{id}/complete: answers are acknowledged, so clear the offline queue.
    queuedIds.current.forEach(removeQueuedAnswer);
    queuedIds.current = [];
    setCompleted(true);
  };

  const handleNext = () => {
    if (!question || !selected || !confidence) return;
    const correct = selected === question.correctOption;
    const record: SignalRecord = {
      questionId: question.id,
      topicId: question.topicId,
      topicName: question.topicName,
      correct,
      confidence,
      responseSec: elapsedSec,
      revisions,
      difficulty,
      errorType: correct ? undefined : classifyErrorType(elapsedSec, confidence, revisions),
    };

    // Idempotent offline-safe submission (NFR04): queue first; flushed when the backend acknowledges.
    const clientId = createClientId();
    queuedIds.current.push(clientId);
    enqueueAnswer({
      clientId,
      assessmentId: assessmentId.current,
      questionId: question.id,
      answer: selected,
      confidence,
      responseMs: elapsedSec * 1000,
      revisions,
      queuedAt: new Date().toISOString(),
    });

    const nextSignals = [...signals, record];
    const nextUsed = [...usedIds, question.id];
    setSignals(nextSignals);
    setUsedIds(nextUsed);

    const nextDifficulty = selectNextDifficulty(difficulty, correct, confidence);
    const nextQuestion = nextSignals.length < total ? pickQuestion(pool, nextUsed, nextDifficulty) : undefined;
    if (!nextQuestion) {
      finish(nextSignals);
      return;
    }
    setDifficulty(nextDifficulty);
    setQuestion(nextQuestion);
    resetQuestionSignals();
  };

  const handlePrevious = () => {
    if (index === 0) return;
    const prev = signals[index - 1];
    const prevQuestion = pool.find((q) => q.id === prev.questionId);
    if (!prevQuestion) return;
    setSignals(signals.slice(0, index - 1));
    setUsedIds(usedIds.slice(0, index - 1));
    setDifficulty(prev.difficulty);
    setQuestion(prevQuestion);
    resetQuestionSignals();
  };

  if (!question && !completed) {
    return (
      <LearnerShell breadcrumb="Diagnostic">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto space-y-3">
          <h1 className="text-lg font-extrabold text-slate-900">No questions available yet</h1>
          <p className="text-xs text-slate-500">
            The question bank has no items for {activeCourse.name}. An administrator can add them in the Admin Console.
          </p>
          <Link to="/dashboard" className="inline-block px-4 py-2.5 rounded-xl bg-[#0052CC] text-white text-xs font-bold">
            Back to Dashboard
          </Link>
        </div>
      </LearnerShell>
    );
  }

  if (completed) {
    const correctCount = signals.filter((s) => s.correct).length;
    const accuracy = Math.round((correctCount / Math.max(1, signals.length)) * 100);
    const avgSec = (signals.reduce((a, s) => a + s.responseSec, 0) / Math.max(1, signals.length)).toFixed(1);
    const avgConf = Math.round(signals.reduce((a, s) => a + CONF_SCORE[s.confidence], 0) / Math.max(1, signals.length));
    const count = (t: ErrorType) => signals.filter((s) => s.errorType === t).length;

    const rows = [...new Set(signals.map((s) => s.topicId))].map((id) => {
      const node = topics.find((t) => t.id === id);
      return { id, title: node?.title ?? signals.find((s) => s.topicId === id)!.topicName, sub: node?.competencies.join(', ') ?? '', mastery: node?.mastery ?? 0 };
    });
    const gaps = rows.filter((r) => r.mastery < 70);
    const weakest = [...rows].sort((a, b) => a.mastery - b.mastery)[0];
    const tag = (m: number) => {
      const s = statusFromMastery(m);
      return s === 'mastered'
        ? { label: 'MASTERED', bar: 'bg-[#0052CC]' }
        : s === 'completed'
        ? { label: 'COMPLETED', bar: 'bg-[#4F46E5]' }
        : { label: 'NOT COMPLETED', bar: 'bg-red-600' };
    };
    const tier = statusFromMastery(accuracy);

    return (
      <LearnerShell breadcrumb="Initial Diagnostic Benchmark">
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#0052CC] font-bold text-[11px] uppercase">
                POST-ONBOARDING INITIAL BASELINE
              </span>
              <span className="text-xs text-slate-500">
                Active Course Track: <strong>{activeCourse.name} ({activeCourse.shortName})</strong>
              </span>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#0052CC]">
                INITIAL DIAGNOSTIC / LEARNER DIAGNOSTIC BENCHMARK
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 mt-1">
                Initial Diagnostic Baseline: {activeCourse.name}
              </h1>
              <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                This initial baseline diagnostic assesses your current foundational understanding as a starting
                benchmark. It does not confer permanent certification; proficiency evolves through continuous
                practice on your personalized roadmap.
              </p>
            </div>
            <MasteryLegendBar />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-500">OVERALL DIAGNOSTIC SCORE</div>
              <div className="text-2xl font-extrabold text-slate-900">{accuracy}%</div>
              <div className="text-xs text-slate-500">{correctCount} of {signals.length} correct · avg {avgSec}s</div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#0052CC]" style={{ width: `${accuracy}%` }} /></div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-500">{activeCourse.shortName} BASELINE TIER</div>
              <div className="text-base font-extrabold text-[#0052CC]">
                {tier === 'mastered' ? 'Mastered' : tier === 'completed' ? 'Completed' : 'Foundational'} ({accuracy}%)
              </div>
              <div className="text-xs text-slate-500">Completed tier (70%–89%) • Requires ≥90% for Mastered</div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-[#4F46E5]" style={{ width: `${accuracy}%` }} /></div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-500">CONFIDENCE REFLECTION</div>
              <div className="text-2xl font-extrabold text-teal-700">{avgConf}% {avgConf >= 75 ? 'High' : avgConf >= 50 ? 'Medium' : 'Low'}</div>
              <div className="text-xs text-slate-500">Self-reported confidence rating across questions</div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal-600" style={{ width: `${avgConf}%` }} /></div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-500">CRITICAL PRIORITY</div>
              <div className="text-2xl font-extrabold text-red-600">{gaps.length} Topic{gaps.length === 1 ? '' : 's'}</div>
              <div className="text-xs text-slate-500">Knowledge Gaps Requiring Focus (&lt;70%)</div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-red-600" style={{ width: `${(gaps.length / Math.max(1, rows.length)) * 100}%` }} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Topic-Level Baseline Breakdown</h2>
                  <p className="text-xs text-slate-500">Compared with mastery thresholds</p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600">{rows.length} Tested Modules</span>
              </div>
              {rows.map((row, i) => {
                const tg = tag(row.mastery);
                return (
                  <div key={row.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{String(i + 1).padStart(2, '0')} • {row.title}</div>
                        <div className="text-xs text-slate-500">{row.sub}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-slate-900 mr-2">{row.mastery}%</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${tg.bar}`}>{tg.label}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden"><div className={`h-full ${tg.bar}`} style={{ width: `${row.mastery}%` }} /></div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Categorized Error-Type Summary</h3>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-semibold">{signals.length - correctCount} Errors Total</span>
                </div>
                {([
                  ['conceptual', 'Conceptual Errors', 'bg-red-50/60 border-red-200 text-red-900', 'Misconceptions held with confidence or after long hesitation.'],
                  ['procedural', 'Procedural Errors', 'bg-indigo-50/60 border-indigo-200 text-indigo-900', 'Right idea, but the steps failed (revisions or slow execution).'],
                  ['careless', 'Careless Slips', 'bg-emerald-50/60 border-emerald-200 text-emerald-900', 'Fast, confident answers that were wrong.'],
                ] as const).map(([k, label, cls, desc]) => (
                  <div key={k} className={`p-3 rounded-xl border text-xs space-y-1 ${cls}`}>
                    <div className="flex justify-between font-bold"><span>{label}</span><span>{count(k)}</span></div>
                    <p className="text-slate-600">{desc}</p>
                  </div>
                ))}
              </div>

              {weakest && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <div className="text-xs font-bold uppercase text-[#0052CC]">CURRICULUM ACTION PLAN</div>
                  <div className="text-sm font-extrabold text-slate-900">Recommended Starting Node: {weakest.title} ({weakest.mastery}%)</div>
                  <p className="text-xs text-slate-600">
                    {weakest.mastery < 70
                      ? 'Raising this topic to ≥70% is required to unlock the topics that depend on it.'
                      : 'Great baseline. Continue to your roadmap to push topics toward Mastered (≥90%).'}
                  </p>
                  <button
                    onClick={() => navigate('/roadmap')}
                    className="w-full py-2.5 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Open My Roadmap</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </LearnerShell>
    );
  }

  const q = question!;
  const progress = ((index + 1) / total) * 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#0052CC] text-white font-bold flex items-center justify-center">L</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">Learnova</span>
                <span className="text-[11px] font-bold text-teal-700 uppercase">• DIAGNOSTIC MODE</span>
              </div>
              <div className="text-xs text-slate-500">Diagnostic Assessment • {activeCourse.name}</div>
            </div>
          </div>
          <div className="w-56 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#0052CC]">QUESTION {index + 1} OF {total}</span>
              <span className="text-slate-500">{progress.toFixed(1)}% Complete</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-[#0052CC] rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-7 space-y-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
              DIAGNOSTIC QUESTION {index + 1} OF {total} • ADAPTIVE LEVEL: {difficulty.toUpperCase()}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              Difficulty: <strong className="capitalize">{q.difficulty}</strong>
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-snug">{q.stem}</h1>
            <p className="text-xs text-slate-500">{q.hint}</p>
          </div>

          {TREE_TOPICS.has(q.topicId) && (
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5">
              <div className="flex items-center justify-between text-[11px] font-bold text-teal-800 uppercase mb-3">
                <span>CANONICAL BST REFERENCE TOPOLOGY</span>
                <span className="text-slate-400 font-normal normal-case">Subtree ordering constraint invariant</span>
              </div>
              {BST_DIAGRAM}
            </div>
          )}

          <div className="space-y-3" role="radiogroup" aria-label="Answer options">
            {q.options.map((opt) => {
              const active = selected === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => choose(opt.id)}
                  className={`w-full p-4 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer border ${
                    active ? 'bg-[#0052CC] text-white border-[#0052CC] shadow-sm' : 'bg-slate-50/80 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${active ? 'bg-white text-[#0052CC]' : 'bg-slate-200 text-slate-700'}`}>
                      {opt.id}
                    </span>
                    <span className="text-sm font-semibold">{opt.text}</span>
                  </div>
                  <span className={`w-4 h-4 rounded-full border-2 ${active ? 'border-white bg-[#0052CC]' : 'border-slate-300'}`} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" />
              <span>SELF ASSESSMENT</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900">How confident are you in this answer?</h2>
            <p className="text-xs text-slate-500">Your confidence helps us understand how certain you feel about your answer.</p>
            <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Confidence">
              {(['low', 'medium', 'high'] as ConfidenceLevel[]).map((lvl) => {
                const active = confidence === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setConfidence(lvl)}
                    className={`py-3.5 px-2 rounded-xl text-xs font-bold capitalize flex flex-col items-center gap-1.5 border transition-all cursor-pointer ${
                      active ? 'bg-[#0052CC] text-white border-[#0052CC] shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-sm">{lvl === 'low' ? '▮▯▯' : lvl === 'medium' ? '▮▮▯' : '▮▮▮'}</span>
                    <span>{lvl}</span>
                  </button>
                );
              })}
            </div>
            <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-700 shrink-0" />
              <span>Question difficulty adapts after each submission.</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 text-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">DIAGNOSTIC PROFILE (LIVE SIGNALS)</div>
            <div className="flex justify-between py-1"><span className="text-slate-500">Response Timer</span><span className="font-bold text-slate-900 tabular-nums">{String(Math.floor(elapsedSec / 60)).padStart(2, '0')}:{String(elapsedSec % 60).padStart(2, '0')}</span></div>
            <div className="flex justify-between py-1"><span className="text-slate-500">Answer Revisions</span><span className="font-bold text-slate-900">{revisions}</span></div>
            <div className="flex justify-between py-1"><span className="text-slate-500">Questions Answered</span><span className="font-bold text-slate-900">{index} / {total}</span></div>
            <div className="flex justify-between py-1"><span className="text-slate-500">Session Mode</span><span className="font-bold text-[#0052CC]">Adaptive Pre-test</span></div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 px-6 py-4 mt-auto">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={index === 0}
            onClick={handlePrevious}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-slate-700 cursor-pointer"
          >
            &larr; Previous Question (Review)
          </button>
          <div className="flex items-center gap-3">
            {(!selected || !confidence) && (
              <span className="hidden sm:inline text-[11px] text-slate-400">
                {!selected ? 'Select an answer' : 'Rate your confidence'} to continue
              </span>
            )}
            <button
              type="button"
              disabled={!selected || !confidence}
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>{index + 1 >= total ? 'Finish & View Baseline Benchmark' : 'Submit & Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
