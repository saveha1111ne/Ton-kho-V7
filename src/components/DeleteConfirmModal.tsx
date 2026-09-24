import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemDescription?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận xóa dữ liệu',
  message = 'Bạn có chắc chắn muốn xóa dữ liệu này không?',
  itemDescription,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#0d2238] rounded-2xl shadow-2xl border border-slate-700 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-100">
        
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-950/80 text-rose-400 border border-rose-600/60 mx-auto flex items-center justify-center mb-4 ring-4 ring-rose-900/30">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-white mb-2">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 mb-3 leading-relaxed">
            {message}
          </p>

          {itemDescription && (
            <div className="p-2.5 rounded-xl bg-[#011627] border border-slate-700 text-xs font-semibold text-amber-300 mb-5 break-words">
              {itemDescription}
            </div>
          )}

          <p className="text-[11px] text-slate-400 mb-5">
            Hành động này sẽ cập nhật lại số liệu tồn kho và không thể hoàn tác.
          </p>

          {/* TWO REQUIRED BUTTONS: HỦY | XÓA */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-bold text-slate-300 bg-[#011627] hover:bg-slate-800 border border-slate-700 rounded-xl transition-all cursor-pointer"
            >
              HỦY
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-md transition-all cursor-pointer"
            >
              XÓA
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
