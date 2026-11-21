import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ADMIN_USER,
  ALL_TOPICS,
  CERTIFICATES,
  COURSES,
  INITIAL_USER,
  statusFromMastery,
  type AssessmentLog,
  type MasterySnapshot,
  type CertificateRecord,
  type SubjectCourse,
  type TopicNode,
  type User,
} from '../data/mockData';

type Session = 'learner' | 'admin' | null;

interface AppContextType {
  user: User | null;
  learner: User; // the learner profile, available even when signed out (public profile / verification)
  isAuthenticated: boolean;
  loginAsLearner: () => void;
  loginAsAdmin: () => void;
  logout: () => void;
  updateUserProfile: (patch: Partial<User>) => void;
  courses: SubjectCourse[];
  allTopics: TopicNode[];
  topics: TopicNode[]; // topics of the active course
  certificates: CertificateRecord[];
  activeCourse: SubjectCourse;
  setActiveCourseId: (id: string) => void;
  updateTopicMastery: (topicId: string, newMastery: number, newConfidence: number) => void;
  addPrerequisiteEdge: (topicId: string, prereqId: string) => void;
  removePrerequisiteEdge: (topicId: string, prereqId: string) => void;
  dagCycleSimulated: boolean;
  setDagCycleSimulated: (val: boolean) => void;
  showFigmaPresets: boolean; // doubles as "demo mode": gates role-switch + preset bars
  setShowFigmaPresets: (val: boolean) => void;
  resetDemoState: () => void;
  assessments: AssessmentLog[]; // newest first
  logAssessment: (entry: Omit<AssessmentLog, 'id' | 'date'>) => void;
  snapshots: MasterySnapshot[];
}

const KEYS = {
  SESSION: 'learnova_session_v3',
  LEARNER: 'learnova_user_v3',
  COURSES: 'learnova_courses_v3',
  TOPICS: 'learnova_topics_v3',
  CERTS: 'learnova_certs_v3',
  DEMO: 'learnova_demo_v3',
  LOGS: 'learnova_assessments_v3',
  SNAPS: 'learnova_snapshots_v3',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable or full: state still works in memory */
  }
}

/** Re-evaluates prerequisites_met and locked/unlocked status for every topic (FR09-02). */
function recomputePrerequisites(list: TopicNode[]): TopicNode[] {
  const byId = new Map(list.map((t) => [t.id, t]));
  return list.map((t) => {
    if (t.prerequisites.length === 0) return { ...t, prerequisitesMet: true };
    const met = t.prerequisites.every((id) => {
      const p = byId.get(id);
      return p && (p.status === 'completed' || p.status === 'mastered');
    });
    let status = t.status;
    if (met && t.status === 'locked') status = 'not_completed';
    else if (!met && t.mastery === 0) status = 'locked';
    return { ...t, prerequisitesMet: met, status };
  });
}

