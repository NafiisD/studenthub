const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

function getToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("studenthub_token") || "";
}

function authHeaders(token?: string): HeadersInit {
  const t = token || getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  code?: number;
  status?: string;
}

function isSuccess(res: Response, data: any): boolean {
  return res.ok && (data.success === true || data.status === "success" || (data.code >= 200 && data.code < 300));
}

// ─── Generic Helpers ───────────────────────────────────────────────

async function apiGet<T = any>(path: string, token?: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { ...authHeaders(token) },
    cache: "no-store",
  });
  const data = await res.json();
  return { ...data, success: isSuccess(res, data) };
}

async function apiPost<T = any>(path: string, body: any, token?: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ...data, success: isSuccess(res, data) || res.status === 201 };
}

async function apiPatch<T = any>(path: string, body: any, token?: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ...data, success: isSuccess(res, data) };
}

async function apiDelete<T = any>(path: string, token?: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: { ...authHeaders(token) },
  });
  const data = await res.json();
  return { ...data, success: isSuccess(res, data) };
}

async function apiPostFormData<T = any>(path: string, formData: FormData, token?: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { ...authHeaders(token) },
    body: formData,
  });
  const data = await res.json();
  return { ...data, success: isSuccess(res, data) || res.status === 201 };
}

async function apiPatchFormData<T = any>(path: string, formData: FormData, token?: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: { ...authHeaders(token) },
    body: formData,
  });
  const data = await res.json();
  return { ...data, success: isSuccess(res, data) };
}

// ─── Projects ──────────────────────────────────────────────────────

export async function fetchPublishedProjects(token?: string) {
  return apiGet("/projects/published", token);
}

export async function fetchAllProjects(token?: string) {
  return apiGet("/projects", token);
}

export async function fetchAllProjectsAdmin(token?: string) {
  return apiGet("/projects/all/admin", token);
}

export async function fetchProjectBySlugOrId(slugOrId: string, token?: string) {
  return apiGet(`/projects/${slugOrId}`, token);
}

export async function createProject(formData: FormData, token?: string) {
  return apiPostFormData("/projects", formData, token);
}

export async function updateProject(id: string | number, formData: FormData, token?: string) {
  return apiPatchFormData(`/projects/${id}`, formData, token);
}

export async function updateProjectJson(id: string | number, body: any, token?: string) {
  return apiPatch(`/projects/${id}`, body, token);
}

export async function deleteProject(id: string | number, token?: string) {
  return apiDelete(`/projects/${id}`, token);
}

// ─── Categories ────────────────────────────────────────────────────

export async function fetchCategories() {
  return apiGet("/categories");
}

export async function fetchCategoryById(id: string | number) {
  return apiGet(`/categories/${id}`);
}

export async function createCategory(body: { name: string; slug: string }, token?: string) {
  return apiPost("/categories", body, token);
}

export async function updateCategory(id: string | number, body: any, token?: string) {
  return apiPatch(`/categories/${id}`, body, token);
}

export async function deleteCategory(id: string | number, token?: string) {
  return apiDelete(`/categories/${id}`, token);
}

// ─── Tags ──────────────────────────────────────────────────────────

export async function fetchTags() {
  return apiGet("/tags");
}

export async function createTag(body: { name: string }, token?: string) {
  return apiPost("/tags", body, token);
}

export async function updateTag(id: string | number, body: any, token?: string) {
  return apiPatch(`/tags/${id}`, body, token);
}

export async function deleteTag(id: string | number, token?: string) {
  return apiDelete(`/tags/${id}`, token);
}

// ─── Carts ─────────────────────────────────────────────────────────

export async function fetchMyCart(token?: string) {
  return apiGet(`/carts?_t=${Date.now()}`, token);
}

export async function addCartItem(projectId: number, token?: string, quantity = 1) {
  return apiPost("/carts/items", { projectId, quantity }, token);
}

export async function removeCartItem(projectId: number | string, token?: string) {
  return apiDelete(`/carts/items/${projectId}`, token);
}

export async function clearCart(token?: string) {
  return apiDelete("/carts", token);
}

// ─── Wishlists ─────────────────────────────────────────────────────

export async function fetchMyWishlist(token?: string) {
  return apiGet("/wishlists", token);
}

export async function toggleWishlist(projectId: number | string, token?: string) {
  const res = await fetch(`${API_URL}/wishlists/${projectId}`, {
    method: "POST",
    headers: { ...authHeaders(token) },
  });
  const data = await res.json();
  return { ...data, success: res.ok };
}

export async function checkWishlistStatus(projectId: number | string, token?: string) {
  return apiGet(`/wishlists/check/${projectId}`, token);
}

// ─── Orders ────────────────────────────────────────────────────────

export async function fetchOrders(token?: string) {
  return apiGet("/orders", token);
}

export async function fetchOrderById(id: string | number, token?: string) {
  return apiGet(`/orders/${id}`, token);
}

