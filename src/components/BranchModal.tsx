import React, { useState, useEffect } from 'react';
import { Branch } from '../types/inventory';
import { Building2, X, AlertCircle } from 'lucide-react';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBranch?: Branch | null;
  onSave: (branch: Partial<Branch>) => void;
  existingCodes: string[];
}

export const BranchModal: React.FC<BranchModalProps> = ({
  isOpen,
  onClose,
  initialBranch,
  onSave,
  existingCodes,
}) => {
  const isEditing = Boolean(initialBranch);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [manager, setManager] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialBranch) {
      setCode(initialBranch.code);
      setName(initialBranch.name);
      setAddress(initialBranch.address || '');
      setManager(initialBranch.manager || '');
      setPhone(initialBranch.phone || '');
    } else {
      setCode('');
      setName('');
      setAddress('');
      setManager('');
      setPhone('0901601600');
    }
    setError('');
  }, [isOpen, initialBranch]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();

    if (!trimmedCode) {
      setError('Vui lòng nhập mã kho (VD: R5, R6)');
      return;
    }
    if (!trimmedName) {
      setError('Vui lòng nhập tên chi nhánh');
      return;
    }

    if (!isEditing && existingCodes.includes(trimmedCode)) {
      setError(`Mã kho "${trimmedCode}" đã được sử dụng! Vui lòng chọn mã khác.`);
      return;
    }

    onSave({
      code: trimmedCode,
      name: trimmedName,
      address: address.trim(),
      manager: manager.trim(),
      phone: phone.trim() || '0901601600',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#0d2238] rounded-2xl shadow-2xl border border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#00695C] border-b border-teal-500/50 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-teal-200" />
            <h3 className="font-bold text-base">
              {isEditing ? 'CHỈNH SỬA CHI NHÁNH' : 'THÊM CHI NHÁNH / KHO MỚI'}
            </h3>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Mã kho (Code) *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="VD: R5, R6"
                disabled={isEditing}
                required
                className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-mono font-bold uppercase text-amber-300 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Số điện thoại liên hệ
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901601600"
                className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Tên chi nhánh *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Hải Phòng (R5), Nha Trang (R6)..."
              required
              className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Người phụ trách (Thủ kho)
            </label>
            <input
              type="text"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="Họ và tên thủ kho"
              className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Địa chỉ kho hàng
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..."
              rows={2}
              className="w-full px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs text-white"
            />
          </div>

          {/* Secondary Button Style: Soft mint/teal, text white */}
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
              className="px-6 py-2 text-xs font-bold text-white bg-[#00796B] hover:bg-[#00897B] border border-teal-400/40 rounded-xl shadow-md cursor-pointer active:scale-95"
            >
              LƯU CHI NHÁNH
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
