"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Zap, KeyRound, ArrowRight, AlertTriangle } from "lucide-react";
import Link from "next/link";

function Verify2FAForm() {
    const [code, setCode] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const { verifyOtp, user } = useAuth();

    const email = searchParams.get("email");

    useEffect(() => {
        if (!email) {
            router.push("/login");
        }
    }, [email, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setErrorMsg("Email tidak ditemukan. Silakan coba login kembali.");
            return;
        }
        setErrorMsg("");
        setIsSubmitting(true);

        try {
            const res = await verifyOtp(email, code);
            if (res.success) {
                const userRole = res.user?.role || user?.role;
                if (userRole === "ADMIN") {
                    router.push("/dashboard/admin");
                } else {
                    router.push("/dashboard/customer");
                }
            } else {
                setErrorMsg(res.error || "Kode OTP tidak valid.");
            }
        } catch (err) {
            setErrorMsg("Terjadi kesalahan sistem saat verifikasi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-center items-center min-h-[80vh] px-4 py-12 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none -z-10"></div>

            <div className="w-full max-w-md glass-panel rounded-2xl border border-white/5 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <div className="text-center space-y-3 mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="p-2 bg-linear-to-tr from-cyan-500 to-indigo-500 rounded-lg animate-glow-indigo">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-display font-bold text-xl text-white">
                            Student<span className="text-cyan-400">Hub</span>
                        </span>
                    </Link>
                    <h2 className="font-display font-semibold text-2xl text-white">Verifikasi Dua Langkah</h2>
                    <p className="text-slate-400 text-sm">Masukkan kode OTP yang dikirim ke email Anda.</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                            Kode Verifikasi (6 Digit)
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                                <KeyRound className="h-5 w-5" />
                            </span>
                            <input
                                type="text"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-500 text-sm tracking-[0.2em] text-center transition-all focus:outline-none"
                                placeholder="_ _ _ _ _ _"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !code || code.length < 6}
                        className="w-full relative group flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 cursor-pointer"
                    >
                        <span className="absolute inset-0 bg-linear-to-r from-cyan-500 to-indigo-500"></span>
                        <span className="relative z-10 flex items-center gap-1.5 text-sm sm:text-base">
                            {isSubmitting ? "Memverifikasi..." : "Verifikasi & Masuk"}
                            {!isSubmitting && <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />}
                        </span>
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-400 text-xs sm:text-sm">
                        Bukan Anda?{" "}
                        <Link href="/login" className="text-cyan-400 hover:underline font-medium">
                            Kembali ke Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function Verify2FAPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Verify2FAForm />
        </Suspense>
    )
}
