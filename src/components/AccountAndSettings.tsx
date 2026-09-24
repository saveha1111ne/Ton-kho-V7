import React, { useState } from 'react';
import { AppStateData, UserAccount, UserRole } from '../types/inventory';
import { GOOGLE_APPS_SCRIPT_CODE } from '../utils/googleSheetsSync';
import { 
  ShieldCheck, 
  User, 
  FileSpreadsheet, 
  RefreshCw, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Upload, 
  RotateCcw
} from 'lucide-react';

interface AccountAndSettingsProps {
  data: AppStateData;
  currentUser: UserAccount;
  onUpdateGoogleSheetsConfig: (url: string, spreadsheetUrl?: string) => void;
  onTestConnection: () => void;
  onSyncPush: () => void;
  isSyncing: boolean;
  onAddUser: (user: Omit<UserAccount, 'id'>) => void;
  onExportJsonBackup: () => void;
  onImportJsonBackup: (jsonString: string) => void;
  onResetToDefault: () => void;
  canManageSystem: boolean;
}

export const AccountAndSettings: React.FC<AccountAndSettingsProps> = ({
  data,
  currentUser,
  onUpdateGoogleSheetsConfig,
  onTestConnection,
  onSyncPush,
  isSyncing,
  onAddUser,
  onExportJsonBackup,
  onImportJsonBackup,
  onResetToDefault,
  canManageSystem,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [sheetsUrlInput, setSheetsUrlInput] = useState(data.googleSheets.webAppUrl || '');
  const [showCodeGuide, setShowCodeGuide] = useState(false);

  // New user form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('staff');
  const [userFormError, setUserFormError] = useState('');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveSheetsUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoogleSheetsConfig(sheetsUrlInput);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) {
      setUserFormError('Vui lòng điền đầy đủ Email và Họ tên.');
      return;
    }
    if (!newEmail.includes('@')) {
      setUserFormError('Địa chỉ email không hợp lệ.');
      return;
    }
    if (data.users.some(u => u.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setUserFormError('Email này đã tồn tại trong danh sách tài khoản.');
      return;
    }

    onAddUser({
      email: newEmail.trim(),
      name: newName.trim(),
      role: newRole,
    });

    setNewEmail('');
    setNewName('');
    setNewRole('staff');
    setUserFormError('');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportJsonBackup(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 mb-6 text-slate-100">
      
      {/* 1. KẾT NỐI GOOGLE SHEETS */}
      <div className="bg-[#0d2238] border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-600/50 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>KẾT NỐI & ĐỒNG BỘ GOOGLE SHEETS</span>
                {data.googleSheets.isConnected ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    🟢 Đã kết nối
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700/60">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    🔴 Chưa kết nối
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Đồng bộ hai chiều danh mục vật tư, tồn kho, và lịch sử giao dịch qua Google Apps Script Web App API
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCodeGuide(!showCodeGuide)}
            className="text-xs font-semibold text-cyan-300 hover:text-white bg-[#081a2e] hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
          >
            {showCodeGuide ? 'Ẩn mã Apps Script' : 'Xem mã Apps Script & Hướng dẫn'}
          </button>
        </div>

        {/* Input URL form */}
        <form onSubmit={handleSaveSheetsUrl} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Google Sheets Web App API URL:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={sheetsUrlInput}
                onChange={(e) => setSheetsUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                disabled={!canManageSystem}
                className="flex-1 px-3.5 py-2.5 bg-[#011627] border border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFC107]/40 focus:border-[#FFC107] disabled:opacity-50"
              />
              {canManageSystem && (
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#00838F] hover:bg-[#0097A7] text-white text-xs font-bold rounded-xl border border-cyan-400/40 transition-all shadow-sm shrink-0 cursor-pointer"
                  >
                    LƯU URL
                  </button>
                  <button
                    type="button"
                    onClick={onTestConnection}
                    disabled={isSyncing || !sheetsUrlInput}
                    className="px-4 py-2 bg-[#0b1f35] hover:bg-slate-700 border border-slate-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 disabled:opacity-40 cursor-pointer"
                  >
                    [ KẾT NỐI ]
                  </button>
                  <button
                    type="button"
                    onClick={onSyncPush}
                    disabled={isSyncing || !data.googleSheets.webAppUrl}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0 disabled:opacity-40 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>[ ĐỒNG BỘ DỮ LIỆU ]</span>
                  </button>
                </div>
              )}
            </div>
            {!canManageSystem && (
              <p className="text-[11px] text-amber-400 mt-1">
                Chỉ tài khoản Quản trị (Admin) mới có quyền cấu hình kết nối Google Sheets.
              </p>
            )}
            {data.googleSheets.spreadsheetUrl && (
              <div className="mt-2 text-xs flex items-center gap-1.5 text-cyan-300">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Bảng tính liên kết: </span>
                <a 
                  href={data.googleSheets.spreadsheetUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="font-medium underline hover:text-white truncate max-w-md"
                >
                  {data.googleSheets.spreadsheetUrl}
                </a>
              </div>
            )}
          </div>
        </form>

        {/* Ready-to-copy code guide drawer */}
        {showCodeGuide && (
          <div className="mt-5 p-4 rounded-xl bg-[#011627] text-slate-200 text-xs border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-300">
                MÃ GOOGLE APPS SCRIPT (SẴN SÀNG TRIỂN KHAI)
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-3 py-1 bg-[#00838F] hover:bg-[#0097A7] text-white rounded text-[11px] font-semibold transition-colors cursor-pointer border border-cyan-400/40"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Đã sao chép!' : 'Sao chép mã'}</span>
              </button>
            </div>
            <p className="text-slate-400 text-[11px] mb-2 leading-relaxed">
              Mở Google Sheet &gt; Tiện ích mở rộng &gt; Apps Script &gt; Dán đoạn mã này &gt; Triển khai dạng Web App (Execute as: Me, Who has access: Anyone) &gt; Dán Web App URL vào hệ thống.
            </p>
            <pre className="p-3 bg-black/60 rounded-lg overflow-x-auto text-[11px] font-mono text-emerald-400 max-h-56 leading-normal border border-slate-800">
              {GOOGLE_APPS_SCRIPT_CODE}
            </pre>
          </div>
        )}
      </div>

      {/* 2. PHÂN QUYỀN TÀI KHOẢN (GMAIL) */}
      <div className="bg-[#0d2238] border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-lg">
        <div className="pb-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00695C] text-teal-200 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                PHÂN QUYỀN TÀI KHOẢN BẰNG GMAIL
              </h3>
              <p className="text-xs text-slate-300">
                Phân định vai trò Chủ tài khoản (Admin: Ha Nhung) toàn quyền và Nhân viên kho (chỉ nhập, xuất và xem)
              </p>
            </div>
          </div>
        </div>

        {/* User list */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-[#091e33] text-slate-300 font-bold border-b border-slate-700 text-[11px] uppercase">
                <th className="py-2.5 px-4">Tên người dùng</th>
                <th className="py-2.5 px-4">Địa chỉ Gmail</th>
                <th className="py-2.5 px-4">Vai trò</th>
                <th className="py-2.5 px-4">Phạm vi quyền</th>
                <th className="py-2.5 px-4 text-center">Trạng thái đăng nhập</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-[#0b1f35]">
              {data.users.map((u) => (
                <tr key={u.id} className="hover:bg-[#122c4a]">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    {u.role === 'admin' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <User className="w-4 h-4 text-cyan-400" />
                    )}
                    <span>{u.name}</span>
                    {u.id === currentUser.id && (
                      <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black">
                        Đang chọn
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-300">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                      u.role === 'admin' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60' 
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-700/60'
                    }`}>
                      {u.role === 'admin' ? 'Chủ tài khoản / Admin' : 'Nhân viên'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-300">
                    {u.role === 'admin' 
                      ? 'Toàn quyền: Thêm, Sửa, Xóa, Quản lý vật tư, Tháng, Sheets'
                      : 'Nhập kho, Xuất kho, Xem báo cáo, Lọc dữ liệu'}
                  </td>
                  <td className="py-3 px-4 text-center text-xs text-slate-400">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('vi-VN') : 'Mới tạo'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add user form (Admin only) */}
        {canManageSystem && (
          <form onSubmit={handleCreateUser} className="mt-5 p-4 rounded-xl bg-[#081a2e] border border-slate-700">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2">
              Thêm người dùng mới vào hệ thống
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 font-medium mb-1">Địa chỉ Gmail *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="nhanvien@gmail.com"
                  className="w-full px-3 py-2 bg-[#011627] border border-slate-700 text-white rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 font-medium mb-1">Tên đầy đủ *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Họ và tên nhân viên"
                  className="w-full px-3 py-2 bg-[#011627] border border-slate-700 text-white rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-300 font-medium mb-1">Phân quyền</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-[#011627] border border-slate-700 text-white rounded-lg text-xs"
                >
                  <option value="staff">Nhân viên (Quyền cơ bản)</option>
                  <option value="admin">Quản trị viên (Toàn quyền)</option>
                </select>
              </div>
            </div>
            {userFormError && <p className="text-xs text-rose-400 mt-2">{userFormError}</p>}
            <button
              type="submit"
              className="mt-3 px-4 py-2 bg-[#FFC107] hover:bg-[#ffb300] text-slate-950 text-xs font-black rounded-lg transition-all cursor-pointer shadow-sm"
            >
              + Thêm người dùng
            </button>
          </form>
        )}
      </div>

      {/* 3. QUẢN TRỊ DỮ LIỆU & SAO LƯU (BACKUP / RESTORE) */}
      <div className="bg-[#0d2238] border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-lg">
        <h3 className="text-base font-bold text-white mb-1">
          SAO LƯU & QUẢN TRỊ DỮ LIỆU LOCALSTORAGE
        </h3>
        <p className="text-xs text-slate-300 mb-4">
          Dữ liệu được lưu trữ tự động trên trình duyệt. Bạn có thể sao lưu ra tệp JSON hoặc khôi phục bất cứ lúc nào.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onExportJsonBackup}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0b1f35] hover:bg-slate-700 border border-slate-600 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Sao lưu dữ liệu (Tải file JSON)</span>
          </button>

          {canManageSystem && (
            <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0b1f35] hover:bg-slate-700 border border-slate-600 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Khôi phục từ file JSON</span>
              <input type="file" accept=".json" onChange={handleFileInput} className="hidden" />
            </label>
          )}

          {canManageSystem && (
            <button
              onClick={onResetToDefault}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 transition-colors ml-auto cursor-pointer"
              title="Đặt lại toàn bộ dữ liệu mẫu ban đầu của CIC"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Khôi phục dữ liệu mẫu CIC</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
