import React, { useState, useMemo } from 'react';
import { CustomerOrder, StockMovement, RecentActivityItem } from '../types';
import {
  formatNumber,
  formatTimeAgo,
  getProductionStatusLabel,
} from '../utils/formatters';
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  RefreshCw,
  Box,
  Layers,
  ChevronRight,
  User,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';

interface RecentActivityFeedProps {
  movements: StockMovement[];
  orders: CustomerOrder[];
  customActivities?: RecentActivityItem[];
  onNavigateTab: (tab: string) => void;
  onSelectOrderToPrint?: (order: CustomerOrder) => void;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  movements,
  orders,
  customActivities = [],
  onNavigateTab,
  onSelectOrderToPrint,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'STOCK' | 'ORDER'>('ALL');
  const [viewLimit, setViewLimit] = useState<number>(5);

  // Synthesize and merge activities from stock movements and orders
  const allActivities = useMemo(() => {
    const list: RecentActivityItem[] = [...customActivities];

    // 1. Convert Stock Movements
    movements.forEach((m) => {
      let title = 'Mutasi Stok';
      let badgeLabel = '';
      let badgeVariant: RecentActivityItem['badgeVariant'] = 'neutral';

      switch (m.type) {
        case 'IN':
          title = 'Stok Cup Masuk (Restock Pabrik)';
          badgeLabel = `+${formatNumber(m.quantityPcs)} Masuk`;
          badgeVariant = 'success';
          break;
        case 'OUT_SABLON':
          title = 'Stok Keluar Produksi Sablon';
          badgeLabel = `-${formatNumber(m.quantityPcs)} Sablon`;
          badgeVariant = 'info';
          break;
        case 'OUT_REJECT':
          title = 'Cup Cacat / Reject Sablon';
          badgeLabel = `-${formatNumber(m.quantityPcs)} Reject`;
          badgeVariant = 'danger';
          break;
        case 'OUT_SALE':
          title = 'Penjualan Cup Polos';
          badgeLabel = `-${formatNumber(m.quantityPcs)} Terjual`;
          badgeVariant = 'warning';
          break;
      }

      list.push({
        id: `mov-${m.id}`,
        timestamp: m.date,
        category: 'STOCK',
        title,
        description: `${m.cupProductName} • ${m.notes ? m.notes : `Jumlah: ${formatNumber(m.quantityPcs)} pcs`}`,
        badgeLabel,
        badgeVariant,
        referenceNo: m.referenceOrderNo,
        operatorName: m.operatorName || 'Gudang Utama',
        quantity: m.quantityPcs,
        movementType: m.type,
      });
    });

    // 2. Convert Orders Status Updates
    orders.forEach((o) => {
      const prodInfo = getProductionStatusLabel(o.productionStatus);
      let badgeVariant: RecentActivityItem['badgeVariant'] = 'warning';
      if (o.productionStatus === 'SELESAI') badgeVariant = 'success';
      if (o.productionStatus === 'BATAL') badgeVariant = 'danger';
      if (o.productionStatus === 'PROSES_SABLON' || o.productionStatus === 'SETTING_FILM') badgeVariant = 'info';

      list.push({
        id: `ord-${o.id}`,
        timestamp: o.createdAt,
        category: 'ORDER',
        title: `Pembaruan SPK • ${o.orderNumber}`,
        description: `${o.customerBrand} — ${o.cupProductName} (${formatNumber(o.quantityPcs)} pcs)`,
        badgeLabel: prodInfo.label,
        badgeVariant,
        referenceNo: o.orderNumber,
        operatorName: o.operatorName || 'Admin SPK',
        quantity: o.quantityPcs,
        productionStatus: o.productionStatus,
      });
    });

    // Deduplicate by ID and sort descending by timestamp (newest first)
    const uniqueMap = new Map<string, RecentActivityItem>();
    list.forEach((item) => {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    });

    return Array.from(uniqueMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [movements, orders, customActivities]);

  // Filtered by selected category
  const filteredActivities = useMemo(() => {
    let result = allActivities;
    if (filterType === 'STOCK') {
      result = result.filter((a) => a.category === 'STOCK');
    } else if (filterType === 'ORDER') {
      result = result.filter((a) => a.category === 'ORDER');
    }
    return result;
  }, [allActivities, filterType]);

  // Sliced to current limit (default 5 as requested)
  const displayedActivities = useMemo(() => {
    return filteredActivities.slice(0, viewLimit);
  }, [filteredActivities, viewLimit]);

  const handleItemClick = (activity: RecentActivityItem) => {
    if (activity.category === 'STOCK') {
      onNavigateTab('stock');
    } else {
      if (onSelectOrderToPrint && activity.referenceNo) {
        const order = orders.find((o) => o.orderNumber === activity.referenceNo);
        if (order) {
          onSelectOrderToPrint(order);
          return;
        }
      }
      onNavigateTab('orders');
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/10 p-5 space-y-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 text-white shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-montserrat font-black text-white">
                Aktivitas Terkini
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/15">
                {displayedActivities.length} Terakhir
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-inter">
              Pembaruan alur SPK & mutasi stok gudang
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-inter font-medium transition-all ${
              filterType === 'ALL'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilterType('STOCK')}
            className={`px-2.5 py-1 rounded-lg text-xs font-inter font-medium transition-all flex items-center gap-1 ${
              filterType === 'STOCK'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Box className="w-3 h-3" />
            <span>Stok</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('ORDER')}
            className={`px-2.5 py-1 rounded-lg text-xs font-inter font-medium transition-all flex items-center gap-1 ${
              filterType === 'ORDER'
                ? 'bg-white text-black font-semibold shadow-xs'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>SPK</span>
          </button>
        </div>
      </div>

      {/* Scrollable List Component (Displays latest 5 items smoothly) */}
      <div className="flex-1 overflow-y-auto max-h-[350px] pr-1.5 space-y-2.5">
        {displayedActivities.map((act) => {
          const isStock = act.category === 'STOCK';
          const isOrder = act.category === 'ORDER';

          // Visual icon container logic
          let icon = <RefreshCw className="w-3.5 h-3.5 text-zinc-300" />;
          let iconBg = 'bg-white/10 text-white border-white/15';

          if (isStock) {
            if (act.movementType === 'IN') {
              icon = <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />;
              iconBg = 'bg-emerald-500/10 border-emerald-500/30';
            } else if (act.movementType === 'OUT_SABLON') {
              icon = <Layers className="w-3.5 h-3.5 text-sky-400" />;
              iconBg = 'bg-sky-500/10 border-sky-500/30';
            } else if (act.movementType === 'OUT_REJECT') {
              icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
              iconBg = 'bg-rose-500/10 border-rose-500/30';
            } else {
              icon = <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300" />;
              iconBg = 'bg-white/10 border-white/15';
            }
          } else if (isOrder) {
            if (act.productionStatus === 'SELESAI') {
              icon = <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />;
              iconBg = 'bg-emerald-500/10 border-emerald-500/30';
            } else if (act.productionStatus === 'PROSES_SABLON') {
              icon = <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />;
              iconBg = 'bg-blue-500/10 border-blue-500/30';
            } else {
              icon = <FileText className="w-3.5 h-3.5 text-indigo-400" />;
              iconBg = 'bg-indigo-500/10 border-indigo-500/30';
            }
          }

          return (
            <div
              key={act.id}
              onClick={() => handleItemClick(act)}
              className="p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-all cursor-pointer group flex items-start gap-3"
            >
              {/* Category / Action Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 transition-transform group-hover:scale-105 ${iconBg}`}
              >
                {icon}
              </div>

              {/* Activity Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-montserrat font-bold text-xs text-white truncate">
                    {act.title}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-inter shrink-0 font-medium">
                    {formatTimeAgo(act.timestamp)}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 font-inter leading-snug line-clamp-2">
                  {act.description}
                </p>

                {/* Badges & Metadata Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {/* Status / Quantity Pill */}
                  <span className="text-[10px] font-inter font-bold px-2 py-0.5 rounded-md border border-white/15 bg-white/10 text-white">
                    {act.badgeLabel}
                  </span>

                  {/* SPK Reference */}
                  {act.referenceNo && (
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-md border border-white/10 bg-white/5 text-zinc-300">
                      {act.referenceNo}
                    </span>
                  )}

                  {/* Operator Tag */}
                  {act.operatorName && (
                    <span className="text-[10px] font-inter text-zinc-400 flex items-center gap-1 ml-auto">
                      <User className="w-2.5 h-2.5 opacity-70" />
                      <span>{act.operatorName}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Right Arrow Hover Feedback */}
              <div className="self-center pl-1 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}

        {displayedActivities.length === 0 && (
          <div className="text-center py-8 text-zinc-400 font-inter text-xs space-y-1">
            <SlidersHorizontal className="w-6 h-6 mx-auto text-zinc-500 mb-1 opacity-60" />
            <p className="font-semibold text-white">Tidak ada aktivitas ditemukan</p>
            <p className="text-zinc-500 text-[11px]">Belum ada mutasi stok atau update alur yang tercatat.</p>
          </div>
        )}
      </div>

      {/* Footer Controls & Quick Links */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          {filteredActivities.length > 5 && (
            <button
              type="button"
              onClick={() => setViewLimit((prev) => (prev === 5 ? 15 : 5))}
              className="text-[11px] font-inter font-medium text-zinc-300 hover:text-white underline underline-offset-2 transition-colors"
            >
              {viewLimit === 5 ? `Tampilkan Semua (${filteredActivities.length})` : 'Tampilkan 5 Terakhir'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab('stock')}
            className="text-[11px] font-inter font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Riwayat Stok</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
