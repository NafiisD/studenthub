"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Globe, Brain, Cpu, Smartphone, ArrowUpRight } from "lucide-react";

const getIcon = (name: string) => {
  const norm = (name || "").toLowerCase();
  if (norm.includes("web")) return <Globe className="h-6 w-6 text-cyan-400" />;
  if (norm.includes("ai") || norm.includes("ml")) return <Brain className="h-6 w-6 text-violet-400" />;
  if (norm.includes("iot") || norm.includes("sensor")) return <Cpu className="h-6 w-6 text-indigo-400" />;
  if (norm.includes("mobile") || norm.includes("app")) return <Smartphone className="h-6 w-6 text-fuchsia-400" />;
  return <Globe className="h-6 w-6 text-slate-400" />;
};

function CategoriesContent() {
  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategorySlug = searchParams?.get("category");

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    fetch(`${API_URL}/categories`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setCategories(data.data);
        }
      })
      .catch(err => console.error("Failed to fetch categories", err));
  }, []);

  const handleCategoryClick = (slug: string) => {
    router.push(`/marketplace?category=${slug}`);
  };

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
          {categories.map((category) => {
            const isActive = activeCategorySlug === category.slug;
            return (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className={`group relative rounded-2xl p-[1px] transition-all duration-500 hover:scale-105 cursor-pointer ${
                isActive 
                  ? "bg-gradient-to-br from-cyan-500 via-indigo-500 to-violet-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]" 
                  : "bg-slate-900 hover:bg-gradient-to-br hover:from-cyan-500 hover:via-indigo-500 hover:to-violet-500"
              }`}
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
                    {getIcon(category.name || category.title || "")}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="font-display font-semibold text-lg sm:text-xl text-white flex items-center gap-1 group-hover:text-cyan-400 transition-colors duration-300">
                      {category.name || category.title}
                      <ArrowUpRight className="h-4 w-4 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                    </h3>
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {category.description || `Lihat project di bidang ${category.name || category.title}`}
                    </p>
                  </div>
                </div>

                {/* Footer details / count */}
                <div className="mt-8 pt-4 border-t border-slate-900 flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 group-hover:text-white transition-colors">
                    Buka
                  </span>
                </div>
              </div>
            </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default function Categories() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500 animate-pulse">Memuat Kategori...</div>}>
      <CategoriesContent />
    </Suspense>
  );
}
