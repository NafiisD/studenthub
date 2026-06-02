"use client";

import { useState, useEffect, useCallback } from "react";
import * as api from "@/lib/api";
import { Zap, Menu, X, User as UserIcon, LogOut, LayoutDashboard, ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface NavLinkItem {
  label: string;
  href: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [navLinks, setNavLinks] = useState<NavLinkItem[]>([]);
  
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const baseLinks: NavLinkItem[] = [{ label: "Marketplace", href: "/marketplace" }];
    setNavLinks(baseLinks);
  }, []);

  const fetchCounts = useCallback(async () => {
    if (!isAuthenticated || !user || user.role !== "USER") {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }
    const token = user.token || (typeof window !== "undefined" ? localStorage.getItem("studenthub_token") || "" : "");
    try {
      const [cartRes, wishRes] = await Promise.all([
        api.fetchMyCart(token),
        api.fetchMyWishlist(token),
      ]);
      if (cartRes.data?.items && Array.isArray(cartRes.data.items)) setCartCount(cartRes.data.items.length);
      else if (Array.isArray(cartRes.data)) setCartCount(cartRes.data.length);
      if (Array.isArray(wishRes.data)) setWishlistCount(wishRes.data.length);
    } catch (err) {
      console.error("Navbar fetchCounts", err);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchCounts();
    // Listen to mutations from other components to refresh counts
    const listener = (newLog?: any) => {
      if (newLog && newLog.method === "GET") return;
      fetchCounts();
    };
    if (typeof window !== "undefined") {
      if (!(window as any).studenthub_api_listeners) (window as any).studenthub_api_listeners = [];
      (window as any).studenthub_api_listeners.push(listener);
      return () => {
        (window as any).studenthub_api_listeners = ((window as any).studenthub_api_listeners || []).filter(
          (l: any) => l !== listener
        );
      };
    }
  }, [fetchCounts]);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    return user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/customer";
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-900/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative p-2 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                <Zap className="h-5 w-5 text-white animate-pulse" />
              </div>
              <span className="font-display font-bold text-xl sm:text-2xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-wide">
                Student<span className="text-cyan-400">Hub</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200 relative group py-2"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
            
            {/* Public Contact link */}
            <Link
              href="/contact"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200 relative group py-2"
            >
              Hubungi Kami
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* Action Buttons / User Profile Badge (Desktop) */}
          <div className="hidden md:flex items-center gap-4 relative">
            {/* Shopping Cart & Wishlist Quick Indicators for USER */}
            {isAuthenticated && user && user.role === "USER" && (
              <div className="flex items-center gap-2 mr-2">
                {/* Wishlist Icon */}
                <Link
                  href="/dashboard/customer?tab=wishlist"
                  className="relative p-2 rounded-xl bg-slate-900/40 border border-slate-850 text-slate-450 hover:text-rose-450 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer"
                  title="Wishlist Saya"
                >
                  <Heart className="h-4.5 w-4.5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart Icon */}
                <Link
                  href="/dashboard/customer?tab=cart"
                  className="relative p-2 rounded-xl bg-slate-900/40 border border-slate-850 text-slate-450 hover:text-cyan-450 hover:bg-slate-900/80 transition-all duration-200 cursor-pointer"
                  title="Keranjang Saya"
                >
                  <ShoppingCart className="h-4.5 w-4.5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 rounded-full bg-cyan-500 text-[9px] font-bold text-slate-950 flex items-center justify-center animate-bounce">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            )}

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-850 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/60 transition-all duration-200 cursor-pointer select-none"
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-[0_0_10px_rgba(6,182,212,0.3)] animate-glow-cyan">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white leading-3 max-w-[120px] truncate">{user.name}</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-none mt-1.5">
                      Role: <span className={user.role === "ADMIN" ? "text-violet-400 font-bold" : "text-cyan-400 font-bold"}>{user.role}</span>
                    </p>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowProfileDropdown(false)}
                    ></div>
                    <div className="absolute right-0 mt-2.5 w-52 rounded-xl bg-slate-950 border border-slate-900 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setShowProfileDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm text-slate-350 hover:text-white hover:bg-slate-900/60 transition-colors"
                      >
                        <LayoutDashboard className="h-4.5 w-4.5 text-cyan-400" />
                        Dashboard Area
                      </Link>
                      
                      {user.role === "USER" && (
                        <Link
                          href="/dashboard/customer?tab=profile"
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm text-slate-355 hover:text-white hover:bg-slate-900/60 transition-colors"
                        >
                          <UserIcon className="h-4.5 w-4.5 text-indigo-400" />
                          Pengaturan Profil
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="h-4.5 w-4.5" />
                        Keluar Akun
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors border border-slate-900 bg-slate-900/20 backdrop-blur-sm hover:border-slate-800"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="relative text-sm font-semibold text-white px-5 py-2.5 rounded-lg overflow-hidden group"
                >
                  {/* Button gradient background */}
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 transition-all duration-300 group-hover:scale-105"></span>
                  {/* Border glow effect */}
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 opacity-50 blur-md group-hover:opacity-100 transition-opacity duration-300 -z-10 animate-glow-cyan"></span>
                  <span className="relative z-10 flex items-center gap-1">
                    Daftar
                  </span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/50 focus:outline-none border border-transparent hover:border-slate-800"
              aria-controls="mobile-menu"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-screen opacity-100 border-t border-slate-900" : "max-h-0 opacity-0 overflow-hidden"
        }`}
        id="mobile-menu"
      >
        <div className="px-4 pt-4 pb-6 space-y-3 bg-slate-950/95 backdrop-blur-xl">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent hover:border-slate-800/50 transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
          
          {isAuthenticated && user && user.role === "USER" && (
            <>
              <Link
                href="/dashboard/customer?tab=cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent hover:border-slate-800/50 transition-all duration-200"
              >
                <span>Keranjang Belanja</span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs">{cartCount}</span>
              </Link>
              <Link
                href="/dashboard/customer?tab=wishlist"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent hover:border-slate-800/50 transition-all duration-200"
              >
                <span>Wishlist Saya</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-xs">{wishlistCount}</span>
              </Link>
            </>
          )}

          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent hover:border-slate-800/50 transition-all duration-200"
          >
            Hubungi Kami
          </Link>
          
          <div className="pt-4 border-t border-slate-900 flex flex-col gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                      Role: {user.role}
                    </p>
                  </div>
                </div>
                
                <Link
                  href={getDashboardLink()}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 font-medium text-slate-300 hover:text-white py-2.5 rounded-lg border border-slate-850 bg-slate-900/50 hover:bg-slate-900/80 transition-colors"
                >
                  <LayoutDashboard className="h-4.5 w-4.5 text-cyan-400" />
                  Dashboard Area
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-center font-semibold text-red-400 hover:text-red-300 py-2.5 rounded-lg border border-transparent bg-red-500/5 hover:bg-red-500/10 transition-colors"
                >
                  Keluar Akun
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center font-medium text-slate-300 hover:text-white py-2.5 rounded-lg transition-colors border border-slate-900 bg-slate-950"
                >
                  Masuk
                </Link>
                <Link 
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center font-semibold text-white py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-200"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
