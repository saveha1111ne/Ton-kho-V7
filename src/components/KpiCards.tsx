import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Boxes, MapPin, Package } from 'lucide-react';
import { formatQty } from '../utils/inventoryCalculations';

interface KpiCardsProps {
  totalImports: number;
  totalExports: number;
  totalStock: number;
  branchCount: number;
  itemCount: number;
  selectedMonth: string;
  selectedBranchName?: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  totalImports,
  totalExports,
  totalStock,
  branchCount,
  itemCount,
  selectedMonth,
  selectedBranchName,
}) => {
  const subtitleContext = `${selectedMonth === 'all' ? 'Toàn bộ thời gian' : selectedMonth} ${
    selectedBranchName && selectedBranchName !== 'Tất cả chi nhánh' ? `· ${selectedBranchName}` : ''
  }`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      
      {/* 1. TỔNG NHẬP (Xám xanh đậm #1A2A3A, số vàng/trắng) */}
      <div className="bg-[#1A2A3A] hover:bg-[#203448] border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-4 shadow-md transition-all duration-200 hover:shadow-lg flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-white transition-colors">
            TỔNG NHẬP
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#FFD700] font-mono tabular-nums tracking-tight drop-shadow-xs">
            {formatQty(totalImports)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1 truncate">
            {subtitleContext}
          </div>
        </div>
      </div>

      {/* 2. TỔNG XUẤT (Xám xanh đậm #1A2A3A, số vàng/trắng) */}
      <div className="bg-[#1A2A3A] hover:bg-[#203448] border border-slate-700/80 hover:border-rose-500/50 rounded-2xl p-4 shadow-md transition-all duration-200 hover:shadow-lg flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-white transition-colors">
            TỔNG XUẤT
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#FFC107] font-mono tabular-nums tracking-tight drop-shadow-xs">
            {formatQty(totalExports)}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1 truncate">
            {subtitleContext}
          </div>
        </div>
      </div>

      {/* 3. TỔNG TỒN HIỆN TẠI (Xám xanh đậm #1A2A3A, số trắng/vàng) */}
      <div className="bg-[#0B3D59] hover:bg-[#0f496b] border border-cyan-700/60 hover:border-cyan-400/60 rounded-2xl p-4 shadow-md transition-all duration-200 hover:shadow-lg flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-100 group-hover:text-white transition-colors">
            TỔNG TỒN HIỆN TẠI
          </span>
          <div className="w-8 h-8 rounded-xl bg-cyan-400/20 border border-cyan-300/40 flex items-center justify-center text-cyan-300">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight drop-shadow-xs">
            {formatQty(totalStock)}
          </div>
          <div className="text-[11px] text-cyan-200/80 font-medium mt-1 truncate">
            Tồn cuối kỳ khả dụng
          </div>
        </div>
      </div>

      {/* 4. SỐ CHI NHÁNH (Xám xanh đậm #1A2A3A) */}
      <div className="bg-[#1A2A3A] hover:bg-[#203448] border border-slate-700/80 hover:border-blue-500/50 rounded-2xl p-4 shadow-md transition-all duration-200 hover:shadow-lg flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-white transition-colors">
            SỐ CHI NHÁNH
          </span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <MapPin className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {branchCount} <span className="text-sm font-semibold text-slate-400">kho</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Hà Nội, ĐN, HCM, Cần Thơ
          </div>
        </div>
      </div>

      {/* 5. SỐ MÃ VẬT TƯ (Xám xanh đậm #1A2A3A) */}
      <div className="bg-[#1A2A3A] hover:bg-[#203448] border border-slate-700/80 hover:border-amber-500/50 rounded-2xl p-4 shadow-md transition-all duration-200 hover:shadow-lg flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200 group-hover:text-white transition-colors">
            SỐ MÃ VẬT TƯ
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Boxes className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
            {itemCount} <span className="text-sm font-semibold text-slate-400">mã</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Đang lưu thông trên hệ thống
          </div>
        </div>
      </div>

    </div>
  );
};
