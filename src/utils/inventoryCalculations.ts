import { AppStateData, BranchCalculationRow, InventoryCalculationRow, Transaction } from '../types/inventory';

// Parse month string like "T06/2026" into year and month number
export function parseMonthString(monthStr: string): { year: number; month: number } {
  const match = monthStr.match(/T?(\d{1,2})\/(\d{4})/i);
  if (!match) {
    return { year: 2026, month: 1 };
  }
  return {
    month: parseInt(match[1], 10),
    year: parseInt(match[2], 10),
  };
}

// Format month into standard "T07/2026"
export function formatMonthString(month: number, year: number): string {
  const m = month.toString().padStart(2, '0');
  return `T${m}/${year}`;
}

// Sort months chronologically
export function sortMonths(months: string[]): string[] {
  return [...months].sort((a, b) => {
    const pA = parseMonthString(a);
    const pB = parseMonthString(b);
    if (pA.year !== pB.year) {
      return pA.year - pB.year;
    }
    return pA.month - pB.month;
  });
}

// Get the next month after a given month
export function getNextMonth(monthStr: string): string {
  const { month, year } = parseMonthString(monthStr);
  if (month === 12) {
    return formatMonthString(1, year + 1);
  }
  return formatMonthString(month + 1, year);
}

// Map for quick branch & item lookup
export interface StockDetail {
  opening: number;
  imports: number;
  exports: number;
  closing: number;
}

/**
 * Calculates stock balance for every (month, branchId, itemCode)
 * Respects chronological rollover:
 * Month 1: opening comes from initial opening stocks (or 0)
 * Month 2: opening = closing of Month 1
 * Month N: opening = closing of Month N-1
 * Closing = Opening + Imports - Exports
 */
export function calculateAllStockLedger(data: AppStateData): {
  // map: month -> branchId -> itemCode -> StockDetail
  ledger: Record<string, Record<string, Record<string, StockDetail>>>;
} {
  const sortedMonths = sortMonths(data.months);
  const ledger: Record<string, Record<string, Record<string, StockDetail>>> = {};

  // Build lookup of transactions: month -> branchId -> itemCode -> { imports, exports }
  const txLookup: Record<string, Record<string, Record<string, { imports: number; exports: number }>>> = {};

  data.transactions.forEach((tx) => {
    if (!txLookup[tx.month]) txLookup[tx.month] = {};
    if (!txLookup[tx.month][tx.branchId]) txLookup[tx.month][tx.branchId] = {};
    if (!txLookup[tx.month][tx.branchId][tx.itemCode]) {
      txLookup[tx.month][tx.branchId][tx.itemCode] = { imports: 0, exports: 0 };
    }
    if (tx.type === 'import') {
      txLookup[tx.month][tx.branchId][tx.itemCode].imports += Number(tx.quantity) || 0;
    } else if (tx.type === 'export') {
      txLookup[tx.month][tx.branchId][tx.itemCode].exports += Number(tx.quantity) || 0;
    }
  });

  // Base opening lookup for initial month
  const baseOpeningMap: Record<string, Record<string, number>> = {};
  data.openingStocks.forEach((os) => {
    if (!baseOpeningMap[os.branchId]) baseOpeningMap[os.branchId] = {};
    baseOpeningMap[os.branchId][os.itemCode] = Number(os.quantity) || 0;
  });

  // Iterate chronologically through months
  for (let i = 0; i < sortedMonths.length; i++) {
    const currentMonth = sortedMonths[i];
    const prevMonth = i > 0 ? sortedMonths[i - 1] : null;

    ledger[currentMonth] = {};

    data.branches.forEach((branch) => {
      ledger[currentMonth][branch.id] = {};

      data.items.forEach((item) => {
        let opening = 0;
        if (!prevMonth) {
          // Initial baseline month
          opening = baseOpeningMap[branch.id]?.[item.code] || 0;
        } else {
          // Previous month closing becomes this month opening
          const prevClosing = ledger[prevMonth]?.[branch.id]?.[item.code]?.closing;
          opening = prevClosing !== undefined ? prevClosing : (baseOpeningMap[branch.id]?.[item.code] || 0);
        }

        const txData = txLookup[currentMonth]?.[branch.id]?.[item.code] || { imports: 0, exports: 0 };
        const closing = opening + txData.imports - txData.exports;

        ledger[currentMonth][branch.id][item.code] = {
          opening,
          imports: txData.imports,
          exports: txData.exports,
          closing,
        };
      });
    });
  }

  return { ledger };
}

