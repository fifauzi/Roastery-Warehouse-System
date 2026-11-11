import React, { useState } from 'react';
import { firestoreService } from '../services/firestoreService';
import { Role } from '../types';
import { Coffee, ShieldCheck, Flame, ClipboardList, LogIn, UserPlus, X, Loader2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('farid@bdscoffee.id');
  const [password, setPassword] = useState<string>('bdscoffee123');
  const [name, setName] = useState<string>('Farid Fauzi');
  const [role, setRole] = useState<Role>('office_staff');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await firestoreService.signUp(email, password, name, role);
        onSuccess(`Account created for ${name} (${role}) and signed in!`);
      } else {
        await firestoreService.signIn(email, password);
        onSuccess(`Successfully signed in as ${email}`);
      }
      onClose();
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      // If sign in failed because user not found, help user by giving direct hint
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid credentials. If this is your first time, click "Sign Up" below or use the 1-Click Quick Preset!');
      } else {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Quick Demo Sign-in Helper
  const handleQuickLogin = async (targetEmail: string, targetName: string, targetRole: Role) => {
    setLoading(true);
    setError(null);
    const demoPass = 'bdscoffee123';

    try {
      // Try signing in first
      try {
        await firestoreService.signIn(targetEmail, demoPass);
        onSuccess(`Signed in as ${targetName} (${targetRole})!`);
        onClose();
        return;
      } catch (signInErr: any) {
        // If user doesn't exist yet in this new Firebase project, auto-register them!
        if (
          signInErr.code === 'auth/user-not-found' ||
          signInErr.code === 'auth/invalid-credential' ||
          signInErr.code === 'auth/wrong-password'
        ) {
          console.log(`Auto-registering demo user ${targetEmail} in Firebase Auth...`);
          await firestoreService.signUp(targetEmail, demoPass, targetName, targetRole);
          onSuccess(`Created & signed in demo account for ${targetName}!`);
          onClose();
          return;
        }
        throw signInErr;
      }
    } catch (err: any) {
      console.error('Quick login error:', err);
      setError(err.message || 'Failed to authenticate demo user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0e0b09]/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-[#1c1511] border border-[#3d2e24] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-[#16110e] px-6 py-4 border-b border-[#31251e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e07a48]/20 border border-[#e07a48]/40 flex items-center justify-center text-[#e07a48]">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f5ece5]">
                {isSignUp ? 'Create Roastery Account' : 'Firebase Sign In'}
              </h3>
              <p className="text-xs text-[#8c7b6f]">BDS Coffee Cloud Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8c7b6f] hover:text-[#f5ece5] p-1.5 rounded-full hover:bg-[#271e18] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Role Presets */}
        <div className="p-6 pb-2 border-b border-[#2d221c]">
          <span className="text-[11px] font-medium text-[#a69588] block mb-2 font-mono uppercase tracking-wider">
            1-Click Roastery Role Presets:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('farid@bdscoffee.id', 'Farid Fauzi', 'office_staff')}
              className="p-2.5 bg-[#251d18] hover:bg-[#31261f] border border-[#3d2e24] rounded-xl text-left transition-colors cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-1 text-sky-400 mb-1">
                <ClipboardList className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold font-mono">Staff</span>
              </div>
              <span className="text-xs font-semibold text-[#f5ece5] block truncate">Farid F.</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('rangga@bdscoffee.id', 'Rangga Prawira', 'head_roaster')}
              className="p-2.5 bg-[#251d18] hover:bg-[#31261f] border border-[#3d2e24] rounded-xl text-left transition-colors cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-1 text-[#e07a48] mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold font-mono">Roaster</span>
              </div>
              <span className="text-xs font-semibold text-[#f5ece5] block truncate">Rangga P.</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('rafi@bdscoffee.id', 'Rafi Hidayat', 'admin')}
              className="p-2.5 bg-[#251d18] hover:bg-[#31261f] border border-[#3d2e24] rounded-xl text-left transition-colors cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-1 text-emerald-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold font-mono">Admin</span>
              </div>
              <span className="text-xs font-semibold text-[#f5ece5] block truncate">Rafi H.</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Farid Fauzi"
                  className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
                  System Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48]"
                >
                  <option value="office_staff">Office Staff (Warehouse & Stock In/Out)</option>
                  <option value="head_roaster">Head Roaster (Queue & Batch Logging)</option>
                  <option value="admin">Executive Admin & Finance</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@bdscoffee.id"
              className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#c4b5a9] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#16110e] border border-[#382b22] rounded-xl px-3 py-2 text-xs text-[#f5ece5] focus:outline-none focus:border-[#e07a48]"
            />
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-crema w-full py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Firebase...</span>
                </>
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account & Sign In</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with Firebase</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="text-xs text-[#a69588] hover:text-[#f5ece5] text-center pt-1"
            >
              {isSignUp
                ? 'Already have an account? Sign in here'
                : "Don't have an account? Register new user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
