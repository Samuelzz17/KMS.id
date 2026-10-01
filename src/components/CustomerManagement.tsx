import React, { useState } from 'react';
import { Customer, CustomerOrder } from '../types';
import { formatDate, formatNumber, generateWhatsAppLink } from '../utils/formatters';
import {
  Search,
  MessageCircle,
  Calendar,
  Phone,
  MapPin,
  Repeat,
} from 'lucide-react';

interface CustomerManagementProps {
  customers: Customer[];
  orders: CustomerOrder[];
  onOpenNewOrderForCustomer?: (customer: Customer) => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  customers,
  orders,
  onOpenNewOrderForCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const handleChatCustomer = (customer: Customer) => {
    const msg = `Halo Kak ${customer.name} dari ${customer.brand}, 

Salam dari Workshop KMS.id Sablon Cup! Bagaimana ketersediaan stok cup Anda saat ini?

Jika stok cup sudah mulai menipis dan ingin repeat order, master screen klise Anda masih tersimpan aman di workshop kami sehingga bisa langsung diproduksi cepat tanpa biaya film lagi ya Kak.

Terima kasih banyak!`;
    const link = generateWhatsAppLink(customer.phone, msg);
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-montserrat font-black text-white tracking-tight">
            Database Pelanggan & Brand Minuman
          </h2>
          <p className="text-xs text-zinc-400 font-inter mt-0.5">
            Daftar pemilik brand kafe, kedai es teh, outlet kopi, serta riwayat repeat order cup
          </p>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Cari nama brand, pemilik, no telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-white/10 rounded-xl bg-white/[0.03] text-white placeholder-zinc-500 focus:bg-white/[0.06] focus:border-white/30 focus:outline-hidden focus:ring-1 focus:ring-white/20 font-inter"
          />
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          // Hitung order riil
          const customerOrders = orders.filter(
            (o) =>
              o.customerBrand.toLowerCase() === cust.brand.toLowerCase() ||
              o.customerName.toLowerCase() === cust.name.toLowerCase()
          );
          const totalCups = customerOrders.reduce((sum, o) => sum + o.quantityPcs, 0);

          return (
            <div
              key={cust.id}
              className="glass-card rounded-2xl border border-white/10 p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-montserrat font-black text-white">{cust.brand}</h3>
                    <p className="text-xs text-zinc-400 font-inter">Pemilik: {cust.name}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-montserrat font-bold bg-white/10 text-white border border-white/20">
                    {customerOrders.length || cust.totalOrdersCount}x Order
                  </span>
                </div>

                <div className="mt-3.5 space-y-2 text-xs text-zinc-300 font-inter">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{cust.phone}</span>
                  </div>
                  {cust.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 text-zinc-400">{cust.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-zinc-400 text-[11px] pt-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Order Terakhir: {formatDate(cust.lastOrderDate)}</span>
                  </div>
                </div>

                {/* Total Cup Stat */}
                <div className="mt-4 bg-white/[0.03] p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-inter">Total Volume Cup:</span>
                  <span className="font-montserrat font-black text-white text-sm">
                    {formatNumber(totalCups || cust.totalQuantityCups)} pcs
                  </span>
                </div>

                {cust.notes && (
                  <p className="text-[11px] text-zinc-400 italic mt-2.5 font-inter">
                    Catatan: {cust.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                <button
                  onClick={() => handleChatCustomer(cust)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white font-inter font-semibold text-xs border border-white/15 backdrop-blur-md transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-zinc-300" />
                  <span>Chat WhatsApp</span>
                </button>
                {onOpenNewOrderForCustomer && (
                  <button
                    onClick={() => onOpenNewOrderForCustomer(cust)}
                    className="p-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors shadow-xs"
                    title="Buat Order Baru untuk Pelanggan Ini"
                  >
                    <Repeat className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
