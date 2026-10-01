import React, { useState, useMemo } from 'react';
import {
  ConsumableCategory,
  ConsumableItem,
  ConsumableMovement,
  ConsumableMutationType,
  ConsumableUnit,
  CustomerOrder,
} from '../types';
import { formatDate, formatRupiah, formatNumber } from '../utils/formatters';
import {
  FlaskConical,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  History,
  Package,
  Layers,
  MapPin,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  X,
  Boxes,
} from 'lucide-react';

interface ConsumablesInventoryProps {
  consumables: ConsumableItem[];
  movements: ConsumableMovement[];
  onSaveConsumable: (item: ConsumableItem) => void;
  onDeleteConsumable: (id: string) => void;
  onSaveMovement: (movement: ConsumableMovement, newStock: number) => void;
  currentUser?: any;
  orders?: CustomerOrder[];
}

const CONSUMABLE_CATEGORIES: ConsumableCategory[] = [
  'Obat Afdruk & Sensitizer',
  'Tinta & Cat Sablon',
  'Pelarut & Thinner',
  'Pembersih & Reducer',
  'Screen & Perlengkapan',
  'Bahan Packing & Lakban',
  'Perlengkapan Workshop & APD',
];

const CONSUMABLE_UNITS: ConsumableUnit[] = [
  'kg',
  'liter',
  'botol',
  'kaleng',
  'roll',
  'box',
  'pack',
  'lembar',
  'pcs',
];

