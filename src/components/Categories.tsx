import { popularCategories } from "@/data/mockData";
import { Globe, Brain, Cpu, Smartphone, ArrowUpRight } from "lucide-react";

const getIcon = (name: string) => {
  switch (name) {
    case "Globe":
      return <Globe className="h-6 w-6 text-cyan-400" />;
    case "Brain":
      return <Brain className="h-6 w-6 text-violet-400" />;
    case "Cpu":
      return <Cpu className="h-6 w-6 text-indigo-400" />;
    case "Smartphone":
      return <Smartphone className="h-6 w-6 text-fuchsia-400" />;
    default:
      return <Globe className="h-6 w-6 text-slate-400" />;
  }
};

export default function Categories() {
  return (
    <section id="categories" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            Kategori Terpopuler
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight">
            Eksplorasi Project Berdasarkan{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
              Kategori Utama
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Temukan ribuan karya inovatif mahasiswa Indonesia yang dikelompokkan dalam bidang teknologi masa kini.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {popularCategories.map((category) => (
            <div
              key={category.id}
              className="group relative rounded-2xl p-[1px] bg-slate-900 transition-all duration-500 hover:scale-105 hover:bg-gradient-to-br hover:from-cyan-500 hover:via-indigo-500 hover:to-violet-500"
            >
              {/* Outer Blur Glow on Hover */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-violet-500 opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500 pointer-events-none"></div>

              {/* Inner Card Content */}
              <div className="relative h-full w-full rounded-[15px] bg-slate-950/90 backdrop-blur-2xl p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
                {/* Visual Accent Layer */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/3 to-transparent rounded-bl-full pointer-events-none transition-all duration-500 group-hover:scale-110"></div>

                <div className="space-y-6">
                  {/* Icon Wrapper */}
                  <div className="inline-flex items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800/80 group-hover:border-white/10 group-hover:bg-slate-900/50 shadow-inner transition-colors duration-300">
                    {getIcon(category.iconName)}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="font-display font-semibold text-lg sm:text-xl text-white flex items-center gap-1 group-hover:text-cyan-400 transition-colors duration-300">
                      {category.title}
                      <ArrowUpRight className="h-4 w-4 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Footer details / count */}
                <div className="mt-8 pt-4 border-t border-slate-900 flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium font-mono group-hover:text-slate-400 transition-colors">
                    {category.count}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 group-hover:text-white transition-colors">
                    Buka
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
