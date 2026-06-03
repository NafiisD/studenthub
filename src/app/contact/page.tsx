"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2, User, AlertTriangle, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    if (!name || !email || !message) {
      setError("Mohon isi seluruh bidang formulir yang diwajibkan.");
      setIsSubmitting(false);
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = await res.json();
      const isSuccess = data.success === true || data.status === "success" || (res.ok && data.code >= 200 && data.code < 300);

      if (res.ok && isSuccess) {
        setSuccess(true);
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        const errMsg = Array.isArray(data.message) ? data.message.join(", ") : (data.message || "Gagal mengirim pesan.");
        setError(errMsg);
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 relative">
        {/* Ambient radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        <div className="text-center space-y-4 mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            Hubungi Kami
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white">
            Kirimkan Pesan Anda ke{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
              Administrator
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Ada pertanyaan, kerja sama bisnis, atau butuh bantuan teknis terkait StudentHub? Hubungi kami langsung melalui formulir pesan di bawah.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Quick Contact Info */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="glass-panel rounded-2xl border border-white/5 p-6 space-y-4 flex-grow flex flex-col justify-center">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Email Resmi</p>
                <p className="text-slate-200 text-sm font-semibold flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-cyan-400" /> hello@studenthub.id
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Waktu Layanan</p>
                <p className="text-slate-200 text-sm font-semibold">
                  Senin - Jumat | 09.00 - 17.00 WIB
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Pesan</p>
                <code className="text-xs text-cyan-400 font-mono bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-900 block mt-1 text-center">
                  Nantikan Update dari Kami!
                </code>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="md:col-span-8">
            <div className="glass-panel rounded-2xl border border-white/5 p-6 sm:p-8">
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm flex items-start gap-2.5 animate-pulse">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <p className="font-semibold text-white">Pesan Berhasil Dikirim!</p>
                    <p className="text-slate-400 mt-1">
                      Terima kasih atas pesan Anda. Administrator akan meninjau inquiry Anda di Dashboard Admin secepatnya.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <User className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Lengkap Anda"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-650 text-sm transition-all focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Mail className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-650 text-sm transition-all focus:outline-none"
                    />
                  </div>
                </div>

                {/* Phone (New Field) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Nomor Telepon <span className="text-slate-500 normal-case font-normal">(Opsional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Phone className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-650 text-sm transition-all focus:outline-none"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Pesan Detail
                  </label>
                  <div className="relative">
                    <span className="absolute top-3.5 left-3.5 flex text-slate-500">
                      <MessageSquare className="h-4.5 w-4.5" />
                    </span>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tuliskan pertanyaan, masukan, atau tawaran kolaborasi secara lengkap di sini..."
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-650 text-sm transition-all focus:outline-none"
                    ></textarea>
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
                    {isSubmitting ? "Mengirim..." : "Kirim Pesan Inquiry"}
                    {!isSubmitting && <Send className="h-4 w-4" />}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
} 