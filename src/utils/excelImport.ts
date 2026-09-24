import * as XLSX from 'xlsx';
import { AppStateData, Branch, Item, Transaction, ItemOpeningStock } from '../types/inventory';
import { parseMonthString, formatMonthString } from './inventoryCalculations';

export interface ParsedBranchEntry {
  branchId: string;
  branchName: string;
  imports?: number;
  exports?: number;
  stock?: number;
}

export interface ParsedItemRow {
  rowNumber: number;
  itemCode: string;
  itemName: string;
  unit: string;
  category: string;
  month: string;
  // Transactions or branch data
  importQty: number;
  exportQty: number;
  openingQty?: number;
  closingQty?: number;
  // Breakdown by branch
  branches: Record<string, { imports: number; exports: number; stock: number }>;
  isNewItem: boolean;
  status: 'valid' | 'warning' | 'invalid';
  note?: string;
}

export interface ExcelParseResult {
  sheetNames: string[];
  selectedSheet: string;
  detectedFormat: 'matrix' | 'transactions_import' | 'transactions_export' | 'overview' | 'custom';
  headerRowIndex: number;
  headers: string[];
  rows: ParsedItemRow[];
  totalValidRows: number;
  newItemsCount: number;
  existingItemsCount: number;
  totalImportQty: number;
  totalExportQty: number;
}

/**
 * Normalizes text for matching headers (lowercase, removes Vietnamese accents & spaces)
 */
