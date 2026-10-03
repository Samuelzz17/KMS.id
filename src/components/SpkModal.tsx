import React, { useState, useEffect } from 'react';
import { CupProduct, CustomerOrder, ProductionStatus, SablonSides } from '../types';
import { formatDate, formatNumber } from '../utils/formatters';
import {
  X,
  FileText,
  Printer,
  Layers,
  User,
  Settings,
  AlertCircle,
  Sparkles,
  Clock,
  CheckCircle2,
  Sliders,
  Maximize2,
  Calendar,
  Zap,
} from 'lucide-react';

interface SpkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSpk: (spkData: CustomerOrder, autoPrint?: boolean) => void;
  orders: CustomerOrder[];
  cups: CupProduct[];
  preSelectedOrder?: CustomerOrder | null;
}

const OPERATOR_PRESETS = [
  'Agus Subekti (Kepala Produksi)',
  'Bambang Supriyadi (Operator Mesin 1)',
  'Joko Prasetyo (Operator Mesin 2)',
  'Rudi Hartono (Finishing & QC)',
  'Siti Nurhaliza (Operator Setting Film)',
];

const MACHINE_PRESETS = [
  'Mesin 01 - Semi Otomatis Silinder (Standard)',
  'Mesin 02 - Otomatis Rotary High-Speed (Volume Besar)',
  'Mesin 03 - Meja Sablon Manual (Sampel / 2 Sisi Khusus)',
];

const INK_TYPE_PRESETS = [
  'Solvent Base (Tahan Es & Air Dingin)',
  'Glossy High-Shine (Kilap Tebal)',
  'Doff Matte (Elegan Lembut)',
  'UV Curing (Kering Instan)',
];

const MESH_PRESETS = [
  'T120 (Kasa Standar Sablon Cup Plastik)',
  'T140 (Kasa Kerapatan Tinggi - Desain Garis Tipis)',
  'T100 (Kasa Lubang Lebar - Cetak Blok Warna Tebal)',
];

const QUICK_QC_TAGS = [
  'Waspada cup tipis, tekanan rakel rendah',
  'Cek ketebalan tinta per 1 slop (50 pcs)',
  'Pastikan kering sempurna sebelum slop packing',
  'Presisi logo depan & belakang simetris',
  'Sampel cup pertama wajib approval supervisor',
];

