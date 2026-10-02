import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, KeyRound, CheckCircle2, ArrowRight, Eye, EyeOff, UserCheck } from 'lucide-react';
import { AdminUser } from '../types';

interface AdminLoginViewProps {
  onLoginSuccess: (user: AdminUser) => void;
  onBackToStore: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onLoginSuccess, onBackToStore }) => {
  const [email, setEmail] = useState('superadmin@aurabotanica.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [errorMessage, setErrorMessage] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const DEMO_ADMINS: Record<string, AdminUser> = {
    'superadmin@aurabotanica.com': { id: 1, name: 'Jessica Wardhana', email: 'superadmin@aurabotanica.com', role: 'Super Admin' },
    'orders@aurabotanica.com': { id: 2, name: 'Dimas Anggara', email: 'orders@aurabotanica.com', role: 'Order Manager' },
    'editor@aurabotanica.com': { id: 3, name: 'Clara Suteja', email: 'editor@aurabotanica.com', role: 'Editor' }
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setErrorMessage('Akun terkunci sementara karena 5 kali percobaan gagal. Tunggu 60 detik.');
      return;
    }

    if (password !== 'password123' || !DEMO_ADMINS[email]) {
      const nextFail = failedAttempts + 1;
      setFailedAttempts(nextFail);
      if (nextFail >= 5) {
        setIsLocked(true);
        setErrorMessage('Terlalu banyak percobaan gagal (5/5). Rate limiting aktif.');
        setTimeout(() => {
          setIsLocked(false);
          setFailedAttempts(0);
          setErrorMessage('');
        }, 30000);
      } else {
        setErrorMessage(`Email atau password salah! Percobaan gagal: ${nextFail}/5.`);
      }
      return;
    }

    // Pass credentials check. Move to 2FA for Super Admin
    setErrorMessage('');
    if (email === 'superadmin@aurabotanica.com') {
      setStep('2fa');
    } else {
      onLoginSuccess(DEMO_ADMINS[email]);
    }
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo 2FA accepts 6 digits or default 123456
    if (twoFactorCode.trim().length === 6 || twoFactorCode === '123456') {
      onLoginSuccess(DEMO_ADMINS[email]);
    } else {
      setErrorMessage('Kode verifikasi 2FA tidak valid. Masukkan 6 digit (contoh: 123456).');
    }
  };

  const quickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-[#141210]">
      <div className="w-full max-w-md bg-[#1F1C1A] border border-[#3A332E] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#9B786F]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative">
          <div className="w-14 h-14 bg-[#302B27] border border-[#48403A] rounded-2xl mx-auto flex items-center justify-center text-[#C4A49C] mb-4 shadow-inner">
            <Lock size={24} />
          </div>
          <span className="text-[11px] font-mono tracking-[0.25em] uppercase text-[#9B786F] block font-semibold">
            SECURE ACCESS GATEWAY
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl text-white font-medium mt-1">
            Portal Administrasi
          </h1>
          <p className="text-xs text-[#9E9285] mt-1.5">
            Otorisasi berstandar enkripsi SSL 256-bit & session guard
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-2.5">
            <ShieldAlert size={16} className="text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-[#D4C7B8] font-medium block mb-1.5 flex justify-between">
                <span>Email Administrator</span>
                <span className="text-[#736B63] font-mono">Bcrypt Authenticated</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#736B63]" />
                <input
                  type="email"
                  required
                  value={email}
                  disabled={isLocked}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#171513] border border-[#3A332E] focus:border-[#C4A49C] text-white rounded-xl text-xs focus:outline-none transition font-mono"
                  placeholder="admin@aurabotanica.com"
                />
              </div>
            </div>

            <div>
              <label className="text-[#D4C7B8] font-medium block mb-1.5 flex justify-between">
                <span>Master Password</span>
                <span className="text-[#736B63]">min. 8 karakter</span>
              </label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#736B63]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  disabled={isLocked}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#171513] border border-[#3A332E] focus:border-[#C4A49C] text-white rounded-xl text-xs focus:outline-none transition font-mono"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#736B63] hover:text-[#D4C7B8] transition"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLocked}
                className="w-full py-3.5 bg-[#9B786F] hover:bg-[#83635B] active:scale-[0.99] disabled:bg-[#38312B] disabled:text-[#736B63] text-white font-semibold rounded-xl text-xs uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-2"
              >
                <span>Verifikasi Identitas</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handle2FASubmit} className="space-y-5 text-xs animate-in fade-in">
            <div className="p-3.5 bg-[#27221E] border border-[#3E3833] rounded-xl text-center space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-[#C4A49C] font-semibold">Two-Factor Authentication</span>
              <p className="text-[#9E9285] text-xs">
                Masukkan kode TOTP 6-digit Authenticator untuk <strong>{email}</strong>
              </p>
            </div>

            <div>
              <label className="text-[#D4C7B8] font-medium block mb-1.5 text-center">
                Kode Verifikasi 6-Digit (Demo: <code>123456</code>)
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                required
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full py-3 bg-[#171513] border border-[#3A332E] focus:border-[#C4A49C] text-center text-white tracking-[0.5em] font-mono text-xl rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="w-1/3 py-3 bg-[#2A2420] text-[#9E9285] hover:text-white rounded-xl text-xs font-semibold"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="w-2/3 py-3 bg-[#9B786F] hover:bg-[#83635B] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition"
              >
                Konfirmasi Masuk
              </button>
            </div>
          </form>
        )}

        {/* Demo Roles Quick Fill Selector */}
        <div className="mt-8 pt-6 border-t border-[#302B27] space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-[#736B63] font-mono">
            <span>PILIH ROLE DEMO:</span>
            <span>Default: password123</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickFill('superadmin@aurabotanica.com')}
              className={`p-2 rounded-lg border text-[11px] text-left transition ${
                email === 'superadmin@aurabotanica.com'
                  ? 'border-[#9B786F] bg-[#302B27] text-white'
                  : 'border-[#332D28] text-[#9E9285] hover:bg-[#25211E]'
              }`}
            >
              <div className="font-semibold text-white">Super Admin</div>
              <div className="text-[10px] text-[#736B63] truncate">Semua Akses</div>
            </button>

            <button
              type="button"
              onClick={() => quickFill('orders@aurabotanica.com')}
              className={`p-2 rounded-lg border text-[11px] text-left transition ${
                email === 'orders@aurabotanica.com'
                  ? 'border-[#9B786F] bg-[#302B27] text-white'
                  : 'border-[#332D28] text-[#9E9285] hover:bg-[#25211E]'
              }`}
            >
              <div className="font-semibold text-white">Order Mgr</div>
              <div className="text-[10px] text-[#736B63] truncate">Pesanan & Resi</div>
            </button>

            <button
              type="button"
              onClick={() => quickFill('editor@aurabotanica.com')}
              className={`p-2 rounded-lg border text-[11px] text-left transition ${
                email === 'editor@aurabotanica.com'
                  ? 'border-[#9B786F] bg-[#302B27] text-white'
                  : 'border-[#332D28] text-[#9E9285] hover:bg-[#25211E]'
              }`}
            >
              <div className="font-semibold text-white">Catalog Edit</div>
              <div className="text-[10px] text-[#736B63] truncate">Produk & Stok</div>
            </button>
          </div>
        </div>

        {/* Back to store */}
        <div className="text-center mt-6">
          <button
            onClick={onBackToStore}
            className="text-xs text-[#736B63] hover:text-[#C4A49C] transition underline underline-offset-4"
          >
            &larr; Kembali ke Toko Publik (Storefront)
          </button>
        </div>
      </div>
    </div>
  );
};
