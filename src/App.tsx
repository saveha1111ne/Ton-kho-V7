/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  AppStateData, 
  Branch, 
  FilterState, 
  Item, 
  Transaction, 
  TransactionType, 
  UserAccount 
} from './types/inventory';
import { 
  loadAppState, 
  saveAppState, 
  exportStateAsJsonFile, 
  importStateFromJson, 
  resetToDefaultData 
} from './utils/storage';
import { 
  calculateAllStockLedger, 
  formatQty, 
  getFilteredInventoryOverview, 
  sortMonths 
} from './utils/inventoryCalculations';
import { exportToExcel, exportToCSV } from './utils/exportUtils';
import { pushDataToGoogleSheets, testGoogleSheetsConnection } from './utils/googleSheetsSync';

// UI Components
import { Header } from './components/Header';
import { NavigationTabs, NavTabKey } from './components/NavigationTabs';
import { KpiCards } from './components/KpiCards';
import { FilterBar } from './components/FilterBar';
import { OverviewTable } from './components/OverviewTable';
import { DetailedInventoryView } from './components/DetailedInventoryView';
import { TransactionList } from './components/TransactionList';
import { MonthlyReport } from './components/MonthlyReport';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { CatalogManager } from './components/CatalogManager';
import { AccountAndSettings } from './components/AccountAndSettings';

