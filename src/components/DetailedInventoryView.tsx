import React from 'react';
import { AppStateData, FilterState, Item } from '../types/inventory';
import { formatQty, getFilteredInventoryOverview } from '../utils/inventoryCalculations';
import { Package, AlertCircle, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface DetailedInventoryViewProps {
  data: AppStateData;
  filters: FilterState;
  onQuickImport: (item: Item) => void;
  onQuickExport: (item: Item) => void;
}

export const DetailedInventoryView: React.FC<DetailedInventoryViewProps> = ({
  data,
  filters,
  onQuickImport,
  onQuickExport,
}) => {
  const { rows } = getFilteredInventoryOverview(
    data,
    filters.selectedMonth,
    filters.selectedBranch,
    filters.searchQuery
  );

  return (
    <div className="bg-[#0d2238] border border-slate-700/80 rounded-2xl shadow-lg overflow-hidden mb-6 text-slate-100">
      <div className="p-4 sm:px-6 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#081a2e]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            <span>CHI TIẾT HÀNG TỒN KHO & MỨC AN TOÀN</span>
          </h2>
          <p className="text-xs text-slate-300">
            Giám sát mức tồn kho khả dụng so với định mức an toàn tối thiểu
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-[#091e33] text-slate-300 font-bold border-b border-slate-700 uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-12 text-center">STT</th>
              <th className="py-3.5 px-4">Mã VT</th>
              <th className="py-3.5 px-4">Tên vật tư</th>
              <th className="py-3.5 px-3 text-center">ĐVT</th>
              <th className="py-3.5 px-4">Nhóm hàng</th>
              <th className="py-3.5 px-4 text-right">Tồn an toàn</th>
              <th className="py-3.5 px-4 text-right font-bold text-white">Tồn hiện tại</th>
              <th className="py-3.5 px-4 text-center">Tình trạng</th>
              <th className="py-3.5 px-4 text-center w-36">Thao tác nhanh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-[#0b1f35]">
            {rows.map((row, idx) => {
              const originalItem = data.items.find((i) => i.code === row.itemCode);
              const minStock = originalItem?.minStock || 0;
              const isLowStock = minStock > 0 && row.closingStock <= minStock;
              const isOutOfStock = row.closingStock <= 0;

              return (
                <tr key={row.itemCode} className="hover:bg-[#122c4a] transition-colors">
                  <td className="py-3 px-4 text-center font-mono text-slate-400 text-xs">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-300">
                    {row.itemCode}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {row.itemName}
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300">
                    {row.unit}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {row.category}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                    {formatQty(minStock)}
                  </td>
                  <td className={`py-3 px-4 text-right font-mono tabular-nums font-black text-base ${
                    isOutOfStock 
                      ? 'text-rose-400' 
                      : isLowStock 
                      ? 'text-amber-400' 
                      : 'text-cyan-300'
                  }`}>
                    {formatQty(row.closingStock)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-300 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-700/60">
                        <AlertCircle className="w-3 h-3 text-rose-400" />
                        Hết hàng
                      </span>
                    ) : isLowStock ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-700/60">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        Dưới định mức
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Đảm bảo tồn
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {originalItem && (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onQuickImport(originalItem)}
                          className="px-2.5 py-1 rounded-lg bg-[#FFC107] hover:bg-[#ffb300] text-slate-950 text-[11px] font-black transition-all flex items-center gap-0.5 cursor-pointer shadow-xs"
                          title="Tạo phiếu nhập cho vật tư này"
                        >
                          <ArrowDownLeft className="w-3 h-3 text-slate-950" strokeWidth={2.5} />
                          <span>Nhập</span>
                        </button>
                        <button
                          onClick={() => onQuickExport(originalItem)}
                          disabled={row.closingStock <= 0}
                          className="px-2.5 py-1 rounded-lg bg-[#FFD700] hover:bg-[#ffc107] text-slate-950 text-[11px] font-black transition-all flex items-center gap-0.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                          title="Tạo phiếu xuất cho vật tư này"
                        >
                          <ArrowUpRight className="w-3 h-3 text-slate-950" strokeWidth={2.5} />
                          <span>Xuất</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
