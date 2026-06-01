// 1. Types & Interfaces

export interface Category {
  id: string;
  title: string;
  description: string;
  iconName: string;
  count: string;
  accentColor: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Major {
  id: string;
  name: string;
  code: string;
}

export interface Batch {
  id: string;
  year: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  majorId: string;
  batchId: string;
  studentNumber: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string; // References Category title/ID
  price: number;
  studentName: string;
  university: string;
  studentId?: string; // Optional student link
  demoUrl?: string;
  sourceCodeUrl?: string;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  thumbnail?: string;
  mediaUrls?: string[];
  wishlistCount: number;
  averageRating: number;
}

export interface Wishlist {
  userId: string;
  projectId: string;
}



export interface Rating {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  review: string;
  createdAt: string;
}

export interface Cart {
  userId: string;
  projectId: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  items: {
    projectId: string;
    title: string;
    price: number;
  }[];
  totalPrice: number;
  status: "PENDING" | "PAID" | "APPROVED" | "REJECTED";
  bankAccountId: string;
  receiptImage?: string;
  adminNote?: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "pending" | "read";
  createdAt: string;
}

// API Simulation Logger Type
export interface ApiLog {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
  headers: Record<string, string>;
  body?: any;
  status: number;
  statusText: string;
  response: any;
  timestamp: string;
}

// 2. Real-Time API logger function
export const logApiCall = (
  method: "GET" | "POST" | "PATCH" | "DELETE",
  url: string,
  headers: Record<string, string>,
  body: any,
  status: number,
  statusText: string,
  response: any
) => {
  if (typeof window !== "undefined") {
    const log: ApiLog = {
      id: Math.random().toString(36).substr(2, 9),
      method,
      url,
      headers,
      body,
      status,
      statusText,
      response,
      timestamp: new Date().toLocaleTimeString(),
    };
    if (!(window as any).studenthub_api_logs) {
      (window as any).studenthub_api_logs = [];
    }
    (window as any).studenthub_api_logs.push(log);
    if ((window as any).studenthub_api_logs.length > 50) {
      (window as any).studenthub_api_logs.shift();
    }
    // Call listeners
    if ((window as any).studenthub_api_listeners) {
      (window as any).studenthub_api_listeners.forEach((listener: any) => {
        try {
          listener(log);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }
};

// 3. Initial Mock Data definitions
export const initialCategories: Category[] = [
  {
    id: "web-dev",
    title: "Web Dev",
    description: "Situs web modern, landing page premium, dashboard, dan aplikasi SaaS.",
    iconName: "Globe",
    count: "1,240+ Project",
    accentColor: "neon-cyan",
  },
  {
    id: "ai-ml",
    title: "AI / ML",
    description: "Model klasifikasi data, integrasi LLM, chatbot, dan analisis prediktif.",
    iconName: "Brain",
    count: "680+ Project",
    accentColor: "neon-violet",
  },
  {
    id: "iot",
    title: "IoT",
    description: "Prototipe hardware pintar, monitoring sensor, dan sistem otomasi.",
    iconName: "Cpu",
    count: "410+ Project",
    accentColor: "neon-indigo",
  },
  {
    id: "mobile-dev",
    title: "Mobile Dev",
    description: "Aplikasi Android & iOS native, hybrid dengan Flutter, atau React Native.",
    iconName: "Smartphone",
    count: "590+ Project",
    accentColor: "fuchsia-500",
  },
];

export const initialTags: Tag[] = [
  { id: "react", name: "React" },
  { id: "nextjs", name: "Next.js" },
  { id: "python", name: "Python" },
  { id: "esp32", name: "ESP32" },
  { id: "flutter", name: "Flutter" },
];

export const initialMajors: Major[] = [
  { id: "if", name: "Teknik Informatika", code: "TIF" },
  { id: "si", name: "Sistem Informasi", code: "SI" },
  { id: "te", name: "Teknik Elektro", code: "TE" },
];

export const initialBatches: Batch[] = [
  { id: "b2022", year: "2022", name: "Angkatan 2022" },
  { id: "b2023", year: "2023", name: "Angkatan 2023" },
  { id: "b2024", year: "2024", name: "Angkatan 2024" },
];

export const initialStudents: Student[] = [
  { id: "std-001", name: "Aditya Pratama", email: "aditya@student.id", majorId: "te", batchId: "b2022", studentNumber: "10222045" },
  { id: "std-002", name: "Rian Hidayat", email: "rian@student.id", majorId: "if", batchId: "b2022", studentNumber: "13522089" },
  { id: "std-003", name: "Dian Safitri", email: "dian@student.id", majorId: "if", batchId: "b2023", studentNumber: "13523102" },
  { id: "std-004", name: "Naufal Al-Faris", email: "naufal@student.id", majorId: "si", batchId: "b2022", studentNumber: "12022012" },
  { id: "std-005", name: "Fajar Nugraha", email: "fajar@student.id", majorId: "if", batchId: "b2024", studentNumber: "13524001" },
];

export const initialProjects: Project[] = [
  {
    id: "prj-001",
    title: "Smart Agriculture System (IoT)",
    description: "Sistem otomasi penyiraman dan pemupukan tanaman berbasis mikrokontroler ESP32 dengan pemantauan realtime via dashboard sensor MQTT.",
    category: "IoT",
    price: 1850000,
    studentName: "Aditya Pratama",
    university: "Institut Teknologi Bandung",
    studentId: "std-001",
    demoUrl: "https://demo-iot.studenthub.id",
    sourceCodeUrl: "https://github.com/example/smart-agri-iot",
    status: "PUBLISHED",
    createdAt: "2026-05-15",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60",
    mediaUrls: ["https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60"],
    wishlistCount: 12,
    averageRating: 4.8,
  },
  {
    id: "prj-002",
    title: "SaaS Dashboard Analitik Penjualan",
    description: "Dashboard premium berbasis Next.js App Router dan Tailwind v4 dengan integrasi grafik Chart.js, ekspor PDF/Excel, dan visualisasi interaktif.",
    category: "Web Dev",
    price: 1200000,
    studentName: "Rian Hidayat",
    university: "Universitas Indonesia",
    studentId: "std-002",
    demoUrl: "https://saas-dashboard.studenthub.id",
    sourceCodeUrl: "https://github.com/example/saas-dashboard-next",
    status: "PUBLISHED",
    createdAt: "2026-05-18",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60",
    mediaUrls: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60"],
    wishlistCount: 24,
    averageRating: 4.9,
  },
  {
    id: "prj-003",
    title: "Deteksi Kanker Kulit AI (ResNet50)",
    description: "Aplikasi klasifikasi jenis kanker kulit berdasarkan gambar klinis menggunakan arsitektur deep learning ResNet50. Akurasi mencapai 94.2%.",
    category: "AI / ML",
    price: 3200000,
    studentName: "Dian Safitri",
    university: "Universitas Gadjah Mada",
    studentId: "std-003",
    demoUrl: "https://skin-cancer-ai.studenthub.id",
    sourceCodeUrl: "https://github.com/example/skin-ai-resnet",
    status: "PUBLISHED",
    createdAt: "2026-05-20",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60",
    mediaUrls: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60"],
    wishlistCount: 8,
    averageRating: 4.5,
  },
  {
    id: "prj-004",
    title: "Aplikasi Manajemen Laundry (Flutter)",
    description: "Aplikasi mobile hybrid multiplatform (Android & iOS) dengan Flutter. Menyediakan pencatatan transaksi, notifikasi WhatsApp otomatis, dan multi-outlet.",
    category: "Mobile Dev",
    price: 1500000,
    studentName: "Naufal Al-Faris",
    university: "Institut Teknologi Sepuluh Nopember",
    studentId: "std-004",
    demoUrl: "https://play.google.com/store/example",
    sourceCodeUrl: "https://github.com/example/laundry-flutter-app",
    status: "PUBLISHED",
    createdAt: "2026-05-22",
    thumbnail: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=60",
    mediaUrls: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=60"],
    wishlistCount: 19,
    averageRating: 4.7,
  },
  {
    id: "prj-005",
    title: "E-Commerce Craft & Souvenir Lokal",
    description: "Website e-commerce untuk pengrajin souvenir lokal dengan sistem pembayaran Midtrans dan perhitungan ongkir otomatis RajaOngkir.",
    category: "Web Dev",
    price: 950000,
    studentName: "Fajar Nugraha",
    university: "Universitas Padjadjaran",
    studentId: "std-005",
    demoUrl: "https://craft-souvenir.studenthub.id",
    sourceCodeUrl: "https://github.com/example/souvenir-ecommerce",
    status: "DRAFT",
    createdAt: "2026-05-28",
    thumbnail: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=60",
    mediaUrls: ["https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=60"],
    wishlistCount: 0,
    averageRating: 0,
  }
];

export const initialBankAccounts: BankAccount[] = [
  { id: "bank-1", bankName: "BCA", accountName: "Rekber StudentHub", accountNumber: "124-001-92384", isActive: true },
  { id: "bank-2", bankName: "Mandiri", accountName: "Rekber StudentHub", accountNumber: "902-883-91829", isActive: true },
  { id: "bank-3", bankName: "GoPay E-Wallet", accountName: "StudentHub Admin", accountNumber: "0812-3456-7890", isActive: true },
];

export const initialRatings: Rating[] = [
  { id: "rat-1", projectId: "prj-002", userId: "usr-stud", userName: "Budi Santoso", rating: 5, review: "Kodenya sangat rapi dan mudah sekali dikonfigurasi. Penjelasannya lengkap!", createdAt: "2026-05-25" }
];

export const initialContacts: Contact[] = [
  { id: "con-1", name: "Ahmad Zaki", email: "zaki@gmail.com", message: "Halo, saya tertarik untuk membeli project IoT dalam jumlah massal untuk institusi saya. Bagaimana mekanismenya?", status: "pending", createdAt: "2026-05-27" }
];

// 4. LocalStorage Helper Functions
const getLocalStorageData = <T>(key: string, initialData: T): T => {
  if (typeof window === "undefined") return initialData;
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
  }
  try {
    return JSON.parse(data) as T;
  } catch (e) {
    return initialData;
  }
};

const saveLocalStorageData = <T>(key: string, data: T): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// --- DATA ACCESS ACCESSORS (MOCK REPLICATED APIS) ---

// 1. Categories
export const getCategories = (authToken?: string): Category[] => {
  const data = getLocalStorageData<Category[]>("studenthub_categories", initialCategories);
  logApiCall("GET", "/categories", authToken ? { Authorization: `Bearer ${authToken}` } : {}, null, 200, "OK", data);
  return data;
};

export const saveCategory = (cat: Omit<Category, "id" | "count">, authToken: string): Category => {
  const categories = getCategories(authToken);
  const newCat: Category = {
    ...cat,
    id: `cat-${Math.random().toString(36).substr(2, 9)}`,
    count: "0 Project",
  };
  categories.push(newCat);
  saveLocalStorageData("studenthub_categories", categories);
  logApiCall("POST", "/categories", { Authorization: `Bearer ${authToken}` }, cat, 201, "Created", newCat);
  return newCat;
};

export const updateCategory = (id: string, updatedFields: Partial<Category>, authToken: string): Category | null => {
  const categories = getCategories(authToken);
  const idx = categories.findIndex((c) => c.id === id);
  if (idx !== -1) {
    categories[idx] = { ...categories[idx], ...updatedFields };
    saveLocalStorageData("studenthub_categories", categories);
    logApiCall("PATCH", `/categories/${id}`, { Authorization: `Bearer ${authToken}` }, updatedFields, 200, "OK", categories[idx]);
    return categories[idx];
  }
  logApiCall("PATCH", `/categories/${id}`, { Authorization: `Bearer ${authToken}` }, updatedFields, 404, "Not Found", null);
  return null;
};

export const deleteCategory = (id: string, authToken: string): boolean => {
  const categories = getCategories(authToken);
  const filtered = categories.filter((c) => c.id !== id);
  saveLocalStorageData("studenthub_categories", filtered);
  logApiCall("DELETE", `/categories/${id}`, { Authorization: `Bearer ${authToken}` }, null, 200, "OK", { success: true });
  return true;
};

// 2. Tags
export const getTags = (authToken?: string): Tag[] => {
  const data = getLocalStorageData<Tag[]>("studenthub_tags", initialTags);
  logApiCall("GET", "/tags", authToken ? { Authorization: `Bearer ${authToken}` } : {}, null, 200, "OK", data);
  return data;
};

export const saveTag = (tag: Omit<Tag, "id">, authToken: string): Tag => {
  const tags = getTags(authToken);
  const newTag: Tag = {
    ...tag,
    id: `tag-${Math.random().toString(36).substr(2, 9)}`,
  };
  tags.push(newTag);
  saveLocalStorageData("studenthub_tags", tags);
  logApiCall("POST", "/tags", { Authorization: `Bearer ${authToken}` }, tag, 201, "Created", newTag);
  return newTag;
};

export const updateTag = (id: string, name: string, authToken: string): Tag | null => {
  const tags = getTags(authToken);
  const idx = tags.findIndex((t) => t.id === id);
  if (idx !== -1) {
    tags[idx].name = name;
    saveLocalStorageData("studenthub_tags", tags);
    logApiCall("PATCH", `/tags/${id}`, { Authorization: `Bearer ${authToken}` }, { name }, 200, "OK", tags[idx]);
    return tags[idx];
  }
  logApiCall("PATCH", `/tags/${id}`, { Authorization: `Bearer ${authToken}` }, { name }, 404, "Not Found", null);
  return null;
};

export const deleteTag = (id: string, authToken: string): boolean => {
  const tags = getTags(authToken);
  const filtered = tags.filter((t) => t.id !== id);
  saveLocalStorageData("studenthub_tags", filtered);
  logApiCall("DELETE", `/tags/${id}`, { Authorization: `Bearer ${authToken}` }, null, 200, "OK", { success: true });
  return true;
};

// 3. Majors, Batches, Students
export const getMajors = (authToken: string): Major[] => {
  const data = getLocalStorageData<Major[]>("studenthub_majors", initialMajors);
  logApiCall("GET", "/majors", { Authorization: `Bearer ${authToken}` }, null, 200, "OK", data);
  return data;
};

export const saveMajor = (major: Omit<Major, "id">, authToken: string): Major => {
  const majors = getLocalStorageData<Major[]>("studenthub_majors", initialMajors);
  const newMajor = { ...major, id: `maj-${Math.random().toString(36).substr(2, 9)}` };
  majors.push(newMajor);
  saveLocalStorageData("studenthub_majors", majors);
  logApiCall("POST", "/majors", { Authorization: `Bearer ${authToken}` }, major, 201, "Created", newMajor);
  return newMajor;
};

export const updateMajor = (id: string, fields: Partial<Major>, authToken: string): Major | null => {
  const majors = getLocalStorageData<Major[]>("studenthub_majors", initialMajors);
  const idx = majors.findIndex((m) => m.id === id);
  if (idx !== -1) {
    majors[idx] = { ...majors[idx], ...fields };
    saveLocalStorageData("studenthub_majors", majors);
    logApiCall("PATCH", `/majors/${id}`, { Authorization: `Bearer ${authToken}` }, fields, 200, "OK", majors[idx]);
    return majors[idx];
  }
  return null;
};

export const deleteMajor = (id: string, authToken: string): boolean => {
  const majors = getLocalStorageData<Major[]>("studenthub_majors", initialMajors);
  const filtered = majors.filter((m) => m.id !== id);
  saveLocalStorageData("studenthub_majors", filtered);
  logApiCall("DELETE", `/majors/${id}`, { Authorization: `Bearer ${authToken}` }, null, 200, "OK", { success: true });
  return true;
};

export const getBatches = (authToken: string): Batch[] => {
  const data = getLocalStorageData<Batch[]>("studenthub_batches", initialBatches);
  logApiCall("GET", "/batches", { Authorization: `Bearer ${authToken}` }, null, 200, "OK", data);
  return data;
};

export const saveBatch = (batch: Omit<Batch, "id">, authToken: string): Batch => {
  const batches = getLocalStorageData<Batch[]>("studenthub_batches", initialBatches);
  const newBatch = { ...batch, id: `bat-${Math.random().toString(36).substr(2, 9)}` };
  batches.push(newBatch);
  saveLocalStorageData("studenthub_batches", batches);
  logApiCall("POST", "/batches", { Authorization: `Bearer ${authToken}` }, batch, 201, "Created", newBatch);
  return newBatch;
};

export const updateBatch = (id: string, fields: Partial<Batch>, authToken: string): Batch | null => {
  const batches = getLocalStorageData<Batch[]>("studenthub_batches", initialBatches);
  const idx = batches.findIndex((b) => b.id === id);
  if (idx !== -1) {
    batches[idx] = { ...batches[idx], ...fields };
    saveLocalStorageData("studenthub_batches", batches);
    logApiCall("PATCH", `/batches/${id}`, { Authorization: `Bearer ${authToken}` }, fields, 200, "OK", batches[idx]);
    return batches[idx];
  }
  return null;
};

export const deleteBatch = (id: string, authToken: string): boolean => {
  const batches = getLocalStorageData<Batch[]>("studenthub_batches", initialBatches);
  const filtered = batches.filter((b) => b.id !== id);
  saveLocalStorageData("studenthub_batches", filtered);
  logApiCall("DELETE", `/batches/${id}`, { Authorization: `Bearer ${authToken}` }, null, 200, "OK", { success: true });
  return true;
};

export const getStudents = (authToken: string): Student[] => {
  const data = getLocalStorageData<Student[]>("studenthub_students", initialStudents);
  logApiCall("GET", "/students", { Authorization: `Bearer ${authToken}` }, null, 200, "OK", data);
  return data;
};

export const saveStudent = (student: Omit<Student, "id">, authToken: string): Student => {
  const students = getLocalStorageData<Student[]>("studenthub_students", initialStudents);
  const newStudent = { ...student, id: `std-${Math.random().toString(36).substr(2, 9)}` };
  students.push(newStudent);
  saveLocalStorageData("studenthub_students", students);
  logApiCall("POST", "/students", { Authorization: `Bearer ${authToken}` }, student, 201, "Created", newStudent);
  return newStudent;
};

export const updateStudent = (id: string, fields: Partial<Student>, authToken: string): Student | null => {
  const students = getLocalStorageData<Student[]>("studenthub_students", initialStudents);
  const idx = students.findIndex((s) => s.id === id);
  if (idx !== -1) {
    students[idx] = { ...students[idx], ...fields };
    saveLocalStorageData("studenthub_students", students);
    logApiCall("PATCH", `/students/${id}`, { Authorization: `Bearer ${authToken}` }, fields, 200, "OK", students[idx]);
    return students[idx];
  }
  return null;
};

export const deleteStudent = (id: string, authToken: string): boolean => {
  const students = getLocalStorageData<Student[]>("studenthub_students", initialStudents);
  const filtered = students.filter((s) => s.id !== id);
  saveLocalStorageData("studenthub_students", filtered);
  logApiCall("DELETE", `/students/${id}`, { Authorization: `Bearer ${authToken}` }, null, 200, "OK", { success: true });
  return true;
};

// 4. Projects (Public & Admin Access Control)
export const getProjects = (): Project[] => {
  // Direct access for backward compatibility (defaults to getting only PUBLISHED ones)
  const allProjects = getLocalStorageData<Project[]>("studenthub_projects", initialProjects);
  const published = allProjects.filter((p) => p.status === "PUBLISHED");
  logApiCall("GET", "/projects", {}, null, 200, "OK", published);
  return published;
};

export const getProjectsAllAdmin = (authToken: string): Project[] => {
  const allProjects = getLocalStorageData<Project[]>("studenthub_projects", initialProjects);
  logApiCall("GET", "/projects/all/admin", { Authorization: `Bearer ${authToken}` }, null, 200, "OK", allProjects);
  return allProjects;
};

export const getProjectDetail = (slugOrId: string, authToken?: string, isAdmin: boolean = false): Project | null => {
  const allProjects = getLocalStorageData<Project[]>("studenthub_projects", initialProjects);
  const project = allProjects.find((p) => p.id === slugOrId || p.title.toLowerCase().replace(/ /g, "-") === slugOrId);

  const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  if (!project) {
    logApiCall("GET", `/projects/${slugOrId}`, headers, null, 404, "Not Found", null);
    return null;
  }

  // Check draft bypass for Admin
  if (project.status === "DRAFT" && !isAdmin) {
    logApiCall("GET", `/projects/${slugOrId}`, headers, null, 403, "Forbidden - Project is draft", null);
    return null;
  }

  logApiCall("GET", `/projects/${slugOrId}`, headers, null, 200, "OK", project);
  return project;
};

export const getRoleFromToken = (token?: string): string => {
  if (!token) return "";
  try {
    const cleaned = token.replace("Bearer ", "").trim();
    const payload = JSON.parse(atob(cleaned));
    return (payload.role || "").toUpperCase();
  } catch (e) {
    return "";
  }
};

export const saveProject = (project: Omit<Project, "id" | "status" | "createdAt" | "wishlistCount" | "averageRating">, authToken?: string): Project => {
  const headers: Record<string, string> = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  const role = getRoleFromToken(authToken);

  if (role !== "ADMIN") {
    logApiCall("POST", "/projects", headers, project, 403, "Forbidden - Only ADMIN role can create projects", null);
    throw new Error("Forbidden: Hanya Admin yang diizinkan untuk membuat project baru.");
  }

  const projects = getLocalStorageData<Project[]>("studenthub_projects", initialProjects);
  const newProject: Project = {
    ...project,
    id: `prj-${Math.random().toString(36).substr(2, 9)}`,
    status: "DRAFT", // Automatically DRAFT
    createdAt: new Date().toISOString().split("T")[0],
    wishlistCount: 0,
    averageRating: 0,
  };
  projects.unshift(newProject);
  saveLocalStorageData("studenthub_projects", projects);

  logApiCall("POST", "/projects", headers, project, 201, "Created", newProject);
  return newProject;
};

export const updateProject = (id: string, fields: Partial<Project>, authToken: string): Project | null => {
  const projects = getLocalStorageData<Project[]>("studenthub_projects", initialProjects);
  const idx = projects.findIndex((p) => p.id === id);
  if (idx !== -1) {
    projects[idx] = { ...projects[idx], ...fields };
    saveLocalStorageData("studenthub_projects", projects);
    logApiCall("PATCH", `/projects/${id}`, { Authorization: `Bearer ${authToken}` }, fields, 200, "OK", projects[idx]);
    return projects[idx];
  }
  logApiCall("PATCH", `/projects/${id}`, { Authorization: `Bearer ${authToken}` }, fields, 404, "Not Found", null);
  return null;
};

export const deleteProject = (id: string, authToken: string): boolean => {
  const projects = getLocalStorageData<Project[]>("studenthub_projects", initialProjects);
  const filtered = projects.filter((p) => p.id !== id);
  saveLocalStorageData("studenthub_projects", filtered);
  logApiCall("DELETE", `/projects/${id}`, { Authorization: `Bearer ${authToken}` }, null, 200, "OK", { success: true });
  return true;
};

// Backward compatible helper
export const updateProjectStatus = (id: string, status: "approved" | "rejected" | "DRAFT" | "PUBLISHED"): Project | null => {
  const projects = getLocalStorageData<Project[]>("studenthub_projects", initialProjects);
  const idx = projects.findIndex((p) => p.id === id);
  if (idx !== -1) {
    const finalStatus = (status === "approved" || status === "PUBLISHED") ? "PUBLISHED" : "DRAFT";
    projects[idx].status = finalStatus;
    saveLocalStorageData("studenthub_projects", projects);
    return projects[idx];
  }
  return null;
};

// 5. Wishlists (User Role specific)
export const getWishlists = (userId: string, authToken: string): Project[] => {
  const wishlists = getLocalStorageData<Wishlist[]>("studenthub_wishlists", []);
  const projects = getLocalStorageData<Project[]>("studenthub_projects", initialProjects);

  const myWishItemIds = wishlists.filter((w) => w.userId === userId).map((w) => w.projectId);
  const myWishProjects = projects.filter((p) => myWishItemIds.includes(p.id));

  logApiCall("GET", "/wishlists/my-wishlist", { Authorization: `Bearer ${authToken}` }, null, 200, "OK", myWishProjects);
  return myWishProjects;
};

export const toggleWishlist = (userId: string, projectId: string, authToken: string): { action: "added" | "removed"; count: number } => {
  const wishlists = getLocalStorageData<Wishlist[]>("studenthub_wishlists", []);
  const projects = getLocalStorageData<Project[]>("studenthub_projects", initialProjects);

  const idx = wishlists.findIndex((w) => w.userId === userId && w.projectId === projectId);
  const prjIdx = projects.findIndex((p) => p.id === projectId);

  let action: "added" | "removed" = "added";
  let count = 0;

  if (idx !== -1) {
    wishlists.splice(idx, 1);
    action = "removed";
    if (prjIdx !== -1) {
      projects[prjIdx].wishlistCount = Math.max(0, (projects[prjIdx].wishlistCount || 0) - 1);
      count = projects[prjIdx].wishlistCount;
    }
  } else {
    wishlists.push({ userId, projectId });
    action = "added";
    if (prjIdx !== -1) {
      projects[prjIdx].wishlistCount = (projects[prjIdx].wishlistCount || 0) + 1;
      count = projects[prjIdx].wishlistCount;
    }
  }

  saveLocalStorageData("studenthub_wishlists", wishlists);
  saveLocalStorageData("studenthub_projects", projects);

  logApiCall(
    "POST",
    "/wishlists",
    { Authorization: `Bearer ${authToken}` },
    { projectId },
    200,
    "OK",
    { action, wishlistCount: count }
  );

  return { action, count };
};

// 6. Ratings & Reviews (User Role specific)
export const getRatingsForProject = (projectId: string): Rating[] => {
  const ratings = getLocalStorageData<Rating[]>("studenthub_ratings", initialRatings);
  return ratings.filter((r) => r.projectId === projectId);
};

export const saveRating = (rating: Omit<Rating, "id" | "createdAt">, authToken: string): Rating => {
  const ratings = getLocalStorageData<Rating[]>("studenthub_ratings", initialRatings);
  const projects = getLocalStorageData<Project[]>("studenthub_projects", initialProjects);

  const newRating: Rating = {
    ...rating,
    id: `rat-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString().split("T")[0],
  };
  ratings.push(newRating);
  saveLocalStorageData("studenthub_ratings", ratings);

  // Recalculate averageRating on project
  const prjIdx = projects.findIndex((p) => p.id === rating.projectId);
  if (prjIdx !== -1) {
    const prjRatings = ratings.filter((r) => r.projectId === rating.projectId);
    const sum = prjRatings.reduce((s, r) => s + r.rating, 0);
    const avg = parseFloat((sum / prjRatings.length).toFixed(1));
    projects[prjIdx].averageRating = avg;
    saveLocalStorageData("studenthub_projects", projects);
  }

  logApiCall("POST", "/ratings", { Authorization: `Bearer ${authToken}` }, rating, 201, "Created", newRating);
  return newRating;
};

// 7. Carts (User Role specific)
export const getCarts = (userId: string, authToken: string): Project[] => {
  const carts = getLocalStorageData<Cart[]>("studenthub_carts", []);
  const projects = getLocalStorageData<Project[]>("studenthub_projects", initialProjects);

  const myCartIds = carts.filter((c) => c.userId === userId).map((c) => c.projectId);
  const myCartProjects = projects.filter((p) => myCartIds.includes(p.id));

  logApiCall("GET", "/carts/my-cart", { Authorization: `Bearer ${authToken}` }, null, 200, "OK", myCartProjects);
  return myCartProjects;
};

export const addToCart = (userId: string, projectId: string, authToken: string): Cart | null => {
  const carts = getLocalStorageData<Cart[]>("studenthub_carts", []);
  
  // Check if already in cart
  if (carts.some((c) => c.userId === userId && c.projectId === projectId)) {
    logApiCall("POST", "/carts", { Authorization: `Bearer ${authToken}` }, { projectId }, 400, "Bad Request - Already in cart", null);
    return null;
  }

  const newCartItem = { userId, projectId };
  carts.push(newCartItem);
  saveLocalStorageData("studenthub_carts", carts);

  logApiCall("POST", "/carts", { Authorization: `Bearer ${authToken}` }, { projectId }, 201, "Created", newCartItem);
  return newCartItem;
};

export const removeFromCart = (userId: string, projectId: string, authToken: string): boolean => {
  const carts = getLocalStorageData<Cart[]>("studenthub_carts", []);
  const filtered = carts.filter((c) => !(c.userId === userId && c.projectId === projectId));
  saveLocalStorageData("studenthub_carts", filtered);

  logApiCall("DELETE", `/carts/${projectId}`, { Authorization: `Bearer ${authToken}` }, null, 200, "OK", { success: true });
  return true;
};

// 8. Orders & Payments (User & Admin Access Control)
export const getOrders = (authToken: string): Order[] => {
  const data = getLocalStorageData<Order[]>("studenthub_orders", []);
  logApiCall("GET", "/orders", { Authorization: `Bearer ${authToken}` }, null, 200, "OK", data);
  return data;
};

export const getUserOrders = (userId: string, authToken: string): Order[] => {
  const orders = getLocalStorageData<Order[]>("studenthub_orders", []);
  const userOrders = orders.filter((o) => o.userId === userId);
  return userOrders;
};

export const getOrderBill = (orderId: string, authToken: string): Order | null => {
  const orders = getLocalStorageData<Order[]>("studenthub_orders", []);
  const order = orders.find((o) => o.id === orderId);

  if (order) {
    logApiCall("GET", `/payment/bill/${orderId}`, { Authorization: `Bearer ${authToken}` }, null, 200, "OK", order);
    return order;
  }
  logApiCall("GET", `/payment/bill/${orderId}`, { Authorization: `Bearer ${authToken}` }, null, 404, "Not Found", null);
  return null;
};

export const getOrderProof = (orderId: string, authToken: string): { receiptImage?: string } | null => {
  const orders = getLocalStorageData<Order[]>("studenthub_orders", []);
  const order = orders.find((o) => o.id === orderId);

  if (order) {
    logApiCall("GET", `/payment/proof/${orderId}`, { Authorization: `Bearer ${authToken}` }, null, 200, "OK", { receiptImage: order.receiptImage });
    return { receiptImage: order.receiptImage };
  }
  logApiCall("GET", `/payment/proof/${orderId}`, { Authorization: `Bearer ${authToken}` }, null, 404, "Not Found", null);
  return null;
};

export const uploadPaymentProof = (orderId: string, receiptImage: string, authToken: string): Order | null => {
  const orders = getLocalStorageData<Order[]>("studenthub_orders", []);
  const idx = orders.findIndex((o) => o.id === orderId);

  if (idx !== -1) {
    orders[idx].receiptImage = receiptImage;
    orders[idx].status = "PAID";
    saveLocalStorageData("studenthub_orders", orders);
    logApiCall("POST", `/payment/upload-proof/${orderId}`, { Authorization: `Bearer ${authToken}` }, { receiptImage }, 200, "OK", orders[idx]);
    return orders[idx];
  }
  logApiCall("POST", `/payment/upload-proof/${orderId}`, { Authorization: `Bearer ${authToken}` }, { receiptImage }, 404, "Not Found", null);
  return null;
};

export const checkoutCart = (userId: string, bankAccountId: string, authToken: string): Order | null => {
  const carts = getLocalStorageData<Cart[]>("studenthub_carts", []);
  const projects = getLocalStorageData<Project[]>("studenthub_projects", initialProjects);
  const orders = getLocalStorageData<Order[]>("studenthub_orders", []);

  const myCartIds = carts.filter((c) => c.userId === userId).map((c) => c.projectId);
  const cartItems = projects.filter((p) => myCartIds.includes(p.id));

  if (cartItems.length === 0) {
    logApiCall("POST", "/orders/checkout", { Authorization: `Bearer ${authToken}` }, { bankAccountId }, 400, "Bad Request - Cart empty", null);
    return null;
  }

  const orderItems = cartItems.map((p) => ({
    projectId: p.id,
    title: p.title,
    price: p.price,
  }));

  const totalPrice = orderItems.reduce((sum, item) => sum + item.price, 0);
  const orderCode = `SH-${Math.floor(100000 + Math.random() * 900000)}`;

  const newOrder: Order = {
    id: `ord-${Math.random().toString(36).substr(2, 9)}`,
    orderCode,
    userId,
    items: orderItems,
    totalPrice,
    status: "PENDING",
    bankAccountId,
    createdAt: new Date().toISOString().split("T")[0],
  };

  orders.unshift(newOrder);
  saveLocalStorageData("studenthub_orders", orders);

  // Clear Cart
  const remainingCarts = carts.filter((c) => c.userId !== userId);
  saveLocalStorageData("studenthub_carts", remainingCarts);

  logApiCall("POST", "/orders/checkout", { Authorization: `Bearer ${authToken}` }, { bankAccountId }, 201, "Created", newOrder);
  return newOrder;
};

export const verifyPayment = (id: string, status: "APPROVED" | "REJECTED", adminNote: string, authToken: string): Order | null => {
  const orders = getLocalStorageData<Order[]>("studenthub_orders", []);
  const idx = orders.findIndex((o) => o.id === id);

  if (idx !== -1) {
    orders[idx].status = status;
    orders[idx].adminNote = adminNote;
    saveLocalStorageData("studenthub_orders", orders);
    logApiCall("PATCH", `/payment/verify/${id}`, { Authorization: `Bearer ${authToken}` }, { status, adminNote }, 200, "OK", orders[idx]);
    return orders[idx];
  }
  logApiCall("PATCH", `/payment/verify/${id}`, { Authorization: `Bearer ${authToken}` }, { status, adminNote }, 404, "Not Found", null);
  return null;
};

// Backward compatible helper mapping
export const getTransactions = (): any[] => {
  // Simulates old transactions mapping from Orders
  const orders = getLocalStorageData<Order[]>("studenthub_orders", []);
  return orders.map((o) => ({
    id: o.id,
    projectId: o.items[0]?.projectId || "unknown",
    projectTitle: o.items[0]?.title || "Multi-items Order",
    price: o.totalPrice,
    buyerEmail: "user@studenthub.id", // mockup
    buyerName: "User StudentHub",
    paymentMethod: "Bank Transfer",
    receiptImage: o.receiptImage,
    status: o.status === "APPROVED" ? "verified" : "pending",
    createdAt: o.createdAt,
  }));
};

export const saveTransaction = (tx: any): any => {
  // Simple mapping to create a quick single order
  const orders = getLocalStorageData<Order[]>("studenthub_orders", []);
  const newOrder: Order = {
    id: `ord-${Math.random().toString(36).substr(2, 9)}`,
    orderCode: `SH-${Math.floor(100000 + Math.random() * 900000)}`,
    userId: "usr-stud", // Default mock user
    items: [{
      projectId: tx.projectId,
      title: tx.projectTitle,
      price: tx.price,
    }],
    totalPrice: tx.price,
    status: "PAID",
    bankAccountId: "bank-1",
    receiptImage: tx.receiptImage,
    createdAt: new Date().toISOString().split("T")[0],
  };
  orders.unshift(newOrder);
  saveLocalStorageData("studenthub_orders", orders);
  return tx;
};

export const verifyTransaction = (id: string): any => {
  const orders = getLocalStorageData<Order[]>("studenthub_orders", []);
  const idx = orders.findIndex((o) => o.id === id);
  if (idx !== -1) {
    orders[idx].status = "APPROVED";
    saveLocalStorageData("studenthub_orders", orders);
    return orders[idx];
  }
  return null;
};

// 9. Bank Accounts
export const getBankAccounts = (authToken?: string): BankAccount[] => {
  const data = getLocalStorageData<BankAccount[]>("studenthub_bank_accounts", initialBankAccounts);
  logApiCall("GET", "/bank-accounts", authToken ? { Authorization: `Bearer ${authToken}` } : {}, null, 200, "OK", data);
  return data;
};

export const getActiveBankAccounts = (authToken?: string): BankAccount[] => {
  const data = getBankAccounts(authToken);
  const active = data.filter((b) => b.isActive);
  logApiCall("GET", "/bank-accounts/active", authToken ? { Authorization: `Bearer ${authToken}` } : {}, null, 200, "OK", active);
  return active;
};

export const getBankAccountDetail = (id: string, authToken?: string): BankAccount | null => {
  const data = getBankAccounts(authToken);
  const bank = data.find((b) => b.id === id);
  if (bank) {
    logApiCall("GET", `/bank-accounts/${id}`, authToken ? { Authorization: `Bearer ${authToken}` } : {}, null, 200, "OK", bank);
    return bank;
  }
  logApiCall("GET", `/bank-accounts/${id}`, authToken ? { Authorization: `Bearer ${authToken}` } : {}, null, 404, "Not Found", null);
  return null;
};

export const saveBankAccount = (bank: Omit<BankAccount, "id">, authToken: string): BankAccount => {
  const data = getLocalStorageData<BankAccount[]>("studenthub_bank_accounts", initialBankAccounts);
  const newBank = { ...bank, id: `bank-${Math.random().toString(36).substr(2, 9)}` };
  data.push(newBank);
  saveLocalStorageData("studenthub_bank_accounts", data);
  logApiCall("POST", "/bank-accounts", { Authorization: `Bearer ${authToken}` }, bank, 201, "Created", newBank);
  return newBank;
};

export const updateBankAccount = (id: string, fields: Partial<BankAccount>, authToken: string): BankAccount | null => {
  const data = getLocalStorageData<BankAccount[]>("studenthub_bank_accounts", initialBankAccounts);
  const idx = data.findIndex((b) => b.id === id);
  if (idx !== -1) {
    data[idx] = { ...data[idx], ...fields };
    saveLocalStorageData("studenthub_bank_accounts", data);
    logApiCall("PATCH", `/bank-accounts/${id}`, { Authorization: `Bearer ${authToken}` }, fields, 200, "OK", data[idx]);
    return data[idx];
  }
  return null;
};

export const deleteBankAccount = (id: string, authToken: string): boolean => {
  const data = getLocalStorageData<BankAccount[]>("studenthub_bank_accounts", initialBankAccounts);
  const filtered = data.filter((b) => b.id !== id);
  saveLocalStorageData("studenthub_bank_accounts", filtered);
  logApiCall("DELETE", `/bank-accounts/${id}`, { Authorization: `Bearer ${authToken}` }, null, 200, "OK", { success: true });
  return true;
};

// 10. Contacts / Inquiries
export const getContacts = (authToken: string): Contact[] => {
  const data = getLocalStorageData<Contact[]>("studenthub_contacts", initialContacts);
  logApiCall("GET", "/contacts", { Authorization: `Bearer ${authToken}` }, null, 200, "OK", data);
  return data;
};

export const saveContact = (contact: Omit<Contact, "id" | "status" | "createdAt">): Contact => {
  const data = getLocalStorageData<Contact[]>("studenthub_contacts", initialContacts);
  const newContact: Contact = {
    ...contact,
    id: `con-${Math.random().toString(36).substr(2, 9)}`,
    status: "pending",
    createdAt: new Date().toISOString().split("T")[0],
  };
  data.unshift(newContact);
  saveLocalStorageData("studenthub_contacts", data);
  logApiCall("POST", "/contacts", {}, contact, 201, "Created", newContact);
  return newContact;
};

export const markContactRead = (id: string, authToken: string): Contact | null => {
  const data = getLocalStorageData<Contact[]>("studenthub_contacts", initialContacts);
  const idx = data.findIndex((c) => c.id === id);
  if (idx !== -1) {
    data[idx].status = "read";
    saveLocalStorageData("studenthub_contacts", data);
    return data[idx];
  }
  return null;
};

// 11. Core Landing Page Mock Exports
export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: "Beranda", href: "/" },
  { label: "Marketplace", href: "/marketplace" },
];

export const popularCategories = initialCategories;

export interface Statistic {
  id: string;
  value: string;
  label: string;
}

export const statistics: Statistic[] = [
  { id: "stat-projects", value: "2,500+", label: "Project Tersedia" },
  { id: "stat-transactions", value: "Rp 12M+", label: "Transaksi Bulan Ini" },
  { id: "stat-members", value: "8,500+", label: "Member Aktif" },
  { id: "stat-satisfaction", value: "99%", label: "Kepuasan Klien" },
];

export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: string;
  gradientFrom: string;
  borderColor: string;
}

export const features: Feature[] = [
  {
    id: "feat-marketplace",
    title: "Jual & Beli Project",
    description: "Marketplace eksklusif untuk project mahasiswa berkualitas dengan filter lengkap dan demo interaktif.",
    iconName: "ShoppingBag",
    gradientFrom: "from-cyan-500/10 to-indigo-500/10",
    borderColor: "group-hover:border-cyan-500/30",
  },
  {
    id: "feat-security",
    title: "Transaksi Aman",
    description: "Sistem verifikasi admin yang ketat dengan rekening bersama (rekber) demi proteksi data & dana pengguna.",
    iconName: "ShieldCheck",
    gradientFrom: "from-indigo-500/10 to-violet-500/10",
    borderColor: "group-hover:border-indigo-500/30",
  },
  {
    id: "feat-speed",
    title: "Proses Cepat",
    description: "Dari pencarian, negosiasi, transaksi, hingga deployment kode hanya memakan waktu dalam hitungan hari saja.",
    iconName: "Zap",
    gradientFrom: "from-violet-500/10 to-fuchsia-500/10",
    borderColor: "group-hover:border-violet-500/30",
  },
];