export const SpkModal: React.FC<SpkModalProps> = ({
  isOpen,
  onClose,
  onSaveSpk,
  orders,
  cups,
  preSelectedOrder,
}) => {
  // Pending orders that are waiting for SPK
  const pendingOrders = orders.filter((o) => o.productionStatus === 'MENUNGGU_SPK');

  // Mode: from existing pending order vs manual direct workshop SPK
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [isDirectWorkshopOrder, setIsDirectWorkshopOrder] = useState<boolean>(false);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerBrand, setCustomerBrand] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [selectedCupId, setSelectedCupId] = useState('');
  const [quantityPcs, setQuantityPcs] = useState<number>(1000);
  const [sablonSides, setSablonSides] = useState<SablonSides>('1 Sisi');
  const [inkColorName, setInkColorName] = useState('Hitam Solid');
  const [inkHex, setInkHex] = useState('#18181B');

  // Technical SPK Specific Fields
  const [operatorName, setOperatorName] = useState('Agus Subekti (Kepala Produksi)');
  const [customOperator, setCustomOperator] = useState('');
  const [machineName, setMachineName] = useState(MACHINE_PRESETS[0]);
  const [screenNumber, setScreenNumber] = useState('SCR-AUTO');
  const [meshType, setMeshType] = useState(MESH_PRESETS[0]);
  const [screenStatus, setScreenStatus] = useState<'READY' | 'NEED_AFDRUK' | 'REUSE'>('NEED_AFDRUK');
  const [inkType, setInkType] = useState(INK_TYPE_PRESETS[0]);
  const [inkFormula, setInkFormula] = useState('');
  const [printDistance, setPrintDistance] = useState('2.0 cm dari bibir cup (Standar Sealer)');
  const [designDimensions, setDesignDimensions] = useState('Lebar 7.0 cm × Tinggi 5.5 cm');
  const [priorityLevel, setPriorityLevel] = useState<'NORMAL' | 'URGENT' | 'KILAT'>('NORMAL');
  const [targetStartDate, setTargetStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [initialStatus, setInitialStatus] = useState<'ANTREAN' | 'SETTING_FILM'>('ANTREAN');
  const [productionNotes, setProductionNotes] = useState('');

  // Synchronize state when modal opens or preSelectedOrder changes
  useEffect(() => {
    if (!isOpen) return;

    if (preSelectedOrder) {
      setIsDirectWorkshopOrder(false);
      setSelectedOrderId(preSelectedOrder.id);
      loadOrderIntoForm(preSelectedOrder);
    } else if (pendingOrders.length > 0) {
      setIsDirectWorkshopOrder(false);
      setSelectedOrderId(pendingOrders[0].id);
      loadOrderIntoForm(pendingOrders[0]);
    } else {
      setIsDirectWorkshopOrder(true);
      resetToDefaultDirectOrder();
    }
  }, [isOpen, preSelectedOrder]);

  const loadOrderIntoForm = (order: CustomerOrder) => {
    setCustomerName(order.customerName);
    setCustomerBrand(order.customerBrand);
    setCustomerPhone(order.customerPhone);
    setDeadlineDate(order.deadlineDate ? order.deadlineDate.slice(0, 10) : '');
    setSelectedCupId(order.cupProductId);
    setQuantityPcs(order.quantityPcs);
    setSablonSides(order.sablonSides);
    setInkColorName(order.inkColorName);
    setInkHex(order.inkHex || '#18181B');
    setOperatorName(order.operatorName || OPERATOR_PRESETS[0]);
    setScreenNumber(`SCR-${order.customerBrand.replace(/\s+/g, '').toUpperCase().slice(0, 5)}-${Math.floor(Math.random() * 90 + 10)}`);
    setScreenStatus(order.hasExistingFilm ? 'READY' : 'NEED_AFDRUK');
    setProductionNotes(order.notes || '');
  };

  const resetToDefaultDirectOrder = () => {
    setSelectedOrderId('');
    setCustomerName('');
    setCustomerBrand('');
    setCustomerPhone('');
    setDeadlineDate(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
    const firstCup = cups[0];
    setSelectedCupId(firstCup ? firstCup.id : '');
    setQuantityPcs(1000);
    setSablonSides('1 Sisi');
    setInkColorName('Hitam Solid');
    setInkHex('#18181B');
    setOperatorName(OPERATOR_PRESETS[0]);
    setScreenNumber(`SCR-DIR-${Math.floor(Math.random() * 900 + 100)}`);
    setScreenStatus('NEED_AFDRUK');
    setProductionNotes('');
  };

  const handleSelectPendingOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const found = orders.find((o) => o.id === orderId);
    if (found) {
      loadOrderIntoForm(found);
    }
  };

  const handleAddQcTag = (tag: string) => {
    if (productionNotes.includes(tag)) return;
    setProductionNotes((prev) => (prev ? `${prev}\n• ${tag}` : `• ${tag}`));
  };

  const handleSubmit = (autoPrint = false) => {
    const finalOperator = customOperator.trim() || operatorName;
    const selectedCup = cups.find((c) => c.id === selectedCupId);

    const fullNotes = [
      productionNotes.trim(),
      `[SPEK SPK] Mesin: ${machineName} | Screen: ${screenNumber} (${meshType}) | Tinta: ${inkType} ${inkFormula ? `(Formula: ${inkFormula})` : ''} | Jarak: ${printDistance} | Dimensi: ${designDimensions} | Prioritas: ${priorityLevel}`,
    ].filter(Boolean).join('\n\n');

    let baseOrder: CustomerOrder;

    if (!isDirectWorkshopOrder && selectedOrderId) {
      const existing = orders.find((o) => o.id === selectedOrderId);
      if (!existing) return;

      baseOrder = {
        ...existing,
        operatorName: finalOperator,
        productionStatus: initialStatus,
        notes: fullNotes,
        deadlineDate: new Date(deadlineDate || existing.deadlineDate).toISOString(),
      };
    } else {
      // New direct workshop SPK
      const spkId = `spk-${Date.now()}`;
      const spkNumber = `SPK-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      baseOrder = {
        id: spkId,
        orderNumber: spkNumber,
        createdAt: new Date().toISOString(),
        deadlineDate: new Date(deadlineDate || Date.now() + 7 * 86400000).toISOString(),
        customerName: customerName || 'Pelanggan Workshop',
        customerBrand: customerBrand || 'Direct Order',
        customerPhone: customerPhone || '-',
        cupProductId: selectedCupId,
        cupProductName: selectedCup?.name || 'Cup Sablon',
        cupSize: selectedCup?.size || '16 oz',
        cupGrammage: selectedCup?.grammage || '7 gr',
        quantityPcs,
        sablonSides,
        inkColorName,
        inkHex,
        hasExistingFilm: screenStatus === 'READY',
        filmFee: screenStatus === 'READY' ? 0 : 35000,
        cupPricePerPcs: selectedCup?.sellPricePolosPerPcs || 300,
        sablonPricePerPcs: 150,
        totalPerPcs: (selectedCup?.sellPricePolosPerPcs || 300) + 150,
        subtotal: quantityPcs * ((selectedCup?.sellPricePolosPerPcs || 300) + 150),
        additionalCost: 0,
        totalPrice: quantityPcs * ((selectedCup?.sellPricePolosPerPcs || 300) + 150),
        downPayment: quantityPcs * ((selectedCup?.sellPricePolosPerPcs || 300) + 150),
        remainingPayment: 0,
        paymentStatus: 'LUNAS',
        paymentMethod: 'Internal Workshop',
        productionStatus: initialStatus,
        rejectPcs: 0,
        operatorName: finalOperator,
        notes: fullNotes,
      };
    }

    onSaveSpk(baseOrder, autoPrint);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-amber-500/30 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header SPK Produksi */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-amber-500/20 bg-gradient-to-r from-amber-950/40 via-zinc-900/60 to-zinc-950">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-widest">
                  WORKSHOP PRODUKSI
                </span>
                <span className="text-xs text-zinc-400 font-inter">• Form Surat Perintah Kerja</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-montserrat font-black text-white tracking-tight mt-0.5">
                {preSelectedOrder ? `Lengkapi SPK: ${preSelectedOrder.orderNumber}` : 'Penerbitan SPK Sablon Cup'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Tutup Form SPK"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Source Selection Tabs: Menunggu SPK vs Direct Workshop */}
          {!preSelectedOrder && (
            <div className="p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsDirectWorkshopOrder(false);
                  if (pendingOrders.length > 0) {
                    setSelectedOrderId(pendingOrders[0].id);
                    loadOrderIntoForm(pendingOrders[0]);
                  }
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-montserrat font-bold transition-all ${
                  !isDirectWorkshopOrder
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Pilih dari Invoice Menunggu SPK ({pendingOrders.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDirectWorkshopOrder(true);
                  resetToDefaultDirectOrder();
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-montserrat font-bold transition-all ${
                  isDirectWorkshopOrder
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Buat SPK Langsung (Workshop Direct)</span>
              </button>
            </div>
          )}

          {/* If choosing from pending invoices */}
          {!isDirectWorkshopOrder && pendingOrders.length > 0 && !preSelectedOrder && (
            <div className="space-y-2">
              <label className="text-xs font-montserrat font-bold text-amber-300 uppercase tracking-wider block">
                Pilih Invoice Penjualan yang Akan Dibuatkan SPK:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {pendingOrders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => handleSelectPendingOrder(o.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedOrderId === o.id
                        ? 'border-amber-400 bg-amber-500/15 text-white shadow-md'
                        : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-300">{o.orderNumber}</span>
                      <span className="text-[10px] font-inter font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200">
                        {formatNumber(o.quantityPcs)} pcs
                      </span>
                    </div>
                    <div className="font-montserrat font-bold text-white text-sm mt-1">{o.customerBrand}</div>
                    <div className="text-xs text-zinc-400 font-inter mt-0.5 flex justify-between">
                      <span>{o.cupProductName}</span>
                      <span>Target: {formatDate(o.deadlineDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 1: Ringkasan Pesanan & Target Cetak */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-montserrat font-bold text-zinc-200 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>1. Data Pesanan & Target Cetak</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                {isDirectWorkshopOrder ? 'SPK Workshop Mandiri' : 'Terkoneksi ke Faktur Penjualan'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">Nama Brand / Kedai</label>
                <input
                  type="text"
                  value={customerBrand}
                  onChange={(e) => setCustomerBrand(e.target.value)}
                  disabled={!isDirectWorkshopOrder}
                  placeholder="e.g. Kopi Kenangan Senja"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white font-montserrat font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">Jenis & Tipe Cup</label>
                <select
                  value={selectedCupId}
                  onChange={(e) => setSelectedCupId(e.target.value)}
                  disabled={!isDirectWorkshopOrder}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {cups.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.size} - {c.grammage})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">Jumlah Cetak (Pcs)</label>
                <input
                  type="number"
                  value={quantityPcs}
                  onChange={(e) => setQuantityPcs(Number(e.target.value))}
                  disabled={!isDirectWorkshopOrder}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white font-montserrat font-bold disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Instruksi Teknis Mesin & Operator */}
          <div className="p-5 rounded-2xl bg-amber-500/[0.04] border border-amber-500/25 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2 text-xs font-montserrat font-bold text-amber-300 uppercase tracking-wider">
                <Settings className="w-4 h-4 text-amber-400" />
                <span>2. Instruksi Mesin & Penugasan Operator</span>
              </div>
              <span className="text-[10px] font-bold text-amber-400/80 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                PENTING UNTUK WORKSHOP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Operator Penanggung Jawab */}
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Operator Penanggung Jawab</span>
                </label>
                <select
                  value={operatorName}
                  onChange={(e) => {
                    setOperatorName(e.target.value);
                    if (e.target.value !== 'Lainnya') setCustomOperator('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/15 text-white text-xs font-montserrat font-bold"
                >
                  {OPERATOR_PRESETS.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                  <option value="Lainnya">➕ Tulis Nama Operator Baru...</option>
                </select>

                {operatorName === 'Lainnya' && (
                  <input
                    type="text"
                    value={customOperator}
                    onChange={(e) => setCustomOperator(e.target.value)}
                    placeholder="Ketik nama operator..."
                    className="w-full mt-2 px-3 py-2 rounded-xl bg-zinc-900 border border-amber-500/40 text-white text-xs"
                    autoFocus
                  />
                )}
              </div>

              {/* Mesin Sablon Yang Ditugaskan */}
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mesin Sablon Ditugaskan</span>
                </label>
                <select
                  value={machineName}
                  onChange={(e) => setMachineName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/15 text-white text-xs font-semibold"
                >
                  {MACHINE_PRESETS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prioritas Produksi */}
              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tingkat Prioritas Pengerjaan</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['NORMAL', 'URGENT', 'KILAT'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriorityLevel(p)}
                      className={`py-2 px-1 text-[11px] font-montserrat font-bold rounded-xl border text-center transition-all ${
                        priorityLevel === p
                          ? p === 'KILAT'
                            ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                            : p === 'URGENT'
                            ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                            : 'bg-white text-black border-white shadow-md'
                          : 'bg-white/[0.03] text-zinc-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {p === 'NORMAL' ? '🟢 Normal' : p === 'URGENT' ? '🟡 Urgen' : '🔴 Kilat'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Film Screen & Spesifikasi Tinta */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-montserrat font-bold text-zinc-200 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-white" />
                <span>3. Screen Klise Film & Formula Tinta</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              {/* No Screen & Status Klise */}
              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">Nomor / Rak Screen</label>
                <input
                  type="text"
                  value={screenNumber}
                  onChange={(e) => setScreenNumber(e.target.value)}
                  placeholder="e.g. SCR-A01, Rak 3"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-mono font-bold"
                />

                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setScreenStatus('READY')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all ${
                      screenStatus === 'READY'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'border-white/10 text-zinc-400'
                    }`}
                  >
                    Screen Siap Pakai
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreenStatus('NEED_AFDRUK')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all ${
                      screenStatus === 'NEED_AFDRUK'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'border-white/10 text-zinc-400'
                    }`}
                  >
                    Afdruk Baru
                  </button>
                </div>
              </div>

              {/* Tipe Kasa Mesh */}
              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">Tipe Kasa / Mesh Screen</label>
                <select
                  value={meshType}
                  onChange={(e) => setMeshType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                >
                  {MESH_PRESETS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jenis Tinta & Cat */}
              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">Jenis Tinta Sablon</label>
                <select
                  value={inkType}
                  onChange={(e) => setInkType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-semibold"
                >
                  {INK_TYPE_PRESETS.map((it) => (
                    <option key={it} value={it}>
                      {it}
                    </option>
                  ))}
                </select>
              </div>

              {/* Warna Tinta Cetak */}
              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">Warna Tinta Cetak</label>
                <div className="flex items-center gap-2">
                  <span
                    className="w-8 h-8 rounded-xl border border-white/30 shrink-0 shadow-xs"
                    style={{ backgroundColor: inkHex }}
                  />
                  <input
                    type="text"
                    value={inkColorName}
                    onChange={(e) => setInkColorName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-bold"
                  />
                </div>
              </div>

              {/* Posisi & Dimensi Cetak */}
              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">Jarak dari Bibir Cup</label>
                <input
                  type="text"
                  value={printDistance}
                  onChange={(e) => setPrintDistance(e.target.value)}
                  placeholder="e.g. 2.0 cm dari bibir cup"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">Dimensi File / Desain</label>
                <input
                  type="text"
                  value={designDimensions}
                  onChange={(e) => setDesignDimensions(e.target.value)}
                  placeholder="e.g. Lebar 7 cm × Tinggi 5.5 cm"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Instruksi Khusus Operator & Kontrol QC */}
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-xs font-montserrat font-bold text-zinc-200 uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>4. Instruksi Khusus Operator & Standar QC</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-2 font-medium">
                Klik tag cepat untuk menambahkan instruksi ke lembar kerja operator:
              </label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {QUICK_QC_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddQcTag(tag)}
                    className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:border-amber-400/50 hover:bg-amber-400/10 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={productionNotes}
                onChange={(e) => setProductionNotes(e.target.value)}
                placeholder="Catatan tambahan untuk operator mesin atau finishing..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs font-inter focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Tahap Awal SPK */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/5">
              <div>
                <span className="text-xs font-montserrat font-bold text-white block">
                  Status Alur Setelah SPK Diterbitkan:
                </span>
                <span className="text-[11px] text-zinc-400 font-inter">
                  Pilih tahap antrean awal saat SPK ini diserahkan ke workshop
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInitialStatus('ANTREAN')}
                  className={`px-3 py-2 rounded-xl text-xs font-montserrat font-bold border transition-all ${
                    initialStatus === 'ANTREAN'
                      ? 'bg-white text-black border-white shadow-xs'
                      : 'bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  1. Masuk Antrean Mesin
                </button>
                <button
                  type="button"
                  onClick={() => setInitialStatus('SETTING_FILM')}
                  className={`px-3 py-2 rounded-xl text-xs font-montserrat font-bold border transition-all ${
                    initialStatus === 'SETTING_FILM'
                      ? 'bg-amber-500 text-black border-amber-400 shadow-xs'
                      : 'bg-white/[0.04] text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  2. Langsung Setting Film / Afdruk
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-white/10 bg-zinc-950/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-zinc-400 font-inter">
            SPK akan tercatat resmi di antrean produksi dengan penanggung jawab{' '}
            <strong className="text-white font-montserrat font-bold">{customOperator || operatorName}</strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white text-xs font-inter font-semibold transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-montserrat font-bold transition-all"
              title="Terbitkan SPK dan langsung buka pratinjau cetak"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-300" />
              <span>Terbitkan & Cetak SPK</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-montserrat font-black shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>🚀 Terbitkan SPK Produksi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
