"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Zap, Mail, Lock, User as UserIcon, Shield, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      const res = await register(name, email, role);
      if (res.success) {
        setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke dashboard...");
        setTimeout(() => {
          if (role === "ADMIN") {
            router.push("/dashboard/admin");
          } else {
            router.push("/dashboard/customer");
          }
        }, 1500);
      } else {
        setErrorMsg(res.error || "Pendaftaran gagal.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan sistem.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center min-h-[80vh] px-4 py-12 relative">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none -z-10"></div>

      {/* Card wrapper */}
      <div className="w-full max-w-md glass-panel rounded-2xl border border-white/5 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-lg animate-glow-cyan">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              Student<span className="text-cyan-400">Hub</span>
            </span>
          </Link>
          <h2 className="font-display font-semibold text-2xl text-white">Buat Akun Baru</h2>
          <p className="text-slate-400 text-sm">Daftar sekarang untuk mulai menjual atau membeli project mahasiswa.</p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm flex items-start gap-2.5 animate-pulse">
            <Zap className="h-5 w-5 flex-shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Nama Lengkap
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <UserIcon className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-500 text-sm transition-all focus:outline-none"
                placeholder="Nama Anda / Perusahaan"
              />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Alamat Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-500 text-sm transition-all focus:outline-none"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          {/* Role selection input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Tipe Peran (Role)
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* USER Option */}
              <button
                type="button"
                onClick={() => setRole("USER")}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                  role === "USER"
                    ? "bg-cyan-500/10 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-glow-cyan"
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <UserIcon className="h-5 w-5" />
                <span className="font-semibold">User Biasa (USER)</span>
              </button>
              {/* ADMIN Option */}
              <button
                type="button"
                onClick={() => setRole("ADMIN")}
                className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                  role === "ADMIN"
                    ? "bg-violet-500/10 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)] animate-glow-indigo"
                    : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <Shield className="h-5 w-5" />
                <span className="font-semibold">Administrator (ADMIN)</span>
              </button>
            </div>
          </div>

          {/* Dummy notice */}
          <p className="text-[10px] text-slate-500 leading-relaxed text-center">
            *Untuk kemudahan demo, kata sandi akun baru Anda akan otomatis diatur menjadi <span className="text-cyan-400 font-mono">password123</span>.
          </p>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 relative group flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 cursor-pointer"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500"></span>
            <span className="relative z-10 flex items-center gap-1.5 text-sm sm:text-base">
              {isSubmitting ? "Mendaftar..." : "Daftar Akun"}
              {!isSubmitting && <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />}
            </span>
          </button>
        </form>

        {/* Navigation to Login */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-xs sm:text-sm">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="text-cyan-400 hover:underline font-medium">
              Masuk Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