function normalizeHeader(str: string): string {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Matches a branch by name or code
 */
export function matchBranch(
  colName: string,
  branches: Branch[]
): Branch | null {
  const norm = normalizeHeader(colName);
  for (const b of branches) {
    const bCodeNorm = normalizeHeader(b.code);
    const bNameNorm = normalizeHeader(b.name);
    if (
      norm.includes(bCodeNorm) ||
      norm.includes(bNameNorm) ||
      bNameNorm.includes(norm)
    ) {
      return b;
    }
  }
  // Common aliases
  if (norm.includes('hanoi') || norm.includes('hn') || norm.includes('r1')) {
    return branches.find((b) => b.code === 'R1' || normalizeHeader(b.name).includes('hanoi')) || null;
  }
  if (norm.includes('danang') || norm.includes('dn') || norm.includes('r2')) {
    return branches.find((b) => b.code === 'R2' || normalizeHeader(b.name).includes('danang')) || null;
  }
  if (norm.includes('hcm') || norm.includes('hochiminh') || norm.includes('saigon') || norm.includes('r3')) {
    return branches.find((b) => b.code === 'R3' || normalizeHeader(b.name).includes('hcm')) || null;
  }
  if (norm.includes('cantho') || norm.includes('ct') || norm.includes('r4')) {
    return branches.find((b) => b.code === 'R4' || normalizeHeader(b.name).includes('cantho')) || null;
  }
  return null;
}

/**
 * Detects header row index from raw 2D array
 */
function findHeaderRow(rawRows: any[][]): number {
  for (let r = 0; r < Math.min(rawRows.length, 12); r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;
    const rowText = row.map((cell) => normalizeHeader(String(cell || ''))).join(' ');
    if (
      (rowText.includes('mavt') || rowText.includes('mavattu') || rowText.includes('code') || rowText.includes('vattu')) &&
      (rowText.includes('ten') || rowText.includes('dvt') || rowText.includes('donvi') || rowText.includes('ton') || rowText.includes('nhap') || rowText.includes('xuat'))
    ) {
      return r;
    }
    // Also check for STT + Ma
    if (rowText.includes('stt') && (rowText.includes('ma') || rowText.includes('ten'))) {
      return r;
    }
  }
  return 0;
}

/**
 * Parses an Excel file and returns all sheets + auto-parsed rows for the selected sheet
 */
export async function parseExcelWorkbook(
  file: File,
  targetMonth: string,
  branches: Branch[],
  existingItems: Item[],
  sheetNameChoice?: string
): Promise<{
  sheetNames: string[];
  workbook: XLSX.WorkBook;
  parseResult: ExcelParseResult;
}> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;

  if (sheetNames.length === 0) {
    throw new Error('Tệp Excel không có trang tính (sheet) nào!');
  }

  // Choose sheet: preference to 'Tổng quan' or 'Tồn kho' or 'Nhập kho' or sheetNameChoice or first sheet
  let selectedSheet = sheetNames[0];
  if (sheetNameChoice && sheetNames.includes(sheetNameChoice)) {
    selectedSheet = sheetNameChoice;
  } else {
    const preferred = sheetNames.find((s) => {
      const n = normalizeHeader(s);
      return n.includes('tongquan') || n.includes('tonkho') || n.includes('nhapkho') || n.includes('xuatkho') || n.includes('data');
    });
    if (preferred) selectedSheet = preferred;
  }

  const sheet = workbook.Sheets[selectedSheet];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (!rawRows || rawRows.length === 0) {
    throw new Error(`Trang tính "${selectedSheet}" không có dữ liệu!`);
  }

  const headerRowIndex = findHeaderRow(rawRows);
  const headerRow = (rawRows[headerRowIndex] || []).map((h) => String(h || '').trim());

  // Determine column mapping
  let codeIdx = -1;
  let nameIdx = -1;
  let unitIdx = -1;
  let catIdx = -1;
  let monthIdx = -1;
  let singleBranchIdx = -1;
  let importQtyIdx = -1;
  let exportQtyIdx = -1;
  let openingQtyIdx = -1;
  let closingQtyIdx = -1;
  let noteIdx = -1;

  // Branch-specific columns: branchId -> { importColIdx?, exportColIdx?, stockColIdx? }
  const branchColMap: Record<
    string,
    { importCol?: number; exportCol?: number; stockCol?: number; branch: Branch }
  > = {};

  branches.forEach((b) => {
    branchColMap[b.id] = { branch: b };
  });

  headerRow.forEach((colName, idx) => {
    const norm = normalizeHeader(colName);
    if (!norm) return;

    if (codeIdx === -1 && (norm === 'mavt' || norm === 'mavattu' || norm === 'code' || norm === 'itemcode' || (norm.includes('ma') && norm.includes('vt')))) {
      codeIdx = idx;
    } else if (nameIdx === -1 && (norm === 'tenvattu' || norm === 'tenvt' || norm === 'ten' || norm === 'itemname' || norm.includes('tenhang'))) {
      nameIdx = idx;
    } else if (unitIdx === -1 && (norm === 'dvt' || norm === 'donvi' || norm === 'donvitinh' || norm === 'unit')) {
      unitIdx = idx;
    } else if (catIdx === -1 && (norm === 'nhom' || norm === 'nhomhang' || norm === 'nhomvattu' || norm === 'category')) {
      catIdx = idx;
    } else if (monthIdx === -1 && (norm === 'thang' || norm === 'month' || norm === 'ky')) {
      monthIdx = idx;
    } else if (noteIdx === -1 && (norm === 'ghichu' || norm === 'note')) {
      noteIdx = idx;
    } else if (singleBranchIdx === -1 && (norm === 'chinhanh' || norm === 'kho' || norm === 'branch')) {
      singleBranchIdx = idx;
    }

    // Check if col is for a specific branch (Matrix format)
    const matchedBranch = matchBranch(colName, branches);
    if (matchedBranch) {
      if (norm.includes('nhap') || norm.includes('import')) {
        branchColMap[matchedBranch.id].importCol = idx;
      } else if (norm.includes('xuat') || norm.includes('export')) {
        branchColMap[matchedBranch.id].exportCol = idx;
      } else if (norm.includes('ton') || norm.includes('stock') || norm.includes('closing')) {
        branchColMap[matchedBranch.id].stockCol = idx;
      } else {
        // Just branch name (e.g. "Hà Nội (R1)") -> defaults to stock or import based on context
        branchColMap[matchedBranch.id].stockCol = idx;
      }
    } else {
      // General import/export/stock columns
      if (importQtyIdx === -1 && (norm.includes('tongnhap') || norm.includes('soluongnhap') || norm === 'nhap' || norm === 'import')) {
        importQtyIdx = idx;
      } else if (exportQtyIdx === -1 && (norm.includes('tongxuat') || norm.includes('soluongxuat') || norm === 'xuat' || norm === 'export')) {
        exportQtyIdx = idx;
      } else if (openingQtyIdx === -1 && (norm.includes('tondau') || norm.includes('dauky') || norm === 'opening')) {
        openingQtyIdx = idx;
      } else if (closingQtyIdx === -1 && (norm.includes('toncuoi') || norm.includes('tonhientai') || norm === 'ton' || norm === 'stock' || norm === 'closing')) {
        closingQtyIdx = idx;
      }
    }
  });

  // Fallback if code or name is missing by position
  if (codeIdx === -1) {
    // If column 0 is STT, column 1 is likely Code
    if (headerRow[0] && normalizeHeader(headerRow[0]).includes('stt')) {
      codeIdx = 1;
      if (nameIdx === -1 && headerRow.length > 2) nameIdx = 2;
    } else {
      codeIdx = 0;
      if (nameIdx === -1 && headerRow.length > 1) nameIdx = 1;
    }
  }

  // Detect format
  let detectedFormat: 'matrix' | 'transactions_import' | 'transactions_export' | 'overview' | 'custom' = 'overview';
  const hasBranchCols = Object.values(branchColMap).some((b) => b.importCol !== undefined || b.exportCol !== undefined || b.stockCol !== undefined);
  
  if (hasBranchCols) {
    detectedFormat = 'matrix';
  } else if (normalizeHeader(selectedSheet).includes('nhapkho') || (singleBranchIdx !== -1 && importQtyIdx !== -1)) {
    detectedFormat = 'transactions_import';
  } else if (normalizeHeader(selectedSheet).includes('xuatkho') || (singleBranchIdx !== -1 && exportQtyIdx !== -1)) {
    detectedFormat = 'transactions_export';
  } else if (importQtyIdx !== -1 && exportQtyIdx !== -1) {
    detectedFormat = 'overview';
  } else {
    detectedFormat = 'custom';
  }

  const existingCodesSet = new Set(existingItems.map((i) => i.code.trim().toUpperCase()));
  const existingMap = new Map(existingItems.map((i) => [i.code.trim().toUpperCase(), i]));

  const parsedRows: ParsedItemRow[] = [];
  let totalImportQty = 0;
  let totalExportQty = 0;
  let newItemsCount = 0;
  let existingItemsCount = 0;

  for (let r = headerRowIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const rawCode = String(row[codeIdx] || '').trim();
    if (!rawCode) continue; // Skip empty row

    // Skip footer summary lines (e.g. "TỔNG CỘNG", "TỔNG HỆ THỐNG")
    const codeNorm = normalizeHeader(rawCode);
    if (codeNorm.includes('tongcong') || codeNorm.includes('tongtoan') || codeNorm.includes('tong')) {
      continue;
    }

    const itemCode = rawCode.toUpperCase();
    const existing = existingMap.get(itemCode);
    const isNew = !existingCodesSet.has(itemCode);

    if (isNew) {
      newItemsCount++;
    } else {
      existingItemsCount++;
    }

    const itemName = nameIdx !== -1 && row[nameIdx] ? String(row[nameIdx]).trim() : existing?.name || `Vật tư ${itemCode}`;
    const unit = unitIdx !== -1 && row[unitIdx] ? String(row[unitIdx]).trim() : existing?.unit || 'Cái';
    const category = catIdx !== -1 && row[catIdx] ? String(row[catIdx]).trim() : existing?.category || 'Chung';

    let rowMonth = targetMonth;
    if (monthIdx !== -1 && row[monthIdx]) {
      const rawM = String(row[monthIdx]).trim();
      const match = rawM.match(/T?(\d{1,2})\/(\d{4})/i);
      if (match) {
        rowMonth = formatMonthString(parseInt(match[1], 10), parseInt(match[2], 10));
      }
    }

    // Numbers
    const num = (val: any) => {
      if (val === undefined || val === null || val === '') return 0;
      const parsed = parseFloat(String(val).replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    };

    let rowImport = importQtyIdx !== -1 ? num(row[importQtyIdx]) : 0;
    let rowExport = exportQtyIdx !== -1 ? num(row[exportQtyIdx]) : 0;
    const rowOpening = openingQtyIdx !== -1 ? num(row[openingQtyIdx]) : undefined;
    const rowClosing = closingQtyIdx !== -1 ? num(row[closingQtyIdx]) : undefined;

    // Check branch breakdown if matrix columns exist
    const branchBreakdown: Record<string, { imports: number; exports: number; stock: number }> = {};

    branches.forEach((b) => {
      const bCol = branchColMap[b.id];
      const bImp = bCol?.importCol !== undefined ? num(row[bCol.importCol]) : 0;
      const bExp = bCol?.exportCol !== undefined ? num(row[bCol.exportCol]) : 0;
      const bStk = bCol?.stockCol !== undefined ? num(row[bCol.stockCol]) : 0;

      branchBreakdown[b.id] = {
        imports: bImp,
        exports: bExp,
        stock: bStk,
      };

      if (bImp > 0) rowImport += bImp;
      if (bExp > 0) rowExport += bExp;
    });

    // If single branch column is specified (e.g. In transaction list sheet)
    if (singleBranchIdx !== -1 && row[singleBranchIdx]) {
      const targetB = matchBranch(String(row[singleBranchIdx]), branches);
      if (targetB) {
        if (!branchBreakdown[targetB.id]) {
          branchBreakdown[targetB.id] = { imports: 0, exports: 0, stock: 0 };
        }
        branchBreakdown[targetB.id].imports += rowImport;
        branchBreakdown[targetB.id].exports += rowExport;
      }
    }

    totalImportQty += rowImport;
    totalExportQty += rowExport;

    parsedRows.push({
      rowNumber: r + 1,
      itemCode,
      itemName,
      unit,
      category,
      month: rowMonth,
      importQty: rowImport,
      exportQty: rowExport,
      openingQty: rowOpening,
      closingQty: rowClosing,
      branches: branchBreakdown,
      isNewItem: isNew,
      status: 'valid',
      note: noteIdx !== -1 ? String(row[noteIdx] || '') : '',
    });
  }

  const parseResult: ExcelParseResult = {
    sheetNames,
    selectedSheet,
    detectedFormat,
    headerRowIndex,
    headers: headerRow,
    rows: parsedRows,
    totalValidRows: parsedRows.length,
    newItemsCount,
    existingItemsCount,
    totalImportQty,
    totalExportQty,
  };

  return {
    sheetNames,
    workbook,
    parseResult,
  };
}

/**
 * Applies parsed Excel rows to the current AppStateData based on selected mode
 */
export function applyExcelDataToState(
  currentState: AppStateData,
  parseResult: ExcelParseResult,
  options: {
    importMode: 'overwrite' | 'append';
    targetMonth: string;
    defaultBranchId?: string;
    operatorName: string;
  }
): {
  newState: AppStateData;
  addedItemsCount: number;
  updatedItemsCount: number;
  createdTransactionsCount: number;
} {
  const { importMode, targetMonth, defaultBranchId, operatorName } = options;

  let addedItemsCount = 0;
  let updatedItemsCount = 0;
  let createdTransactionsCount = 0;

  // Clone state
  const newItems: Item[] = [...currentState.items];
  const newCategories = new Set(currentState.categories);
  const targetBranch = currentState.branches.find((b) => b.id === defaultBranchId) || currentState.branches[0];

  // 1. Process Items Catalog
  const itemMap = new Map(newItems.map((i) => [i.code.toUpperCase(), i]));

  parseResult.rows.forEach((row) => {
    const code = row.itemCode.toUpperCase();
    if (newCategories) newCategories.add(row.category);

    if (itemMap.has(code)) {
      if (importMode === 'overwrite') {
        const existing = itemMap.get(code)!;
        existing.name = row.itemName || existing.name;
        existing.unit = row.unit || existing.unit;
        existing.category = row.category || existing.category;
        updatedItemsCount++;
      }
    } else {
      const newItem: Item = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        code,
        name: row.itemName,
        unit: row.unit,
        category: row.category,
        status: 'active',
        minStock: 20,
        createdAt: new Date().toISOString(),
      };
      newItems.push(newItem);
      itemMap.set(code, newItem);
      addedItemsCount++;
    }
  });

  // Ensure months includes targetMonth
  const monthsSet = new Set(currentState.months);
  monthsSet.add(targetMonth);
  parseResult.rows.forEach((r) => {
    if (r.month) monthsSet.add(r.month);
  });
  const updatedMonths = Array.from(monthsSet);

  // 2. Process Transactions & Stocks
  let newTransactions: Transaction[] = [...currentState.transactions];
  const newOpeningStocks: ItemOpeningStock[] = [...currentState.openingStocks];

  if (importMode === 'overwrite') {
    // If overwrite mode, remove existing transactions for this month and for the items being imported
    const importedCodes = new Set(parseResult.rows.map((r) => r.itemCode.toUpperCase()));
    newTransactions = newTransactions.filter((tx) => {
      // If same month and same itemCode, remove it so imported data takes precedence
      return !(tx.month === targetMonth && importedCodes.has(tx.itemCode.toUpperCase()));
    });
  }

  const currentDateStr = new Date().toISOString().split('T')[0];

  parseResult.rows.forEach((row) => {
    const rowMonth = row.month || targetMonth;

    // Check if row has branch-specific breakdown
    const hasBranchBreakdown = Object.values(row.branches).some(
      (b) => b.imports > 0 || b.exports > 0 || b.stock > 0
    );

    if (hasBranchBreakdown) {
      // Add transactions per branch
      Object.entries(row.branches).forEach(([bId, vals]) => {
        const branchObj = currentState.branches.find((b) => b.id === bId) || targetBranch;

        if (vals.imports > 0) {
          newTransactions.push({
            id: `tx_imp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            type: 'import',
            month: rowMonth,
            date: currentDateStr,
            branchId: branchObj.id,
            branchName: branchObj.name,
            itemCode: row.itemCode,
            itemName: row.itemName,
            quantity: vals.imports,
            note: `Nhập từ file Excel: ${parseResult.selectedSheet}`,
            createdBy: operatorName,
            createdAt: new Date().toISOString(),
          });
          createdTransactionsCount++;
        }

        if (vals.exports > 0) {
          newTransactions.push({
            id: `tx_exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            type: 'export',
            month: rowMonth,
            date: currentDateStr,
            branchId: branchObj.id,
            branchName: branchObj.name,
            itemCode: row.itemCode,
            itemName: row.itemName,
            quantity: vals.exports,
            note: `Xuất từ file Excel: ${parseResult.selectedSheet}`,
            createdBy: operatorName,
            createdAt: new Date().toISOString(),
          });
          createdTransactionsCount++;
        }

        // If stock is given without imports/exports, register opening stock or net import
        if (vals.stock > 0 && vals.imports === 0 && vals.exports === 0) {
          newTransactions.push({
            id: `tx_stk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            type: 'import',
            month: rowMonth,
            date: currentDateStr,
            branchId: branchObj.id,
            branchName: branchObj.name,
            itemCode: row.itemCode,
            itemName: row.itemName,
            quantity: vals.stock,
            note: `Số dư tồn kho Excel [${branchObj.code}]`,
            createdBy: operatorName,
            createdAt: new Date().toISOString(),
          });
          createdTransactionsCount++;
        }
      });
    } else {
      // General import/export allocated to targetBranch
      if (row.importQty > 0) {
        newTransactions.push({
          id: `tx_imp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          type: 'import',
          month: rowMonth,
          date: currentDateStr,
          branchId: targetBranch.id,
          branchName: targetBranch.name,
          itemCode: row.itemCode,
          itemName: row.itemName,
          quantity: row.importQty,
          note: `Nhập từ file Excel: ${parseResult.selectedSheet}`,
          createdBy: operatorName,
          createdAt: new Date().toISOString(),
        });
        createdTransactionsCount++;
      }

      if (row.exportQty > 0) {
        newTransactions.push({
          id: `tx_exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          type: 'export',
          month: rowMonth,
          date: currentDateStr,
          branchId: targetBranch.id,
          branchName: targetBranch.name,
          itemCode: row.itemCode,
          itemName: row.itemName,
          quantity: row.exportQty,
          note: `Xuất từ file Excel: ${parseResult.selectedSheet}`,
          createdBy: operatorName,
          createdAt: new Date().toISOString(),
        });
        createdTransactionsCount++;
      }

      // If only closing stock provided
      if (row.closingQty && row.closingQty > 0 && row.importQty === 0 && row.exportQty === 0) {
        newTransactions.push({
          id: `tx_stk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          type: 'import',
          month: rowMonth,
          date: currentDateStr,
          branchId: targetBranch.id,
          branchName: targetBranch.name,
          itemCode: row.itemCode,
          itemName: row.itemName,
          quantity: row.closingQty,
          note: `Tồn kho import từ Excel`,
          createdBy: operatorName,
          createdAt: new Date().toISOString(),
        });
        createdTransactionsCount++;
      }
    }
  });

  const newState: AppStateData = {
    ...currentState,
    items: newItems,
    categories: Array.from(newCategories),
    months: updatedMonths,
    transactions: newTransactions,
    openingStocks: newOpeningStocks,
  };

  return {
    newState,
    addedItemsCount,
    updatedItemsCount,
    createdTransactionsCount,
  };
}

/**
 * Generates and downloads a sample Excel template for users
 */
export function downloadSampleExcelTemplate(branches: Branch[], targetMonth: string = 'T08/2026'): void {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Mẫu ma trận 4 chi nhánh
  const matrixHeaders = [
    'Mã VT',
    'Tên vật tư',
    'Đơn vị tính',
    'Nhóm hàng',
    'Tháng',
    ...branches.flatMap((b) => [`${b.name} (Nhập)`, `${b.name} (Xuất)`, `${b.name} (Tồn)`]),
    'Ghi chú',
  ];

  const sampleRows = [
    [
      'VT001',
      'Cát vàng xây dựng',
      'M3',
      'Vật liệu xây dựng',
      targetMonth,
      '50', '20', '30', // HN
      '40', '15', '25', // ĐN
      '60', '30', '30', // HCM
      '30', '10', '20', // CT
      'Mẫu nhập số liệu kho',
    ],
    [
      'VT002',
      'Xi măng PCB40',
      'Bao',
      'Vật liệu xây dựng',
      targetMonth,
      '100', '40', '60',
      '80', '30', '50',
      '120', '50', '70',
      '60', '20', '40',
      'Mẫu nhập số liệu kho',
    ],
    [
      'VT003',
      'Sắt thép D10',
      'Cây',
      'Kim khí',
      targetMonth,
      '70', '25', '45',
      '50', '20', '30',
      '90', '40', '50',
      '40', '15', '25',
      'Mẫu nhập số liệu kho',
    ],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet([matrixHeaders, ...sampleRows]);
  XLSX.utils.book_append_sheet(wb, ws1, 'Mau_Nhap_Lieu');

  XLSX.writeFile(wb, `Mau_Nhap_Excel_Kho_CIC_${targetMonth.replace('/', '_')}.xlsx`);
}