/**
 * Get available stock for an item at a branch in a given month.
 * Used when validating export transactions.
 */
export function getAvailableStockForExport(
  data: AppStateData,
  month: string,
  branchId: string,
  itemCode: string,
  excludeTransactionId?: string
): number {
  const { ledger } = calculateAllStockLedger(data);

  // If month is in ledger
  const cell = ledger[month]?.[branchId]?.[itemCode];
  if (!cell) return 0;

  // Opening + Imports
  let available = cell.opening + cell.imports;

  // Subtract all other exports in this month except the excluded one
  const exportsInMonth = data.transactions.filter(
    (tx) =>
      tx.type === 'export' &&
      tx.month === month &&
      tx.branchId === branchId &&
      tx.itemCode === itemCode &&
      tx.id !== excludeTransactionId
  );

  const totalOtherExports = exportsInMonth.reduce((sum, tx) => sum + (Number(tx.quantity) || 0), 0);
  available -= totalOtherExports;

  return Math.max(0, available);
}

/**
 * Generate aggregated table data for Inventory Overview based on active filters
 */
export function getFilteredInventoryOverview(
  data: AppStateData,
  filterMonth: string, // "all" or specific month
  filterBranch: string, // "all" or branchId
  searchQuery: string = '',
  categoryFilter: string = 'all'
): {
  rows: InventoryCalculationRow[];
  totals: {
    opening: number;
    imports: number;
    exports: number;
    closing: number;
  };
} {
  const { ledger } = calculateAllStockLedger(data);
  const sortedMonths = sortMonths(data.months);
  const targetMonths = filterMonth === 'all' ? sortedMonths : [filterMonth];
  const targetBranches = filterBranch === 'all' ? data.branches : data.branches.filter((b) => b.id === filterBranch);

  const query = searchQuery.trim().toLowerCase();
  const filteredItems = data.items.filter((item) => {
    if (categoryFilter && categoryFilter !== 'all' && item.category !== categoryFilter) {
      return false;
    }
    if (!query) return true;
    return item.code.toLowerCase().includes(query) || item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
  });

  const rows: InventoryCalculationRow[] = [];
  let grandOpening = 0;
  let grandImports = 0;
  let grandExports = 0;
  let grandClosing = 0;

  filteredItems.forEach((item) => {
    let itemOpening = 0;
    let itemImports = 0;
    let itemExports = 0;
    let itemClosing = 0;

    const branchBreakdown: Record<string, { opening: number; imports: number; exports: number; closing: number }> = {};

    targetBranches.forEach((branch) => {
      let bOpening = 0;
      let bImports = 0;
      let bExports = 0;
      let bClosing = 0;

      if (filterMonth === 'all') {
        // Across all months:
        // Opening = Opening of the first month
        // Imports = sum of all imports in all months
        // Exports = sum of all exports in all months
        // Closing = Closing of the last month
        const firstMonth = targetMonths[0];
        const lastMonth = targetMonths[targetMonths.length - 1];

        bOpening = ledger[firstMonth]?.[branch.id]?.[item.code]?.opening || 0;
        bClosing = ledger[lastMonth]?.[branch.id]?.[item.code]?.closing || 0;

        targetMonths.forEach((m) => {
          const cell = ledger[m]?.[branch.id]?.[item.code];
          if (cell) {
            bImports += cell.imports;
            bExports += cell.exports;
          }
        });
      } else {
        const cell = ledger[filterMonth]?.[branch.id]?.[item.code] || { opening: 0, imports: 0, exports: 0, closing: 0 };
        bOpening = cell.opening;
        bImports = cell.imports;
        bExports = cell.exports;
        bClosing = cell.closing;
      }

      branchBreakdown[branch.id] = {
        opening: bOpening,
        imports: bImports,
        exports: bExports,
        closing: bClosing,
      };

      itemOpening += bOpening;
      itemImports += bImports;
      itemExports += bExports;
      itemClosing += bClosing;
    });

    rows.push({
      itemCode: item.code,
      itemName: item.name,
      unit: item.unit,
      category: item.category,
      openingStock: itemOpening,
      imports: itemImports,
      exports: itemExports,
      closingStock: itemClosing,
      branchBreakdown,
    });

    grandOpening += itemOpening;
    grandImports += itemImports;
    grandExports += itemExports;
    grandClosing += itemClosing;
  });

  return {
    rows,
    totals: {
      opening: grandOpening,
      imports: grandImports,
      exports: grandExports,
      closing: grandClosing,
    },
  };
}

