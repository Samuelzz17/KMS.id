import React, { useState } from 'react';
import { SablonPricingTier } from '../types';
import { formatNumber, formatRupiah } from '../utils/formatters';
import { ShieldCheck, Info, CheckCircle2, Wrench, Edit2, Save, X } from 'lucide-react';

interface SablonVariantsProps {
  pricingTiers: SablonPricingTier[];
  onUpdateTier: (updatedTier: SablonPricingTier) => void;
}

export const SablonVariants: React.FC<SablonVariantsProps> = ({
  pricingTiers,
  onUpdateTier,
}) => {
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SablonPricingTier | null>(null);

  const handleEditClick = (tier: SablonPricingTier) => {
    setEditingTierId(tier.id);
    setEditForm({ ...tier });
  };

  const handleSaveClick = () => {
    if (editForm) {
      onUpdateTier(editForm);
    }
    setEditingTierId(null);
    setEditForm(null);
  };

  const handleCancelClick = () => {
    setEditingTierId(null);
    setEditForm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10">
        <h2 className="text-xl font-montserrat font-black text-white tracking-tight">
          Varian & Struktur Tarif Jasa Sablon Cup
        </h2>
        <p className="text-xs text-zinc-400 font-inter mt-0.5">
          Tarif cetak berjenjang berdasarkan kuantiti order (pcs), jumlah sisi, dan kebijakan free film screen
        </p>
      </div>

      {/* Pricing Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {pricingTiers.map((tier) => {
          const isEditing = editingTierId === tier.id;

          if (isEditing && editForm) {
            return (
              <div key={tier.id} className="glass-card rounded-2xl border border-blue-500/30 p-5 flex flex-col justify-between shadow-[0_0_15px_rgba(59,130,246,0.15)] relative">
                <div className="space-y-3 font-inter text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">Label / Nama Rentang</label>
                    <input
                      type="text"
                      value={editForm.label}
                      onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                      className="w-full bg-black/50 border border-white/20 rounded-lg px-2 py-1.5 text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-zinc-400 block mb-1">Min Qty (pcs)</label>
                      <input
                        type="number"
                        value={editForm.minQty}
                        onChange={(e) => setEditForm({ ...editForm, minQty: Number(e.target.value) })}
                        className="w-full bg-black/50 border border-white/20 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1">Max Qty (pcs)</label>
                      <input
                        type="number"
                        value={editForm.maxQty}
                        onChange={(e) => setEditForm({ ...editForm, maxQty: Number(e.target.value) })}
                        className="w-full bg-black/50 border border-white/20 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-white/10 mt-2 space-y-2">
                    <div>
                      <label className="text-zinc-400 block mb-1 flex items-center justify-between">
                        <span>Tarif 1 Sisi</span>
                        <span className="text-[10px]">Rp/pcs</span>
                      </label>
                      <input
                        type="number"
                        value={editForm.pricePerPcs1Sisi}
                        onChange={(e) => setEditForm({ ...editForm, pricePerPcs1Sisi: Number(e.target.value) })}
                        className="w-full bg-black/50 border border-white/20 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1 flex items-center justify-between">
                        <span>Tarif 2 Sisi</span>
                        <span className="text-[10px]">Rp/pcs</span>
                      </label>
                      <input
                        type="number"
                        value={editForm.pricePerPcs2Sisi}
                        onChange={(e) => setEditForm({ ...editForm, pricePerPcs2Sisi: Number(e.target.value) })}
                        className="w-full bg-black/50 border border-white/20 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-400 block mb-1 flex items-center justify-between">
                        <span>Tarif Keliling 360°</span>
                        <span className="text-[10px]">Rp/pcs</span>
                      </label>
                      <input
                        type="number"
                        value={editForm.pricePerPcsKeliling}
                        onChange={(e) => setEditForm({ ...editForm, pricePerPcsKeliling: Number(e.target.value) })}
                        className="w-full bg-black/50 border border-white/20 rounded-lg px-2 py-1.5 text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-end gap-2">
                  <button onClick={handleCancelClick} className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-300 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                  <button onClick={handleSaveClick} className="px-3 py-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/30 flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5" />
                    Simpan
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={tier.id}
              className="glass-card rounded-2xl border border-white/10 p-5 flex flex-col justify-between group relative"
            >
              <button 
                onClick={() => handleEditClick(tier)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 z-10"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 pr-8">
                  <span className="font-montserrat font-bold text-xs text-white bg-white/10 px-2.5 py-1 rounded-md border border-white/15">
                    Min. {formatNumber(tier.minQty)} pcs
                  </span>
                </div>

                <h3 className="font-montserrat font-bold text-white text-sm mt-3">{tier.label}</h3>
                <span className="text-[10px] text-zinc-400 block mb-2 font-mono">Batas Max: {tier.maxQty >= 999999 ? '∞' : formatNumber(tier.maxQty)} pcs</span>

                {/* Rincian Harga per Sisi */}
                <div className="mt-2 space-y-2.5">
                  <div className="flex items-center justify-between p-2.5 bg-white/[0.03] rounded-xl border border-white/10">
                    <span className="text-xs text-zinc-400 font-inter">1 Sisi (Logo Depan)</span>
                    <span className="text-sm font-montserrat font-black text-white">
                      {formatRupiah(tier.pricePerPcs1Sisi)}
                      <span className="text-[10px] font-inter font-normal text-zinc-500">/cup</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white/[0.03] rounded-xl border border-white/10">
                    <span className="text-xs text-zinc-400 font-inter">2 Sisi (Depan & Belakang)</span>
                    <span className="text-sm font-montserrat font-black text-white">
                      {formatRupiah(tier.pricePerPcs2Sisi)}
                      <span className="text-[10px] font-inter font-normal text-zinc-500">/cup</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-white/[0.03] rounded-xl border border-white/10">
                    <span className="text-xs text-zinc-400 font-inter">Keliling 360°</span>
                    <span className="text-sm font-montserrat font-black text-white">
                      {formatRupiah(tier.pricePerPcsKeliling)}
                      <span className="text-[10px] font-inter font-normal text-zinc-500">/cup</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-inter">
                <span className="text-zinc-500">Free Film Klise?</span>
                {tier.freeFilm ? (
                  <span className="font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Ya</span>
                ) : (
                  <span className="text-rose-400">Tidak (+40rb)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Workshop Knowledge & Best Practice Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Standar Teknis Workshop Sablon */}
        <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-3">
          <h3 className="text-sm font-montserrat font-black text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-zinc-300" />
            Standar Teknis Cetak Sablon Cup Plastik
          </h3>
          <ul className="text-xs text-zinc-300 font-inter space-y-2.5 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Tinta Sablon Khusus PP:</strong> Bahan cup Polypropylene memiliki tegangan permukaan rendah. Wajib memakai tinta khusus solvent PP dan pengencer Thinner M4 agar daya rekat maksimal dan tidak mengelupas saat kena es.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Screen Mesh T120 / T100:</strong> Kerapatan kain screen T120 menghasilkan detail raster garis tipis dan tulisan barcode / medsos kecil tetap tajam tanpa blobor.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Jarak Aman Bibir Cup:</strong> Posisi logo atas minimal berjarak <strong className="text-white">2.0 cm - 2.5 cm</strong> dari bibir atas cup agar tidak terbentur mesin press sealer saat dipasang plastik roll.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Uji Lakban (Cross-Hatch QC):</strong> Tempelkan lakban bening kuat di atas logo yang sudah kering 24 jam lalu tarik cepat. Tinta tidak boleh terangkat sama sekali.
              </span>
            </li>
          </ul>
        </div>

        {/* Kebijakan Order & Garansi Workshop */}
        <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-3">
          <h3 className="text-sm font-montserrat font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-300" />
            Ketentuan Pemesanan & Jaminan Mutu
          </h3>
          <ul className="text-xs text-zinc-300 font-inter space-y-2.5 leading-relaxed">
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Minimum Order (MOQ):</strong> Standar 500 pcs per desain untuk efisiensi setup meja putar dan film afdruk.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Toleransi Reject:</strong> Standar toleransi cacat sablon saat naik mesin adalah 1-2%. Workshop selalu melebihkan kuantiti sortir cup polos cadangan.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Simpan Screen Master:</strong> Screen afdruk pelanggan disimpan selama 6 bulan untuk kemudahan repeat order tanpa biaya film tambahan.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
