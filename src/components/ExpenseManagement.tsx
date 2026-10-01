import React, { useState, useMemo } from 'react';
import { ExpenseCategory, ExpenseItem } from '../types';
import { formatDate, formatRupiah, formatNumber } from '../utils/formatters';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Building,
  Receipt,
  Tag,
  CreditCard,
  UserCheck,
  TrendingDown,
  PieChart as PieChartIcon,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface ExpenseManagementProps {
  expenses: ExpenseItem[];
  onSaveExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
  currentUser?: any;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Bahan Baku & Cat',
  'Listrik & Utilitas',
  'Gaji & Upah Operator',
  'Sewa Tempat & Workshop',
  'Maintenance & Servis Mesin',
  'Packing & Pengiriman',
  'Konsumsi & Operasional',
  'Peralatan & Perlengkapan',
  'Lain-lain',
];

const PAYMENT_METHODS = [
  'Kas Tunai (Petty Cash)',
  'Transfer BCA',
  'Transfer Mandiri',
  'Transfer BRI',
  'Transfer BNI',
  'QRIS Workshop',
  'Kartu Debit / Kredit',
];

export const ExpenseManagement: React.FC<ExpenseManagementProps> = ({
  expenses,
  onSaveExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30_DAYS'>('ALL');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC'>('DATE_DESC');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    date: string;
    category: ExpenseCategory;
    title: string;
    amount: number | '';
    paymentMethod: string;
    recipient: string;
    receiptNo: string;
    notes: string;
    operatorName: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    category: 'Bahan Baku & Cat',
    title: '',
    amount: '',
    paymentMethod: 'Transfer BCA',
    recipient: '',
    receiptNo: '',
    notes: '',
    operatorName: 'Admin Kasir',
  });

  const openAddModal = () => {
    setEditingExpense(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'Bahan Baku & Cat',
      title: '',
      amount: '',
      paymentMethod: 'Transfer BCA',
      recipient: '',
      receiptNo: '',
      notes: '',
      operatorName: 'Admin Kasir',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: ExpenseItem) => {
    setEditingExpense(item);
    setFormData({
      date: item.date,
      category: item.category,
      title: item.title,
      amount: item.amount,
      paymentMethod: item.paymentMethod,
      recipient: item.recipient || '',
      receiptNo: item.receiptNo || '',
      notes: item.notes || '',
      operatorName: item.operatorName || 'Admin Kasir',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || Number(formData.amount) <= 0) return;

    const expenseItem: ExpenseItem = {
      id: editingExpense ? editingExpense.id : `exp-${Date.now()}`,
      date: formData.date,
      category: formData.category,
      title: formData.title.trim(),
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      recipient: formData.recipient.trim() || undefined,
      receiptNo: formData.receiptNo.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      operatorName: formData.operatorName.trim() || undefined,
    };

    onSaveExpense(expenseItem);
    setIsModalOpen(false);
  };

  // Filtered & Sorted Expenses
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return expenses.filter((item) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.title.toLowerCase().includes(q) ||
        (item.recipient && item.recipient.toLowerCase().includes(q)) ||
        (item.receiptNo && item.receiptNo.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      // Category
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;

      // Period
      let matchPeriod = true;
      const itemDate = new Date(item.date);
      if (selectedPeriod === 'THIS_MONTH') {
        matchPeriod =
          itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
      } else if (selectedPeriod === 'LAST_30_DAYS') {
        matchPeriod = itemDate >= thirtyDaysAgo;
      }

      return matchSearch && matchCat && matchPeriod;
    }).sort((a, b) => {
      if (sortBy === 'DATE_DESC') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'DATE_ASC') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'AMOUNT_DESC') return b.amount - a.amount;
      if (sortBy === 'AMOUNT_ASC') return a.amount - b.amount;
      return 0;
    });
  }, [expenses, searchQuery, selectedCategory, selectedPeriod, sortBy]);

  // Financial Metrics
  const metrics = useMemo(() => {
    const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0);

    const now = new Date();
    const thisMonthExpenses = expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const totalThisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Grouping by Category
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    let topCategory = '-';
    let topCategoryAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, amt]) => {
      if (amt > topCategoryAmount) {
        topCategoryAmount = amt;
        topCategory = cat;
      }
    });

    return {
      totalAll,
      totalThisMonth,
      count: expenses.length,
      average: expenses.length > 0 ? Math.round(totalAll / expenses.length) : 0,
      topCategory,
      topCategoryAmount,
      categoryTotals,
    };
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/10 text-white border border-white/10">
              <Wallet className="w-5 h-5 text-rose-400" />
            </span>
            <h1 className="text-xl sm:text-2xl font-montserrat font-black tracking-tight text-white">
              Buku Pengeluaran & Biaya Operasional
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-inter">
            Pencatatan kas keluar workshop, pembelian bahan sablon, utilitas listrik, gaji operator, dan perawatan mesin
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-2xl text-xs font-montserrat font-black shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Pengeluaran Baru</span>
        </button>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Bulan Ini ({new Date().toLocaleString('id-ID', { month: 'long' })})</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-montserrat font-black text-rose-400">
              {formatRupiah(metrics.totalThisMonth)}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Total kas keluar bulan berjalan</div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Semua Pengeluaran</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-montserrat font-black text-white">
              {formatRupiah(metrics.totalAll)}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">{metrics.count} total transaksi tercatat</div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Kategori Terbesar</span>
            <Tag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-2">
            <div className="text-base sm:text-lg font-montserrat font-bold text-white truncate" title={metrics.topCategory}>
              {metrics.topCategory}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              {formatRupiah(metrics.topCategoryAmount)}
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Rata-Rata per Transaksi</span>
            <Building className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-montserrat font-black text-white">
              {formatRupiah(metrics.average)}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Efisiensi pengeluaran kas</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress */}
      <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-montserrat font-bold text-white flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-rose-400" />
            Distribusi Biaya Operasional per Kategori
          </h3>
          <span className="text-[11px] text-zinc-400">Berdasarkan seluruh transaksi</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {EXPENSE_CATEGORIES.map((cat) => {
            const amt = metrics.categoryTotals[cat] || 0;
            const pct = metrics.totalAll > 0 ? Math.round((amt / metrics.totalAll) * 100) : 0;
            return (
              <div
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? 'ALL' : cat)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white/15 border-white/40 shadow-sm'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-zinc-200 truncate pr-2">{cat}</span>
                  <span className="font-mono font-bold text-white">{pct}%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-rose-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, amt > 0 ? 3 : 0)}%` }}
                  />
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  {formatRupiah(amt)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pengeluaran, nomor bukti, atau nama vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-9 pr-4 py-2 rounded-xl text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-input px-3 py-2 rounded-xl text-xs bg-zinc-900 text-white border-white/10"
            >
              <option value="ALL">Semua Kategori</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="glass-input px-3 py-2 rounded-xl text-xs bg-zinc-900 text-white border-white/10"
            >
              <option value="ALL">Semua Periode</option>
              <option value="THIS_MONTH">Bulan Berjalan</option>
              <option value="LAST_30_DAYS">30 Hari Terakhir</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="glass-input px-3 py-2 rounded-xl text-xs bg-zinc-900 text-white border-white/10"
            >
              <option value="DATE_DESC">Tanggal Terbaru</option>
              <option value="DATE_ASC">Tanggal Terlama</option>
              <option value="AMOUNT_DESC">Nominal Terbesar</option>
              <option value="AMOUNT_ASC">Nominal Terkecil</option>
            </select>
          </div>
        </div>

        {selectedCategory !== 'ALL' && (
          <div className="flex items-center gap-2 pt-1 text-xs text-zinc-400">
            <span>Filter Kategori aktif:</span>
            <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg flex items-center gap-1.5 font-medium">
              {selectedCategory}
              <button onClick={() => setSelectedCategory('ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Expenses Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-montserrat font-bold text-white uppercase tracking-wider">
              Daftar Kas Keluar & Nota Biaya ({filteredExpenses.length})
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-rose-400">
            Total: {formatRupiah(filteredExpenses.reduce((s, e) => s + e.amount, 0))}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kategori & Judul Biaya</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4">Penerima / Vendor</th>
                <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-zinc-600 opacity-60" />
                    <p className="font-semibold text-zinc-300">Tidak ada pengeluaran yang cocok</p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Coba ganti filter atau catat pengeluaran baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-zinc-300 whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-[10px] font-medium text-zinc-300 w-fit">
                          {item.category}
                        </span>
                        <span className="font-montserrat font-bold text-white text-xs">
                          {item.title}
                        </span>
                        {item.notes && (
                          <span className="text-[11px] text-zinc-400 line-clamp-1 italic">
                            {item.notes}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                        {item.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-300">
                      <div className="space-y-0.5">
                        <div className="font-medium text-zinc-200">
                          {item.recipient || '-'}
                        </div>
                        {item.receiptNo && (
                          <div className="text-[10px] font-mono text-zinc-500">
                            No. Bukti: {item.receiptNo}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-montserrat font-black text-rose-400 text-sm">
                        {formatRupiah(item.amount)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                          title="Edit Pengeluaran"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus catatan pengeluaran "${item.title}"?`)) {
                              onDeleteExpense(item.id);
                            }
                          }}
                          className="p-1.5 hover:bg-rose-500/20 rounded-lg text-zinc-400 hover:text-rose-400 transition-colors"
                          title="Hapus Pengeluaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat / Edit Pengeluaran */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel border border-white/20 w-full max-w-lg rounded-3xl p-6 shadow-2xl my-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-white/10 text-rose-400 border border-white/10">
                  <Wallet className="w-4 h-4" />
                </span>
                <h3 className="text-base font-montserrat font-bold text-white">
                  {editingExpense ? 'Edit Catatan Pengeluaran' : 'Catat Kas Keluar / Pengeluaran'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-inter">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Tanggal Transaksi *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Kategori Biaya *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs bg-zinc-900 text-white"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Nama / Deskripsi Biaya *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli Tinta PP Hitam 5kg & Reducer"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Nominal Pengeluaran (Rp) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    placeholder="Contoh: 350000"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono font-bold"
                  />
                  {formData.amount && (
                    <div className="text-[11px] text-rose-400 font-mono mt-1">
                      {formatRupiah(Number(formData.amount))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Metode Pembayaran *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs bg-zinc-900 text-white"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Pihak Penerima / Vendor</label>
                  <input
                    type="text"
                    placeholder="Contoh: Toko Grafika Mulia"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">No. Bukti / Nota / Kwitansi</label>
                  <input
                    type="text"
                    placeholder="Contoh: INV-2026-99"
                    value={formData.receiptNo}
                    onChange={(e) => setFormData({ ...formData, receiptNo: e.target.value })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Petugas / Operator PIC</label>
                <input
                  type="text"
                  placeholder="Nama petugas yang mencatat atau membelanjakan"
                  value={formData.operatorName}
                  onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan peruntukan, keperluan shift sablon, dll."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-montserrat font-black shadow-md transition-colors"
                >
                  {editingExpense ? 'Simpan Perubahan' : 'Catat Pengeluaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
