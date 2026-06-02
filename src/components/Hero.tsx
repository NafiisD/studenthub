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
            <div className="relative w-full max-w-[460px]">
              <div className="absolute -top-10 -right-8 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl"></div>
              <div className="absolute -bottom-8 -left-6 h-32 w-32 rounded-full bg-indigo-500/15 blur-3xl"></div>

              <div className="relative rounded-3xl p-[2px] bg-gradient-to-tr from-cyan-500/30 via-slate-800/50 to-indigo-500/30 shadow-[0_0_60px_rgba(56,189,248,0.15)]">
                <div className="rounded-3xl bg-slate-950/85 backdrop-blur-2xl border border-white/5 overflow-hidden">
                  {/* Top ribbon */}
                  <div className="px-6 py-4 flex items-center justify-between border-b border-slate-900/80 bg-slate-950/60">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                      <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                      curated-project-feed
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      VERIFIED
                    </span>
                  </div>

                  {/* Showcase */}
                  <div className="p-6 space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/20 flex items-center justify-center">
                        <Play className="h-5 w-5 text-cyan-400 fill-cyan-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Project Unggulan</p>
                        <h3 className="text-lg font-semibold text-white">Smart Agriculture IoT Suite</h3>
                        <p className="text-xs text-slate-400">Kolaborasi Mahasiswa ITB x Telkom</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl bg-slate-900/60 border border-slate-900 p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Rating</p>
                        <p className="text-sm font-bold text-white">4.9</p>
                      </div>
                      <div className="rounded-2xl bg-slate-900/60 border border-slate-900 p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Lisensi</p>
                        <p className="text-sm font-bold text-white">IDR 2.5M</p>
                      </div>
                      <div className="rounded-2xl bg-slate-900/60 border border-slate-900 p-3 text-center">
                        <p className="text-[10px] text-slate-500 uppercase">Deploy</p>
                        <p className="text-sm font-bold text-emerald-400">Ready</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-900 bg-slate-900/40 p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Integrasi API</span>
                        <span className="text-cyan-400 font-semibold">Live</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-900">
                        <div className="h-2 w-[78%] rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"></div>
                      </div>
                      <p className="text-[10px] text-slate-500">Status sinkron: 3 endpoint aktif</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 flex items-center justify-between border-t border-slate-900/80 bg-slate-950/60">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      120+ mahasiswa online
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
      </div>
    </section>
  );
}
