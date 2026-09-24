import React from 'react';
import { AppStateData, FilterState, Transaction, TransactionType } from '../types/inventory';
import { formatQty } from '../utils/inventoryCalculations';
import { ArrowDownLeft, ArrowUpRight, Edit2, Trash2 } from 'lucide-react';

interface TransactionListProps {
  type: TransactionType;
  data: AppStateData;
  filters: FilterState;
  onOpenCreateModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onRequestDeleteTransaction: (tx: Transaction) => void;
  canEdit: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  type,
  data,
  filters,
  onOpenCreateModal,
  onEditTransaction,
  onRequestDeleteTransaction,
  canEdit,
}) => {
  const isImport = type === 'import';
  const title = isImport ? 'DANH SÁCH GIAO DỊCH NHẬP KHO' : 'DANH SÁCH GIAO DỊCH XUẤT KHO';
  const btnLabel = isImport ? '+ NHẬP KHO' : '+ XUẤT KHO';

  // Filter transactions
  const filteredTransactions = data.transactions.filter((tx) => {
    if (tx.type !== type) return false;
    if (filters.selectedMonth !== 'all' && tx.month !== filters.selectedMonth) return false;
    if (filters.selectedBranch !== 'all' && tx.branchId !== filters.selectedBranch) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchCode = tx.itemCode.toLowerCase().includes(q);
      const matchName = tx.itemName.toLowerCase().includes(q);
      const matchNote = (tx.note || '').toLowerCase().includes(q);
      const matchBranch = tx.branchName.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchNote && !matchBranch) return false;
    }
    return true;
  });

  // Calculate total quantity
  const totalQuantity = filteredTransactions.reduce((sum, tx) => sum + (Number(tx.quantity) || 0), 0);

  return (
    <div className="bg-[#0d2238] border border-slate-700/80 rounded-2xl shadow-lg overflow-hidden mb-6 text-slate-100">
      
      {/* Header bar */}
      <div className="p-4 sm:px-6 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#081a2e]">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            isImport ? 'bg-emerald-950/80 border border-emerald-600/50 text-emerald-400' : 'bg-rose-950/80 border border-rose-600/50 text-rose-400'
          }`}>
            {isImport ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">{title}</h2>
            <p className="text-xs text-slate-300">
              {filteredTransactions.length} giao dịch được ghi nhận
            </p>
          </div>
        </div>

        {/* Nút hành động chính: Vàng kim #FFC107 */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-[#FFC107] hover:bg-[#ffb300] active:scale-95 shadow-md transition-all cursor-pointer ring-1 ring-amber-300 self-start sm:self-auto"
        >
          {isImport ? <ArrowDownLeft className="w-4 h-4 text-slate-950" strokeWidth={2.5} /> : <ArrowUpRight className="w-4 h-4 text-slate-950" strokeWidth={2.5} />}
          <span>{btnLabel}</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-[#091e33] text-slate-300 font-bold border-b border-slate-700 uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-12 text-center">STT</th>
              <th className="py-3.5 px-4">Ngày GD</th>
              <th className="py-3.5 px-4">Mã VT</th>
              <th className="py-3.5 px-4">Tên vật tư</th>
              <th className="py-3.5 px-4">Chi nhánh</th>
              <th className="py-3.5 px-4 text-right">Số lượng</th>
              <th className="py-3.5 px-4">Kỳ</th>
              <th className="py-3.5 px-4">Người lập</th>
              <th className="py-3.5 px-4">Ghi chú</th>
              {canEdit && <th className="py-3.5 px-4 text-center w-24">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-[#0b1f35]">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  Không tìm thấy giao dịch nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx, idx) => (
                <tr key={tx.id} className="hover:bg-[#122c4a] transition-colors">
                  <td className="py-3 px-4 text-center font-mono text-slate-400 text-xs">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-300">
                    {tx.itemCode}
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {tx.itemName}
                  </td>
                  <td className="py-3 px-4 text-slate-200">
                    <span className="font-medium">{tx.branchName}</span>
                  </td>
                  <td className={`py-3 px-4 text-right font-mono tabular-nums font-black text-base ${
                    isImport ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isImport ? '+' : '-'}{formatQty(tx.quantity)}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-amber-300">
                    {tx.month}
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-xs truncate max-w-[120px]">
                    {tx.createdBy || 'Hệ thống'}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-xs truncate max-w-[150px]">
                    {tx.note || '-'}
                  </td>
                  {canEdit && (
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1 hover:bg-slate-700/60 rounded text-cyan-300 transition-colors cursor-pointer"
                          title="Chỉnh sửa giao dịch"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRequestDeleteTransaction(tx)}
                          className="p-1 hover:bg-rose-950/60 rounded text-rose-400 transition-colors cursor-pointer"
                          title="Xóa giao dịch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary footer bar */}
      <div className="p-3.5 sm:px-6 bg-[#081a2e] border-t border-slate-700 flex items-center justify-between text-xs sm:text-sm">
        <div className="text-slate-300">
          Hiển thị <strong>{filteredTransactions.length}</strong> dòng
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-300">Tổng số lượng giao dịch:</span>
          <span className={`font-mono font-extrabold text-base ${isImport ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatQty(totalQuantity)}
          </span>
        </div>
      </div>

    </div>
  );
};
