"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, ShieldCheck, Zap } from "lucide-react";
import * as api from "@/lib/api";

interface Category {
  id: number | string;
  name?: string;
  title?: string;
  description?: string;
}

interface FeatureItem {
  id: number | string;
  title: string;
  description: string;
  iconName: "ShoppingBag" | "ShieldCheck" | "Zap";
  gradientFrom: string;
}

const getIcon = (name: string) => {
  switch (name) {
    case "ShoppingBag":
      return <ShoppingBag className="h-6 w-6 text-cyan-400 animate-pulse" />;
    case "ShieldCheck":
      return <ShieldCheck className="h-6 w-6 text-indigo-400" />;
    case "Zap":
      return <Zap className="h-6 w-6 text-violet-400" />;
    default:
      return <ShoppingBag className="h-6 w-6 text-slate-400" />;
  }
};

const cardStyles: Array<Pick<FeatureItem, "iconName" | "gradientFrom">> = [
  { iconName: "ShoppingBag", gradientFrom: "from-cyan-500/10 via-transparent to-transparent" },
  { iconName: "ShieldCheck", gradientFrom: "from-indigo-500/10 via-transparent to-transparent" },
  { iconName: "Zap", gradientFrom: "from-violet-500/10 via-transparent to-transparent" },
];

const normalizeList = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export default function Features() {
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await api.fetchCategories();
        if (!res.success) return;
        const categories = normalizeList(res.data) as Category[];
        const mapped = categories.slice(0, 6).map((category, index) => {
          const style = cardStyles[index % cardStyles.length];
          return {
            id: category.id ?? index,
            title: category.name || category.title || "Kategori",
            description: category.description || "Kategori proyek unggulan di StudentHub.",
            iconName: style.iconName,
            gradientFrom: style.gradientFrom,
          };
        });
        if (isMounted) setFeatures(mapped);
      } catch (error) {
        console.error("loadFeatures", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            Keunggulan Platform
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight">
            Mengapa Pilih{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
              StudentHub?
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Satu ekosistem digital terintegrasi yang dirancang khusus untuk memfasilitasi transaksi karya teknologi mahasiswa secara aman dan profesional.
          </p>
        </div>

        {/* Features Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="rounded-2xl border border-slate-900 bg-slate-950/40 p-8 animate-pulse"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-900/80 mb-6" />
                <div className="h-5 w-2/3 rounded bg-slate-900/80 mb-3" />
                <div className="h-3 w-full rounded bg-slate-900/60 mb-2" />
                <div className="h-3 w-4/5 rounded bg-slate-900/60" />
              </div>
            ))
          ) : features.length > 0 ? (
            features.map((feature) => (
              <div
                key={feature.id}
                className="group relative rounded-2xl border border-slate-900 bg-slate-950/40 p-8 hover:bg-slate-900/10 transition-all duration-300 hover:scale-102 hover:border-slate-800/80"
              >
                <div className={`absolute inset-0 bg-gradient-to-b ${feature.gradientFrom} opacity-0 group-hover:opacity-100 rounded-2xl blur-lg transition-opacity duration-500 -z-10`}></div>

                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-800 to-transparent group-hover:via-cyan-400/50 transition-all duration-300"></div>

                <div className="mb-6 inline-flex items-center justify-center h-12 w-12 rounded-xl bg-slate-900/80 border border-slate-800/60 shadow-inner group-hover:scale-110 group-hover:border-cyan-500/30 transition-all duration-300">
                  {getIcon(feature.iconName)}
                </div>

                <h3 className="font-display font-semibold text-lg sm:text-xl text-white mb-3 group-hover:text-cyan-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>

                <div className="mt-8 flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-cyan-400 transition-colors cursor-pointer">
                  <span>Pelajari Selengkapnya</span>
                  <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-slate-500 text-sm">
              Belum ada kategori yang tersedia.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
