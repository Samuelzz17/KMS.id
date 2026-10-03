import React, { useState, useEffect, useMemo } from 'react';
import { CupProduct, Customer, CustomerOrder, SablonPricingTier, SablonSides, SalesInvoice } from '../types';
import { formatNumber, formatRupiah } from '../utils/formatters';
import { X, Package, Layers, DollarSign, User, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateOrder: (updatedOrder: CustomerOrder) => void;
  onSaveSalesInvoice: (invoice: SalesInvoice, spks: CustomerOrder[]) => void;
  cups: CupProduct[];
  pricingTiers: SablonPricingTier[];
  customers: Customer[];
  editingOrder?: CustomerOrder | null;
  initialEstimate?: {
    cupId: string;
    quantity: number;
    sides: SablonSides;
    inkColor: string;
    filmFee: number;
    totalPrice: number;
  } | null;
  prefilledCustomer?: Customer | null;
}

const INK_PRESETS = [
  { name: 'Hitam Solid', hex: '#18181B' },
  { name: 'Putih Solid', hex: '#FFFFFF' },
  { name: 'Emas Gold Metallic', hex: '#D4AF37' },
  { name: 'Hijau Botol Tua', hex: '#1B4D3E' },
  { name: 'Merah Cabe Solid', hex: '#DC2626' },
  { name: 'Biru Navy / BCA', hex: '#1D4ED8' },
  { name: 'Cokelat Mocca', hex: '#5C3826' },
  { name: 'Kuning Kunyit', hex: '#EAB308' },
];

