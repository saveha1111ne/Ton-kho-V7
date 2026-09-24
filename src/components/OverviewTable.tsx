import React, { useState } from 'react';
import { AppStateData, FilterState } from '../types/inventory';
import { 
  formatQty, 
  getBranchSummary, 
  getFilteredInventoryOverview, 
  sortMonths 
} from '../utils/inventoryCalculations';
import { ChevronRight } from 'lucide-react';

interface OverviewTableProps {
  data: AppStateData;
  filters: FilterState;
  onSelectItemForDetail?: (itemCode: string) => void;
}

type ViewMode = 'by_item' | 'by_branch' | 'by_month';

export const OverviewTable: React.FC<OverviewTableProps> = ({
  data,
  filters,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('by_item');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const { rows, totals } = getFilteredInventoryOverview(
    data,
    filters.selectedMonth,
    filters.selectedBranch,
    filters.searchQuery
  );

  const branchSummary = getBranchSummary(data, filters.selectedMonth, filters.searchQuery);
  const sortedMonths = sortMonths(data.months);

  const toggleExpand = (code: string) => {
    setExpandedItem(prev => prev === code ? null : code);
  };

  return (
    <div className="bg-[#0d2238] border border-slate-700/80 rounded-2xl shadow-lg overflow-hidden mb-6 text-slate-100">
      
      {/* Table Header Controls */}
      <div className="p-4 sm:px-6 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#081a2e]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
            <span className="tracking-wide">BẢNG TỔNG HỢP NHẬP – XUẤT – TỒN</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#00695C] text-teal-100 border border-teal-400/40">
              {filters.selectedMonth === 'all' ? 'Toàn bộ thời gian' : `Kỳ ${filters.selectedMonth}`}
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Công thức: Tồn cuối kỳ = Tồn đầu kỳ + Tổng Nhập - Tổng Xuất
          </p>
        </div>

        {/* View Mode Switcher: Theo vật tư | Theo chi nhánh | Theo tháng */}
        <div className="flex items-center p-1 bg-[#011627] border border-slate-700/80 rounded-xl">
          <button
            onClick={() => setViewMode('by_item')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'by_item'
                ? 'bg-[#00695C] text-white shadow-sm border border-teal-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Theo vật tư
          </button>
          <button
            onClick={() => setViewMode('by_branch')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'by_branch'
                ? 'bg-[#00695C] text-white shadow-sm border border-teal-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Theo chi nhánh
          </button>
          <button
            onClick={() => setViewMode('by_month')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === 'by_month'
                ? 'bg-[#00695C] text-white shadow-sm border border-teal-400/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Theo tháng
          </button>
        </div>
      </div>

      {/* 1. VIEW MODE: THEO VẬT TƯ */}
      {viewMode === 'by_item' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#091e33] text-slate-300 font-bold border-b border-slate-700 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Mã VT</th>
                <th className="py-3.5 px-4">Tên vật tư</th>
                <th className="py-3.5 px-3 text-center">ĐVT</th>
                <th className="py-3.5 px-4">Nhóm vật tư</th>
                <th className="py-3.5 px-4 text-right">Tồn đầu</th>
                <th className="py-3.5 px-4 text-right text-emerald-400">Nhập</th>
                <th className="py-3.5 px-4 text-right text-rose-400">Xuất</th>
                <th className="py-3.5 px-4 text-right text-amber-300 font-extrabold">Tồn cuối</th>
                <th className="py-3.5 px-3 text-center w-16">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-[#0b1f35]">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    Không tìm thấy dữ liệu vật tư phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => {
                  const isExpanded = expandedItem === row.itemCode;
                  return (
                    <React.Fragment key={row.itemCode}>
                      <tr 
                        className={`hover:bg-[#122c4a] transition-colors cursor-pointer ${
                          isExpanded ? 'bg-[#143254]' : ''
                        }`}
                        onClick={() => toggleExpand(row.itemCode)}
                      >
                        <td className="py-3 px-4 text-center font-mono text-slate-400 text-xs">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-300">
                          {row.itemCode}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {row.itemName}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-300 font-medium">
                          {row.unit}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {row.category}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200 font-medium">
                          {formatQty(row.openingStock)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-400 font-bold bg-emerald-950/20">
                          +{formatQty(row.imports)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-400 font-bold bg-rose-950/20">
                          -{formatQty(row.exports)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-white font-black bg-cyan-950/40 text-base">
                          {formatQty(row.closingStock)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button 
                            className="p-1 hover:bg-slate-700/60 rounded text-cyan-300 transition-colors"
                            title="Xem tồn chi tiết theo từng chi nhánh"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(row.itemCode);
                            }}
                          >
                            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90 text-amber-400' : ''}`} />
                          </button>
                        </td>
                      </tr>

                      {/* Sub-row: Branch breakdown for this item */}
                      {isExpanded && row.branchBreakdown && (
                        <tr className="bg-[#061424] border-y border-slate-700">
                          <td colSpan={10} className="p-3 sm:px-8">
                            <div className="bg-[#0b1f33] rounded-xl border border-slate-700 p-3 shadow-inner">
                              <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <span>Phân bổ tồn kho tại 4 chi nhánh · {row.itemName} ({row.itemCode})</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                {data.branches.map((b) => {
                                  const bd = row.branchBreakdown?.[b.id] || { opening: 0, imports: 0, exports: 0, closing: 0 };
                                  return (
                                    <div key={b.id} className="p-2.5 rounded-lg border border-slate-700/80 bg-[#071727] text-xs">
                                      <div className="font-bold text-white mb-1 flex items-center justify-between">
                                        <span>{b.name}</span>
                                        <span className="font-mono text-[10px] text-amber-400 font-semibold">{b.code}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-300">
                                        <div>Tồn đầu: <span className="font-mono font-semibold tabular-nums text-slate-200">{formatQty(bd.opening)}</span></div>
                                        <div>Nhập: <span className="font-mono font-semibold tabular-nums text-emerald-400">+{formatQty(bd.imports)}</span></div>
                                        <div>Xuất: <span className="font-mono font-semibold tabular-nums text-rose-400">-{formatQty(bd.exports)}</span></div>
                                        <div className="font-bold text-amber-300">Tồn cuối: <span className="font-mono tabular-nums">{formatQty(bd.closing)}</span></div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>

            {/* GRAND TOTAL ROW: HIGHLIGHTED */}
            <tfoot>
              <tr className="bg-gradient-to-r from-[#00284d] via-[#00386b] to-[#001f3f] text-white font-extrabold border-t-2 border-[#FFC107]">
                <td colSpan={5} className="py-3.5 px-4 text-left uppercase tracking-wider text-xs sm:text-sm text-slate-200">
                  TỔNG CỘNG TOÀN HỆ THỐNG
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs sm:text-sm text-slate-200">
                  {formatQty(totals.opening)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs sm:text-sm text-emerald-400">
                  +{formatQty(totals.imports)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs sm:text-sm text-rose-400">
                  -{formatQty(totals.exports)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono tabular-nums text-base sm:text-lg text-[#FFD700]">
                  {formatQty(totals.closing)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* 2. VIEW MODE: THEO CHI NHÁNH */}
      {viewMode === 'by_branch' && (
        <div className="overflow-x-auto p-4 sm:p-6 bg-[#081a2e]">
          <table className="w-full text-left text-xs sm:text-sm border-collapse border border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-[#004D40] text-white font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-14 text-center">STT</th>
                <th className="py-3.5 px-4">Chi nhánh</th>
                <th className="py-3.5 px-4 text-right">Tồn đầu</th>
                <th className="py-3.5 px-4 text-right text-emerald-300">Nhập</th>
                <th className="py-3.5 px-4 text-right text-rose-300">Xuất</th>
                <th className="py-3.5 px-4 text-right text-[#FFD700]">Tồn cuối</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 bg-[#0b1f35]">
              {branchSummary.rows.map((b, idx) => (
                <tr key={b.branchId} className="hover:bg-[#122c4a] transition-colors">
                  <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-semibold">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span>{b.branchName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-200">
                    {formatQty(b.openingStock)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-emerald-400 bg-emerald-950/20">
                    +{formatQty(b.imports)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-rose-400 bg-rose-950/20">
                    -{formatQty(b.exports)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums font-black text-white bg-cyan-950/40 text-base">
                    {formatQty(b.closingStock)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#002244] text-white font-extrabold border-t-2 border-[#FFC107]">
                <td colSpan={2} className="py-3 px-4 uppercase text-slate-200">
                  Tổng 4 chi nhánh
                </td>
                <td className="py-3 px-4 text-right font-mono text-slate-200">
                  {formatQty(branchSummary.total.openingStock)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-400">
                  +{formatQty(branchSummary.total.imports)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-rose-400">
                  -{formatQty(branchSummary.total.exports)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-[#FFD700] text-base">
                  {formatQty(branchSummary.total.closingStock)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* 3. VIEW MODE: THEO THÁNG */}
      {viewMode === 'by_month' && (
        <div className="overflow-x-auto p-4 sm:p-6 bg-[#081a2e]">
          <table className="w-full text-left text-xs sm:text-sm border-collapse border border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <thead>
              <tr className="bg-[#004D40] text-white font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-14 text-center">STT</th>
                <th className="py-3.5 px-4">Kỳ kế toán (Tháng)</th>
                <th className="py-3.5 px-4 text-right">Tổng nhập</th>
                <th className="py-3.5 px-4 text-right">Tổng xuất</th>
                <th className="py-3.5 px-4 text-right text-[#FFD700]">Tồn cuối kỳ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 bg-[#0b1f35]">
              {sortedMonths.map((m, idx) => {
                const monthOverview = getFilteredInventoryOverview(data, m, 'all', '');
                return (
                  <tr key={m} className="hover:bg-[#122c4a] transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-semibold">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-300 font-mono">
                      Tháng {m}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-emerald-400 bg-emerald-950/20">
                      +{formatQty(monthOverview.totals.imports)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-bold text-rose-400 bg-rose-950/20">
                      -{formatQty(monthOverview.totals.exports)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-extrabold text-white text-base bg-cyan-950/40">
                      {formatQty(monthOverview.totals.closing)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
