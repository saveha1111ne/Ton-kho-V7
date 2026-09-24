import React, { useState } from 'react';
import { AppStateData } from '../types/inventory';
import { formatQty, getMonthlyMatrixReport, sortMonths } from '../utils/inventoryCalculations';
import { Calendar, Layers, Printer, FileSpreadsheet } from 'lucide-react';
import { exportToExcel } from '../utils/exportUtils';

interface MonthlyReportProps {
  data: AppStateData;
}

type MetricMode = 'closing' | 'imports' | 'exports' | 'opening';

export const MonthlyReport: React.FC<MonthlyReportProps> = ({ data }) => {
  const sortedMonths = sortMonths(data.months);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    sortedMonths[sortedMonths.length - 1] || 'T07/2026'
  );
  const [metricMode, setMetricMode] = useState<MetricMode>('closing');

  const reportData = getMonthlyMatrixReport(data, selectedMonth, metricMode);

  const metricLabels: Record<MetricMode, string> = {
    closing: 'Số lượng Tồn cuối kỳ',
    imports: 'Số lượng Nhập trong kỳ',
    exports: 'Số lượng Xuất trong kỳ',
    opening: 'Số lượng Tồn đầu kỳ',
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportThisReport = () => {
    exportToExcel(data, selectedMonth, 'all', '', true);
  };

  return (
    <div className="bg-[#0d2238] border border-slate-700/80 rounded-2xl shadow-lg overflow-hidden mb-6 text-slate-100">
      
      {/* Control Bar */}
      <div className="p-4 sm:px-6 border-b border-slate-700/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-[#081a2e]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>BÁO CÁO NHẬP – XUẤT – TỒN MA TRẬN CHI NHÁNH</span>
          </h2>
          <p className="text-xs text-slate-300">
            Xem phân bổ {metricLabels[metricMode].toLowerCase()} của từng mã vật tư trên tất cả các kho
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Month selector dropdown */}
          <div className="flex items-center gap-1.5 bg-[#011627] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              {sortedMonths.map((m) => (
                <option key={m} value={m} className="bg-[#011627] text-white">
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>

          {/* Metric Selector (Tồn cuối / Nhập / Xuất / Tồn đầu) */}
          <div className="flex items-center p-1 bg-[#011627] border border-slate-700 rounded-xl">
            {(['closing', 'imports', 'exports', 'opening'] as MetricMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setMetricMode(mode)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  metricMode === mode
                    ? 'bg-[#00695C] text-white shadow-xs border border-teal-400/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {mode === 'closing' && 'Tồn cuối'}
                {mode === 'imports' && 'Nhập'}
                {mode === 'exports' && 'Xuất'}
                {mode === 'opening' && 'Tồn đầu'}
              </button>
            ))}
          </div>

          {/* Excel Export Button */}
          <button
            onClick={handleExportThisReport}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#107c41] hover:bg-[#0f6b38] border border-white/60 shadow-sm transition-all cursor-pointer"
            title="Xuất bảng báo cáo này ra Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>XUẤT EXCEL</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-200 bg-[#081a2e] hover:bg-slate-800 border border-slate-700 transition-all cursor-pointer no-print"
            title="In báo cáo"
          >
            <Printer className="w-3.5 h-3.5 text-slate-300" />
            <span>In</span>
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-[#091e33] text-slate-300 font-bold border-b border-slate-700 uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-12 text-center">STT</th>
              <th className="py-3.5 px-4">Mã VT</th>
              <th className="py-3.5 px-4">Tên vật tư</th>
              <th className="py-3.5 px-3 text-center">ĐVT</th>
              
              {/* Dynamic Branch Columns */}
              {reportData.branches.map((b) => (
                <th key={b.id} className="py-3.5 px-4 text-right">
                  <div className="font-bold text-white">{b.name}</div>
                  <div className="text-[10px] font-mono text-cyan-400 font-normal">({b.code})</div>
                </th>
              ))}

              <th className="py-3.5 px-4 text-right text-[#FFD700] font-black bg-[#002244]">
                TỔNG HỆ THỐNG
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-[#0b1f35]">
            {reportData.items.length === 0 ? (
              <tr>
                <td colSpan={4 + reportData.branches.length + 1} className="py-12 text-center text-slate-400">
                  Chưa có dữ liệu cho tháng {selectedMonth}.
                </td>
              </tr>
            ) : (
              reportData.items.map((item, idx) => {
                const rowTotal = reportData.itemTotals[item.code] || 0;
                return (
                  <tr key={item.code} className="hover:bg-[#122c4a] transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-400 text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">
                      {item.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {item.name}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-300">
                      {item.unit}
                    </td>

                    {/* Branch quantities */}
                    {reportData.branches.map((b) => {
                      const val = reportData.matrix[item.code]?.[b.id] || 0;
                      return (
                        <td key={b.id} className="py-3 px-4 text-right font-mono tabular-nums text-slate-200">
                          {val > 0 ? (
                            <span className={metricMode === 'imports' ? 'text-emerald-400 font-bold' : metricMode === 'exports' ? 'text-rose-400 font-bold' : 'text-slate-100 font-semibold'}>
                              {formatQty(val)}
                            </span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Total quantity across branches */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-black text-base text-white bg-cyan-950/40">
                      {formatQty(rowTotal)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Grand total row */}
          <tfoot>
            <tr className="bg-[#00284d] text-white font-extrabold border-t-2 border-[#FFC107]">
              <td colSpan={4} className="py-3.5 px-4 text-left uppercase tracking-wider text-xs sm:text-sm text-slate-200">
                TỔNG CỘNG ({reportData.items.length} mã VT)
              </td>
              {reportData.branches.map((b) => (
                <td key={b.id} className="py-3.5 px-4 text-right font-mono tabular-nums text-sm text-slate-100">
                  {formatQty(reportData.branchTotals[b.id] || 0)}
                </td>
              ))}
              <td className="py-3.5 px-4 text-right font-mono tabular-nums text-base sm:text-lg text-[#FFD700]">
                {formatQty(reportData.grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

    </div>
  );
};
