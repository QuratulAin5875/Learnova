import React, { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Copy,
  Flame,
  GraduationCap,
  Info,
  Lock,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { LearnerShell, PublicLayout } from '../components/Layouts';
import { useApp } from '../context/AppContext';
import { sanitizeText } from '../lib/api';

export const VerifyCertificatePage: React.FC = () => {
  // Exact match to Figma p56–p60: Verify Academic Certificate (Found / Not Found / Invalid Format)
  const [searchParams] = useSearchParams();
  const { certificates, learner, showFigmaPresets } = useApp();
  const initialQuery = searchParams.get('id') || 'LRN-2024-PF-0142';
  const [query, setQuery] = useState(initialQuery);

  const trimmed = query.trim().toUpperCase();
  const formatRegex = /^LRN-\d{4}-[A-Z]{2,4}-\d{4}$/;
  const isInvalidFormat = trimmed.length > 0 && !formatRegex.test(trimmed);
  const foundCert = certificates.find((c) => c.certificateId.toUpperCase() === trimmed);

  return (
    <PublicLayout rightMode="verify">
      <div className="max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
        {/* Preset Switcher for Figma Verification States p56-p59 */}
        {showFigmaPresets && (
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs">
            <span className="text-slate-500 font-medium">
              Figma Verification States (p56–p60):
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setQuery('LRN-2024-PF-0142')}
                className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-semibold cursor-pointer"
              >
                PF Mastered Found (p56)
              </button>
              <button
                onClick={() => setQuery('LRN-2024-DSA-0982')}
                className="px-2.5 py-1 rounded bg-blue-50 text-[#0052CC] font-semibold cursor-pointer"
              >
                DSA Completed Found (p57)
              </button>
              <button
                onClick={() => setQuery('LRN-2024-XX-0000')}
                className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 font-semibold cursor-pointer"
              >
                Not Found (p58)
              </button>
              <button
                onClick={() => setQuery('LRN2024')}
                className="px-2.5 py-1 rounded bg-red-50 text-red-700 font-semibold cursor-pointer"
              >
                Invalid Format (p59)
              </button>
            </div>
          </div>
        )}

        {/* Header + Search Box (exact match to p56) */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-slate-200 text-[#0052CC] text-[11px] font-bold uppercase tracking-wider shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ACADEMIC CREDENTIAL VERIFICATION</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Verify Academic Certificate
          </h1>
          <p className="text-xs text-slate-500">
            Verify completion and mastery certificates issued by the Learnova Learning Platform.
          </p>

          <div className="max-w-xl mx-auto pt-2">
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Query format: LRN-YYYY-CODE-XXXX"
                  className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                />
                {foundCert && (
                  <span className="px-2 py-0.5 rounded bg-sky-100 text-teal-900 text-[10px] font-extrabold shrink-0">
                    RECORD FOUND
                  </span>
                )}
                {!foundCert && !isInvalidFormat && trimmed.length > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-extrabold shrink-0">
                    NOT FOUND
                  </span>
                )}
                {isInvalidFormat && (
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-extrabold shrink-0">
                    INVALID FORMAT
                  </span>
                )}
              </div>
              <button className="px-4 py-2.5 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer">
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Certificate</span>
              </button>
            </div>
            <div className="text-[11px] text-slate-400 mt-1.5">
              Query format: <code className="font-mono font-semibold">LRN-YYYY-CODE-XXXX</code>
            </div>
          </div>
        </div>

        {/* State 1: Invalid Format (p59) */}
        {isInvalidFormat && (
          <div className="bg-white rounded-2xl border-l-4 border-l-red-600 border border-slate-200 p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-extrabold text-slate-900 text-sm">
                Invalid Certificate ID Format
              </div>
              <p className="text-slate-600">
                Enter a correctly formatted ID matching{' '}
                <code className="font-mono font-bold">LRN-YYYY-CODE-XXXX</code> (for example,{' '}
                <code className="font-mono">LRN-2024-PF-0142</code>).
              </p>
            </div>
          </div>
        )}

        {/* State 2: Record Not Found (p58) */}
        {!isInvalidFormat && !foundCert && trimmed.length > 0 && (
          <div className="bg-white rounded-2xl border-l-4 border-l-amber-500 border border-slate-200 p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-extrabold text-slate-900 text-sm">
                No Matching Certificate Found
              </div>
              <p className="text-slate-600">
                No credential with ID <strong>{trimmed}</strong> exists in the Learnova Certificate
                Database. Please double-check the ID with the certificate holder.
              </p>
            </div>
          </div>
        )}

        {/* State 3: Record Found (exact match to p56, respects FR19-04 private visibility) */}
        {foundCert && !learner.certsPublic && (
          <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-[#0052CC] p-6 flex items-start gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-teal-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-1">
              <div className="text-sm font-extrabold text-slate-900">
                Valid Certificate • {foundCert.certificateId}
              </div>
              <p className="text-slate-600">
                This certificate exists and is active in the Learnova Certificate Database. Holder
                details are hidden because the learner set certificate visibility to private.
              </p>
            </div>
          </div>
        )}

        {foundCert && learner.certsPublic && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-[#0052CC] p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-teal-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">Valid Certificate</span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-800 text-white text-[10px] font-bold">
                      Official Record
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {foundCert.tier} Tier (≥{foundCert.tier === 'Mastered' ? '90' : '70'}%) •{' '}
                    <strong className="text-[#0052CC]">Status: Active</strong>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold">
                <Lock className="w-3 h-3" />
                Verified Academic Record
              </span>
            </div>

            {/* Main Credential Card (from p56) */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-slate-100/80 p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200">
                <div className="space-y-2 max-w-xl">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#0052CC] flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>LEARNOVA LEARNING PLATFORM</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Certificate of {foundCert.tier} • {foundCert.courseCode}{' '}
                    {foundCert.courseName}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">{foundCert.description}</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shrink-0 shadow-2xs">
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-teal-800 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">{foundCert.tier}</div>
                    <div className="text-[11px] font-semibold text-teal-700">
                      Evaluated Cutoff Met ({foundCert.score}%)
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-7 space-y-6">
                {/* Proficiency Tier Evaluation Bar (p56) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-slate-900">Proficiency Tier Evaluation</span>
                    <span className="text-[#0052CC]">
                      {foundCert.tier} ({foundCert.score}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0052CC] rounded-full"
                      style={{ width: `${foundCert.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Foundational (60%)</span>
                    <span>Completed (70–89%)</span>
                    <span className="text-[#0052CC] font-bold">Mastered (≥90%)</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-900">
                    Academic Credential Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        LEARNER NAME
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 mt-1">
                        {foundCert.learnerName}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        COURSE CODE
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 mt-1">
                        {foundCert.courseCode}
                      </div>
                      <div className="text-[11px] text-slate-500">{foundCert.courseName}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        CREDENTIAL TYPE
                      </div>
                      <div className="text-sm font-extrabold text-[#0052CC] mt-1">
                        Certificate of {foundCert.tier}
                      </div>
                      <div className="text-[11px] text-slate-500">Tier Cutoff Met</div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        VERIFICATION STATUS
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-600" />
                        <span>{foundCert.status}</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                      <div className="text-[10px] font-bold uppercase text-slate-400">
                        CERTIFICATE ID
                      </div>
                      <div className="text-sm font-mono font-extrabold text-slate-900 mt-1">
                        {foundCert.certificateId}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-right">
                  <div className="text-[10px] font-bold uppercase text-slate-400">ISSUE DATE</div>
                  <div className="text-xs font-bold text-slate-900">{foundCert.issueDate}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-3 text-xs text-slate-600">
              <Info className="w-4 h-4 text-[#0052CC] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-900">
                  Academic Standards &amp; Integrity Guidance
                </div>
                <p className="mt-0.5">
                  Learnova credential records are maintained in the Learnova Certificate Database.
                  Certificates confirm course outcomes and criterion-referenced assessments
                  completed in accordance with platform educational benchmarks.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export const PublicLearnerProfilePage: React.FC = () => {
  // Figma p49: Public Learner Record (Shareable CV/LinkedIn portfolio)
  const { username } = useParams();
  const { learner, certificates, courses } = useApp();
  const [copied, setCopied] = useState(false);

  const isKnownLearner = !username || username === learner.username || username === 'alex-morgan';
  const masteredTracks = courses.filter((c) => c.overallMastery >= 90);

  if (!isKnownLearner) {
    return (
      <PublicLayout rightMode="verify">
        <div className="max-w-xl w-full mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <h1 className="text-xl font-extrabold text-slate-900">Learner Not Found</h1>
            <p className="text-xs text-slate-500">No public learner record matches @{username}.</p>
            <Link to="/learners" className="inline-block px-4 py-2 rounded-xl bg-[#0052CC] text-white text-xs font-bold">
              Find a Learner
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!learner.profilePublic) {
    return (
      <PublicLayout rightMode="verify">
        <div className="max-w-xl w-full mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">This Profile is Private</h1>
            <p className="text-xs text-slate-500">
              @{learner.username} has disabled public profile visibility in Account Settings.
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout rightMode="verify">
      <div className="max-w-5xl w-full mx-auto px-6 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-7 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0052CC] text-white text-xl font-extrabold flex items-center justify-center">
              {learner.avatarInitials}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-[#0052CC] text-[10px] font-bold uppercase">
                Public Learner Record
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{learner.name}</h1>
              <p className="text-xs text-slate-500">
                {learner.learningGoal || 'Building strong foundational competencies in Computer Science'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              setCopied(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#0052CC] text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Profile Link Copied!' : 'Copy Shareable Profile Link'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-xs text-slate-500">Subjects Mastered</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {masteredTracks.length} Track{masteredTracks.length === 1 ? '' : 's'}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="text-xs text-slate-500">Verified Certificates</div>
            <div className="text-2xl font-extrabold text-[#0052CC] mt-1">
              {learner.certsPublic ? `${certificates.length} Issued` : 'Private'}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Active Learning Streak</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {learner.streakDays} Days
              </div>
            </div>
            <Flame className="w-7 h-7 text-[#0052CC]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">Verified Credentials</h2>
          {!learner.certsPublic ? (
            <p className="text-xs text-slate-500">Certificate details are hidden by the learner.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((c) => (
                <div
                  key={c.certificateId}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#0052CC]">
                      {c.certificateId}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {c.tier} ({c.score}%)
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{c.courseName}</div>
                  <Link
                    to={`/verify?id=${c.certificateId}`}
                    className="inline-block text-xs font-bold text-[#0052CC] hover:underline"
                  >
                    Verify Authenticity &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export const LearnerSearchPage: React.FC = () => {
  // Figma p50: Find a Learner
  const { learner, certificates } = useApp();
  const [q, setQ] = useState('');

  const learners = [
    ...(learner.profilePublic
      ? [
          {
            name: learner.name,
            username: learner.username,
            track: 'Data Structures & Algorithms',
            certs: certificates.length,
          },
        ]
      : []),
    {
      name: 'Ayesha Khan',
      username: 'ayesha-khan',
      track: 'Object-Oriented Programming',
      certs: 1,
    },
  ].filter(
    (l) =>
      l.name.toLowerCase().includes(q.toLowerCase()) ||
      l.username.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <LearnerShell breadcrumb="Find a Learner">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#0052CC]">
            FIND A LEARNER
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            Explore Public Learner Profiles
          </h1>
          <p className="text-xs text-slate-500">
            Search the network to explore public profiles, view academic trajectories, and discover
            shared learning paths.
          </p>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search learner by name or username..."
            className="flex-1 text-sm focus:outline-none"
          />
        </div>

        {learners.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No public learners found matching &ldquo;{q}&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learners.map((l) => (
              <div
                key={l.username}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900">{l.name}</div>
                  <div className="text-xs text-slate-500">
                    @{l.username} • {l.track} • {l.certs} Certificates
                  </div>
                </div>
                <Link
                  to={`/u/${l.username}`}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 text-[#0052CC] text-xs font-bold"
                >
                  View Record
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </LearnerShell>
  );
};

export const SettingsAndCoursesPage: React.FC = () => {
  // Figma p51, p52 (Course Management) & p53 (Account Settings)
  const { learner, updateUserProfile, courses, activeCourse, setActiveCourseId } = useApp();
  const [name, setName] = useState(learner.name);
  const [username, setUsername] = useState(learner.username);
  const [learningGoal, setLearningGoal] = useState(learner.learningGoal || '');
  const [profilePublic, setProfilePublic] = useState(learner.profilePublic);
  const [certsPublic, setCertsPublic] = useState(learner.certsPublic);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeText(name, 80) || learner.name;
    const cleanUsername =
      sanitizeText(username, 40)
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '') || learner.username;
    const initials =
      cleanName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('') || learner.avatarInitials;

    updateUserProfile({
      name: cleanName,
      username: cleanUsername,
      avatarInitials: initials,
      learningGoal: sanitizeText(learningGoal, 400),
      profilePublic,
      certsPublic,
    });
    setName(cleanName);
    setUsername(cleanUsername);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <LearnerShell breadcrumb="Settings & Course Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Account Settings &amp; Course Management
          </h1>
          <p className="text-xs text-slate-500">
            Manage your enrolled academic tracks, switch your active learning context, or update
            visibility preferences.
          </p>
        </div>

        {/* Course Management (p51 & p52) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">
            Course Management (Switch Active Track)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((c) => {
              const isAct = c.id === activeCourse.id;
              return (
                <div
                  key={c.id}
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    isAct ? 'border-2 border-[#0052CC] bg-blue-50/30' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-[#0052CC]">{c.code}</div>
                    <div className="text-sm font-extrabold text-slate-900">{c.name}</div>
                    <div className="text-[11px] text-slate-500">
                      Mastery: {c.overallMastery}% • {c.topicCount} Topics
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveCourseId(c.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                      isAct
                        ? 'bg-[#0052CC] text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {isAct ? 'Active Track ✓' : 'Switch Active'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile & Privacy Settings (p53) */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-extrabold text-slate-900">
            Profile Information &amp; Public Visibility
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#0052CC]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Public Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#0052CC]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Learning Goal</label>
            <textarea
              rows={2}
              value={learningGoal}
              onChange={(e) => setLearningGoal(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#0052CC]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={profilePublic}
                onChange={(e) => setProfilePublic(e.target.checked)}
                className="rounded border-slate-300 text-[#0052CC]"
              />
              <span className="font-semibold text-slate-700">Make my public profile visible to others</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={certsPublic}
                onChange={(e) => setCertsPublic(e.target.checked)}
                className="rounded border-slate-300 text-[#0052CC]"
              />
              <span className="font-semibold text-slate-700">Show holder details on certificate verification</span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saved ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Settings saved!
              </span>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] text-white text-xs font-bold cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </LearnerShell>
  );
};

export const HelpAndArchitecturePage: React.FC = () => {
  // Figma p54: SYSTEM ARCHITECTURE — Intelligent Adaptation, Explained
  return (
    <LearnerShell breadcrumb="Help & System Architecture">
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#0052CC]">
            SYSTEM ARCHITECTURE
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Intelligent Adaptation, Explained.
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Learnova is not a static curriculum. It is a dynamic reasoning engine that combines
            multi-signal diagnostic profiling, Bayesian Knowledge Tracing (BKT), a prerequisite
            knowledge graph, and Retrieval-Grounded LLM generation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
            {[
              {
                step: 'Stage 01',
                title: 'Multi-Signal Diagnostic',
                desc: 'Captures response accuracy, response latency, self-reported confidence, and answer revisions.',
              },
              {
                step: 'Stage 02',
                title: 'BKT Learner Profile',
                desc: 'Computes per-topic mastery probability and classifies errors into Conceptual, Procedural, or Careless.',
              },
              {
                step: 'Stage 03',
                title: 'LLM + DAG Roadmap',
                desc: 'Reasons over the knowledge graph to sequence topics with plain-language justifications.',
              },
              {
                step: 'Stage 04',
                title: 'Continuous Adaptation',
                desc: 'Silently re-evaluates after every micro-assessment and awards verified certificates at ≥70% and ≥90%.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
              >
                <div className="text-[10px] font-bold text-[#0052CC] uppercase">{item.step}</div>
                <div className="text-sm font-extrabold text-slate-900">{item.title}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LearnerShell>
  );
};
