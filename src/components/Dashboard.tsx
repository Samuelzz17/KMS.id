import React from 'react';
import { CupProduct, CustomerOrder, ProductionStatus, StockMovement, RecentActivityItem } from '../types';
import {
  formatDate,
  formatNumber,
  formatRupiah,
  getPaymentStatusLabel,
  getProductionStatusLabel,
} from '../utils/formatters';
import { RecentActivityFeed } from './RecentActivityFeed';
import {
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Clock,
  Printer,
  ChevronRight,
  Plus,
  Calculator,
  ArrowRight,
  Layers,
  Sparkles,
  FileText,
} from 'lucide-react';

interface DashboardProps {
  orders: CustomerOrder[];
  cups: CupProduct[];
  movements?: StockMovement[];
  customActivities?: RecentActivityItem[];
  onOpenNewOrder: () => void;
  onOpenSpkModal?: (order?: CustomerOrder | null) => void;
  onOpenEstimator: () => void;
  onOpenStockModal: (cup?: CupProduct) => void;
  onSelectOrderToPrint: (order: CustomerOrder) => void;
  onNavigateTab: (tab: string) => void;
  onAdvanceOrderStatus: (orderId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  orders,
  cups,
  movements = [],
  customActivities = [],
  onOpenNewOrder,
  onOpenSpkModal,
  onOpenEstimator,
  onOpenStockModal,
  onSelectOrderToPrint,
  onNavigateTab,
  onAdvanceOrderStatus,
}) => {
  // Metrik kalkulasi
  const activeOrders = orders.filter((o) => o.productionStatus !== 'SELESAI' && o.productionStatus !== 'BATAL');
  const completedOrders = orders.filter((o) => o.productionStatus === 'SELESAI');
  
  const totalRevenue = orders.reduce((sum, o) => sum + (o.productionStatus !== 'BATAL' ? o.totalPrice : 0), 0);
  const totalCashIn = orders.reduce((sum, o) => {
    if (o.productionStatus === 'BATAL') return sum;
    const isPaidOff = o.paymentStatus === 'LUNAS' || (o.totalPrice > 0 && o.downPayment >= o.totalPrice);
    return sum + (isPaidOff ? o.totalPrice : o.downPayment);
  }, 0);
  const totalReceivables = orders.reduce((sum, o) => {
    if (o.productionStatus === 'BATAL') return sum;
    const isPaidOff = o.paymentStatus === 'LUNAS' || (o.totalPrice > 0 && o.downPayment >= o.totalPrice);
    return sum + (isPaidOff ? 0 : Math.max(0, o.remainingPayment));
  }, 0);
  const totalCupsPrinted = orders.reduce((sum, o) => sum + (o.productionStatus !== 'BATAL' ? o.quantityPcs : 0), 0);

  // Stok yang menipis
  const lowStockCups = cups.filter((c) => c.stockPcs <= c.minStockAlert);

  // Breakdown status produksi
  const statusCounts: Record<ProductionStatus, number> = {
    MENUNGGU_SPK: orders.filter((o) => o.productionStatus === 'MENUNGGU_SPK').length,
    ANTREAN: orders.filter((o) => o.productionStatus === 'ANTREAN').length,
    SETTING_FILM: orders.filter((o) => o.productionStatus === 'SETTING_FILM').length,
    PROSES_SABLON: orders.filter((o) => o.productionStatus === 'PROSES_SABLON').length,
    FINISHING: orders.filter((o) => o.productionStatus === 'FINISHING').length,
    SIAP_AMBIL: orders.filter((o) => o.productionStatus === 'SIAP_AMBIL').length,
    SELESAI: orders.filter((o) => o.productionStatus === 'SELESAI').length,
    BATAL: orders.filter((o) => o.productionStatus === 'BATAL').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions - Monochrome Glassmorphism */}
      <div className="relative rounded-3xl p-6 sm:p-8 text-white overflow-hidden glass-panel border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {/* Subtle glass reflection highlight */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-inter font-medium text-zinc-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>KMS.id • Sistem Manajemen Sablon Cup & Produksi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-montserrat font-black tracking-tight text-white">
              Workshop Cetak Sablon Cup
            </h1>
            <p className="text-sm text-zinc-400 font-inter max-w-xl mt-2 leading-relaxed">
              Monitoring antrean cetak, kontrol inventaris cup polos, kalkulasi instan, dan penerbitan SPK produksi pabrik sablon.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 1. Tombol Form Sales (Invoice) */}
            <button
              onClick={onOpenNewOrder}
              className="flex items-center gap-2.5 px-5 py-3 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-montserrat font-black shadow-[0_0_25px_rgba(255,255,255,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] border border-white"
              title="Buka Form Sales untuk catat pesanan & terbitkan invoice DP"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <div className="text-left">
                <span className="block leading-none">+ Form Sales (Invoice)</span>
                <span className="text-[9px] text-zinc-600 font-inter font-semibold block mt-0.5">Penjualan & DP</span>
              </div>
            </button>

            {/* 2. Tombol Form Buat SPK */}
            <button
              onClick={() => (onOpenSpkModal ? onOpenSpkModal() : onNavigateTab('orders'))}
              className="flex items-center gap-2.5 px-4 py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-montserrat font-bold backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              title="Buka Form SPK untuk tetapkan operator, screen, dan instruksi teknis cetak"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div className="flex items-center gap-1.5 leading-none">
                  <span>📝 Form Buat SPK</span>
                  {statusCounts.MENUNGGU_SPK > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-400 text-black font-black animate-pulse">
                      {statusCounts.MENUNGGU_SPK} Menunggu
                    </span>
                  )}
                </div>
                <span className="text-[9px] text-amber-400/80 font-inter font-semibold block mt-0.5">Workshop Produksi</span>
              </div>
            </button>

            {/* Tombol Kalkulator Estimasi WA */}
            <button
              onClick={onOpenEstimator}
              className="flex items-center gap-2 px-4 py-3 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white rounded-xl text-xs font-inter font-semibold backdrop-blur-md transition-colors"
            >
              <Calculator className="w-4 h-4 text-zinc-300" />
              <span>Kalkulator WA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alert Banner: Invoice yang menunggu penerbitan SPK Produksi */}
      {statusCounts.MENUNGGU_SPK > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <FileText className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-montserrat font-bold text-white">
                {statusCounts.MENUNGGU_SPK} Invoice Penjualan Baru Perlu Diterbitkan SPK Produksi
              </p>
              <p className="text-[11px] text-zinc-400 font-inter mt-0.5">
                Segera lengkapi spesifikasi teknis cetak dan assign operator produksi untuk diteruskan ke alur mesin sablon.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => (onOpenSpkModal ? onOpenSpkModal() : onNavigateTab('orders'))}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-montserrat font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>📝 Buat SPK Sekarang</span>
            </button>
            <button
              onClick={() => onNavigateTab('orders')}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-inter font-semibold rounded-xl transition-colors"
            >
              Lihat Antrean
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid - Glassmorphism Black & White with Montserrat Black */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pesanan Aktif */}
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-inter font-bold uppercase tracking-wider text-zinc-400">
              Pesanan Aktif
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/10">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-montserrat font-black text-white tracking-tight">
              {activeOrders.length}{' '}
              <span className="text-xs font-inter font-normal text-zinc-400">SPK aktif</span>
            </div>
            <div className="text-xs text-zinc-400 font-inter mt-1.5 flex items-center gap-1.5">
              <span className="font-semibold text-white">{completedOrders.length} SPK</span> selesai
            </div>
          </div>
        </div>

        {/* Total Cup Terjual & Disablon */}
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-inter font-bold uppercase tracking-wider text-zinc-400">
              Volume Cetak Cup
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/10">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-montserrat font-black text-white tracking-tight">
              {formatNumber(totalCupsPrinted)}{' '}
              <span className="text-xs font-inter font-normal text-zinc-400">pcs</span>
            </div>
            <div className="text-xs text-zinc-400 font-inter mt-1.5">
              Dari {orders.length} total transaksi
            </div>
          </div>
        </div>

        {/* Total Omset & Kas Masuk */}
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-inter font-bold uppercase tracking-wider text-zinc-400">
              Total Omset
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/10">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-montserrat font-black text-white tracking-tight">
              {formatRupiah(totalRevenue)}
            </div>
            <div className="text-xs text-zinc-400 font-inter mt-1.5">
              Kas Masuk (DP/Lunas): <strong className="text-white font-semibold">{formatRupiah(totalCashIn)}</strong>
            </div>
          </div>
        </div>

        {/* Piutang Pelunasan */}
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-inter font-bold uppercase tracking-wider text-zinc-400">
              Sisa Tagihan
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/10">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-montserrat font-black text-white tracking-tight">
              {formatRupiah(totalReceivables)}
            </div>
            <div className="text-xs text-zinc-400 font-inter mt-1.5">
              Dilunasi saat serah terima cup
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockCups.length > 0 && (
        <div className="glass-card border border-white/20 bg-white/[0.05] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-montserrat font-black text-white">
                Peringatan: {lowStockCups.length} Jenis Cup Melewati Batas Stok Minimal!
              </h4>
              <p className="text-xs text-zinc-300 font-inter mt-0.5">
                {lowStockCups.map((c) => `${c.name} (sisa ${formatNumber(c.stockPcs)} pcs)`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('stock')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black rounded-xl text-xs font-montserrat font-black shrink-0 self-start sm:self-auto hover:bg-zinc-200 transition-colors"
          >
            <span>Buka Gudang Stok</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      )}

      {/* Production Pipeline Flow Visualizer */}
      <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-montserrat font-black text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-zinc-300" />
            Alur Pipeline Produksi Sablon Cup
          </h3>
          <button
            onClick={() => onNavigateTab('orders')}
            className="text-xs font-inter font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Lihat Semua Pesanan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          <div className={`glass-card border rounded-xl p-3 text-center transition-all ${statusCounts.MENUNGGU_SPK > 0 ? 'border-amber-500/40 bg-amber-500/10' : 'border-white/10'}`}>
            <span className="text-[10px] font-inter font-bold text-amber-400 uppercase tracking-wider block">0. Menunggu SPK</span>
            <span className="text-2xl font-montserrat font-black text-amber-300 mt-1 block">{statusCounts.MENUNGGU_SPK}</span>
            <span className="text-[10px] text-zinc-400 font-inter">Perlu SPK</span>
          </div>

          <div className="glass-card border border-white/10 rounded-xl p-3 text-center">
            <span className="text-[10px] font-inter font-bold text-zinc-400 uppercase tracking-wider block">1. Antrean</span>
            <span className="text-2xl font-montserrat font-black text-white mt-1 block">{statusCounts.ANTREAN}</span>
            <span className="text-[10px] text-zinc-400 font-inter">SPK Menunggu</span>
          </div>

          <div className="glass-card border border-white/10 rounded-xl p-3 text-center">
            <span className="text-[10px] font-inter font-bold text-zinc-400 uppercase tracking-wider block">2. Setting Film</span>
            <span className="text-2xl font-montserrat font-black text-white mt-1 block">{statusCounts.SETTING_FILM}</span>
            <span className="text-[10px] text-zinc-400 font-inter">Afdruk Screen</span>
          </div>

          <div className="glass-card border border-white/10 rounded-xl p-3 text-center">
            <span className="text-[10px] font-inter font-bold text-zinc-400 uppercase tracking-wider block">3. Sedang Sablon</span>
            <span className="text-2xl font-montserrat font-black text-white mt-1 block">{statusCounts.PROSES_SABLON}</span>
            <span className="text-[10px] text-zinc-400 font-inter">Naik Mesin</span>
          </div>

          <div className="glass-card border border-white/10 rounded-xl p-3 text-center">
            <span className="text-[10px] font-inter font-bold text-zinc-400 uppercase tracking-wider block">4. Finishing</span>
            <span className="text-2xl font-montserrat font-black text-white mt-1 block">{statusCounts.FINISHING}</span>
            <span className="text-[10px] text-zinc-400 font-inter">Kering & QC</span>
          </div>

          <div className="glass-card border border-white/10 rounded-xl p-3 text-center">
            <span className="text-[10px] font-inter font-bold text-zinc-400 uppercase tracking-wider block">5. Siap Ambil</span>
            <span className="text-2xl font-montserrat font-black text-white mt-1 block">{statusCounts.SIAP_AMBIL}</span>
            <span className="text-[10px] text-zinc-400 font-inter">Packing Slop</span>
          </div>

          <div className="glass-card border border-white/10 rounded-xl p-3 text-center">
            <span className="text-[10px] font-inter font-bold text-zinc-400 uppercase tracking-wider block">6. Selesai</span>
            <span className="text-2xl font-montserrat font-black text-white mt-1 block">{statusCounts.SELESAI}</span>
            <span className="text-[10px] text-zinc-400 font-inter">Telah Diambil</span>
          </div>
        </div>
      </div>

      {/* Grid: Pesanan Terbaru & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom 1: Pesanan Sedang Berjalan */}
        <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4 flex flex-col h-full">
          <div className="flex items-center justify-between pb-1 border-b border-white/5">
            <div>
              <h3 className="text-sm font-montserrat font-black text-white">Pesanan Aktif Terbaru</h3>
              <p className="text-xs text-zinc-400 font-inter">Daftar SPK yang sedang dalam tahapan produksi</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-inter font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              Kelola di SPK &rarr;
            </button>
          </div>

          <div className="divide-y divide-white/5 flex-1 overflow-y-auto max-h-[350px] pr-1">
            {activeOrders.slice(0, 5).map((order) => {
              const prodInfo = getProductionStatusLabel(order.productionStatus);

              return (
                <div key={order.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.04] p-3 rounded-xl transition-colors">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white bg-white/10 border border-white/15 px-2 py-0.5 rounded-lg shrink-0">
                        {order.orderNumber}
                      </span>
                      <span className="font-montserrat font-bold text-white text-sm truncate">{order.customerBrand}</span>
                    </div>

                    <div className="text-xs text-zinc-300 font-inter flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>{order.cupProductName}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="font-montserrat font-bold text-white">{formatNumber(order.quantityPcs)} pcs</span>
                      <span className="text-zinc-600">•</span>
                      <span className="inline-flex items-center gap-1 font-inter">
                        <span className="w-2 h-2 rounded-full border border-white/30 shrink-0" style={{ backgroundColor: order.inkHex }} />
                        <span>{order.inkColorName}</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-400 font-inter">
                      Deadline: <strong className="text-white font-medium">{formatDate(order.deadlineDate)}</strong> | Operator: {order.operatorName}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className={`text-[10px] font-inter font-bold px-2 py-1 rounded-lg border ${order.productionStatus === 'MENUNGGU_SPK' ? 'border-amber-500/40 bg-amber-500/20 text-amber-300' : 'border-white/20 bg-white/10 text-white'}`}>
                      {prodInfo.label}
                    </span>
                    <button
                      onClick={() => onSelectOrderToPrint(order)}
                      className="p-1.5 rounded-lg border border-white/15 bg-white/[0.05] hover:bg-white/[0.12] text-zinc-300 hover:text-white transition-colors"
                      title="Cetak SPK / Nota"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    {order.productionStatus === 'MENUNGGU_SPK' ? (
                      <button
                        onClick={() => (onOpenSpkModal ? onOpenSpkModal(order) : onAdvanceOrderStatus(order.id))}
                        className="text-[11px] px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-montserrat font-black rounded-lg transition-colors shadow-xs flex items-center gap-1"
                        title="Buatkan SPK untuk pesanan ini"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Buat SPK</span>
                      </button>
                    ) : (
                      order.productionStatus !== 'SELESAI' && (
                        <button
                          onClick={() => onAdvanceOrderStatus(order.id)}
                          className="text-[11px] px-2.5 py-1 bg-white hover:bg-zinc-200 text-black font-montserrat font-bold rounded-lg transition-colors shadow-xs"
                          title="Majukan ke tahap alur berikutnya"
                        >
                          Lanjut &rarr;
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}

            {activeOrders.length === 0 && (
              <div className="text-center py-8 text-zinc-500 font-inter text-xs">
                Tidak ada pesanan aktif saat ini. Klik tombol "+ Buat Sales Invoice" untuk mulai.
              </div>
            )}
          </div>
        </div>

        {/* Kolom 2: Recent Activity Feed (Displays latest 5 stock movements or order status updates as scrollable list) */}
        <RecentActivityFeed
          movements={movements}
          orders={orders}
          customActivities={customActivities}
          onNavigateTab={onNavigateTab}
          onSelectOrderToPrint={onSelectOrderToPrint}
        />
      </div>

      {/* Baris Bawah: Stok Cup Gudang & Ketersediaan Bahan */}
      <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div>
            <h3 className="text-sm font-montserrat font-black text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-zinc-300" />
              Ketersediaan Stok Cup Gudang
            </h3>
            <p className="text-xs text-zinc-400 font-inter">Ketersediaan bahan baku cup polos & aksesoris lid</p>
          </div>
          <button
            onClick={() => onNavigateTab('stock')}
            className="text-xs font-inter font-semibold text-zinc-300 hover:text-white flex items-center gap-1"
          >
            <span>Semua Stok Gudang</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {cups.slice(0, 4).map((cup) => {
            const isLow = cup.stockPcs <= cup.minStockAlert;
            const percent = Math.min(100, Math.round((cup.stockPcs / (cup.minStockAlert * 3)) * 100));

            return (
              <div key={cup.id} className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] space-y-2 hover:bg-white/[0.06] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-xs font-montserrat font-bold text-white truncate">{cup.name}</h4>
                    <span className="text-[10px] text-zinc-400 font-inter block">
                      {cup.size} • {cup.grammage}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-montserrat font-black px-2 py-0.5 rounded-lg border shrink-0 ${
                      isLow
                        ? 'bg-white text-black border-white'
                        : 'bg-white/10 text-white border-white/20'
                    }`}
                  >
                    {formatNumber(cup.stockPcs)} pcs
                  </span>
                </div>

                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isLow ? 'bg-white shadow-[0_0_8px_white]' : 'bg-zinc-400'
                    }`}
                    style={{ width: `${Math.max(5, percent)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-inter pt-0.5">
                  <span>Min: {formatNumber(cup.minStockAlert)} pcs</span>
                  <button
                    onClick={() => onOpenStockModal(cup)}
                    className="font-inter font-semibold text-white hover:underline cursor-pointer"
                  >
                    + Tambah Stok
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
