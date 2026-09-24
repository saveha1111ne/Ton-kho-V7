import React, { useState, useEffect } from 'react';
import { Item } from '../types/inventory';
import { X, PackagePlus, AlertCircle } from 'lucide-react';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItem?: Item | null;
  categories: string[];
  existingCodes: string[];
  onSave: (item: Partial<Item>) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  initialItem,
  categories,
  existingCodes,
  onSave,
}) => {
  const isEditing = Boolean(initialItem);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Cái');
  const [category, setCategory] = useState(categories[0] || 'Túi đeo chéo');
  const [newCatInput, setNewCatInput] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [minStock, setMinStock] = useState<number | ''>(50);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialItem) {
      setCode(initialItem.code);
      setName(initialItem.name);
      setUnit(initialItem.unit);
      setCategory(initialItem.category);
      setStatus(initialItem.status);
      setMinStock(initialItem.minStock || 0);
      setNote(initialItem.note || '');
    } else {
      setCode('');
      setName('');
      setUnit('Cái');
      setCategory(categories[0] || 'Túi đeo chéo');
      setStatus('active');
      setMinStock(50);
      setNote('');
    }
    setNewCatInput('');
    setError('');
  }, [isOpen, initialItem, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();
    const finalCategory = newCatInput.trim() || category;

    if (!trimmedCode) {
      setError('Vui lòng nhập mã vật tư (VD: TC, DU0626, BGN0626)');
      return;
    }
    if (!trimmedName) {
      setError('Vui lòng nhập tên vật tư');
      return;
    }

    // Check duplicate code on new creation
    if (!isEditing && existingCodes.some(c => c.toUpperCase() === trimmedCode)) {
      setError(`Mã vật tư "${trimmedCode}" đã tồn tại trong danh mục.`);
      return;
    }

    onSave({
      code: trimmedCode,
      name: trimmedName,
      unit: unit.trim() || 'Cái',
      category: finalCategory,
      status,
      minStock: Number(minStock) || 0,
      note: note.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#0d2238] rounded-2xl shadow-2xl border border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#00695C] border-b border-teal-500/50 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <PackagePlus className="w-5 h-5 text-teal-200" />
            <h3 className="font-bold text-base tracking-tight">
              {isEditing ? 'CHỈNH SỬA THÔNG TIN VẬT TƯ' : 'KHAI BÁO MÃ VẬT TƯ MỚI'}
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
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="font-semibold">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Mã vật tư *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: TC, DU0626"
                disabled={isEditing}
                required
                className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-mono font-bold text-amber-300 uppercase focus:outline-none focus:ring-2 focus:ring-[#00838F]/50 focus:border-cyan-400 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Đơn vị tính (ĐVT) *
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Cái, Cây, Cuốn, Bộ..."
                required
                className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#00838F]/50 focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Tên vật tư *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Túi đeo chéo Team CIC, Dù cầm tay..."
              required
              className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#00838F]/50 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Nhóm vật tư *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs font-medium text-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#011627] text-white">
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                placeholder="Hoặc gõ nhóm mới..."
                className="px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Tồn an toàn tối thiểu
              </label>
              <input
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-mono font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Trạng thái sử dụng
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-white"
              >
                <option value="active" className="bg-[#011627] text-white">Đang sử dụng</option>
                <option value="inactive" className="bg-[#011627] text-white">Tạm dừng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Ghi chú mô tả
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Quy cách đóng gói, chất liệu, tính năng..."
              rows={2}
              className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400"
            />
          </div>

          {/* Secondary Button Style: Soft mint / Light cyan, white text */}
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
              className="px-6 py-2 text-xs font-bold text-white bg-[#00838F] hover:bg-[#0097A7] border border-cyan-400/40 rounded-xl shadow-md cursor-pointer active:scale-95"
            >
              LƯU VẬT TƯ
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
