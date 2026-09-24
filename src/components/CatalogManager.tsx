import React, { useState } from 'react';
import { AppStateData, Branch, Item } from '../types/inventory';
import { 
  Package, 
  Edit2, 
  Trash2, 
  FolderPlus, 
  CheckCircle2, 
  Building2,
  PackagePlus,
  MapPinPlus
} from 'lucide-react';

interface CatalogManagerProps {
  data: AppStateData;
  onOpenAddItemModal: () => void;
  onEditItem: (item: Item) => void;
  onRequestDeleteItem: (item: Item) => void;
  onOpenAddBranchModal: () => void;
  onEditBranch: (branch: Branch) => void;
  onRequestDeleteBranch: (branch: Branch) => void;
  onAddCategory: (categoryName: string) => void;
  canManage: boolean;
}

export const CatalogManager: React.FC<CatalogManagerProps> = ({
  data,
  onOpenAddItemModal,
  onEditItem,
  onRequestDeleteItem,
  onOpenAddBranchModal,
  onEditBranch,
  onRequestDeleteBranch,
  onAddCategory,
  canManage,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'items' | 'branches' | 'categories'>('items');
  const [newCatInput, setNewCatInput] = useState('');
  const [catError, setCatError] = useState('');

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCatInput.trim();
    if (!name) {
      setCatError('Vui lòng nhập tên nhóm vật tư');
      return;
    }
    if (data.categories.some(c => c.toLowerCase() === name.toLowerCase())) {
      setCatError('Nhóm này đã tồn tại trong hệ thống');
      return;
    }
    onAddCategory(name);
    setNewCatInput('');
    setCatError('');
  };

  return (
    <div className="bg-[#0d2238] border border-slate-700/80 rounded-2xl shadow-lg overflow-hidden mb-6 text-slate-100">
      
      {/* Sub-tabs & Action buttons */}
      <div className="p-4 sm:px-6 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#081a2e]">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubTab('items')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'items'
                ? 'bg-[#00695C] text-white shadow-sm border border-teal-400/30'
                : 'text-slate-300 hover:text-white bg-[#011627] border border-slate-700'
            }`}
          >
            <Package className="w-4 h-4 text-cyan-400" />
            <span>Danh mục Vật tư ({data.items.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('branches')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'branches'
                ? 'bg-[#00695C] text-white shadow-sm border border-teal-400/30'
                : 'text-slate-300 hover:text-white bg-[#011627] border border-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Chi nhánh & Kho ({data.branches.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('categories')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'categories'
                ? 'bg-[#00695C] text-white shadow-sm border border-teal-400/30'
                : 'text-slate-300 hover:text-white bg-[#011627] border border-slate-700'
            }`}
          >
            <FolderPlus className="w-4 h-4 text-emerald-400" />
            <span>Nhóm hàng hóa ({data.categories.length})</span>
          </button>
        </div>

        {/* Add button based on tab (Secondary button style: Light blue / soft mint, text white) */}
        {canManage && (
          <div>
            {activeSubTab === 'items' && (
              <button
                onClick={onOpenAddItemModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00838F] hover:bg-[#0097A7] text-white text-xs font-bold rounded-xl border border-cyan-400/40 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <PackagePlus className="w-4 h-4 text-cyan-200" />
                <span>+ THÊM VẬT TƯ MỚI</span>
              </button>
            )}
            {activeSubTab === 'branches' && (
              <button
                onClick={onOpenAddBranchModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#00796B] hover:bg-[#00897B] text-white text-xs font-bold rounded-xl border border-teal-400/40 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <MapPinPlus className="w-4 h-4 text-teal-200" />
                <span>+ THÊM CHI NHÁNH MỚI</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. SUBTAB: ITEMS */}
      {activeSubTab === 'items' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#091e33] text-slate-300 font-bold border-b border-slate-700 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Mã vật tư</th>
                <th className="py-3.5 px-4">Tên vật tư</th>
                <th className="py-3.5 px-3 text-center">ĐVT</th>
                <th className="py-3.5 px-4">Nhóm hàng</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Tồn tối thiểu</th>
                <th className="py-3.5 px-4">Mô tả / Ghi chú</th>
                <th className="py-3.5 px-4 text-center w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-[#0b1f35]">
              {data.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-[#122c4a] transition-colors">
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
                  <td className="py-3 px-4 text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-[#011627] border border-slate-700 text-xs font-mono">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60">
                        <CheckCircle2 className="w-3 h-3" />
                        Đang dùng
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        Tạm dừng
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300 font-semibold">
                    {item.minStock || 0}
                  </td>
                  <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={item.note}>
                    {item.note || '—'}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onEditItem(item)}
                        className="p-1 text-cyan-300 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
                        title="Chỉnh sửa vật tư"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRequestDeleteItem(item)}
                        className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950 rounded transition-colors cursor-pointer"
                        title="Xóa vật tư"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. SUBTAB: BRANCHES (Chi nhánh) */}
      {activeSubTab === 'branches' && (
        <div className="p-4 sm:p-6 bg-[#081a2e]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.branches.map((b, idx) => (
              <div key={b.id} className="border border-slate-700 rounded-xl p-4 bg-[#0b1f35] hover:border-cyan-500/50 hover:shadow-lg transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#011627] text-amber-300 border border-slate-700">
                      Mã kho: {b.code}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">#{idx + 1}</span>
                  </div>
                  <h4 className="font-bold text-white text-base mb-1">{b.name}</h4>
                  <p className="text-xs text-slate-300 mb-2">{b.address || 'Chưa cập nhật địa chỉ'}</p>
                  <div className="text-xs text-slate-300 space-y-0.5">
                    <div>Thủ kho: <strong className="text-white">{b.manager || 'Chưa phân công'}</strong></div>
                    <div>Liên hệ: <span className="font-mono font-medium text-cyan-300">{b.phone || '0901601600'}</span></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Chi nhánh trực thuộc</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditBranch(b)}
                      className="p-1 text-cyan-300 hover:text-white hover:bg-slate-700 rounded cursor-pointer"
                      title="Sửa thông tin chi nhánh"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!b.isDefault && (
                      <button
                        onClick={() => onRequestDeleteBranch(b)}
                        className="p-1 text-rose-400 hover:text-rose-200 hover:bg-rose-950 rounded cursor-pointer"
                        title="Xóa chi nhánh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SUBTAB: CATEGORIES (Nhóm vật tư) */}
      {activeSubTab === 'categories' && (
        <div className="p-4 sm:p-6 max-w-2xl bg-[#081a2e]">
          <h3 className="text-sm font-bold text-white mb-2">Thêm nhóm vật tư mới vào hệ thống</h3>
          <form onSubmit={handleAddCategorySubmit} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newCatInput}
              onChange={(e) => {
                setNewCatInput(e.target.value);
                setCatError('');
              }}
              placeholder="Nhập tên nhóm (ví dụ: Áo khoác, Thẻ nhân viên, Kỷ niệm chương...)"
              className="flex-1 px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC107]/30 focus:border-[#FFC107]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#00838F] hover:bg-[#0097A7] text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer border border-cyan-400/40"
            >
              Thêm nhóm
            </button>
          </form>
          {catError && <p className="text-xs text-rose-400 mb-3">{catError}</p>}

          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Danh sách nhóm hiện có ({data.categories.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.categories.map((cat) => {
                const count = data.items.filter(i => i.category === cat).length;
                return (
                  <div key={cat} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0b1f35] border border-slate-700 text-xs font-semibold text-white">
                    <span>{cat}</span>
                    <span className="font-mono text-[10px] bg-[#011627] px-1.5 py-0.5 rounded text-amber-300 border border-slate-800">
                      {count} mã VT
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
