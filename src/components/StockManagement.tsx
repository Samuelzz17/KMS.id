import React, { useState } from 'react';
import { CupProduct, CupType, StockMovement } from '../types';
import { formatDateTime, formatNumber, formatRupiah } from '../utils/formatters';
import {
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  History,
  AlertOctagon,
  Boxes,
} from 'lucide-react';

interface StockManagementProps {
  cups: CupProduct[];
  movements: StockMovement[];
  onOpenNewProductModal: () => void;
  onOpenMutationModal: (cup?: CupProduct) => void;
}

export const StockManagement: React.FC<StockManagementProps> = ({
  cups,
  movements,
  onOpenNewProductModal,
  onOpenMutationModal,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'history'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Metrik stok
  const totalStockPcs = cups.reduce((sum, c) => sum + c.stockPcs, 0);
  const totalAssetValue = cups.reduce((sum, c) => sum + c.stockPcs * c.costPricePerPcs, 0);
  const lowStockCount = cups.filter((c) => c.stockPcs <= c.minStockAlert).length;
  const totalRejectPcs = movements
    .filter((m) => m.type === 'OUT_REJECT')
    .reduce((sum, m) => sum + m.quantityPcs, 0);

  // Filter katalog
  const filteredCups = cups.filter((cup) => {
    const matchesSearch =
      cup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cup.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cup.size.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || cup.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-montserrat font-black text-white tracking-tight">
            Katalog & Manajemen Stok Cup
          </h2>
          <p className="text-xs text-zinc-400 font-inter mt-0.5">
            Kontrol stok fisik cup polos, lid sealer, sedotan, serta riwayat mutasi masuk dan reject produksi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onOpenMutationModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white rounded-xl text-xs font-inter font-semibold backdrop-blur-md transition-colors"
          >
            <ArrowDownRight className="w-4 h-4 text-zinc-300" />
            <span>Catat Mutasi Stok</span>
          </button>
          <button
            onClick={onOpenNewProductModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-montserrat font-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Varian Cup</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/10">
          <span className="text-[11px] font-inter font-bold text-zinc-400 uppercase tracking-wider block">
            Total Stok Fisik Cup
          </span>
          <div className="text-2xl sm:text-3xl font-montserrat font-black text-white mt-1">
            {formatNumber(totalStockPcs)}{' '}
            <span className="text-xs font-inter font-normal text-zinc-400">pcs</span>
          </div>
          <span className="text-xs text-zinc-400 font-inter mt-1 block">
            Setara ~{Math.floor(totalStockPcs / 1000)} Dus (@1.000 pcs)
          </span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10">
          <span className="text-[11px] font-inter font-bold text-zinc-400 uppercase tracking-wider block">
            Total Nilai Modal Gudang
          </span>
          <div className="text-2xl sm:text-3xl font-montserrat font-black text-white mt-1">
            {formatRupiah(totalAssetValue)}
          </div>
          <span className="text-xs text-zinc-400 font-inter mt-1 block">
            Nilai aset bahan saat ini
          </span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10">
          <span className="text-[11px] font-inter font-bold text-zinc-400 uppercase tracking-wider block">
            Peringatan Stok Menipis
          </span>
          <div className="text-2xl sm:text-3xl font-montserrat font-black text-white mt-1">
            {lowStockCount} <span className="text-xs font-inter font-normal text-zinc-400">varian</span>
          </div>
          <span className="text-xs text-zinc-400 font-inter mt-1 block">
            Melewati ambang batas aman
          </span>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-white/10">
          <span className="text-[11px] font-inter font-bold text-zinc-400 uppercase tracking-wider block">
            Total Cup Rusak / Reject
          </span>
          <div className="text-2xl sm:text-3xl font-montserrat font-black text-white mt-1">
            {formatNumber(totalRejectPcs)}{' '}
            <span className="text-xs font-inter font-normal text-zinc-400">pcs</span>
          </div>
          <span className="text-xs text-zinc-400 font-inter mt-1 block">
            Akumulasi afkir mesin sablon
          </span>
        </div>
      </div>

      {/* Tabs Switcher: Katalog vs Riwayat */}
      <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/10 backdrop-blur-md w-fit">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all ${
            activeTab === 'catalog'
              ? 'bg-white text-black font-montserrat font-black shadow-xs'
              : 'text-zinc-400 hover:text-white font-inter font-medium'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Katalog Bahan ({cups.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all ${
            activeTab === 'history'
              ? 'bg-white text-black font-montserrat font-black shadow-xs'
              : 'text-zinc-400 hover:text-white font-inter font-medium'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Log Mutasi & Reject ({movements.length})</span>
        </button>
      </div>

      {/* Content View */}
      {activeTab === 'catalog' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Cari nama cup, kode SKU, atau ukuran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-white/10 rounded-xl bg-white/[0.03] text-white placeholder-zinc-500 focus:bg-white/[0.06] focus:border-white/30 focus:outline-hidden focus:ring-1 focus:ring-white/20 font-inter"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-xs py-2 px-3 border border-white/10 rounded-xl bg-zinc-900 text-zinc-200 font-inter font-medium focus:outline-hidden focus:border-white/30"
              >
                <option value="ALL">Semua Tipe Cup</option>
                <option value="Oval">Cup Oval (Cembung)</option>
                <option value="Datar">Cup Datar (Flat)</option>
                <option value="Injection">Cup Injection Hardcup</option>
                <option value="Aksesoris">Aksesoris (Lid/Sedotan)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-inter">
                <thead className="bg-white/[0.04] text-zinc-400 font-montserrat font-bold uppercase tracking-wider text-[11px] border-b border-white/10">
                  <tr>
                    <th className="p-4">Kode & Nama Cup</th>
                    <th className="p-4">Tipe & Spesifikasi</th>
                    <th className="p-4 text-right">Stok Fisik</th>
                    <th className="p-4 text-right">Slop & Dus</th>
                    <th className="p-4 text-right">HPP Modal</th>
                    <th className="p-4 text-right">Jual Polos</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-zinc-200">
                  {filteredCups.map((cup) => {
                    const isLow = cup.stockPcs <= cup.minStockAlert;
                    const slopCount = Math.floor(cup.stockPcs / (cup.unitPerSlop || 50));
                    const boxCount = (cup.stockPcs / (cup.unitPerBox || 1000)).toFixed(1);

                    return (
                      <tr key={cup.id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="p-4">
                          <div className="font-mono text-[11px] text-zinc-400 font-semibold">{cup.code}</div>
                          <div className="font-montserrat font-bold text-white text-sm mt-0.5">{cup.name}</div>
                          {cup.description && (
                            <div className="text-[11px] text-zinc-400 mt-1 max-w-sm line-clamp-1">
                              {cup.description}
                            </div>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-white/10 text-white font-inter font-medium text-[11px] border border-white/15">
                            {cup.type}
                          </span>
                          <div className="text-zinc-300 font-inter text-[11px] mt-1">
                            {cup.size} • {cup.grammage} • {cup.material}
                          </div>
                        </td>

                        <td className="p-4 text-right">
                          <div className="font-montserrat font-black text-base text-white">
                            {formatNumber(cup.stockPcs)}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            Min: {formatNumber(cup.minStockAlert)} pcs
                          </div>
                        </td>

                        <td className="p-4 text-right text-[11px]">
                          <div className="font-montserrat font-semibold text-white">~{slopCount} Slop</div>
                          <div className="text-zinc-400 font-inter">{boxCount} Dus</div>
                        </td>

                        <td className="p-4 text-right font-medium text-zinc-300">
                          {formatRupiah(cup.costPricePerPcs)}
                        </td>

                        <td className="p-4 text-right font-montserrat font-bold text-white">
                          {formatRupiah(cup.sellPricePolosPerPcs)}
                        </td>

                        <td className="p-4 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-inter font-bold bg-white text-black border border-white">
                              <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                              Menipis
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-inter font-medium bg-white/10 text-white border border-white/20">
                              Aman
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => onOpenMutationModal(cup)}
                            className="px-3 py-1.5 bg-white/10 hover:bg-white text-white hover:text-black rounded-lg text-xs font-montserrat font-bold border border-white/20 transition-all"
                          >
                            + Mutasi
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Log Mutasi Tab */
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-inter">
              <thead className="bg-white/[0.04] text-zinc-400 font-montserrat font-bold uppercase tracking-wider text-[11px] border-b border-white/10">
                <tr>
                  <th className="p-4">Tanggal & Jam</th>
                  <th className="p-4">Item Cup</th>
                  <th className="p-4">Jenis Mutasi</th>
                  <th className="p-4 text-right">Jumlah Pcs</th>
                  <th className="p-4">Referensi SPK</th>
                  <th className="p-4">Catatan</th>
                  <th className="p-4">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-200">
                {movements.map((mov) => {
                  let badge = (
                    <span className="px-2 py-0.5 rounded text-[10px] font-inter font-bold bg-white/10 text-white border border-white/15">
                      {mov.type}
                    </span>
                  );
                  if (mov.type === 'IN') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-inter font-bold bg-white text-black border border-white">
                        <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
                        Stok Masuk
                      </span>
                    );
                  } else if (mov.type === 'OUT_SABLON') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-inter font-bold bg-white/10 text-white border border-white/20">
                        <Layers className="w-3 h-3" />
                        Sablon Cetak
                      </span>
                    );
                  } else if (mov.type === 'OUT_SALE') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-inter font-bold bg-white/10 text-white border border-white/20">
                        <ArrowUpRight className="w-3 h-3" />
                        Jual Polos
                      </span>
                    );
                  } else if (mov.type === 'OUT_REJECT') {
                    badge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-inter font-bold bg-white/20 text-white border border-white/30">
                        <AlertOctagon className="w-3 h-3" />
                        Reject / Afkir
                      </span>
                    );
                  }

                  return (
                    <tr key={mov.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="p-4 text-zinc-400 whitespace-nowrap">
                        {formatDateTime(mov.date)}
                      </td>
                      <td className="p-4 font-montserrat font-bold text-white">{mov.cupProductName}</td>
                      <td className="p-4">{badge}</td>
                      <td className="p-4 text-right font-montserrat font-black text-white text-sm">
                        {mov.type === 'IN' ? '+' : '-'} {formatNumber(mov.quantityPcs)} pcs
                      </td>
                      <td className="p-4 font-mono font-bold text-white">
                        {mov.referenceOrderNo || '-'}
                      </td>
                      <td className="p-4 text-zinc-400 max-w-xs">{mov.notes}</td>
                      <td className="p-4 text-zinc-400 font-medium">{mov.operatorName || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