interface OrderItemForm {
  id: string;
  cupProductId: string;
  quantity: number;
  sides: SablonSides;
  inkColorName: string;
  inkHex: string;
  customInkNotes: string;
  hasExistingFilm: boolean;
  filmFee: number;
  operatorName: string;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onUpdateOrder,
  onSaveSalesInvoice,
  cups,
  pricingTiers,
  customers,
  editingOrder,
  initialEstimate,
  prefilledCustomer,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerBrand, setCustomerBrand] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  
  const [items, setItems] = useState<OrderItemForm[]>([{
    id: Date.now().toString(),
    cupProductId: cups[0]?.id || '',
    quantity: 1000,
    sides: '1 Sisi',
    inkColorName: 'Hitam Solid',
    inkHex: '#18181B',
    customInkNotes: '',
    hasExistingFilm: false,
    filmFee: 40000,
    operatorName: 'Agus Subekti'
  }]);

  const [downPayment, setDownPayment] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Transfer BCA');
  const [additionalCost, setAdditionalCost] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingOrder) {
      setCustomerName(editingOrder.customerName);
      setCustomerBrand(editingOrder.customerBrand);
      setCustomerPhone(editingOrder.customerPhone);
      setCustomerAddress(editingOrder.customerAddress || '');
      setDeadlineDate(editingOrder.deadlineDate ? editingOrder.deadlineDate.slice(0, 10) : '');
      setDownPayment(editingOrder.downPayment);
      setPaymentMethod(editingOrder.paymentMethod || 'Transfer BCA');
      setAdditionalCost(editingOrder.additionalCost);
      setNotes(editingOrder.notes || '');

      setItems([{
        id: editingOrder.id,
        cupProductId: editingOrder.cupProductId,
        quantity: editingOrder.quantityPcs,
        sides: editingOrder.sablonSides,
        inkColorName: editingOrder.inkColorName,
        inkHex: editingOrder.inkHex,
        customInkNotes: editingOrder.customInkNotes || '',
        hasExistingFilm: editingOrder.hasExistingFilm,
        filmFee: editingOrder.filmFee,
        operatorName: editingOrder.operatorName || 'Agus Subekti',
      }]);
    } else if (initialEstimate) {
      const match = INK_PRESETS.find((p) => p.name === initialEstimate.inkColor);
      setItems([{
        id: Date.now().toString(),
        cupProductId: initialEstimate.cupId,
        quantity: initialEstimate.quantity,
        sides: initialEstimate.sides,
        inkColorName: initialEstimate.inkColor,
        inkHex: match ? match.hex : '#18181B',
        customInkNotes: '',
        hasExistingFilm: initialEstimate.filmFee === 0,
        filmFee: initialEstimate.filmFee,
        operatorName: 'Agus Subekti'
      }]);
    } else if (prefilledCustomer) {
      setCustomerName(prefilledCustomer.name);
      setCustomerBrand(prefilledCustomer.brand);
      setCustomerPhone(prefilledCustomer.phone);
      setCustomerAddress(prefilledCustomer.address || '');
      setDeadlineDate('');
      setDownPayment(0);
      setAdditionalCost(0);
      setNotes(prefilledCustomer.notes ? `Repeat Order: ${prefilledCustomer.notes}` : 'Repeat order mitra.');
      setItems([{
        id: Date.now().toString(),
        cupProductId: cups[0]?.id || '',
        quantity: 1000,
        sides: '1 Sisi',
        inkColorName: 'Hitam Solid',
        inkHex: '#18181B',
        customInkNotes: '',
        hasExistingFilm: true,
        filmFee: 0,
        operatorName: 'Agus Subekti'
      }]);
    } else {
       // Reset
      setCustomerName('');
      setCustomerBrand('');
      setCustomerPhone('');
      setCustomerAddress('');
      setDeadlineDate('');
      setDownPayment(0);
      setAdditionalCost(0);
      setNotes('');
      setItems([{
        id: Date.now().toString(),
        cupProductId: cups[0]?.id || '',
        quantity: 1000,
        sides: '1 Sisi',
        inkColorName: 'Hitam Solid',
        inkHex: '#18181B',
        customInkNotes: '',
        hasExistingFilm: false,
        filmFee: 40000,
        operatorName: 'Agus Subekti'
      }]);
    }
  }, [editingOrder, initialEstimate, prefilledCustomer, isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      cupProductId: cups[0]?.id || '',
      quantity: 1000,
      sides: '1 Sisi',
      inkColorName: 'Hitam Solid',
      inkHex: '#18181B',
      customInkNotes: '',
      hasExistingFilm: false,
      filmFee: 40000,
      operatorName: 'Agus Subekti'
    }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof OrderItemForm, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'inkColorName') {
          const preset = INK_PRESETS.find(p => p.name === value);
          return { ...item, inkColorName: value, inkHex: preset ? preset.hex : item.inkHex };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const calculatedItems = items.map(item => {
    const selectedCup = cups.find((c) => c.id === item.cupProductId);
    const activeTier = pricingTiers.find((t) => item.quantity >= t.minQty && item.quantity <= t.maxQty) || pricingTiers[pricingTiers.length - 1];
    
    let unitSablonFee = activeTier?.pricePerPcs1Sisi || 180;
    if (item.sides === 'Polos (Tanpa Sablon)') {
      unitSablonFee = 0;
    } else if (item.sides === '2 Sisi') {
      unitSablonFee = activeTier?.pricePerPcs2Sisi || 230;
    } else if (item.sides === 'Keliling 360°') {
      unitSablonFee = activeTier?.pricePerPcsKeliling || 300;
    }

    const autoFilmFee = item.sides === 'Polos (Tanpa Sablon)' ? 0 : (item.hasExistingFilm || (activeTier?.freeFilm) ? 0 : 40000);
    const currentFilmFee = editingOrder ? item.filmFee : autoFilmFee;

    const cupPricePerPcs = selectedCup?.sellPricePolosPerPcs || 400;
    const totalPerPcs = cupPricePerPcs + unitSablonFee;
    const itemSubtotal = (totalPerPcs * item.quantity) + currentFilmFee;

    return {
      ...item,
      selectedCup,
      activeTier,
      unitSablonFee,
      currentFilmFee,
      cupPricePerPcs,
      totalPerPcs,
      itemSubtotal
    };
  });

  const totalItemSubtotals = calculatedItems.reduce((acc, curr) => acc + curr.itemSubtotal, 0);
  const grandTotal = totalItemSubtotals + additionalCost;
  const numDP = Math.round(Number(downPayment) || 0);
  const numGrandTotal = Math.round(Number(grandTotal) || 0);
  const remainingPayment = Math.max(0, numGrandTotal - numDP);

  let paymentStatus: 'LUNAS' | 'DP' | 'BELUM_BAYAR' = 'BELUM_BAYAR';
  if (numGrandTotal > 0 && numDP >= numGrandTotal) {
    paymentStatus = 'LUNAS';
  } else if (numDP > 0) {
    paymentStatus = 'DP';
  } else {
    paymentStatus = 'BELUM_BAYAR';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (editingOrder) {
      // Edit single SPK
      const item = calculatedItems[0];
      const updatedOrder: CustomerOrder = {
        ...editingOrder,
        customerName,
        customerBrand,
        customerPhone,
        customerAddress,
        deadlineDate: new Date(deadlineDate).toISOString(),
        cupProductId: item.cupProductId,
        cupProductName: item.selectedCup?.name || '',
        cupSize: item.selectedCup?.size || '',
        cupGrammage: item.selectedCup?.grammage || '',
        quantityPcs: item.quantity,
        sablonSides: item.sides,
        inkColorName: item.inkColorName,
        inkHex: item.inkHex,
        customInkNotes: item.customInkNotes,
        hasExistingFilm: item.hasExistingFilm,
        filmFee: item.currentFilmFee,
        cupPricePerPcs: item.cupPricePerPcs,
        sablonPricePerPcs: item.unitSablonFee,
        totalPerPcs: item.totalPerPcs,
        subtotal: item.itemSubtotal,
        additionalCost,
        totalPrice: numGrandTotal,
        downPayment: Math.min(numDP, numGrandTotal),
        remainingPayment,
        paymentStatus,
        paymentMethod,
        notes: notes.trim(),
        operatorName: item.operatorName,
      };
      onUpdateOrder(updatedOrder);
    } else {
      // New Invoice & SPKs
      const invoiceId = `inv-${Date.now()}`;
      const invNum = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const newInvoice: SalesInvoice = {
        id: invoiceId,
        invoiceNumber: invNum,
        createdAt: new Date().toISOString(),
        deadlineDate: new Date(deadlineDate).toISOString(),
        customerName,
        customerBrand,
        customerPhone,
        customerAddress,
        subtotal: totalItemSubtotals,
        additionalCost,
        totalPrice: numGrandTotal,
        downPayment: Math.min(numDP, numGrandTotal),
        remainingPayment,
        paymentStatus,
        paymentMethod,
        notes: notes.trim(),
      };

      const baseSpkNum = invNum.replace('INV', 'SPK');
      let remainingDptoAllocate = numDP;
      
      const spks: CustomerOrder[] = calculatedItems.map((item, index) => {
        const suffix = String.fromCharCode(65 + index); // A, B, C...
        const isSingleItem = calculatedItems.length === 1;
        const itemTotalPrice = isSingleItem ? numGrandTotal : item.itemSubtotal;

        let itemDP = 0;
        let itemRemaining = itemTotalPrice;
        let itemPaymentStatus: 'LUNAS' | 'DP' | 'BELUM_BAYAR' = 'BELUM_BAYAR';

        if (paymentStatus === 'LUNAS') {
          itemDP = itemTotalPrice;
          itemRemaining = 0;
          itemPaymentStatus = 'LUNAS';
        } else if (paymentStatus === 'DP') {
          if (isSingleItem) {
            itemDP = numDP;
            itemRemaining = Math.max(0, itemTotalPrice - numDP);
            itemPaymentStatus = itemRemaining === 0 ? 'LUNAS' : 'DP';
          } else {
            const allocated = Math.min(remainingDptoAllocate, item.itemSubtotal);
            remainingDptoAllocate -= allocated;
            itemDP = allocated;
            itemRemaining = Math.max(0, item.itemSubtotal - allocated);
            itemPaymentStatus = itemRemaining === 0 ? 'LUNAS' : (allocated > 0 ? 'DP' : 'BELUM_BAYAR');
          }
        } else {
          itemDP = 0;
          itemRemaining = itemTotalPrice;
          itemPaymentStatus = 'BELUM_BAYAR';
        }

        return {
          id: `ord-${Date.now()}-${index}`,
          orderNumber: `${baseSpkNum}-${suffix}`,
          invoiceId,
          createdAt: newInvoice.createdAt,
          deadlineDate: newInvoice.deadlineDate,
          customerName,
          customerBrand,
          customerPhone,
          customerAddress,
          cupProductId: item.cupProductId,
          cupProductName: item.selectedCup?.name || '',
          cupSize: item.selectedCup?.size || '',
          cupGrammage: item.selectedCup?.grammage || '',
          quantityPcs: item.quantity,
          sablonSides: item.sides,
          inkColorName: item.inkColorName,
          inkHex: item.inkHex,
          customInkNotes: item.customInkNotes,
          hasExistingFilm: item.hasExistingFilm,
          filmFee: item.currentFilmFee,
          cupPricePerPcs: item.cupPricePerPcs,
          sablonPricePerPcs: item.unitSablonFee,
          totalPerPcs: item.totalPerPcs,
          subtotal: item.itemSubtotal,
          additionalCost: isSingleItem ? additionalCost : 0,
          totalPrice: itemTotalPrice,
          downPayment: itemDP,
          remainingPayment: itemRemaining,
          paymentStatus: itemPaymentStatus,
          paymentMethod,
          productionStatus: item.sides === 'Polos (Tanpa Sablon)' ? 'SIAP_AMBIL' : 'MENUNGGU_SPK',
          rejectPcs: 0,
          notes: notes.trim(),
          operatorName: item.operatorName,
        };
      });

      onSaveSalesInvoice(newInvoice, spks);
    }
  };

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const cust = customers.find((c) => c.brand === val);
    if (cust) {
      setCustomerBrand(cust.brand);
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone);
      setCustomerAddress(cust.address || '');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-[#0a0a0a] border border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-[2rem] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08] bg-[#111] backdrop-blur-xl z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-widest">
                BAGIAN PENJUALAN / SALES
              </span>
              <span className="text-xs text-zinc-400 font-inter">• Faktur & Tagihan</span>
            </div>
            <h2 className="text-2xl font-montserrat font-black text-white tracking-tight">
              {editingOrder ? `Edit Sales Invoice: ${editingOrder.orderNumber}` : 'Form Sales (Invoice Penjualan)'}
            </h2>
            <p className="text-xs text-zinc-400 font-inter mt-0.5">
              {editingOrder
                ? 'Ubah data pesanan pelanggan dan rincian transaksi'
                : 'Pencatatan order baru, spesifikasi cetak cup, dan penerbitan faktur tagihan / uang muka (DP).'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          <form id="orderForm" onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Customer Info */}
            <div className="bg-[#111] p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-lg relative overflow-hidden group hover:border-white/[0.15] transition-colors duration-500">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
                <User className="w-24 h-24" />
              </div>
              <h3 className="text-sm font-montserrat font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">1</span>
                Informasi Pelanggan (Brand)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                {!editingOrder && customers.length > 0 && (
                  <div className="lg:col-span-4">
                    <label className="text-xs font-medium text-zinc-300 block mb-1">Pilih Pelanggan Langganan (Opsional)</label>
                    <select onChange={handleCustomerSelect} className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white">
                      <option value="">-- Ketik manual atau pilih dari riwayat --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.brand}>{c.brand} ({c.name})</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Nama Brand / Toko *</label>
                  <input type="text" required value={customerBrand} onChange={e => setCustomerBrand(e.target.value)} placeholder="Contoh: Kopi Kenangan" className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Nama PIC Pemesan *</label>
                  <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Contoh: Budi Santoso" className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Nomor WhatsApp *</label>
                  <input type="tel" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="0812..." className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">Tenggat Waktu (Deadline) *</label>
                  <input type="date" required value={deadlineDate} onChange={e => setDeadlineDate(e.target.value)} className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white" />
                </div>
              </div>
            </div>

            {/* 2. Items / SPK */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-montserrat font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">2</span>
                  Detail Produk & Spesifikasi Sablon
                </h3>
                {!editingOrder && (
                  <button type="button" onClick={handleAddItem} className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 flex items-center gap-1.5 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Tambah Cup
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {calculatedItems.map((item, index) => (
                  <div key={item.id} className="bg-[#111] p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-lg relative overflow-hidden group hover:border-white/[0.15] transition-colors duration-500">
                    {!editingOrder && items.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItem(item.id)} className="absolute top-4 right-4 p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left: Cup & Qty */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Item {index + 1}: Bahan Baku</h4>
                        <div>
                          <label className="text-xs font-medium text-zinc-300 block mb-1">Jenis Cup Plastik *</label>
                          <select value={item.cupProductId} onChange={e => handleUpdateItem(item.id, 'cupProductId', e.target.value)} className="w-full text-xs font-semibold px-3 py-2.5 border border-white/10 rounded-xl bg-white/[0.04] text-white focus:bg-white/[0.08] focus:border-blue-500/50 outline-none">
                            {cups.map(c => (
                              <option key={c.id} value={c.id} className="bg-zinc-800">
                                {c.name} (Stok: {formatNumber(c.stockPcs)}) - {formatRupiah(c.sellPricePolosPerPcs)}/pcs
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-zinc-300 block mb-1">Jumlah Cetak (pcs) *</label>
                          <div className="flex items-center gap-2">
                            {[500, 1000, 2000].map(q => (
                              <button key={q} type="button" onClick={() => handleUpdateItem(item.id, 'quantity', q)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${item.quantity === q ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'}`}>
                                {formatNumber(q)}
                              </button>
                            ))}
                            <input type="number" required min="50" step="50" value={item.quantity} onChange={e => handleUpdateItem(item.id, 'quantity', Number(e.target.value))} className="flex-1 text-xs px-3 py-1.5 border border-white/10 rounded-lg bg-white/[0.04] text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Right: Sablon Specs */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Spesifikasi Cetak</h4>
                        <div>
                          <label className="text-xs font-medium text-zinc-300 block mb-1">Sisi Sablon</label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {(['Polos (Tanpa Sablon)', '1 Sisi', '2 Sisi', 'Keliling 360°'] as SablonSides[]).map(s => (
                              <button key={s} type="button" onClick={() => handleUpdateItem(item.id, 'sides', s)} className={`py-2 px-1 text-[10px] sm:text-xs font-semibold rounded-xl border text-center transition-all ${item.sides === s ? 'bg-white text-black font-montserrat font-bold border-white shadow-sm' : 'bg-white/[0.03] text-zinc-400 border-white/10 hover:text-white hover:bg-white/5'}`}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {item.sides !== 'Polos (Tanpa Sablon)' && (
                          <>
                            <div>
                              <label className="text-xs font-medium text-zinc-300 block mb-1">Warna Tinta Sablon</label>
                              <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-xl border border-white/30 shrink-0" style={{ backgroundColor: item.inkHex }} />
                                <input type="text" value={item.inkColorName} onChange={e => handleUpdateItem(item.id, 'inkColorName', e.target.value)} placeholder="Nama warna tinta" className="w-full text-xs font-semibold px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white" />
                              </div>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {INK_PRESETS.map((p) => (
                                  <button key={p.name} type="button" onClick={() => { handleUpdateItem(item.id, 'inkColorName', p.name); handleUpdateItem(item.id, 'inkHex', p.hex); }} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${item.inkColorName === p.name ? 'border-white bg-white text-black font-bold' : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'}`}>
                                    <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: p.hex }} />
                                    {p.name.split(' ')[0]}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-zinc-300 block mb-1">Film Klise Screen</label>
                              <div className="flex items-center gap-2 pt-1">
                                <input type="checkbox" checked={item.hasExistingFilm} onChange={e => handleUpdateItem(item.id, 'hasExistingFilm', e.target.checked)} className="w-4 h-4 rounded text-white bg-zinc-900 border-white/20" />
                                <label className="text-xs text-zinc-300 font-medium cursor-pointer" onClick={() => handleUpdateItem(item.id, 'hasExistingFilm', !item.hasExistingFilm)}>Repeat Order / Klise Sudah Ada (Biaya Rp 0)</label>
                              </div>
                              <div className="text-[11px] text-zinc-400 mt-1">
                                Biaya klise: <strong className="text-white">{formatRupiah(item.currentFilmFee)}</strong>
                              </div>
                            </div>
                          </>
                        )}

                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                          <p className="text-[11px] text-blue-400 font-medium leading-relaxed">
                            💡 <strong>Catatan:</strong> Detail teknis SPK (seperti penugasan Operator Produksi dan instruksi khusus desain) dapat diisi nanti oleh tim Produksi di menu <strong>Manajemen SPK</strong>.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Subtotal Per Item Indicator */}
                    <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                       <span className="text-xs font-inter text-zinc-400">Subtotal Item:</span>
                       <span className="text-sm font-bold font-montserrat text-white">{formatRupiah(item.itemSubtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Invoice Financials */}
            <div className="bg-[#111] p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-lg relative overflow-hidden group hover:border-white/[0.15] transition-colors duration-500">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
                <DollarSign className="w-24 h-24" />
              </div>
              <h3 className="text-sm font-montserrat font-bold text-white mb-4 flex items-center gap-2 relative z-10">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">3</span>
                Ringkasan Biaya & Pembayaran (Invoice)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1">DP / Uang Muka (Rp)</label>
                    <input type="number" required min="0" value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} className="w-full text-sm font-bold font-mono px-3 py-2.5 border border-amber-500/30 rounded-xl bg-amber-500/10 text-amber-300 focus:outline-none" />
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => setDownPayment(grandTotal)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-montserrat bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                      >
                        <span>⚡ Lunas 100%</span>
                        <span>({formatRupiah(grandTotal)})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDownPayment(Math.round(grandTotal * 0.5))}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-montserrat bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
                      >
                        50% DP
                      </button>
                      <button
                        type="button"
                        onClick={() => setDownPayment(0)}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-montserrat bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10 transition-all"
                      >
                        Rp 0 (Belum DP)
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1">Biaya Tambahan / Ongkir (Rp)</label>
                    <input type="number" min="0" value={additionalCost} onChange={e => setAdditionalCost(Number(e.target.value))} className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1">Metode Pembayaran</label>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white">
                      <option value="Transfer BCA">Transfer BCA</option>
                      <option value="Transfer Mandiri">Transfer Mandiri</option>
                      <option value="QRIS">QRIS / E-Wallet</option>
                      <option value="Cash / Tunai">Cash / Tunai</option>
                      <option value="Tokopedia / Shopee">Marketplace (Tokopedia/Shopee)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1">Catatan Tambahan Invoice (Opsional)</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white min-h-[60px]" />
                  </div>
                </div>

                <div className="bg-black/40 rounded-xl p-5 border border-white/10 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Total Tagihan</h4>
                    <div className="space-y-3 font-mono text-sm">
                      <div className="flex justify-between text-zinc-300">
                        <span>Subtotal Cup ({items.length} item)</span>
                        <span>{formatRupiah(totalItemSubtotals)}</span>
                      </div>
                      <div className="flex justify-between text-zinc-300 pb-3 border-b border-white/10">
                        <span>Biaya Tambahan</span>
                        <span>{formatRupiah(additionalCost)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="font-bold text-white text-base">Grand Total</span>
                        <span className="font-black text-white text-lg font-montserrat">{formatRupiah(grandTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-400">
                        <span>DP Dibayar</span>
                        <span>- {formatRupiah(downPayment)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-white/10">
                        <span className="font-bold text-rose-400">Sisa Tagihan</span>
                        <span className="font-black text-rose-400 text-lg font-montserrat">{formatRupiah(Math.max(0, remainingPayment))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-inter">Status Pembayaran:</span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-inter border ${
                      paymentStatus === 'LUNAS'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                        : paymentStatus === 'DP'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {paymentStatus === 'LUNAS' ? '✓ LUNAS (100% Terbayar)' : paymentStatus === 'DP' ? '⏳ DP DITERIMA' : '✕ BELUM BAYAR'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/[0.08] bg-[#111] flex flex-col sm:flex-row items-center justify-between gap-3 z-10">
          <div className="text-xs text-zinc-400 font-inter">
            💡 Setelah diterbitkan, SPK akan berstatus <strong className="text-amber-300">Menunggu SPK</strong> untuk dilengkapi instruksi teknisnya oleh tim produksi.
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-xs text-zinc-300 bg-white/5 hover:bg-white/10 hover:text-white transition-all">
              Batal
            </button>
            <button type="submit" form="orderForm" className="px-6 py-2.5 rounded-xl font-montserrat font-bold text-xs text-black bg-white hover:bg-zinc-200 transition-colors flex items-center gap-2 shadow-md">
              <span>💾 Terbitkan Sales Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
