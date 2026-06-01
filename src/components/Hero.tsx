import { ArrowRight, Play, Terminal } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Text Left Column */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left">
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-cyan-500/20 text-cyan-400 text-xs sm:text-sm font-semibold tracking-wide animate-pulse-slow shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
              Platform Marketplace Project #1 di Indonesia
            </div>

            {/* Main Heading */}
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight">
              Wadah Kreativitas
              <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent filter drop-shadow-[0_2px_10px_rgba(99,102,241,0.2)]">
                Mahasiswa Indonesia
              </span>
            </h1>

            {/* Sub-heading */}
            <p className="text-slate-400 font-sans text-base sm:text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Jual project hasil karyamu, beli project berkualitas, atau ajukan project baru dalam ekosistem digital futuristik.
            </p>

            {/* Buttons / Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <a
                href="/marketplace"
                className="w-full sm:w-auto text-center relative group flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(99,102,241,0.3)] transition-all duration-300 hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] hover:scale-102"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"></span>
                <span className="relative z-10 flex items-center gap-2">
                  Mulai Sekarang
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>

              <a
                href="/marketplace"
                className="w-full sm:w-auto text-center flex items-center justify-center gap-2 font-medium text-slate-300 hover:text-white px-8 py-4 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/60 backdrop-blur-sm transition-all duration-300"
              >
                Jelajahi Marketplace
              </a>
            </div>
          </div>

          {/* Interactive Floating Card Right Column */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[450px] aspect-square rounded-2xl p-0.5 bg-gradient-to-tr from-cyan-500/20 via-slate-800/40 to-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.15)] group">
              {/* Outer Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-indigo-500/10 rounded-2xl blur-xl opacity-75"></div>
              
              {/* Main Visual Board */}
              <div className="relative h-full w-full rounded-2xl bg-slate-950/80 backdrop-blur-2xl p-6 overflow-hidden flex flex-col justify-between border border-white/5">
                {/* Header of Card (Mac style dots) */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-900">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-500/80"></span>
                    <span className="h-3 w-3 rounded-full bg-yellow-500/80"></span>
                    <span className="h-3 w-3 rounded-full bg-green-500/80"></span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                    studenthub-terminal.sh
                  </div>
                </div>

                {/* Content - Interactive Code Display */}
                <div className="flex-1 font-mono text-xs text-slate-400 py-6 space-y-3 overflow-hidden select-none">
                  <p className="text-violet-400">$ git clone studenthub-project-1</p>
                  <p className="text-slate-500">// Menghubungkan ke API StudentHub...</p>
                  <p className="text-slate-300">
                    <span className="text-cyan-400">const</span> project = await fetchProject(<span className="text-amber-300">"PRJ-081"</span>);
                  </p>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/40 space-y-1">
                    <p className="text-emerald-400">STATUS: VERIFIED BY ADMIN</p>
                    <p className="text-slate-400">TITLE: Smart Agriculture IoT System</p>
                    <p className="text-slate-400">MAHASISWA: ITB Bandung</p>
                    <p className="text-indigo-400">PRICE: Rp 2.500.000</p>
                  </div>
                  <p className="text-slate-500">// Siap di-deploy ke produksi...</p>
                  <p className="text-cyan-400">$ studenthub deploy --now</p>
                  <p className="text-green-400 animate-pulse">✓ Deployment Berhasil! Terintegrasi Vercel</p>
                </div>

                {/* Footer of Card - Floating Interactive Stats */}
                <div className="mt-auto pt-4 border-t border-slate-900 flex justify-between items-center bg-slate-900/30 -mx-6 -mb-6 p-6 rounded-b-2xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30">
                      <Play className="h-4 w-4 text-indigo-400 fill-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Demo Project</p>
                      <p className="text-xs text-white font-bold">120+ Mahasiswa Online</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-semibold px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20">
                    LIVE PREVIEW
                  </span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
