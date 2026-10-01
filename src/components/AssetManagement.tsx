import React, { useState, useMemo } from 'react';
import { AssetCategory, AssetCondition, WorkshopAsset } from '../types';
import { formatDate, formatRupiah, formatNumber } from '../utils/formatters';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Building2,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Layers,
  MapPin,
  TrendingUp,
  Cpu,
  X,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';

interface AssetManagementProps {
  assets: WorkshopAsset[];
  onSaveAsset: (asset: WorkshopAsset) => void;
  onDeleteAsset: (id: string) => void;
  currentUser?: any;
}

const ASSET_CATEGORIES: AssetCategory[] = [
  'Mesin Sablon',
  'Peralatan Afdruk',
  'Penunjang Produksi',
  'Elektronik & IT',
  'Fasilitas & Perabot',
];

const ASSET_CONDITIONS: AssetCondition[] = [
  'Sangat Baik',
  'Baik (Beroperasi)',
  'Perlu Perawatan',
  'Rusak / Afkir',
];

export const AssetManagement: React.FC<AssetManagementProps> = ({
  assets,
  onSaveAsset,
  onDeleteAsset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<WorkshopAsset | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    category: AssetCategory;
    purchaseDate: string;
    purchaseCost: number | '';
    quantity: number;
    condition: AssetCondition;
    usefulLifeYears: number;
    location: string;
    notes: string;
  }>({
    code: '',
    name: '',
    category: 'Mesin Sablon',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: '',
    quantity: 1,
    condition: 'Sangat Baik',
    usefulLifeYears: 5,
    location: 'Stasiun Cetak Utama',
    notes: '',
  });

  const openAddModal = () => {
    setEditingAsset(null);
    const nextCode = `AST-${Date.now().toString().slice(-4)}`;
    setFormData({
      code: nextCode,
      name: '',
      category: 'Mesin Sablon',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseCost: '',
      quantity: 1,
      condition: 'Sangat Baik',
      usefulLifeYears: 5,
      location: 'Stasiun Cetak Utama',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: WorkshopAsset) => {
    setEditingAsset(item);
    setFormData({
      code: item.code,
      name: item.name,
      category: item.category,
      purchaseDate: item.purchaseDate,
      purchaseCost: item.purchaseCost,
      quantity: item.quantity,
      condition: item.condition,
      usefulLifeYears: item.usefulLifeYears,
      location: item.location || '',
      notes: item.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || Number(formData.purchaseCost) < 0) return;

    const assetItem: WorkshopAsset = {
      id: editingAsset ? editingAsset.id : `ast-${Date.now()}`,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      category: formData.category,
      purchaseDate: formData.purchaseDate,
      purchaseCost: Number(formData.purchaseCost),
      quantity: Number(formData.quantity) || 1,
      condition: formData.condition,
      usefulLifeYears: Number(formData.usefulLifeYears) || 5,
      location: formData.location.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    onSaveAsset(assetItem);
    setIsModalOpen(false);
  };

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchCond = selectedCondition === 'ALL' || item.condition === selectedCondition;

      return matchSearch && matchCat && matchCond;
    });
  }, [assets, searchQuery, selectedCategory, selectedCondition]);

  // Metrics
  const metrics = useMemo(() => {
    const totalCost = assets.reduce((sum, a) => sum + a.purchaseCost * a.quantity, 0);
    const totalUnits = assets.reduce((sum, a) => sum + a.quantity, 0);

    const goodCount = assets.filter(
      (a) => a.condition === 'Sangat Baik' || a.condition === 'Baik (Beroperasi)'
    ).length;

    const needMaintenanceCount = assets.filter(
      (a) => a.condition === 'Perlu Perawatan' || a.condition === 'Rusak / Afkir'
    ).length;

    return {
      totalCost,
      totalUnits,
      goodCount,
      needMaintenanceCount,
    };
  }, [assets]);

  const getConditionBadge = (cond: AssetCondition) => {
    switch (cond) {
      case 'Sangat Baik':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            Sangat Baik
          </span>
        );
      case 'Baik (Beroperasi)':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-semibold flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3" />
            Baik (Beroperasi)
          </span>
        );
      case 'Perlu Perawatan':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold flex items-center gap-1 w-fit">
            <AlertTriangle className="w-3 h-3" />
            Perlu Servis
          </span>
        );
      case 'Rusak / Afkir':
        return (
          <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Rusak / Afkir
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/10 text-white border border-white/10">
              <Cpu className="w-5 h-5 text-blue-400" />
            </span>
            <h1 className="text-xl sm:text-2xl font-montserrat font-black tracking-tight text-white">
              Investasi Aset & Peralatan Workshop
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-inter">
            Inventarisasi mesin sablon silinder, meja afdruk UV, kompresor, frame screen, dan aset penunjang operasional KMS.id
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-2xl text-xs font-montserrat font-black shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Aset Investasi</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Total Nilai Investasi</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-montserrat font-black text-white">
              {formatRupiah(metrics.totalCost)}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Akumulasi modal aset workshop</div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Jumlah Unit Alat / Mesin</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-montserrat font-black text-white">
              {metrics.totalUnits} <span className="text-xs font-normal text-zinc-400">unit</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Dari {assets.length} item terdaftar</div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Status Beroperasi Baik</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-montserrat font-black text-emerald-400">
              {metrics.goodCount} <span className="text-xs font-normal text-zinc-400">aset</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Siap digunakan produksi harian</div>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Perlu Servis / Rusak</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-montserrat font-black text-amber-400">
              {metrics.needMaintenanceCount} <span className="text-xs font-normal text-zinc-400">aset</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Memerlukan inspeksi mekanik</div>
          </div>
        </div>
      </div>

      {/* Filter and View Toggle */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aset berdasarkan kode, nama mesin, atau lokasi..."
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
              {ASSET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="glass-input px-3 py-2 rounded-xl text-xs bg-zinc-900 text-white border-white/10"
            >
              <option value="ALL">Semua Kondisi</option>
              {ASSET_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'GRID' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Tampilan Grid Kartu"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'TABLE' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Tampilan Tabel Rinci"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Content: GRID VIEW */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-400 glass-panel rounded-3xl border border-white/10">
              <Cpu className="w-10 h-10 mx-auto mb-2 text-zinc-600 opacity-60" />
              <p className="font-semibold text-zinc-300">Tidak ada aset investasi ditemukan</p>
              <p className="text-xs text-zinc-500 mt-1">Coba sesuaikan kata kunci atau filter pencarian.</p>
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const annualDepreciation =
                asset.usefulLifeYears > 0
                  ? Math.round(asset.purchaseCost / asset.usefulLifeYears)
                  : 0;

              return (
                <div
                  key={asset.id}
                  className="glass-card p-5 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-zinc-300 border border-white/10">
                        {asset.code}
                      </span>
                      {getConditionBadge(asset.condition)}
                    </div>

                    <div>
                      <span className="text-[11px] text-zinc-400 block font-medium">
                        {asset.category}
                      </span>
                      <h3 className="text-sm font-montserrat font-bold text-white line-clamp-2 mt-0.5">
                        {asset.name}
                      </h3>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-zinc-400">
                        <span>Biaya Perolehan:</span>
                        <span className="font-montserrat font-bold text-white">
                          {formatRupiah(asset.purchaseCost)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400">
                        <span>Jumlah Unit:</span>
                        <span className="font-mono font-bold text-white">{asset.quantity} unit</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400">
                        <span>Tanggal Beli:</span>
                        <span className="font-mono text-zinc-300">{formatDate(asset.purchaseDate)}</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400">
                        <span>Taksiran Pakai:</span>
                        <span className="font-mono text-zinc-300">{asset.usefulLifeYears} tahun</span>
                      </div>
                      <div className="flex justify-between items-center text-zinc-400 pt-1 border-t border-white/5 text-[11px]">
                        <span>Depresiasi / Thn:</span>
                        <span className="font-mono text-zinc-400">{formatRupiah(annualDepreciation)}</span>
                      </div>
                    </div>

                    {asset.location && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{asset.location}</span>
                      </div>
                    )}

                    {asset.notes && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 italic bg-black/30 p-2 rounded-xl">
                        "{asset.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Subtotal: {formatRupiah(asset.purchaseCost * asset.quantity)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(asset)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        title="Edit Aset"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus aset "${asset.name}"?`)) {
                            onDeleteAsset(asset.id);
                          }
                        }}
                        className="p-1.5 hover:bg-rose-500/20 rounded-lg text-zinc-400 hover:text-rose-400 transition-colors"
                        title="Hapus Aset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Kode & Nama Aset</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Kondisi</th>
                  <th className="py-3 px-4">Lokasi</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Harga Beli (Rp)</th>
                  <th className="py-3 px-4 text-right">Total Nilai (Rp)</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      Tidak ada aset yang sesuai
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono text-[10px] text-zinc-400">{asset.code}</div>
                        <div className="font-montserrat font-bold text-white text-xs">{asset.name}</div>
                      </td>
                      <td className="py-3 px-4 text-zinc-300">{asset.category}</td>
                      <td className="py-3 px-4">{getConditionBadge(asset.condition)}</td>
                      <td className="py-3 px-4 text-zinc-300">{asset.location || '-'}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-white">
                        {asset.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-zinc-300">
                        {formatRupiah(asset.purchaseCost)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-white">
                        {formatRupiah(asset.purchaseCost * asset.quantity)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(asset)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus aset "${asset.name}"?`)) {
                                onDeleteAsset(asset.id);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-500/20 rounded-lg text-zinc-400 hover:text-rose-400"
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
      )}

      {/* Modal Tambah / Edit Aset */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel border border-white/20 w-full max-w-lg rounded-3xl p-6 shadow-2xl my-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-white/10 text-blue-400 border border-white/10">
                  <Cpu className="w-4 h-4" />
                </span>
                <h3 className="text-base font-montserrat font-bold text-white">
                  {editingAsset ? 'Edit Data Aset Investasi' : 'Tambah Aset Investasi Workshop'}
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
                  <label className="block text-zinc-400 mb-1 font-medium">Kode Inventaris Aset *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: AST-MCH-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Kategori Aset *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs bg-zinc-900 text-white"
                  >
                    {ASSET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Nama Mesin / Peralatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Mesin Sablon Silinder Semi-Otomatis Pneumatic"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Biaya Beli per Unit (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    required
                    placeholder="Contoh: 28500000"
                    value={formData.purchaseCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        purchaseCost: e.target.value ? Number(e.target.value) : '',
                      })
                    }
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono font-bold"
                  />
                  {formData.purchaseCost !== '' && (
                    <div className="text-[11px] text-emerald-400 font-mono mt-1">
                      {formatRupiah(Number(formData.purchaseCost))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Jumlah Unit *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                    }
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Tanggal Perolehan *</label>
                  <input
                    type="date"
                    required
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Kondisi Alat *</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs bg-zinc-900 text-white"
                  >
                    {ASSET_CONDITIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Masa Pakai (Tahun)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.usefulLifeYears}
                    onChange={(e) =>
                      setFormData({ ...formData, usefulLifeYears: parseInt(e.target.value) || 5 })
                    }
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Lokasi / Stasiun Kerja</label>
                <input
                  type="text"
                  placeholder="Contoh: Stasiun Cetak 1, Kamar Gelap Afdruk, Ruang Kasir"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Spesifikasi / Catatan Perawatan</label>
                <textarea
                  rows={2}
                  placeholder="Spesifikasi motor, tipe pelumas, riwayat penggantian part, dll."
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
                  {editingAsset ? 'Simpan Perubahan' : 'Simpan Aset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
