import { statistics } from "@/data/mockData";

export default function Stats() {
  return (
    <section className="py-12 relative overflow-hidden">
      {/* Background Glow Divider */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-[80%] h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="glass-panel rounded-2xl border border-white/5 p-6 sm:p-8 md:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 divide-y-0 divide-x-0 divide-slate-800/40 lg:divide-x">
            {statistics.map((stat, idx) => (
              <div
                key={stat.id}
                className={`text-center flex flex-col justify-center items-center space-y-2 py-4 lg:py-2 ${
                  idx > 1 ? "pt-6 lg:pt-2" : ""
                } ${idx % 2 !== 0 ? "border-l-0" : ""}`}
              >
                {/* Glowing Stat Number */}
                <span className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent filter drop-shadow-[0_2px_8px_rgba(99,102,241,0.15)]">
                  {stat.value}
                </span>
                {/* Stat Label */}
                <span className="text-xs sm:text-sm font-sans font-medium text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
