"use client";

import { useState, useEffect } from "react";
import { 
  getProjects, Project, Category, getCategories, 
  addToCart, toggleWishlist, getCarts, getWishlists 
} from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, SlidersHorizontal, ArrowUpRight, Globe, Brain, 
  Cpu, Smartphone, X, Lock, CheckCircle2, Heart, ShoppingCart, Info, ShoppingBag
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const getIcon = (category: string) => {
  const norm = category.toLowerCase();
  if (norm.includes("web")) return <Globe className="h-4 w-4 text-cyan-400" />;
  if (norm.includes("ai") || norm.includes("ml") || norm.includes("intel")) return <Brain className="h-4 w-4 text-violet-400" />;
  if (norm.includes("iot") || norm.includes("sensor")) return <Cpu className="h-4 w-4 text-indigo-400" />;
  if (norm.includes("mobile") || norm.includes("app")) return <Smartphone className="h-4 w-4 text-fuchsia-400" />;
  return <Globe className="h-4 w-4 text-slate-400" />;
};

export default function MarketplacePage() {
  const { user, isAuthenticated } = useAuth();
  
  // State variables
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Cart & Wishlist local states for current user
  const [userCartIds, setUserCartIds] = useState<string[]>([]);
  const [userWishlistIds, setUserWishlistIds] = useState<string[]>([]);

  // Toast / Status notification
  const [toastMessage, setToastMessage] = useState("");

  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("");

  // Load catalog data
  useEffect(() => {
    // 1. Fetch only PUBLISHED projects
    setProjects(getProjects());
    // 2. Fetch categories
    setCategories(getCategories());
  }, []);

  // Sync cart & wishlist from database
  const syncUserActions = () => {
    if (isAuthenticated && user && user.role === "USER") {
      const carts = getCarts(user.id, user.token || "");
      const wishes = getWishlists(user.id, user.token || "");
      setUserCartIds(carts.map((c) => c.id));
      setUserWishlistIds(wishes.map((w) => w.id));
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
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.studentName.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = 
      selectedCategory === "Semua" || 
      project.category.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === "Mobile Dev" && project.category === "Mobile"); // compatible mapping

    return matchesSearch && matchesCategory;
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleToggleWishlist = (projectId: string, e: React.MouseEvent) => {
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
      const res = toggleWishlist(user.id, projectId, user.token || "");
      syncUserActions();
      // Reload projects to update wishlistCount
      setProjects(getProjects());
      if (res.action === "added") {
        showToast("Project berhasil ditambahkan ke Wishlist!");
      } else {
        showToast("Project dihapus dari Wishlist.");
      }
    }
  };

  const handleAddToCart = (projectId: string, e: React.MouseEvent) => {
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
      const res = addToCart(user.id, projectId, user.token || "");
      if (res) {
        syncUserActions();
        showToast("Project ditambahkan ke Keranjang Belanja!");
      } else {
        showToast("Project sudah ada di Keranjang Belanja Anda.");
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
        {/* Subtle grid page top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow"></div>
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 glass-panel rounded-xl border border-cyan-500/30 px-5 py-3.5 bg-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.2)] text-white text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <CheckCircle2 className="h-4.5 w-4.5 text-cyan-400 animate-bounce" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Section Heading */}
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

        {/* Search, Categories, and Filters Panel */}
        <div className="mb-10 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search bar input */}
          <div className="relative flex-grow max-w-lg">
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

          {/* Categories Horizontal Tabs */}
          <div className="flex overflow-x-auto gap-2 py-1 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setSelectedCategory("Semua")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === "Semua"
                  ? "bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-white border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                  : "bg-slate-900/40 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-800"
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.title)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.title
                    ? "bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-white border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                    : "bg-slate-900/40 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-800"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Project Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProjects.map((project) => {
              const inWishlist = userWishlistIds.includes(project.id);
              const inCart = userCartIds.includes(project.id);

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-900 bg-slate-950/45 p-6 transition-all duration-300 hover:scale-102 hover:border-slate-850 hover:bg-slate-900/10 cursor-pointer relative overflow-hidden"
                >
                  <div>
                    {/* Project Thumbnail Image */}
                    {project.thumbnail && (
                      <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 border border-slate-900 relative">
                        <img 
                          src={project.thumbnail} 
                          alt={project.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-2 right-2 flex gap-1.5 z-10">
                          {/* Wishlist Button Overlay */}
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

                    {/* Category & Badge Row */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-850 text-xs font-semibold text-slate-350">
                        {getIcon(project.category)}
                        {project.category}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider font-mono bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                        ⭐ {project.averageRating > 0 ? project.averageRating : "New"}
                      </span>
                    </div>

                    {/* Title & Author */}
                    <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium mb-3">
                      Oleh: {project.studentName} | {project.university}
                    </p>

                    {/* Description snippet */}
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-3">
                      {project.description}
                    </p>
                  </div>

                  {/* Pricing & Call-To-Action Row */}
                  <div className="pt-4 border-t border-slate-900 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold leading-none">Harga Kode</p>
                      <p className="text-base sm:text-lg font-bold text-white font-mono mt-1">
                        {formatPrice(project.price)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {/* Cart Add Button */}
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
          <div 
            className="fixed inset-0" 
            onClick={() => setSelectedProject(null)}
          ></div>
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-950 border border-slate-900 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 overflow-y-auto max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Content */}
            <div className="space-y-6">
              {/* Heading */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-350 mb-3">
                  {getIcon(selectedProject.category)}
                  {selectedProject.category}
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                  {selectedProject.title}
                </h2>
                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-900/60">
                  <p className="text-slate-500 text-xs sm:text-sm">
                    Dibuat oleh: <span className="text-slate-300 font-semibold">{selectedProject.studentName}</span> dari <span className="text-cyan-400 font-semibold">{selectedProject.university}</span>
                  </p>
                  <span className="text-xs text-rose-450 flex items-center gap-1 font-mono">
                    ❤️ {selectedProject.wishlistCount || 0} Menyukai
                  </span>
                </div>
              </div>

              {/* Thumbnail / Media Show */}
              {selectedProject.thumbnail && (
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-900">
                  <img src={selectedProject.thumbnail} alt={selectedProject.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Deskripsi Lengkap</h4>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {selectedProject.description}
                </p>
              </div>

              {/* Technology Demo Row */}
              <div className="grid grid-cols-2 gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-900">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Tautan Demo</p>
                  {selectedProject.demoUrl ? (
                    <a
                      href={selectedProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-cyan-400 hover:underline block mt-1 truncate"
                    >
                      {selectedProject.demoUrl}
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1">Tidak tersedia</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Kategori Utama</p>
                  <p className="text-xs text-white font-semibold mt-1">
                    {selectedProject.category}
                  </p>
                </div>
              </div>

              {/* Price & Action button */}
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
                      userWishlistIds.includes(selectedProject.id)
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-450"
                        : "bg-slate-900/50 border-slate-850 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Heart className="h-4.5 w-4.5" fill={userWishlistIds.includes(selectedProject.id) ? "currentColor" : "none"} />
                    <span className="text-xs font-semibold">Wishlist</span>
                  </button>

                  <button
                    onClick={(e) => {
                      handleAddToCart(selectedProject.id, e);
                      if (isAuthenticated && user && user.role === "USER") {
                        setSelectedProject(null);
                      }
                    }}
                    className="flex-grow sm:flex-grow-0 relative group flex items-center justify-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all hover:scale-102 cursor-pointer"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500"></span>
                    <span className="relative z-10 text-sm sm:text-base flex items-center gap-1.5">
                      <ShoppingCart className="h-4.5 w-4.5" />
                      {userCartIds.includes(selectedProject.id) ? "Sudah di Keranjang" : "Beli Source Code"}
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
          <div 
            className="fixed inset-0" 
            onClick={() => setShowAuthModal(false)}
          ></div>
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