export const ConsumablesInventory: React.FC<ConsumablesInventoryProps> = ({
  consumables,
  movements,
  onSaveConsumable,
  onDeleteConsumable,
  onSaveMovement,
  currentUser,
  orders = [],
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'STOCK' | 'LOG'>('STOCK');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modal 1: Add / Edit Consumable Item
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConsumableItem | null>(null);
  const [itemFormData, setItemFormData] = useState<{
    code: string;
    name: string;
    category: ConsumableCategory;
    unit: ConsumableUnit;
    stock: number | '';
    minStockAlert: number | '';
    costPerUnit: number | '';
    supplier: string;
    location: string;
    notes: string;
  }>({
    code: '',
    name: '',
    category: 'Tinta & Cat Sablon',
    unit: 'kg',
    stock: '',
    minStockAlert: '',
    costPerUnit: '',
    supplier: '',
    location: '',
    notes: '',
  });

  // Modal 2: Record Movement (IN / OUT)
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementFormData, setMovementFormData] = useState<{
    consumableId: string;
    type: ConsumableMutationType;
    quantity: number | '';
    reference: string;
    notes: string;
    operatorName: string;
  }>({
    consumableId: '',
    type: 'OUT',
    quantity: '',
    reference: '',
    notes: '',
    operatorName: 'Agus Subekti',
  });

  const openAddItemModal = () => {
    setEditingItem(null);
    const nextCode = `MAT-${Date.now().toString().slice(-4)}`;
    setItemFormData({
      code: nextCode,
      name: '',
      category: 'Tinta & Cat Sablon',
      unit: 'kg',
      stock: '',
      minStockAlert: '',
      costPerUnit: '',
      supplier: '',
      location: '',
      notes: '',
    });
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: ConsumableItem) => {
    setEditingItem(item);
    setItemFormData({
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.unit,
      stock: item.stock,
      minStockAlert: item.minStockAlert,
      costPerUnit: item.costPerUnit,
      supplier: item.supplier || '',
      location: item.location || '',
      notes: item.notes || '',
    });
    setIsItemModalOpen(true);
  };

  const openRecordMovementModal = (initialItemId?: string, defaultType: ConsumableMutationType = 'OUT') => {
    const targetId = initialItemId || (consumables.length > 0 ? consumables[0].id : '');
    setMovementFormData({
      consumableId: targetId,
      type: defaultType,
      quantity: '',
      reference: defaultType === 'OUT' ? 'SPK-2026-' : 'NOTA-BELI-',
      notes: defaultType === 'OUT' ? 'Pemakaian sablon rutin' : 'Restock pembelian bahan',
      operatorName: 'Agus Subekti',
    });
    setIsMovementModalOpen(true);
  };

  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.name || !itemFormData.code) return;

    const item: ConsumableItem = {
      id: editingItem ? editingItem.id : `csm-${Date.now()}`,
      code: itemFormData.code.trim().toUpperCase(),
      name: itemFormData.name.trim(),
      category: itemFormData.category,
      unit: itemFormData.unit,
      stock: Number(itemFormData.stock) || 0,
      minStockAlert: Number(itemFormData.minStockAlert) || 0,
      costPerUnit: Number(itemFormData.costPerUnit) || 0,
      supplier: itemFormData.supplier.trim() || undefined,
      location: itemFormData.location.trim() || undefined,
      notes: itemFormData.notes.trim() || undefined,
      lastRestockDate: editingItem ? editingItem.lastRestockDate : new Date().toISOString().split('T')[0],
    };

    onSaveConsumable(item);
    setIsItemModalOpen(false);
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementFormData.consumableId || !movementFormData.quantity || Number(movementFormData.quantity) <= 0) {
      return;
    }

    const targetItem = consumables.find((c) => c.id === movementFormData.consumableId);
    if (!targetItem) return;

    const qty = Number(movementFormData.quantity);
    let newStock = targetItem.stock;

    if (movementFormData.type === 'OUT') {
      newStock = Math.max(0, targetItem.stock - qty);
    } else {
      newStock = targetItem.stock + qty;
    }

    const mov: ConsumableMovement = {
      id: `csm-mov-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      consumableId: targetItem.id,
      consumableName: targetItem.name,
      type: movementFormData.type,
      quantity: qty,
      unit: targetItem.unit,
      reference: movementFormData.reference.trim() || undefined,
      notes: movementFormData.notes.trim() || (movementFormData.type === 'OUT' ? 'Pemakaian produksi' : 'Restock bahan'),
      operatorName: movementFormData.operatorName.trim() || undefined,
    };

    onSaveMovement(mov, newStock);
    setIsMovementModalOpen(false);
  };

  // Filtered Consumables
  const filteredConsumables = useMemo(() => {
    return consumables.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.supplier && item.supplier.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q));

      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchLowStock = !onlyLowStock || item.stock <= item.minStockAlert;

      return matchSearch && matchCat && matchLowStock;
    });
  }, [consumables, searchQuery, selectedCategory, onlyLowStock]);

  // Metrics
  const metrics = useMemo(() => {
    const totalItems = consumables.length;
    const lowStockItems = consumables.filter((c) => c.stock <= c.minStockAlert);
    const totalEstimatedValue = consumables.reduce((sum, c) => sum + c.stock * c.costPerUnit, 0);
    const totalMovementsCount = movements.length;

    return {
      totalItems,
      lowStockCount: lowStockItems.length,
      totalEstimatedValue,
      totalMovementsCount,
    };
  }, [consumables, movements]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/10 text-white border border-white/10">
              <FlaskConical className="w-5 h-5 text-emerald-400" />
            </span>
            <h1 className="text-xl sm:text-2xl font-montserrat font-black tracking-tight text-white">
              Inventory Bahan Operasional (Afdruk, Cat & Kimia)
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-inter">
            Pengelolaan stok emulsi afdruk, tinta sablon PP glossy, thinner retarder, kaporit stripper, lakban kardus, dan sarung tangan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openRecordMovementModal(undefined, 'OUT')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-2xl text-xs font-medium transition-all"
            title="Catat pemakaian bahan untuk proses sablon"
          >
            <ArrowDownLeft className="w-4 h-4 text-amber-400" />
            <span>Catat Pakai</span>
          </button>

          <button
            onClick={() => openRecordMovementModal(undefined, 'IN')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-2xl text-xs font-medium transition-all"
            title="Catat restock / pembelian bahan masuk"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>Restock Beli</span>
          </button>

          <button
            onClick={openAddItemModal}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-2xl text-xs font-montserrat font-black shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Bahan Baru</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Jenis Bahan</span>
            <Boxes className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-montserrat font-black text-white">
              {metrics.totalItems} <span className="text-xs font-normal text-zinc-400">katalog</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Bahan kimia, tinta, & packing</div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Bahan Menipis</span>
            <AlertTriangle className={`w-4 h-4 ${metrics.lowStockCount > 0 ? 'text-rose-400' : 'text-zinc-500'}`} />
          </div>
          <div className="my-2">
            <div
              className={`text-xl sm:text-2xl font-montserrat font-black ${
                metrics.lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {metrics.lowStockCount} <span className="text-xs font-normal text-zinc-400">bahan</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              {metrics.lowStockCount > 0 ? 'Perlu segera re-order' : 'Semua stok dalam batas aman'}
            </div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Estimasi Nilai Stok</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-montserrat font-black text-white">
              {formatRupiah(metrics.totalEstimatedValue)}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Valuasi stok bahan di workshop</div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Log Mutasi Tercatat</span>
            <History className="w-4 h-4 text-purple-400" />
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-montserrat font-black text-white">
              {metrics.totalMovementsCount} <span className="text-xs font-normal text-zinc-400">riwayat</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Keluar/masuk pemakaian workshop</div>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('STOCK')}
            className={`px-4 py-2 rounded-xl text-xs font-montserrat font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'STOCK'
                ? 'bg-white text-black shadow-xs'
                : 'text-zinc-400 hover:text-white bg-white/5'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            Katalog & Stok Bahan ({filteredConsumables.length})
          </button>
          <button
            onClick={() => setActiveSubTab('LOG')}
            className={`px-4 py-2 rounded-xl text-xs font-montserrat font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'LOG'
                ? 'bg-white text-black shadow-xs'
                : 'text-zinc-400 hover:text-white bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Riwayat Pemakaian & Mutasi ({movements.length})
          </button>
        </div>

        {activeSubTab === 'STOCK' && (
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              onlyLowStock
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Hanya Stok Menipis</span>
          </button>
        )}
      </div>

      {/* SUB-TAB 1: STOCK & CATALOG */}
      {activeSubTab === 'STOCK' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama bahan, kode, atau supplier..."
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

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-input px-3 py-2 rounded-xl text-xs bg-zinc-900 text-white border-white/10 w-full sm:w-auto"
            >
              <option value="ALL">Semua Kategori Bahan</option>
              {CONSUMABLE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Kode & Bahan Operasional</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Lokasi & Supplier</th>
                    <th className="py-3.5 px-4 text-center">Stok Saat Ini</th>
                    <th className="py-3.5 px-4 text-right">Harga Satuan</th>
                    <th className="py-3.5 px-4 text-right">Nilai Total</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredConsumables.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-400">
                        <FlaskConical className="w-8 h-8 mx-auto mb-2 text-zinc-600 opacity-60" />
                        <p className="font-semibold text-zinc-300">Tidak ada bahan operasional yang cocok</p>
                        <p className="text-[11px] text-zinc-500 mt-1">Coba sesuaikan filter atau tambah katalog baru.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredConsumables.map((item) => {
                      const isLow = item.stock <= item.minStockAlert;
                      return (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-[10px] text-zinc-400 block">{item.code}</span>
                            <span className="font-montserrat font-bold text-white text-xs block">
                              {item.name}
                            </span>
                            {item.notes && (
                              <span className="text-[10px] text-zinc-400 italic block line-clamp-1">
                                {item.notes}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-300">{item.category}</td>
                          <td className="py-3.5 px-4 text-zinc-300">
                            <div>{item.location || '-'}</div>
                            {item.supplier && (
                              <div className="text-[10px] text-zinc-500 font-medium">
                                Toko: {item.supplier}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`font-mono font-bold text-sm ${
                                isLow ? 'text-rose-400 font-black' : 'text-white'
                              }`}
                            >
                              {item.stock} <span className="text-xs font-normal text-zinc-400">{item.unit}</span>
                            </span>
                            <div className="text-[10px] text-zinc-500">Min: {item.minStockAlert} {item.unit}</div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-zinc-300">
                            {formatRupiah(item.costPerUnit)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                            {formatRupiah(item.stock * item.costPerUnit)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {isLow ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3" />
                                Menipis
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium">
                                <CheckCircle2 className="w-3 h-3" />
                                Aman
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openRecordMovementModal(item.id, 'OUT')}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-amber-400 hover:text-amber-300 transition-colors"
                                title="Catat Pemakaian Bahan"
                              >
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openRecordMovementModal(item.id, 'IN')}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors"
                                title="Restock Masuk"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditItemModal(item)}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                title="Edit Bahan"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus katalog bahan "${item.name}"?`)) {
                                    onDeleteConsumable(item.id);
                                  }
                                }}
                                className="p-1.5 hover:bg-rose-500/20 rounded-lg text-zinc-400 hover:text-rose-400 transition-colors"
                                title="Hapus Bahan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LOG MUTASI PEMAKAIAN */}
      {activeSubTab === 'LOG' && (
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-montserrat font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-400" />
              Riwayat Mutasi Pemakaian & Restock ({movements.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Nama Bahan</th>
                  <th className="py-3 px-4">Jenis Mutasi</th>
                  <th className="py-3 px-4 text-center">Jumlah</th>
                  <th className="py-3 px-4">No. Referensi / SPK</th>
                  <th className="py-3 px-4">Petugas / Operator</th>
                  <th className="py-3 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      Belum ada riwayat mutasi bahan
                    </td>
                  </tr>
                ) : (
                  movements.map((mov) => {
                    const isOut = mov.type === 'OUT';
                    return (
                      <tr key={mov.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-zinc-300 whitespace-nowrap">
                          {formatDate(mov.date)}
                        </td>
                        <td className="py-3.5 px-4 font-montserrat font-bold text-white">
                          {mov.consumableName}
                        </td>
                        <td className="py-3.5 px-4">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                              <ArrowDownLeft className="w-3 h-3" />
                              Pemakaian Keluar
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                              <ArrowUpRight className="w-3 h-3" />
                              Restock Masuk
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                          {isOut ? `-${mov.quantity}` : `+${mov.quantity}`} {mov.unit}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-300">
                          {mov.reference || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-300">
                          {mov.operatorName || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400">
                          {mov.notes}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Add / Edit Consumable */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel border border-white/20 w-full max-w-lg rounded-3xl p-6 shadow-2xl my-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-white/10 text-emerald-400 border border-white/10">
                  <FlaskConical className="w-4 h-4" />
                </span>
                <h3 className="text-base font-montserrat font-bold text-white">
                  {editingItem ? 'Edit Katalog Bahan' : 'Tambah Bahan Operasional Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleItemSubmit} className="space-y-4 text-xs font-inter">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Kode Bahan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MAT-CAT-01"
                    value={itemFormData.code}
                    onChange={(e) => setItemFormData({ ...itemFormData, code: e.target.value })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Kategori Bahan *</label>
                  <select
                    value={itemFormData.category}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, category: e.target.value as any })
                    }
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs bg-zinc-900 text-white"
                  >
                    {CONSUMABLE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Nama Bahan / Merk *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Tinta Sablon PP Hitam Solid KMS-Black"
                  value={itemFormData.name}
                  onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Satuan Ukuran *</label>
                  <select
                    value={itemFormData.unit}
                    onChange={(e) =>
                      setItemFormData({ ...itemFormData, unit: e.target.value as any })
                    }
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs bg-zinc-900 text-white"
                  >
                    {CONSUMABLE_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Stok Awal *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    placeholder="Contoh: 5.0"
                    value={itemFormData.stock}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        stock: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Batas Minimal Alert *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    placeholder="Contoh: 2.0"
                    value={itemFormData.minStockAlert}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        minStockAlert: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Harga Modal Satuan (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    placeholder="Contoh: 125000"
                    value={itemFormData.costPerUnit}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        costPerUnit: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono font-bold"
                  />
                  {itemFormData.costPerUnit !== '' && (
                    <div className="text-[11px] text-emerald-400 font-mono mt-1">
                      {formatRupiah(Number(itemFormData.costPerUnit))} / {itemFormData.unit}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Supplier / Toko Beli</label>
                  <input
                    type="text"
                    placeholder="Contoh: CV Warna Grafika Perkasa"
                    value={itemFormData.supplier}
                    onChange={(e) => setItemFormData({ ...itemFormData, supplier: e.target.value })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Lokasi Penyimpanan di Workshop</label>
                <input
                  type="text"
                  placeholder="Contoh: Rak Tinta Atas, Lemari Gelap Afdruk, Bak Cuci"
                  value={itemFormData.location}
                  onChange={(e) => setItemFormData({ ...itemFormData, location: e.target.value })}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Catatan / Aturan Pemakaian</label>
                <textarea
                  rows={2}
                  placeholder="Perbandingan campur thinner, anjuran suhu penyimpanan, dll."
                  value={itemFormData.notes}
                  onChange={(e) => setItemFormData({ ...itemFormData, notes: e.target.value })}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-montserrat font-black shadow-md transition-colors"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Simpan Bahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Movement (IN / OUT) */}
      {isMovementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel border border-white/20 w-full max-w-md rounded-3xl p-6 shadow-2xl my-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`p-2 rounded-xl border ${
                    movementFormData.type === 'OUT'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {movementFormData.type === 'OUT' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </span>
                <h3 className="text-base font-montserrat font-bold text-white">
                  {movementFormData.type === 'OUT' ? 'Catat Pemakaian Produksi' : 'Restock / Beli Bahan Masuk'}
                </h3>
              </div>
              <button
                onClick={() => setIsMovementModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMovementSubmit} className="space-y-4 text-xs font-inter">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Jenis Mutasi *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementFormData({ ...movementFormData, type: 'OUT' })}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-montserrat font-bold text-xs transition-all ${
                      movementFormData.type === 'OUT'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    Pakai (Keluar)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementFormData({ ...movementFormData, type: 'IN' })}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-montserrat font-bold text-xs transition-all ${
                      movementFormData.type === 'IN'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Beli (Masuk)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Pilih Bahan *</label>
                <select
                  value={movementFormData.consumableId}
                  onChange={(e) =>
                    setMovementFormData({ ...movementFormData, consumableId: e.target.value })
                  }
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs bg-zinc-900 text-white"
                >
                  {consumables.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Sisa: {c.stock} {c.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">
                  Jumlah {movementFormData.type === 'OUT' ? 'Digunakan' : 'Ditambahkan'} *
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.01"
                  required
                  placeholder="Contoh: 0.5"
                  value={movementFormData.quantity}
                  onChange={(e) =>
                    setMovementFormData({
                      ...movementFormData,
                      quantity: e.target.value ? Number(e.target.value) : '',
                    })
                  }
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">No. Referensi (SPK / Nota Beli)</label>
                {movementFormData.type === 'OUT' ? (
                  <select
                    value={movementFormData.reference}
                    onChange={(e) =>
                      setMovementFormData({ ...movementFormData, reference: e.target.value })
                    }
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono bg-zinc-900 text-white"
                  >
                    <option value="">Pilih SPK Aktif...</option>
                    {orders
                      .filter((o) => ['SETTING_FILM', 'PROSES_SABLON', 'FINISHING'].includes(o.productionStatus))
                      .map((o) => (
                        <option key={o.id} value={o.orderNumber}>
                          {o.orderNumber} - {o.customerBrand} ({o.productionStatus.replace('_', ' ')})
                        </option>
                      ))}
                    <option value="LAINNYA">Lainnya...</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Contoh: INV-SUPPLIER-88"
                    value={movementFormData.reference}
                    onChange={(e) =>
                      setMovementFormData({ ...movementFormData, reference: e.target.value })
                    }
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                  />
                )}
                {movementFormData.type === 'OUT' && movementFormData.reference === 'LAINNYA' && (
                  <input
                    type="text"
                    placeholder="Ketik referensi lainnya..."
                    value={movementFormData.notes}
                    onChange={(e) => setMovementFormData({ ...movementFormData, notes: e.target.value })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono mt-2"
                  />
                )}
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Petugas / Operator PIC</label>
                <input
                  type="text"
                  placeholder="Nama operator yang menggunakan"
                  value={movementFormData.operatorName}
                  onChange={(e) =>
                    setMovementFormData({ ...movementFormData, operatorName: e.target.value })
                  }
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Keterangan Tambahan</label>
                <input
                  type="text"
                  placeholder="Contoh: Cetak cup boba 2.000 pcs"
                  value={movementFormData.notes}
                  onChange={(e) =>
                    setMovementFormData({ ...movementFormData, notes: e.target.value })
                  }
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-montserrat font-black shadow-md transition-colors"
                >
                  Simpan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
