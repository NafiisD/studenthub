"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  getProjects, saveProject, Project, getWishlists, toggleWishlist,
  getCarts, removeFromCart, checkoutCart, getUserOrders, getActiveBankAccounts,
  uploadPaymentProof, saveRating, Order, BankAccount, getRatingsForProject
} from "@/data/mockData";
import * as api from "@/lib/api";
import { 
  PlusCircle, Upload, Download, CreditCard, TrendingUp, 
  Clock, CheckCircle2, XCircle, ExternalLink, Folder, 
  Landmark, User, Mail, Lock, Heart, ShoppingCart, Trash2, ShieldCheck, AlertTriangle, FileText, Star, Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function CustomerDashboardContent() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab State
  const [activeTab, setActiveTab] = useState<"profile" | "cart" | "wishlist" | "orders">("profile");

  // Auth Protection redirect
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push("/login");
      } else {
        const role = (user.role || "").toUpperCase();
        if (role !== "USER" && role !== "CUSTOMER") {
          router.push("/dashboard/admin");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Read URL params tab
  useEffect(() => {
    if (!searchParams) return;
    const tab = searchParams.get("tab");
    if (tab === "cart") setActiveTab("cart");
    else if (tab === "wishlist") setActiveTab("wishlist");
    else if (tab === "orders") setActiveTab("orders");
    else if (tab === "profile") setActiveTab("profile");
  }, [searchParams]);

  // Data States
  const [wishlist, setWishlist] = useState<Project[]>([]);
  const [cart, setCart] = useState<Project[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  

  // Edit Profile States
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Modal states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("");
  const [viewBillOrder, setViewBillOrder] = useState<any>(null);
  const [uploadProofOrder, setUploadProofOrder] = useState<any>(null);
  const [rateProject, setRateProject] = useState<any>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  
  // Real file upload state
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // checkout bank accounts selection
  const [selectedBankId, setSelectedBankId] = useState("");

  // rating inputs
  const [ratingVal, setRatingVal] = useState(5);
  const [ratingReview, setRatingReview] = useState("");


  // Toast
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Sync data function
  const syncData = async () => {
    if (user && user.role === "USER") {
      const token = user.token || localStorage.getItem("studenthub_token") || "";
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // Load Wishlist
        const wRes = await fetch(`${API_URL}/wishlists`, { headers });
        if (wRes.ok) {
          const wData = await wRes.json();
          if (wData.data) {
            const parsedWishlist = wData.data.map((w: any) => w.project || w);
            setWishlist(parsedWishlist);
          }
        }
        
        // Load Orders
        const oRes = await fetch(`${API_URL}/orders`, { headers });
        if (oRes.ok) {
          const oData = await oRes.json();
          if (oData.data) setOrders(oData.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
      
      // Load Cart
      try {
        const cRes = await fetch(`${API_URL}/carts?_t=${Date.now()}`, { 
          headers,
          cache: 'no-store' 
        });
        if (cRes.ok) {
          const cData = await cRes.json();
          if (cData.data && Array.isArray(cData.data.items)) {
            // Map items. If 'project' is missing, try to construct a dummy or fetch it, but usually backend provides it.
            const mappedCart = cData.data.items.map((i: any) => i.project || i);
            setCart(mappedCart);
          } else {
            setCart([]);
          }
        }
      } catch (err) {}
      // Load Bank Accounts
      try {
        const bRes = await api.fetchActiveBankAccounts(token);
        if (bRes.data && Array.isArray(bRes.data)) {
          const fetchedBanks = bRes.data.map((b: any) => ({
            id: String(b.id),
            bankName: b.bankName,
            accountName: b.accountOwner || b.accountName || "Unknown",
            accountNumber: b.accountNumber,
            isActive: b.isActive
          }));
          setBankAccounts(fetchedBanks);
          if (fetchedBanks.length > 0 && !selectedBankId) {
            setSelectedBankId(fetchedBanks[0].id);
          }
        } else {
          setBankAccounts([]);
        }
      } catch (err) {
        setBankAccounts([]);
      }

      // Sync Edit Profile values
      if (!profileName && !profileEmail) {
        setProfileName(user.name);
        setProfileEmail(user.email);
      }
    }
  };

  useEffect(() => {
    syncData();
  }, [user, activeTab]);

  if (isLoading || !user || user.role !== "USER") {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  // --- ACTIONS ---

  // 1. Profile Update
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setIsSavingProfile(true);

    const res = await updateProfile(profileName, profileEmail);
    if (res.success) {
      setProfileSuccess("Profil berhasil diperbarui!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } else {
      setProfileError(res.error || "Gagal memperbarui profil.");
    }
    setIsSavingProfile(false);
  };

  // 2. Remove Wishlist Item
  const handleRemoveWishlist = async (projectId: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    try {
      const token = user?.token || localStorage.getItem("studenthub_token") || "";
      const res = await fetch(`${API_URL}/wishlists/${projectId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        await syncData();
        showToast("Project dihapus dari Wishlist.");
      } else {
        showToast("Gagal menghapus project dari wishlist.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan jaringan.");
    }
  };

  // 3. Remove Cart Item
  const handleRemoveCart = async (projectId: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    try {
      const token = user?.token || localStorage.getItem("studenthub_token") || "";
      const res = await fetch(`${API_URL}/carts/items/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        await syncData();
        showToast("Project dihapus dari Keranjang.");
      } else {
        showToast("Gagal menghapus dari keranjang.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan jaringan.");
    }
  };

  // 4. Cart Checkout
  const handleCheckout = async () => {
    if (!selectedBankId) {
      showToast("Pilih rekening pembayaran terlebih dahulu.");
      return;
    }
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    try {
      const token = user?.token || localStorage.getItem("studenthub_token") || "";
      const res = await fetch(`${API_URL}/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ bankAccountId: Number(selectedBankId) })
      });
      const data = await res.json();
      
      const isSuccess = res.ok && (data.success === true || data.status === "success" || (data.code >= 200 && data.code < 300));
      
      if (isSuccess && data.data) {
        syncData();
        showToast("Checkout berhasil! Silakan bayar tagihan Anda.");
        setActiveTab("orders");
        setViewBillOrder(data.data);
      } else {
        showToast(data.message || "Checkout gagal. Keranjang Anda mungkin kosong.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan jaringan.");
    }
  };

  // 4c. View Bill / Invoice
  const handleViewBill = async (order: any) => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    const token = user?.token || localStorage.getItem("studenthub_token") || "";
    try {
      const res = await fetch(`${API_URL}/payment/proof/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      let proofs = [];
      if (res.ok && data.data && Array.isArray(data.data)) {
        proofs = data.data;
      }

      setViewBillOrder({ ...order, fetchedProofs: proofs });
    } catch (err) {
      setViewBillOrder(order);
    }
  };

  // 5. Real Upload Proof Submission
  const handleUploadProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadProofOrder || !proofFile) return;

    setIsUploadingProof(true);
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    const token = user?.token || localStorage.getItem("studenthub_token") || "";

    try {
      const formData = new FormData();
      formData.append("file", proofFile);

      const res = await fetch(`${API_URL}/payment/upload-proof/${uploadProofOrder.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      const isSuccess = res.ok && (data.success === true || data.status === "success" || (data.code >= 200 && data.code < 300));
      
      if (isSuccess) {
        showToast("Bukti pembayaran berhasil diunggah! Status: Menunggu Verifikasi Admin.");
        syncData();
        setUploadProofOrder(null);
      } else {
        showToast(data.message || "Gagal mengunggah bukti.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan jaringan.");
    } finally {
      setIsUploadingProof(false);
      setProofFile(null);
    }
  };

  // 6. Review Submit
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateProject || !user) return;
    const userToken = user.token || (typeof window !== "undefined" ? localStorage.getItem("studenthub_token") || "" : "");
    try {
      const res = await api.createRating({
        projectId: Number(rateProject.projectId),
        score: ratingVal,
        comment: ratingReview,
      }, userToken);
      if (res.success || res.code === 201) {
        setRatingVal(5);
        setRatingReview("");
        setRateProject(null);
        showToast("Terima kasih! Ulasan Anda berhasil diterbitkan.");
      } else {
        showToast(res.message || "Gagal mengirim ulasan.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan jaringan.");
    }
  };


  const handleDownload = (projectName: string, githubUrl?: string) => {
    alert(`Mensimulasikan pengunduhan source code untuk:\n"${projectName}"\n\nLink repositori: ${githubUrl || "https://github.com/archive"}\n\nFile source_code.zip sedang diunduh...`);
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

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel rounded-xl border border-cyan-500/30 px-5 py-3.5 bg-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.2)] text-white text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="h-4.5 w-4.5 text-cyan-400 animate-bounce" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow"></div>

        {/* User Greeting Dashboard Card */}
        <div className="glass-panel rounded-2xl border border-white/5 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-glow-cyan">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-white">Dashboard Customer</h1>
              <p className="text-slate-400 text-xs sm:text-sm flex flex-wrap items-center gap-2 mt-1">
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-cyan-400" /> {user.name}</span>
                <span className="text-slate-700">|</span>
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-indigo-400" /> {user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="flex-grow md:flex-grow-0 p-3 px-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center min-w-[110px]">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Keranjang</p>
              <p className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{cart.length} Item</p>
            </div>
            <div className="flex-grow md:flex-grow-0 p-3 px-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center min-w-[110px]">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Wishlist</p>
              <p className="text-sm font-bold text-rose-455 font-mono mt-0.5">{wishlist.length} Item</p>
            </div>
            <div className="flex-grow md:flex-grow-0 p-3 px-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center min-w-[110px]">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Transaksi</p>
              <p className="text-sm font-bold text-white font-mono mt-0.5">{orders.length} Order</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar Menu */}
          <div className="lg:col-span-3 space-y-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border text-left cursor-pointer ${
                activeTab === "profile"
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.05)]"
                  : "bg-slate-950/20 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/20"
              }`}
            >
              <User className="h-4.5 w-4.5" />
              Kelola Profil Akun
            </button>

            <button
              onClick={() => setActiveTab("wishlist")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${
                activeTab === "wishlist"
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                  : "bg-slate-950/20 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/20"
              }`}
            >
              <span className="flex items-center gap-3">
                <Heart className="h-4.5 w-4.5" />
                Wishlist Saya
              </span>
              {wishlist.length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("cart")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${
                activeTab === "cart"
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                  : "bg-slate-950/20 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/20"
              }`}
            >
              <span className="flex items-center gap-3">
                <ShoppingCart className="h-4.5 w-4.5" />
                Keranjang Belanja
              </span>
              {cart.length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500 text-slate-950 rounded-full animate-bounce">
                  {cart.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${
                activeTab === "orders"
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                  : "bg-slate-950/20 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/20"
              }`}
            >
              <span className="flex items-center gap-3">
                <CreditCard className="h-4.5 w-4.5" />
                Daftar & Tagihan Order
              </span>
              {orders.filter((o) => o.status === "PENDING").length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse">
                  {orders.filter((o) => o.status === "PENDING").length}
                </span>
              )}
            </button>

          </div>

          {/* Right Main Content Panel */}
          <div className="lg:col-span-9 glass-panel rounded-2xl border border-white/5 p-6 md:p-8 min-h-[50vh]">
            
            {/* Tab 1: Profile Akun (GET /users/me & PATCH /users/me) */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Informasi Profil Akun</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Lihat atau perbarui detail profil pribadi Anda secara instan.</p>
                </div>

                {profileSuccess && (
                  <div className="p-4 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs sm:text-sm rounded-xl">
                    {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="p-4 bg-red-500/15 border border-red-500/25 text-red-400 text-xs sm:text-sm rounded-xl">
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-4 max-w-xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-350 block">Nama Profil</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder-slate-650 text-sm transition-all focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-350 block">Alamat Email</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-cyan-500 text-slate-100 placeholder-slate-650 text-sm transition-all focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-semibold text-slate-500 block">Jenis Hak Akses (Role)</label>
                    <div className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-900 text-slate-400 text-xs font-mono">
                      {user.role} (Akses Transaksi, Keranjang, Wishlist, & Ulasan Pembelian)
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl cursor-pointer"
                    >
                      {isSavingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 2: Wishlist Saya (GET /wishlists/my-wishlist) */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Wishlist Saya</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Daftar produk kode sumber proyek pilihan yang Anda sukai.</p>
                </div>

                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map((project) => (
                      <div 
                        key={project.id}
                        className="p-4 rounded-xl border border-slate-900 bg-slate-950/60 flex flex-col justify-between gap-4 hover:border-slate-800 transition-colors"
                      >
                        <div className="space-y-1.5">
                          <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded">
                            {typeof project.category === 'object' ? project.category?.name : project.category}
                          </span>
                          <h4 className="font-display font-semibold text-white text-sm sm:text-base line-clamp-1">{project.title}</h4>
                          <p className="text-slate-500 text-[10px] sm:text-xs">Oleh: {project.studentName} | {project.university}</p>
                          <p className="text-slate-300 font-bold font-mono text-sm pt-1">{formatPrice(project.price)}</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRemoveWishlist(project.id)}
                            className="p-2.5 rounded-lg border border-slate-850 bg-slate-900/30 text-rose-455 hover:text-white hover:bg-rose-500/20 transition-colors cursor-pointer"
                            title="Hapus dari Wishlist"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/projects/${project.id}`}
                            className="flex-grow flex items-center justify-center gap-1 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-colors text-center"
                          >
                            Buka Detail
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-950/20 rounded-2xl border border-dashed border-slate-900">
                    <Heart className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-medium">Wishlist Anda kosong</p>
                    <Link
                      href="/marketplace"
                      className="mt-3 inline-block text-xs text-cyan-400 hover:underline"
                    >
                      Buka katalog dan cari project yang Anda sukai
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Keranjang Belanja (GET /carts/my-cart & DELETE /carts/:projectId & Checkout) */}
            {activeTab === "cart" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Keranjang Belanja</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Kelola item pilihan Anda dan lakukan checkout sekaligus menjadi satu nomor Order.</p>
                </div>

                {cart.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                    {/* Cart Items list */}
                    <div className="lg:col-span-2 space-y-4">
                      <AnimatePresence>
                        {cart.map((item) => (
                          <motion.div 
                            key={item.id} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-900 hover:border-slate-800 transition-colors"
                          >
                            <div className="space-y-1">
                              <h4 className="font-semibold text-white text-xs sm:text-sm">{item.title}</h4>
                              <p className="text-[10px] text-slate-500">Oleh: {item.studentName}</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-white font-mono text-xs sm:text-sm">{formatPrice(item.price)}</span>
                              <button
                                onClick={() => handleRemoveCart(item.id)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all cursor-pointer hover:scale-105"
                                title="Hapus"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Checkout Card Form */}
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="lg:col-span-1 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-6 sticky top-6"
                    >
                      <h4 className="font-semibold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-cyan-400" />
                        Ringkasan Belanja
                      </h4>
                      
                      {/* Pricing Summary */}
                      <div className="space-y-3 border-b border-slate-900 pb-4">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>Total Item:</span>
                          <span className="font-medium text-white">{cart.length} Item</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-300 font-medium">Total Harga:</span>
                          <span className="font-bold text-cyan-400 font-mono text-base">
                            {formatPrice(cart.reduce((s, item) => s + item.price, 0))}
                          </span>
                        </div>
                      </div>

                      {/* Select Bank Account */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 block">Pilih Rekening Tujuan:</label>
                        {bankAccounts.length > 0 ? (
                          <div className="relative">
                            <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <select
                              value={selectedBankId}
                              onChange={(e) => setSelectedBankId(e.target.value)}
                              className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-850 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-200 text-xs focus:outline-none appearance-none transition-all cursor-pointer"
                            >
                              <option value="" disabled>-- Pilih Rekening Pembayaran --</option>
                              {bankAccounts.map((bank) => (
                                <option key={bank.id} value={bank.id}>
                                  {bank.bankName} - {bank.accountNumber}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-950 border border-slate-850 rounded-xl">
                            <div className="h-3 w-3 rounded-full bg-cyan-500/50 animate-ping"></div>
                            <p className="text-xs text-slate-500">Memuat rekening...</p>
                          </div>
                        )}
                      </div>

                      {/* Checkout Action Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCheckout}
                        className="w-full relative group flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all cursor-pointer mt-2"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500 group-hover:opacity-90 transition-opacity"></span>
                        <span className="relative z-10 text-xs sm:text-sm flex items-center gap-1.5">
                          <CheckCircle2 className="h-4.5 w-4.5" />
                          Checkout Sekarang
                        </span>
                      </motion.button>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 flex flex-col items-center"
                  >
                    <div className="h-16 w-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                      <ShoppingCart className="h-8 w-8 text-slate-600" />
                    </div>
                    <p className="text-slate-300 text-sm font-medium">Keranjang Belanja Kosong</p>
                    <p className="text-slate-500 text-xs mt-1 max-w-sm">Anda belum menambahkan project apapun ke dalam keranjang belanja.</p>
                    <Link
                      href="/marketplace"
                      className="mt-6 px-6 py-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 rounded-full text-xs font-semibold transition-all"
                    >
                      Eksplorasi Project
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Tab 4: Daftar & Tagihan Order (GET /orders, Payment Proofs, Ratings) */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Daftar Tagihan & Riwayat Pembelian</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Pantau status transaksi belanja Anda, unggah bukti bayar, dan buka kunci source code.</p>
                </div>

                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs sm:text-sm text-slate-350">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                          <th className="py-4">Kode Order</th>
                          <th className="py-4">Item Pembelian</th>
                          <th className="py-4">Total Tagihan</th>
                          <th className="py-4 text-center">Status Bayar</th>
                          <th className="py-4 text-right">Aksi Layanan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/60">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-900/10 transition-colors">
                            <td className="py-4 font-mono font-semibold text-white">{order.orderCode}</td>
                            <td className="py-4">
                              <div className="max-w-[200px] truncate" title={order.items.map((i)=>i.title).join(", ")}>
                                {order.items.map((i) => i.title).join(", ")}
                              </div>
                              <span className="text-[10px] text-slate-500 block mt-0.5">{order.createdAt}</span>
                            </td>
                            <td className="py-4 font-mono font-bold">{formatPrice(order.totalPrice)}</td>
                            <td className="py-4 text-center">
                              {(order.status === "PENDING" || order.status === "PENDING_PAYMENT") && (
                                <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Belum Bayar</span>
                              )}
                              {order.status === "WAITING_VERIFICATION" && (
                                <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">Menunggu Verifikasi</span>
                              )}
                              {(order.status === "PAID" || order.status === "APPROVED") && (
                                <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-450 border border-emerald-500/20">Lunas / APPROVED</span>
                              )}
                              {order.status === "REJECTED" && (
                                <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-455 border border-rose-500/20">Ditolak</span>
                              )}
                              {order.status === "CANCELLED" && (
                                <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">Dibatalkan</span>
                              )}
                            </td>
                            <td className="py-4 text-right space-y-1 sm:space-y-0 sm:space-x-1.5 flex flex-col sm:flex-row justify-end items-center">
                              {/* Check Bill */}
                              <button
                                onClick={() => handleViewBill(order)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-350 hover:text-white transition-colors cursor-pointer text-[10px] font-semibold"
                                title="Lihat Tagihan"
                              >
                                <FileText className="h-3 w-3" /> Tagihan
                              </button>

                              {/* Upload Proof */}
                              {(order.status === "PENDING" || order.status === "PENDING_PAYMENT") && (
                                <button
                                  onClick={() => setUploadProofOrder(order)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all cursor-pointer text-[10px] font-semibold"
                                >
                                  <Upload className="h-3 w-3" /> Unggah Bukti
                                </button>
                              )}

                              {/* Download Source Code (PAID / APPROVED only) */}
                              {(order.status === "PAID" || order.status === "APPROVED") && (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => handleDownload(order.items[0]?.title || "Source Code")}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer text-[10px] font-semibold"
                                  >
                                    <Download className="h-3 w-3" /> Unduh ZIP
                                  </button>
                                  
                                  <button
                                    onClick={() => setRateProject({ projectId: order.items[0]?.projectId, title: order.items[0]?.title, orderId: order.id })}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer text-[10px] font-semibold"
                                    title="Berikan ulasan"
                                  >
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Review
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-950/20 rounded-2xl border border-dashed border-slate-900">
                    <CreditCard className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-medium">Belum ada riwayat pemesanan</p>
                    <Link
                      href="/marketplace"
                      className="mt-3 inline-block text-xs text-cyan-400 hover:underline"
                    >
                      Belanja sekarang untuk membuat pesanan
                    </Link>
                  </div>
                )}
              </div>
            )}


          </div>

        </div>

      </main>

      {/* --- MODAL WIDGETS --- */}

      {/* Modal 1: Check Bill Details / Invoice */}
      {viewBillOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="fixed inset-0" onClick={() => setViewBillOrder(null)}></div>
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-950 border border-slate-900 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 my-8">
            <button 
              onClick={() => setViewBillOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 cursor-pointer"
            >
              <XCircle className="h-5 w-5" />
            </button>

            {/* Invoice Header */}
            <div className="text-center border-b border-dashed border-slate-800 pb-5 mb-5">
              <h3 className="font-display font-semibold text-xl text-white uppercase tracking-wider">Nota Pembelian</h3>
              <p className="text-cyan-400 text-xs font-mono mt-1 font-bold">INV-{viewBillOrder.orderCode}</p>
            </div>

            {/* Customer & Order Details */}
            <div className="grid grid-cols-2 gap-4 text-[11px] sm:text-xs mb-6 text-slate-400">
              <div className="space-y-1">
                <p className="uppercase tracking-widest text-[9px] text-slate-500 font-bold">Diterbitkan Kepada:</p>
                <p className="text-white font-medium">{user.name}</p>
                <p>{user.email}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="uppercase tracking-widest text-[9px] text-slate-500 font-bold">Tanggal Order:</p>
                <p className="text-white font-medium">{viewBillOrder.createdAt ? new Date(viewBillOrder.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}</p>
                
                <p className="uppercase tracking-widest text-[9px] text-slate-500 font-bold mt-2">Status Pembayaran:</p>
                <p className={`font-bold ${
                  (viewBillOrder.status === 'PAID' || viewBillOrder.status === 'APPROVED') ? 'text-emerald-400' :
                  viewBillOrder.status === 'WAITING_VERIFICATION' ? 'text-cyan-400 animate-pulse' :
                  viewBillOrder.status === 'REJECTED' ? 'text-rose-450' : 'text-yellow-400'
                }`}>
                  {viewBillOrder.status}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2 mb-6">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Rincian Pembelian:</p>
              <div className="bg-slate-900/40 border border-slate-900 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-2 px-3 font-medium">Produk / Project</th>
                      <th className="py-2 px-3 text-right font-medium">Harga</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {viewBillOrder.items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-3 text-slate-300 font-medium">{item.title}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400 text-right">{formatPrice(item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-900/80 border-t border-slate-800">
                    <tr>
                      <td className="py-3 px-3 text-slate-400 font-semibold text-right">Total Tagihan:</td>
                      <td className="py-3 px-3 font-bold text-white font-mono text-right text-sm">{formatPrice(viewBillOrder.totalPrice)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment Proof Section (If exists) */}
            {viewBillOrder.fetchedProofs && viewBillOrder.fetchedProofs.length > 0 ? (
              <div className="space-y-2 mb-6">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold border-t border-slate-800 pt-4 mt-2">Bukti Pembayaran Terlampir:</p>
                <div className="flex gap-4 items-start bg-slate-900/30 p-3 rounded-xl border border-slate-800/50">
                  <div 
                    className="h-20 w-16 sm:h-24 sm:w-20 shrink-0 rounded-lg overflow-hidden border border-slate-700 cursor-pointer group relative"
                    onClick={() => setZoomedImage(viewBillOrder.fetchedProofs[0].fileUrl)}
                  >
                    <img 
                      src={viewBillOrder.fetchedProofs[0].fileUrl} 
                      alt="Bukti Transfer" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Search className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1 py-1">
                    <p className="text-xs text-slate-300 font-medium">File Bukti Terunggah</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      Telah dilampirkan oleh Customer
                    </p>
                    {viewBillOrder.fetchedProofs[0].adminNote && (
                      <div className="mt-2 text-[10px] bg-red-500/10 text-red-400 px-2 py-1.5 rounded border border-red-500/20 inline-block">
                        <span className="font-bold">Catatan Admin:</span> {viewBillOrder.fetchedProofs[0].adminNote}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Instructions if no proof yet */
              <div className="space-y-1 mb-6">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Instruksi Pembayaran:</p>
                <div className="p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/10 text-xs text-cyan-400 space-y-1.5 font-mono">
                  <p className="font-bold flex items-center gap-1.5 font-sans"><Landmark className="h-4 w-4" /> Transfer Bank Rekber</p>
                  <p className="text-slate-400 font-sans leading-relaxed">Silakan lakukan transfer sebesar nominal total di atas ke rekening tujuan, lalu <span className="text-white font-semibold">unggah bukti bayar</span> pada menu "Unggah Bukti" agar pesanan Anda dapat diproses oleh Admin.</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setViewBillOrder(null)}
                className="w-full py-3 rounded-xl border border-slate-850 text-slate-300 hover:text-white bg-slate-900/30 hover:bg-slate-900/80 transition-colors text-xs font-semibold cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" /> Tutup Nota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Upload Proof Transfer */}
      {uploadProofOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setUploadProofOrder(null)}></div>
          <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-slate-900 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 space-y-5">
            <button 
              onClick={() => setUploadProofOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 cursor-pointer"
            >
              <XCircle className="h-5 w-5" />
            </button>

            <form onSubmit={handleUploadProofSubmit} className="space-y-4">
              <div className="text-center">
                <h3 className="font-display font-semibold text-lg text-white">Unggah Bukti Transfer</h3>
                <p className="text-slate-400 text-xs mt-1">Lakukan transfer lalu simulasikan unggah gambar bukti transfer sukses.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 flex justify-between items-center text-xs sm:text-sm text-white font-mono">
                <span className="text-slate-450 font-sans">Jumlah Transfer:</span>
                <span className="font-bold text-cyan-400">{formatPrice(uploadProofOrder.totalPrice)}</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Bukti Transfer Sukses</label>
                {proofFile ? (
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 text-xs text-emerald-400 font-semibold font-mono">
                    <span className="flex items-center gap-2 truncate pr-2">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                      {proofFile.name} ({(proofFile.size / 1024).toFixed(0)} KB)
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setProofFile(null)}
                      className="text-[10px] text-slate-500 hover:text-red-400 uppercase font-bold shrink-0"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <label className="w-full flex flex-col items-center justify-center border border-dashed border-slate-800 hover:border-cyan-500/30 bg-slate-900/30 p-6 rounded-xl text-center transition-colors cursor-pointer group">
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-cyan-400 transition-colors">
                      Pilih File Bukti Pembayaran
                    </span>
                    <span className="text-[10px] text-slate-550 mt-1">Klik untuk memilih foto/screenshot dari perangkat Anda</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setProofFile(e.target.files ? e.target.files[0] : null)}
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadProofOrder(null)}
                  className="w-1/3 py-3 rounded-xl border border-slate-850 text-slate-450 hover:text-white bg-slate-900/30 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingProof || !proofFile}
                  className="w-2/3 relative group flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl overflow-hidden shadow-lg disabled:opacity-50 transition-all cursor-pointer"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500"></span>
                  <span className="relative z-10 text-xs">
                    {isUploadingProof ? "Mengirim..." : "Kirim Bukti Pembayaran"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Modal 4: Rate & Review */}
      {rateProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setRateProject(null)}></div>
          <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-slate-900 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 space-y-5">
            <button 
              onClick={() => setRateProject(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 cursor-pointer"
            >
              <XCircle className="h-5 w-5" />
            </button>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="text-center">
                <h3 className="font-display font-semibold text-lg text-white">Berikan Ulasan & Rating</h3>
                <p className="text-slate-450 text-xs mt-1">Ulas proyek: <span className="text-cyan-400 font-semibold">{rateProject.title}</span></p>
              </div>

              {/* Stars select */}
              <div className="flex items-center justify-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingVal(star)}
                    className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star className={`h-8 w-8 ${star <= ratingVal ? "fill-amber-400" : "text-slate-700"}`} />
                  </button>
                ))}
              </div>

              {/* Review Text Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350 block">Ulasan Anda</label>
                <textarea
                  required
                  rows={4}
                  value={ratingReview}
                  onChange={(e) => setRatingReview(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda menggunakan kode sumber proyek ini..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 focus:border-cyan-500 text-slate-200 text-xs sm:text-sm focus:outline-none"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRateProject(null)}
                  className="w-1/3 py-3 rounded-xl border border-slate-850 text-slate-450 hover:text-white bg-slate-900/30 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-2/3 relative group flex items-center justify-center gap-2 text-white font-semibold py-3 rounded-xl overflow-hidden shadow-lg cursor-pointer"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-indigo-500"></span>
                  <span className="relative z-10 text-xs">Kirim Ulasan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setZoomedImage(null)}></div>
          <button 
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 cursor-pointer z-10"
          >
            <XCircle className="h-6 w-6" />
          </button>
          
          <div className="relative z-10 max-w-[90vw] max-h-[90vh]">
            <img 
              src={zoomedImage} 
              alt="Zoomed Proof" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-slate-800" 
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default function CustomerDashboard() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500"></div>
      </div>
    }>
      <CustomerDashboardContent />
    </Suspense>
  );
}
