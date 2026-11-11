import React, { useState } from 'react';
import { firestoreService } from '../services/firestoreService';
import { Role, UserProfile } from '../types';
import {
  Coffee,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Flame,
  ClipboardList,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowRight,
  User as UserIcon,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (userProfile: UserProfile, message: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('farid@bdscoffee.id');
  const [password, setPassword] = useState<string>('bdscoffee123');
  const [name, setName] = useState<string>('Farid Fauzi');
  const [role, setRole] = useState<Role>('office_staff');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await firestoreService.signUp(email, password, name, role);
        onLoginSuccess(
          {
            id: 'temp',
            name,
            role,
            title: role === 'head_roaster' ? 'Head Roaster' : role === 'admin' ? 'Executive Admin' : 'Warehouse Officer',
            avatarInitials: name.slice(0, 2).toUpperCase(),
            email,
          },
          `Account registered for ${name} (${role.replace('_', ' ')})!`
        );
      } else {
        await firestoreService.signIn(email, password);
        // Auth state listener in App will update userProfile and switch view
      }
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. You can also use the 1-Click Quick Demo buttons below!');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email already exists. Please switch to "Sign In" mode.');
      } else {
        setError(err.message || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Quick Demo Preset Login
  const handleQuickLogin = async (targetEmail: string, targetName: string, targetRole: Role) => {
    setLoading(true);
    setError(null);
    const demoPass = 'bdscoffee123';

    try {
      try {
        await firestoreService.signIn(targetEmail, demoPass);
        // Auth listener in App will pick up the user
      } catch (signInErr: any) {
        // If user doesn't exist yet in this Firebase project, auto-register them
        if (
          signInErr.code === 'auth/user-not-found' ||
          signInErr.code === 'auth/invalid-credential' ||
          signInErr.code === 'auth/wrong-password'
        ) {
          console.log(`Auto-registering demo user ${targetEmail} in Firebase Auth...`);
          await firestoreService.signUp(targetEmail, demoPass, targetName, targetRole);
        } else {
          throw signInErr;
        }
      }
    } catch (err: any) {
      console.error('Quick login error:', err);
      setError(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0907] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-[#0ea5e9] selection:text-white">
      {/* Background Atmosphere & Ambient Neon Radial Glows */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft cyan & electric blue glow matching reference */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-b from-[#0284c7]/20 via-[#38bdf8]/10 to-transparent rounded-full blur-[110px]" />
        {/* Warm espresso underglow */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#e07a48]/10 rounded-full blur-[130px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* Floating Illuminated Sphere Badge with Electric Orbit Arc (Exactly as in Reference image_4415982c.png) */}
        <div className="relative mb-6">
          {/* Ambient glow behind sphere */}
          <div className="absolute -inset-3 bg-[#38bdf8]/30 rounded-full blur-xl animate-pulse" />

          {/* 3D Glass Sphere */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#38bdf8] via-[#0284c7] to-[#0c4a6e] p-[1.5px] shadow-[0_0_30px_rgba(56,189,248,0.5)] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#0ea5e9] to-[#0369a1] flex items-center justify-center relative overflow-hidden">
              {/* Highlight flare on top */}
              <div className="absolute top-1 left-2 right-2 h-4 bg-white/40 rounded-full blur-[2px]" />
              <Coffee className="w-7 h-7 text-white drop-shadow-md relative z-10" />
            </div>
          </div>

          {/* Orbital glowing light spark */}
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_#ffffff,0_0_20px_#38bdf8]" />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-white/60 rounded-full blur-sm" />
        </div>

        {/* Main Glassmorphic Login Card */}
        <div className="w-full bg-[#15100d]/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(14,165,233,0.12)] space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
              <span className="bg-gradient-to-r from-white via-[#f0f9ff] to-[#bae6fd] bg-clip-text text-transparent">
                BDS Coffee
              </span>
              <span className="text-xs font-mono font-bold text-[#38bdf8] bg-[#0c4a6e]/40 border border-[#0284c7]/40 px-2 py-0.5 rounded-full">
                Roastery OS
              </span>
            </h1>
            <p className="text-xs text-[#94a3b8]">Good to see you. Dive back in.</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-3 flex items-start gap-2 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider block">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-[#64748b] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Farid Fauzi"
                      className="w-full bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/40 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#64748b] outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Role Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider block">
                    Roastery Department Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full bg-[#1b1410] border border-white/10 focus:border-[#38bdf8] rounded-2xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="office_staff">Office & Warehouse Staff (Farid / Farhan)</option>
                    <option value="head_roaster">Head Roaster & Production (Rangga)</option>
                    <option value="admin">Executive Admin & Finance (Rafi)</option>
                  </select>
                </div>
              </>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/40 rounded-2xl px-4 py-3 text-sm text-white placeholder-[#64748b] outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-white/[0.04] border border-white/10 hover:border-white/20 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8]/40 rounded-2xl px-4 py-3 pr-11 text-sm text-white placeholder-[#64748b] outline-none transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#64748b] hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#94a3b8] hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-white/5 border-white/20 text-[#0ea5e9] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Password reset is tied to Firebase Auth. In this environment, use the 1-Click Quick Demo buttons below!')}
                className="text-[#38bdf8] hover:text-[#7dd3fc] transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Glowing Sign In Button (Styled exactly as in reference image) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] hover:from-[#0369a1] hover:via-[#0284c7] hover:to-[#0ea5e9] text-white font-bold py-3.5 px-6 rounded-full shadow-[0_0_30px_rgba(14,165,233,0.45)] hover:shadow-[0_0_40px_rgba(14,165,233,0.65)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Signing in with Firebase...</span>
                </>
              ) : (
                <span>{isSignUp ? 'Create Roastery Account' : 'Sign in'}</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-1">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#15100d] px-3 text-[11px] text-[#64748b] uppercase tracking-wider whitespace-nowrap">
              or quick demo access
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Quick-Access Demo Login Buttons (Requested: Farid/Farhan, Rangga, Rafi) */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('farid@bdscoffee.id', 'Farid Fauzi', 'office_staff')}
              className="w-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-sky-500/40 rounded-2xl p-2.5 flex items-center justify-between text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/25 transition-colors">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block group-hover:text-sky-300 transition-colors">
                    Farid / Farhan
                  </span>
                  <span className="text-[10px] text-[#94a3b8]">Office & Warehouse Staff · Stock In/Out & Silos</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#64748b] group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('rangga@bdscoffee.id', 'Rangga Prawira', 'head_roaster')}
              className="w-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-amber-500/40 rounded-2xl p-2.5 flex items-center justify-between text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#e07a48]/15 border border-[#e07a48]/30 flex items-center justify-center text-[#e07a48] group-hover:bg-[#e07a48]/25 transition-colors">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block group-hover:text-amber-300 transition-colors">
                    Rangga Prawira
                  </span>
                  <span className="text-[10px] text-[#94a3b8]">Head Roaster · Drum Queue, Weight Loss, Degas</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#64748b] group-hover:text-[#e07a48] group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('rafi@bdscoffee.id', 'Rafi Ramadhan', 'admin')}
              className="w-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-emerald-500/40 rounded-2xl p-2.5 flex items-center justify-between text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/25 transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block group-hover:text-emerald-300 transition-colors">
                    Rafi Ramadhan
                  </span>
                  <span className="text-[10px] text-[#94a3b8]">Executive Admin · Warehouse Valuation & Audit</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#64748b] group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* Toggle between Sign In and Sign Up */}
          <div className="pt-2 text-center text-xs text-[#94a3b8]">
            {isSignUp ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-[#38bdf8] font-bold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            ) : (
              <span>
                New staff member?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-[#38bdf8] font-bold hover:underline cursor-pointer"
                >
                  Create account
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Security watermark footer */}
        <div className="mt-6 flex items-center gap-2 text-[11px] text-[#64748b] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Firebase Auth & Firestore 256-bit Encrypted Connection</span>
        </div>
      </div>
    </div>
  );
};
