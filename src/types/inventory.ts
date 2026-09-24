export type TransactionType = 'import' | 'export';

export interface Item {
  id: string;
  code: string;
  name: string;
  unit: string;
  category: string;
  status: 'active' | 'inactive';
  minStock?: number;
  note?: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  address?: string;
  manager?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  month: string; // e.g. "T06/2026", "T07/2026"
  date: string; // "YYYY-MM-DD"
  branchId: string;
  branchName: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  note?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

// Initial opening stocks per branch and item (for baseline / month 0)
export interface ItemOpeningStock {
  month: string;
  branchId: string;
  itemCode: string;
  quantity: number;
}

export interface InventoryCalculationRow {
  itemCode: string;
  itemName: string;
  unit: string;
  category: string;
  openingStock: number;
  imports: number;
  exports: number;
  closingStock: number;
  branchBreakdown?: Record<string, {
    opening: number;
    imports: number;
    exports: number;
    closing: number;
  }>;
}

export interface BranchCalculationRow {
  branchId: string;
  branchName: string;
  branchCode: string;
  openingStock: number;
  imports: number;
  exports: number;
  closingStock: number;
}

export type UserRole = 'admin' | 'staff';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId?: string; // If restricted to specific branch, or all
  lastLogin?: string;
}

export interface GoogleSheetsConfig {
  webAppUrl: string;
  spreadsheetUrl?: string;
  isConnected: boolean;
  lastSyncedAt?: string;
  autoSync: boolean;
}

export interface AppStateData {
  items: Item[];
  branches: Branch[];
  months: string[]; // e.g. ["T06/2026", "T07/2026", "T08/2026"]
  categories: string[];
  transactions: Transaction[];
  openingStocks: ItemOpeningStock[];
  users: UserAccount[];
  googleSheets: GoogleSheetsConfig;
  activeUserId: string;
}

export interface FilterState {
  searchQuery: string;
  selectedMonth: string; // "all" or "T07/2026"
  selectedBranch: string; // "all" or branchId
  selectedCategory?: string; // "all" or category
  selectedType: 'all' | 'import' | 'export' | 'stock';
}
