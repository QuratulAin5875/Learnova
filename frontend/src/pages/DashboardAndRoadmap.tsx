import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ExternalLink,
  Flame,
  GraduationCap,
  Info,
  Lock,
  Network,
  PlayCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { LearnerShell } from '../components/Layouts';
import { MasteryBadge, MasteryLegendBar } from '../components/BrandUI';
import { useApp } from '../context/AppContext';
import { pickActiveTopic, type TopicNode } from '../data/mockData';

const statusBar = (s: TopicNode['status']) =>
  s === 'mastered' ? 'bg-[#0052CC]' : s === 'completed' ? 'bg-[#4F46E5]' : s === 'not_completed' ? 'bg-red-600' : 'bg-slate-300';

export const DashboardPage: React.FC = () => {
  const { user, activeCourse, topics } = useApp();
  const navigate = useNavigate();
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  });

  const active = pickActiveTopic(topics);
  const activeIdx = active ? topics.findIndex((t) => t.id === active.id) : -1;
  const masteredCount = topics.filter((t) => t.status === 'mastered').length;
  const weakest = [...topics]
    .filter((t) => t.status === 'not_completed' && t.mastery > 0)
    .sort((a, b) => a.mastery - b.mastery)[0];
  const activity = [...topics]
    .filter((t) => t.mastery > 0)
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, 3);

  return (
    <LearnerShell breadcrumb="Dashboard">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-slate-500">Dashboard</div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Good {greeting}, {user?.name.split(' ')[0]}
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <Flame className="w-4 h-4 text-[#0052CC] fill-[#0052CC]" />
            <span>
              Current Streak: <strong className="text-[#0052CC]">{user?.streakDays} days</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: GraduationCap, color: 'bg-[#0052CC]', label: 'Overall', value: `${activeCourse.overallMastery}%`, caption: 'MASTERY', pct: activeCourse.overallMastery, bar: 'bg-[#0052CC]' },
            { icon: Brain, color: 'bg-[#4F46E5]', label: 'Self-Reported', value: `${activeCourse.overallConfidence}%`, caption: 'CONFIDENCE', pct: activeCourse.overallConfidence, bar: 'bg-[#4F46E5]' },
            { icon: BookOpen, color: 'bg-teal-700', label: 'Progress', value: `${masteredCount}/${topics.length}`, caption: 'TOPICS MASTERED', pct: (masteredCount / Math.max(1, topics.length)) * 100, bar: 'bg-teal-700' },
          ].map((c) => (
            <div key={c.caption} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-full ${c.color} text-white flex items-center justify-center`}>
                  <c.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-slate-500">{c.label}</span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{c.value}</div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">{c.caption}</div>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${c.bar} rounded-full`} style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}

          <div className="rounded-2xl bg-linear-to-br from-[#7DD3FC] to-[#38BDF8] p-5 text-slate-950 flex flex-col justify-between shadow-xs">
            <div className="space-y-1.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-teal-950 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI INSIGHT</span>
              </div>
              <h3 className="text-sm font-extrabold leading-snug">
                {weakest ? `Review ${weakest.title}` : 'Keep your momentum'}
              </h3>
              <p className="text-xs text-slate-900/80 leading-relaxed">
                {weakest
                  ? `Mastery is ${weakest.mastery}% with ${weakest.confidence}% confidence, below the 70% completion threshold.`
                  : 'No knowledge gaps detected. Push your completed topics toward Mastered (≥90%).'}
              </p>
            </div>
            <button
              onClick={() => navigate('/recommendations')}
              className="mt-4 w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>View Reason</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Current Roadmap Position</h2>
                <p className="text-xs text-slate-500">
                  {activeCourse.name} Curriculum (Topic {Math.max(1, activeIdx + 1)} of {topics.length})
                </p>
              </div>
              <Link to="/roadmap" className="inline-flex items-center gap-1 text-xs font-bold text-[#0052CC] hover:underline">
                <span>Full Roadmap</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {active && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#0052CC] flex items-center justify-center">
                    <Network className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#0052CC]">ACTIVE MODULE</div>
                    <div className="text-base font-extrabold text-slate-900">{active.title}</div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/topics/${active.id}`)}
                  className="px-5 py-2.5 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] text-white text-xs font-bold cursor-pointer"
                >
                  Continue Learning
                </button>
              </div>
            )}

            <div className="overflow-x-auto pb-1">
              <ol className="flex items-start justify-between relative min-w-[420px]">
                <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-slate-200" aria-hidden />
                {topics.map((t) => {
                  const done = t.status === 'completed' || t.status === 'mastered';
                  const current = t.id === active?.id && !done;
                  return (
                    <li key={t.id} className="relative z-10 flex flex-col items-center gap-2 flex-1 px-1 text-center">
                      {done ? (
                        <span className="w-7 h-7 rounded-full bg-[#0052CC] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : current ? (
                        <span className="w-7 h-7 rounded-full bg-white border-4 border-[#0052CC] flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-[#0052CC]" />
                        </span>
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300" />
                      )}
                      <span className={`text-[11px] leading-tight ${current ? 'font-bold text-[#0052CC]' : done ? 'font-medium text-slate-700' : 'text-slate-400'}`}>
                        {t.title.length > 22 ? `${t.title.slice(0, 20)}…` : t.title}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xs">
            <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
            <div className="space-y-4">
              {activity.length === 0 && <p className="text-xs text-slate-400">Complete the diagnostic to see activity.</p>}
              {activity.map((t) => (
                <div key={t.id} className="flex items-start gap-3 text-xs">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{t.title}</div>
                    <div className="text-slate-500">
                      Mastery {t.mastery}% · {t.status === 'mastered' ? 'Mastered' : t.status === 'completed' ? 'Completed' : 'In progress'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/history" className="block text-center text-xs font-bold text-[#0052CC] hover:underline pt-2">
              View All History
            </Link>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
          <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-800">Evidence-Based Personalization:</strong> Your dashboard and roadmap adapt
            in real time based on diagnostic assessments, self-reported confidence, and historical performance data.
          </p>
        </div>
      </div>
    </LearnerShell>
  );
};

export const RoadmapPage: React.FC = () => {
  const { topics, activeCourse } = useApp();
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const navigate = useNavigate();

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) || pickActiveTopic(topics) || topics[0];

  const stages = useMemo(() => {
    const map = new Map<number, { num: number; title: string; items: TopicNode[] }>();
    topics.forEach((t) => {
      const s = map.get(t.stage) ?? { num: t.stage, title: t.stageTitle, items: [] };
      s.items.push(t);
      map.set(t.stage, s);
    });
    return [...map.values()]
      .sort((a, b) => a.num - b.num)
      .map((s) => {
        const allDone = s.items.every((t) => t.status === 'completed' || t.status === 'mastered');
        const allLocked = s.items.every((t) => t.status === 'locked');
        return {
          ...s,
          subtitle: `${s.items.length} topic${s.items.length > 1 ? 's' : ''} · ${s.items.map((t) => t.tier).filter((v, i, a) => a.indexOf(v) === i).join(' / ')}`,
          badge: allDone ? `Stage ${s.num} Cleared` : allLocked ? 'Locked Stage' : 'In Active Focus',
          badgeStyle: allDone ? 'bg-indigo-50 text-[#0052CC]' : allLocked ? 'bg-slate-100 text-slate-500' : 'bg-sky-100 text-teal-900',
        };
      });
  }, [topics]);

  if (!selectedTopic) {
    return (
      <LearnerShell breadcrumb="My Roadmap">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
          No topics are published for this course yet.
        </div>
      </LearnerShell>
    );
  }

  const cleared = topics.filter((t) => t.status === 'completed' || t.status === 'mastered').length;
  const mastered = topics.filter((t) => t.status === 'mastered').length;
  const idxInStage = (t: TopicNode) => topics.filter((x) => x.stage === t.stage).findIndex((x) => x.id === t.id) + 1;

  return (
    <LearnerShell breadcrumb="My Roadmap">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex-1 min-w-[260px]">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-sky-100 text-teal-900 font-bold">Adaptive Curriculum</span>
              <span className="text-slate-400">Updates after every assessment</span>
            </div>
            <div className="text-lg font-extrabold text-slate-900 mt-1">
              {activeCourse.name} ({activeCourse.shortName})
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0052CC] flex items-center justify-center"><TrendingUp className="w-4 h-4" /></div>
              <div>
                <div className="text-[11px] text-slate-500">Roadmap Node Clearance</div>
                <div className="text-sm font-extrabold text-slate-900">
                  {Math.round((cleared / Math.max(1, topics.length)) * 100)}%{' '}
                  <span className="text-xs font-normal text-slate-500">({cleared} of {topics.length} Nodes)</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-teal-700 flex items-center justify-center"><Award className="w-4 h-4" /></div>
              <div>
                <div className="text-[11px] text-slate-500">High Mastery Target (≥90%)</div>
                <div className="text-sm font-extrabold text-slate-900">{mastered} of {topics.length} Mastered</div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/topics/${(pickActiveTopic(topics) ?? selectedTopic).id}`)}
              className="px-4 py-3 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Resume Flow</span>
            </button>
          </div>
        </div>

        <MasteryLegendBar showLocked />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            {stages.map((st) => (
              <div key={st.num} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {String(st.num).padStart(2, '0')}
                    </span>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">{st.title}</h2>
                      <p className="text-xs text-slate-500">{st.subtitle}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 ${st.badgeStyle}`}>{st.badge}</span>
                </div>

                <div className="space-y-3 sm:pl-2">
                  {st.items.map((node) => {
                    const isSelected = node.id === selectedTopic.id;
                    const locked = node.status === 'locked';
                    return (
                      <button
                        type="button"
                        key={node.id}
                        onClick={() => setSelectedTopicId(node.id)}
                        aria-pressed={isSelected}
                        className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                          isSelected ? 'bg-slate-50/90 border-2 border-[#0052CC] shadow-xs' : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/80'
                        } ${locked ? 'opacity-75' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-sm font-extrabold text-slate-900">{node.title}</h3>
                            <MasteryBadge status={node.status} />
                            {node.id === pickActiveTopic(topics)?.id && !locked && (
                              <span className="px-2 py-0.5 rounded bg-teal-800 text-white text-[10px] font-bold">Target Node</span>
                            )}
                          </div>
                          <span className={`text-sm font-extrabold ${node.status === 'not_completed' ? 'text-red-600' : locked ? 'text-slate-400' : 'text-[#0052CC]'}`}>
                            {node.mastery}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{node.subtitle}</p>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${statusBar(node.status)} rounded-full`} style={{ width: `${node.mastery}%` }} />
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500">
                          {locked ? (
                            <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3" />{node.unlockRequirementText ?? 'Complete the prerequisites to unlock'}</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-teal-800 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />Prerequisites met
                            </span>
                          )}
                          <span className="font-semibold text-[#0052CC]">{locked ? 'Locked' : 'Inspect Module →'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-5 lg:sticky lg:top-20">
            <div className="bg-white rounded-2xl border border-slate-200 border-t-4 border-t-teal-600 p-6 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-100 text-teal-950 text-[11px] font-bold">
                  <Sparkles className="w-3 h-3" />
                  {selectedTopic.id === pickActiveTopic(topics)?.id ? 'AI Recommended Next' : 'Module Details'}
                </span>
                <span className="text-[11px] font-bold text-slate-400">{selectedTopic.code}</span>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  MODULE {selectedTopic.stage}.{idxInStage(selectedTopic)}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{selectedTopic.title}</h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{selectedTopic.subtitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500">Baseline Mastery</div>
                  <div className={`text-xl font-extrabold mt-0.5 ${selectedTopic.mastery < 70 ? 'text-red-600' : 'text-[#0052CC]'}`}>{selectedTopic.mastery}%</div>
                  <div className="text-[10px] text-slate-500 capitalize">{selectedTopic.status.replace('_', ' ')}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500">Confidence Score</div>
                  <div className="text-xl font-extrabold text-[#0052CC] mt-0.5">{selectedTopic.confidence}%</div>
                  <div className="text-[10px] text-slate-500">{selectedTopic.confidence >= 75 ? 'Strong Recall' : selectedTopic.confidence >= 50 ? 'Moderate Recall' : 'Low Recall'}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Prerequisite Check</div>
                  <div className="text-slate-600 text-[11px] mt-0.5">
                    {selectedTopic.prerequisites.length === 0
                      ? 'No prerequisites: this is a foundational topic.'
                      : selectedTopic.prerequisitesMet
                      ? `Prerequisites met: ${selectedTopic.prerequisites.map((id) => topics.find((x) => x.id === id)?.title ?? id).join(' & ')} Completed or Mastered.`
                      : selectedTopic.unlockRequirementText ?? 'Complete the prerequisites to unlock.'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900">Syllabus Breakdown</div>
                {selectedTopic.syllabus.map((s) => (
                  <div key={s} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2 text-xs font-medium text-slate-800">
                    <span>{s}</span>
                    <span className="w-4 h-4 rounded-full border-2 border-teal-700 shrink-0" />
                  </div>
                ))}
              </div>

              <button
                disabled={selectedTopic.status === 'locked'}
                onClick={() => navigate(`/topics/${selectedTopic.id}`)}
                className="w-full py-3 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{selectedTopic.status === 'locked' ? 'Locked Prerequisite' : 'Begin Module'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
};

