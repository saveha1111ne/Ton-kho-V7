import * as XLSX from 'xlsx';
import { AppStateData } from '../types/inventory';
import { calculateAllStockLedger, formatQty, getBranchSummary, getFilteredInventoryOverview, sortMonths } from './inventoryCalculations';

export function exportToExcel(
  data: AppStateData,
  selectedMonth: string = 'all',
  selectedBranch: string = 'all',
  searchQuery: string = '',
  exportFilteredOnly: boolean = false
): void {
  const wb = XLSX.utils.book_new();
  const { ledger } = calculateAllStockLedger(data);
  const sortedMonths = sortMonths(data.months);

  // 1. Sheet 1: Tổng quan
  const overviewData = getFilteredInventoryOverview(
    data,
    exportFilteredOnly ? selectedMonth : 'all',
    exportFilteredOnly ? selectedBranch : 'all',
    exportFilteredOnly ? searchQuery : ''
  );

  const sheet1Rows = [
    ['HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC - HA NHUNG LOGISTIC'],
    [`BÁO CÁO TỔNG QUAN TỒN KHO (${exportFilteredOnly && selectedMonth !== 'all' ? selectedMonth : 'Toàn thời gian'})`],
    [`Chi nhánh: ${exportFilteredOnly && selectedBranch !== 'all' ? (data.branches.find(b => b.id === selectedBranch)?.name || selectedBranch) : 'Tất cả chi nhánh'}`],
    ['Ngày xuất báo cáo: ' + new Date().toLocaleString('vi-VN')],
    [],
    ['STT', 'Mã vật tư', 'Tên vật tư', 'Đơn vị tính', 'Nhóm vật tư', 'Tồn đầu kỳ', 'Tổng nhập', 'Tổng xuất', 'Tồn cuối kỳ']
  ];

  overviewData.rows.forEach((row, idx) => {
    sheet1Rows.push([
      (idx + 1).toString(),
      row.itemCode,
      row.itemName,
      row.unit,
      row.category,
      row.openingStock.toString(),
      row.imports.toString(),
      row.exports.toString(),
      row.closingStock.toString()
    ]);
  });

  sheet1Rows.push([
    'TỔNG CỘNG',
    '',
    '',
    '',
    '',
    overviewData.totals.opening.toString(),
    overviewData.totals.imports.toString(),
    overviewData.totals.exports.toString(),
    overviewData.totals.closing.toString()
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Rows);
  XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');

  // 2. Sheet 2: Nhập kho
  const importTransactions = data.transactions.filter(tx => {
    if (tx.type !== 'import') return false;
    if (exportFilteredOnly) {
      if (selectedMonth !== 'all' && tx.month !== selectedMonth) return false;
      if (selectedBranch !== 'all' && tx.branchId !== selectedBranch) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!tx.itemCode.toLowerCase().includes(q) && !tx.itemName.toLowerCase().includes(q)) return false;
      }
    }
    return true;
  });

  const sheet2Rows = [
    ['DANH SÁCH GIAO DỊCH NHẬP KHO'],
    ['Ngày xuất: ' + new Date().toLocaleString('vi-VN')],
    [],
    ['STT', 'Mã giao dịch', 'Ngày GD', 'Tháng', 'Chi nhánh', 'Mã vật tư', 'Tên vật tư', 'Số lượng nhập', 'Ghi chú', 'Người thực hiện']
  ];

  let totalImportQty = 0;
  importTransactions.forEach((tx, idx) => {
    totalImportQty += tx.quantity;
    sheet2Rows.push([
      (idx + 1).toString(),
      tx.id,
      tx.date,
      tx.month,
      tx.branchName,
      tx.itemCode,
      tx.itemName,
      tx.quantity.toString(),
      tx.note || '',
      tx.createdBy
    ]);
  });

  sheet2Rows.push([
    'TỔNG NHẬP', '', '', '', '', '', '', totalImportQty.toString(), '', ''
  ]);

  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Rows);
  XLSX.utils.book_append_sheet(wb, ws2, 'Nhập kho');

  // 3. Sheet 3: Xuất kho
  const exportTransactions = data.transactions.filter(tx => {
    if (tx.type !== 'export') return false;
    if (exportFilteredOnly) {
      if (selectedMonth !== 'all' && tx.month !== selectedMonth) return false;
      if (selectedBranch !== 'all' && tx.branchId !== selectedBranch) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!tx.itemCode.toLowerCase().includes(q) && !tx.itemName.toLowerCase().includes(q)) return false;
      }
    }
    return true;
  });

  const sheet3Rows = [
    ['DANH SÁCH GIAO DỊCH XUẤT KHO'],
    ['Ngày xuất: ' + new Date().toLocaleString('vi-VN')],
    [],
    ['STT', 'Mã giao dịch', 'Ngày GD', 'Tháng', 'Chi nhánh', 'Mã vật tư', 'Tên vật tư', 'Số lượng xuất', 'Ghi chú', 'Người thực hiện']
  ];

  let totalExportQty = 0;
  exportTransactions.forEach((tx, idx) => {
    totalExportQty += tx.quantity;
    sheet3Rows.push([
      (idx + 1).toString(),
      tx.id,
      tx.date,
      tx.month,
      tx.branchName,
      tx.itemCode,
      tx.itemName,
      tx.quantity.toString(),
      tx.note || '',
      tx.createdBy
    ]);
  });

  sheet3Rows.push([
    'TỔNG XUẤT', '', '', '', '', '', '', totalExportQty.toString(), '', ''
  ]);

  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Rows);
  XLSX.utils.book_append_sheet(wb, ws3, 'Xuất kho');

  // 4. Sheet 4: Tồn kho (Chi tiết từng chi nhánh và từng vật tư)
  const targetMonth = selectedMonth !== 'all' ? selectedMonth : sortedMonths[sortedMonths.length - 1] || 'T07/2026';
  const sheet4Rows = [
    [`BẢNG CHI TIẾT TỒN KHO - THÁNG ${targetMonth}`],
    ['Ngày xuất: ' + new Date().toLocaleString('vi-VN')],
    [],
    ['Mã VT', 'Tên vật tư', 'Đơn vị', ...data.branches.map(b => `${b.name} (Tồn)`), 'Tổng tồn toàn hệ thống']
  ];

  data.items.forEach(item => {
    let rowTotal = 0;
    const branchCols = data.branches.map(b => {
      const cell = ledger[targetMonth]?.[b.id]?.[item.code];
      const stock = cell ? cell.closing : 0;
      rowTotal += stock;
      return stock.toString();
    });
    sheet4Rows.push([item.code, item.name, item.unit, ...branchCols, rowTotal.toString()]);
  });

  const ws4 = XLSX.utils.aoa_to_sheet(sheet4Rows);
  XLSX.utils.book_append_sheet(wb, ws4, 'Tồn kho');

  // 5. Sheet 5: Theo chi nhánh
  const branchSummary = getBranchSummary(data, exportFilteredOnly ? selectedMonth : 'all', exportFilteredOnly ? searchQuery : '');
  const sheet5Rows = [
    ['TỔNG HỢP THEO CHI NHÁNH'],
    [`Thời gian: ${exportFilteredOnly && selectedMonth !== 'all' ? selectedMonth : 'Toàn hệ thống'}`],
    [],
    ['STT', 'Mã kho', 'Tên Chi Nhánh', 'Tồn đầu kỳ', 'Tổng nhập', 'Tổng xuất', 'Tồn cuối kỳ']
  ];

  branchSummary.rows.forEach((b, idx) => {
    sheet5Rows.push([
      (idx + 1).toString(),
      b.branchCode,
      b.branchName,
      b.openingStock.toString(),
      b.imports.toString(),
      b.exports.toString(),
      b.closingStock.toString()
    ]);
  });

  sheet5Rows.push([
    'TỔNG TOÀN HỆ THỐNG', '', '',
    branchSummary.total.openingStock.toString(),
    branchSummary.total.imports.toString(),
    branchSummary.total.exports.toString(),
    branchSummary.total.closingStock.toString()
  ]);

  const ws5 = XLSX.utils.aoa_to_sheet(sheet5Rows);
  XLSX.utils.book_append_sheet(wb, ws5, 'Theo chi nhánh');

  // 6. Sheet 6: Theo tháng
  const sheet6Rows = [
    ['TỔNG HỢP THEO CÁC THÁNG'],
    ['Ngày xuất: ' + new Date().toLocaleString('vi-VN')],
    [],
    ['Tháng', 'Tổng tồn đầu', 'Tổng nhập trong tháng', 'Tổng xuất trong tháng', 'Tổng tồn cuối']
  ];

  sortedMonths.forEach(m => {
    const summary = getBranchSummary(data, m);
    sheet6Rows.push([
      m,
      summary.total.openingStock.toString(),
      summary.total.imports.toString(),
      summary.total.exports.toString(),
      summary.total.closingStock.toString()
    ]);
  });

  const ws6 = XLSX.utils.aoa_to_sheet(sheet6Rows);
  XLSX.utils.book_append_sheet(wb, ws6, 'Theo tháng');

  // Build filename: Bao_Cao_Ton_Kho_CIC_{month}_{year}.xlsx
  const monthTag = selectedMonth !== 'all' ? selectedMonth.replace('T', '').replace('/', '_') : 'ALL_2026';
  const fileName = `Bao_Cao_Ton_Kho_CIC_${monthTag}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

export function exportToCSV(
  data: AppStateData,
  selectedMonth: string = 'all',
  selectedBranch: string = 'all',
  searchQuery: string = '',
  exportFilteredOnly: boolean = false
): void {
  const overviewData = getFilteredInventoryOverview(
    data,
    exportFilteredOnly ? selectedMonth : 'all',
    exportFilteredOnly ? selectedBranch : 'all',
    exportFilteredOnly ? searchQuery : ''
  );

  const rows = [
    ['"HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC - HA NHUNG LOGISTIC"'],
    [`"BÁO CÁO TỒN KHO (${exportFilteredOnly && selectedMonth !== 'all' ? selectedMonth : 'Toàn thời gian'})"`],
    ['"STT"', '"Mã vật tư"', '"Tên vật tư"', '"Đơn vị"', '"Nhóm"', '"Tồn đầu"', '"Nhập"', '"Xuất"', '"Tồn cuối"']
  ];

  overviewData.rows.forEach((r, idx) => {
    rows.push([
      (idx + 1).toString(),
      `"${r.itemCode}"`,
      `"${r.itemName}"`,
      `"${r.unit}"`,
      `"${r.category}"`,
      r.openingStock.toString(),
      r.imports.toString(),
      r.exports.toString(),
      r.closingStock.toString()
    ]);
  });

  rows.push([
    '"TỔNG CỘNG"', '""', '""', '""', '""',
    overviewData.totals.opening.toString(),
    overviewData.totals.imports.toString(),
    overviewData.totals.exports.toString(),
    overviewData.totals.closing.toString()
  ]);

  const csvContent = '\uFEFF' + rows.map(e => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const monthTag = selectedMonth !== 'all' ? selectedMonth.replace('T', '').replace('/', '_') : 'ALL_2026';
  link.setAttribute('href', url);
  link.setAttribute('download', `Bao_Cao_Ton_Kho_CIC_${monthTag}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
