import React, { useState } from 'react';
import { CupMaterial, CupProduct, CupType, MovementType, StockMovement } from '../types';
import { formatNumber } from '../utils/formatters';
import { Package, ArrowDownRight, ArrowUpRight, AlertOctagon, X } from 'lucide-react';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'NEW_PRODUCT' | 'MUTATION';
  cups: CupProduct[];
  selectedCup?: CupProduct | null;
  onSaveNewProduct: (product: CupProduct) => void;
  onSaveMutation: (mutation: StockMovement) => void;
}

export const StockModal: React.FC<StockModalProps> = ({
  isOpen,
  onClose,
  mode,
  cups,
  selectedCup,
  onSaveNewProduct,
  onSaveMutation,
}) => {
  // New Product state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<CupType>('Oval');
  const [size, setSize] = useState('16 oz');
  const [grammage, setGrammage] = useState('8 gr');
  const [material, setMaterial] = useState<CupMaterial>('PP');
  const [stockPcs, setStockPcs] = useState(1000);
  const [minStockAlert, setMinStockAlert] = useState(2000);
  const [costPricePerPcs, setCostPricePerPcs] = useState(300);
  const [sellPricePolosPerPcs, setSellPricePolosPerPcs] = useState(420);
  const [description, setDescription] = useState('');

  // Mutation state
  const [targetCupId, setTargetCupId] = useState<string>(selectedCup?.id || cups[0]?.id || '');
  const [movementType, setMovementType] = useState<MovementType>('IN');
  const [mutationQty, setMutationQty] = useState(1000);
  const [notes, setNotes] = useState('');
  const [operator, setOperator] = useState('Gudang Utama KMS.id');

  if (!isOpen) return null;

  const currentTargetCup = cups.find((c) => c.id === (targetCupId || selectedCup?.id)) || cups[0];

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProd: CupProduct = {
      id: `cup-${Date.now()}`,
      code: code.trim() || `KMS-${size.replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      type,
      size,
      grammage,
      material,
      stockPcs,
      minStockAlert,
      costPricePerPcs,
      sellPricePolosPerPcs,
      unitPerSlop: 50,
      unitPerBox: 1000,
      description: description.trim(),
    };

    onSaveNewProduct(newProd);
    onClose();
  };

  const handleMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTargetCup) return;

    const newMutation: StockMovement = {
      id: `mov-${Date.now()}`,
      date: new Date().toISOString(),
      cupProductId: currentTargetCup.id,
      cupProductName: currentTargetCup.name,
      type: movementType,
      quantityPcs: mutationQty,
      notes: notes.trim() || (movementType === 'IN' ? 'Stok Masuk Pabrik' : 'Pengurangan Stok'),
      operatorName: operator.trim(),
    };

    onSaveMutation(newMutation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel border border-white/20 w-full max-w-lg overflow-hidden my-6 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] font-inter">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-montserrat font-black text-white">
                {mode === 'NEW_PRODUCT' ? 'Tambah Varian Cup KMS.id' : 'Catat Mutasi Stok Gudang'}
              </h3>
              <p className="text-xs text-zinc-400">
                {mode === 'NEW_PRODUCT'
                  ? 'Input master data cup baru ke database sistem'
                  : 'Catat penerimaan supplier, penjualan polos, atau reject afkir'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        {mode === 'NEW_PRODUCT' ? (
          <form onSubmit={handleCreateProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Nama Varian Cup <span className="text-white">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Cup Oval PP 18 oz (8.5 gr)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white focus:bg-white/[0.08] focus:border-white/30 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Tipe Bentuk</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CupType)}
                  className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-zinc-900 text-white font-medium focus:outline-hidden"
                >
                  <option value="Datar">Cup Datar (Flat)</option>
                  <option value="Oval">Cup Oval (Cembung Bawah)</option>
                  <option value="Injection">Cup Injection Hardcup</option>
                  <option value="Paper">Paper Cup</option>
                  <option value="Aksesoris">Aksesoris (Lid/Sedotan)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Ukuran (oz / ml)</label>
                <input
                  type="text"
                  placeholder="16 oz / 22 oz"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white focus:bg-white/[0.08] focus:border-white/30 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Gramasi (Berat/Tebal)</label>
                <input
                  type="text"
                  placeholder="7 gr / 8 gr"
                  value={grammage}
                  onChange={(e) => setGrammage(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white focus:bg-white/[0.08] focus:border-white/30 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Bahan Plastik</label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value as CupMaterial)}
                  className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-zinc-900 text-white font-medium focus:outline-hidden"
                >
                  <option value="PP">PP (Polypropylene - Seal Press)</option>
                  <option value="PET">PET (Tebal Kaku Bening)</option>
                  <option value="Paper">Paper Cup Hot/Cold</option>
                  <option value="Plastik">Plastik Campuran</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Stok Awal (Pcs)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={stockPcs}
                  onChange={(e) => setStockPcs(parseInt(e.target.value) || 0)}
                  className="w-full text-xs font-montserrat font-bold px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white focus:bg-white/[0.08] focus:border-white/30 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Batas Minimal Alert (Pcs)</label>
                <input
                  type="number"
                  min="100"
                  value={minStockAlert}
                  onChange={(e) => setMinStockAlert(parseInt(e.target.value) || 0)}
                  className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white focus:bg-white/[0.08] focus:border-white/30 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Harga Modal Beli (HPP)</label>
                <input
                  type="number"
                  min="0"
                  value={costPricePerPcs}
                  onChange={(e) => setCostPricePerPcs(parseInt(e.target.value) || 0)}
                  className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white focus:bg-white/[0.08] focus:border-white/30 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Harga Jual Cup Polos</label>
                <input
                  type="number"
                  min="0"
                  value={sellPricePolosPerPcs}
                  onChange={(e) => setSellPricePolosPerPcs(parseInt(e.target.value) || 0)}
                  className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white font-montserrat font-bold focus:bg-white/[0.08] focus:border-white/30 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Keterangan Tambahan</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cocok untuk es boba, es teh, seal mesin standar..."
                className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white focus:bg-white/[0.08] focus:border-white/30 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-white hover:bg-zinc-200 text-black font-montserrat font-black text-xs rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.01]"
              >
                Simpan Varian Cup
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleMutation} className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Pilih Produk Cup</label>
              <select
                value={targetCupId}
                onChange={(e) => setTargetCupId(e.target.value)}
                className="w-full text-xs font-montserrat font-bold px-3 py-2.5 border border-white/15 rounded-xl bg-zinc-900 text-white focus:outline-hidden"
              >
                {cups.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} | Stok Saat Ini: {formatNumber(c.stockPcs)} pcs
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Jenis Mutasi</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMovementType('IN')}
                  className={`p-2.5 text-xs font-montserrat font-bold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    movementType === 'IN'
                      ? 'bg-white text-black border-white shadow-xs'
                      : 'bg-white/[0.03] text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Stok Masuk</span>
                  <span className="text-[10px] font-normal opacity-70">(Restock Pabrik)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementType('OUT_SALE')}
                  className={`p-2.5 text-xs font-montserrat font-bold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    movementType === 'OUT_SALE'
                      ? 'bg-white text-black border-white shadow-xs'
                      : 'bg-white/[0.03] text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Jual Polos</span>
                  <span className="text-[10px] font-normal opacity-70">(Keluar Toko)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementType('OUT_REJECT')}
                  className={`p-2.5 text-xs font-montserrat font-bold rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    movementType === 'OUT_REJECT'
                      ? 'bg-white text-black border-white shadow-xs'
                      : 'bg-white/[0.03] text-zinc-400 border-white/10 hover:text-white'
                  }`}
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>Reject / Cacat</span>
                  <span className="text-[10px] font-normal opacity-70">(Afkir Cetak)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Jumlah (Pcs)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={mutationQty}
                  onChange={(e) => setMutationQty(parseInt(e.target.value) || 0)}
                  className="w-full text-xs font-montserrat font-bold px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white focus:bg-white/[0.08] focus:border-white/30 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">Petugas / Operator</label>
                <input
                  type="text"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white focus:bg-white/[0.08] focus:border-white/30 focus:outline-hidden font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Catatan Mutasi / Keterangan</label>
              <input
                type="text"
                placeholder="Contoh: Kiriman supplier PT Starindo 5 dus / Reject setting mesin sablon"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-white/10 rounded-xl bg-white/[0.04] text-white focus:bg-white/[0.08] focus:border-white/30 focus:outline-hidden"
              />
            </div>

            <div className="glass-card p-3 rounded-xl border border-white/10 text-xs flex justify-between items-center">
              <span className="text-zinc-400">Estimasi Stok Akhir:</span>
              <span className="font-montserrat font-black text-white text-sm">
                {movementType === 'IN'
                  ? formatNumber(currentTargetCup.stockPcs + mutationQty)
                  : formatNumber(Math.max(0, currentTargetCup.stockPcs - mutationQty))}{' '}
                pcs
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-white hover:bg-zinc-200 text-black font-montserrat font-black text-xs rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.01]"
              >
                Simpan Mutasi
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
