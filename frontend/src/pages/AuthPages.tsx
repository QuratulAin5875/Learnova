import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  RotateCcw,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { PublicLayout } from '../components/Layouts';
import { useApp } from '../context/AppContext';
import { sanitizeText } from '../lib/api';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAsLearner, updateUserProfile } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activated, setActivated] = useState(false);

  // Interactive Figma state presets (p02 empty, p03 duplicate email, p04 weak pass, p05 invalid email, p06 strong, p07 activated)
  const hasMinLen = password.length >= 8;
  const hasNumAndSym = /[0-9]/.test(password) && /[!@#$%^&*]/.test(password);
  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const score = [hasMinLen, hasNumAndSym, hasUpperLower].filter(Boolean).length;

  const isDuplicateEmail = email.trim().toLowerCase() === 'existing@university.edu';
  const isInvalidEmail = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isWeakSubmit = password.length > 0 && score < 3;
  const mismatch = confirmPassword.length > 0 && confirmPassword !== password;
  const canSubmit =
    fullName.trim().length > 1 && email.length > 0 && !isInvalidEmail && !isDuplicateEmail && score === 3 && confirmPassword === password;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setActivated(true);
    }, 600);
  };

  if (activated) {
    // Figma p07: Account Activated
    return (
      <PublicLayout rightMode="auth">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md w-full p-8 text-center space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ACCOUNT ACTIVATED</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome to Learnova</h1>
            <p className="text-xs text-slate-600">
              Your account is active. Next, tell us about your goals so we can configure your
              personalized AI learning path.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1">
              <div className="text-xs font-bold text-slate-800">Personalized Curriculum Ready</div>
              <div className="text-[11px] text-slate-500">Setup takes less than 2 minutes</div>
            </div>
            <button
              onClick={() => {
                const clean = sanitizeText(fullName, 80);
                const initials = clean.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'U';
                updateUserProfile({ name: clean, email: email.trim().toLowerCase(), avatarInitials: initials, onboardingCompleted: false });
                loginAsLearner();
                navigate('/onboarding');
              }}
              className="w-full py-3 rounded-xl bg-[#0052CC] hover:bg-[#0043A8] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout rightMode="auth">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        {/* Preset bar to trigger exact Figma validation states p02–p07 in one click */}
        <div className="mb-6 flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-[11px]">
          <span className="font-semibold text-slate-500">Figma States (p02–p07):</span>
          <button
            type="button"
            onClick={() => {
              setEmail('existing@university.edu');
              setPassword('StrongPass#2026');
            }}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-medium text-slate-700"
          >
            Duplicate Email (p03)
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('alex.morgan@university.edu');
              setPassword('12345');
            }}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-medium text-slate-700"
          >
            Weak Password (p04)
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('alex.morgan@invalid-email');
              setPassword('StrongPass#2026');
            }}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-medium text-slate-700"
          >
            Invalid Email (p05)
          </button>
          <button
            type="button"
            onClick={() => {
              setFullName('Alex Morgan');
              setEmail('alex.morgan@university.edu');
              setPassword('NeuroVault#2026!');
              setConfirmPassword('NeuroVault#2026!');
            }}
            className="px-2 py-0.5 rounded bg-blue-50 text-[#0052CC] font-semibold"
          >
            Strong Ready (p06)
          </button>
        </div>

        <div className="text-center max-w-md mb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-[#0052CC] text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>START YOUR LEARNING JOURNEY</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Create your account</h1>
          <p className="text-xs text-slate-500">
            Join Learnova to build your personalized AI-driven curriculum tailored to your exact pace
            and goals.
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md w-full p-7 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#0052CC]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex.morgan@university.edu"
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border focus:outline-none ${
                  isDuplicateEmail || isInvalidEmail
                    ? 'border-red-500 bg-red-50/30'
                    : 'border-slate-200 focus:border-[#0052CC]'
                }`}
              />
            </div>
            {isDuplicateEmail && (
              <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center justify-between">
                <span>An account with this email already exists.</span>
                <Link to="/login" className="underline font-bold">
                  Log in
                </Link>
              </p>
            )}
            {isInvalidEmail && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">
                Enter a valid email address.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border focus:outline-none ${
                  isWeakSubmit ? 'border-red-500' : 'border-slate-200 focus:border-[#0052CC]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isWeakSubmit && (
              <p className="mt-1 text-xs text-red-600 font-medium">Password is too weak</p>
            )}

            {/* Complexity Index Box (from p02-p06) */}
            <div className="mt-2.5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">Complexity Index</span>
                <span
                  className={`font-bold ${
                    score === 3
                      ? 'text-emerald-600'
                      : score >= 1
                      ? 'text-amber-600'
                      : 'text-slate-400'
                  }`}
                >
                  {score === 3 ? 'Strong' : score >= 1 ? 'Weak' : ''}
                </span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    score === 3 ? 'w-full bg-emerald-500' : score >= 1 ? 'w-1/3 bg-red-500' : 'w-0'
                  }`}
                />
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                      hasMinLen ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-400'
                    }`}
                  />
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                      hasNumAndSym
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-400'
                    }`}
                  />
                  <span>Includes a number and symbol (!@#$%^&amp;*)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                      hasUpperLower
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-400'
                    }`}
                  />
                  <span>Uppercase and lowercase letters</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <RotateCcw className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border focus:outline-none ${
                  mismatch ? 'border-red-500' : 'border-slate-200 focus:border-[#0052CC]'
                }`}
              />
            </div>
            {mismatch && <p className="mt-1.5 text-xs text-red-600 font-medium">Passwords do not match.</p>}
          </div>

          <button
            type="submit"
            disabled={submitting || !canSubmit}
            className="w-full py-3 rounded-lg bg-[#0052CC] hover:bg-[#0043A8] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-center text-slate-500">
            By signing up, you agree to Learnova&apos;s{' '}
            <span className="text-[#0052CC] font-medium">Terms of Service</span> and{' '}
            <span className="text-[#0052CC] font-medium">Privacy Policy</span>.
          </p>

          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0052CC] font-bold hover:underline">
              Log in &gt;
            </Link>
          </div>
        </form>
      </div>
    </PublicLayout>
  );
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loginAsLearner, loginAsAdmin } = useApp();
  const location = useLocation();
  const { isAuthenticated, user, showFigmaPresets } = useApp();
  const [email, setEmail] = useState('alex.morgan@university.edu');
  const [password, setPassword] = useState('');
  const [bannerState, setBannerState] = useState<'none' | 'invalid' | 'expired'>(
    searchParams.get('expired') === '1' ? 'expired' : 'none'
  );

  // Mock auth until the Supabase backend is connected: any well-formed email + non-empty
  // password signs in; the admin email routes to the Admin Console.
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length > 0;
    if (!valid) {
      setBannerState('invalid');
      return;
    }
    setBannerState('none');
    if (email.trim().toLowerCase() === 'r.vance@university.edu') {
      loginAsAdmin();
      navigate('/admin/subjects', { replace: true });
      return;
    }
    loginAsLearner();
    const from = (location.state as { from?: string } | null)?.from;
    navigate(from && from !== '/login' ? from : '/dashboard', { replace: true });
  };

  if (isAuthenticated && bannerState === 'none') {
    // Already signed in: don't show the form again
    return <Navigate to={user?.role === 'admin' ? '/admin/subjects' : '/dashboard'} replace />;
  }

  return (
    <PublicLayout rightMode="auth">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        {/* Preset bar for Figma Login states p08-p11 */}
        <div className="mb-6 flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-[11px]">
          <span className="font-semibold text-slate-500">Figma States (p08–p11):</span>
          <button
            type="button"
            onClick={() => setBannerState('none')}
            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-medium text-slate-700"
          >
            Default (p08)
          </button>
          <button
            type="button"
            onClick={() => setBannerState('invalid')}
            className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-semibold"
          >
            Invalid Credentials (p09)
          </button>
          <button
            type="button"
            onClick={() => setBannerState('expired')}
            className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold"
          >
            Session Expired (p11)
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md w-full p-8 space-y-5">
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome back to Learnova</h1>
            <p className="text-xs text-slate-500">
              Sign in to resume your adaptive knowledge roadmap and practice.
            </p>
          </div>

          {bannerState === 'invalid' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Invalid credentials. Please check your email and password.</span>
            </div>
          )}

          {bannerState === 'expired' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Your session has expired. Please log in again.</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#0052CC]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#0052CC] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#0052CC]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#0052CC] hover:bg-[#0043A8] text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-[#0052CC] font-bold hover:underline">
                Sign up
              </Link>
            </span>
            {showFigmaPresets && (
              <button
                type="button"
                onClick={() => {
                  loginAsAdmin();
                  navigate('/admin/subjects');
                }}
                className="text-slate-500 hover:text-[#0052CC] font-semibold"
                title="Demo only"
              >
                Admin Demo &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  // Figma p12 (1. Request), p13 (2. Check email), p14 (3. New password), p15 (Updated)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState('alex.morgan@university.edu');
  const [newPass, setNewPass] = useState('NeuroVault#2026!');

  return (
    <PublicLayout rightMode="auth">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs max-w-md w-full p-8 space-y-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>

          {/* 3-Step Indicator from p12-p15 */}
          <div className="grid grid-cols-3 gap-2 text-[11px] font-bold">
            {[
              { s: 1, label: '1. Request' },
              { s: 2, label: '2. Check email' },
              { s: 3, label: '3. New password' },
            ].map((item) => (
              <button
                key={item.s}
                type="button"
                onClick={() => setStep(item.s as 1 | 2 | 3)}
                className={`py-1.5 px-2 rounded-md border text-center transition-colors ${
                  step >= item.s
                    ? 'bg-blue-50 border-blue-200 text-[#0052CC]'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h1 className="text-xl font-extrabold text-slate-900">Reset your password</h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter the email address associated with your Learnova account and we will send you a
                secure link to reset your credentials.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Reset tokens expire after 15 minutes for security compliance.
                </p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full py-2.5 rounded-lg bg-[#0052CC] text-white font-semibold text-sm cursor-pointer"
              >
                Send Reset Link
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0052CC] flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900">Check your email</h1>
              <p className="text-xs text-slate-600">
                We have sent password reset instructions to:{' '}
                <strong className="text-slate-900">{email}</strong>. Please check your inbox and
                click the reset link within 15 minutes.
              </p>
              <button
                onClick={() => setStep(3)}
                className="w-full py-2.5 rounded-lg bg-[#0052CC] text-white font-semibold text-sm cursor-pointer"
              >
                Simulate Clicking Email Link &rarr;
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h1 className="text-xl font-extrabold text-slate-900">Set a new password</h1>
              <p className="text-xs text-slate-600">
                Create a strong, secure password for your Learnova account.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  New Password
                </label>
                <input
                  type="text"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200"
                />
              </div>
              <button
                onClick={() => setStep(4)}
                className="w-full py-2.5 rounded-lg bg-[#0052CC] text-white font-semibold text-sm cursor-pointer"
              >
                Update Password
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900">
                Your password has been updated
              </h1>
              <p className="text-xs text-slate-600">
                Your password has been reset successfully. Active sessions on other devices have
                been terminated.
              </p>
              <Link
                to="/login"
                className="block w-full py-2.5 rounded-lg bg-[#0052CC] text-white font-semibold text-sm"
              >
                Return to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};