// Modals & Feedback
import { TransactionModal } from './components/TransactionModal';
import { ItemModal } from './components/ItemModal';
import { MonthModal } from './components/MonthModal';
import { BranchModal } from './components/BranchModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Main persistent state
  const [data, setData] = useState<AppStateData>(() => loadAppState());

  // Current active user
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return data.users[0]?.id || 'user_admin';
  });

  // Current active navigation tab
  const [activeTab, setActiveTab] = useState<NavTabKey>('overview');

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedMonth: 'all',
    selectedBranch: 'all',
    selectedCategory: 'all',
    selectedType: 'all',
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'warning' | 'error', text: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to LocalStorage
  useEffect(() => {
    saveAppState(data);
  }, [data]);

  // Current user object
  const currentUser = useMemo(() => {
    return data.users.find((u) => u.id === currentUserId) || data.users[0];
  }, [data.users, currentUserId]);

  const canManageSystem = currentUser.role === 'admin';

  // Core calculations for KPIs
  const { ledger } = useMemo(() => calculateAllStockLedger(data), [data]);
  const overview = useMemo(
    () => getFilteredInventoryOverview(data, filters.selectedMonth, filters.selectedBranch, filters.searchQuery, filters.selectedCategory),
    [data, filters]
  );

  // Modal States
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>('import');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [sheetsModalOpen, setSheetsModalOpen] = useState(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);

  // Excel Import Modal State
  const [importExcelModalOpen, setImportExcelModalOpen] = useState(false);

  // Delete Confirmation Modal State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState<(() => void) | null>(null);
  const [deleteDescription, setDeleteDescription] = useState('');

  // --------------------------------------------------------------------------
  // HANDLERS: TRANSACTIONS (NHẬP / XUẤT)
  // --------------------------------------------------------------------------
  const handleOpenCreateTx = (type: TransactionType) => {
    setEditingTransaction(null);
    setTxModalType(type);
    setTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTxModalType(tx.type);
    setTxModalOpen(true);
  };

  const handleSaveTransaction = (txData: Partial<Transaction>) => {
    setData((prev) => {
      const existingIdx = prev.transactions.findIndex((t) => t.id === txData.id);
      let updatedList: Transaction[];

      if (existingIdx >= 0) {
        updatedList = [...prev.transactions];
        updatedList[existingIdx] = { ...updatedList[existingIdx], ...(txData as Transaction) };
      } else {
        updatedList = [txData as Transaction, ...prev.transactions];
      }

      return {
        ...prev,
        transactions: updatedList,
      };
    });

    if (txData.type === 'import') {
      addToast('success', '✓ Đã thêm giao dịch nhập kho thành công');
    } else {
      addToast('success', '✓ Đã thêm giao dịch xuất kho thành công');
    }
  };

  const handleRequestDeleteTx = (tx: Transaction) => {
    setDeleteDescription(
      `Giao dịch ${tx.type === 'import' ? 'Nhập' : 'Xuất'} - Mã VT: ${tx.itemCode} (${tx.itemName}) - SL: ${formatQty(
        tx.quantity
      )} - Ngày: ${tx.date}`
    );
    setDeleteAction(() => () => {
      setData((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== tx.id),
      }));
      addToast('success', '✓ Đã xóa giao dịch thành công');
    });
    setDeleteConfirmOpen(true);
  };

  // --------------------------------------------------------------------------
  // HANDLERS: VẬT TƯ (ITEMS)
  // --------------------------------------------------------------------------
  const handleOpenAddItem = () => {
    setEditingItem(null);
    setItemModalOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleSaveItem = (itemData: Partial<Item>) => {
    setData((prev) => {
      const existingIdx = prev.items.findIndex((i) => i.id === itemData.id);
      let updatedItems: Item[];

      if (existingIdx >= 0) {
        updatedItems = [...prev.items];
        updatedItems[existingIdx] = { ...updatedItems[existingIdx], ...(itemData as Item) };
      } else {
        updatedItems = [...prev.items, itemData as Item];
      }

      // Add category if new
      let updatedCategories = prev.categories;
      if (itemData.category && !updatedCategories.includes(itemData.category)) {
        updatedCategories = [...updatedCategories, itemData.category];
      }

      return {
        ...prev,
        items: updatedItems,
        categories: updatedCategories,
      };
    });

    addToast('success', '✓ Đã lưu thông tin vật tư thành công');
  };

  const handleRequestDeleteItem = (item: Item) => {
    setDeleteDescription(`Vật tư [${item.code}] - ${item.name} (${item.unit})`);
    setDeleteAction(() => () => {
      setData((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== item.id),
      }));
      addToast('success', '✓ Đã xóa vật tư khỏi danh mục');
    });
    setDeleteConfirmOpen(true);
  };

  // --------------------------------------------------------------------------
  // HANDLERS: CHI NHÁNH & THÁNG
  // --------------------------------------------------------------------------
  const handleSaveBranch = (branchData: Partial<Branch>) => {
    setData((prev) => {
      const existingIdx = prev.branches.findIndex((b) => b.id === branchData.id);
      let updatedBranches: Branch[];

      if (existingIdx >= 0) {
        updatedBranches = [...prev.branches];
        updatedBranches[existingIdx] = { ...updatedBranches[existingIdx], ...(branchData as Branch) };
      } else {
        updatedBranches = [...prev.branches, branchData as Branch];
      }

      return {
        ...prev,
        branches: updatedBranches,
      };
    });

    addToast('success', '✓ Đã lưu chi nhánh thành công');
  };

  const handleRequestDeleteBranch = (branch: Branch) => {
    setDeleteDescription(`Chi nhánh: ${branch.name} (${branch.code})`);
    setDeleteAction(() => () => {
      setData((prev) => ({
        ...prev,
        branches: prev.branches.filter((b) => b.id !== branch.id),
      }));
      addToast('success', '✓ Đã xóa chi nhánh thành công');
    });
    setDeleteConfirmOpen(true);
  };

  const handleAddMonth = (newMonth: string) => {
    setData((prev) => {
      if (prev.months.includes(newMonth)) return prev;
      const sorted = sortMonths([...prev.months, newMonth]);
      return {
        ...prev,
        months: sorted,
      };
    });
    // Auto-select the newly added month
    setFilters((prev) => ({ ...prev, selectedMonth: newMonth }));
    addToast('success', `✓ Đã mở thành công kỳ ${newMonth}. Tồn kho đã được tự động kết chuyển!`);
  };

  const handleAddCategory = (categoryName: string) => {
    setData((prev) => ({
      ...prev,
      categories: [...prev.categories, categoryName],
    }));
    addToast('success', `✓ Đã thêm nhóm hàng: ${categoryName}`);
  };

  // --------------------------------------------------------------------------
  // GOOGLE SHEETS SYNC
  // --------------------------------------------------------------------------
  const handleUpdateSheetsUrl = (url: string) => {
    setData((prev) => ({
      ...prev,
      googleSheets: {
        ...prev.googleSheets,
        webAppUrl: url,
      },
    }));
    addToast('success', '✓ Đã lưu cấu hình URL Google Apps Script');
  };

  const handleTestSheetsConnection = async () => {
    if (!data.googleSheets.webAppUrl) {
      addToast('warning', 'Vui lòng nhập URL Google Apps Script trước.');
      return;
    }
    setIsSyncingSheets(true);
    const res = await testGoogleSheetsConnection(data.googleSheets.webAppUrl);
    setIsSyncingSheets(false);

    if (res.success) {
      setData((prev) => ({
        ...prev,
        googleSheets: {
          ...prev.googleSheets,
          isConnected: true,
          spreadsheetUrl: res.spreadsheetUrl || prev.googleSheets.spreadsheetUrl,
        },
      }));
      addToast('success', '🟢 Kết nối Google Sheets thành công!');
    } else {
      setData((prev) => ({
        ...prev,
        googleSheets: { ...prev.googleSheets, isConnected: false },
      }));
      addToast('error', `🔴 Kết nối thất bại: ${res.message}`);
    }
  };

  const handlePushDataToSheets = async () => {
    if (!data.googleSheets.webAppUrl) {
      addToast('warning', 'Chưa cấu hình URL Google Sheets.');
      return;
    }
    setIsSyncingSheets(true);
    const res = await pushDataToGoogleSheets(data.googleSheets.webAppUrl, data);
    setIsSyncingSheets(false);

    if (res.success) {
      setData((prev) => ({
        ...prev,
        googleSheets: {
          ...prev.googleSheets,
          isConnected: true,
          lastSyncedAt: new Date().toISOString(),
          spreadsheetUrl: res.spreadsheetUrl || prev.googleSheets.spreadsheetUrl,
        },
      }));
      addToast('success', '🟢 Đồng bộ dữ liệu lên Google Sheets thành công!');
    } else {
      addToast('error', `🔴 Lỗi đồng bộ: ${res.message}`);
    }
  };

  // --------------------------------------------------------------------------
  // EXPORT EXCEL / CSV
  // --------------------------------------------------------------------------
  const handleExportExcel = () => {
    try {
      exportToExcel(data, filters.selectedMonth, filters.selectedBranch, filters.searchQuery, true);
      addToast('success', '✓ Đã xuất file Excel (.xlsx) 6 sheet thành công!');
    } catch (err: any) {
      addToast('error', 'Lỗi xuất Excel: ' + err.message);
    }
  };

  const handleExportCSV = () => {
    try {
      exportToCSV(data, filters.selectedMonth, filters.selectedBranch, filters.searchQuery);
      addToast('success', '✓ Đã xuất tệp CSV thành công!');
    } catch (err: any) {
      addToast('error', 'Lỗi xuất CSV: ' + err.message);
    }
  };

  // --------------------------------------------------------------------------
  // IMPORT EXCEL (.XLSX / .XLS)
  // --------------------------------------------------------------------------
  const handleImportExcelSuccess = (updatedState: AppStateData, summaryText: string) => {
    setData(updatedState);
    addToast('success', summaryText);
  };

  // --------------------------------------------------------------------------
  // BACKUP & RESTORE
  // --------------------------------------------------------------------------
  const handleExportJsonBackup = () => {
    exportStateAsJsonFile(data);
    addToast('success', '✓ Đã tải file sao lưu JSON về máy!');
  };

  const handleImportJsonBackup = (jsonStr: string) => {
    const imported = importStateFromJson(jsonStr);
    if (imported) {
      setData(imported);
      addToast('success', '✓ Đã khôi phục dữ liệu từ file JSON thành công!');
    } else {
      addToast('error', 'Tệp sao lưu không đúng định dạng!');
    }
  };

  const handleResetToDefault = () => {
    setDeleteDescription('Toàn bộ dữ liệu hiện tại sẽ được đặt lại về dữ liệu ban đầu của Team CIC (T06 - T08/2026).');
    setDeleteAction(() => () => {
      const resetState = resetToDefaultData();
      setData(resetState);
      addToast('success', '✓ Đã khôi phục dữ liệu mẫu CIC!');
    });
    setDeleteConfirmOpen(true);
  };

  // Count active imports & exports for nav badges
  const importCount = useMemo(
    () => data.transactions.filter((t) => t.type === 'import').length,
    [data.transactions]
  );
  const exportCount = useMemo(
    () => data.transactions.filter((t) => t.type === 'export').length,
    [data.transactions]
  );

  const selectedBranchObj = data.branches.find((b) => b.id === filters.selectedBranch);

  return (
    <div className="min-h-screen flex flex-col bg-[#011627] text-slate-100 font-sans antialiased selection:bg-[#FFC107] selection:text-slate-950">
      
      {/* 1. HEADER (Gradient xanh dương đậm -> nhạt, branding CIC, Hotline 0901601600, User role) */}
      <Header
        data={data}
        currentUser={currentUser}
        onSwitchUser={(id) => {
          setCurrentUserId(id);
          addToast('success', `Đã chuyển sang tài khoản: ${data.users.find((u) => u.id === id)?.name}`);
        }}
        onOpenSheetsModal={() => setSheetsModalOpen(true)}
        onOpenQuickSync={handlePushDataToSheets}
        isSyncingSheets={isSyncingSheets}
      />

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Navigation Tabs (Menu) */}
        <NavigationTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          importCount={importCount}
          exportCount={exportCount}
        />

        {/* 5 KPI CARDS (Pastel, High Contrast, Real-time update) */}
        <KpiCards
          totalImports={overview.totals.imports}
          totalExports={overview.totals.exports}
          totalStock={overview.totals.closing}
          branchCount={data.branches.length}
          itemCount={data.items.length}
          selectedMonth={filters.selectedMonth}
          selectedBranchName={selectedBranchObj?.name}
        />

        {/* SEARCH & FILTER BAR + QUICK ACTION BUTTONS */}
        <FilterBar
          filters={filters}
          onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
          months={data.months}
          branches={data.branches}
          categories={data.categories}
          onOpenImportModal={() => handleOpenCreateTx('import')}
          onOpenExportModal={() => handleOpenCreateTx('export')}
          onOpenAddItemModal={handleOpenAddItem}
          onOpenAddMonthModal={() => setMonthModalOpen(true)}
          onOpenImportExcelModal={() => setImportExcelModalOpen(true)}
          onExportExcel={handleExportExcel}
          onExportCSV={handleExportCSV}
          canManageSystem={canManageSystem}
        />

        {/* TAB CONTENTS */}
        {(activeTab === 'overview' || activeTab === 'analytics') && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <OverviewTable
              data={data}
              filters={filters}
              onSelectItemForDetail={(itemCode) => {
                setFilters((prev) => ({ ...prev, searchQuery: itemCode }));
                setActiveTab('inventory');
              }}
            />
            {/* Integrated visual analytics & regional market share */}
            <AnalyticsCharts data={data} filters={filters} />
          </div>
        )}

        {activeTab === 'inventory' && (
          <DetailedInventoryView
            data={data}
            filters={filters}
            onQuickImport={(item) => {
              setEditingTransaction(null);
              setTxModalType('import');
              setTxModalOpen(true);
            }}
            onQuickExport={(item) => {
              setEditingTransaction(null);
              setTxModalType('export');
              setTxModalOpen(true);
            }}
          />
        )}

        {activeTab === 'imports' && (
          <TransactionList
            type="import"
            data={data}
            filters={filters}
            onOpenCreateModal={() => handleOpenCreateTx('import')}
            onEditTransaction={handleEditTx}
            onRequestDeleteTransaction={handleRequestDeleteTx}
            canEdit={true}
          />
        )}

        {activeTab === 'exports' && (
          <TransactionList
            type="export"
            data={data}
            filters={filters}
            onOpenCreateModal={() => handleOpenCreateTx('export')}
            onEditTransaction={handleEditTx}
            onRequestDeleteTransaction={handleRequestDeleteTx}
            canEdit={true}
          />
        )}

        {activeTab === 'reports' && (
          <MonthlyReport data={data} />
        )}

        {activeTab === 'catalog' && (
          <CatalogManager
            data={data}
            onOpenAddItemModal={handleOpenAddItem}
            onEditItem={handleEditItem}
            onRequestDeleteItem={handleRequestDeleteItem}
            onOpenAddBranchModal={() => {
              setEditingBranch(null);
              setBranchModalOpen(true);
            }}
            onEditBranch={(branch) => {
              setEditingBranch(branch);
              setBranchModalOpen(true);
            }}
            onRequestDeleteBranch={handleRequestDeleteBranch}
            onAddCategory={handleAddCategory}
            canManage={canManageSystem}
          />
        )}

        {activeTab === 'settings' && (
          <AccountAndSettings
            data={data}
            currentUser={currentUser}
            onUpdateGoogleSheetsConfig={handleUpdateSheetsUrl}
            onTestConnection={handleTestSheetsConnection}
            onSyncPush={handlePushDataToSheets}
            isSyncing={isSyncingSheets}
            onAddUser={(newUser) => {
              setData((prev) => ({
                ...prev,
                users: [
                  ...prev.users,
                  {
                    ...newUser,
                    id: `u_${Date.now()}`,
                    lastLogin: new Date().toISOString(),
                  },
                ],
              }));
              addToast('success', `✓ Đã tạo người dùng mới: ${newUser.name}`);
            }}
            onExportJsonBackup={handleExportJsonBackup}
            onImportJsonBackup={handleImportJsonBackup}
            onResetToDefault={handleResetToDefault}
            canManageSystem={canManageSystem}
          />
        )}

      </main>

      {/* 3. FOOTER */}
      <footer className="w-full bg-[#00101e] text-slate-400 text-xs border-t border-slate-800/80 py-6 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="font-semibold text-white">HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC</span>
            <span className="text-slate-600">|</span>
            <span>Version: Made by Ha Nhung Logistic</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span>
              Hotline hỗ trợ kỹ thuật: <strong className="text-amber-400 font-mono">0901601600</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>Trạng thái: Hoạt động trực tiếp trên trình duyệt</span>
          </div>
        </div>
      </footer>

      {/* -------------------------------------------------------------------- */}
      {/* MODALS & FEEDBACK */}
      {/* -------------------------------------------------------------------- */}
      
      {/* Transaction Modal (Nhập / Xuất) */}
      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        type={txModalType}
        data={data}
        initialTransaction={editingTransaction}
        onSave={handleSaveTransaction}
        currentUser={currentUser.name}
        defaultMonth={filters.selectedMonth}
        defaultBranchId={filters.selectedBranch}
      />

      {/* Item Modal (+ THÊM VẬT TƯ) */}
      <ItemModal
        isOpen={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        initialItem={editingItem}
        categories={data.categories}
        existingCodes={data.items.map((i) => i.code)}
        onSave={handleSaveItem}
      />

      {/* Month Modal (+ THÊM THÁNG MỚI with auto rollover) */}
      <MonthModal
        isOpen={monthModalOpen}
        onClose={() => setMonthModalOpen(false)}
        data={data}
        onAddMonth={handleAddMonth}
      />

      {/* Branch Modal (+ THÊM CHI NHÁNH MỚI) */}
      <BranchModal
        isOpen={branchModalOpen}
        onClose={() => setBranchModalOpen(false)}
        initialBranch={editingBranch}
        onSave={handleSaveBranch}
        existingCodes={data.branches.map((b) => b.code)}
      />

      {/* Delete Confirmation Modal (HỦY | XÓA) */}
      <DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setDeleteAction(null);
        }}
        onConfirm={() => {
          if (deleteAction) deleteAction();
        }}
        itemDescription={deleteDescription}
      />

      {/* Google Sheets Setup Modal */}
      <GoogleSheetsModal
        isOpen={sheetsModalOpen}
        onClose={() => setSheetsModalOpen(false)}
        data={data}
        onSaveUrl={handleUpdateSheetsUrl}
        onTest={handleTestSheetsConnection}
        onSync={handlePushDataToSheets}
        isSyncing={isSyncingSheets}
      />

      {/* Excel Import Modal (.XLSX / .XLS) */}
      <ExcelImportModal
        isOpen={importExcelModalOpen}
        onClose={() => setImportExcelModalOpen(false)}
        data={data}
        targetMonth={filters.selectedMonth}
        currentUser={currentUser.name}
        onSuccess={handleImportExcelSuccess}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