/**
 * Generate Branch Summary table:
 * | Chi nhánh | Tồn đầu | Nhập | Xuất | Tồn cuối |
 */
export function getBranchSummary(
  data: AppStateData,
  filterMonth: string,
  searchQuery: string = ''
): {
  rows: BranchCalculationRow[];
  total: {
    openingStock: number;
    imports: number;
    exports: number;
    closingStock: number;
  };
} {
  const { ledger } = calculateAllStockLedger(data);
  const sortedMonths = sortMonths(data.months);
  const targetMonths = filterMonth === 'all' ? sortedMonths : [filterMonth];

  const query = searchQuery.trim().toLowerCase();
  const eligibleItems = data.items.filter((item) => {
    if (!query) return true;
    return item.code.toLowerCase().includes(query) || item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query);
  });

  const eligibleItemCodes = new Set(eligibleItems.map((i) => i.code));

  const rows: BranchCalculationRow[] = [];
  let sumOpening = 0;
  let sumImports = 0;
  let sumExports = 0;
  let sumClosing = 0;

  data.branches.forEach((branch) => {
    let bOpening = 0;
    let bImports = 0;
    let bExports = 0;
    let bClosing = 0;

    if (filterMonth === 'all') {
      const firstMonth = targetMonths[0];
      const lastMonth = targetMonths[targetMonths.length - 1];

      eligibleItems.forEach((item) => {
        bOpening += ledger[firstMonth]?.[branch.id]?.[item.code]?.opening || 0;
        bClosing += ledger[lastMonth]?.[branch.id]?.[item.code]?.closing || 0;
      });

      targetMonths.forEach((m) => {
        eligibleItems.forEach((item) => {
          const cell = ledger[m]?.[branch.id]?.[item.code];
          if (cell) {
            bImports += cell.imports;
            bExports += cell.exports;
          }
        });
      });
    } else {
      eligibleItems.forEach((item) => {
        const cell = ledger[filterMonth]?.[branch.id]?.[item.code];
        if (cell) {
          bOpening += cell.opening;
          bImports += cell.imports;
          bExports += cell.exports;
          bClosing += cell.closing;
        }
      });
    }

    rows.push({
      branchId: branch.id,
      branchName: branch.name,
      branchCode: branch.code,
      openingStock: bOpening,
      imports: bImports,
      exports: bExports,
      closingStock: bClosing,
    });

    sumOpening += bOpening;
    sumImports += bImports;
    sumExports += bExports;
    sumClosing += bClosing;
  });

  return {
    rows,
    total: {
      openingStock: sumOpening,
      imports: sumImports,
      exports: sumExports,
      closingStock: sumClosing,
    },
  };
}

/**
 * Generate monthly matrix report data:
 * Items vs Branches for a selected Month and Mode ('import' | 'export' | 'stock')
 */
export function getMonthlyMatrixReport(
  data: AppStateData,
  month: string,
  metric: 'imports' | 'exports' | 'closing' | 'opening'
): {
  items: { code: string; name: string; unit: string }[];
  branches: { id: string; name: string; code: string }[];
  matrix: Record<string, Record<string, number>>; // itemCode -> branchId -> value
  branchTotals: Record<string, number>; // branchId -> sum
  itemTotals: Record<string, number>; // itemCode -> sum
  grandTotal: number;
} {
  const { ledger } = calculateAllStockLedger(data);
  const matrix: Record<string, Record<string, number>> = {};
  const branchTotals: Record<string, number> = {};
  const itemTotals: Record<string, number> = {};
  let grandTotal = 0;

  data.branches.forEach((b) => {
    branchTotals[b.id] = 0;
  });

  data.items.forEach((item) => {
    matrix[item.code] = {};
    itemTotals[item.code] = 0;

    data.branches.forEach((b) => {
      const cell = ledger[month]?.[b.id]?.[item.code];
      const val = cell ? cell[metric] : 0;

      matrix[item.code][b.id] = val;
      itemTotals[item.code] += val;
      branchTotals[b.id] += val;
      grandTotal += val;
    });
  });

  return {
    items: data.items.map((i) => ({ code: i.code, name: i.name, unit: i.unit })),
    branches: data.branches.map((b) => ({ id: b.id, name: b.name, code: b.code })),
    matrix,
    branchTotals,
    itemTotals,
    grandTotal,
  };
}

/**
 * Format numbers with Vietnamese locale (1.000.000)
 */
export function formatQty(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('vi-VN').format(value);
}
