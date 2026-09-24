import React, { useState, useRef } from 'react';
import { AppStateData } from '../types/inventory';
import {
  ExcelParseResult,
  parseExcelWorkbook,
  applyExcelDataToState,
  downloadSampleExcelTemplate,
} from '../utils/excelImport';
import { formatQty } from '../utils/inventoryCalculations';
import {
  FileSpreadsheet,
  Upload,
  X,
  FileCheck,
  AlertTriangle,
  Download,
  CheckCircle2,
  Layers,
  Calendar,
  Building2,
  RefreshCw,
  PlusCircle,
  Info,
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppStateData;
  targetMonth: string;
  currentUser: string;
  onSuccess: (updatedState: AppStateData, summaryText: string) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  data,
  targetMonth,
  currentUser,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse state
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');

  // Options
  const [importMode, setImportMode] = useState<'overwrite' | 'append'>('overwrite');
  const [selectedMonth, setSelectedMonth] = useState<string>(targetMonth !== 'all' ? targetMonth : (data.months[data.months.length - 1] || 'T08/2026'));
  const [defaultBranchId, setDefaultBranchId] = useState<string>(data.branches[0]?.id || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (chosenFile: File, preferredSheet?: string) => {
    setError(null);
    setIsParsing(true);
    try {
      const res = await parseExcelWorkbook(
        chosenFile,
        selectedMonth,
        data.branches,
        data.items,
        preferredSheet
      );
      setSheetNames(res.sheetNames);
      setSelectedSheet(res.parseResult.selectedSheet);
      setParseResult(res.parseResult);
      setFile(chosenFile);
    } catch (err: any) {
      setError(err?.message || 'Không thể đọc tệp Excel. Vui lòng kiểm tra lại định dạng file!');
      setParseResult(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      handleProcessFile(f);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      handleProcessFile(f);
    }
  };

  const handleSheetChange = (sheetName: string) => {
    if (file) {
      setSelectedSheet(sheetName);
      handleProcessFile(file, sheetName);
    }
  };

  const handleDownloadSample = () => {
    downloadSampleExcelTemplate(data.branches, selectedMonth);
  };

  const handleExecuteImport = () => {
    if (!parseResult || parseResult.rows.length === 0) {
      setError('Chưa có dữ liệu nào được phân tích thành công.');
      return;
    }

    try {
      const { newState, addedItemsCount, updatedItemsCount } = applyExcelDataToState(
        data,
        parseResult,
        {
          importMode,
          targetMonth: selectedMonth,
          defaultBranchId,
          operatorName: currentUser,
        }
      );

      const totalApplied = addedItemsCount + updatedItemsCount;
      const summary = `Đã nhập thành công ${totalApplied} vật tư vào kỳ ${selectedMonth} (${
        importMode === 'overwrite' ? 'Ghi đè/Cập nhật' : 'Thêm mới'
      })${addedItemsCount > 0 ? `, bao gồm ${addedItemsCount} vật tư mới` : ''}. Hệ thống đã tự động tính toán lại ma trận tồn kho.`;

      onSuccess(newState, summary);
      handleResetAndClose();
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi cập nhật dữ liệu vào hệ thống.');
    }
  };

  const handleResetAndClose = () => {
    setFile(null);
    setParseResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#0d2238] rounded-2xl shadow-2xl border border-slate-700 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#004D40] via-[#00695C] to-[#0d2238] text-white flex items-center justify-between shrink-0 shadow-sm border-b border-teal-500/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-wide">NHẬP DỮ LIỆU TỪ FILE EXCEL</h3>
                <span className="text-[10px] uppercase font-bold bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-300/30">
                  .XLSX / .XLS
                </span>
              </div>
              <p className="text-xs text-teal-200">
                Tự động đọc, khớp cột ma trận 4 chi nhánh và kết chuyển số liệu vào Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-black/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* SECTION 1: DRAG & DROP ZONE & SAMPLE DOWNLOAD */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>1. Chọn hoặc kéo thả tệp Excel (.xlsx, .xls)</span>
              </label>

              <button
                type="button"
                onClick={handleDownloadSample}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-200 hover:text-white bg-[#004D40] hover:bg-[#00695C] px-3 py-1.5 rounded-lg border border-teal-500/40 transition-colors cursor-pointer"
                title="Tải mẫu Excel ma trận 4 chi nhánh chuẩn"
              >
                <Download className="w-3.5 h-3.5" />
                <span>TẢI FILE MẪU EXCEL (.XLSX)</span>
              </button>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-950/40 scale-[0.99]'
                  : file
                  ? 'border-teal-500 bg-[#081a2e]'
                  : 'border-slate-600 hover:border-emerald-400 bg-[#081a2e]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />

              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-600 flex items-center justify-center shrink-0">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{file.name}</span>
                      <span className="text-[11px] font-mono text-slate-400 font-normal">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <div className="text-xs text-emerald-400 font-medium">
                      ✓ Đã tải tệp lên thành công. Nhấn để đổi tệp khác nếu cần.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-950/60 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-700/50">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-200">
                    Kéo và thả tệp Excel vào đây, hoặc <span className="text-cyan-300 underline">chọn từ máy tính</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Hỗ trợ tệp <strong>.xlsx</strong>, <strong>.xls</strong> hoặc bản xuất từ hệ thống CIC / Mẫu ma trận 4 chi nhánh
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: CONFIGURATION OPTIONS */}
          {file && (
            <div className="bg-[#081a2e] border border-slate-700 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-700 pb-2">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>2. Tùy chọn cấu hình & Chế độ nhập</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Sheet Selection */}
                {sheetNames.length > 1 && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Chọn trang tính (Sheet):
                    </label>
                    <select
                      value={selectedSheet}
                      onChange={(e) => handleSheetChange(e.target.value)}
                      className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs font-medium text-white focus:ring-2 focus:ring-[#FFC107]/40"
                    >
                      {sheetNames.map((s) => (
                        <option key={s} value={s} className="bg-[#011627] text-white">
                          📄 {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Target Month */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Áp dụng cho kỳ / Tháng:</span>
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs font-bold text-amber-300 focus:ring-2 focus:ring-[#FFC107]/40"
                  >
                    {data.months.map((m) => (
                      <option key={m} value={m} className="bg-[#011627] text-white">
                        Tháng {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Default Branch (if not in columns) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>Chi nhánh mặc định:</span>
                  </label>
                  <select
                    value={defaultBranchId}
                    onChange={(e) => setDefaultBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs font-medium text-white focus:ring-2 focus:ring-[#FFC107]/40"
                  >
                    {data.branches.map((b) => (
                      <option key={b.id} value={b.id} className="bg-[#011627] text-white">
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Import Mode: Overwrite vs Append */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Xử lý dữ liệu khi trùng Mã vật tư và Tháng:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Option A: Overwrite */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'overwrite'
                        ? 'bg-[#004D40]/30 border-teal-500 ring-1 ring-teal-500'
                        : 'bg-[#011627] border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'overwrite'}
                      onChange={() => setImportMode('overwrite')}
                      className="mt-0.5 text-teal-400"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                        <span>CẬP NHẬT / GHI ĐÈ DỮ LIỆU HIỆN CÓ</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                        Thay thế số liệu trong kỳ ({selectedMonth}) nếu trùng mã vật tư, đồng thời cập nhật tên/đơn vị tính mới nhất.
                      </p>
                    </div>
                  </label>

                  {/* Option B: Append */}
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'append'
                        ? 'bg-[#003B73]/30 border-sky-500 ring-1 ring-sky-500'
                        : 'bg-[#011627] border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="mt-0.5 text-sky-400"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
                        <span>THÊM MỚI VÀO DANH SÁCH (CỘNG DỒN)</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                        Giữ nguyên dữ liệu cũ, chỉ bổ sung thêm các giao dịch và mã vật tư mới vào hệ thống.
                      </p>
                    </div>
                  </label>

                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: DATA PREVIEW */}
          {parseResult && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                    3. Bản xem trước dữ liệu đọc được ({parseResult.rows.length} dòng)
                  </span>
                </div>

                {/* Summary badges */}
                <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                  <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 font-bold rounded-full border border-emerald-700/60">
                    +{parseResult.newItemsCount} vật tư mới
                  </span>
                  <span className="px-2.5 py-0.5 bg-sky-950 text-sky-300 font-bold rounded-full border border-sky-700/60">
                    {parseResult.existingItemsCount} vật tư đã có
                  </span>
                  {parseResult.totalImportQty > 0 && (
                    <span className="px-2.5 py-0.5 bg-teal-950 text-teal-300 font-bold font-mono rounded-full border border-teal-700/60">
                      Tổng nhập: +{formatQty(parseResult.totalImportQty)}
                    </span>
                  )}
                  {parseResult.totalExportQty > 0 && (
                    <span className="px-2.5 py-0.5 bg-rose-950 text-rose-300 font-bold font-mono rounded-full border border-rose-700/60">
                      Tổng xuất: -{formatQty(parseResult.totalExportQty)}
                    </span>
                  )}
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-700 rounded-xl overflow-hidden bg-[#0b1f35] shadow-md max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#091e33] text-slate-300 sticky top-0 border-b border-slate-700 font-bold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">STT</th>
                      <th className="py-2.5 px-3">Mã VT</th>
                      <th className="py-2.5 px-3">Tên vật tư</th>
                      <th className="py-2.5 px-2 text-center">ĐVT</th>
                      <th className="py-2.5 px-3">Nhóm</th>
                      <th className="py-2.5 px-2 text-center">Kỳ</th>
                      {data.branches.slice(0, 4).map((b) => (
                        <th key={b.id} className="py-2.5 px-2 text-center font-bold text-amber-300">
                          {b.code}
                        </th>
                      ))}
                      <th className="py-2.5 px-3 text-right">Tổng Nhập</th>
                      <th className="py-2.5 px-3 text-right">Tổng Xuất</th>
                      <th className="py-2.5 px-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {parseResult.rows.map((row, idx) => {
                      return (
                        <tr key={idx} className="hover:bg-[#122c4a] transition-colors">
                          <td className="py-2 px-3 text-center font-mono text-slate-400 text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-amber-300">
                            {row.itemCode}
                          </td>
                          <td className="py-2 px-3 font-semibold text-white truncate max-w-[160px]">
                            {row.itemName}
                          </td>
                          <td className="py-2 px-2 text-center text-slate-300">
                            {row.unit}
                          </td>
                          <td className="py-2 px-3 text-slate-400 truncate max-w-[100px]">
                            {row.category}
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-[11px] text-slate-300">
                            {row.month}
                          </td>

                          {/* Branch values */}
                          {data.branches.slice(0, 4).map((b) => {
                            const bVal = row.branches[b.id];
                            const num = bVal ? (bVal.imports || bVal.exports || bVal.stock || 0) : 0;
                            return (
                              <td key={b.id} className="py-2 px-2 text-center font-mono text-[11px]">
                                {num > 0 ? (
                                  <span className="font-bold text-white">{formatQty(num)}</span>
                                ) : (
                                  <span className="text-slate-600">-</span>
                                )}
                              </td>
                            );
                          })}

                          <td className="py-2 px-3 text-right font-mono text-emerald-400 font-bold">
                            {row.importQty > 0 ? `+${formatQty(row.importQty)}` : '-'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-rose-400 font-bold">
                            {row.exportQty > 0 ? `-${formatQty(row.exportQty)}` : '-'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {row.isNewItem ? (
                              <span className="inline-block px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded font-bold text-[10px]">
                                MỚI
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700/60 rounded font-bold text-[10px]">
                                ĐÃ CÓ
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#081a2e] border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400">
            {parseResult ? (
              <span>
                Đã sẵn sàng kết chuyển <strong className="text-white">{parseResult.rows.length}</strong> dòng vào hệ thống.
              </span>
            ) : (
              <span>Vui lòng tải lên tệp Excel để xem trước dữ liệu trước khi lưu.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-4 py-2 text-xs font-bold text-slate-300 bg-[#011627] border border-slate-700 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              HỦY
            </button>
            <button
              type="button"
              disabled={!parseResult || parseResult.rows.length === 0 || isParsing}
              onClick={handleExecuteImport}
              className="px-6 py-2 text-xs font-black text-slate-950 bg-[#FFC107] hover:bg-[#ffb300] active:scale-95 disabled:opacity-40 disabled:pointer-events-none rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ring-1 ring-amber-300"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>
                LƯU VÀO HỆ THỐNG ({parseResult ? parseResult.rows.length : 0} DÒNG)
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
