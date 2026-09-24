import React from 'react';
import { 
  Search, 
  X, 
  Calendar, 
  MapPin, 
  Layers, 
  ArrowDownLeft, 
  ArrowUpRight, 
  PackagePlus, 
  CalendarPlus, 
  FileSpreadsheet, 
  FileText,
  Upload
} from 'lucide-react';
import { Branch, FilterState } from '../types/inventory';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  months: string[];
  branches: Branch[];
  categories: string[];
  onOpenImportModal: () => void;
  onOpenExportModal: () => void;
  onOpenAddItemModal: () => void;
  onOpenAddMonthModal: () => void;
  onOpenImportExcelModal: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  canManageSystem: boolean; // Permissions check
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  months,
  branches,
  categories,
  onOpenImportModal,
  onOpenExportModal,
  onOpenAddItemModal,
  onOpenAddMonthModal,
  onOpenImportExcelModal,
  onExportExcel,
  onExportCSV,
  canManageSystem,
}) => {
  return (
    <div className="bg-[#1A2A3A] border border-slate-700/80 rounded-2xl p-4 shadow-md mb-6 text-slate-100">
      
      {/* Upper row: Quick Actions Bar with requested button color palette */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 mb-3.5 border-b border-slate-700/60">
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Nút chính: + NHẬP KHO (Vàng kim #FFC107, chữ đen/xanh đậm) */}
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-[#011627] bg-[#FFC107] hover:bg-[#ffb300] active:scale-95 shadow-md transition-all cursor-pointer ring-1 ring-amber-300"
            title="Tạo phiếu nhập kho mới"
          >
            <ArrowDownLeft className="w-4 h-4 text-[#011627]" strokeWidth={2.5} />
            <span>+ NHẬP KHO</span>
          </button>

          {/* Nút chính: + XUẤT KHO (Vàng kim #FFD700, chữ đen/xanh đậm) */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-[#011627] bg-[#FFD700] hover:bg-[#ffc107] active:scale-95 shadow-md transition-all cursor-pointer ring-1 ring-amber-300"
            title="Tạo phiếu xuất kho mới"
          >
            <ArrowUpRight className="w-4 h-4 text-[#011627]" strokeWidth={2.5} />
            <span>+ XUẤT KHO</span>
          </button>

          {/* Nút phụ: + THÊM VẬT TƯ (Xanh lam nhạt / xanh mint dịu nhẹ, chữ trắng) */}
          <button
            onClick={onOpenAddItemModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#00838F] hover:bg-[#0097A7] active:scale-95 transition-all cursor-pointer border border-cyan-400/40 shadow-sm"
            title="Khai báo mã vật tư mới vào danh mục"
          >
            <PackagePlus className="w-4 h-4 text-cyan-200" />
            <span>+ THÊM VẬT TƯ</span>
          </button>

          {/* Nút phụ: + THÊM THÁNG MỚI (Xanh mint / xanh lam nhạt dịu nhẹ, chữ trắng) */}
          {canManageSystem && (
            <button
              onClick={onOpenAddMonthModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#00796B] hover:bg-[#00897B] active:scale-95 transition-all border border-teal-400/40 cursor-pointer shadow-sm"
              title="Mở kỳ kế toán / tháng mới và chuyển tồn cuối kỳ trước sang tồn đầu kỳ này"
            >
              <CalendarPlus className="w-4 h-4 text-teal-200" />
              <span>+ THÊM THÁNG MỚI</span>
            </button>
          )}
        </div>

        {/* Excel Import & Export buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Button Nhập từ Excel (Xanh mint / ngọc tươi sáng, chữ đậm) */}
          <button
            onClick={onOpenImportExcelModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 active:scale-95 shadow-md transition-all border border-white/60 cursor-pointer"
            title="Tải lên file Excel (.xlsx, .xls) và tự động đồng bộ tồn kho"
          >
            <Upload className="w-4 h-4 text-slate-950" strokeWidth={2.5} />
            <span>NHẬP TỪ EXCEL</span>
          </button>

          {/* Nút xuất Excel (XUẤT EXCEL): Giữ màu xanh lá cây chuẩn, viền trắng */}
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#107c41] hover:bg-[#0f6b38] border-2 border-white shadow-md active:scale-95 transition-all cursor-pointer"
            title="Xuất đầy đủ 6 sheet Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>📥 XUẤT EXCEL</span>
          </button>

          {/* Nút xuất CSV: Dark slate viền trắng */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 bg-[#0b1b2b] hover:bg-slate-800 border border-slate-600 transition-all cursor-pointer"
            title="Xuất tệp dữ liệu CSV (.csv)"
          >
            <FileText className="w-3.5 h-3.5 text-slate-300" />
            <span>📄 XUẤT CSV</span>
          </button>
        </div>
      </div>

      {/* Lower row: Search & Filters in Dark Mode */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* Search input: 4 cols */}
        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder="🔍 Tìm kiếm mã vật tư, tên vật tư..."
            className="w-full pl-9 pr-8 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40 focus:border-[#FFC107] transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Month: 3 cols */}
        <div className="md:col-span-3 relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-amber-400">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <select
            value={filters.selectedMonth}
            onChange={(e) => onFilterChange({ selectedMonth: e.target.value })}
            className="w-full pl-8 pr-7 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40 focus:border-[#FFC107] cursor-pointer transition-all"
          >
            <option value="all">📅 Tất cả các tháng</option>
            {months.map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Branch: 3 cols */}
        <div className="md:col-span-3 relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-cyan-400">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <select
            value={filters.selectedBranch}
            onChange={(e) => onFilterChange({ selectedBranch: e.target.value })}
            className="w-full pl-8 pr-7 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40 focus:border-[#FFC107] cursor-pointer transition-all"
          >
            <option value="all">🏢 Tất cả chi nhánh (4 kho)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Data Type: 2 cols */}
        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-emerald-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <select
            value={filters.selectedType}
            onChange={(e) => onFilterChange({ selectedType: e.target.value as any })}
            className="w-full pl-8 pr-7 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40 focus:border-[#FFC107] cursor-pointer transition-all"
          >
            <option value="all">Tất cả số liệu</option>
            <option value="import">Chỉ xem Nhập</option>
            <option value="export">Chỉ xem Xuất</option>
            <option value="stock">Chỉ xem Tồn</option>
          </select>
        </div>

      </div>

    </div>
  );
};
