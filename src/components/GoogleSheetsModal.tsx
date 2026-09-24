import React, { useState } from 'react';
import { AppStateData } from '../types/inventory';
import { GOOGLE_APPS_SCRIPT_CODE } from '../utils/googleSheetsSync';
import { FileSpreadsheet, X, Copy, Check, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppStateData;
  onSaveUrl: (url: string) => void;
  onTest: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  data,
  onSaveUrl,
  onTest,
  onSync,
  isSyncing,
}) => {
  const [urlInput, setUrlInput] = useState(data.googleSheets.webAppUrl || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUrl(urlInput.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#0d2238] rounded-2xl shadow-2xl border border-slate-700 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#004D40] via-[#00695C] to-[#0d2238] border-b border-teal-500/40 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base">KẾT NỐI VÀ ĐỒNG BỘ GOOGLE SHEETS</h3>
              <p className="text-xs text-teal-200">Hệ thống đồng bộ dữ liệu kho CIC lên Google Sheets</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/20 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Status badge */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            data.googleSheets.isConnected 
              ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-200' 
              : 'bg-[#081a2e] border-slate-700 text-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              {data.googleSheets.isConnected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <div className="font-bold text-sm">
                  Trạng thái: {data.googleSheets.isConnected ? '🟢 ĐÃ KẾT NỐI' : '🔴 CHƯA KẾT NỐI'}
                </div>
                <div className="text-xs text-slate-400">
                  {data.googleSheets.lastSyncedAt 
                    ? `Đồng bộ lần cuối: ${new Date(data.googleSheets.lastSyncedAt).toLocaleString('vi-VN')}` 
                    : 'Chưa thực hiện đồng bộ lần nào'}
                </div>
              </div>
            </div>

            {data.googleSheets.isConnected && (
              <button
                onClick={onSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Đồng bộ ngay</span>
              </button>
            )}
          </div>

          {/* Form input */}
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Google Sheets Web App API URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  required
                  className="flex-1 px-3 py-2 bg-[#011627] border border-slate-700 rounded-xl text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40 focus:border-[#FFC107]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00838F] hover:bg-[#0097A7] text-white text-xs font-bold rounded-xl border border-cyan-400/40 cursor-pointer"
                >
                  Lưu URL
                </button>
                <button
                  type="button"
                  onClick={onTest}
                  disabled={isSyncing || !urlInput}
                  className="px-4 py-2 bg-[#0b1f35] hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold rounded-xl disabled:opacity-40 cursor-pointer"
                >
                  [ KẾT NỐI ]
                </button>
              </div>
            </div>
          </form>

          {/* Step by step guide */}
          <div className="border border-slate-700 rounded-xl p-4 bg-[#081a2e] text-xs space-y-2">
            <h4 className="font-bold text-amber-300 uppercase tracking-wide">
              Cách lấy URL Web App trong 3 bước:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed">
              <li>Mở Google Spreadsheet của bạn &gt; chọn menu <strong>Tiện ích mở rộng (Extensions)</strong> &gt; <strong>Apps Script</strong>.</li>
              <li>Sao chép đoạn mã phía dưới, dán vào trình biên tập Apps Script và nhấn Lưu (Ctrl+S).</li>
              <li>Nhấn <strong>Triển khai (Deploy)</strong> &gt; <strong>Tùy chọn triển khai mới</strong> &gt; Chọn <strong>Ứng dụng web (Web App)</strong> &gt; Ai có quyền truy cập: <strong>Bất kỳ ai (Anyone)</strong> &gt; Triển khai và dán URL vào ô bên trên.</li>
            </ol>
          </div>

          {/* Copy Script Button & Box */}
          <div className="bg-[#011627] text-slate-200 p-4 rounded-xl text-xs border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-300">MÃ APPS SCRIPT ĐÃ TẠO SẴN</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#00838F] hover:bg-[#0097A7] text-white rounded font-bold text-xs border border-cyan-400/40 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép!' : 'Sao chép toàn bộ code'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-black/60 rounded-lg text-[11px] font-mono text-emerald-400 max-h-40 overflow-y-auto leading-normal border border-slate-800">
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>

        </div>

        <div className="p-4 border-t border-slate-700 bg-[#081a2e] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-300 bg-[#011627] border border-slate-700 hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