function aggregateCourses(courses: SubjectCourse[], topics: TopicNode[]): SubjectCourse[] {
  return courses.map((c) => {
    const own = topics.filter((t) => t.subjectId === c.id);
    if (own.length === 0) return c;
    const avg = (f: (t: TopicNode) => number) =>
      Math.round(own.reduce((a, t) => a + f(t), 0) / own.length);
    return {
      ...c,
      topicCount: own.length,
      dependencyCount: own.reduce((a, t) => a + t.prerequisites.length, 0),
      overallMastery: avg((t) => t.mastery),
      overallConfidence: avg((t) => t.confidence),
      topicsMastered: own.filter((t) => t.status === 'mastered').length,
    };
  });
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Secure default: nobody is signed in until they log in.
  const [session, setSession] = useState<Session>(() => load<Session>(KEYS.SESSION, null));
  const [learner, setLearner] = useState<User>(() => load(KEYS.LEARNER, INITIAL_USER));
  const [courseFlags, setCourses] = useState<SubjectCourse[]>(() => load(KEYS.COURSES, COURSES));
  const [allTopics, setAllTopics] = useState<TopicNode[]>(() => load(KEYS.TOPICS, ALL_TOPICS));
  // Course aggregates are always derived from topics so they can never drift out of sync.
  const courses = useMemo(() => aggregateCourses(courseFlags, allTopics), [courseFlags, allTopics]);
  const [certificates] = useState<CertificateRecord[]>(() => load(KEYS.CERTS, CERTIFICATES));
  const [assessments, setAssessments] = useState<AssessmentLog[]>(() => load(KEYS.LOGS, []));
  const [snapshots, setSnapshots] = useState<MasterySnapshot[]>(() => load(KEYS.SNAPS, []));
  const [dagCycleSimulated, setDagCycleSimulated] = useState(false);
  const [showFigmaPresets, setShowFigmaPresetsState] = useState<boolean>(() =>
    load(KEYS.DEMO, true)
  );

  useEffect(() => save(KEYS.SESSION, session), [session]);
  useEffect(() => save(KEYS.LEARNER, learner), [learner]);
  useEffect(() => save(KEYS.COURSES, courseFlags), [courseFlags]);
  useEffect(() => save(KEYS.TOPICS, allTopics), [allTopics]);
  useEffect(() => save(KEYS.CERTS, certificates), [certificates]);
  useEffect(() => save(KEYS.LOGS, assessments), [assessments]);
  useEffect(() => save(KEYS.SNAPS, snapshots), [snapshots]);

  const logAssessment = useCallback((entry: Omit<AssessmentLog, 'id' | 'date'>) => {
    setAssessments((prev) =>
      [{ ...entry, id: `a_${Date.now()}`, date: new Date().toISOString() }, ...prev].slice(0, 100)
    );
  }, []);

  const setShowFigmaPresets = useCallback((v: boolean) => {
    setShowFigmaPresetsState(v);
    save(KEYS.DEMO, v);
  }, []);

  const user: User | null = session === 'admin' ? ADMIN_USER : session === 'learner' ? learner : null;

  const loginAsLearner = useCallback(() => setSession('learner'), []);
  const loginAsAdmin = useCallback(() => setSession('admin'), []);
  const logout = useCallback(() => setSession(null), []);

  const updateUserProfile = useCallback((patch: Partial<User>) => {
    setLearner((prev) => ({ ...prev, ...patch }));
  }, []);

  const activeCourseId = learner.activeCourseId;
  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];
  const topics = useMemo(
    () => allTopics.filter((t) => t.subjectId === activeCourse.id),
    [allTopics, activeCourse.id]
  );

  const setActiveCourseId = useCallback((id: string) => {
    setLearner((prev) => ({ ...prev, activeCourseId: id }));
    setCourses((prev) =>
      prev.map((c) => ({ ...c, active: c.id === id, enrolled: c.id === id ? true : c.enrolled }))
    );
  }, []);

  const updateTopicMastery = useCallback(
    (topicId: string, newMastery: number, newConfidence: number) => {
      setAllTopics((prev) => {
        const updated = recomputePrerequisites(
          prev.map((t) =>
            t.id === topicId
              ? { ...t, mastery: newMastery, confidence: newConfidence, status: statusFromMastery(newMastery) }
              : t
          )
        );
        const subjectId = prev.find((t) => t.id === topicId)?.subjectId;
        if (subjectId) {
          const own = updated.filter((t) => t.subjectId === subjectId);
          const avgM = Math.round(own.reduce((a, t) => a + t.mastery, 0) / Math.max(1, own.length));
          const avgC = Math.round(own.reduce((a, t) => a + t.confidence, 0) / Math.max(1, own.length));
          setSnapshots((sPrev) =>
            [...sPrev, { ts: new Date().toISOString(), courseId: subjectId, mastery: avgM, confidence: avgC }].slice(-200)
          );
        }
        return updated;
      });
    },
    []
  );

  const addPrerequisiteEdge = useCallback((topicId: string, prereqId: string) => {
    if (topicId === prereqId) return;
    setAllTopics((prev) =>
      prev.map((t) =>
        t.id === topicId && !t.prerequisites.includes(prereqId)
          ? { ...t, prerequisites: [...t.prerequisites, prereqId] }
          : t
      )
    );
  }, []);

  const removePrerequisiteEdge = useCallback((topicId: string, prereqId: string) => {
    setAllTopics((prev) =>
      prev.map((t) =>
        t.id === topicId ? { ...t, prerequisites: t.prerequisites.filter((p) => p !== prereqId) } : t
      )
    );
  }, []);

  const resetDemoState = useCallback(() => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
    setSession(null);
    setLearner(INITIAL_USER);
    setCourses(COURSES);
    setAllTopics(ALL_TOPICS);
    setDagCycleSimulated(false);
    setAssessments([]);
    setSnapshots([]);
    setShowFigmaPresetsState(true);
  }, []);

  const value = useMemo<AppContextType>(
    () => ({
      user,
      learner,
      isAuthenticated: session !== null,
      loginAsLearner,
      loginAsAdmin,
      logout,
      updateUserProfile,
      courses,
      allTopics,
      topics,
      certificates,
      activeCourse,
      setActiveCourseId,
      updateTopicMastery,
      addPrerequisiteEdge,
      removePrerequisiteEdge,
      dagCycleSimulated,
      setDagCycleSimulated,
      showFigmaPresets,
      setShowFigmaPresets,
      resetDemoState,
      assessments,
      logAssessment,
      snapshots,
    }),
    [
      user, learner, session, loginAsLearner, loginAsAdmin, logout, updateUserProfile, courses, allTopics,
      topics, certificates, activeCourse, setActiveCourseId, updateTopicMastery, addPrerequisiteEdge,
      removePrerequisiteEdge, dagCycleSimulated, showFigmaPresets, setShowFigmaPresets, resetDemoState,
      assessments, logAssessment, snapshots,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};



