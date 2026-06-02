"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Shield, Check, X, Clock, TrendingUp, Coins, Users,
  CheckSquare, Eye, ExternalLink, Image as ImageIcon, Landmark,
  FolderOpen, Plus, Edit, Trash2, Tag as TagIcon, MessageSquare, AlertTriangle, GraduationCap, DollarSign,
  CheckCircle2, XCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import * as api from "@/lib/api";

interface Category {
  id: number | string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
}

interface Tag {
  id: number | string;
  name: string;
}

interface Major {
  id: number | string;
  name: string;
}

interface Batch {
  id: number | string;
  year?: string | number;
  name?: string;
}

interface Student {
  id: number | string;
  name: string;
  nis?: string;
  studentNumber?: string;
  majorId?: number | string;
  batchId?: number | string;
  major?: Major;
  batch?: Batch;
}

interface Project {
  id: number | string;
  title: string;
  description: string;
  price: number;
  status: "DRAFT" | "PUBLISHED" | string;
  category?: Category | string;
  demoUrl?: string;
  sourceCodeUrl?: string;
  students?: Student[];
  studentName?: string;
}

interface Order {
  id: number | string;
  orderCode?: string;
  items?: Array<{ title?: string; project?: { title?: string } }>;
  totalPrice: number;
  status: "PENDING" | "PAID" | "APPROVED" | "REJECTED" | string;
  receiptImage?: string;
}

interface BankAccount {
  id: number | string;
  bankName: string;
  accountNumber: string;
  accountOwner?: string;
  accountName?: string;
  isActive: boolean;
}

interface Contact {
  id: number | string;
  name: string;
  email: string;
  message: string;
  status: "pending" | "read" | string;
  createdAt?: string;
}

