import React, { useState } from 'react';
import { WorkshopSettings } from '../types';
import { formatRupiah } from '../utils/formatters';
import {
  Settings,
  DollarSign,
  CreditCard,
  PenTool,
  Building2,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  FileText,
  RotateCcw,
  Sparkles,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

interface SettingsManagementProps {
  settings: WorkshopSettings;
  onSaveSettings: (settings: WorkshopSettings) => void;
  onResetSettings?: () => void;
  currentUser?: any;
}

export const SettingsManagement: React.FC<SettingsManagementProps> = ({
  settings,
  onSaveSettings,
  onResetSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'TARIFF' | 'PAYMENT' | 'SIGNATURE'>('TARIFF');
  const [formData, setFormData] = useState<WorkshopSettings>({ ...settings });
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const handleChange = (field: keyof WorkshopSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsSavedRecently(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/10 text-white border border-white/10">
              <Settings className="w-5 h-5 text-indigo-400" />
            </span>
            <h1 className="text-xl sm:text-2xl font-montserrat font-black tracking-tight text-white">
              Pengaturan Sistem Workshop & Nota
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-inter">
            Konfigurasi tarif dasar sablon, rincian nomor rekening pembayaran, identitas workshop, dan tanda tangan (TTD) admin pada faktur
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onResetSettings && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Kembalikan semua pengaturan ke nilai bawaan?')) {
                  onResetSettings();
                  setIsSavedRecently(true);
                  setTimeout(() => setIsSavedRecently(false), 3000);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          )}

          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-montserrat font-black shadow-md transition-all"
          >
            {isSavedRecently ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('TARIFF')}
          className={`px-4 py-2 rounded-xl text-xs font-montserrat font-bold flex items-center gap-2 transition-all ${
            activeTab === 'TARIFF'
              ? 'bg-white text-black shadow-xs'
              : 'text-zinc-400 hover:text-white bg-white/5'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Tarif & Biaya Sablon
        </button>

        <button
          onClick={() => setActiveTab('PAYMENT')}
          className={`px-4 py-2 rounded-xl text-xs font-montserrat font-bold flex items-center gap-2 transition-all ${
            activeTab === 'PAYMENT'
              ? 'bg-white text-black shadow-xs'
              : 'text-zinc-400 hover:text-white bg-white/5'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Informasi Pembayaran / Rekening
        </button>

        <button
          onClick={() => setActiveTab('SIGNATURE')}
          className={`px-4 py-2 rounded-xl text-xs font-montserrat font-bold flex items-center gap-2 transition-all ${
            activeTab === 'SIGNATURE'
              ? 'bg-white text-black shadow-xs'
              : 'text-zinc-400 hover:text-white bg-white/5'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          Identitas & TTD Admin
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* TAB 1: TARIF & BIAYA */}
        {activeTab === 'TARIFF' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-montserrat font-bold text-white">
                  Konfigurasi Tarif Default Sablon
                </h3>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 font-medium mb-1">
                  Biaya Pembuatan Film Afdruk Screen per Klise (Rp)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={formData.defaultFilmFee}
                    onChange={(e) =>
                      handleChange('defaultFilmFee', parseInt(e.target.value) || 0)
                    }
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Nilai otomatis saat pelanggan memesan sablon desain baru ({formatRupiah(formData.defaultFilmFee)})
                </p>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 font-medium mb-1">
                  Minimal Order Produksi Sablon (Pcs)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={formData.defaultMinOrderQty}
                  onChange={(e) =>
                    handleChange('defaultMinOrderQty', parseInt(e.target.value) || 500)
                  }
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono font-bold"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Batas kuantitas pesanan minimal untuk produksi sablon cup standar
                </p>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 font-medium mb-1">
                  Persentase Uang Muka / DP Wajib (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.defaultDownPaymentPercent}
                    onChange={(e) =>
                      handleChange('defaultDownPaymentPercent', parseInt(e.target.value) || 50)
                    }
                    className="glass-input w-28 px-3 py-2 rounded-xl text-xs font-mono font-bold"
                  />
                  <span className="text-xs text-zinc-400 font-bold">% dari total tagihan</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Digunakan untuk menghitung rekomendasi nominal DP di kalkulator dan pesanan baru
                </p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-montserrat font-bold text-white">
                  Estimasi Biaya Operasional (HPP Kalkulasi)
                </h3>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 font-medium mb-1">
                  Estimasi Biaya Cat, Listrik & Upah Operator per Cup (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={formData.defaultEstimatedLaborCostPerCup}
                  onChange={(e) =>
                    handleChange(
                      'defaultEstimatedLaborCostPerCup',
                      parseInt(e.target.value) || 45
                    )
                  }
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono font-bold"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Digunakan dalam laporan keuangan untuk menghitung Laba Bersih riil setiap cup yang dicetak ({formatRupiah(formData.defaultEstimatedLaborCostPerCup)}/pcs)
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-zinc-300 space-y-2 mt-4">
                <div className="font-montserrat font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Simulasi HPP Cup Sablon
                </div>
                <div className="space-y-1 text-zinc-400 text-[11px]">
                  <div className="flex justify-between">
                    <span>Harga Modal Cup Rata-rata:</span>
                    <span className="font-mono text-zinc-200">Rp 230 / pcs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Sablon (Cat + Tenaga + Listrik):</span>
                    <span className="font-mono text-zinc-200">
                      {formatRupiah(formData.defaultEstimatedLaborCostPerCup)} / pcs
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/10 font-bold text-white">
                    <span>Estimasi Total HPP:</span>
                    <span className="font-mono text-emerald-400">
                      {formatRupiah(230 + formData.defaultEstimatedLaborCostPerCup)} / pcs
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INFORMASI PEMBAYARAN */}
        {activeTab === 'PAYMENT' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-montserrat font-bold text-white">
                  Rekening Bank Penerima Transfer
                </h3>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 font-medium mb-1">
                  Nama Bank *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bank Central Asia (BCA)"
                  value={formData.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-300 font-medium mb-1">
                  Nomor Rekening Bank *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 8465-1234-99"
                  value={formData.bankAccountNumber}
                  onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-300 font-medium mb-1">
                  Atas Nama Pemilik Rekening *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Workshop KMS.id / Bpk Agus"
                  value={formData.bankAccountHolder}
                  onChange={(e) => handleChange('bankAccountHolder', e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-300 font-medium mb-1">
                  Link / URL Gambar QRIS (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="https://... atau data:image/..."
                  value={formData.qrisImageUrl || ''}
                  onChange={(e) => handleChange('qrisImageUrl', e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Biarkan kosong jika hanya menggunakan transfer bank manual
                </p>
              </div>
            </div>

            {/* Preview Nota Bagian Pembayaran */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <FileText className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-montserrat font-bold text-white">
                  Preview Tampilan di Faktur / Invoice
                </h3>
              </div>

              <div className="bg-white text-zinc-900 p-5 rounded-2xl border border-zinc-300 shadow-sm space-y-3 font-inter">
                <div className="text-xs font-montserrat font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-black" />
                  Informasi Pembayaran / Transfer
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-black">{formData.bankName || 'Nama Bank'}</div>
                  <div className="font-mono text-base font-black text-black">
                    {formData.bankAccountNumber || '0000-0000-00'}
                  </div>
                  <div className="text-xs text-zinc-600">
                    a/n {formData.bankAccountHolder || 'Nama Pemilik'}
                  </div>
                </div>

                {formData.qrisImageUrl && (
                  <div className="pt-2 border-t border-zinc-200 flex items-center gap-3">
                    <img
                      src={formData.qrisImageUrl}
                      alt="QRIS Preview"
                      className="w-16 h-16 object-contain rounded-md border border-zinc-200"
                    />
                    <div className="text-[11px] text-zinc-600">
                      Scan QRIS untuk pembayaran langsung
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-zinc-500 italic pt-2 border-t border-zinc-200">
                  {formData.invoiceNotes || '* Harap konfirmasi bukti transfer via WhatsApp'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: IDENTITAS WORKSHOP & TTD ADMIN */}
        {activeTab === 'SIGNATURE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Building2 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-montserrat font-bold text-white">
                  Profil Workshop & Pengesahan Admin
                </h3>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 font-medium mb-1">
                  Nama Workshop KMS *
                </label>
                <input
                  type="text"
                  required
                  value={formData.workshopName}
                  onChange={(e) => handleChange('workshopName', e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs font-montserrat font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-300 font-medium mb-1">
                  Slogan / Sub-judul
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-300 font-medium mb-1">
                    No. WhatsApp Workshop *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 font-medium mb-1">
                    Alamat / Kota Workshop *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="font-montserrat font-bold text-white text-xs flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-purple-400" />
                  Pejabat Penandatangan Faktur (TTD Admin)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-300 font-medium mb-1">
                      Nama Admin / PIC *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Agus Subekti, S.Kom"
                      value={formData.adminSignerName}
                      onChange={(e) => handleChange('adminSignerName', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-300 font-medium mb-1">
                      Jabatan / Gelar PIC *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kepala Produksi & Kasir"
                      value={formData.adminSignerTitle}
                      onChange={(e) => handleChange('adminSignerTitle', e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 font-medium mb-1">
                    URL Gambar Tanda Tangan / Cap Stempel Digital (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="https://... atau data:image/png;base64,..."
                    value={formData.adminSignatureUrl || ''}
                    onChange={(e) => handleChange('adminSignatureUrl', e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs font-mono"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Jika diisi, tanda tangan digital/stempel akan muncul tepat di atas nama admin pada faktur
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-zinc-300 font-medium mb-1">
                    Catatan Kaki Faktur (Syarat & Ketentuan)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.invoiceNotes}
                    onChange={(e) => handleChange('invoiceNotes', e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Live Invoice Preview Box */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-montserrat font-bold text-white">
                  Preview Blok Tanda Tangan pada Faktur Cetak
                </h3>
              </div>

              <div className="bg-white text-zinc-900 p-6 rounded-2xl border border-zinc-300 shadow-sm space-y-6 font-inter">
                <div className="border-b border-zinc-200 pb-3 flex justify-between items-start">
                  <div>
                    <h4 className="font-montserrat font-black text-black text-sm">
                      {formData.workshopName || 'KMS.id'}
                    </h4>
                    <p className="text-[11px] text-zinc-600">{formData.tagline}</p>
                    <p className="text-[10px] text-zinc-500">
                      WA: {formData.phone} • {formData.address}
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-zinc-400">FAKTUR CONTOH</span>
                </div>

                {/* Signature Preview */}
                <div className="grid grid-cols-2 pt-4 text-center text-xs">
                  <div>
                    <p className="text-zinc-600">Penerima / Pemesan,</p>
                    <div className="h-16 flex items-center justify-center text-zinc-300 text-[10px] italic">
                      (Tanda tangan pemesan)
                    </div>
                    <p className="font-montserrat font-bold text-black border-t border-zinc-300 pt-1 mx-4">
                      (Nama Pelanggan)
                    </p>
                  </div>

                  <div>
                    <p className="text-zinc-600">Hormat Kami / Kasir,</p>
                    <div className="h-16 flex items-center justify-center">
                      {formData.adminSignatureUrl ? (
                        <img
                          src={formData.adminSignatureUrl}
                          alt="TTD Admin"
                          className="max-h-14 max-w-[120px] object-contain"
                        />
                      ) : (
                        <div className="text-zinc-400 text-[11px] font-mono italic">
                          [ Cap & TTD Workshop ]
                        </div>
                      )}
                    </div>
                    <div className="border-t border-zinc-300 pt-1 mx-4">
                      <p className="font-montserrat font-bold text-black">
                        ({formData.adminSignerName || 'Admin KMS.id'})
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {formData.adminSignerTitle || 'Kepala Produksi'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 italic text-center pt-2 border-t border-zinc-200">
                  {formData.invoiceNotes}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
