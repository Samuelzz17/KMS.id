import React, { useState } from 'react';
import { CupProduct, SablonPricingTier, SablonSides } from '../types';
import { formatNumber, formatRupiah } from '../utils/formatters';
import { Calculator, Check, Copy, X, Sparkles, AlertCircle } from 'lucide-react';

interface CostEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cups: CupProduct[];
  pricingTiers: SablonPricingTier[];
  onCreateOrderFromEstimate?: (estimate: {
    cupId: string;
    quantity: number;
    sides: SablonSides;
    inkColor: string;
    filmFee: number;
    totalPrice: number;
  }) => void;
}

export const CostEstimatorModal: React.FC<CostEstimatorModalProps> = ({
  isOpen,
  onClose,
  cups,
  pricingTiers,
  onCreateOrderFromEstimate,
}) => {
  const [selectedCupId, setSelectedCupId] = useState<string>(cups[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1000);
  const [sides, setSides] = useState<SablonSides>('1 Sisi');
  const [inkColor, setInkColor] = useState<string>('Hitam Solid');
  const [isRepeatOrder, setIsRepeatOrder] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedCup = cups.find((c) => c.id === selectedCupId) || cups[0];

  const activeTier =
    pricingTiers.find((t) => quantity >= t.minQty && quantity <= t.maxQty) ||
    pricingTiers[pricingTiers.length - 1];

  let unitSablonFee = 0;
  if (sides === '1 Sisi') {
    unitSablonFee = activeTier?.pricePerPcs1Sisi || 180;
  } else if (sides === '2 Sisi') {
    unitSablonFee = activeTier?.pricePerPcs2Sisi || 230;
  } else if (sides === 'Keliling 360°') {
    unitSablonFee = activeTier?.pricePerPcsKeliling || 300;
  }

  const isFreeFilm = sides === 'Polos (Tanpa Sablon)' || isRepeatOrder || (activeTier ? activeTier.freeFilm : false);
  const filmFee = isFreeFilm ? 0 : 40000;

  const cupCostPerPcs = selectedCup?.costPricePerPcs || 0;
  const inkAndLaborCostPerPcs = sides === 'Polos (Tanpa Sablon)' ? 0 : 45;
  const totalCost = (cupCostPerPcs + inkAndLaborCostPerPcs) * quantity + (sides === 'Polos (Tanpa Sablon)' || isRepeatOrder ? 0 : 15000);

  const cupSellPricePerPcs = selectedCup?.sellPricePolosPerPcs || 0;
  const totalCupSellPrice = cupSellPricePerPcs * quantity;
  const totalSablonFee = unitSablonFee * quantity;
  const grandTotal = totalCupSellPrice + totalSablonFee + filmFee;
  const pricePerPcsFinal = Math.round(grandTotal / (quantity || 1));

  const netProfit = grandTotal - totalCost;
  const marginPercent = grandTotal > 0 ? Math.round((netProfit / grandTotal) * 100) : 0;

  const getQuotationText = () => {
    return `*PENAWARAN HARGA SABLON CUP KMS.id*
---------------------------------------
Halo Kak, berikut estimasi penawaran cetak sablon cup:

*Item:* ${selectedCup?.name || 'Cup Plastik PP'}
*Kuantiti:* ${formatNumber(quantity)} pcs
*Varian Sablon:* ${sides} (Warna: ${inkColor})
*Status Film/Screen:* ${isFreeFilm ? 'GRATIS (Promo / Repeat Order)' : 'Biaya Setting Film: ' + formatRupiah(filmFee)}

*Rincian Harga:*
- Cup + Sablon per pcs: ${formatRupiah(pricePerPcsFinal)}/pcs
- Subtotal Produk: ${formatRupiah(totalCupSellPrice + totalSablonFee)}
${filmFee > 0 ? `- Biaya Master Film: ${formatRupiah(filmFee)}\n` : ''}
*TOTAL ESTIMASI:* ${formatRupiah(grandTotal)}

*Keunggulan Cetak KMS.id:*
✓ Tinta sablon solvent PP anti kelupas & tahan air es
✓ Pengerjaan rapi & presisi
✓ Master screen klise disimpan 6 bulan gratis
✓ Garansi cetak ulang jika terjadi cacat produksi

Untuk konfirmasi pemesanan, silakan balas pesan ini ya Kak!`;
  };

  const handleCopyQuotation = () => {
    navigator.clipboard.writeText(getQuotationText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectOrder = () => {
    if (onCreateOrderFromEstimate && selectedCup) {
      onCreateOrderFromEstimate({
        cupId: selectedCup.id,
        quantity,
        sides,
        inkColor,
        filmFee,
        totalPrice: grandTotal,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel border border-white/20 w-full max-w-2xl overflow-hidden my-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] font-inter">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-montserrat font-black text-white">Kalkulator Estimasi Biaya KMS.id</h3>
              <p className="text-xs text-zinc-400">
                Hitung instan HPP, proyeksi profit, dan generate teks penawaran instan
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section: Parameter Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pilihan Cup */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-montserrat font-bold text-zinc-300 uppercase tracking-wider">
                1. Pilih Jenis Cup Plastik
              </label>
              <select
                value={selectedCupId}
                onChange={(e) => setSelectedCupId(e.target.value)}
                className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden font-medium"
              >
                {cups.map((cup) => (
                  <option key={cup.id} value={cup.id}>
                    {cup.name} ({cup.size} - {cup.grammage}) | Stok: {formatNumber(cup.stockPcs)} pcs | Modal: {formatRupiah(cup.costPricePerPcs)}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                <span>HPP Beli (Modal): <strong className="text-white">{formatRupiah(selectedCup?.costPricePerPcs || 0)}</strong></span>
                <span>Jual Polos: <strong className="text-white">{formatRupiah(selectedCup?.sellPricePolosPerPcs || 0)}</strong></span>
              </div>
            </div>

            {/* Kuantiti */}
            <div className="space-y-1.5">
              <label className="text-xs font-montserrat font-bold text-zinc-300 uppercase tracking-wider">
                2. Jumlah Pesanan (Pcs)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(100, parseInt(e.target.value) || 0))}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white font-montserrat font-bold focus:outline-hidden focus:border-white/30"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-montserrat font-bold text-zinc-400">PCS</span>
              </div>
              <div className="flex gap-1.5 pt-1">
                {[500, 1000, 2000, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuantity(preset)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-montserrat font-bold border transition-colors ${
                      quantity === preset
                        ? 'bg-white text-black border-white shadow-xs'
                        : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {formatNumber(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sisi Sablon */}
            <div className="space-y-1.5">
              <label className="text-xs font-montserrat font-bold text-zinc-300 uppercase tracking-wider">
                3. Sisi Sablon
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(['Polos (Tanpa Sablon)', '1 Sisi', '2 Sisi', 'Keliling 360°'] as SablonSides[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSides(s)}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                      sides === s
                        ? 'bg-white text-black font-montserrat font-bold border-white shadow-xs'
                        : 'bg-white/[0.03] text-zinc-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-400 pt-1">
                Tarif sablon: <strong className="text-white">{formatRupiah(unitSablonFee)}/pcs</strong>
              </p>
            </div>

            {/* Warna Tinta */}
            <div className="space-y-1.5">
              <label className="text-xs font-montserrat font-bold text-zinc-300 uppercase tracking-wider">
                4. Warna Tinta Sablon
              </label>
              <select
                value={inkColor}
                onChange={(e) => setInkColor(e.target.value)}
                className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-hidden"
              >
                <option value="Hitam Solid">Hitam Solid (Paling Populer)</option>
                <option value="Putih Solid">Putih Solid (Cocok Minuman Gelap/Kopi)</option>
                <option value="Emas Gold Metallic">Emas Gold Metallic (+Elegan)</option>
                <option value="Hijau Botol / Emerald">Hijau Botol / Emerald</option>
                <option value="Merah Cabe Solid">Merah Cabe Solid</option>
                <option value="Biru Navy / BCA">Biru Navy / BCA</option>
                <option value="Cokelat Mocca">Cokelat Mocca</option>
                <option value="Kuning Kunyit">Kuning Kunyit</option>
              </select>
            </div>

            {/* Status Film */}
            <div className="space-y-1.5">
              <label className="text-xs font-montserrat font-bold text-zinc-300 uppercase tracking-wider">
                5. Film Klise Afdruk
              </label>
              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="checkbox"
                  id="filmCheck"
                  checked={isRepeatOrder}
                  onChange={(e) => setIsRepeatOrder(e.target.checked)}
                  className="w-4 h-4 rounded text-white bg-zinc-900 border-white/20"
                />
                <label htmlFor="filmCheck" className="text-xs text-zinc-300 font-medium cursor-pointer">
                  Repeat Order / Screen Sudah Ada (Gratis Film)
                </label>
              </div>
              <p className="text-[11px] text-zinc-400">
                {isFreeFilm ? (
                  <span className="text-white font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Gratis biaya film klise ({quantity >= 1000 ? 'Promo Qty ≥ 1.000' : 'Repeat Order'})
                  </span>
                ) : (
                  <span className="text-zinc-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Kuantiti di bawah 1.000 pcs dikenakan film Rp 40.000
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Section: Hasil Kalkulasi / Breakdown */}
          <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-montserrat font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-white" />
                Rincian Biaya & Rekomendasi Harga
              </h4>
              <div className="text-right">
                <span className="text-xs text-zinc-400">Harga per cup: </span>
                <span className="text-base font-montserrat font-black text-white">{formatRupiah(pricePerPcsFinal)}</span>
                <span className="text-xs text-zinc-400">/pcs</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="glass-card p-3 rounded-xl border border-white/10">
                <span className="text-[11px] text-zinc-400 block uppercase font-medium">HPP Modal Cup</span>
                <span className="text-sm font-montserrat font-bold text-white">{formatRupiah(cupCostPerPcs * quantity)}</span>
                <span className="text-[10px] text-zinc-400 block">@{formatRupiah(cupCostPerPcs)}/pcs</span>
              </div>
              <div className="glass-card p-3 rounded-xl border border-white/10">
                <span className="text-[11px] text-zinc-400 block uppercase font-medium">HPP Tinta & Tenaga</span>
                <span className="text-sm font-montserrat font-bold text-white">{formatRupiah(inkAndLaborCostPerPcs * quantity)}</span>
                <span className="text-[10px] text-zinc-400 block">@{formatRupiah(inkAndLaborCostPerPcs)}/pcs</span>
              </div>
              <div className="glass-card p-3 rounded-xl border border-white/20 bg-white/10">
                <span className="text-[11px] text-white block uppercase font-bold">Total Harga Jual</span>
                <span className="text-base font-montserrat font-black text-white">{formatRupiah(grandTotal)}</span>
                <span className="text-[10px] text-zinc-300 block">{formatNumber(quantity)} pcs + sablon</span>
              </div>
              <div className="glass-card p-3 rounded-xl border border-white/20 bg-white/10">
                <span className="text-[11px] text-white block uppercase font-bold">Estimasi Laba Bersih</span>
                <span className="text-base font-montserrat font-black text-white">{formatRupiah(netProfit)}</span>
                <span className="text-[10px] text-zinc-300 font-semibold block">Margin ~{marginPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyQuotation}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white font-inter font-semibold text-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Teks Penawaran Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-zinc-400" />
                <span>Salin Teks Penawaran WA</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white font-inter font-semibold text-xs transition-colors"
            >
              Tutup
            </button>
            {onCreateOrderFromEstimate && (
              <button
                type="button"
                onClick={handleDirectOrder}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-montserrat font-black text-xs shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.01]"
              >
                <span>Buat Sales Invoice Dari Estimasi</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
