export type CupType = 'Datar' | 'Oval' | 'Injection' | 'Paper' | 'Aksesoris';
export type CupMaterial = 'PP' | 'PET' | 'Paper' | 'Plastik';

export interface CupProduct {
  id: string;
  code: string; // e.g. CUP-16-DTR-7G
  name: string;
  type: CupType;
  size: string; // e.g. "12 oz", "14 oz", "16 oz", "22 oz"
  grammage: string; // e.g. "7 gr", "8 gr", "5.5 gr"
  material: CupMaterial;
  stockPcs: number;
  minStockAlert: number;
  costPricePerPcs: number; // HPP Modal beli polos (Rp)
  sellPricePolosPerPcs: number; // Harga jual polos tanpa sablon (Rp)
  unitPerSlop: number; // default 50 pcs
  unitPerBox: number; // default 1000 atau 2000 pcs
  description?: string;
}

export type MovementType = 'IN' | 'OUT_SABLON' | 'OUT_SALE' | 'OUT_REJECT';

export interface StockMovement {
  id: string;
  date: string;
  cupProductId: string;
  cupProductName: string;
  type: MovementType;
  quantityPcs: number;
  notes: string;
  referenceOrderNo?: string;
  operatorName?: string;
}

export type SablonSides = 'Polos (Tanpa Sablon)' | '1 Sisi' | '2 Sisi' | 'Keliling 360°';

export interface SablonPricingTier {
  id: string;
  label: string; // e.g. "Order 500 - 999 pcs"
  minQty: number;
  maxQty: number;
  pricePerPcs1Sisi: number;
  pricePerPcs2Sisi: number;
  pricePerPcsKeliling: number;
  freeFilm: boolean; // Jika order qty >= batas tertentu, film klise gratis
}

export type ProductionStatus =
  | 'MENUNGGU_SPK'
  | 'ANTREAN'
  | 'SETTING_FILM'
  | 'PROSES_SABLON'
  | 'FINISHING'
  | 'SIAP_AMBIL'
  | 'SELESAI'
  | 'BATAL';

export type PaymentStatus = 'BELUM_BAYAR' | 'DP' | 'LUNAS';

export interface SalesInvoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-001
  createdAt: string;
  deadlineDate: string;
  
  customerName: string;
  customerBrand: string;
  customerPhone: string;
  customerAddress?: string;

  subtotal: number;
  additionalCost: number; // Biaya packing khusus / ongkir jika ada
  totalPrice: number;
  downPayment: number;
  remainingPayment: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  
  notes?: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string; // e.g. SPK-2026-001
  invoiceId?: string; // Tautan ke SalesInvoice Induk
  createdAt: string;
  deadlineDate: string;
  
  // Customer info
  customerName: string;
  customerBrand: string; // e.g. "Kopi Kenangan Senja"
  customerPhone: string;
  customerAddress?: string;
  
  // Product info
  cupProductId: string;
  cupProductName: string;
  cupSize: string;
  cupGrammage: string;
  quantityPcs: number;
  
  // Sablon specs
  sablonSides: SablonSides;
  inkColorName: string; // e.g. "Hitam Solid", "Putih", "Emas Gold"
  inkHex: string;
  customInkNotes?: string;
  hasExistingFilm: boolean; // true = repeat order (film screen sudah ada)
  filmFee: number; // Biaya afdruk film screen (Rp 35.000 jika order < batas)
  
  // Financials
  cupPricePerPcs: number;
  sablonPricePerPcs: number;
  totalPerPcs: number;
  subtotal: number;
  additionalCost: number; // Biaya packing khusus / ongkir jika ada
  totalPrice: number;
  downPayment: number; // DP yang sudah dibayar
  remainingPayment: number; // Sisa tagihan
  paymentStatus: PaymentStatus;
  paymentMethod?: string; // Transfer BCA, Cash, QRIS
  
  // Production
  productionStatus: ProductionStatus;
  rejectPcs: number; // Cup gagal sablon/cacat
  notes?: string;
  operatorName?: string;
}

export interface Customer {
  id: string;
  name: string;
  brand: string;
  phone: string;
  address?: string;
  firstOrderDate: string;
  lastOrderDate: string;
  totalOrdersCount: number;
  totalQuantityCups: number;
  notes?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalDPReceived: number;
  totalReceivables: number; // Piutang belum lunas
  totalEstimatedProfit: number;
  totalCupsPrinted: number;
  totalActiveOrders: number;
}

