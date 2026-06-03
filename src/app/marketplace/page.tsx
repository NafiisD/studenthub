"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation"; // <-- INI YANG DITAMBAHKAN
import { useAuth } from "@/context/AuthContext";
import { 
  Search, SlidersHorizontal, ArrowUpRight, Globe, Brain, 
  Cpu, Smartphone, X, Lock, CheckCircle2, Heart, ShoppingCart
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// --- TYPE DEFINITIONS (Disuaikan dengan Skema Swagger Backend) ---
interface Batch {
  id: string | number;
  year: string | number;
}

interface Student {
  id: string | number;
  name: string;
  batch?: Batch;
}

interface Category {
  id: string | number;
  name?: string;
  title?: string;
  slug: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  university: string;
  studentName: string;
  averageRating: number;
  wishlistCount?: number;
  slug?: string;
  category: string | Category;
  students?: Student[];
}

const getIcon = (category: string) => {
  const norm = category.toLowerCase();
  if (norm.includes("web")) return <Globe className="h-4 w-4 text-cyan-400" />;
  if (norm.includes("ai") || norm.includes("ml") || norm.includes("intel")) return <Brain className="h-4 w-4 text-violet-400" />;
  if (norm.includes("iot") || norm.includes("sensor")) return <Cpu className="h-4 w-4 text-indigo-400" />;
  if (norm.includes("mobile") || norm.includes("app")) return <Smartphone className="h-4 w-4 text-fuchsia-400" />;
  return <Globe className="h-4 w-4 text-slate-400" />;
};

function MarketplaceContent() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter(); // <-- INI YANG DITAMBAHKAN
  
  // State variables menggunakan tipe data asli backend
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Cart & Wishlist local states
  const [userCartIds, setUserCartIds] = useState<string[]>([]);
  const [userWishlistIds, setUserWishlistIds] = useState<string[]>([]);

  // Toast / Status notification
  const [toastMessage, setToastMessage] = useState("");

  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("");

  // Base URL API disesuaikan dengan routing prefiks Swagger (/api)
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://studenthubbackend-production.up.railway.app/api";

  // Load catalog data
  useEffect(() => {
    // 1. Fetch only PUBLISHED projects dari real database
    fetch(`${API_URL}/projects/published`)
      .then(res => res.json())
      .then(data => {
        if ((data.code === 200 || data.success) && data.data) {
          setProjects(data.data);
        }
      })
      .catch(err => console.error("Error fetching real projects", err));

  }, [API_URL]);

  // Sync cart & wishlist menggunakan Bearer Token Otorisasi Asli
  const syncUserActions = async () => {
    if (isAuthenticated && user && user.role === "USER") {
      const token = user.token || localStorage.getItem("studenthub_token") || "";
      
      // Load Real Wishlist
      try {
        const wRes = await fetch(`${API_URL}/wishlists`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (wRes.ok) {
          const wData = await wRes.json();
          if (wData.data) {
            const ids = wData.data.map((w: any) => String(w.projectId || w.project?.id || w.id));
            setUserWishlistIds(ids);
          }
        }
      } catch (err) {
        console.error("Gagal load wishlist dari real API:", err);
      }

      // Load Real Cart
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const cRes = await fetch(`${API_URL}/carts?_t=${Date.now()}`, { headers, cache: 'no-store' });
        if (cRes.ok) {
          const cData = await cRes.json();
          if (cData.data && cData.data.items) {
            setUserCartIds(cData.data.items.map((i: any) => String(i.projectId || i.project?.id)));
          }
        }
      } catch (err) {
        console.error("Gagal load cart dari real API:", err);
      }
    } else {
      setUserCartIds([]);
      setUserWishlistIds([]);
    }
  };

  useEffect(() => {
    syncUserActions();
  }, [isAuthenticated, user]);

  // Filters logic
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = 
      project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.university?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.studentName?.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesSearch;
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleToggleWishlist = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setAuthModalReason("menambahkan project ini ke daftar Wishlist");
      setShowAuthModal(true);
      return;
    }
    if (user && user.role === "ADMIN") {
      showToast("Admin tidak dapat menggunakan fitur wishlist pembeli.");
      return;
    }

    if (user) {
      try {
        const res = await fetch(`${API_URL}/wishlists/${projectId}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token || localStorage.getItem("studenthub_token")}`
          }
        });
        
        if (res.ok) {
          await syncUserActions();
          
          // Sinkronisasi ulang data list project untuk memperbarui counter likes
          const pRes = await fetch(`${API_URL}/projects/published`);
          const pData = await pRes.json();
          if (pData.data) {
            setProjects(pData.data);
          }
          
          showToast("Wishlist berhasil diperbarui!");
        } else {
          showToast("Gagal memperbarui wishlist database.");
        }
      } catch (err) {
        showToast("Terjadi kesalahan jaringan.");
      }
    }
  };

  const handleAddToCart = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setAuthModalReason("menambahkan project ini ke Keranjang Belanja");
      setShowAuthModal(true);
      return;
    }
    if (user && user.role === "ADMIN") {
      showToast("Admin tidak dapat membeli project.");
      return;
    }

    if (user) {
      try {
        const res = await fetch(`${API_URL}/carts/items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token || localStorage.getItem("studenthub_token")}`
          },
          body: JSON.stringify({ projectId: isNaN(Number(projectId)) ? projectId : Number(projectId), quantity: 1 })
        });

        if (res.ok) {
          await syncUserActions();
          showToast("Project berhasil ditambahkan ke Keranjang Belanja!");
        } else {
          showToast("Gagal menambahkan ke keranjang database.");
        }
      } catch (err) {
        showToast("Terjadi kesalahan jaringan.");
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow"></div>
        
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 glass-panel rounded-xl border border-cyan-500/30 px-5 py-3.5 bg-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.2)] text-white text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <CheckCircle2 className="h-4.5 w-4.5 text-cyan-400 animate-bounce" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        <div className="mb-12 text-center lg:text-left space-y-3">
          <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-white">
            Katalog Proyek{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
              Kreatif Mahasiswa
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            Jelajahi karya inovatif digital mahasiswa terbaik se-Indonesia. Semua project telah divalidasi dan siap digunakan oleh kalangan akademisi maupun bisnis.
          </p>
        </div>

        <div className="mb-10 flex justify-center">
          <div className="relative w-full max-w-2xl">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari project, teknologi, universitas..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-500 text-sm transition-all focus:outline-none"
            />
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProjects.map((project) => {
              const inWishlist = userWishlistIds.includes(String(project.id));
              const inCart = userCartIds.includes(String(project.id));
              const projectCategoryName = typeof project.category === "object" ? project.category.name : project.category;

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-900 bg-slate-950/45 p-6 transition-all duration-300 hover:scale-102 hover:border-slate-850 hover:bg-slate-900/10 cursor-pointer relative overflow-hidden"
                >
                  <div>
                    {project.thumbnail && (
                      <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 border border-slate-900 relative">
                        <img 
                          src={project.thumbnail} 
                          alt={project.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                          <button
                            onClick={(e) => handleToggleWishlist(project.id, e)}
                            className={`p-2 rounded-lg backdrop-blur-md border transition-all cursor-pointer ${
                              inWishlist 
                                ? "bg-rose-500/20 border-rose-500/40 text-rose-450" 
                                : "bg-slate-950/60 border-white/5 text-slate-400 hover:text-rose-400 hover:bg-slate-950"
                            }`}
                            title={inWishlist ? "Hapus dari Wishlist" : "Tambah ke Wishlist"}
                          >
                            <Heart className="h-4 w-4" fill={inWishlist ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-850 text-xs font-semibold text-slate-350">
                        {getIcon(projectCategoryName || "")}
                        {projectCategoryName}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider font-mono bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                        ⭐ {project.averageRating > 0 ? project.averageRating : "New"}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium mb-3">
                      Oleh: {project.students && project.students.length > 0 ? project.students.map((s:any) => s.name).join(', ') : (project.studentName || 'Anonim')} | Angkatan {project.students?.[0]?.batch?.year || '2024'}
                    </p>

                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-900 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold leading-none">Harga Kode</p>
                      <p className="text-base sm:text-lg font-bold text-white font-mono mt-1">
                        {formatPrice(project.price)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleAddToCart(project.id, e)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          inCart 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                            : "bg-slate-900/40 border-slate-850 text-slate-300 hover:text-white hover:bg-slate-900/80"
                        }`}
                        title={inCart ? "Sudah di Keranjang" : "Tambah ke Keranjang"}
                        disabled={inCart}
                      >
                        <ShoppingCart className="h-4.5 w-4.5" />
                      </button>
                      
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 text-cyan-400 hover:text-white transition-all cursor-pointer border border-cyan-500/20"
                      >
                        Tinjau
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-950/20 rounded-2xl border border-dashed border-slate-900">
            <SlidersHorizontal className="h-10 w-10 text-slate-600 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-lg text-white mb-1">Project Tidak Ditemukan</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Tidak dapat menemukan project dengan kriteria pencarian Anda. Coba kata kunci atau filter lain.
            </p>
          </div>
        )}
      </main>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setSelectedProject(null)}></div>
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-900 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-350 mb-3">
                  {getIcon(typeof selectedProject.category === "object" ? (selectedProject.category.name || "") : selectedProject.category)}
                  {typeof selectedProject.category === "object" ? selectedProject.category.name : selectedProject.category}
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                  {selectedProject.title}
                </h2>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-900/60">
                  <p className="text-slate-500 text-xs sm:text-sm">
                    Dibuat oleh: <span className="text-slate-300 font-semibold">{selectedProject.students && selectedProject.students.length > 0 ? selectedProject.students.map((s:any) => s.name).join(', ') : (selectedProject.studentName || 'Anonim')}</span> | Angkatan <span className="text-cyan-400 font-semibold">{selectedProject.students?.[0]?.batch?.year || '2024'}</span>
                  </p>
                  <span className="text-xs text-rose-450 flex items-center gap-1 font-mono">
                    ❤️ {selectedProject.wishlistCount || 0} Menyukai
                  </span>
                </div>
              </div>

              {selectedProject.thumbnail && (
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-900">
                  <img src={selectedProject.thumbnail} alt={selectedProject.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Deskripsi Lengkap</h4>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {selectedProject.description}
                </p>
              </div>

              <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-900">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Kategori Utama</p>
                  <p className="text-xs text-white font-semibold mt-1">
                    {typeof selectedProject.category === "object" ? selectedProject.category.name : selectedProject.category}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-xs text-slate-500 uppercase tracking-widest leading-none">Total Pembayaran</p>
                  <p className="text-2xl font-bold text-white font-mono mt-1.5">
                    {formatPrice(selectedProject.price)}
                  </p>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    onClick={(e) => handleToggleWishlist(selectedProject.id, e)}
                    className={`px-4 py-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                      userWishlistIds.includes(String(selectedProject.id))
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-450"
                        : "bg-slate-900/50 border-slate-850 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Heart className="h-4.5 w-4.5" fill={userWishlistIds.includes(String(selectedProject.id)) ? "currentColor" : "none"} />
                    <span className="text-xs font-semibold">Wishlist</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push(`/projects/${selectedProject.slug || selectedProject.id}`);
                    }}
                    className="flex-grow sm:flex-grow-0 relative group flex items-center justify-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all hover:scale-102 cursor-pointer"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500"></span>
                    <span className="relative z-10 text-sm sm:text-base flex items-center gap-1.5">
                      <ShoppingCart className="h-4.5 w-4.5" />
                      Lihat Detail Project
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest Authentication Warning Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setShowAuthModal(false)}></div>
          <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-slate-900 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 text-center space-y-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Lock className="h-6 w-6" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-xl text-white">Login Diperlukan</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Anda harus terdaftar dan masuk ke akun Anda terlebih dahulu untuk bisa <span className="text-cyan-400 font-semibold">{authModalReason}</span>.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/login"
                className="w-full text-center text-white font-semibold py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all text-sm"
              >
                Masuk ke Akun
              </Link>
              <Link
                href="/register"
                className="w-full text-center text-slate-300 hover:text-white font-semibold py-3 rounded-xl border border-slate-850 bg-slate-900/30 hover:bg-slate-900/60 transition-all text-sm"
              >
                Daftar Akun Baru
              </Link>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-xs text-slate-500 hover:text-slate-400 transition-colors"
              >
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500"></div>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}