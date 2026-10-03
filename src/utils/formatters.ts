import { PaymentStatus, ProductionStatus, SablonSides } from '../types';

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
};

export const getProductionStatusLabel = (status: ProductionStatus): {
  label: string;
  badgeClass: string;
  bgLight: string;
} => {
  switch (status) {
    case 'MENUNGGU_SPK':
      return {
        label: 'Menunggu SPK',
        badgeClass: 'bg-zinc-100 text-zinc-800 border-zinc-300',
        bgLight: 'bg-zinc-50',
      };
    case 'ANTREAN':
      return {
        label: 'Antrean (Pending)',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        bgLight: 'bg-amber-50',
      };
    case 'SETTING_FILM':
      return {
        label: 'Setting & Film',
        badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        bgLight: 'bg-indigo-50',
      };
    case 'PROSES_SABLON':
      return {
        label: 'Sedang Disablon',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
        bgLight: 'bg-blue-50',
      };
    case 'FINISHING':
      return {
        label: 'Finishing & QC',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
        bgLight: 'bg-purple-50',
      };
    case 'SIAP_AMBIL':
      return {
        label: 'Siap Kirim / Ambil',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        bgLight: 'bg-emerald-50',
      };
    case 'SELESAI':
      return {
        label: 'Selesai',
        badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
        bgLight: 'bg-teal-50',
      };
    case 'BATAL':
      return {
        label: 'Dibatalkan',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
        bgLight: 'bg-rose-50',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
        bgLight: 'bg-gray-50',
      };
  }
};

export const getPaymentStatusLabel = (status: PaymentStatus): {
  label: string;
  badgeClass: string;
} => {
  switch (status) {
    case 'LUNAS':
      return {
        label: 'LUNAS',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    case 'DP':
      return {
        label: 'DP DITERIMA',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    case 'BELUM_BAYAR':
      return {
        label: 'BELUM BAYAR',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
      };
  }
};

export const formatWhatsAppPhone = (phone: string): string => {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
};

export const generateWhatsAppLink = (
  phone: string,
  message: string
): string => {
  const cleanNumber = formatWhatsAppPhone(phone);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

export const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Baru saja';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
    if (diffSec < 86400 * 2) return 'Kemarin';
    if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)} hari lalu`;

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

export const getWhatsAppOrderMessage = (order: {
  orderNumber: string;
  customerName: string;
  customerBrand: string;
  cupProductName: string;
  quantityPcs: number;
  sablonSides: SablonSides;
  inkColorName: string;
  totalPrice: number;
  downPayment: number;
  remainingPayment: number;
  paymentStatus: PaymentStatus;
  productionStatus: ProductionStatus;
}): string => {
  const statusInfo = getProductionStatusLabel(order.productionStatus);
  const isPaidOff =
    order.paymentStatus === 'LUNAS' ||
    (order.totalPrice > 0 && order.downPayment >= order.totalPrice);
  const effectiveDP = isPaidOff ? order.totalPrice : order.downPayment;
  const effectiveRemaining = isPaidOff ? 0 : Math.max(0, order.remainingPayment);
  const effectivePayLabel = isPaidOff
    ? 'LUNAS'
    : order.paymentStatus === 'DP' || order.downPayment > 0
    ? 'Sudah DP'
    : 'Belum Bayar';

  return `Halo Kak ${order.customerName} (${order.customerBrand}), 

Terima kasih atas pesanan sablon cup di workshop kami! Berikut update rincian pesanan Anda:

*No. Pesanan / SPK:* ${order.orderNumber}
*Jenis Cup:* ${order.cupProductName}
*Jumlah:* ${formatNumber(order.quantityPcs)} pcs
*Varian Sablon:* ${order.sablonSides} (Tinta: ${order.inkColorName})
*Status Produksi:* ${statusInfo.label}

*Total Biaya:* ${formatRupiah(order.totalPrice)}
*DP Masuk:* ${formatRupiah(effectiveDP)}
*Sisa Tagihan:* ${formatRupiah(effectiveRemaining)}
*Status Bayar:* ${effectivePayLabel}

Bila ada yang ingin dikonfirmasi silakan balas pesan ini ya Kak. Terima kasih banyak!`;
};


