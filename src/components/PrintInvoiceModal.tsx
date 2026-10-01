import React, { useState } from 'react';
import { CustomerOrder, WorkshopSettings } from '../types';
import { INITIAL_SETTINGS } from '../data/initialData';
import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatRupiah,
  generateWhatsAppLink,
  getPaymentStatusLabel,
  getProductionStatusLabel,
  getWhatsAppOrderMessage,
} from '../utils/formatters';
import {
  Printer,
  X,
  FileText,
  Share2,
  CheckCircle2,
  Building,
  Layers,
  Wrench,
} from 'lucide-react';

interface PrintInvoiceModalProps {
  order: CustomerOrder | null;
  isOpen: boolean;
  onClose: () => void;
  settings?: WorkshopSettings;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'invoice' | 'spk'>('invoice');

  if (!isOpen || !order) return null;

  const workshopConfig = settings || INITIAL_SETTINGS;
  const paymentInfo = getPaymentStatusLabel(order.paymentStatus);
  const prodInfo = getProductionStatusLabel(order.productionStatus);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const msg = getWhatsAppOrderMessage(order);
    const link = generateWhatsAppLink(order.customerPhone, msg);
    window.open(link, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel border border-white/20 w-full max-w-3xl overflow-hidden my-4 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] font-inter">
        {/* Modal Controls Header (Hidden in Print) */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('invoice')}
                className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'invoice'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Nota / Faktur KMS.id
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('spk')}
                className={`px-3 py-1.5 rounded-lg text-xs font-montserrat font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'spk'
                    ? 'bg-white text-black shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                SPK Produksi Workshop
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-medium transition-colors"
              title="Kirim ke WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-montserrat font-black transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area - High-Contrast Black & White Printable Sheet */}
        <div className="p-6 sm:p-8 max-h-[82vh] overflow-y-auto bg-white text-black print:p-0 print:m-0 print:max-h-none print:overflow-visible">
          {activeTab === 'invoice' ? (
            /* ================= NOTA / INVOICE PELANGGAN ================= */
            <div className="space-y-6 text-zinc-900">
              {/* Kop Nota */}
              <div className="flex justify-between items-start border-b-2 border-black pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-montserrat font-black tracking-tight text-black uppercase">
                      {workshopConfig.workshopName}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-black text-white uppercase tracking-widest print:hidden">
                      OFFICIAL INVOICE
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 font-medium mt-1">
                    {workshopConfig.tagline}
                  </p>
                  <p className="text-xs text-zinc-600">
                    Workshop & Logistik: {workshopConfig.address} | WA: {workshopConfig.phone}
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-montserrat font-black text-black uppercase tracking-wider">
                    FAKTUR PENJUALAN
                  </h2>
                  <div className="text-xs font-mono font-bold text-black mt-1">
                    {order.orderNumber}
                  </div>
                  <div className="text-xs text-zinc-600 mt-0.5">
                    Tanggal: {formatDate(order.createdAt)}
                  </div>
                </div>
              </div>

              {/* Info Pelanggan & Status */}
              <div className="grid grid-cols-2 gap-4 bg-zinc-50 print:bg-transparent p-4 rounded-xl border border-zinc-200 print:border-none">
                <div>
                  <span className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider block">
                    Pelanggan / Pemesan
                  </span>
                  <div className="text-base font-montserrat font-bold text-black">
                    {order.customerName}
                  </div>
                  <div className="text-xs font-semibold text-zinc-800">
                    Brand: {order.customerBrand}
                  </div>
                  <div className="text-xs text-zinc-700 mt-0.5">
                    No. Telp / WA: {order.customerPhone}
                  </div>
                  {order.customerAddress && (
                    <div className="text-xs text-zinc-600 mt-0.5">
                      Alamat: {order.customerAddress}
                    </div>
                  )}
                </div>

                <div className="text-right flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider block">
                      Target Pengambilan / Deadline
                    </span>
                    <div className="text-sm font-montserrat font-bold text-black">
                      {formatDate(order.deadlineDate)}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider block">
                      Status Pembayaran
                    </span>
                    <span className="inline-block px-3 py-1 rounded-md text-xs font-montserrat font-black uppercase tracking-wider border-2 border-black bg-white text-black print:border-black print:text-black">
                      {paymentInfo.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabel Rincian Pesanan */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-zinc-300">
                  <thead className="bg-zinc-100 text-black font-montserrat font-bold border-b border-zinc-300">
                    <tr>
                      <th className="p-3">No</th>
                      <th className="p-3">Deskripsi Item & Spesifikasi</th>
                      <th className="p-3 text-right">Kuantiti</th>
                      <th className="p-3 text-right">Harga Satuan</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-zinc-800">
                    <tr>
                      <td className="p-3 font-semibold">1</td>
                      <td className="p-3">
                        <div className="font-montserrat font-bold text-black text-sm">
                          {order.cupProductName}
                        </div>
                        <div className="text-zinc-600 text-[11px] mt-0.5">
                          Ukuran: {order.cupSize} | Berat: {order.cupGrammage}
                        </div>
                        <div className="text-black text-[11px] font-semibold mt-1">
                          Varian Sablon: {order.sablonSides} | Tinta: {order.inkColorName}
                        </div>
                        {order.customInkNotes && (
                          <div className="text-zinc-600 text-[10px] italic mt-0.5">
                            Catatan: {order.customInkNotes}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right font-montserrat font-bold text-sm">
                        {formatNumber(order.quantityPcs)} pcs
                      </td>
                      <td className="p-3 text-right font-medium">
                        {formatRupiah(order.totalPerPcs)}
                      </td>
                      <td className="p-3 text-right font-montserrat font-bold text-black text-sm">
                        {formatRupiah(order.subtotal)}
                      </td>
                    </tr>

                    {order.filmFee > 0 && (
                      <tr>
                        <td className="p-3 font-semibold">2</td>
                        <td className="p-3">
                          <div className="font-montserrat font-bold text-black">
                            Biaya Master Film & Afdruk Screen (Desain Baru)
                          </div>
                          <div className="text-zinc-600 text-[11px]">
                            Biaya pembuatan plat klise sablon pertama kali
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium">1 klise</td>
                        <td className="p-3 text-right font-medium">
                          {formatRupiah(order.filmFee)}
                        </td>
                        <td className="p-3 text-right font-montserrat font-bold text-black">
                          {formatRupiah(order.filmFee)}
                        </td>
                      </tr>
                    )}

                    {order.additionalCost > 0 && (
                      <tr>
                        <td className="p-3 font-semibold">{order.filmFee > 0 ? 3 : 2}</td>
                        <td className="p-3">
                          <div className="font-montserrat font-bold text-black">
                            Biaya Tambahan / Packing Khusus
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium">-</td>
                        <td className="p-3 text-right font-medium">
                          {formatRupiah(order.additionalCost)}
                        </td>
                        <td className="p-3 text-right font-montserrat font-bold text-black">
                          {formatRupiah(order.additionalCost)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Rincian Finansial & Rekening */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="text-xs text-zinc-700 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                  <div className="font-montserrat font-bold text-black mb-2 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-black" />
                    Informasi Pembayaran / Transfer
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-zinc-800">{workshopConfig.bankName}</p>
                    <p className="font-mono text-sm font-bold text-black">{workshopConfig.bankAccountNumber}</p>
                    <p className="text-[11px] text-zinc-600">a/n {workshopConfig.bankAccountHolder}</p>
                  </div>
                  {workshopConfig.qrisImageUrl && (
                    <div className="mt-2 pt-2 border-t border-zinc-200 flex items-center gap-2">
                      <img
                        src={workshopConfig.qrisImageUrl}
                        alt="QRIS Pembayaran"
                        className="w-14 h-14 object-contain rounded border border-zinc-300"
                      />
                      <span className="text-[10px] text-zinc-500">Scan QRIS untuk pembayaran digital</span>
                    </div>
                  )}
                  <p className="text-[11px] text-zinc-600 mt-3 italic border-t border-zinc-200 pt-2">
                    {workshopConfig.invoiceNotes || '* Harap melunasi sisa tagihan sebelum cup diambil atau dikirim via ekspedisi.'}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 text-zinc-700">
                    <span>Subtotal Produk:</span>
                    <span className="font-semibold">{formatRupiah(order.subtotal)}</span>
                  </div>
                  {order.filmFee > 0 && (
                    <div className="flex justify-between py-1 text-zinc-700">
                      <span>Biaya Film Afdruk:</span>
                      <span className="font-semibold">{formatRupiah(order.filmFee)}</span>
                    </div>
                  )}
                  {order.additionalCost > 0 && (
                    <div className="flex justify-between py-1 text-zinc-700">
                      <span>Biaya Tambahan:</span>
                      <span className="font-semibold">{formatRupiah(order.additionalCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t-2 border-black text-sm font-montserrat font-black text-black">
                    <span>TOTAL TAGIHAN:</span>
                    <span>{formatRupiah(order.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-zinc-800 font-bold">
                    <span>Uang Muka / DP Masuk:</span>
                    <span>- {formatRupiah(order.downPayment)}</span>
                  </div>
                  <div className="flex justify-between py-2 bg-zinc-100 p-2 rounded-lg border border-zinc-300 font-montserrat font-black text-black">
                    <span>SISA PELUNASAN:</span>
                    <span className="text-black">{formatRupiah(order.remainingPayment)}</span>
                  </div>
                </div>
              </div>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 pt-8 text-center text-xs">
                <div>
                  <p className="text-zinc-600">Penerima / Pelanggan,</p>
                  <div className="h-16 flex items-center justify-center text-zinc-300 text-[10px] italic">
                    (Tanda tangan pemesan)
                  </div>
                  <p className="font-montserrat font-bold text-black">({order.customerName})</p>
                </div>
                <div>
                  <p className="text-zinc-600">Hormat Kami / Kasir,</p>
                  <div className="h-16 flex items-center justify-center">
                    {workshopConfig.adminSignatureUrl ? (
                      <img
                        src={workshopConfig.adminSignatureUrl}
                        alt="TTD Admin"
                        className="max-h-14 max-w-[120px] object-contain"
                      />
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </div>
                  <p className="font-montserrat font-bold text-black">
                    ({workshopConfig.adminSignerName})
                  </p>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    {workshopConfig.adminSignerTitle}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ================= SURAT PERINTAH KERJA (SPK) WORKSHOP ================= */
            <div className="space-y-6 text-zinc-900">
              {/* Header SPK */}
              <div className="flex justify-between items-start border-b-2 border-black pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-montserrat font-black text-black uppercase">
                      SURAT PERINTAH KERJA (SPK) KMS.id
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600">
                    Dokumen Instruksi Operator Mesin Sablon & Finishing Workshop
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-zinc-500 uppercase">NO. SPK</div>
                  <div className="text-xl font-mono font-black text-black">
                    {order.orderNumber}
                  </div>
                  <div className="text-xs text-zinc-600">
                    Dibuat: {formatDateTime(order.createdAt)}
                  </div>
                </div>
              </div>

              {/* Highlight Target Operator */}
              <div className="grid grid-cols-3 gap-3 bg-zinc-50 border border-zinc-300 p-4 rounded-xl text-center">
                <div>
                  <span className="text-[10px] font-bold uppercase text-zinc-500 block">
                    TARGET DEADLINE SELESAI
                  </span>
                  <span className="text-base font-montserrat font-black text-black">
                    {formatDate(order.deadlineDate)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-zinc-500 block">
                    JUMLAH CUP CETAK
                  </span>
                  <span className="text-2xl font-montserrat font-black text-black">
                    {formatNumber(order.quantityPcs)} <span className="text-xs font-normal text-zinc-600">pcs</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-zinc-500 block">
                    OPERATOR PENANGGUNG JAWAB
                  </span>
                  <span className="text-base font-montserrat font-black text-black">
                    {order.operatorName || 'Agus Subekti'}
                  </span>
                </div>
              </div>

              {/* Spesifikasi Teknis Cetak */}
              <div className="border border-zinc-300 rounded-xl overflow-hidden">
                <div className="bg-black text-white px-4 py-2 text-xs font-montserrat font-bold uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-white" />
                  Spesifikasi Teknis Cetak Sablon
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500 block font-medium">Jenis & Merk Cup:</span>
                    <span className="text-sm font-montserrat font-bold text-black">{order.cupProductName}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block font-medium">Ukuran & Gramasi:</span>
                    <span className="text-sm font-montserrat font-bold text-black">{order.cupSize} ({order.cupGrammage})</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block font-medium">Sisi Cetak:</span>
                    <span className="inline-block px-2.5 py-1 border-2 border-black bg-white text-black font-montserrat font-bold rounded-md print:border-black print:text-black">
                      {order.sablonSides}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block font-medium">Warna Tinta Sablon:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="w-4 h-4 rounded-full border border-zinc-400"
                        style={{ backgroundColor: order.inkHex }}
                      />
                      <span className="text-sm font-montserrat font-bold text-black">{order.inkColorName}</span>
                    </div>
                  </div>
                  <div className="sm:col-span-2 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                    <span className="text-zinc-500 block font-medium mb-1">Catatan Khusus Desain / Posisi Logo:</span>
                    <p className="text-sm font-semibold text-black">
                      {order.customInkNotes || 'Standar: Logo presisi tengah, 2 - 2.5 cm dari bibir atas cup.'}
                    </p>
                  </div>
                  {order.notes && (
                    <div className="sm:col-span-2 bg-zinc-100 p-3 rounded-lg border border-zinc-300">
                      <span className="text-black block font-montserrat font-bold mb-1">Catatan Tambahan Produksi:</span>
                      <p className="text-xs text-zinc-800">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Checklist Quality Control (QC) & Packing */}
              <div className="border border-zinc-300 rounded-xl p-4 space-y-3 bg-zinc-50">
                <h4 className="text-xs font-montserrat font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  Lembar Cek Mutu (Quality Control) Sebelum Serah Terima
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-zinc-300 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-black rounded" />
                    <span>Tinta PP matang & lolos uji lakban (tidak mengelupas)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-zinc-300 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-black rounded" />
                    <span>Posisi cetak simetris & tidak miring</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-zinc-300 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-black rounded" />
                    <span>Packing rapi per slop (50 pcs) & kardus utuh</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-zinc-300 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-black rounded" />
                    <span>Jumlah cup pas sesuai pesanan ({formatNumber(order.quantityPcs)} pcs)</span>
                  </label>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-600 pt-2 border-t border-zinc-200">
                  <span>Jumlah Rusak / Reject Tercatat: <strong className="text-black font-montserrat font-bold">{order.rejectPcs} pcs</strong></span>
                  <span>Tanda Tangan Operator: _________________</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