export async function createOrder(body: { bankAccountId: number; message?: string }, token?: string) {
  return apiPost("/orders", body, token);
}

export async function checkoutCart(body: { bankAccountId: number; message?: string }, token?: string) {
  return apiPost("/orders/checkout", body, token);
}

export async function updateOrder(id: string | number, body: any, token?: string) {
  return apiPatch(`/orders/${id}`, body, token);
}

export async function deleteOrder(id: string | number, token?: string) {
  return apiDelete(`/orders/${id}`, token);
}

// ─── Payments ──────────────────────────────────────────────────────

export async function fetchPaymentProof(orderId: number | string, token?: string) {
  return apiGet(`/payment/proof/${orderId}`, token);
}

export async function fetchBill(orderId: number | string, token?: string) {
  return apiGet(`/payment/bill/${orderId}`, token);
}

export async function uploadPaymentProof(orderId: number | string, file: File, token?: string) {
  const formData = new FormData();
  formData.append("file", file);
  return apiPostFormData(`/payment/upload-proof/${orderId}`, formData, token);
}

export async function verifyPayment(
  id: number | string,
  body: { status: "PENDING" | "APPROVED" | "REJECTED"; adminNote?: string },
  token?: string
) {
  return apiPatch(`/payment/verify/${id}`, body, token);
}

// ─── Ratings ───────────────────────────────────────────────────────

export async function fetchRatingsByProject(projectId: number | string) {
  return apiGet(`/ratings/project/${projectId}`);
}

export async function createRating(
  body: { projectId: number; score: number; comment?: string },
  token?: string
) {
  return apiPost("/ratings", body, token);
}

// ─── Bank Accounts ─────────────────────────────────────────────────

export async function fetchBankAccounts(token?: string) {
  return apiGet("/bank-accounts", token);
}

export async function fetchActiveBankAccounts(token?: string) {
  return apiGet("/bank-accounts/active", token);
}

export async function createBankAccount(
  body: { bankName: string; accountNumber: string; accountOwner: string },
  token?: string
) {
  return apiPost("/bank-accounts", body, token);
}

export async function updateBankAccount(id: string | number, body: any, token?: string) {
  return apiPatch(`/bank-accounts/${id}`, body, token);
}

export async function deleteBankAccount(id: string | number, token?: string) {
  return apiDelete(`/bank-accounts/${id}`, token);
}

// ─── Students ──────────────────────────────────────────────────────

export async function fetchStudents(token?: string) {
  return apiGet("/students", token);
}

export async function createStudent(
  body: { nis: string; name: string; majorId: number; batchId: number },
  token?: string
) {
  return apiPost("/students", body, token);
}

export async function updateStudent(id: string | number, body: any, token?: string) {
  return apiPatch(`/students/${id}`, body, token);
}

export async function deleteStudent(id: string | number, token?: string) {
  return apiDelete(`/students/${id}`, token);
}

// ─── Majors ────────────────────────────────────────────────────────

export async function fetchMajors(token?: string) {
  return apiGet("/majors", token);
}

export async function createMajor(body: { name: string }, token?: string) {
  return apiPost("/majors", body, token);
}

export async function updateMajor(id: string | number, body: any, token?: string) {
  return apiPatch(`/majors/${id}`, body, token);
}

export async function deleteMajor(id: string | number, token?: string) {
  return apiDelete(`/majors/${id}`, token);
}

// ─── Batches ───────────────────────────────────────────────────────

export async function fetchBatches(token?: string) {
  return apiGet("/batches", token);
}

export async function createBatch(body: { year: string }, token?: string) {
  return apiPost("/batches", body, token);
}

export async function updateBatch(id: string | number, body: any, token?: string) {
  return apiPatch(`/batches/${id}`, body, token);
}

export async function deleteBatch(id: string | number, token?: string) {
  return apiDelete(`/batches/${id}`, token);
}

// ─── Contacts ──────────────────────────────────────────────────────

export async function createContact(body: { name: string; email: string; phone?: string; message: string }) {
  return apiPost("/contacts", body);
}

export async function fetchContacts(token?: string) {
  return apiGet("/contacts", token);
}

export async function fetchContactById(id: string | number, token?: string) {
  return apiGet(`/contacts/${id}`, token);
}

export async function updateContact(id: string | number, body: any, token?: string) {
  return apiPatch(`/contacts/${id}`, body, token);
}

export async function deleteContact(id: string | number, token?: string) {
  return apiDelete(`/contacts/${id}`, token);
}

// ─── Users ─────────────────────────────────────────────────────────

export async function fetchAllUsers(token?: string) {
  return apiGet("/users", token);
}

export async function fetchUserById(id: string | number, token?: string) {
  return apiGet(`/users/${id}`, token);
}

export async function updateUser(id: string | number, body: any, token?: string) {
  return apiPatch(`/users/${id}`, body, token);
}

export async function deleteUser(id: string | number, token?: string) {
  return apiDelete(`/users/${id}`, token);
}
