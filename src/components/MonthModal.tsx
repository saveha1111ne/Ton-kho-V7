import React, { useState } from 'react';
import { AppStateData } from '../types/inventory';
import { getNextMonth, sortMonths, calculateAllStockLedger, formatQty } from '../utils/inventoryCalculations';
import { CalendarPlus, X, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface MonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppStateData;
  onAddMonth: (newMonth: string) => void;
}

export const MonthModal: React.FC<MonthModalProps> = ({
  isOpen,
  onClose,
  data,
  onAddMonth,
}) => {
  const sortedMonths = sortMonths(data.months);
  const latestMonth = sortedMonths[sortedMonths.length - 1] || 'T08/2026';
  const suggestedMonth = getNextMonth(latestMonth);

  const [monthInput, setMonthInput] = useState(suggestedMonth);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const { ledger } = calculateAllStockLedger(data);

  // Compute total closing stock of latest month being carried forward
  let totalCarriedForward = 0;
  data.branches.forEach(b => {
    data.items.forEach(it => {
      const closing = ledger[latestMonth]?.[b.id]?.[it.code]?.closing || 0;
      totalCarriedForward += closing;
    });
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = monthInput.trim().toUpperCase();
    if (!formatted.match(/^T\d{1,2}\/\d{4}$/)) {
      setError('Định dạng tháng phải theo chuẩn TMM/YYYY (Ví dụ: T09/2026)');
      return;
    }
    if (data.months.includes(formatted)) {
      setError(`Kỳ tháng ${formatted} đã tồn tại trong hệ thống!`);
      return;
    }
    onAddMonth(formatted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#0d2238] rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#00695C] border-b border-teal-500/50 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-teal-200" />
            <h3 className="font-bold text-base">MỞ KỲ KẾ TOÁN MỚI (THÊM THÁNG)</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/20 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Kỳ tháng mới (Định dạng TMM/YYYY) *
            </label>
            <input
              type="text"
              value={monthInput}
              onChange={(e) => {
                setMonthInput(e.target.value);
                setError('');
              }}
              placeholder="VD: T09/2026, T10/2026..."
              required
              className="w-full px-3.5 py-2.5 bg-[#011627] border border-slate-700 rounded-xl text-base font-mono font-bold text-amber-300 focus:outline-none focus:ring-2 focus:ring-[#00796B]/50 focus:border-teal-400"
            />
          </div>

          {/* Automatic carryover rollover explanation */}
          <div className="p-4 rounded-xl bg-[#081a2e] border border-slate-700 text-xs space-y-2">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>CƠ CHẾ TỰ ĐỘNG CHUYỂN TỒN THÁNG</span>
            </div>
            <div className="flex items-center justify-between bg-[#011627] p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="text-center">
                <div className="text-slate-400 text-[10px]">Kỳ trước</div>
                <div className="font-bold text-slate-200">{latestMonth}</div>
                <div className="text-[10px] text-cyan-300">Tồn cuối: {formatQty(totalCarriedForward)}</div>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400" />
              <div className="text-center">
                <div className="text-slate-400 text-[10px]">Kỳ mới tạo</div>
                <div className="font-bold text-emerald-400">{monthInput || '...'}</div>
                <div className="text-[10px] text-emerald-400">Tồn đầu: {formatQty(totalCarriedForward)}</div>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              ✓ Tồn cuối kỳ của <strong>{latestMonth}</strong> tại từng kho sẽ tự động trở thành Tồn đầu kỳ của <strong>{monthInput || 'tháng mới'}</strong>.
              <br />
              ✓ Tuyệt đối bảo toàn toàn bộ dữ liệu lịch sử các tháng trước.
            </p>
          </div>

          {/* Action buttons (Secondary button style: Soft mint/cyan) */}
          <div className="pt-3 border-t border-slate-700 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-300 bg-[#011627] hover:bg-slate-800 border border-slate-700 rounded-xl cursor-pointer"
            >
              HỦY
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-white bg-[#00796B] hover:bg-[#00897B] border border-teal-400/40 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              + XÁC NHẬN MỞ THÁNG MỚI
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
