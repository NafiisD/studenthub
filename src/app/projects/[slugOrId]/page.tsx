"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  getProjectDetail, Project, getRatingsForProject, Rating, 
  saveRating, addToCart, toggleWishlist, getCarts, getWishlists, getUserOrders 
} from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft, Globe, Brain, Cpu, Smartphone, Lock, 
  CheckCircle2, Heart, ShoppingCart, Star, MessageSquare, AlertTriangle 
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const getIcon = (category: string) => {
  const norm = category.toLowerCase();
  if (norm.includes("web")) return <Globe className="h-5 w-5 text-cyan-400" />;
  if (norm.includes("ai") || norm.includes("ml") || norm.includes("intel")) return <Brain className="h-5 w-5 text-violet-400" />;
  if (norm.includes("iot") || norm.includes("sensor")) return <Cpu className="h-5 w-5 text-indigo-400" />;
  if (norm.includes("mobile") || norm.includes("app")) return <Smartphone className="h-5 w-5 text-fuchsia-400" />;
  return <Globe className="h-5 w-5 text-slate-400" />;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const slugOrId = params.slugOrId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  // User relations
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  // Review Form States
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    if (!slugOrId) return;

    setLoading(true);
    const token = user?.token;
    const isAdmin = user?.role === "ADMIN";

    const prj = getProjectDetail(slugOrId, token, isAdmin);
    
    if (!prj) {
      // Check if project actually exists as draft
      const checkPrj = getProjectDetail(slugOrId, undefined, true);
      if (checkPrj && checkPrj.status === "DRAFT" && !isAdmin) {
        setAccessDenied(true);
      }
      setProject(null);
    } else {
      setProject(prj);
      setRatings(getRatingsForProject(prj.id));
      
      // Check cart and wishlist
      if (user && user.role === "USER") {
        const carts = getCarts(user.id, user.token || "");
        const wishes = getWishlists(user.id, user.token || "");
        setInCart(carts.some((c) => c.id === prj.id));
        setInWishlist(wishes.some((w) => w.id === prj.id));

        // Check if project has been purchased and approved
        const orders = getUserOrders(user.id, user.token || "");
        const purchased = orders.some(
          (o) => o.status === "APPROVED" && o.items.some((item) => item.projectId === prj.id)
        );
        setHasPurchased(purchased);
      }
    }
    setLoading(false);
  }, [slugOrId, user]);

  const handleToggleWishlist = () => {
    if (!project) return;
    if (!isAuthenticated) {
      setAuthModalReason("menambahkan project ini ke daftar Wishlist");
      setShowAuthModal(true);
      return;
    }
    if (user && user.role === "ADMIN") {
      showToast("Admin tidak menggunakan wishlist.");
      return;
    }

    if (user) {
      const res = toggleWishlist(user.id, project.id, user.token || "");
      setInWishlist(res.action === "added");
      // Update counts
      setProject(getProjectDetail(slugOrId, user.token, user.role === "ADMIN"));
      showToast(res.action === "added" ? "Berhasil ditambahkan ke Wishlist!" : "Dihapus dari Wishlist.");
    }
  };

  const handleAddToCart = () => {
    if (!project) return;
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
      const res = addToCart(user.id, project.id, user.token || "");
      if (res) {
        setInCart(true);
        showToast("Berhasil ditambahkan ke Keranjang Belanja!");
      }
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !user) return;

    try {
      saveRating({
        projectId: project.id,
        userId: user.id,
        userName: user.name,
        rating: ratingVal,
        review: reviewText,
      }, user.token || "");

      setReviewText("");
      setReviewSuccess(true);
      // Reload ratings and average rating
      setRatings(getRatingsForProject(project.id));
      setProject(getProjectDetail(slugOrId, user.token, user.role === "ADMIN"));
      showToast("Ulasan Anda berhasil dikirim!");
      setTimeout(() => setReviewSuccess(false), 2000);
    } catch (err) {
      showToast("Gagal mengirim ulasan.");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <>
        <Navbar />
        <main className="flex-grow flex items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md w-full text-center space-y-5 glass-panel border-red-500/20 p-8 rounded-2xl">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 animate-bounce">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="font-display font-semibold text-xl text-white">Akses Ditolak (403 Forbidden)</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Anda tidak memiliki izin untuk melihat proyek ini karena proyek tersebut masih berstatus **DRAFT** dan hanya dapat diakses oleh Administrator resmi.
            </p>
            <button
              onClick={() => router.push("/marketplace")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Marketplace
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navbar />
        <main className="flex-grow flex items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md w-full text-center space-y-5 glass-panel p-8 rounded-2xl border border-slate-900">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="font-display font-semibold text-xl text-white">Proyek Tidak Ditemukan</h3>
            <p className="text-slate-400 text-sm">
              Kami tidak dapat menemukan proyek dengan ID atau Slug yang Anda cari. Proyek mungkin telah dihapus.
            </p>
            <button
              onClick={() => router.push("/marketplace")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Marketplace
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel rounded-xl border border-cyan-500/30 px-5 py-3.5 bg-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.2)] text-white text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="h-4.5 w-4.5 text-cyan-400 animate-bounce" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-slate-450 hover:text-white text-xs font-bold mb-6 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Media & Details */}
          <div className="lg:col-span-8 space-y-8">
            <div className="glass-panel rounded-2xl border border-white/5 p-6 space-y-6">
              {/* Category, Status & Stars */}
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
                    {getIcon(project.category)}
                    {project.category}
                  </span>
                  {project.status === "DRAFT" && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
                      🔒 DRAFT MODE (ADMIN BYPASS)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-850 px-2.5 py-1 rounded-lg text-xs font-bold text-white font-mono">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span>{project.averageRating > 0 ? `${project.averageRating} / 5` : "Belum ada Rating"}</span>
                </div>
              </div>

              {/* Title & Creator */}
              <div className="space-y-2">
                <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-white leading-tight">
                  {project.title}
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Karya mahasiswa: <span className="text-slate-200 font-semibold">{project.studentName}</span> | Kampus: <span className="text-cyan-400 font-semibold">{project.university}</span>
                </p>
              </div>

              {/* Cover Image */}
              {project.thumbnail && (
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-900 bg-slate-900">
                  <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Description */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Deskripsi Lengkap Proyek</h4>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            </div>

            {/* Ratings & Reviews List (GET /ratings) */}
            <div className="glass-panel rounded-2xl border border-white/5 p-6 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                <h3 className="font-display font-semibold text-lg text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-400" />
                  <span>Ulasan & Review ({ratings.length})</span>
                </h3>
              </div>

              {ratings.length > 0 ? (
                <div className="divide-y divide-slate-900/60 space-y-4">
                  {ratings.map((review) => (
                    <div key={review.id} className="pt-4 first:pt-0 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-white">{review.userName}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{review.createdAt}</p>
                        </div>
                        <div className="flex gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3.5 w-3.5 ${i < review.rating ? "fill-amber-400" : "text-slate-700"}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed bg-slate-900/10 p-3 rounded-lg border border-slate-900/50">
                        {review.review}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-900/10 rounded-xl border border-dashed border-slate-900">
                  <MessageSquare className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs sm:text-sm font-medium">Belum ada ulasan untuk proyek ini</p>
                  <p className="text-slate-500 text-[10px] sm:text-xs mt-0.5">Jadilah yang pertama memberikan review!</p>
                </div>
              )}

              {/* POST /ratings Form - ONLY for authenticated buyers */}
              {hasPurchased && (
                <form onSubmit={handleReviewSubmit} className="pt-6 border-t border-slate-900 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Berikan Ulasan & Rating Anda</h4>
                  
                  {/* Stars select */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 mr-2 font-medium">Nilai Bintang:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingVal(star)}
                        className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star className={`h-6 w-6 ${star <= ratingVal ? "fill-amber-400" : "text-slate-700"}`} />
                      </button>
                    ))}
                  </div>

                  {/* Review Text */}
                  <div className="space-y-1.5">
                    <textarea
                      required
                      rows={3}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Bagaimana kualitas source code proyek ini? Apakah berjalan lancar?"
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-650 text-sm transition-all focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl cursor-pointer"
                  >
                    Kirim Ulasan Resmi
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: Pricing & Action Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel rounded-2xl border border-white/5 p-6 space-y-6">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold leading-none">Harga Kode Sumber</p>
                <p className="text-2xl sm:text-3xl font-bold text-white font-mono mt-2 leading-none">
                  {formatPrice(project.price)}
                </p>
              </div>

              {/* Access status details */}
              <div className="p-4 bg-slate-900/60 border border-slate-900 rounded-xl space-y-3.5 text-xs">
                <div className="flex justify-between items-center text-slate-450 border-b border-slate-900 pb-2">
                  <span>Status Kode</span>
                  <span className={hasPurchased ? "text-emerald-450 font-bold" : "text-amber-450 font-bold"}>
                    {hasPurchased ? "Terbuka (Milik Anda)" : "Terkunci"}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-550 uppercase tracking-wider font-bold">Tautan Github Repository</p>
                  {hasPurchased ? (
                    <a
                      href={project.sourceCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 font-semibold hover:underline truncate block"
                    >
                      {project.sourceCodeUrl}
                    </a>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold bg-slate-950 p-2 rounded-lg border border-slate-900">
                      <Lock className="h-3.5 w-3.5 text-slate-600" />
                      <span>Repository Terkunci</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Add to Wishlist / Cart */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={inCart || hasPurchased}
                  className={`w-full relative group flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl overflow-hidden shadow-lg transition-all ${
                    inCart || hasPurchased
                      ? "bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed shadow-none"
                      : "cursor-pointer hover:scale-102"
                  }`}
                >
                  {!inCart && !hasPurchased && <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500"></span>}
                  <span className="relative z-10 text-xs sm:text-sm flex items-center gap-2">
                    <ShoppingCart className="h-4.5 w-4.5" />
                    {hasPurchased ? "Proyek Telah Dimiliki" : inCart ? "Sudah di Keranjang" : "Beli Source Code"}
                  </span>
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className={`w-full py-3 rounded-xl border font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    inWishlist
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-455 hover:bg-rose-500/20"
                      : "bg-slate-950 border-slate-850 text-slate-350 hover:text-white hover:bg-slate-900/30"
                  }`}
                >
                  <Heart className="h-4.5 w-4.5" fill={inWishlist ? "currentColor" : "none"} />
                  <span>{inWishlist ? "Hapus dari Wishlist" : "Tambahkan ke Wishlist"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

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
