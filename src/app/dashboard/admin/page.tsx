"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  getProjectsAllAdmin, Project, updateProjectStatus, deleteProject, saveProject, updateProject,
  getOrders, verifyPayment, Order, BankAccount, getBankAccounts, saveBankAccount, updateBankAccount, deleteBankAccount,
  Category, getCategories, saveCategory, updateCategory, deleteCategory,
  Tag, getTags, saveTag, updateTag, deleteTag,
  Major, getMajors, saveMajor, deleteMajor,
  Batch, getBatches, saveBatch, deleteBatch,
  Student, getStudents, saveStudent, deleteStudent,
  Contact, getContacts, markContactRead
} from "@/data/mockData";
import { 
  Shield, Check, X, Clock, TrendingUp, Coins, Users, 
  CheckSquare, Eye, ExternalLink, Image as ImageIcon, Landmark,
  FolderOpen, Plus, Edit, Trash2, Tag as TagIcon, MessageSquare, AlertTriangle, GraduationCap, DollarSign,
  CheckCircle2, XCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Active Tab: summary, moderation, orders, master-catalog, master-academic, bank-accounts, contacts
  const [activeTab, setActiveTab] = useState<"summary" | "moderation" | "orders" | "master-catalog" | "master-academic" | "bank-accounts" | "contacts">("summary");

  // Inner sub-tabs
  const [catalogSubTab, setCatalogSubTab] = useState<"categories" | "tags">("categories");
  const [academicSubTab, setAcademicSubTab] = useState<"majors" | "batches" | "students">("students");

  // Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Modals / Details Views
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [viewOrderReceipt, setViewOrderReceipt] = useState<Order | null>(null);
  const [verifyOrder, setVerifyOrder] = useState<Order | null>(null);
  const [viewContact, setViewContact] = useState<Contact | null>(null);

  // Forms Create/Edit States
  const [showAddProject, setShowAddProject] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  // Add Project fields
  const [prjTitle, setPrjTitle] = useState("");
  const [prjDesc, setPrjDesc] = useState("");
  const [prjCat, setPrjCat] = useState("");
  const [prjPrice, setPrjPrice] = useState("");
  const [prjUniv, setPrjUniv] = useState("");
  const [prjDemo, setPrjDemo] = useState("");
  const [prjSource, setPrjSource] = useState("");
  const [prjStudentId, setPrjStudentId] = useState("");
  const [prjThumbnail, setPrjThumbnail] = useState("");
  const [simulatedMultipartFile, setSimulatedMultipartFile] = useState(false);
  const [isCreatingPrj, setIsCreatingPrj] = useState(false);

  // Master Catalog CRUD states
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catIcon, setCatIcon] = useState("");
  const [tagName, setTagName] = useState("");

  // Master Academic CRUD states
  const [majorName, setMajorName] = useState("");
  const [majorCode, setMajorCode] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentMajorId, setStudentMajorId] = useState("");
  const [studentBatchId, setStudentBatchId] = useState("");
  const [studentNumber, setStudentNumber] = useState("");

  // Bank Accounts CRUD states
  const [bankName, setBankName] = useState("");
  const [bankAccName, setBankAccName] = useState("");
  const [bankAccNo, setBankAccNo] = useState("");

  // Payment Verification fields
  const [adminNote, setAdminNote] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Protect Dashboard Route
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user && user.role !== "ADMIN") {
        router.push("/dashboard/customer"); // User role redirected
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Load All Admin Data
  const loadAdminData = () => {
    if (user && user.role === "ADMIN") {
      const token = user.token || "";
      setProjects(getProjectsAllAdmin(token));
      setOrders(getOrders(token));
      setCategories(getCategories(token));
      setTags(getTags(token));
      setMajors(getMajors(token));
      setBatches(getBatches(token));
      setStudents(getStudents(token));
      setBankAccounts(getBankAccounts(token));
      setContacts(getContacts(token));

      // Preset default dropdown categories
      const cats = getCategories(token);
      if (cats.length > 0 && !prjCat) {
        setPrjCat(cats[0].title);
      }
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user, activeTab, catalogSubTab, academicSubTab]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  // --- DERIVED METRICS ---
  const totalRevenue = orders
    .filter((o) => o.status === "APPROVED")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingModerationCount = projects.filter((p) => p.status === "DRAFT").length;
  const pendingOrdersCount = orders.filter((o) => o.status === "PAID").length;
  const publishedProjectsCount = projects.filter((p) => p.status === "PUBLISHED").length;

  // --- HANDLERS ---

  // 1. Projects
  const handlePublishProject = (id: string) => {
    updateProjectStatus(id, "approved");
    loadAdminData();
    setViewProject(null);
    showToast("Proyek berhasil dipublikasikan ke Katalog!");
  };

  const handleDraftProject = (id: string) => {
    updateProjectStatus(id, "rejected");
    loadAdminData();
    setViewProject(null);
    showToast("Proyek ditarik kembali menjadi DRAFT.");
  };

  const handleDeleteProject = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus proyek ini?")) {
      deleteProject(id, user.token || "");
      loadAdminData();
      showToast("Proyek berhasil dihapus.");
    }
  };

  const handleAddProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prjTitle || !prjDesc || !prjPrice || !prjUniv || !prjSource) {
      showToast("Mohon lengkapi semua bidang wajib.");
      return;
    }

    setIsCreatingPrj(true);
    // Simulate multipart/form-data upload delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Connect selected student details
    let selectedStudentName = "Karya Siswa";
    if (prjStudentId) {
      const stud = students.find((s) => s.id === prjStudentId);
      if (stud) selectedStudentName = stud.name;
    }

    const newPrj = saveProject({
      title: prjTitle,
      description: prjDesc,
      category: prjCat,
      price: Number(prjPrice),
      studentName: selectedStudentName,
      university: prjUniv,
      studentId: prjStudentId || undefined,
      demoUrl: prjDemo || undefined,
      sourceCodeUrl: prjSource,
      thumbnail: prjThumbnail || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60",
      mediaUrls: prjThumbnail ? [prjThumbnail] : [],
    }, user.token || "");

    setIsCreatingPrj(false);
    setShowAddProject(false);
    setPrjTitle("");
    setPrjDesc("");
    setPrjPrice("");
    setPrjUniv("");
    setPrjDemo("");
    setPrjSource("");
    setPrjStudentId("");
    setPrjThumbnail("");
    setSimulatedMultipartFile(false);
    
    loadAdminData();
    showToast("Proyek baru berhasil didaftarkan sebagai DRAFT (Multipart simulation).");
  };

  // 2. Master Catalog: Categories & Tags
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catDesc) return;
    saveCategory({
      title: catName,
      description: catDesc,
      iconName: catIcon || "Globe",
      accentColor: "neon-cyan",
    }, user.token || "");
    setCatName("");
    setCatDesc("");
    setCatIcon("");
    loadAdminData();
    showToast("Kategori baru berhasil ditambahkan!");
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName) return;
    saveTag({ name: tagName }, user.token || "");
    setTagName("");
    loadAdminData();
    showToast("Tag baru berhasil ditambahkan!");
  };

  // 3. Master Academic: Majors, Batches, Students
  const handleAddMajor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!majorName || !majorCode) return;
    saveMajor({ name: majorName, code: majorCode }, user.token || "");
    setMajorName("");
    setMajorCode("");
    loadAdminData();
    showToast("Program Studi berhasil terdaftar.");
  };

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchYear) return;
    saveBatch({ year: batchYear, name: `Angkatan ${batchYear}` }, user.token || "");
    setBatchYear("");
    loadAdminData();
    showToast("Angkatan baru berhasil ditambahkan.");
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentEmail || !studentMajorId || !studentBatchId || !studentNumber) {
      showToast("Mohon lengkapi data siswa.");
      return;
    }
    saveStudent({
      name: studentName,
      email: studentEmail,
      majorId: studentMajorId,
      batchId: studentBatchId,
      studentNumber,
    }, user.token || "");
    setStudentName("");
    setStudentEmail("");
    setStudentNumber("");
    loadAdminData();
    showToast("Siswa Akademik berhasil didaftarkan!");
  };

  // 4. Financial & Bank Accounts
  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !bankAccName || !bankAccNo) return;
    saveBankAccount({
      bankName,
      accountName: bankAccName,
      accountNumber: bankAccNo,
      isActive: true,
    }, user.token || "");
    setBankName("");
    setBankAccName("");
    setBankAccNo("");
    loadAdminData();
    showToast("Rekening Bank resmi ditambahkan.");
  };

  const handleToggleBankStatus = (bank: BankAccount) => {
    updateBankAccount(bank.id, { isActive: !bank.isActive }, user.token || "");
    loadAdminData();
    showToast("Status keaktifan rekening diubah.");
  };

  // 5. Payment Verification (PATCH /payment/verify/:id)
  const handleVerifyOrderPayment = (status: "APPROVED" | "REJECTED") => {
    if (!verifyOrder) return;
    verifyPayment(verifyOrder.id, status, adminNote, user.token || "");
    setVerifyOrder(null);
    setAdminNote("");
    loadAdminData();
    showToast(`Bukti transfer berhasil diverifikasi. Status: ${status}.`);
  };

  // 6. Inquiries
  const handleReadContact = (contactId: string) => {
    markContactRead(contactId, user.token || "");
    loadAdminData();
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

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Admin Header Title */}
        <div className="glass-panel rounded-2xl border border-white/5 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(139,92,246,0.4)] animate-glow-indigo">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-white">Dashboard Administrator</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Panel kendali penuh atas katalog, master data, keuangan, dan otorisasi hak akses StudentHub.
              </p>
            </div>
          </div>

          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-400 font-mono">
            Role: <span className="text-violet-400 uppercase font-bold">SUPER_ADMIN</span>
          </div>
        </div>

        {/* Dashboard Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-2">
            <button
              onClick={() => setActiveTab("summary")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border text-left cursor-pointer ${
                activeTab === "summary"
                  ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                  : "bg-slate-950/20 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/20"
              }`}
            >
              <TrendingUp className="h-4.5 w-4.5" />
              Kinerja Platform
            </button>

            <button
              onClick={() => setActiveTab("moderation")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${
                activeTab === "moderation"
                  ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                  : "bg-slate-950/20 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/20"
              }`}
            >
              <span className="flex items-center gap-3">
                <CheckSquare className="h-4.5 w-4.5" />
                Moderasi & Katalog
              </span>
              {pendingModerationCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse">
                  {pendingModerationCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${
                activeTab === "orders"
                  ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                  : "bg-slate-950/20 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/20"
              }`}
            >
              <span className="flex items-center gap-3">
                <Coins className="h-4.5 w-4.5" />
                Verifikasi Pembayaran
              </span>
              {pendingOrdersCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("master-catalog")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border text-left cursor-pointer ${
                activeTab === "master-catalog"
                  ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                  : "bg-slate-950/20 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/20"
              }`}
            >
              <FolderOpen className="h-4.5 w-4.5" />
              Master Data Katalog
            </button>

            <button
              onClick={() => setActiveTab("master-academic")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border text-left cursor-pointer ${
                activeTab === "master-academic"
                  ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                  : "bg-slate-950/20 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/20"
              }`}
            >
              <GraduationCap className="h-4.5 w-4.5" />
              Data Akademik Siswa
            </button>

            <button
              onClick={() => setActiveTab("bank-accounts")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border text-left cursor-pointer ${
                activeTab === "bank-accounts"
                  ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                  : "bg-slate-950/20 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/20"
              }`}
            >
              <Landmark className="h-4.5 w-4.5" />
              Kelola Rekening Aktif
            </button>

            <button
              onClick={() => setActiveTab("contacts")}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all border cursor-pointer ${
                activeTab === "contacts"
                  ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                  : "bg-slate-950/20 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/20"
              }`}
            >
              <span className="flex items-center gap-3">
                <MessageSquare className="h-4.5 w-4.5" />
                Pesan Kontak Masuk
              </span>
              {contacts.filter((c) => c.status === "pending").length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">
                  {contacts.filter((c) => c.status === "pending").length}
                </span>
              )}
            </button>
          </div>

          {/* Right Main Content Panel */}
          <div className="lg:col-span-9 glass-panel rounded-2xl border border-white/5 p-6 md:p-8 min-h-[50vh]">
            
            {/* Tab 1: Summary Kinerja */}
            {activeTab === "summary" && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Ringkasan Kinerja Platform</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Ikhtisar metrik penting operasional StudentHub.</p>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-850">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Omset</p>
                    <p className="text-lg font-bold text-emerald-450 font-mono mt-1.5">{formatPrice(totalRevenue)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-850">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Project Live</p>
                    <p className="text-lg font-bold text-white font-mono mt-1.5">{publishedProjectsCount} Project</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-850">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Antrean Moderasi</p>
                    <p className="text-lg font-bold text-yellow-450 font-mono mt-1.5">{pendingModerationCount} Item</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-850">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Perlu Verifikasi</p>
                    <p className="text-lg font-bold text-cyan-400 font-mono mt-1.5">{pendingOrdersCount} Transfer</p>
                  </div>
                </div>

                {/* Recent Orders List */}
                <div className="space-y-4 pt-4">
                  <h4 className="font-display font-semibold text-sm text-slate-350 uppercase tracking-wider">Aktivitas Transaksi Terbaru</h4>
                  {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm text-slate-300 border-collapse">
                        <thead>
                          <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-3.5">Kode Order</th>
                            <th className="py-3.5">Item Pembelian</th>
                            <th className="py-3.5">Jumlah</th>
                            <th className="py-3.5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/60">
                          {orders.slice(0, 5).map((order) => (
                            <tr key={order.id} className="hover:bg-slate-900/10 transition-colors">
                              <td className="py-3.5 font-mono text-slate-400">{order.orderCode}</td>
                              <td className="py-3.5 font-semibold text-white truncate max-w-[200px]">{order.items.map((i)=>i.title).join(", ")}</td>
                              <td className="py-3.5 font-mono">{formatPrice(order.totalPrice)}</td>
                              <td className="py-3.5 text-right font-mono text-[10px]">
                                {order.status === "APPROVED" && <span className="text-emerald-400 font-bold">APPROVED</span>}
                                {order.status === "PAID" && <span className="text-cyan-400 animate-pulse font-bold">PAID (VERIFY)</span>}
                                {order.status === "PENDING" && <span className="text-yellow-400 font-bold">PENDING</span>}
                                {order.status === "REJECTED" && <span className="text-rose-500 font-bold">REJECTED</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 border border-slate-900 rounded-xl">
                      Belum ada riwayat pemesanan.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Moderasi & Katalog */}
            {activeTab === "moderation" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-white">Antrean Moderasi & Pengelolaan Katalog</h3>
                    <p className="text-slate-400 text-xs sm:text-sm">Moderasi, tinjau details proyek DRAFT/PUBLISHED, dan buat proyek baru.</p>
                  </div>
                  
                  <button
                    onClick={() => setShowAddProject(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-xs font-semibold cursor-pointer shadow-lg animate-glow-indigo"
                  >
                    <Plus className="h-4 w-4" /> Proyek Baru
                  </button>
                </div>

                {/* Add Project Form (Inline overlay style) */}
                {showAddProject && (
                  <form onSubmit={handleAddProjectSubmit} className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <h4 className="font-semibold text-white text-sm">Formulir Tambah Proyek Baru (Status Awal: DRAFT)</h4>
                      <button 
                        type="button" 
                        onClick={() => setShowAddProject(false)}
                        className="text-slate-500 hover:text-white"
                      >
                        Batal
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-semibold block">Judul Proyek *</label>
                        <input
                          type="text" required value={prjTitle} onChange={(e) => setPrjTitle(e.target.value)}
                          placeholder="Judul Proyek Mahasiswa"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-semibold block">Kategori Teknologi *</label>
                        <select
                          value={prjCat} onChange={(e) => setPrjCat(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-slate-100 focus:outline-none"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.title}>{c.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-semibold block">Harga Lisensi (IDR) *</label>
                        <input
                          type="number" required value={prjPrice} onChange={(e) => setPrjPrice(e.target.value)}
                          placeholder="Masukkan angka saja"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-slate-100 placeholder-slate-660 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-semibold block">Asal Kampus / Universitas *</label>
                        <input
                          type="text" required value={prjUniv} onChange={(e) => setPrjUniv(e.target.value)}
                          placeholder="Contoh: ITB / UI / UGM"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-slate-100 placeholder-slate-660 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-semibold block">Sambungkan ke Siswa Terdaftar (studentId):</label>
                      <select
                        value={prjStudentId} onChange={(e) => setPrjStudentId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-slate-200 focus:outline-none font-mono"
                      >
                        <option value="">-- Hubungkan Siswa --</option>
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>{s.name} ({s.studentNumber})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-semibold block">Deskripsi Detail *</label>
                      <textarea
                        required rows={3} value={prjDesc} onChange={(e) => setPrjDesc(e.target.value)}
                        placeholder="Fitur, teknologi, instalasi..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-slate-100 placeholder-slate-660 focus:outline-none"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-semibold block">Link Repo GitHub *</label>
                        <input
                          type="url" required value={prjSource} onChange={(e) => setPrjSource(e.target.value)}
                          placeholder="https://github.com/..."
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-slate-100 placeholder-slate-660 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-semibold block">Link Demo (Optional)</label>
                        <input
                          type="url" value={prjDemo} onChange={(e) => setPrjDemo(e.target.value)}
                          placeholder="https://demo-project.com"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-slate-100 placeholder-slate-660 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-semibold block">Thumbnail Image URL (Optional)</label>
                      <input
                        type="url" value={prjThumbnail} onChange={(e) => setPrjThumbnail(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-slate-100 placeholder-slate-660 focus:outline-none"
                      />
                    </div>

                    {/* Simulated Multipart Notice */}
                    <div className="p-3 bg-violet-500/5 rounded-lg border border-violet-500/10 space-y-1.5 text-xs text-violet-400">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold block">Simulasi Pengunggahan Multipart/Form-Data:</span>
                      </div>
                      {simulatedMultipartFile ? (
                        <div className="flex items-center justify-between p-2 rounded bg-violet-500/10 font-mono text-[10px] text-violet-300">
                          <span>thumbnail_source_media.zip (12.4 MB) - SELECTED</span>
                          <button type="button" onClick={() => setSimulatedMultipartFile(false)} className="underline">Batal</button>
                        </div>
                      ) : (
                        <button
                          type="button" onClick={() => setSimulatedMultipartFile(true)}
                          className="w-full border border-dashed border-slate-800 hover:border-violet-500/30 p-3 rounded-lg text-center transition-colors text-[11px] font-semibold text-slate-350 cursor-pointer"
                        >
                          Simulasi Unggah Berkas Media & Thumbnail
                        </button>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button" onClick={() => setShowAddProject(false)}
                        className="px-4 py-2 border border-slate-850 hover:bg-slate-900 rounded-lg text-xs font-semibold text-slate-400"
                      >
                        Batal
                      </button>
                      <button
                        type="submit" disabled={isCreatingPrj || !simulatedMultipartFile}
                        className="px-5 py-2 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        {isCreatingPrj ? "Memproses..." : "Daftarkan Project"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Projects List Table */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full border-collapse text-left text-xs sm:text-sm text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                        <th className="py-4">Judul Project</th>
                        <th className="py-4">Kategori</th>
                        <th className="py-4">Harga</th>
                        <th className="py-4">Status</th>
                        <th className="py-4 text-right">Tindakan Moderasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60">
                      {projects.map((project) => (
                        <tr key={project.id} className="hover:bg-slate-900/10 transition-colors">
                          <td className="py-4 font-semibold text-white">
                            <div className="max-w-[200px] truncate">{project.title}</div>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Oleh: {project.studentName} | {project.university}</span>
                          </td>
                          <td className="py-4">{project.category}</td>
                          <td className="py-4 font-mono font-semibold">{formatPrice(project.price)}</td>
                          <td className="py-4">
                            {project.status === "PUBLISHED" ? (
                              <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PUBLISHED</span>
                            ) : (
                              <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">DRAFT</span>
                            )}
                          </td>
                          <td className="py-4 text-right space-y-1 sm:space-y-0 sm:space-x-1.5 flex flex-col sm:flex-row justify-end items-center">
                            <button
                              onClick={() => setViewProject(project)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer font-semibold"
                            >
                              <Eye className="h-3.5 w-3.5" /> Detail
                            </button>

                            {project.status === "DRAFT" ? (
                              <button
                                onClick={() => handlePublishProject(project.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/25 text-[10px] text-emerald-450 hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer font-semibold"
                              >
                                Publish
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDraftProject(project.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-yellow-500/15 border border-yellow-500/25 text-[10px] text-yellow-450 hover:bg-yellow-500 hover:text-slate-950 transition-colors cursor-pointer font-semibold"
                              >
                                Draft
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Verifikasi Pembayaran & Orders */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Antrean Verifikasi Pembayaran</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Periksa data transfer pembeli, setujui/tolak pembayaran (`APPROVED`/`REJECTED`), dan beri adminNote.</p>
                </div>

                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs sm:text-sm text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                          <th className="py-4">Order Code</th>
                          <th className="py-4">Item</th>
                          <th className="py-4">Nominal</th>
                          <th className="py-4 text-center">Status</th>
                          <th className="py-4 text-right">Verifikasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/60">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-900/10 transition-colors">
                            <td className="py-4 font-mono font-semibold text-white">{order.orderCode}</td>
                            <td className="py-4">
                              <div className="max-w-[180px] truncate">{order.items.map((i)=>i.title).join(", ")}</div>
                            </td>
                            <td className="py-4 font-mono font-bold">{formatPrice(order.totalPrice)}</td>
                            <td className="py-4 text-center font-mono text-[9px] font-bold">
                              {order.status === "PENDING" && <span className="text-yellow-400">PENDING</span>}
                              {order.status === "PAID" && <span className="text-cyan-400 animate-pulse">PAID (VERIFY)</span>}
                              {order.status === "APPROVED" && <span className="text-emerald-400">APPROVED</span>}
                              {order.status === "REJECTED" && <span className="text-rose-500">REJECTED</span>}
                            </td>
                            <td className="py-4 text-right space-y-1 sm:space-y-0 sm:space-x-1.5 flex flex-col sm:flex-row justify-end items-center">
                              {order.receiptImage ? (
                                <button
                                  onClick={() => setViewOrderReceipt(order)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-indigo-400 hover:text-white transition-colors cursor-pointer font-semibold"
                                >
                                  <ImageIcon className="h-3.5 w-3.5" /> Bukti Bayar
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-550 block">Belum upload</span>
                              )}

                              {order.status === "PAID" && (
                                <button
                                  onClick={() => {
                                    setVerifyOrder(order);
                                    setAdminNote("");
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-violet-500 hover:bg-violet-600 text-white transition-all cursor-pointer text-[10px] font-semibold"
                                >
                                  Verifikasi Lunas
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-950/20 rounded-2xl border border-dashed border-slate-900">
                    <Coins className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-medium">Antrean pesanan kosong</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Master Data Katalog */}
            {activeTab === "master-catalog" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Master Data Katalog</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Kelola master data Kategori dan Tags pendukung proyek secara penuh.</p>
                </div>

                {/* Sub-tabs Categories/Tags */}
                <div className="flex gap-2 border-b border-slate-900 pb-3">
                  <button
                    onClick={() => setCatalogSubTab("categories")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      catalogSubTab === "categories"
                        ? "bg-violet-500/10 border border-violet-500/30 text-violet-400"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Kategori Katalog
                  </button>
                  <button
                    onClick={() => setCatalogSubTab("tags")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      catalogSubTab === "tags"
                        ? "bg-violet-500/10 border border-violet-500/30 text-violet-400"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Katalog Tags
                  </button>
                </div>

                {/* SUBTAB: Categories CRUD */}
                {catalogSubTab === "categories" && (
                  <div className="space-y-6">
                    {/* Add Category Form */}
                    <form onSubmit={handleAddCategory} className="p-4 rounded-xl border border-slate-900 bg-slate-950 space-y-4 max-w-lg">
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Tambah Kategori Baru</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-semibold">Nama Kategori *</label>
                          <input 
                            type="text" required value={catName} onChange={(e) => setCatName(e.target.value)}
                            placeholder="Contoh: IoT, Web Dev"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-semibold">Nama Icon (Lucide)</label>
                          <input 
                            type="text" value={catIcon} onChange={(e) => setCatIcon(e.target.value)}
                            placeholder="Contoh: Globe, Brain"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Deskripsi Singkat *</label>
                        <input 
                          type="text" required value={catDesc} onChange={(e) => setCatDesc(e.target.value)}
                          placeholder="Jelaskan jenis kategori ini"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-xs rounded-lg cursor-pointer"
                      >
                        Tambah Kategori
                      </button>
                    </form>

                    {/* Categories List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categories.map((cat) => (
                        <div key={cat.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/20 flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="font-bold text-white text-sm">{cat.title}</span>
                            <p className="text-[10px] text-slate-500">Icon: {cat.iconName} | {cat.count}</p>
                            <p className="text-slate-400 text-xs line-clamp-2 mt-1">{cat.description}</p>
                          </div>
                          <button
                            onClick={() => {
                              if (confirm("Hapus kategori ini?")) {
                                deleteCategory(cat.id, user.token || "");
                                loadAdminData();
                                showToast("Kategori dihapus.");
                              }
                            }}
                            className="text-slate-500 hover:text-red-400 cursor-pointer p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUBTAB: Tags CRUD */}
                {catalogSubTab === "tags" && (
                  <div className="space-y-6">
                    {/* Add Tag Form */}
                    <form onSubmit={handleAddTag} className="p-4 rounded-xl border border-slate-900 bg-slate-950 space-y-4 max-w-sm">
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Tambah Tag Baru</h4>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Nama Tag *</label>
                        <input 
                          type="text" required value={tagName} onChange={(e) => setTagName(e.target.value)}
                          placeholder="Contoh: Laravel, React Native"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-xs rounded-lg cursor-pointer"
                      >
                        Tambah Tag
                      </button>
                    </form>

                    {/* Tags List */}
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <div key={tag.id} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-slate-900 border border-slate-850 text-xs font-semibold text-slate-350">
                          <span>{tag.name}</span>
                          <button
                            onClick={() => {
                              deleteTag(tag.id, user.token || "");
                              loadAdminData();
                              showToast("Tag dihapus.");
                            }}
                            className="p-0.5 rounded-full hover:bg-red-500/10 text-slate-500 hover:text-red-400 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Data Akademik Siswa */}
            {activeTab === "master-academic" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Data Siswa & Akademik</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Kelola master Jurusan (Majors), Angkatan (Batches), dan pendaftaran Siswa (Students).</p>
                </div>

                {/* Sub-tabs */}
                <div className="flex gap-2 border-b border-slate-900 pb-3">
                  <button
                    onClick={() => setAcademicSubTab("students")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      academicSubTab === "students"
                        ? "bg-violet-500/10 border border-violet-500/30 text-violet-400"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Daftar Siswa (Students)
                  </button>
                  <button
                    onClick={() => setAcademicSubTab("majors")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      academicSubTab === "majors"
                        ? "bg-violet-500/10 border border-violet-500/30 text-violet-400"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Program Studi (Majors)
                  </button>
                  <button
                    onClick={() => setAcademicSubTab("batches")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      academicSubTab === "batches"
                        ? "bg-violet-500/10 border border-violet-500/30 text-violet-400"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Daftar Angkatan (Batches)
                  </button>
                </div>

                {/* SUBTAB: Majors CRUD */}
                {academicSubTab === "majors" && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddMajor} className="p-4 rounded-xl border border-slate-900 bg-slate-950 space-y-4 max-w-sm">
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Tambah Program Studi</h4>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Nama Program Studi *</label>
                        <input 
                          type="text" required value={majorName} onChange={(e) => setMajorName(e.target.value)}
                          placeholder="Teknik Informatika"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Kode Prodi *</label>
                        <input 
                          type="text" required value={majorCode} onChange={(e) => setMajorCode(e.target.value)}
                          placeholder="TIF"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-xs rounded-lg cursor-pointer"
                      >
                        Tambah Prodi
                      </button>
                    </form>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {majors.map((m) => (
                        <div key={m.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 flex justify-between items-center">
                          <div>
                            <span className="font-bold text-white text-sm">{m.name}</span>
                            <span className="ml-2 inline-flex px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">{m.code}</span>
                          </div>
                          <button
                            onClick={() => {
                              deleteMajor(m.id, user.token || "");
                              loadAdminData();
                              showToast("Prodi dihapus.");
                            }}
                            className="text-slate-500 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUBTAB: Batches CRUD */}
                {academicSubTab === "batches" && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddBatch} className="p-4 rounded-xl border border-slate-900 bg-slate-950 space-y-4 max-w-xs">
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Tambah Angkatan</h4>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Tahun Angkatan *</label>
                        <input 
                          type="number" required value={batchYear} onChange={(e) => setBatchYear(e.target.value)}
                          placeholder="2024"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-xs rounded-lg cursor-pointer"
                      >
                        Tambah Angkatan
                      </button>
                    </form>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {batches.map((b) => (
                        <div key={b.id} className="p-3 rounded-xl border border-slate-900 bg-slate-900/10 flex justify-between items-center">
                          <span className="font-bold text-white text-sm">{b.name}</span>
                          <button
                            onClick={() => {
                              deleteBatch(b.id, user.token || "");
                              loadAdminData();
                              showToast("Angkatan dihapus.");
                            }}
                            className="text-slate-500 hover:text-red-400 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SUBTAB: Students CRUD */}
                {academicSubTab === "students" && (
                  <div className="space-y-6">
                    {/* Add Student Form */}
                    <form onSubmit={handleAddStudent} className="p-5 rounded-xl border border-slate-900 bg-slate-950 space-y-4">
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Mendaftarkan Siswa Akademik Baru</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-semibold">Nama Siswa *</label>
                          <input 
                            type="text" required value={studentName} onChange={(e) => setStudentName(e.target.value)}
                            placeholder="Nama Lengkap Siswa"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-semibold">NIM / Nomor Induk Siswa *</label>
                          <input 
                            type="text" required value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)}
                            placeholder="13522089"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-semibold">Alamat Email *</label>
                          <input 
                            type="email" required value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)}
                            placeholder="siswa@student.id"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-semibold">Program Studi *</label>
                          <select 
                            value={studentMajorId} onChange={(e) => setStudentMajorId(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="">-- Pilih Prodi --</option>
                            {majors.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-semibold">Tahun Angkatan *</label>
                          <select 
                            value={studentBatchId} onChange={(e) => setStudentBatchId(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-slate-200 focus:outline-none"
                          >
                            <option value="">-- Pilih Angkatan --</option>
                            {batches.map((b) => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-xs rounded-lg cursor-pointer"
                      >
                        Daftarkan Siswa
                      </button>
                    </form>

                    {/* Students list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {students.map((student) => {
                        const major = majors.find((m) => m.id === student.majorId);
                        const batch = batches.find((b) => b.id === student.batchId);
                        
                        return (
                          <div key={student.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 flex justify-between items-center">
                            <div className="space-y-1">
                              <span className="font-bold text-white text-sm">{student.name}</span>
                              <p className="text-[10px] font-mono text-slate-500">NIM: {student.studentNumber} | {student.email}</p>
                              <p className="text-slate-400 text-xs font-semibold pt-0.5">
                                {major?.name} ({batch?.year || "Alumni"})
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                deleteStudent(student.id, user.token || "");
                                loadAdminData();
                                showToast("Siswa dihapus.");
                              }}
                              className="text-slate-500 hover:text-red-400 cursor-pointer p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 6: Kelola Rekening Aktif */}
            {activeTab === "bank-accounts" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Kelola Rekening Pembayaran Resmi</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Tambahkan, edit, aktifkan/nonaktifkan rekening resmi untuk tujuan transfer pesanan pembeli.</p>
                </div>

                {/* Add Bank Form */}
                <form onSubmit={handleAddBank} className="p-4 rounded-xl border border-slate-900 bg-slate-950 space-y-4 max-w-md">
                  <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Tambah Rekening Baru</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] text-slate-400 block font-semibold">Nama Bank *</label>
                      <input 
                        type="text" required value={bankName} onChange={(e) => setBankName(e.target.value)}
                        placeholder="BCA / Mandiri"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] text-slate-400 block font-semibold">Nomor Rekening *</label>
                      <input 
                        type="text" required value={bankAccNo} onChange={(e) => setBankAccNo(e.target.value)}
                        placeholder="124-001-92384"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-semibold">Nama Pemilik Rekening *</label>
                    <input 
                      type="text" required value={bankAccName} onChange={(e) => setBankAccName(e.target.value)}
                      placeholder="Atas Nama Pemilik Rekening"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-xs rounded-lg cursor-pointer"
                  >
                    Daftarkan Rekening
                  </button>
                </form>

                {/* Bank Accounts list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bankAccounts.map((bank) => (
                    <div key={bank.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{bank.bankName}</span>
                          <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold ${bank.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                            {bank.isActive ? "AKTIF" : "NONAKTIF"}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-slate-350">{bank.accountNumber}</p>
                        <p className="text-[10px] text-slate-500">A/N: {bank.accountName}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleBankStatus(bank)}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] hover:text-white transition-colors cursor-pointer"
                        >
                          Toggle Status
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Hapus rekening ini?")) {
                              deleteBankAccount(bank.id, user.token || "");
                              loadAdminData();
                              showToast("Rekening bank resmi dihapus.");
                            }
                          }}
                          className="text-slate-500 hover:text-red-400 cursor-pointer p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 7: Pesan Kontak Masuk */}
            {activeTab === "contacts" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Inquiries / Pesan Kontak Publik</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Tinjau pesan kontak masuk (`POST /contacts`) dari pengunjung publik platform StudentHub.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {contacts.map((contact) => (
                    <div 
                      key={contact.id} 
                      className={`p-4 rounded-xl border transition-colors flex justify-between items-start gap-4 ${
                        contact.status === "pending" 
                          ? "bg-violet-500/5 border-violet-500/20" 
                          : "bg-slate-900/10 border-slate-900"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs sm:text-sm">{contact.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">({contact.email})</span>
                          {contact.status === "pending" && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-amber-500 text-slate-950 font-bold animate-pulse">BARU</span>
                          )}
                        </div>
                        <p className="text-slate-450 text-[10px] font-mono">{contact.createdAt}</p>
                        <p className="text-slate-300 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed bg-slate-900/30 p-2.5 rounded-lg border border-slate-900">{contact.message}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewContact(contact)}
                          className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          Baca Detail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* --- MODAL WIDGETS --- */}

      {/* Modal 1: Project Details (Bypass Draft) */}
      {viewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setViewProject(null)}></div>
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-950 border border-slate-900 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 space-y-5">
            <button 
              onClick={() => setViewProject(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded">
                {viewProject.category}
              </span>
              <h3 className="font-display font-bold text-lg text-white mt-2 leading-tight">{viewProject.title}</h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">
                Karya {viewProject.studentName} | Kampus: {viewProject.university}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Deskripsi Proyek:</p>
              <div className="p-3.5 bg-slate-900/40 border border-slate-900 rounded-xl text-slate-300 text-xs leading-relaxed max-h-[150px] overflow-y-auto whitespace-pre-line">
                {viewProject.description}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900/60 border border-slate-900 rounded-xl space-y-1">
                <p className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Tautan Demo</p>
                {viewProject.demoUrl ? (
                  <a href={viewProject.demoUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline block truncate mt-0.5">
                    {viewProject.demoUrl}
                  </a>
                ) : (
                  <span className="text-slate-500 mt-0.5 block">Tidak tersedia</span>
                )}
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-900 rounded-xl space-y-1">
                <p className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Tautan Repositori</p>
                <a href={viewProject.sourceCodeUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline block truncate mt-0.5">
                  {viewProject.sourceCodeUrl}
                </a>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-900 text-xs font-mono">
              <span className="text-slate-450 font-sans">Harga Lisensi:</span>
              <span className="font-bold text-white text-sm">{formatPrice(viewProject.price)}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setViewProject(null)}
                className="w-1/3 py-2.5 rounded-xl border border-slate-850 text-slate-400 hover:text-white bg-slate-900/30 text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
              
              {viewProject.status === "DRAFT" ? (
                <button
                  onClick={() => handlePublishProject(viewProject.id)}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg text-white text-xs font-semibold cursor-pointer"
                >
                  Setujui & Publikasikan Proyek
                </button>
              ) : (
                <button
                  onClick={() => handleDraftProject(viewProject.id)}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:shadow-lg text-slate-950 text-xs font-semibold cursor-pointer"
                >
                  Tarik Menjadi DRAFT
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: View Order Transfer Receipt */}
      {viewOrderReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setViewOrderReceipt(null)}></div>
          <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-slate-900 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 space-y-5 text-center">
            <button 
              onClick={() => setViewOrderReceipt(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="font-display font-semibold text-lg text-white">Bukti Transfer Pembayaran Pembeli</h3>
              <p className="text-[10px] text-slate-500 font-mono">Kode Order: {viewOrderReceipt.orderCode}</p>
            </div>

            {/* Receipt Image Box */}
            <div className="aspect-[3/4] max-w-[250px] mx-auto rounded-xl border border-slate-900 bg-slate-900/60 flex flex-col justify-center items-center p-6 space-y-4">
              <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400">
                <CheckSquare className="h-8 w-8 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-mono font-bold text-white">SIMULASI RESI SUKSES</p>
                <p className="text-[10px] text-slate-400">Transfer Dana Terdeteksi</p>
                <p className="text-xs font-mono font-bold text-emerald-400 pt-1">{formatPrice(viewOrderReceipt.totalPrice)}</p>
              </div>
              <p className="text-[9px] text-slate-550 leading-relaxed">Dana aman terproteksi di Rekening Bersama resmi StudentHub.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setViewOrderReceipt(null)}
                className="w-full py-2.5 rounded-xl border border-slate-850 text-slate-400 hover:text-white bg-slate-900/30 text-xs font-semibold cursor-pointer"
              >
                Tutup Resi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Verify Payment Proof (PATCH /payment/verify/:id) */}
      {verifyOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setVerifyOrder(null)}></div>
          <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-slate-900 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 space-y-5">
            <button 
              onClick={() => setVerifyOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <h3 className="font-display font-semibold text-lg text-white">Verifikasi Pembayaran Transfer</h3>
              <p className="text-slate-550 text-[10px] font-mono mt-1">Kode Order: {verifyOrder.orderCode}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-900 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-450 font-sans">Jumlah Tagihan:</span>
              <span className="font-bold text-white">{formatPrice(verifyOrder.totalPrice)}</span>
            </div>

            {/* Admin Note textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Catatan Verifikasi Admin (adminNote):</label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Tulis alasan jika menolak, atau catatan terima kasih jika disetujui..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-850 focus:border-violet-500 text-xs text-slate-200 focus:outline-none"
              ></textarea>
            </div>

            {/* APPROVED / REJECTED actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleVerifyOrderPayment("REJECTED")}
                className="w-1/3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-400 text-xs font-semibold transition-colors cursor-pointer"
              >
                TOLAK (REJECT)
              </button>
              
              <button
                onClick={() => handleVerifyOrderPayment("APPROVED")}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg text-white text-xs font-semibold cursor-pointer"
              >
                SETUJUI (APPROVE LUNAS)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: View Message Detail */}
      {viewContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setViewContact(null)}></div>
          <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-slate-900 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 space-y-5">
            <button 
              onClick={() => setViewContact(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="font-display font-semibold text-lg text-white">Detail Pesan Kontak Masuk</h3>
              <p className="text-slate-500 text-[10px] font-mono mt-1">{viewContact.createdAt}</p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/60 border border-slate-900 rounded-xl">
                <div>
                  <p className="text-slate-550 uppercase text-[9px] font-bold">Nama Pengirim</p>
                  <p className="font-semibold text-white mt-0.5">{viewContact.name}</p>
                </div>
                <div>
                  <p className="text-slate-550 uppercase text-[9px] font-bold">Alamat Email</p>
                  <p className="font-semibold text-white mt-0.5 truncate">{viewContact.email}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-slate-550 uppercase text-[9px] font-bold">Isi Pesan Detail:</p>
                <div className="p-3.5 bg-slate-950 border border-slate-900 text-slate-350 leading-relaxed rounded-xl max-h-[200px] overflow-y-auto whitespace-pre-line">
                  {viewContact.message}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  handleReadContact(viewContact.id);
                  setViewContact(null);
                  showToast("Pesan kontak ditandai sudah dibaca.");
                }}
                className="w-full py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-xs font-semibold cursor-pointer"
              >
                Tandai Sudah Dibaca & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
