import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  TableProperties, 
  SlidersHorizontal, 
  Users2
} from 'lucide-react';

export type NavTabKey = 
  | 'overview' 
  | 'inventory' 
  | 'imports' 
  | 'exports' 
  | 'reports' 
  | 'analytics' 
  | 'catalog' 
  | 'settings';

interface NavigationTabsProps {
  activeTab: NavTabKey;
  onSelectTab: (tab: NavTabKey) => void;
  importCount: number;
  exportCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  importCount,
  exportCount,
}) => {
  const tabs = [
    { key: 'overview', label: 'Tổng quan (Dashboard)', icon: LayoutDashboard },
    { key: 'inventory', label: 'Hàng tồn kho', icon: Package },
    { key: 'imports', label: 'Nhập kho', icon: ArrowDownLeft, badge: importCount },
    { key: 'exports', label: 'Xuất kho', icon: ArrowUpRight, badge: exportCount },
    { key: 'reports', label: 'Báo cáo', icon: TableProperties },
    { key: 'catalog', label: 'Danh mục vật tư', icon: SlidersHorizontal },
    { key: 'settings', label: 'Quản lý tài khoản & Sheets', icon: Users2 },
  ];

  return (
    <nav 
      className="bg-[#00695C] border border-[#004D40]/80 rounded-2xl p-2 shadow-lg flex items-center gap-1.5 overflow-x-auto mb-6 scrollbar-none" 
      aria-label="Điều hướng chính"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onSelectTab(tab.key as NavTabKey)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-[#004D40] text-white shadow-md border border-white/30 ring-1 ring-white/20'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className={`w-4 h-4 text-white ${isActive ? 'scale-110 drop-shadow-xs' : 'opacity-90'}`} />
            <span className="tracking-wide text-white">{tab.label}</span>
            {typeof tab.badge === 'number' && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-extrabold ${
                  isActive 
                    ? 'bg-amber-400 text-slate-950 shadow-xs' 
                    : 'bg-white/20 text-white'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
