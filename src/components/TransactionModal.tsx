import React, { useState, useEffect } from 'react';
import { AppStateData, Transaction, TransactionType } from '../types/inventory';
import { getAvailableStockForExport, formatQty } from '../utils/inventoryCalculations';
import { X, ArrowDownLeft, ArrowUpRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType;
  data: AppStateData;
  initialTransaction?: Transaction | null;
  onSave: (tx: Partial<Transaction>) => void;
  currentUser: string;
  defaultMonth: string;
  defaultBranchId: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  type,
  data,
  initialTransaction,
  onSave,
  currentUser,
  defaultMonth,
  defaultBranchId,
}) => {
  const isImport = type === 'import';
  const isEditing = Boolean(initialTransaction);

  const [month, setMonth] = useState('');
  const [date, setDate] = useState('');
  const [branchId, setBranchId] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Pre-fill on open/change
  useEffect(() => {
    if (initialTransaction) {
      setMonth(initialTransaction.month);
      setDate(initialTransaction.date);
      setBranchId(initialTransaction.branchId);
      setItemCode(initialTransaction.itemCode);
      setQuantity(initialTransaction.quantity);
      setNote(initialTransaction.note || '');
    } else {
      const targetMonth = defaultMonth !== 'all' ? defaultMonth : (data.months[data.months.length - 1] || 'T07/2026');
      setMonth(targetMonth);
      setDate(new Date().toISOString().split('T')[0]);
      setBranchId(defaultBranchId !== 'all' ? defaultBranchId : (data.branches[0]?.id || ''));
      setItemCode(data.items[0]?.code || '');
      setQuantity('');
      setNote('');
    }
    setError('');
  }, [isOpen, initialTransaction, defaultMonth, defaultBranchId, data]);

  if (!isOpen) return null;

  // Selected item information
  const selectedItem = data.items.find((i) => i.code === itemCode);
  const selectedBranch = data.branches.find((b) => b.id === branchId);

  // Available stock calculation for export validation
  const availableStock = !isImport && branchId && itemCode && month
    ? getAvailableStockForExport(
        data, 
        month, 
        branchId, 
        itemCode, 
        isEditing ? initialTransaction?.id : undefined
      )
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numQty = Number(quantity);
    if (!numQty || numQty <= 0) {
      setError('Số lượng giao dịch phải lớn hơn 0.');
      return;
    }

    // Export validation: Cannot export more than available stock
    if (!isImport && numQty > availableStock) {
      setError(
        `Không thể xuất kho vượt quá số lượng tồn kho khả dụng! Hiện tại chỉ còn ${formatQty(
          availableStock
        )} ${selectedItem?.unit || 'sản phẩm'} tại ${selectedBranch?.name}.`
      );
      return;
    }

    onSave({
      type,
      month,
      date,
      branchId,
      branchName: selectedBranch?.name || '',
      itemCode,
      itemName: selectedItem?.name || '',
      quantity: numQty,
      note: note.trim(),
      createdBy: currentUser,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#0d2238] rounded-2xl shadow-2xl border border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Modal Header */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${
          isImport ? 'bg-[#004D40] border-b border-teal-700/60' : 'bg-[#4A0E17] border-b border-rose-800/60'
        }`}>
          <div className="flex items-center gap-2.5">
            {isImport ? <ArrowDownLeft className="w-5 h-5 text-emerald-300" /> : <ArrowUpRight className="w-5 h-5 text-rose-300" />}
            <h3 className="font-bold text-base tracking-tight">
              {isEditing ? 'CHỈNH SỬA PHIẾU' : 'LẬP PHIẾU'} {isImport ? 'NHẬP KHO' : 'XUẤT KHO'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="font-semibold leading-relaxed">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Tháng */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Tháng (Kỳ) *
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40 focus:border-[#FFC107]"
              >
                {data.months.map((m) => (
                  <option key={m} value={m} className="bg-[#011627] text-white">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Ngày giao dịch */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Ngày giao dịch *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40 focus:border-[#FFC107]"
              />
            </div>
          </div>

          {/* Chi nhánh */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Chi nhánh (Kho hàng) *
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40 focus:border-[#FFC107]"
            >
              {data.branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#011627] text-white">
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Mã & Tên vật tư */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Vật tư / Hàng hóa *
            </label>
            <select
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40 focus:border-[#FFC107]"
            >
              {data.items.map((item) => (
                <option key={item.id} value={item.code} className="bg-[#011627] text-white">
                  [{item.code}] {item.name} — ({item.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Available stock badge for export */}
          {!isImport && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#011627] border border-slate-700 text-xs">
              <span className="text-slate-300 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Tồn kho khả dụng tại chi nhánh này:</span>
              </span>
              <span className="font-mono font-extrabold text-sm text-[#FFD700]">
                {formatQty(availableStock)} {selectedItem?.unit || 'Đơn vị'}
              </span>
            </div>
          )}

          {/* Số lượng */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Số lượng {isImport ? 'nhập' : 'xuất'} ({selectedItem?.unit || 'Đơn vị'}) *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
              placeholder="Nhập số lượng..."
              required
              className="w-full px-3 py-2.5 bg-[#011627] border border-slate-700 rounded-xl text-base font-mono font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40 focus:border-[#FFC107]"
            />
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Ghi chú / Mục đích giao dịch
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Nhập hàng đợt 1, Xuất tặng hội nghị, Điều chuyển kho..."
              rows={2}
              className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40 focus:border-[#FFC107]"
            />
          </div>

          {/* Buttons: HỦY | LƯU (Vàng kim #FFC107) */}
          <div className="pt-3 border-t border-slate-700 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#011627] hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              HỦY
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-black text-slate-950 bg-[#FFC107] hover:bg-[#ffb300] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer ring-1 ring-amber-300"
            >
              LƯU PHIẾU {isImport ? 'NHẬP' : 'XUẤT'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