const normalizeList = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.projects)) return payload.projects;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"summary" | "moderation" | "orders" | "master-catalog" | "master-academic" | "bank-accounts" | "contacts">("summary");
  const [catalogSubTab, setCatalogSubTab] = useState<"categories" | "tags">("categories");
  const [academicSubTab, setAcademicSubTab] = useState<"majors" | "batches" | "students">("students");

  // Data states — all empty init, filled only by real API
  const [projects, setProjects] = useState<Project[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Loading/error states per resource
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingAcademic, setLoadingAcademic] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Modals
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [viewOrderReceipt, setViewOrderReceipt] = useState<Order | null>(null);
  const [verifyOrder, setVerifyOrder] = useState<Order | null>(null);
  const [viewContact, setViewContact] = useState<Contact | null>(null);

  // Add Project form
  const [showAddProject, setShowAddProject] = useState(false);
  const [prjTitle, setPrjTitle] = useState("");
  const [prjDesc, setPrjDesc] = useState("");
  const [prjCatId, setPrjCatId] = useState("");
  const [prjPrice, setPrjPrice] = useState("");
  const [prjDemo, setPrjDemo] = useState("");
  const [prjSource, setPrjSource] = useState("");
  const [prjStudentId, setPrjStudentId] = useState("");
  const [prjThumbnailFile, setPrjThumbnailFile] = useState<File | null>(null);
  const [isCreatingPrj, setIsCreatingPrj] = useState(false);

  // Catalog CRUD states
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [tagName, setTagName] = useState("");

  // Academic CRUD states
  const [majorName, setMajorName] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentNis, setStudentNis] = useState("");
  const [studentMajorId, setStudentMajorId] = useState("");
  const [studentBatchId, setStudentBatchId] = useState("");

  // Bank CRUD states
  const [bankName, setBankName] = useState("");
  const [bankAccName, setBankAccName] = useState("");
  const [bankAccNo, setBankAccNo] = useState("");

  // Payment verification
  const [adminNote, setAdminNote] = useState("");

  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // Route protection
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) router.push("/login");
      else if (user && user.role !== "ADMIN") router.push("/dashboard/customer");
    }
  }, [isLoading, isAuthenticated, user, router]);

  const token = user?.token || (typeof window !== "undefined" ? localStorage.getItem("studenthub_token") || "" : "");

  // ─── Data Fetchers ────────────────────────────────────────────────

  const loadProjects = useCallback(async () => {
    if (!token) return;
    setLoadingProjects(true);
    try {
      const res = await api.fetchAllProjectsAdmin(token);
      if (res.success) setProjects(normalizeList(res.data));
    } catch (err) { console.error("loadProjects", err); }
    finally { setLoadingProjects(false); }
  }, [token]);

  const loadOrders = useCallback(async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await api.fetchOrders(token);
      if (res.success) setOrders(normalizeList(res.data));
    } catch (err) { console.error("loadOrders", err); }
    finally { setLoadingOrders(false); }
  }, [token]);

  const loadCategories = useCallback(async () => {
    try {
      const res = await api.fetchCategories();
      if (res.success) setCategories(normalizeList(res.data));
    } catch (err) { console.error("loadCategories", err); }
  }, []);

  const loadTags = useCallback(async () => {
    try {
      const res = await api.fetchTags();
      if (res.success) setTags(normalizeList(res.data));
    } catch (err) { console.error("loadTags", err); }
  }, []);

  const loadMajors = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.fetchMajors(token);
      if (res.success) setMajors(normalizeList(res.data));
    } catch (err) { console.error("loadMajors", err); }
  }, [token]);

  const loadBatches = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.fetchBatches(token);
      if (res.success) setBatches(normalizeList(res.data));
    } catch (err) { console.error("loadBatches", err); }
  }, [token]);

  const loadStudents = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.fetchStudents(token);
      if (res.success) setStudents(normalizeList(res.data));
    } catch (err) { console.error("loadStudents", err); }
  }, [token]);

  const loadBankAccounts = useCallback(async () => {
    if (!token) return;
    setLoadingBanks(true);
    try {
      const res = await api.fetchBankAccounts(token);
      if (res.success) setBankAccounts(normalizeList(res.data));
    } catch (err) { console.error("loadBankAccounts", err); }
    finally { setLoadingBanks(false); }
  }, [token]);

  const loadContacts = useCallback(async () => {
    if (!token) return;
    setLoadingContacts(true);
    try {
      const res = await api.fetchContacts(token);
      if (res.success) setContacts(normalizeList(res.data));
    } catch (err) { console.error("loadContacts", err); }
    finally { setLoadingContacts(false); }
  }, [token]);

  // ─── Load data based on active tab ───────────────────────────────

  useEffect(() => {
    if (!user || user.role !== "ADMIN" || !token) return;

    if (activeTab === "summary" || activeTab === "moderation") {
      loadProjects();
      if (activeTab === "summary") loadOrders();
    }
    if (activeTab === "summary") {
      loadOrders();
      loadContacts();
    }
    if (activeTab === "orders") loadOrders();
    if (activeTab === "master-catalog") {
      loadCategories();
      loadTags();
    }
    if (activeTab === "master-academic") {
      loadMajors();
      loadBatches();
      loadStudents();
    }
    if (activeTab === "bank-accounts") loadBankAccounts();
    if (activeTab === "contacts") loadContacts();
  }, [user, activeTab, token]);

  // Pre-load majors/batches when academic sub-tab changes for student form
  useEffect(() => {
    if (activeTab === "master-academic") {
      loadMajors();
      loadBatches();
      if (academicSubTab === "students") loadStudents();
    }
  }, [academicSubTab, activeTab]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-500"></div>
      </div>
    );
  }

  // ─── Derived Metrics ──────────────────────────────────────────────

  const totalRevenue = orders.filter(o => o.status === "APPROVED").reduce((s, o) => s + o.totalPrice, 0);
  const pendingModerationCount = projects.filter(p => p.status === "DRAFT").length;
  const pendingOrdersCount = orders.filter(o => o.status === "PAID").length;
  const publishedProjectsCount = projects.filter(p => p.status === "PUBLISHED").length;

  // ─── Handlers ────────────────────────────────────────────────────

  // Projects
  const handlePublishProject = async (id: any) => {
    try {
      const fd = new FormData();
      fd.append("status", "PUBLISHED");
      const res = await api.updateProject(id, fd, token);
      if (res.success) {
        showToast("Proyek berhasil dipublikasikan!");
        setViewProject(null);
        loadProjects();
      } else {
        showToast(res.message || "Gagal mempublikasikan proyek.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan jaringan.");
    }
  };

  const handleDraftProject = async (id: any) => {
    try {
      const fd = new FormData();
      fd.append("status", "DRAFT");
      const res = await api.updateProject(id, fd, token);
      if (res.success) {
        showToast("Proyek ditarik kembali menjadi DRAFT.");
        setViewProject(null);
        loadProjects();
      } else {
        showToast(res.message || "Gagal menarik proyek.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan jaringan.");
    }
  };

  const handleDeleteProject = async (id: any) => {
    if (!confirm("Apakah Anda yakin ingin menghapus proyek ini?")) return;
    try {
      const res = await api.deleteProject(id, token);
      if (res.success) {
        showToast("Proyek berhasil dihapus.");
        loadProjects();
      } else {
        showToast(res.message || "Gagal menghapus proyek.");
      }
    } catch (err) {
      showToast("Terjadi kesalahan jaringan.");
    }
  };

  const handleAddProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prjTitle || !prjDesc || !prjPrice || !prjSource) {
      showToast("Mohon lengkapi semua bidang wajib.");
      return;
    }
    setIsCreatingPrj(true);
    try {
      const fd = new FormData();
      fd.append("title", prjTitle);
      fd.append("description", prjDesc);
      fd.append("price", prjPrice);
      fd.append("sourceCodeUrl", prjSource);
      if (prjDemo) fd.append("demoUrl", prjDemo);
      if (prjCatId) fd.append("categoryId", prjCatId);
      if (prjStudentId) fd.append("studentIds", prjStudentId);
      if (prjThumbnailFile) fd.append("thumbnail", prjThumbnailFile);

      const res = await api.createProject(fd, token);
      if (res.success) {
        showToast("Proyek baru berhasil didaftarkan sebagai DRAFT!");
        setShowAddProject(false);
        setPrjTitle(""); setPrjDesc(""); setPrjPrice(""); setPrjSource("");
        setPrjDemo(""); setPrjCatId(""); setPrjStudentId(""); setPrjThumbnailFile(null);
        loadProjects();
      } else {
        const msg = Array.isArray(res.message) ? res.message.join(", ") : (res.message || "Gagal membuat proyek.");
        showToast(msg);
      }
    } catch (err) {
      showToast("Terjadi kesalahan jaringan.");
    } finally {
      setIsCreatingPrj(false);
    }
  };

  // Categories
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catSlug) return;
    try {
      const res = await api.createCategory({ name: catName, slug: catSlug }, token);
      if (res.success) {
        showToast("Kategori baru berhasil ditambahkan!");
        setCatName(""); setCatSlug("");
        loadCategories();
      } else {
        showToast(res.message || "Gagal membuat kategori.");
      }
    } catch (err) { showToast("Terjadi kesalahan jaringan."); }
  };

  const handleDeleteCategory = async (id: any) => {
    if (!confirm("Hapus kategori ini?")) return;
    try {
      const res = await api.deleteCategory(id, token);
      if (res.success) { showToast("Kategori dihapus."); loadCategories(); }
      else showToast(res.message || "Gagal menghapus kategori.");
    } catch (err) { showToast("Terjadi kesalahan jaringan."); }
  };

  // Tags
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName) return;
    try {
      const res = await api.createTag({ name: tagName }, token);
      if (res.success) {
        showToast("Tag baru berhasil ditambahkan!");
        setTagName("");
        loadTags();
      } else showToast(res.message || "Gagal membuat tag.");
    } catch (err) { showToast("Terjadi kesalahan jaringan."); }
  };

  const handleDeleteTag = async (id: any) => {
    try {
      const res = await api.deleteTag(id, token);
      if (res.success) { showToast("Tag dihapus."); loadTags(); }
      else showToast(res.message || "Gagal menghapus tag.");
    } catch (err) { showToast("Terjadi kesalahan jaringan."); }
  };

  // Majors
  const handleAddMajor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!majorName) return;
    try {
      const res = await api.createMajor({ name: majorName }, token);
      if (res.success) {
        showToast("Program Studi berhasil terdaftar.");
        setMajorName("");
        loadMajors();
      } else showToast(res.message || "Gagal membuat prodi.");
    } catch (err) { showToast("Terjadi kesalahan jaringan."); }
  };

  const handleDeleteMajor = async (id: any) => {
    try {
      const res = await api.deleteMajor(id, token);
      if (res.success) { showToast("Prodi dihapus."); loadMajors(); }
      else showToast(res.message || "Gagal menghapus prodi.");
    } catch (err) { showToast("Terjadi kesalahan jaringan."); }
  };

  // Batches
  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchYear) return;
    try {
      const res = await api.createBatch({ year: batchYear }, token);
      if (res.success) {
        showToast("Angkatan baru berhasil ditambahkan.");
        setBatchYear("");
        loadBatches();
      } else showToast(res.message || "Gagal membuat angkatan.");
    } catch (err) { showToast("Terjadi kesalahan jaringan."); }
  };

  const handleDeleteBatch = async (id: any) => {
    try {
      const res = await api.deleteBatch(id, token);
      if (res.success) { showToast("Angkatan dihapus."); loadBatches(); }
      else showToast(res.message || "Gagal menghapus angkatan.");
    } catch (err) { showToast("Terjadi kesalahan jaringan."); }
  };

  // Students
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentNis || !studentMajorId || !studentBatchId) {
      showToast("Mohon lengkapi data siswa.");
      return;
    }
    try {
      const res = await api.createStudent({
        nis: studentNis,
        name: studentName,
        majorId: Number(studentMajorId),
        batchId: Number(studentBatchId),
      }, token);
      if (res.success) {
        showToast("Siswa Akademik berhasil didaftarkan!");
        setStudentName(""); setStudentNis(""); setStudentMajorId(""); setStudentBatchId("");
        loadStudents();
      } else {
        const msg = Array.isArray(res.message) ? res.message.join(", ") : (res.message || "Gagal mendaftarkan siswa.");
        showToast(msg);
      }
    } catch (err) { showToast("Terjadi kesalahan jaringan."); }
  };

  const handleDeleteStudent = async (id: any) => {
    try {
      const res = await api.deleteStudent(id, token);
      if (res.success) { showToast("Siswa dihapus."); loadStudents(); }
      else showToast(res.message || "Gagal menghapus siswa.");
    } catch (err) { showToast("Terjadi kesalahan jaringan."); }
  };

  // Bank Accounts
  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName || !bankAccName || !bankAccNo) return;
    try {
      const res = await api.createBankAccount({
        bankName,
        accountNumber: bankAccNo,
        accountOwner: bankAccName,
      }, token);
      if (res.success) {
        showToast("Rekening Bank resmi ditambahkan.");
        setBankName(""); setBankAccName(""); setBankAccNo("");
        loadBankAccounts();
      } else showToast(res.message || "Gagal menambahkan rekening.");
    } catch (err) { showToast("Terjadi kesalahan jaringan."); }
  };

  const handleToggleBankStatus = async (bank: BankAccount) => {
    try {
      const res = await api.updateBankAccount(bank.id, { isActive: !bank.isActive }, token);
      if (res.success) {
        showToast("Status keaktifan rekening diubah.");
        loadBankAccounts();
      } else showToast(res.message || "Gagal mengubah status rekening.");
    } catch (err) { showToast("Terjadi kesalahan jaringan."); }
  };

  const handleDeleteBank = async (id: any) => {
    if (!confirm("Hapus rekening ini?")) return;
    try {
      const res = await api.deleteBankAccount(id, token);
      if (res.success) { showToast("Rekening bank resmi dihapus."); loadBankAccounts(); }
      else showToast(res.message || "Gagal menghapus rekening.");
    } catch (err) { showToast("Terjadi kesalahan jaringan."); }
  };

  // Payment Verification
  const handleVerifyOrderPayment = async (status: "APPROVED" | "REJECTED") => {
    if (!verifyOrder) return;
    try {
      const res = await api.verifyPayment(verifyOrder.id, { status, adminNote }, token);
      if (res.success) {
        showToast(`Pembayaran berhasil diverifikasi. Status: ${status}.`);
        setVerifyOrder(null);
        setAdminNote("");
        loadOrders();
      } else showToast(res.message || "Gagal memverifikasi pembayaran.");
    } catch (err) { showToast("Terjadi kesalahan jaringan."); }
  };

  // Contacts
  const handleReadContact = async (contactId: any) => {
    try {
      const res = await api.updateContact(contactId, { status: "read" }, token);
      if (res.success) {
        showToast("Pesan kontak ditandai sudah dibaca.");
        loadContacts();
      } else showToast(res.message || "Gagal memperbarui status pesan.");
    } catch (err) { showToast("Terjadi kesalahan jaringan."); }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-violet-500/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse-slow"></div>

        {/* Admin Greeting Card */}
        <div className="glass-panel rounded-2xl border border-white/5 p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-violet-400" /> Admin Control Panel
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">{user.name} — {user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="flex-grow md:flex-grow-0 p-3 px-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center min-w-[110px]">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Moderasi</p>
              <p className="text-sm font-bold text-amber-400 font-mono mt-0.5">{pendingModerationCount} DRAFT</p>
            </div>
            <div className="flex-grow md:flex-grow-0 p-3 px-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center min-w-[110px]">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Verifikasi</p>
              <p className="text-sm font-bold text-cyan-400 font-mono mt-0.5">{pendingOrdersCount} PAID</p>
            </div>
            <div className="flex-grow md:flex-grow-0 p-3 px-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center min-w-[110px]">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Revenue</p>
              <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-2">
            {[
              { key: "summary", label: "Ringkasan", icon: <TrendingUp className="h-4 w-4" /> },
              { key: "moderation", label: "Moderasi Proyek", icon: <FolderOpen className="h-4 w-4" />, badge: pendingModerationCount },
              { key: "orders", label: "Verifikasi Order", icon: <Coins className="h-4 w-4" />, badge: pendingOrdersCount },
              { key: "master-catalog", label: "Master Katalog", icon: <TagIcon className="h-4 w-4" /> },
              { key: "master-academic", label: "Data Akademik", icon: <GraduationCap className="h-4 w-4" /> },
              { key: "bank-accounts", label: "Rekening Resmi", icon: <Landmark className="h-4 w-4" /> },
              { key: "contacts", label: "Pesan Kontak", icon: <MessageSquare className="h-4 w-4" />, badge: contacts.filter(c => c.status === "pending").length },
            ].map(({ key, label, icon, badge }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all border text-left cursor-pointer ${
                  activeTab === key
                    ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                    : "bg-slate-950/20 border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/20"
                }`}
              >
                <span className="flex items-center gap-3">{icon} {label}</span>
                {badge != null && badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full">{badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 glass-panel rounded-2xl border border-white/5 p-6 md:p-8 min-h-[50vh]">

            {/* Tab 1: Summary */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Ringkasan Platform</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Overview performa dan status operasional platform StudentHub secara real-time.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Proyek", value: projects.length, color: "text-indigo-400" },
                    { label: "Dipublikasikan", value: publishedProjectsCount, color: "text-emerald-400" },
                    { label: "Total Order", value: orders.length, color: "text-cyan-400" },
                    { label: "Pesan Masuk", value: contacts.length, color: "text-violet-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-xl border border-slate-900 bg-slate-900/20 text-center">
                      <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Revenue (APPROVED)</p>
                  <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{formatPrice(totalRevenue)}</p>
                </div>
              </div>
            )}

            {/* Tab 2: Moderasi Proyek */}
            {activeTab === "moderation" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-white">Moderasi & Manajemen Proyek</h3>
                    <p className="text-slate-400 text-xs sm:text-sm">Tinjau DRAFT, publikasikan, atau hapus proyek dari katalog.</p>
                  </div>
                  <button
                    onClick={() => setShowAddProject(!showAddProject)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Tambah Proyek
                  </button>
                </div>

                {/* Add Project Form */}
                {showAddProject && (
                  <form onSubmit={handleAddProjectSubmit} className="p-5 rounded-xl border border-violet-500/20 bg-violet-500/5 space-y-4">
                    <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Form Tambah Proyek Baru</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block font-semibold">Judul Proyek *</label>
                        <input type="text" required value={prjTitle} onChange={e => setPrjTitle(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                          placeholder="Nama proyek yang deskriptif" />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] text-slate-400 block font-semibold">Deskripsi Proyek *</label>
                        <textarea required rows={3} value={prjDesc} onChange={e => setPrjDesc(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                          placeholder="Deskripsi lengkap proyek..." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Harga (IDR) *</label>
                        <input type="number" required value={prjPrice} onChange={e => setPrjPrice(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                          placeholder="150000" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Kategori</label>
                        <select value={prjCatId} onChange={e => setPrjCatId(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-slate-200 focus:outline-none">
                          <option value="">-- Pilih Kategori --</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name || c.title}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">URL Demo</label>
                        <input type="url" value={prjDemo} onChange={e => setPrjDemo(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                          placeholder="https://demo.project.com" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">URL Source Code *</label>
                        <input type="url" required value={prjSource} onChange={e => setPrjSource(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none"
                          placeholder="https://github.com/..." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Siswa</label>
                        <select value={prjStudentId} onChange={e => setPrjStudentId(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-slate-200 focus:outline-none">
                          <option value="">-- Pilih Siswa --</option>
                          {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.nis || s.studentNumber})</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Thumbnail (File)</label>
                        <input type="file" accept="image/*" onChange={e => setPrjThumbnailFile(e.target.files?.[0] || null)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={isCreatingPrj}
                        className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-xs rounded-lg cursor-pointer disabled:opacity-50">
                        {isCreatingPrj ? "Menyimpan..." : "Simpan Proyek"}
                      </button>
                      <button type="button" onClick={() => setShowAddProject(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-lg cursor-pointer">
                        Batal
                      </button>
                    </div>
                  </form>
                )}

                {/* Projects Table */}
                {loadingProjects ? (
                  <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500 mx-auto" /></div>
                ) : projects.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs sm:text-sm text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                          <th className="py-4">Proyek</th>
                          <th className="py-4">Harga</th>
                          <th className="py-4 text-center">Status</th>
                          <th className="py-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/60">
                        {projects.map(project => (
                          <tr key={project.id} className="hover:bg-slate-900/10 transition-colors">
                            <td className="py-4">
                              <p className="font-semibold text-white text-xs sm:text-sm line-clamp-1 max-w-[200px]">{project.title}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {typeof project.category === "object" ? project.category?.name : project.category}
                              </p>
                            </td>
                            <td className="py-4 font-mono font-bold">{formatPrice(project.price)}</td>
                            <td className="py-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${project.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                                {project.status}
                              </span>
                            </td>
                            <td className="py-4 text-right space-x-1">
                              <button onClick={() => setViewProject(project)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-indigo-400 hover:text-white transition-colors cursor-pointer font-semibold">
                                <Eye className="h-3.5 w-3.5" /> Detail
                              </button>
                              {project.status === "DRAFT" ? (
                                <button onClick={() => handlePublishProject(project.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/25 text-[10px] text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors cursor-pointer font-semibold">
                                  Publish
                                </button>
                              ) : (
                                <button onClick={() => handleDraftProject(project.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-yellow-500/15 border border-yellow-500/25 text-[10px] text-yellow-450 hover:bg-yellow-500 hover:text-slate-950 transition-colors cursor-pointer font-semibold">
                                  Draft
                                </button>
                              )}
                              <button onClick={() => handleDeleteProject(project.id)}
                                className="p-1 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors cursor-pointer">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-950/20 rounded-2xl border border-dashed border-slate-900">
                    <FolderOpen className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-medium">Belum ada proyek terdaftar</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Verifikasi Pembayaran */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Antrean Verifikasi Pembayaran</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Periksa data transfer pembeli, setujui/tolak pembayaran (`APPROVED`/`REJECTED`).</p>
                </div>

                {loadingOrders ? (
                  <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500 mx-auto" /></div>
                ) : orders.length > 0 ? (
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
                        {orders.map(order => (
                          <tr key={order.id} className="hover:bg-slate-900/10 transition-colors">
                            <td className="py-4 font-mono font-semibold text-white">{order.orderCode}</td>
                            <td className="py-4">
                              <div className="max-w-[180px] truncate">
                                {Array.isArray(order.items) ? order.items.map((i: any) => i.title || i.project?.title || "").join(", ") : "-"}
                              </div>
                            </td>
                            <td className="py-4 font-mono font-bold">{formatPrice(order.totalPrice)}</td>
                            <td className="py-4 text-center font-mono text-[9px] font-bold">
                              {order.status === "PENDING" && <span className="text-yellow-400">PENDING</span>}
                              {order.status === "PAID" && <span className="text-cyan-400 animate-pulse">PAID (VERIFY)</span>}
                              {order.status === "APPROVED" && <span className="text-emerald-400">APPROVED</span>}
                              {order.status === "REJECTED" && <span className="text-rose-500">REJECTED</span>}
                            </td>
                            <td className="py-4 text-right space-x-1">
                              {order.receiptImage && (
                                <button onClick={() => setViewOrderReceipt(order)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-indigo-400 hover:text-white transition-colors cursor-pointer font-semibold">
                                  <ImageIcon className="h-3.5 w-3.5" /> Bukti Bayar
                                </button>
                              )}
                              {order.status === "PAID" && (
                                <button onClick={() => { setVerifyOrder(order); setAdminNote(""); }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-violet-500 hover:bg-violet-600 text-white transition-all cursor-pointer text-[10px] font-semibold">
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

            {/* Tab 4: Master Katalog */}
            {activeTab === "master-catalog" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Master Data Katalog</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Kelola master data Kategori dan Tags pendukung proyek secara penuh.</p>
                </div>

                <div className="flex gap-2 border-b border-slate-900 pb-3">
                  {(["categories", "tags"] as const).map(sub => (
                    <button key={sub} onClick={() => setCatalogSubTab(sub)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${catalogSubTab === sub ? "bg-violet-500/10 border border-violet-500/30 text-violet-400" : "text-slate-400 hover:text-white"}`}>
                      {sub === "categories" ? "Kategori Katalog" : "Katalog Tags"}
                    </button>
                  ))}
                </div>

                {catalogSubTab === "categories" && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddCategory} className="p-4 rounded-xl border border-slate-900 bg-slate-950 space-y-4 max-w-lg">
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Tambah Kategori Baru</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-semibold">Nama Kategori *</label>
                          <input type="text" required value={catName} onChange={e => setCatName(e.target.value)}
                            placeholder="Contoh: Web Development"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-semibold">Slug *</label>
                          <input type="text" required value={catSlug} onChange={e => setCatSlug(e.target.value)}
                            placeholder="web-development"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none" />
                        </div>
                      </div>
                      <button type="submit" className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-xs rounded-lg cursor-pointer">
                        Tambah Kategori
                      </button>
                    </form>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categories.map(cat => (
                        <div key={cat.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/20 flex justify-between items-start">
                          <div className="space-y-1">
                            <span className="font-bold text-white text-sm">{cat.name || cat.title}</span>
                            <p className="text-[10px] text-slate-500 font-mono">slug: {cat.slug}</p>
                            {cat.description && <p className="text-slate-400 text-xs line-clamp-2 mt-1">{cat.description}</p>}
                          </div>
                          <button onClick={() => handleDeleteCategory(cat.id)}
                            className="text-slate-500 hover:text-red-400 cursor-pointer p-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {catalogSubTab === "tags" && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddTag} className="p-4 rounded-xl border border-slate-900 bg-slate-950 space-y-4 max-w-sm">
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Tambah Tag Baru</h4>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Nama Tag *</label>
                        <input type="text" required value={tagName} onChange={e => setTagName(e.target.value)}
                          placeholder="Contoh: Laravel, React Native"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none" />
                      </div>
                      <button type="submit" className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-xs rounded-lg cursor-pointer">
                        Tambah Tag
                      </button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <div key={tag.id} className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-slate-900 border border-slate-850 text-xs font-semibold text-slate-350">
                          <span>{tag.name}</span>
                          <button onClick={() => handleDeleteTag(tag.id)}
                            className="p-0.5 rounded-full hover:bg-red-500/10 text-slate-500 hover:text-red-400 cursor-pointer">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Data Akademik */}
            {activeTab === "master-academic" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Data Siswa & Akademik</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Kelola master Jurusan (Majors), Angkatan (Batches), dan pendaftaran Siswa (Students).</p>
                </div>

                <div className="flex gap-2 border-b border-slate-900 pb-3">
                  {(["students", "majors", "batches"] as const).map(sub => (
                    <button key={sub} onClick={() => setAcademicSubTab(sub)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${academicSubTab === sub ? "bg-violet-500/10 border border-violet-500/30 text-violet-400" : "text-slate-400 hover:text-white"}`}>
                      {sub === "students" ? "Daftar Siswa" : sub === "majors" ? "Program Studi" : "Daftar Angkatan"}
                    </button>
                  ))}
                </div>

                {academicSubTab === "majors" && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddMajor} className="p-4 rounded-xl border border-slate-900 bg-slate-950 space-y-4 max-w-sm">
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Tambah Program Studi</h4>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Nama Program Studi *</label>
                        <input type="text" required value={majorName} onChange={e => setMajorName(e.target.value)}
                          placeholder="Teknik Informatika"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none" />
                      </div>
                      <button type="submit" className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-xs rounded-lg cursor-pointer">
                        Tambah Prodi
                      </button>
                    </form>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {majors.map(m => (
                        <div key={m.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 flex justify-between items-center">
                          <span className="font-bold text-white text-sm">{m.name}</span>
                          <button onClick={() => handleDeleteMajor(m.id)} className="text-slate-500 hover:text-red-400 cursor-pointer">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {academicSubTab === "batches" && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddBatch} className="p-4 rounded-xl border border-slate-900 bg-slate-950 space-y-4 max-w-xs">
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Tambah Angkatan</h4>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 block font-semibold">Tahun Angkatan *</label>
                        <input type="number" required value={batchYear} onChange={e => setBatchYear(e.target.value)}
                          placeholder="2024"
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none" />
                      </div>
                      <button type="submit" className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-xs rounded-lg cursor-pointer">
                        Tambah Angkatan
                      </button>
                    </form>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {batches.map(b => (
                        <div key={b.id} className="p-3 rounded-xl border border-slate-900 bg-slate-900/10 flex justify-between items-center">
                          <span className="font-bold text-white text-sm">{b.year || b.name}</span>
                          <button onClick={() => handleDeleteBatch(b.id)} className="text-slate-500 hover:text-red-400 cursor-pointer">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {academicSubTab === "students" && (
                  <div className="space-y-6">
                    <form onSubmit={handleAddStudent} className="p-5 rounded-xl border border-slate-900 bg-slate-950 space-y-4">
                      <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Mendaftarkan Siswa Akademik Baru</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-semibold">Nama Siswa *</label>
                          <input type="text" required value={studentName} onChange={e => setStudentName(e.target.value)}
                            placeholder="Nama Lengkap Siswa"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-semibold">NIS / Nomor Induk Siswa *</label>
                          <input type="text" required value={studentNis} onChange={e => setStudentNis(e.target.value)}
                            placeholder="13522089"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-semibold">Program Studi *</label>
                          <select value={studentMajorId} onChange={e => setStudentMajorId(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-slate-200 focus:outline-none">
                            <option value="">-- Pilih Prodi --</option>
                            {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 block font-semibold">Tahun Angkatan *</label>
                          <select value={studentBatchId} onChange={e => setStudentBatchId(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-slate-200 focus:outline-none">
                            <option value="">-- Pilih Angkatan --</option>
                            {batches.map(b => <option key={b.id} value={b.id}>{b.year || b.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-xs rounded-lg cursor-pointer">
                        Daftarkan Siswa
                      </button>
                    </form>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {students.map(student => {
                        const major = majors.find(m => m.id === student.majorId) || student.major;
                        const batch = batches.find(b => b.id === student.batchId) || student.batch;
                        return (
                          <div key={student.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 flex justify-between items-center">
                            <div className="space-y-1">
                              <span className="font-bold text-white text-sm">{student.name}</span>
                              <p className="text-[10px] font-mono text-slate-500">NIS: {student.nis || student.studentNumber}</p>
                              <p className="text-slate-400 text-xs font-semibold pt-0.5">
                                {major?.name} ({batch?.year || "—"})
                              </p>
                            </div>
                            <button onClick={() => handleDeleteStudent(student.id)}
                              className="text-slate-500 hover:text-red-400 cursor-pointer p-1">
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

            {/* Tab 6: Rekening Pembayaran */}
            {activeTab === "bank-accounts" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Kelola Rekening Pembayaran Resmi</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Tambahkan, edit, aktifkan/nonaktifkan rekening resmi untuk tujuan transfer pesanan pembeli.</p>
                </div>

                <form onSubmit={handleAddBank} className="p-4 rounded-xl border border-slate-900 bg-slate-950 space-y-4 max-w-md">
                  <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Tambah Rekening Baru</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] text-slate-400 block font-semibold">Nama Bank *</label>
                      <input type="text" required value={bankName} onChange={e => setBankName(e.target.value)}
                        placeholder="BCA / Mandiri"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none" />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] text-slate-400 block font-semibold">Nomor Rekening *</label>
                      <input type="text" required value={bankAccNo} onChange={e => setBankAccNo(e.target.value)}
                        placeholder="124-001-92384"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-semibold">Nama Pemilik Rekening *</label>
                    <input type="text" required value={bankAccName} onChange={e => setBankAccName(e.target.value)}
                      placeholder="Atas Nama Pemilik Rekening"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-violet-500 text-xs text-white placeholder-slate-650 focus:outline-none" />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-semibold text-xs rounded-lg cursor-pointer">
                    Daftarkan Rekening
                  </button>
                </form>

                {loadingBanks ? (
                  <div className="text-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-violet-500 mx-auto" /></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {bankAccounts.map(bank => (
                      <div key={bank.id} className="p-4 rounded-xl border border-slate-900 bg-slate-900/10 flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{bank.bankName}</span>
                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold ${bank.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                              {bank.isActive ? "AKTIF" : "NONAKTIF"}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-slate-350">{bank.accountNumber}</p>
                          <p className="text-[10px] text-slate-500">A/N: {bank.accountOwner || bank.accountName}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleToggleBankStatus(bank)}
                            className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] hover:text-white transition-colors cursor-pointer">
                            Toggle Status
                          </button>
                          <button onClick={() => handleDeleteBank(bank.id)}
                            className="text-slate-500 hover:text-red-400 cursor-pointer p-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 7: Pesan Kontak */}
            {activeTab === "contacts" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-display font-semibold text-lg text-white">Inquiries / Pesan Kontak Publik</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Tinjau pesan kontak masuk dari pengunjung publik platform StudentHub.</p>
                </div>

                {loadingContacts ? (
                  <div className="text-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-violet-500 mx-auto" /></div>
                ) : contacts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {contacts.map(contact => (
                      <div key={contact.id}
                        className={`p-4 rounded-xl border transition-colors flex justify-between items-start gap-4 ${contact.status === "pending" ? "bg-violet-500/5 border-violet-500/20" : "bg-slate-900/10 border-slate-900"}`}>
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
                        <button onClick={() => setViewContact(contact)}
                          className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
                          Baca Detail
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-slate-950/20 rounded-2xl border border-dashed border-slate-900">
                    <MessageSquare className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm font-medium">Belum ada pesan masuk</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      {/* ── MODALS ─────────────────────────────────────────────── */}

      {/* Modal 1: Project Detail */}
      {viewProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setViewProject(null)}></div>
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-950 border border-slate-900 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 space-y-5">
            <button onClick={() => setViewProject(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 cursor-pointer">
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded">
                {typeof viewProject.category === "object" ? viewProject.category?.name : viewProject.category}
              </span>
              <h3 className="font-display font-bold text-lg text-white mt-2 leading-tight">{viewProject.title}</h3>
              <p className="text-[10px] text-slate-500 font-semibold mt-1">
                {viewProject.students?.map((s: any) => s.name).join(", ") || viewProject.studentName}
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
                  <a href={viewProject.demoUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline block truncate mt-0.5">{viewProject.demoUrl}</a>
                ) : <span className="text-slate-500 mt-0.5 block">Tidak tersedia</span>}
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-900 rounded-xl space-y-1">
                <p className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Source Code</p>
                <a href={viewProject.sourceCodeUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline block truncate mt-0.5">{viewProject.sourceCodeUrl}</a>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-900 text-xs font-mono">
              <span className="text-slate-450 font-sans">Harga Lisensi:</span>
              <span className="font-bold text-white text-sm">{formatPrice(viewProject.price)}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setViewProject(null)}
                className="w-1/3 py-2.5 rounded-xl border border-slate-850 text-slate-400 hover:text-white bg-slate-900/30 text-xs font-semibold cursor-pointer">
                Tutup
              </button>
              {viewProject.status === "DRAFT" ? (
                <button onClick={() => handlePublishProject(viewProject.id)}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg text-white text-xs font-semibold cursor-pointer">
                  Setujui & Publikasikan Proyek
                </button>
              ) : (
                <button onClick={() => handleDraftProject(viewProject.id)}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:shadow-lg text-slate-950 text-xs font-semibold cursor-pointer">
                  Tarik Menjadi DRAFT
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: View Order Receipt */}
      {viewOrderReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setViewOrderReceipt(null)}></div>
          <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-slate-900 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 space-y-5 text-center">
            <button onClick={() => setViewOrderReceipt(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            <div>
              <h3 className="font-display font-semibold text-lg text-white">Bukti Transfer Pembayaran</h3>
              <p className="text-[10px] text-slate-500 font-mono">Kode Order: {viewOrderReceipt.orderCode}</p>
            </div>
            {viewOrderReceipt.receiptImage ? (
              <img src={viewOrderReceipt.receiptImage} alt="Bukti Transfer" className="max-w-full mx-auto rounded-xl border border-slate-800" />
            ) : (
              <div className="py-8 text-slate-500 text-sm">Tidak ada bukti transfer yang diunggah.</div>
            )}
            <button onClick={() => setViewOrderReceipt(null)}
              className="w-full py-2.5 rounded-xl border border-slate-850 text-slate-400 hover:text-white bg-slate-900/30 text-xs font-semibold cursor-pointer">
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal 3: Verify Payment */}
      {verifyOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setVerifyOrder(null)}></div>
          <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-slate-900 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 space-y-5">
            <button onClick={() => setVerifyOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 cursor-pointer">
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
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">Catatan Verifikasi Admin (adminNote):</label>
              <textarea rows={3} value={adminNote} onChange={e => setAdminNote(e.target.value)}
                placeholder="Tulis alasan jika menolak, atau catatan terima kasih jika disetujui..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-850 focus:border-violet-500 text-xs text-slate-200 focus:outline-none">
              </textarea>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleVerifyOrderPayment("REJECTED")}
                className="w-1/3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-white text-red-400 text-xs font-semibold transition-colors cursor-pointer">
                TOLAK (REJECT)
              </button>
              <button onClick={() => handleVerifyOrderPayment("APPROVED")}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg text-white text-xs font-semibold cursor-pointer">
                SETUJUI (APPROVE LUNAS)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: View Contact Detail */}
      {viewContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setViewContact(null)}></div>
          <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-slate-900 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 space-y-5">
            <button onClick={() => setViewContact(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800 cursor-pointer">
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
            <button onClick={() => { handleReadContact(viewContact.id); setViewContact(null); }}
              className="w-full py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-xs font-semibold cursor-pointer">
              Tandai Sudah Dibaca & Tutup
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
