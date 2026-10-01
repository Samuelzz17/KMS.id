import React, { useRef, useState } from 'react';
import { User } from 'firebase/auth';
import {
  LayoutDashboard,
  Layers,
  Package,
  SlidersHorizontal,
  Users,
  BarChart3,
  Calculator,
  Plus,
  Menu,
  X,
  LogIn,
  LogOut,
  Sun,
  Moon,
  Wallet,
  Cpu,
  FlaskConical,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import logoAsset from '../assets/logo.svg';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewOrder: () => void;
  onOpenEstimator: () => void;
  lowStockCount: number;
  activeOrdersCount: number;
  currentUser: User | null;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewOrder,
  onOpenEstimator,
  lowStockCount,
  activeOrdersCount,
  currentUser,
  onSignInGoogle,
  onSignOut,
  theme = 'light',
  onToggleTheme,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Ringkasan & Metrik',
    },
    {
      id: 'orders',
      label: 'Pesanan & SPK',
      icon: Layers,
      desc: 'Alur Produksi Cetak',
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
    },
    {
      id: 'stock',
      label: 'Stok Cup',
      icon: Package,
      desc: 'Inventaris & Mutasi',
      alert: lowStockCount > 0,
      alertText: lowStockCount > 0 ? `${lowStockCount} Menipis` : undefined,
    },
    {
      id: 'expenses',
      label: 'Pengeluaran Kas',
      icon: Wallet,
      desc: 'Biaya & Operasional',
    },
    {
      id: 'assets',
      label: 'Aset Investasi',
      icon: Cpu,
      desc: 'Mesin & Peralatan',
    },
    {
      id: 'consumables',
      label: 'Bahan Operasional',
      icon: FlaskConical,
      desc: 'Afdruk, Cat & Kimia',
    },
    {
      id: 'sablon',
      label: 'Tarif & Spesifikasi',
      icon: SlidersHorizontal,
      desc: 'Setting Biaya Cetak',
    },
    {
      id: 'customers',
      label: 'Pelanggan & Brand',
      icon: Users,
      desc: 'Database Mitra Gerai',
    },
    {
      id: 'reports',
      label: 'Laporan Keuangan',
      icon: BarChart3,
      desc: 'Omzet, Laba & Ekspor',
    },
    {
      id: 'settings',
      label: 'Pengaturan Workshop',
      icon: Settings,
      desc: 'Tarif, Rekening & TTD',
    },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileDrawerOpen(false);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. MOBILE TOP HEADER (< lg screens) */}
      {/* ========================================================================= */}
      <header
        className={`lg:hidden sticky top-0 z-40 backdrop-blur-2xl border-b px-4 py-3 flex items-center justify-between transition-colors ${
          theme === 'light'
            ? 'bg-white/90 border-zinc-200 shadow-xs'
            : 'bg-black/90 border-white/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className={`p-2 rounded-xl border transition-colors ${
              theme === 'light'
                ? 'border-zinc-300 bg-zinc-100 text-zinc-700 hover:text-black'
                : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white'
            }`}
            aria-label="Buka Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Logo Slot */}
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center overflow-hidden transition-colors ${
              theme === 'light'
                ? 'bg-zinc-100 border-zinc-300'
                : 'bg-white/[0.06] border-white/15'
            }`}
          >
            <img src={logoAsset} alt="KMS.id Logo" className="w-full h-full object-contain p-1" />
          </div>

          <div onClick={() => handleNavClick('dashboard')} className="cursor-pointer">
            <span className="font-montserrat font-black text-lg tracking-tight">
              KMS<span className="opacity-50">.</span>id
            </span>
            <span className={`ml-1.5 text-[9px] font-inter font-bold px-1.5 py-0.5 rounded-full border ${
              theme === 'light'
                ? 'bg-zinc-200 text-zinc-800 border-zinc-300'
                : 'bg-white/10 text-zinc-300 border-white/10'
            }`}>
              WORKSHOP
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle Button Mobile */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition-all ${
                theme === 'light'
                  ? 'border-zinc-300 bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
                  : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08]'
              }`}
              title={theme === 'dark' ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Night Mode)'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          )}

          <button
            onClick={onOpenEstimator}
            className={`p-2 rounded-xl border transition-colors ${
              theme === 'light'
                ? 'border-zinc-300 bg-zinc-100 text-zinc-800'
                : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white'
            }`}
            title="Kalkulator Estimasi WA"
          >
            <Calculator className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenNewOrder}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-montserrat font-black transition-all ${
              theme === 'light'
                ? 'bg-black text-white hover:bg-zinc-800 shadow-sm'
                : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">Pesanan Baru</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MOBILE DRAWER OVERLAY (< lg screens) */}
      {/* ========================================================================= */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div
            className={`relative w-72 max-w-[85vw] border-r h-full flex flex-col justify-between p-5 overflow-y-auto z-10 transition-colors shadow-2xl animate-in slide-in-from-left duration-200 ${
              theme === 'light'
                ? 'bg-white/95 border-zinc-200 text-zinc-900'
                : 'bg-black/95 border-white/15 text-white shadow-[0_0_50px_rgba(0,0,0,0.9)]'
            }`}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-inherit/20">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-2xl border flex items-center justify-center overflow-hidden ${
                      theme === 'light'
                        ? 'bg-zinc-100 border-zinc-300'
                        : 'bg-white/[0.06] border-white/20'
                    }`}
                  >
                    <img src={logoAsset} alt="KMS.id Logo" className="w-full h-full object-contain p-1" />
                  </div>
                  <div>
                    <h2 className="font-montserrat font-black text-lg">
                      KMS<span className="opacity-50">.</span>id
                    </h2>
                    <p className="text-[10px] opacity-70 font-inter">Workshop Sablon Cup</p>
                  </div>
                </div>

                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl border opacity-70 hover:opacity-100 transition-opacity"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Switcher in Mobile Drawer */}
              {onToggleTheme && (
                <div className="pt-4">
                  <div
                    className={`p-1 rounded-2xl border flex items-center text-xs transition-colors ${
                      theme === 'light'
                        ? 'bg-zinc-100 border-zinc-200'
                        : 'bg-white/[0.04] border-white/10'
                    }`}
                  >
                    <button
                      onClick={() => theme !== 'dark' && onToggleTheme()}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl font-montserrat font-bold text-xs transition-all ${
                        theme === 'dark'
                          ? 'bg-white text-black shadow-sm'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Night</span>
                    </button>
                    <button
                      onClick={() => theme !== 'light' && onToggleTheme()}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl font-montserrat font-bold text-xs transition-all ${
                        theme === 'light'
                          ? 'bg-black text-white shadow-sm'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Light</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 space-y-2">
                <button
                  onClick={() => {
                    onOpenNewOrder();
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-montserrat font-black transition-all ${
                    theme === 'light'
                      ? 'bg-black text-white hover:bg-zinc-800 shadow-md'
                      : 'bg-white hover:bg-zinc-200 text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                  }`}
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Buat Pesanan & SPK</span>
                </button>

                <button
                  onClick={() => {
                    onOpenEstimator();
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-inter font-semibold transition-colors ${
                    theme === 'light'
                      ? 'border-zinc-300 bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
                      : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white'
                  }`}
                >
                  <Calculator className="w-4 h-4 opacity-70" />
                  <span>Kalkulator WA Instan</span>
                </button>
              </div>

              {/* Nav Links */}
              <div className="pt-5 space-y-1">
                <div className="text-[10px] font-montserrat font-bold opacity-50 uppercase tracking-widest px-3 mb-2">
                  Navigasi Menu
                </div>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs transition-all ${
                        isActive
                          ? theme === 'light'
                            ? 'bg-black text-white font-montserrat font-black shadow-md'
                            : 'bg-white text-black font-montserrat font-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                          : theme === 'light'
                            ? 'text-zinc-600 hover:text-black hover:bg-zinc-100 font-inter font-medium'
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.06] font-inter font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? (theme === 'light' ? 'text-white' : 'text-black') : 'opacity-60'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-montserrat font-black ${
                            isActive
                              ? (theme === 'light' ? 'bg-zinc-800 text-white' : 'bg-black text-white')
                              : (theme === 'light' ? 'bg-zinc-200 text-zinc-800' : 'bg-white/20 text-white')
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.alert && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Bottom */}
            <div className="pt-4 border-t border-inherit/20 space-y-2.5">
              {currentUser ? (
                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  theme === 'light' ? 'bg-zinc-100 border-zinc-200' : 'bg-white/[0.04] border-white/10'
                }`}>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-montserrat font-bold text-xs truncate max-w-[130px]">
                        {currentUser.displayName || currentUser.email}
                      </span>
                    </div>
                    <p className="text-[10px] opacity-60 font-inter mt-0.5">Cloud Sync Aktif</p>
                  </div>
                  <button
                    onClick={() => {
                      onSignOut();
                      setMobileDrawerOpen(false);
                    }}
                    className="p-1.5 opacity-60 hover:opacity-100 rounded-lg border border-inherit/30"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onSignInGoogle();
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-inter font-semibold ${
                    theme === 'light'
                      ? 'border-zinc-300 bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                      : 'border-white/15 bg-white/[0.06] text-white hover:bg-white/10'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk Google Cloud</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DESKTOP PERMANENT LEFT SIDEBAR (>= lg screens) */}
      {/* ========================================================================= */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 backdrop-blur-2xl border-r z-40 p-5 overflow-y-auto shrink-0 select-none justify-between font-inter transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[88px] items-center px-3' : 'w-68 xl:w-72'
        } ${
          theme === 'light'
            ? 'bg-white/90 border-zinc-200 text-zinc-900 shadow-sm'
            : 'bg-black/90 border-white/10 text-zinc-100'
        }`}
      >
        <div className="space-y-5 w-full">
          {/* Brand Header */}
          <div className={`flex pb-2 ${isCollapsed ? 'flex-col items-center gap-4' : 'items-center justify-between'}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3.5'}`}>
              {/* Logo Slot */}
              <div
                className={`relative rounded-2xl border flex items-center justify-center backdrop-blur-md transition-all overflow-hidden shrink-0 ${
                  isCollapsed ? 'w-10 h-10' : 'w-12 h-12'
                } ${
                  theme === 'light'
                    ? 'bg-zinc-100 border-zinc-300 shadow-sm'
                    : 'bg-white/[0.05] border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                }`}
              >
                <img src={logoAsset} alt="KMS.id Logo" className="w-full h-full object-contain p-1" />
              </div>

              {/* Brand Title */}
              {!isCollapsed && (
                <div
                  className="cursor-pointer"
                  onClick={() => setActiveTab('dashboard')}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-montserrat font-black text-2xl tracking-tighter">
                      KMS<span className="opacity-40 font-normal">.</span>id
                    </span>
                    <span className={`text-[9px] font-inter font-bold px-1.5 py-0.5 rounded-full border ${
                      theme === 'light'
                        ? 'bg-zinc-200 text-zinc-800 border-zinc-300'
                        : 'bg-white/10 text-white border-white/15'
                    }`}>
                      PRO
                    </span>
                  </div>
                  <p className="text-[11px] opacity-60 tracking-wide font-normal">
                    Workshop Sablon Cup
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-1.5 rounded-xl border transition-colors ${
                theme === 'light'
                  ? 'border-zinc-300 bg-zinc-100 text-zinc-700 hover:text-black hover:bg-zinc-200'
                  : 'border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
              title={isCollapsed ? "Perluas Sidebar" : "Minimize Sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>


          {/* Primary Quick CTA Buttons */}
          <div className="space-y-2">
            <button
              onClick={onOpenNewOrder}
              className={`w-full flex items-center justify-center gap-2 py-3 ${isCollapsed ? 'px-0 rounded-xl' : 'px-4 rounded-2xl'} text-xs font-montserrat font-black transition-all hover:scale-[1.02] active:scale-[0.98] ${
                theme === 'light'
                  ? 'bg-black hover:bg-zinc-800 text-white shadow-md'
                  : 'bg-white hover:bg-zinc-200 text-black shadow-[0_0_25px_rgba(255,255,255,0.22)]'
              }`}
              title="Buat Pesanan & SPK"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              {!isCollapsed && <span>Buat Pesanan & SPK</span>}
            </button>

            <button
              onClick={onOpenEstimator}
              className={`w-full flex items-center justify-center gap-2 py-2.5 ${isCollapsed ? 'px-0 rounded-xl' : 'px-3 rounded-2xl'} border text-xs font-inter font-semibold transition-colors backdrop-blur-md ${
                theme === 'light'
                  ? 'border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 hover:text-black'
                  : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white'
              }`}
              title="Kalkulator Estimasi WA"
            >
              <Calculator className="w-4 h-4 opacity-70" />
              {!isCollapsed && <span>Kalkulator Estimasi WA</span>}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 w-full">
            {!isCollapsed ? (
              <div className="px-3 pt-2 pb-1.5 text-[10px] font-montserrat font-bold opacity-50 uppercase tracking-widest flex items-center justify-between group/nav-title">
                <span>Navigasi Utama</span>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-1 rounded-lg opacity-0 group-hover/nav-title:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                  title="Sembunyikan Sidebar"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="pt-2 pb-1.5 flex justify-center">
                 <button
                  onClick={() => setIsCollapsed(false)}
                  className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                  title="Perluas Sidebar"
                 >
                  <ChevronRight className="w-3.5 h-3.5" />
                 </button>
              </div>
            )}

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'} py-3 rounded-2xl text-xs transition-all relative group ${
                      isActive
                        ? theme === 'light'
                          ? 'bg-black text-white font-montserrat font-black shadow-md'
                          : 'bg-white text-black font-montserrat font-black shadow-[0_0_25px_rgba(255,255,255,0.2)]'
                        : theme === 'light'
                          ? 'text-zinc-600 hover:text-black hover:bg-zinc-100 font-inter font-medium'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.06] font-inter font-medium'
                    }`}
                    title={isCollapsed ? `${item.label} - ${item.desc}` : undefined}
                  >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
                      <div
                        className={`p-1.5 rounded-xl transition-colors ${
                          isActive
                            ? theme === 'light'
                              ? 'bg-zinc-800 text-white'
                              : 'bg-black text-white'
                            : theme === 'light'
                              ? 'bg-zinc-200/70 text-zinc-600 group-hover:text-black'
                              : 'bg-white/[0.05] text-zinc-400 group-hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {!isCollapsed && (
                        <div className="text-left min-w-0">
                          <div className="truncate font-semibold">{item.label}</div>
                          <div
                            className={`text-[10px] truncate ${
                              isActive
                                ? theme === 'light'
                                  ? 'text-zinc-300 font-medium'
                                  : 'text-zinc-700 font-medium'
                                : 'opacity-60'
                            }`}
                          >
                            {item.desc}
                          </div>
                        </div>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1.5">
                        {item.badge !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-montserrat font-black ${
                              isActive
                                ? theme === 'light'
                                  ? 'bg-zinc-800 text-white'
                                  : 'bg-black text-white'
                                : theme === 'light'
                                  ? 'bg-zinc-200 text-zinc-800'
                                  : 'bg-white/20 text-white'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {item.alert && (
                          <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              theme === 'light' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-white/20 text-white'
                            }`}
                            title="Ada stok di bawah batas minimal"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${theme === 'light' ? 'bg-amber-600' : 'bg-white'}`} />
                            <span>Alert</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Indicators when collapsed */}
                    {isCollapsed && (item.badge !== undefined || item.alert) && (
                      <div className="absolute top-2 right-2 flex gap-0.5">
                        {item.badge !== undefined && (
                           <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm" />
                        )}
                        {item.alert && (
                           <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-sm" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer / Account / Logo Settings */}
        <div className={`pt-4 border-t space-y-3 w-full ${theme === 'light' ? 'border-zinc-200' : 'border-white/10'}`}>
          {/* Theme Mode Toggle (Night Mode / Light Mode) */}
          {onToggleTheme && !isCollapsed && (
            <div
              className={`p-1 rounded-2xl border flex items-center text-xs transition-colors ${
                theme === 'light'
                  ? 'bg-zinc-100 border-zinc-200'
                  : 'bg-white/[0.04] border-white/10'
              }`}
            >
              <button
                onClick={() => theme !== 'dark' && onToggleTheme()}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl font-montserrat font-bold text-xs transition-all ${
                  theme === 'dark'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
                title="Aktifkan Mode Gelap (Night Mode)"
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Night Mode</span>
              </button>
              <button
                onClick={() => theme !== 'light' && onToggleTheme()}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl font-montserrat font-bold text-xs transition-all ${
                  theme === 'light'
                    ? 'bg-black text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Aktifkan Mode Terang (Light Mode)"
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light Mode</span>
              </button>
            </div>
          )}

          {onToggleTheme && isCollapsed && (
            <div className="flex justify-center">
              <button
                onClick={onToggleTheme}
                className={`p-2 rounded-xl border transition-colors ${
                  theme === 'light'
                    ? 'border-zinc-300 bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
                    : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08]'
                }`}
                title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>
          )}
          {/* Cloud Sync Status */}
          {currentUser ? (
            <div className={`p-3 rounded-2xl border backdrop-blur-md flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} ${
              theme === 'light' ? 'bg-zinc-100 border-zinc-200' : 'bg-white/[0.04] border-white/10'
            }`}>
              {!isCollapsed && (
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-xl border flex items-center justify-center font-montserrat font-bold text-xs shrink-0 ${
                    theme === 'light' ? 'bg-zinc-200 border-zinc-300 text-zinc-900' : 'bg-white/10 border-white/20 text-white'
                  }`}>
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-montserrat font-bold truncate max-w-[120px]">
                      {currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0]}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] opacity-60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs" />
                      <span>Cloud Aktif</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={onSignOut}
                className={`p-1.5 rounded-xl transition-colors border ${
                  theme === 'light'
                    ? 'border-transparent hover:border-zinc-300 text-zinc-600 hover:text-black hover:bg-zinc-200'
                    : 'border-transparent hover:border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
                title="Keluar dari akun Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInGoogle}
              className={`w-full flex items-center justify-center gap-2 py-2.5 ${isCollapsed ? 'px-0' : 'px-3'} rounded-2xl border text-xs font-inter font-semibold transition-colors backdrop-blur-md ${
                theme === 'light'
                  ? 'border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
                  : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white'
              }`}
              title="Masuk Google Cloud"
            >
              <LogIn className="w-4 h-4" />
              {!isCollapsed && <span>Masuk Google Cloud</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