export type ActivityCategory = 'STOCK' | 'ORDER' | 'EXPENSE' | 'ASSET' | 'CONSUMABLE';

export interface RecentActivityItem {
  id: string;
  timestamp: string;
  category: ActivityCategory;
  title: string;
  description: string;
  badgeLabel: string;
  badgeVariant?: 'success' | 'warning' | 'info' | 'danger' | 'neutral';
  referenceNo?: string;
  operatorName?: string;
  quantity?: number;
  movementType?: MovementType;
  productionStatus?: ProductionStatus;
}

// ==========================================
// 1. EXPENSE / PENGELUARAN OPERASIONAL
// ==========================================
export type ExpenseCategory =
  | 'Bahan Baku & Cat'
  | 'Listrik & Utilitas'
  | 'Gaji & Upah Operator'
  | 'Sewa Tempat & Workshop'
  | 'Maintenance & Servis Mesin'
  | 'Packing & Pengiriman'
  | 'Konsumsi & Operasional'
  | 'Peralatan & Perlengkapan'
  | 'Lain-lain';

export interface ExpenseItem {
  id: string;
  date: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  paymentMethod: string;
  recipient?: string;
  receiptNo?: string;
  notes?: string;
  operatorName?: string;
}

// ==========================================
// 2. ASSET INVESTMENT / INVESTASI ASET
// ==========================================
export type AssetCategory =
  | 'Mesin Sablon'
  | 'Peralatan Afdruk'
  | 'Penunjang Produksi'
  | 'Elektronik & IT'
  | 'Fasilitas & Perabot';

export type AssetCondition = 'Sangat Baik' | 'Baik (Beroperasi)' | 'Perlu Perawatan' | 'Rusak / Afkir';

export interface WorkshopAsset {
  id: string;
  code: string;
  name: string;
  category: AssetCategory;
  purchaseDate: string;
  purchaseCost: number;
  quantity: number;
  condition: AssetCondition;
  usefulLifeYears: number;
  location?: string;
  notes?: string;
}

// ==========================================
// 3. OPERATIONAL CONSUMABLES INVENTORY
// ==========================================
export type ConsumableCategory =
  | 'Obat Afdruk & Sensitizer'
  | 'Tinta & Cat Sablon'
  | 'Pelarut & Thinner'
  | 'Pembersih & Reducer'
  | 'Screen & Perlengkapan'
  | 'Bahan Packing & Lakban'
  | 'Perlengkapan Workshop & APD';

export type ConsumableUnit = 'kg' | 'liter' | 'botol' | 'kaleng' | 'roll' | 'box' | 'pack' | 'lembar' | 'pcs';

export interface ConsumableItem {
  id: string;
  code: string;
  name: string;
  category: ConsumableCategory;
  unit: ConsumableUnit;
  stock: number;
  minStockAlert: number;
  costPerUnit: number;
  supplier?: string;
  location?: string;
  notes?: string;
  lastRestockDate?: string;
}

export type ConsumableMutationType = 'IN' | 'OUT';

export interface ConsumableMovement {
  id: string;
  date: string;
  consumableId: string;
  consumableName: string;
  type: ConsumableMutationType;
  quantity: number;
  unit: string;
  reference?: string;
  notes: string;
  operatorName?: string;
}

// ==========================================
// 4. WORKSHOP SETTINGS / PENGATURAN
// ==========================================
export interface BankAccountInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface WorkshopSettings {
  workshopName: string;
  tagline: string;
  address: string;
  phone: string;
  email?: string;
  
  // Tarif & Biaya Operasional
  defaultFilmFee: number;
  defaultDesignFee: number;
  defaultPackingFeePerBox: number;
  defaultMinOrderQty: number;
  defaultDownPaymentPercent: number;
  defaultEstimatedLaborCostPerCup: number;
  
  // Pembayaran & Bank
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  qrisImageUrl?: string;
  invoiceNotes: string;
  
  // TTD Admin & Otorisasi
  adminSignerName: string;
  adminSignerTitle: string;
  adminSignatureUrl?: string;

  // Backward-compatible properties
  workshopTagline?: string;
  workshopAddress?: string;
  workshopPhone?: string;
  workshopEmail?: string;
  primaryBank?: BankAccountInfo;
  secondaryBank?: BankAccountInfo;
  qrisUrl?: string;
  paymentInstructions?: string;
  adminSignName?: string;
  adminRole?: string;
  adminSignatureImage?: string | null;
  customerSignLabel?: string;
  spkNotes?: string;
}

