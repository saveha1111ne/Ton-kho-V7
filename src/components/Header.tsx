import React from 'react';
import { AppStateData, UserAccount } from '../types/inventory';
import { 
  Building2, 
  Phone, 
  ShieldCheck, 
  User, 
  FileSpreadsheet, 
  RefreshCw, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  data: AppStateData;
  currentUser: UserAccount;
  onSwitchUser: (userId: string) => void;
  onOpenSheetsModal: () => void;
  onOpenQuickSync: () => void;
  isSyncingSheets: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  data,
  currentUser,
  onSwitchUser,
  onOpenSheetsModal,
  onOpenQuickSync,
  isSyncingSheets,
}) => {
  const isSheetsConnected = data.googleSheets.isConnected && Boolean(data.googleSheets.webAppUrl);

  return (
    <header className="w-full bg-gradient-to-r from-[#0a192f] via-[#102a4e] to-[#1a365d] text-white border-b border-blue-900/60 shadow-lg sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          
          {/* Brand & Title zone */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-md ring-2 ring-blue-300/30 shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white uppercase drop-shadow-sm font-sans">
                  HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC
                </h1>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  Version 2026
                </span>
              </div>
              <p className="text-xs text-blue-200/80 font-medium">
                Inventory Management Dashboard · Phân hệ kiểm soát nhập - xuất - tồn đa chi nhánh
              </p>
            </div>
          </div>

          {/* Right zone: Author, Hotline & User Role */}
          <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 text-xs">
            
            {/* Logistic Author & Hotline Tag */}
            <div className="flex items-center gap-2 bg-blue-950/70 border border-blue-700/50 rounded-lg px-3 py-1.5 shadow-inner">
              <span className="text-blue-200 font-semibold tracking-wide">
                Made by Ha Nhung Logistic
              </span>
              <span className="text-blue-400">·</span>
              <a 
                href="tel:0901601600" 
                className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-bold transition-colors"
                title="Gọi hỗ trợ kỹ thuật"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>0901601600</span>
              </a>
            </div>

            {/* Google Sheets Status Pill */}
            <button
              onClick={onOpenSheetsModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                isSheetsConnected
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200 hover:bg-emerald-900/60'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80'
              }`}
              title="Cấu hình kết nối Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Google Sheets:</span>
              {isSheetsConnected ? (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Đã kết nối
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  Chưa kết nối
                </span>
              )}
            </button>

            {/* User Profile / Quick Switcher */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg px-3 py-1.5 transition-colors cursor-pointer">
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                ) : (
                  <User className="w-4 h-4 text-sky-300" />
                )}
                <div className="text-left">
                  <div className="font-semibold text-white truncate max-w-[140px]">
                    {currentUser.role === 'admin' ? 'Ha Nhung' : currentUser.name}
                  </div>
                  <div className="text-[10px] text-blue-200">
                    {currentUser.role === 'admin' ? 'Chủ tài khoản / Admin' : 'Nhân viên kho'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-blue-200" />
              </div>

              {/* Dropdown switch users */}
              <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-800 mb-1">
                  CHUYỂN ĐỔI TÀI KHOẢN (GMAIL)
                </div>
                {data.users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => onSwitchUser(u.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-[10px] opacity-80">{u.email}</div>
                    </div>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-black/20">
                      {u.role === 'admin' ? 'Admin' : 'Nhân viên'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
