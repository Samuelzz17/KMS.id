import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { CupProduct, CustomerOrder, StockMovement, ExpenseItem, WorkshopAsset } from '../types';
import { formatNumber, formatRupiah } from '../utils/formatters';
import {
  PieChart,
  Download,
  Upload,
  Layers,
  RefreshCw,
  Wallet,
} from 'lucide-react';

interface FinancialReportsProps {
  orders: CustomerOrder[];
  cups: CupProduct[];
  movements: StockMovement[];
  expenses?: ExpenseItem[];
  assets?: WorkshopAsset[];
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
  currentUser?: User | null;
  onSyncToFirestore?: () => void;
  isSyncing?: boolean;
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  orders,
  cups,
  expenses = [],
  assets = [],
  onExportData,
  onImportData,
  onResetData,
  currentUser,
  onSyncToFirestore,
  isSyncing,
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'week' | 'month'>('all');
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  const isWithinFilter = (dateString: string) => {
    if (timeFilter === 'all') return true;
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const now = new Date();
    
    if (timeFilter === 'day') {
      return date.getDate() === now.getDate() && 
             date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear();
    }
    
    if (timeFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return date >= oneWeekAgo && date <= now;
    }
    
    if (timeFilter === 'month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    
    return true;
  };

  const filteredOrders = orders.filter((o) => isWithinFilter(o.createdAt || o.deadlineDate));
  const filteredExpenses = expenses.filter((e) => isWithinFilter(e.date));
  const filteredAssets = assets.filter((a) => isWithinFilter(a.purchaseDate));

  const validOrders = filteredOrders.filter((o) => o.productionStatus !== 'BATAL');

  // Revenue & Cash Flow
  const totalOmset = validOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalCashCollected = validOrders.reduce((sum, o) => sum + o.downPayment, 0);
  const totalReceivables = validOrders.reduce((sum, o) => sum + o.remainingPayment, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAssets = filteredAssets.reduce((sum, a) => sum + (a.purchaseCost * a.quantity), 0);
  const totalExpenseAndAsset = totalExpenses + totalAssets;

  // Estimasi Modal & Laba
  let totalCupCost = 0;
  validOrders.forEach((o) => {
    const cup = cups.find((c) => c.id === o.cupProductId);
    const hpp = cup ? cup.costPricePerPcs : o.cupPricePerPcs * 0.75;
    totalCupCost += hpp * o.quantityPcs;
  });

  const estimatedInkAndLaborCost = validOrders.reduce((sum, o) => sum + 45 * o.quantityPcs, 0);
  const totalHPP = totalCupCost + estimatedInkAndLaborCost;
  const grossProfit = totalOmset - totalHPP;
  const netProfit = grossProfit - totalExpenseAndAsset;
  const profitMarginPercent = totalOmset > 0 ? Math.round((netProfit / totalOmset) * 100) : 0;

  // Total Reject Sablon
  const totalPrintedCups = validOrders.reduce((sum, o) => sum + o.quantityPcs, 0);
  const totalRejectCups = validOrders.reduce((sum, o) => sum + o.rejectPcs, 0);
  const successRate = totalPrintedCups > 0
    ? (((totalPrintedCups - totalRejectCups) / totalPrintedCups) * 100).toFixed(1)
    : '100';

  // Rekap Cup Terlaris
  const cupPopularity: Record<string, { name: string; totalQty: number; totalRev: number }> = {};
  validOrders.forEach((o) => {
    if (!cupPopularity[o.cupProductName]) {
      cupPopularity[o.cupProductName] = {
        name: o.cupProductName,
        totalQty: 0,
        totalRev: 0,
      };
    }
    cupPopularity[o.cupProductName].totalQty += o.quantityPcs;
    cupPopularity[o.cupProductName].totalRev += o.totalPrice;
  });

  const sortedPopularCups = Object.values(cupPopularity).sort((a, b) => b.totalQty - a.totalQty);

  // Grouping Logic for Table
  type GroupedData = {
    period: string;
    revenue: number;
    cogs: number;
    expenseAndAsset: number;
    sortKey: number;
  };

  const groupedMap = new Map<string, GroupedData>();

  const getGroupKey = (dateStr: string) => {
    if (!dateStr) return { key: 'Unknown', sortKey: 0 };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { key: 'Unknown', sortKey: 0 };
    
    if (groupBy === 'day') {
      return { 
        key: d.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }),
        sortKey: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      };
    }
    if (groupBy === 'week') {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
      const monday = new Date(date.setDate(diff));
      monday.setHours(0,0,0,0);
      return {
        key: `Minggu ${monday.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`,
        sortKey: monday.getTime()
      };
    }
    if (groupBy === 'month') {
      return {
        key: d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }),
        sortKey: new Date(d.getFullYear(), d.getMonth(), 1).getTime()
      };
    }
    return { key: 'Unknown', sortKey: 0 };
  };

  const addToGroup = (dateStr: string, type: 'revenue' | 'cogs' | 'expenseAndAsset', amount: number) => {
    const { key, sortKey } = getGroupKey(dateStr);
    if (!groupedMap.has(key)) {
      groupedMap.set(key, { period: key, revenue: 0, cogs: 0, expenseAndAsset: 0, sortKey });
    }
    const data = groupedMap.get(key)!;
    data[type] += amount;
  };

  validOrders.forEach(o => {
    addToGroup(o.createdAt || o.deadlineDate, 'revenue', o.totalPrice);
    const cup = cups.find((c) => c.id === o.cupProductId);
    const hpp = cup ? cup.costPricePerPcs : o.cupPricePerPcs * 0.75;
    addToGroup(o.createdAt || o.deadlineDate, 'cogs', (hpp * o.quantityPcs) + (45 * o.quantityPcs));
  });

  filteredExpenses.forEach(e => {
    addToGroup(e.date, 'expenseAndAsset', e.amount);
  });

  filteredAssets.forEach(a => {
    addToGroup(a.purchaseDate, 'expenseAndAsset', a.purchaseCost * a.quantity);
  });

  const tableRows = Array.from(groupedMap.values()).sort((a, b) => b.sortKey - a.sortKey);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-montserrat font-black text-white tracking-tight">
            Laporan Keuangan & Analisis Produksi
          </h2>
          <p className="text-xs text-zinc-400 font-inter mt-0.5">
            Analisis omset penjualan, estimasi laba bersih, kas diterima, dan performa cetak per varian cup
          </p>
        </div>

        {/* Data Backup & Cloud Sync */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="px-3 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-inter font-medium focus:outline-none"
          >
            <option value="all" className="bg-zinc-800">All Time (Sepanjang Waktu)</option>
            <option value="day" className="bg-zinc-800">Hari Ini (Day)</option>
            <option value="week" className="bg-zinc-800">Minggu Ini (7 Hari Terakhir)</option>
            <option value="month" className="bg-zinc-800">Bulan Ini (Month)</option>
          </select>

          {currentUser && onSyncToFirestore && (
            <button
              onClick={onSyncToFirestore}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-montserrat font-bold transition-all disabled:opacity-50"
              title="Sinkronisasi seluruh data lokal ke cloud Firebase Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron ke Cloud'}</span>
            </button>
          )}

          <button
            onClick={onExportData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-xl text-xs font-inter font-medium border border-white/10 transition-colors"
            title="Download file cadangan JSON"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Backup Data</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-white rounded-xl text-xs font-inter font-medium border border-white/10 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-zinc-400" />
            <span>Restore Data</span>
            <input type="file" accept=".json" onChange={onImportData} className="hidden" />
          </label>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-white/10 min-w-0">
          <span className="text-[10px] sm:text-[11px] font-inter font-bold text-zinc-400 uppercase tracking-wider block leading-tight">
            Total Omset Penjualan
          </span>
          <div className="text-base sm:text-lg xl:text-xl font-montserrat font-black text-white mt-1.5 break-words">
            {formatRupiah(totalOmset)}
          </div>
          <span className="text-[10px] sm:text-xs text-zinc-400 font-inter mt-1 block">
            Dari {validOrders.length} pesanan aktif/selesai
          </span>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-white/10 min-w-0">
          <span className="text-[10px] sm:text-[11px] font-inter font-bold text-zinc-400 uppercase tracking-wider block leading-tight">
            Pengeluaran & Aset
          </span>
          <div className="text-base sm:text-lg xl:text-xl font-montserrat font-black text-rose-400 mt-1.5 break-words">
            {formatRupiah(totalExpenseAndAsset)}
          </div>
          <span className="text-[10px] sm:text-xs text-zinc-400 font-inter mt-1 block">
            {filteredExpenses.length} pengeluaran, {filteredAssets.length} aset
          </span>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-white/20 bg-white/[0.05] min-w-0">
          <span className="text-[10px] sm:text-[11px] font-inter font-bold text-white uppercase tracking-wider block leading-tight">
            Estimasi Laba Bersih
          </span>
          <div className="text-base sm:text-lg xl:text-xl font-montserrat font-black text-white mt-1.5 break-words">
            {formatRupiah(netProfit)}
          </div>
          <span className="text-[10px] sm:text-xs text-zinc-300 font-inter font-medium mt-1 block">
            Margin Keuntungan ~{profitMarginPercent}%
          </span>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-white/10 min-w-0">
          <span className="text-[10px] sm:text-[11px] font-inter font-bold text-zinc-400 uppercase tracking-wider block leading-tight">
            Kas Masuk (Diterima)
          </span>
          <div className="text-base sm:text-lg xl:text-xl font-montserrat font-black text-white mt-1.5 break-words">
            {formatRupiah(totalCashCollected)}
          </div>
          <span className="text-[10px] sm:text-xs text-zinc-400 font-inter mt-1 block">
            Piutang: <span className="text-white font-semibold">{formatRupiah(totalReceivables)}</span>
          </span>
        </div>

        <div className="glass-card p-4 sm:p-5 rounded-2xl border border-white/10 min-w-0">
          <span className="text-[10px] sm:text-[11px] font-inter font-bold text-zinc-400 uppercase tracking-wider block leading-tight">
            Tingkat Kelulusan QC
          </span>
          <div className="text-base sm:text-lg xl:text-xl font-montserrat font-black text-white mt-1.5 break-words">
            {successRate}%
          </div>
          <span className="text-[10px] sm:text-xs text-zinc-400 font-inter mt-1 block">
            Reject: {totalRejectCups} pcs ({((totalRejectCups / (totalPrintedCups || 1)) * 100).toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Grid: Breakdown Modal & Laba + Cup Terpopuler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown Biaya Produksi */}
        <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4">
          <h3 className="text-sm font-montserrat font-black text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-zinc-300" />
            Rincian Estimasi Biaya & Struktur Keuntungan
          </h3>

          <div className="space-y-2.5 text-xs font-inter">
            <div className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-white/10">
              <div>
                <span className="font-montserrat font-bold text-white block">Total Omset Kotor</span>
                <span className="text-[11px] text-zinc-400">Nilai total faktur seluruh pesanan</span>
              </div>
              <span className="text-sm font-montserrat font-black text-white">{formatRupiah(totalOmset)}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-white/10">
              <div>
                <span className="font-montserrat font-bold text-zinc-300 block">HPP Pembelian Cup Polos</span>
                <span className="text-[11px] text-zinc-400">Modal beli cup ke pabrik distributor</span>
              </div>
              <span className="text-sm font-montserrat font-bold text-zinc-300">- {formatRupiah(totalCupCost)}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white/[0.03] rounded-xl border border-white/10">
              <div>
                <span className="font-montserrat font-bold text-zinc-300 block">Estimasi Bahan Tinta & Operasional</span>
                <span className="text-[11px] text-zinc-400">Tinta PP, thinner M4, afdruk, listrik (~Rp 45/cup)</span>
              </div>
              <span className="text-sm font-montserrat font-bold text-zinc-300">- {formatRupiah(estimatedInkAndLaborCost)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20 text-sm font-black">
              <span className="text-white font-montserrat tracking-tight">ESTIMASI LABA BERSIH (EBIT)</span>
              <span className="text-white font-montserrat font-black text-base">{formatRupiah(netProfit)}</span>
            </div>
          </div>
        </div>

        {/* Cup Paling Laris */}
        <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4">
          <h3 className="text-sm font-montserrat font-black text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-300" />
            Peringkat Varian Cup Paling Banyak Dipesan
          </h3>

          <div className="divide-y divide-white/5 text-xs font-inter">
            {sortedPopularCups.map((item, index) => {
              const share = totalPrintedCups > 0 ? Math.round((item.totalQty / totalPrintedCups) * 100) : 0;

              return (
                <div key={item.name} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white/10 border border-white/20 font-montserrat font-black text-white flex items-center justify-center text-[11px]">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-montserrat font-bold text-white">{item.name}</h4>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Omset: {formatRupiah(item.totalRev)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-montserrat font-black text-white text-sm">
                      {formatNumber(item.totalQty)} pcs
                    </div>
                    <div className="text-[10px] text-zinc-400 font-inter font-medium">
                      {share}% total volume
                    </div>
                  </div>
                </div>
              );
            })}

            {sortedPopularCups.length === 0 && (
              <div className="text-center py-6 text-zinc-500 font-inter">
                Belum ada data penjualan tercatat.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Ringkasan Keuangan Laba Rugi (Breakdown) */}
      <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-montserrat font-black text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-zinc-300" />
            Tabel Rincian Laba Rugi
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-inter">Tampilkan per:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white/5 border border-white/10 text-white rounded-lg text-xs font-inter focus:outline-none"
            >
              <option value="day" className="bg-zinc-800">Hari (Day)</option>
              <option value="week" className="bg-zinc-800">Minggu (Week)</option>
              <option value="month" className="bg-zinc-800">Bulan (Month)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-inter font-bold text-zinc-400 uppercase tracking-wider">
                <th className="pb-3 pr-4">Periode</th>
                <th className="pb-3 text-right pr-4">Revenue</th>
                <th className="pb-3 text-right pr-4">COGS</th>
                <th className="pb-3 text-right pr-4">Gross Profit</th>
                <th className="pb-3 text-right pr-4">Expense & Asset</th>
                <th className="pb-3 text-right">Net Profit</th>
              </tr>
            </thead>
            <tbody className="text-sm font-inter divide-y divide-white/5">
              {tableRows.length > 0 ? (
                tableRows.map((row, idx) => {
                  const gross = row.revenue - row.cogs;
                  const net = gross - row.expenseAndAsset;
                  return (
                    <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 font-semibold text-white whitespace-nowrap">{row.period}</td>
                      <td className="py-3 text-right pr-4 text-white font-montserrat">{formatRupiah(row.revenue)}</td>
                      <td className="py-3 text-right pr-4 text-rose-400 font-montserrat">- {formatRupiah(row.cogs)}</td>
                      <td className="py-3 text-right pr-4 text-emerald-400 font-montserrat font-bold">{formatRupiah(gross)}</td>
                      <td className="py-3 text-right pr-4 text-rose-400 font-montserrat">- {formatRupiah(row.expenseAndAsset)}</td>
                      <td className={`py-3 text-right font-montserrat font-black ${net >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                        {formatRupiah(net)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 text-xs">Belum ada data untuk periode ini.</td>
                </tr>
              )}
            </tbody>
            {tableRows.length > 0 && (
              <tfoot className="border-t-2 border-white/10">
                <tr className="bg-white/[0.02]">
                  <td className="py-3 pr-4 font-black text-white">TOTAL</td>
                  <td className="py-3 text-right pr-4 text-white font-montserrat font-black">{formatRupiah(totalOmset)}</td>
                  <td className="py-3 text-right pr-4 text-rose-400 font-montserrat font-black">- {formatRupiah(totalHPP)}</td>
                  <td className="py-3 text-right pr-4 text-emerald-400 font-montserrat font-black">{formatRupiah(grossProfit)}</td>
                  <td className="py-3 text-right pr-4 text-rose-400 font-montserrat font-black">- {formatRupiah(totalExpenseAndAsset)}</td>
                  <td className={`py-3 text-right font-montserrat font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                    {formatRupiah(netProfit)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="glass-card border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-inter">
        <div>
          <span className="font-montserrat font-bold text-white block">Reset Data ke Sample Default</span>
          <span className="text-zinc-400">
            Kembalikan seluruh data pesanan dan stok ke kondisi awal contoh workshop KMS.id.
          </span>
        </div>
        <button
          onClick={() => {
            if (confirm('Yakin ingin mereset seluruh data pesanan dan inventaris ke data awal KMS.id?')) {
              onResetData();
            }
          }}
          className="px-4 py-2 rounded-xl text-white bg-white/5 border border-white/20 hover:bg-white/15 font-montserrat font-bold text-xs transition-colors self-start sm:self-auto"
        >
          Reset Data Workshop
        </button>
      </div>
    </div>
  );
};
