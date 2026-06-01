"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Zap, Mail, Lock, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { login, user, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "ADMIN") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/customer");
      }
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        const userRole = res.user?.role || user?.role;
        if (userRole === "ADMIN") {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard/customer");
        }
      } else {
        const errText = res.error || "Login gagal.";
        if (errText.toLowerCase().includes("berhasil ditambahkan")) {
          setErrorMsg(""); // Menyembunyikan pesan sukses yang masuk ke error box
        } else {
          setErrorMsg(errText);
        }
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center min-h-[80vh] px-4 py-12 relative">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none -z-10"></div>
      
      {/* Card wrapper */}
      <div className="w-full max-w-md glass-panel rounded-2xl border border-white/5 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-lg animate-glow-indigo">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              Student<span className="text-cyan-400">Hub</span>
            </span>
          </Link>
          <h2 className="font-display font-semibold text-2xl text-white">Selamat Datang Kembali</h2>
          <p className="text-slate-400 text-sm">Masuk untuk mengakses marketplace dan dashboard Anda.</p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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

          {/* Password input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Kata Sandi
              </label>
              <a href="#" className="text-xs text-cyan-400 hover:underline">Lupa Password?</a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-500 text-sm transition-all focus:outline-none"
                placeholder="Masukkan kata sandi"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full relative group flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 cursor-pointer"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500"></span>
            <span className="relative z-10 flex items-center gap-1.5 text-sm sm:text-base">
              {isSubmitting ? "Memproses..." : "Masuk"}
              {!isSubmitting && <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />}
            </span>
          </button>
        </form>

        {/* Navigation to Register */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-xs sm:text-sm">
            Belum punya akun?{" "}
            <Link href="/register" className="text-cyan-400 hover:underline font-medium">
              Daftar Sekarang
            </Link>
          </p>
        </div>

        {/* Demo Credentials Helper Box */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2">
          <p className="text-[11px] font-bold text-cyan-500 uppercase tracking-widest text-center">Akun Demo (Klik untuk Isi):</p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={() => handleQuickLogin("mahasiswa@studenthub.id", "student123")}
              className="p-2 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-left transition-colors cursor-pointer"
            >
              <p className="font-semibold text-white">User Biasa (USER)</p>
              <p className="text-slate-500">mahasiswa@studenthub.id</p>
            </button>
            <button
              onClick={() => handleQuickLogin("admin@studenthub.id", "admin123")}
              className="p-2 rounded bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-left transition-colors cursor-pointer"
            >
              <p className="font-semibold text-white">Admin (ADMIN)</p>
              <p className="text-slate-500">admin@studenthub.id</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
