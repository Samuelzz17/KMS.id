import React, { useState } from 'react';
import { CustomerOrder, PaymentStatus, ProductionStatus } from '../types';
import {
  formatDate,
  formatNumber,
  formatRupiah,
  generateWhatsAppLink,
  getPaymentStatusLabel,
  getProductionStatusLabel,
  getWhatsAppOrderMessage,
} from '../utils/formatters';
import {
  Search,
  Filter,
  Kanban,
  List,
  Printer,
  Share2,
  Edit2,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

interface OrderManagementProps {
  orders: CustomerOrder[];
  onOpenNewOrder: () => void;
  onEditOrder: (order: CustomerOrder) => void;
  onDeleteOrder: (orderId: string) => void;
  onPrintOrder: (order: CustomerOrder) => void;
  onUpdateOrderStatus: (orderId: string, status: ProductionStatus) => void;
}

const PRODUCTION_STAGES: { status: ProductionStatus; title: string }[] = [
  { status: 'ANTREAN', title: '1. Antrean SPK' },
  { status: 'SETTING_FILM', title: '2. Setting & Film' },
  { status: 'PROSES_SABLON', title: '3. Sedang Sablon' },
  { status: 'FINISHING', title: '4. Finishing & QC' },
  { status: 'SIAP_AMBIL', title: '5. Siap Ambil / Kirim' },
  { status: 'SELESAI', title: '6. Selesai (Arsip)' },
];

export const OrderManagement: React.FC<OrderManagementProps> = ({
  orders,
  onOpenNewOrder,
  onEditOrder,
  onDeleteOrder,
  onPrintOrder,
  onUpdateOrderStatus,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProduction, setFilterProduction] = useState<string>('ALL');
  const [filterPayment, setFilterPayment] = useState<string>('ALL');

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerBrand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.cupProductName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProd = filterProduction === 'ALL' || o.productionStatus === filterProduction;
    const matchesPay = filterPayment === 'ALL' || o.paymentStatus === filterPayment;

    return matchesSearch && matchesProd && matchesPay;
  });

  const getNextStatus = (current: ProductionStatus): ProductionStatus | null => {
    const orderFlow: ProductionStatus[] = [
      'ANTREAN',
      'SETTING_FILM',
      'PROSES_SABLON',
      'FINISHING',
      'SIAP_AMBIL',
      'SELESAI',
    ];
    const idx = orderFlow.indexOf(current);
    if (idx >= 0 && idx < orderFlow.length - 1) {
      return orderFlow[idx + 1];
    }
    return null;
  };

  const getPrevStatus = (current: ProductionStatus): ProductionStatus | null => {
    const orderFlow: ProductionStatus[] = [
      'ANTREAN',
      'SETTING_FILM',
      'PROSES_SABLON',
      'FINISHING',
      'SIAP_AMBIL',
      'SELESAI',
    ];
    const idx = orderFlow.indexOf(current);
    if (idx > 0) {
      return orderFlow[idx - 1];
    }
    return null;
  };

  const handleShareWA = (order: CustomerOrder) => {
    const text = getWhatsAppOrderMessage(order);
    const link = generateWhatsAppLink(order.customerPhone, text);
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-montserrat font-black text-white tracking-tight">
            Pesanan & Surat Perintah Kerja (SPK)
          </h2>
          <p className="text-xs text-zinc-400 font-inter mt-0.5">
            Total {filteredOrders.length} pesanan • Kontrol alur afdruk, sablon mesin, QC, dan pelunasan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Switch View */}
          <div className="flex bg-white/[0.04] p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-black font-montserrat font-black shadow-xs'
                  : 'text-zinc-400 hover:text-white font-inter font-medium'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-black font-montserrat font-black shadow-xs'
                  : 'text-zinc-400 hover:text-white font-inter font-medium'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Daftar Tabel</span>
            </button>
          </div>

          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-montserrat font-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Buat Pesanan & SPK</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari No. SPK, nama brand, pemesan, atau varian cup..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-white/10 rounded-xl bg-white/[0.03] text-white placeholder-zinc-500 focus:bg-white/[0.06] focus:border-white/30 focus:outline-hidden focus:ring-1 focus:ring-white/20 font-inter"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={filterProduction}
            onChange={(e) => setFilterProduction(e.target.value)}
            className="text-xs py-2 px-3 border border-white/10 rounded-xl bg-zinc-900 text-zinc-200 font-inter font-medium focus:outline-hidden focus:border-white/30"
          >
            <option value="ALL">Semua Alur Produksi</option>
            <option value="ANTREAN">1. Antrean</option>
            <option value="SETTING_FILM">2. Setting & Film</option>
            <option value="PROSES_SABLON">3. Sedang Sablon</option>
            <option value="FINISHING">4. Finishing & QC</option>
            <option value="SIAP_AMBIL">5. Siap Ambil / Kirim</option>
            <option value="SELESAI">6. Selesai (Arsip)</option>
          </select>

          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="text-xs py-2 px-3 border border-white/10 rounded-xl bg-zinc-900 text-zinc-200 font-inter font-medium focus:outline-hidden focus:border-white/30"
          >
            <option value="ALL">Semua Status Bayar</option>
            <option value="LUNAS">LUNAS</option>
            <option value="DP">DP Diterima</option>
            <option value="BELUM_BAYAR">Belum Bayar</option>
          </select>
        </div>
      </div>

      {/* Main View: Kanban or List */}
      {viewMode === 'kanban' ? (
        /* ================= KANBAN BOARD VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 items-start">
          {PRODUCTION_STAGES.map((col) => {
            const colOrders = filteredOrders.filter((o) => o.productionStatus === col.status);

            return (
              <div
                key={col.status}
                className="glass-card rounded-2xl p-3 border border-white/10 bg-white/[0.02] flex flex-col min-h-[480px]"
              >
                {/* Column Header */}
                <div className="px-3 py-2 rounded-xl border border-white/15 bg-white/[0.05] text-xs flex items-center justify-between mb-3 shadow-2xs">
                  <span className="truncate font-montserrat font-bold text-white text-[11px]">{col.title}</span>
                  <span className="bg-white text-black px-2 py-0.2 rounded-full text-[10px] font-montserrat font-black shrink-0">
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-1">
                  {colOrders.map((order) => {
                    const payInfo = getPaymentStatusLabel(order.paymentStatus);
                    const nextSt = getNextStatus(order.productionStatus);
                    const prevSt = getPrevStatus(order.productionStatus);

                    return (
                      <div
                        key={order.id}
                        className="glass-card rounded-xl p-3.5 border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all space-y-2.5 group"
                      >
                        {/* Top: SPK No & Payment Status */}
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/15">
                            {order.orderNumber}
                          </span>
                          <span className={`text-[10px] font-inter font-bold px-1.5 py-0.5 rounded border ${
                            order.paymentStatus === 'LUNAS'
                              ? 'bg-white text-black border-white'
                              : 'bg-white/10 text-white border-white/20'
                          }`}>
                            {payInfo.label}
                          </span>
                        </div>

                        {/* Brand & Customer */}
                        <div>
                          <h4 className="text-xs font-montserrat font-bold text-white group-hover:text-zinc-200 transition-colors">
                            {order.customerBrand}
                          </h4>
                          <p className="text-[11px] text-zinc-400 font-inter">{order.customerName}</p>
                        </div>

                        {/* Specs */}
                        <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/10 text-[11px] space-y-1 font-inter text-zinc-300">
                          <div className="font-medium text-white truncate">
                            {order.cupProductName}
                          </div>
                          <div className="flex items-center justify-between text-zinc-400">
                            <span>Jumlah:</span>
                            <span className="font-montserrat font-bold text-white">{formatNumber(order.quantityPcs)} pcs</span>
                          </div>
                          <div className="flex items-center justify-between text-zinc-400">
                            <span>Sablon:</span>
                            <span className="font-inter font-medium text-zinc-200 flex items-center gap-1">
                              <span
                                className="w-2 h-2 rounded-full border border-white/30"
                                style={{ backgroundColor: order.inkHex }}
                              />
                              {order.sablonSides}
                            </span>
                          </div>
                        </div>

                        {/* Deadline & Operator */}
                        <div className="text-[10px] text-zinc-400 font-inter flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            {formatDate(order.deadlineDate)}
                          </span>
                          <span>Op: {order.operatorName?.split(' ')[0] || 'Admin'}</span>
                        </div>

                        {/* Bottom Actions & Stepper */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onPrintOrder(order)}
                              title="Cetak SPK & Faktur"
                              className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.1] transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleShareWA(order)}
                              title="Kirim ke WhatsApp Pelanggan"
                              className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.1] transition-colors"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onEditOrder(order)}
                              title="Edit Pesanan"
                              className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.1] transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            {prevSt && (
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, prevSt)}
                                title="Kembalikan ke tahap sebelumnya"
                                className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 text-[10px]"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {nextSt && (
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, nextSt)}
                                title="Lanjut ke tahap berikutnya"
                                className="px-2.5 py-1 rounded-md bg-white hover:bg-zinc-200 text-black font-montserrat font-bold text-[10px] flex items-center gap-1 transition-colors"
                              >
                                <span>Lanjut</span>
                                <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colOrders.length === 0 && (
                    <div className="border border-dashed border-white/10 rounded-xl p-6 text-center text-zinc-600 text-xs font-inter">
                      Kosong
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE LIST VIEW ================= */
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-inter">
              <thead className="bg-white/[0.04] text-zinc-400 font-montserrat font-bold uppercase tracking-wider text-[11px] border-b border-white/10">
                <tr>
                  <th className="p-4">No. SPK & Waktu</th>
                  <th className="p-4">Brand & Pelanggan</th>
                  <th className="p-4">Item Cup Plastik</th>
                  <th className="p-4">Varian Sablon</th>
                  <th className="p-4 text-right">Kuantiti</th>
                  <th className="p-4 text-right">Total & Sisa</th>
                  <th className="p-4 text-center">Status Alur</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-200">
                {filteredOrders.map((order) => {
                  const prodInfo = getProductionStatusLabel(order.productionStatus);
                  const payInfo = getPaymentStatusLabel(order.paymentStatus);
                  const nextSt = getNextStatus(order.productionStatus);

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded inline-block border border-white/15">
                          {order.orderNumber}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-1">{formatDate(order.createdAt)}</div>
                      </td>

                      <td className="p-4">
                        <div className="font-montserrat font-bold text-white text-sm">{order.customerBrand}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          {order.customerName} • {order.customerPhone}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-white">{order.cupProductName}</div>
                        <div className="text-[11px] text-zinc-400">{order.cupSize} ({order.cupGrammage})</div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span
                            className="w-3 h-3 rounded-full border border-white/30"
                            style={{ backgroundColor: order.inkHex }}
                          />
                          <span className="text-white">{order.inkColorName}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{order.sablonSides}</div>
                      </td>

                      <td className="p-4 text-right font-montserrat font-black text-white text-sm">
                        {formatNumber(order.quantityPcs)} <span className="text-xs font-inter font-normal text-zinc-400">pcs</span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="font-montserrat font-bold text-white">{formatRupiah(order.totalPrice)}</div>
                        <div className="mt-1">
                          <span className={`text-[10px] font-inter font-bold px-1.5 py-0.5 rounded border ${
                            order.paymentStatus === 'LUNAS'
                              ? 'bg-white text-black border-white'
                              : 'bg-white/10 text-white border-white/20'
                          }`}>
                            {payInfo.label}
                          </span>
                        </div>
                        {order.remainingPayment > 0 && (
                          <div className="text-[10px] text-zinc-300 font-inter mt-1">
                            Sisa: <span className="text-white font-semibold">{formatRupiah(order.remainingPayment)}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-inter font-semibold border border-white/20 bg-white/10 text-white">
                          {prodInfo.label}
                        </span>
                        <div className="text-[10px] text-zinc-400 font-inter mt-1">
                          Deadline: {formatDate(order.deadlineDate)}
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onPrintOrder(order)}
                            title="Cetak SPK & Faktur"
                            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.1] transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleShareWA(order)}
                            title="Kirim ke WhatsApp"
                            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.1] transition-colors"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditOrder(order)}
                            title="Edit Pesanan"
                            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.1] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {nextSt && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, nextSt)}
                              title="Lanjut status produksi"
                              className="px-2.5 py-1 bg-white hover:bg-zinc-200 text-black rounded-lg text-[10px] font-montserrat font-bold transition-colors"
                            >
                              Lanjut &rarr;
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus pesanan ${order.orderNumber}?`)) {
                                onDeleteOrder(order.id);
                              }
                            }}
                            title="Hapus"
                            className="p-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-zinc-500 font-inter text-xs">
                      Tidak ada pesanan yang sesuai dengan filter atau kata kunci pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
