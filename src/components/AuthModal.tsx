import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, ArrowRight, Pill } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'pharmacist' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login(email, password);
        onSuccess(res.user);
      } else {
        const res = await api.register(name, email, password, phone, role);
        onSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoRole: 'user' | 'pharmacist' | 'admin') => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const emailMap = {
        user: 'patient@medifind.ai',
        pharmacist: 'pharmacist@apollo.com',
        admin: 'admin@medifind.ai'
      };
      const res = await api.login(emailMap[demoRole], 'pass123');
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMsg('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17231D]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="auth-modal"
        className="bg-[#FFFFFF] w-full max-w-md rounded-3xl shadow-2xl border border-[#DDE8D2] p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#DDE8D2] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#173B2B] text-white flex items-center justify-center">
              <Pill size={16} className="text-[#DDE8D2]" />
            </div>
            <h3 className="text-xl font-bold font-heading text-[#17231D]">
              {isLogin ? 'Sign in to MediFind AI' : 'Create an Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F7F9F4] text-[#69736D]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Demo Fast Login Buttons for Evaluation */}
        <div className="bg-[#F7F9F4] p-3 rounded-2xl border border-[#DDE8D2] mb-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#69736D] mb-2">
            Minor Project Evaluation Quick-Login:
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => handleQuickDemoLogin('user')}
              type="button"
              className="py-1.5 px-2 rounded-xl bg-white hover:bg-[#DDE8D2] text-[#173B2B] text-[11px] font-bold border border-[#DDE8D2] transition-colors"
            >
              Patient
            </button>
            <button
              onClick={() => handleQuickDemoLogin('pharmacist')}
              type="button"
              className="py-1.5 px-2 rounded-xl bg-white hover:bg-[#DDE8D2] text-[#173B2B] text-[11px] font-bold border border-[#DDE8D2] transition-colors"
            >
              Pharmacist
            </button>
            <button
              onClick={() => handleQuickDemoLogin('admin')}
              type="button"
              className="py-1.5 px-2 rounded-xl bg-white hover:bg-[#DDE8D2] text-[#173B2B] text-[11px] font-bold border border-[#DDE8D2] transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FDF0F0] border border-[#D95C5C]/30 text-xs text-[#D95C5C] font-semibold mb-4">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {!isLogin && (
            <div>
              <label className="font-bold text-[#17231D] block mb-1">Full Name</label>
              <div className="relative">
                <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#69736D]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-[#17231D] block mb-1">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#69736D]" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="font-bold text-[#17231D] block mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#69736D]" />
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-[#17231D] block mb-1">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#69736D]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="font-bold text-[#17231D] block mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE8D2] text-xs text-[#17231D] focus:outline-none focus:border-[#173B2B]"
              >
                <option value="user">Patient / General User</option>
                <option value="pharmacist">Chemist / Pharmacist Staff</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-2xl bg-[#173B2B] text-white text-xs font-bold hover:bg-[#173B2B]/90 transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight size={14} className="text-[#DDE8D2]" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[#DDE8D2] text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg(null);
            }}
            className="text-xs font-semibold text-[#173B2B] hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
