"use client";

import { useState, useEffect } from "react";
import { Terminal, X, Play, Code, Key, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ApiLog {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
  headers?: Record<string, string>;
  body?: any;
  status: number;
  statusText: string;
  response: any;
  timestamp: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function ApiSandbox() {
  const { user } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "playground">("logs");
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);

  // Playground States
  const [selectedEndpoint, setSelectedEndpoint] = useState("GET /projects");
  const [customToken, setCustomToken] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);
  const [playgroundStatus, setPlaygroundStatus] = useState<number | null>(null);
  const [playgroundStatusText, setPlaygroundStatusText] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  // Sync token from logged in user
  useEffect(() => {
    if (user && user.token) {
      setCustomToken(user.token);
    }
  }, [user]);

  // Load and subscribe to API logs
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentLogs = (window as any).studenthub_api_logs || [];
      setLogs([...currentLogs].reverse());

      const listener = (newLog: ApiLog) => {
        setLogs((prev) => [newLog, ...prev]);
      };

      if (!(window as any).studenthub_api_listeners) {
        (window as any).studenthub_api_listeners = [];
      }
      (window as any).studenthub_api_listeners.push(listener);

      return () => {
        (window as any).studenthub_api_listeners = (window as any).studenthub_api_listeners.filter(
          (l: any) => l !== listener
        );
      };
    }
  }, []);

  const handleClearLogs = () => {
    if (typeof window !== "undefined") {
      (window as any).studenthub_api_logs = [];
      setLogs([]);
      setSelectedLog(null);
    }
  };

  const handleSendPlaygroundRequest = async () => {
    setIsExecuting(true);
    setPlaygroundResponse(null);
    setPlaygroundStatus(null);

    try {
      const [method, path] = selectedEndpoint.split(" ") as ["GET" | "POST" | "PATCH" | "DELETE", string];
      const headers: Record<string, string> = {};
      if (customToken) headers.Authorization = `Bearer ${customToken}`;

      const payload = requestBody ? JSON.parse(requestBody) : null;
      const isJsonBody = payload !== null && method !== "GET" && method !== "DELETE";
      if (isJsonBody) headers["Content-Type"] = "application/json";

      const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: isJsonBody ? JSON.stringify(payload) : undefined,
      });

      const contentType = res.headers.get("content-type") || "";
      const responseData = contentType.includes("application/json") ? await res.json() : await res.text();

      setPlaygroundStatus(res.status);
      setPlaygroundStatusText(res.statusText || (res.ok ? "OK" : "Error"));
      setPlaygroundResponse(responseData);

      // Log this playground request as well
      if (typeof window !== "undefined") {
        const log: ApiLog = {
          id: Math.random().toString(36).substr(2, 9),
          method: method as any,
          url: path,
          headers: headers as any,
          body: payload,
          status: res.status,
          statusText: res.statusText || (res.ok ? "OK" : "Error"),
          response: responseData,
          timestamp: new Date().toLocaleTimeString(),
        };
        setLogs((prev) => [log, ...prev]);
        if (!(window as any).studenthub_api_logs) (window as any).studenthub_api_logs = [];
        (window as any).studenthub_api_logs.push(log);
      }

    } catch (e: any) {
      setPlaygroundStatus(400);
      setPlaygroundStatusText("Bad Request");
      setPlaygroundResponse({ error: "Invalid request payload or network error." });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSelectEndpoint = (endpoint: string) => {
    setSelectedEndpoint(endpoint);
    setPlaygroundResponse(null);
    setPlaygroundStatus(null);
    
    // Auto preset default body
    if (endpoint.includes("POST /wishlists")) {
      setRequestBody("");
    } else if (endpoint.includes("POST /carts/items")) {
      setRequestBody(JSON.stringify({ projectId: 1, quantity: 1 }, null, 2));
    } else if (endpoint.includes("POST /orders/checkout")) {
      setRequestBody(JSON.stringify({ bankAccountId: 1, message: "Checkout order" }, null, 2));
    } else if (endpoint.includes("POST /ratings")) {
      setRequestBody(JSON.stringify({ projectId: 1, score: 5, comment: "Proyek luar biasa!" }, null, 2));
    } else if (endpoint.includes("POST /contacts")) {
      setRequestBody(JSON.stringify({ name: "Budi", email: "budi@gmail.com", phone: "08123456789", message: "Tanya bisnis" }, null, 2));
    } else if (endpoint.includes("POST /categories")) {
      setRequestBody(JSON.stringify({ name: "DevOps", slug: "devops" }, null, 2));
    } else if (endpoint.includes("POST /tags")) {
      setRequestBody(JSON.stringify({ name: "Docker" }, null, 2));
    } else if (endpoint.includes("POST /projects")) {
      setRequestBody(JSON.stringify({ info: "Gunakan form-data sesuai CreateProjectDto" }, null, 2));
    } else if (endpoint.includes("POST /students")) {
      setRequestBody(JSON.stringify({ nis: "13522999", name: "Ahmad", majorId: 1, batchId: 1 }, null, 2));
    } else if (endpoint.includes("PATCH /payment/verify")) {
      setRequestBody(JSON.stringify({ status: "APPROVED", adminNote: "Dana terverifikasi" }, null, 2));
    } else {
      setRequestBody("");
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl glass-panel border-cyan-500/20 hover:border-cyan-500/50 bg-slate-950/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-cyan-400 font-display font-bold text-xs select-none hover:scale-105 transition-all duration-300 animate-glow-cyan cursor-pointer"
      >
        <Terminal className="h-4.5 w-4.5 animate-pulse" />
        <span>API Inspector</span>
      </button>

      {/* Expanded Sandbox Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 left-0 w-full max-w-lg z-50 bg-slate-950/95 border-r border-slate-900 shadow-[20px_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col justify-between animate-in slide-in-from-left duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-900 flex justify-between items-center bg-slate-950">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-white">StudentHub API Inspector</h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Live API Playground</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-slate-950 px-4 border-b border-slate-900 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("logs")}
              className={`flex-1 py-3 text-center transition-all cursor-pointer ${
                activeTab === "logs"
                  ? "text-cyan-400 border-b-2 border-cyan-400 font-bold"
                  : "text-slate-500 hover:text-slate-350"
              }`}
            >
              Live API Logs ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab("playground")}
              className={`flex-1 py-3 text-center transition-all cursor-pointer ${
                activeTab === "playground"
                  ? "text-cyan-400 border-b-2 border-cyan-400 font-bold"
                  : "text-slate-500 hover:text-slate-350"
              }`}
            >
              API Sandbox Playground
            </button>
          </div>

          {/* Sandbox Body Content */}
          <div className="flex-grow overflow-y-auto p-5 no-scrollbar space-y-5">
            
            {/* TAB 1: Live API Logs */}
            {activeTab === "logs" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-mono">Live HTTP Request Logs</span>
                  {logs.length > 0 && (
                    <button 
                      onClick={handleClearLogs} 
                      className="text-slate-550 hover:text-red-400 uppercase font-bold text-[10px]"
                    >
                      Hapus Log
                    </button>
                  )}
                </div>

                {logs.length > 0 ? (
                  <div className="space-y-2">
                    {logs.map((log) => {
                      const isSuccess = log.status < 400;
                      return (
                        <div 
                          key={log.id} 
                          onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                          className={`p-3.5 rounded-xl border bg-slate-950/80 transition-all cursor-pointer hover:border-slate-800 ${
                            selectedLog?.id === log.id ? "border-cyan-500/40 bg-slate-900/10" : "border-slate-900"
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded font-bold ${
                                log.method === "GET" ? "bg-blue-500/10 text-blue-400" :
                                log.method === "POST" ? "bg-emerald-500/10 text-emerald-400" :
                                log.method === "PATCH" ? "bg-violet-500/10 text-violet-400" :
                                "bg-rose-500/10 text-rose-400"
                              }`}>
                                {log.method}
                              </span>
                              <span className="text-slate-350 font-semibold truncate max-w-[180px]">{log.url}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${isSuccess ? "text-emerald-450" : "text-rose-550"}`}>
                                {log.status} {log.statusText}
                              </span>
                              <span className="text-slate-600">{log.timestamp}</span>
                            </div>
                          </div>

                          {/* Expanded Log Details */}
                          {selectedLog?.id === log.id && (
                            <div className="mt-4 pt-3 border-t border-slate-900/60 space-y-3.5 text-[10px] font-mono select-text">
                              {/* Headers */}
                              {log.headers && Object.keys(log.headers).length > 0 && (
                                <div className="space-y-1">
                                  <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider">Headers:</span>
                                  <pre className="bg-slate-950 p-2 rounded border border-slate-900 text-slate-400 overflow-x-auto text-[9px]">
                                    {JSON.stringify(log.headers, null, 2)}
                                  </pre>
                                </div>
                              )}
                              
                              {/* Request Body */}
                              {log.body && (
                                <div className="space-y-1">
                                  <span className="text-slate-500 block uppercase font-bold text-[9px] tracking-wider">Request Body:</span>
                                  <pre className="bg-slate-950 p-2 rounded border border-slate-900 text-slate-300 overflow-x-auto text-[9px]">
                                    {JSON.stringify(log.body, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {/* Response */}
                              <div className="space-y-1">
                                <span className="text-slate-550 block uppercase font-bold text-[9px] tracking-wider">JSON Response:</span>
                                <pre className="bg-slate-950 p-2.5 rounded border border-slate-900 text-cyan-400 overflow-x-auto text-[9px] max-h-[160px] overflow-y-auto">
                                  {JSON.stringify(log.response, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-slate-900/10 rounded-2xl border border-slate-900 border-dashed">
                    <Code className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs font-semibold">Belum ada request terdeteksi</p>
                    <p className="text-slate-600 text-[10px] max-w-xs mx-auto mt-0.5">Jelajahi situs, tambahkan wishlist, kelola keranjang belanja, atau login untuk memicu log API.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: API Sandbox Playground */}
            {activeTab === "playground" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-mono">Sandbox API Playground</span>
                </div>

                <div className="space-y-4">
                  {/* Select Endpoint route */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 block font-semibold">1. RUTE REST API ENDPOINT:</label>
                    <select
                      value={selectedEndpoint}
                      onChange={(e) => handleSelectEndpoint(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-xs text-white font-mono focus:outline-none"
                    >
                      <optgroup label="🌐 A. Akses Publik (Visitor / Belum Login)">
                        <option value="GET /projects">GET /projects</option>
                        <option value="GET /projects/1">GET /projects/:slugOrId</option>
                        <option value="GET /categories">GET /categories</option>
                        <option value="GET /tags">GET /tags</option>
                        <option value="POST /contacts">POST /contacts</option>
                      </optgroup>
                      <optgroup label="👤 B. Akses Authenticated User (Role: USER)">
                        <option value="POST /wishlists/1">POST /wishlists/:projectId</option>
                        <option value="GET /wishlists">GET /wishlists</option>
                        <option value="GET /wishlists/check/1">GET /wishlists/check/:projectId</option>
                        <option value="POST /carts/items">POST /carts/items</option>
                        <option value="DELETE /carts/items/1">DELETE /carts/items/:projectId</option>
                        <option value="POST /orders/checkout">POST /orders/checkout</option>
                        <option value="POST /ratings">POST /ratings</option>
                      </optgroup>
                      <optgroup label="👑 C. Akses Admin (Role: ADMIN)">
                        <option value="POST /categories">POST /categories</option>
                        <option value="POST /tags">POST /tags</option>
                        <option value="POST /projects">POST /projects (Multipart)</option>
                        <option value="GET /projects/all/admin">GET /projects/all/admin</option>
                        <option value="POST /students">POST /students</option>
                        <option value="PATCH /payment/verify/1">PATCH /payment/verify/:id</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Header Authorization */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 block font-semibold flex items-center justify-between">
                      <span>2. AUTHORIZATION HEADER TOKEN:</span>
                      {user && (
                        <button 
                          type="button" 
                          onClick={() => setCustomToken(user.token || "")}
                          className="text-[9px] text-cyan-400 font-bold hover:underline"
                        >
                          Gunakan Sesi Login
                        </button>
                      )}
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-[10px] font-mono">
                        Bearer
                      </span>
                      <input
                        type="text"
                        value={customToken}
                        onChange={(e) => setCustomToken(e.target.value)}
                          placeholder="Tempel token JWT di sini..."
                        className="w-full pl-14 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-850 text-[10px] text-slate-300 font-mono placeholder-slate-650 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Request Body payload */}
                  {requestBody !== undefined && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-450 block font-semibold">3. REQUEST BODY (JSON PAYLOAD):</label>
                      <textarea
                        rows={5}
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        placeholder="{}"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-850 text-[10px] text-slate-200 font-mono placeholder-slate-650 focus:outline-none"
                      ></textarea>
                    </div>
                  )}

                  {/* Send Action */}
                  <button
                    onClick={handleSendPlaygroundRequest}
                    disabled={isExecuting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-cyan-500/10 transition-all hover:scale-101 disabled:opacity-50"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>{isExecuting ? "Mengirim request..." : "Kirim Request"}</span>
                  </button>

                  {/* Sandbox Response Output */}
                  {(playgroundStatus !== null || playgroundResponse) && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-900/80">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-550 uppercase font-bold">API Response Sandbox:</span>
                        {playgroundStatus !== null && (
                          <span className={`font-bold ${playgroundStatus < 400 ? "text-emerald-450" : "text-rose-550"}`}>
                            {playgroundStatus} {playgroundStatusText}
                          </span>
                        )}
                      </div>
                      
                      <pre className="bg-slate-950 p-3 rounded-xl border border-slate-900 text-cyan-400 overflow-x-auto text-[10px] max-h-[220px] overflow-y-auto leading-relaxed select-text font-mono">
                        {JSON.stringify(playgroundResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Sandbox Footer */}
          <div className="p-4 border-t border-slate-900 bg-slate-950/80 flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span className="flex items-center gap-1"><Key className="h-3 w-3 text-cyan-500" /> live request mode</span>
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-violet-500" /> backend guards apply</span>
          </div>
        </div>
      )}
    </>
  );
}
