import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon,
  CheckCircle2,
  ExternalLink,
  LayoutGrid,
  Lock,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { AdminShell, LearnerShell } from '../components/Layouts';
import { useApp } from '../context/AppContext';
import {
  COURSES,
  detectGraphCycle,
  DIAGNOSTIC_QUESTIONS,
} from '../data/mockData';

export const AdminSubjectsAndGraphPage: React.FC = () => {
  // Interactive Admin DAG Editor with real Depth-First Search Cycle Detection (p61, p62, p63)
  const {
    allTopics,
    addPrerequisiteEdge,
    removePrerequisiteEdge,
    dagCycleSimulated,
    setDagCycleSimulated,
    showFigmaPresets,
  } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState('cs-250');
  const subjectTopics = allTopics.filter((t) => t.subjectId === selectedSubjectId);
  const [selectedNodeId, setSelectedNodeId] = useState('dsa-bst');
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [prereqToAdd, setPrereqToAdd] = useState('');

  const selectedNode =
    subjectTopics.find((t) => t.id === selectedNodeId) ||
    subjectTopics[0] ||
    allTopics[3];

  // Run real DFS Cycle Detector on the current subject's topics
  const detectedCyclePath = detectGraphCycle(subjectTopics);
  const hasCycle = dagCycleSimulated || Boolean(detectedCyclePath);
  const cycleDisplayPath =
    detectedCyclePath || ['Tree Traversal', 'Binary Search Trees', 'Tree Traversal'];

  const handleToggleCycleSimulation = (val: boolean) => {
    setDagCycleSimulated(val);
    if (val) {
      // Inject a real mutual edge into state so DFS detects it too
      addPrerequisiteEdge('dsa-tree-traversal', 'dsa-bst');
    } else {
      removePrerequisiteEdge('dsa-tree-traversal', 'dsa-bst');
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {showFigmaPresets && (
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs">
            <span className="text-slate-500 font-medium">
              Figma Admin Graph States: Valid DAG (p61) vs Live DFS Cycle Detection (p62)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleCycleSimulation(false)}
                className={`px-3 py-1 rounded-md font-bold cursor-pointer ${
                  !hasCycle
                    ? 'bg-teal-800 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Valid DAG State (p61)
              </button>
              <button
                onClick={() => handleToggleCycleSimulation(true)}
                className={`px-3 py-1 rounded-md font-bold cursor-pointer ${
                  hasCycle
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                Inject Circular Edge &amp; Trigger DFS Violation (p62)
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs text-slate-500">
              Admin Console &gt; Curriculum Architecture &gt;{' '}
              <strong className="text-slate-800">Subjects &amp; Knowledge Graph</strong>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                Subjects &amp; Knowledge Graph
              </h1>
              {hasCycle && (
                <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-extrabold uppercase">
                  DAG VIOLATION
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Manage approved core curriculum tracks, topic hierarchy, prerequisite trees, and
              directional competency dependencies across departments.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddSubjectModal(!showAddSubjectModal)}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject (p63)</span>
            </button>
            <button
              onClick={() => handleToggleCycleSimulation(false)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                hasCycle
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{hasCycle ? 'Re-Validate Graph' : 'Validate Graph'}</span>
            </button>
            <button
              disabled={hasCycle}
              className="px-4 py-2.5 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {showAddSubjectModal && (
          <div className="bg-white rounded-2xl border-2 border-[#0052CC] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900">
                Create New Subject Track (Figma p63)
              </h2>
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="text-xs font-bold text-slate-500 cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <input
                type="text"
                placeholder="Course Code (e.g. CS-320)"
                className="px-3.5 py-2.5 rounded-lg border border-slate-200"
              />
              <input
                type="text"
                placeholder="Subject Title (e.g. Operating Systems)"
                className="px-3.5 py-2.5 rounded-lg border border-slate-200"
              />
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="py-2.5 px-4 rounded-lg bg-[#0052CC] text-white font-bold cursor-pointer"
              >
                Create Subject &amp; Initialize DAG
              </button>
            </div>
          </div>
        )}

        {!hasCycle ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-teal-900 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-slate-900">
                  Curriculum Dependency Graph Validated
                </div>
                <p className="text-xs text-slate-500">
                  All prerequisite sequences form a strict Directed Acyclic Graph (DAG). Zero
                  circular dependencies detected across {subjectTopics.length} topic nodes.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-sky-100 text-teal-950 text-[10px] font-extrabold uppercase shrink-0">
              DAG VALID
            </span>
          </div>
        ) : (
          <div className="bg-red-50/90 rounded-2xl border border-red-200 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-red-900">
                    Critical Graph Structural Error
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-700 text-white text-[10px] font-bold uppercase">
                    CYCLE DETECTED
                  </span>
                </div>
                <p className="text-xs text-red-800 mt-0.5">
                  Cycle detected:{' '}
                  {cycleDisplayPath.map((name, i) => (
                    <React.Fragment key={i}>
                      <strong className="underline">[{name}]</strong>
                      {i < cycleDisplayPath.length - 1 ? ' requires ' : '. '}
                    </React.Fragment>
                  ))}
                  Topological sort failed; curriculum progression blocked.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleToggleCycleSimulation(false)}
              className="px-3.5 py-2 rounded-xl bg-white border border-red-200 text-xs font-bold text-slate-900 hover:bg-red-100 cursor-pointer"
            >
              Break Precedent Link (Resolve Cycle)
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 5 Cols */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h2 className="text-sm font-extrabold text-slate-900">Curriculum Tracks</h2>
              <div className="grid grid-cols-2 gap-3">
                {COURSES.map((c) => {
                  const isCurrent = c.id === selectedSubjectId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedSubjectId(c.id);
                        const first = allTopics.find((t) => t.subjectId === c.id);
                        if (first) setSelectedNodeId(first.id);
                      }}
                      className={`p-3.5 rounded-xl border space-y-1.5 cursor-pointer transition-all ${
                        isCurrent && hasCycle
                          ? 'bg-red-50/50 border-red-300'
                          : isCurrent
                          ? 'bg-blue-50/40 border-2 border-[#0052CC]'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#0052CC]">{c.code}</span>
                        {isCurrent && (
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase text-white ${
                              hasCycle ? 'bg-red-600' : 'bg-[#0052CC]'
                            }`}
                          >
                            {hasCycle ? '1 Conflict' : 'ACTIVE'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-extrabold text-slate-900 leading-snug">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {c.topicCount} Topics • {c.dependencyCount} Dependencies
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-900">
                  Topic Sequences ({selectedSubjectId.toUpperCase()})
                </h2>
                <span className="text-xs font-bold text-[#0052CC]">
                  {subjectTopics.length} Nodes
                </span>
              </div>

              <div className="space-y-2">
                {subjectTopics.map((t, idx) => {
                  const isSelected = t.id === selectedNode.id;
                  const inCycle = hasCycle && cycleDisplayPath.includes(t.title);
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedNodeId(t.id)}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        inCycle
                          ? 'bg-red-50 border-red-300 text-red-900 font-bold'
                          : isSelected
                          ? 'bg-[#0052CC] text-white border-[#0052CC] font-bold'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>
                        {idx + 1}. {t.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          inCycle
                            ? 'bg-red-600 text-white'
                            : isSelected
                            ? 'bg-white text-[#0052CC]'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {inCycle ? 'Cycle Loop' : isSelected ? 'Selected' : t.tier}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Live Prerequisite Editor in Node Configuration Inspector */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="text-xs font-extrabold text-slate-900">
                  Node Configuration: {selectedNode.title}
                </div>
                <div className="text-[11px] text-slate-500">
                  Node ID: <strong>{selectedNode.code}</strong> • Threshold:{' '}
                  <strong>≥70% Completed (≥90% Mastered)</strong>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-700">
                    Direct Prerequisites (Click ✕ to remove, or add one below to test DFS cycle check):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.prerequisites.length === 0 && (
                      <span className="text-[11px] text-slate-400">
                        No prerequisites (Root Foundational Node)
                      </span>
                    )}
                    {selectedNode.prerequisites.map((pId) => {
                      const pTopic = allTopics.find((x) => x.id === pId);
                      return (
                        <button
                          key={pId}
                          type="button"
                          onClick={() => removePrerequisiteEdge(selectedNode.id, pId)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-red-50 text-[#0052CC] hover:text-red-700 text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          {pTopic?.title || pId} ✕
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <select
                      aria-label="Select prerequisite to add"
                      value={prereqToAdd}
                      onChange={(e) => setPrereqToAdd(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    >
                      <option value="">+ Add Prerequisite Edge...</option>
                      {subjectTopics
                        .filter(
                          (x) =>
                            x.id !== selectedNode.id &&
                            !selectedNode.prerequisites.includes(x.id)
                        )
                        .map((x) => (
                          <option key={x.id} value={x.id}>
                            Requires: {x.title} ({x.code})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      disabled={!prereqToAdd}
                      onClick={() => {
                        if (prereqToAdd) {
                          addPrerequisiteEdge(selectedNode.id, prereqToAdd);
                          setPrereqToAdd('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#0052CC] disabled:bg-slate-200 text-white text-xs font-bold cursor-pointer"
                    >
                      Link Edge
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-bold flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Node</span>
                  </button>
                  <button className="flex-1 py-2 rounded-lg bg-[#0052CC] text-white text-xs font-bold">
                    Update Topic
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Clickable Interactive SVG DAG Canvas */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Curriculum Dependency Graph (Click any node to inspect)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Interactive Directed Acyclic Graph (DAG) • Real-time DFS Topological Check
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    hasCycle ? 'bg-red-600 text-white' : 'bg-[#0052CC] text-white'
                  }`}
                >
                  {hasCycle ? 'Cycle Error' : 'Depth: All'}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 overflow-x-auto">
                <svg viewBox="0 0 680 300" className="w-full h-72 min-w-[540px]">
                  <path
                    d="M 140 130 C 180 130, 190 95, 220 95"
                    fill="none"
                    stroke="#0052CC"
                    strokeWidth="2"
                  />
                  <path
                    d="M 350 95 C 385 95, 395 65, 425 65"
                    fill="none"
                    stroke="#0052CC"
                    strokeWidth="2"
                  />
                  <path
                    d="M 480 95 L 480 145"
                    fill="none"
                    stroke={hasCycle ? '#DC2626' : '#0052CC'}
                    strokeWidth="2.5"
                    strokeDasharray={hasCycle ? '4 3' : undefined}
                  />
                  {hasCycle && (
                    <path
                      d="M 445 145 C 415 120, 415 90, 445 65"
                      fill="none"
                      stroke="#DC2626"
                      strokeWidth="2.5"
                      strokeDasharray="4 3"
                    />
                  )}
                  <path
                    d="M 550 175 L 575 175"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                  />

                  {/* Clickable SVG Nodes */}
                  <g
                    transform="translate(20, 100)"
                    className="cursor-pointer"
                    onClick={() => setSelectedNodeId(subjectTopics[0]?.id || 'dsa-arrays')}
                  >
                    <rect
                      width="120"
                      height="58"
                      rx="10"
                      fill={selectedNode.id === subjectTopics[0]?.id ? '#0052CC' : 'white'}
                      stroke="#0052CC"
                      strokeWidth="1.5"
                    />
                    <text
                      x="10"
                      y="20"
                      fill={selectedNode.id === subjectTopics[0]?.id ? '#DBEAFE' : '#0052CC'}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      Stage 01 • Root
                    </text>
                    <text
                      x="10"
                      y="36"
                      fill={selectedNode.id === subjectTopics[0]?.id ? 'white' : '#0F172A'}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {(subjectTopics[0]?.title || 'Arrays').slice(0, 16)}
                    </text>
                    <text
                      x="10"
                      y="49"
                      fill={selectedNode.id === subjectTopics[0]?.id ? '#E0F2FE' : '#64748B'}
                      fontSize="8"
                    >
                      Foundational
                    </text>
                  </g>

                  {subjectTopics[1] && (
                    <g
                      transform="translate(220, 65)"
                      className="cursor-pointer"
                      onClick={() => setSelectedNodeId(subjectTopics[1].id)}
                    >
                      <rect
                        width="130"
                        height="58"
                        rx="10"
                        fill={selectedNode.id === subjectTopics[1].id ? '#0052CC' : 'white'}
                        stroke="#CBD5E1"
                        strokeWidth="1.5"
                      />
                      <text
                        x="10"
                        y="20"
                        fill={selectedNode.id === subjectTopics[1].id ? '#DBEAFE' : '#0052CC'}
                        fontSize="9"
                        fontWeight="bold"
                      >
                        Tier 2 • Valid
                      </text>
                      <text
                        x="10"
                        y="36"
                        fill={selectedNode.id === subjectTopics[1].id ? 'white' : '#0F172A'}
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {subjectTopics[1].title.slice(0, 18)}
                      </text>
                      <text
                        x="10"
                        y="49"
                        fill={selectedNode.id === subjectTopics[1].id ? '#E0F2FE' : '#64748B'}
                        fontSize="8"
                      >
                        In-degree: {subjectTopics[1].prerequisites.length}
                      </text>
                    </g>
                  )}

                  {subjectTopics[2] && (
                    <g
                      transform="translate(425, 35)"
                      className="cursor-pointer"
                      onClick={() => setSelectedNodeId(subjectTopics[2].id)}
                    >
                      <rect
                        width="130"
                        height="60"
                        rx="10"
                        fill={
                          hasCycle
                            ? '#FEF2F2'
                            : selectedNode.id === subjectTopics[2].id
                            ? '#0052CC'
                            : 'white'
                        }
                        stroke={hasCycle ? '#DC2626' : '#0052CC'}
                        strokeWidth="2"
                      />
                      <text
                        x="10"
                        y="20"
                        fill={
                          hasCycle
                            ? '#DC2626'
                            : selectedNode.id === subjectTopics[2].id
                            ? '#DBEAFE'
                            : '#0052CC'
                        }
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {hasCycle ? 'CYCLE LOOP A' : 'Prereq Valid ✓'}
                      </text>
                      <text
                        x="10"
                        y="36"
                        fill={
                          !hasCycle && selectedNode.id === subjectTopics[2].id
                            ? 'white'
                            : '#0F172A'
                        }
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {subjectTopics[2].title.slice(0, 18)}
                      </text>
                      <text
                        x="10"
                        y="49"
                        fill={
                          !hasCycle && selectedNode.id === subjectTopics[2].id
                            ? '#E0F2FE'
                            : '#64748B'
                        }
                        fontSize="8"
                      >
                        Click to configure
                      </text>
                    </g>
                  )}

                  {subjectTopics[3] && (
                    <g
                      transform="translate(415, 145)"
                      className="cursor-pointer"
                      onClick={() => setSelectedNodeId(subjectTopics[3].id)}
                    >
                      <rect
                        width="135"
                        height="64"
                        rx="10"
                        fill={
                          hasCycle
                            ? '#FEE2E2'
                            : selectedNode.id === subjectTopics[3].id
                            ? '#0052CC'
                            : 'white'
                        }
                        stroke={hasCycle ? '#DC2626' : '#0052CC'}
                        strokeWidth="2"
                      />
                      <text
                        x="10"
                        y="20"
                        fill={
                          hasCycle
                            ? '#991B1B'
                            : selectedNode.id === subjectTopics[3].id
                            ? '#DBEAFE'
                            : '#0052CC'
                        }
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {hasCycle ? 'CONFLICT NODE' : 'Tier 3 Node'}
                      </text>
                      <text
                        x="10"
                        y="36"
                        fill={
                          hasCycle
                            ? '#7F1D1D'
                            : selectedNode.id === subjectTopics[3].id
                            ? 'white'
                            : '#0F172A'
                        }
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {subjectTopics[3].title.slice(0, 18)}
                      </text>
                      <text
                        x="10"
                        y="50"
                        fill={
                          hasCycle
                            ? '#991B1B'
                            : selectedNode.id === subjectTopics[3].id
                            ? '#E0F2FE'
                            : '#64748B'
                        }
                        fontSize="8"
                      >
                        {hasCycle ? 'Mutual prereq loop' : 'Click to inspect'}
                      </text>
                    </g>
                  )}

                  {subjectTopics[4] && (
                    <g
                      transform="translate(570, 145)"
                      className="cursor-pointer"
                      onClick={() => setSelectedNodeId(subjectTopics[4].id)}
                    >
                      <rect
                        width="100"
                        height="60"
                        rx="10"
                        fill={selectedNode.id === subjectTopics[4].id ? '#0052CC' : 'white'}
                        stroke="#CBD5E1"
                        strokeWidth="1.5"
                      />
                      <text
                        x="10"
                        y="20"
                        fill={selectedNode.id === subjectTopics[4].id ? '#DBEAFE' : '#64748B'}
                        fontSize="9"
                        fontWeight="bold"
                      >
                        Tier 4
                      </text>
                      <text
                        x="10"
                        y="36"
                        fill={selectedNode.id === subjectTopics[4].id ? 'white' : '#0F172A'}
                        fontSize="10"
                        fontWeight="bold"
                      >
                        Graph Networks
                      </text>
                      <text
                        x="10"
                        y="49"
                        fill={selectedNode.id === subjectTopics[4].id ? '#E0F2FE' : '#64748B'}
                        fontSize="8"
                      >
                        {hasCycle ? 'Blocked by Cycle' : 'Terminal Node'}
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Cycle Check (DFS)</div>
                  <div
                    className={`font-extrabold mt-0.5 ${
                      hasCycle ? 'text-red-600' : 'text-teal-800'
                    }`}
                  >
                    {hasCycle ? 'Cycle Detected' : 'Passed (0 Cycles)'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Active Track Nodes</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">
                    {subjectTopics.length} Topics
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Topological Depth</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">3 Stages</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500">Component Graph</div>
                  <div className="font-extrabold text-slate-900 mt-0.5">1 Connected</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

export const AdminQuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState(DIAGNOSTIC_QUESTIONS);
  const [stem, setStem] = useState('');
  const [topicName] = useState('Binary Search Trees');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stem.trim() || !topicName.trim()) {
      setErrorMsg('Topic tag and difficulty level are mandatory before saving.');
      return;
    }
    setErrorMsg('');
    setQuestions([
      {
        id: `q-new-${Date.now()}`,
        topicId: 'dsa-bst',
        topicName,
        difficulty,
        stem,
        hint: 'Authored via Admin Console and indexed into pgvector.',
        options: [
          { id: 'A', text: 'Option A' },
          { id: 'B', text: 'Option B (Correct)' },
          { id: 'C', text: 'Option C' },
          { id: 'D', text: 'Option D' },
        ],
        correctOption: 'B',
        explanation: 'Admin-authored explanation grounded in curriculum notes.',
      },
      ...questions,
    ]);
    setStem('');
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Question Bank &amp; Retrieval Indexing
          </h1>
          <p className="text-xs text-slate-500">
            Manage curated diagnostic and micro-assessment items ({questions.length} questions).
            Every question requires a topic tag and difficulty tier and updates the vector retrieval
            index.
          </p>
        </div>

        <form
          onSubmit={handleAdd}
          className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
        >
          <h2 className="text-sm font-extrabold text-slate-900">+ Add New Curated Question</h2>
          {errorMsg && <div className="text-xs font-bold text-red-600">{errorMsg}</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <input
              type="text"
              value={stem}
              onChange={(e) => setStem(e.target.value)}
              placeholder="Question stem..."
              className="md:col-span-2 px-3.5 py-2.5 rounded-lg border border-slate-200"
            />
            <div className="flex gap-2">
              <select
                aria-label="Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                className="px-3 py-2.5 rounded-lg border border-slate-200 font-bold capitalize"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-lg bg-[#0052CC] text-white font-bold cursor-pointer"
              >
                Save &amp; Index
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0052CC]">
                    {q.topicName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                    {q.difficulty}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{q.stem}</div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 shrink-0">
                Indexed in pgvector ✓
              </span>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
};

export const AdminResourcesPage: React.FC = () => {
  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Curated Study Resources</h1>
          <p className="text-xs text-slate-500">
            Manage study materials, documentation, and reference chunks linked to each topic node.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              topic: 'Tree Traversal (CS250-T03)',
              title: 'Recursive vs Iterative DFS & Level-Order BFS Notes',
              type: 'Reference Notes (RAG Grounded)',
            },
            {
              topic: 'Binary Search Trees (CS250-T04)',
              title: 'Canonical BST Ordering Invariant & AVL Rotations',
              type: 'Interactive Visualization & Guide',
            },
          ].map((r) => (
            <div
              key={r.title}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between"
            >
              <div>
                <div className="text-xs font-bold text-[#0052CC]">{r.topic}</div>
                <div className="text-sm font-extrabold text-slate-900 mt-0.5">{r.title}</div>
                <div className="text-xs text-slate-500">{r.type}</div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
};

export const Forbidden403Page: React.FC = () => {
  return (
    <LearnerShell breadcrumb="Access Restricted">
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs max-w-md w-full p-10 text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-extrabold text-slate-900 leading-snug">
              You don&apos;t have permission to view this page
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              This area is for administrators. If you think this is a mistake, contact support.
            </p>
          </div>
          <div className="space-y-2.5 pt-1">
            <Link
              to="/dashboard"
              className="w-full py-3 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] text-white text-xs font-bold flex items-center justify-center gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <Link
              to="/help"
              className="block text-xs font-semibold text-slate-600 hover:text-slate-900 py-1"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
};
