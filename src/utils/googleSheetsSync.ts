import { AppStateData } from '../types/inventory';
import { calculateAllStockLedger, sortMonths } from './inventoryCalculations';

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT CHO HỆ THỐNG QUẢN LÝ TỒN KHO TEAM CIC - HA NHUNG LOGISTIC
 * =========================================================================
 * Hướng dẫn cài đặt (Chỉ mất 2 phút):
 * 1. Mở một Google Spreadsheet mới trên Google Drive (hoặc mở bảng tính hiện có).
 * 2. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) > Apps Script.
 * 3. Xóa hết code mặc định trong trình chỉnh sửa và dán toàn bộ đoạn mã này vào.
 * 4. Nhấn biểu tượng Lưu (Save / Ctrl+S).
 * 5. Nhấn nút "Triển khai" (Deploy) ở góc trên bên phải > chọn "Tùy chọn triển khai mới" (New deployment).
 * 6. Tại bánh răng bên trái, chọn loại: "Ứng dụng web" (Web app).
 * 7. Cấu hình:
 *    - Mô tả: CIC Inventory Web App
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone) -> RẤT QUAN TRỌNG để ứng dụng web kết nối được!
 * 8. Nhấn "Triển khai" (Deploy), cấp quyền truy cập tài khoản Google nếu được hỏi.
 * 9. Sao chép "URL ứng dụng web" (Web App URL) dạng https://script.google.com/macros/s/.../exec
 *    và dán vào ô "Google Sheets Web App API URL" trong ứng dụng CIC để kết nối!
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = {
    status: 'success',
    spreadsheetName: ss.getName(),
    spreadsheetUrl: ss.getUrl(),
    syncedAt: new Date().toISOString(),
    items: [],
    branches: [],
    transactions: [],
    months: []
  };

  try {
    // Đọc sheet DanhMucVatTu nếu có
    var sheetItems = ss.getSheetByName('DanhMucVatTu');
    if (sheetItems && sheetItems.getLastRow() > 1) {
      var data = sheetItems.getRange(2, 1, sheetItems.getLastRow() - 1, 6).getValues();
      result.items = data.map(function(r) {
        return {
          code: String(r[0]),
          name: String(r[1]),
          unit: String(r[2]),
          category: String(r[3]),
          status: String(r[4]) || 'active',
          minStock: Number(r[5]) || 0
        };
      });
    }

    // Đọc sheet GiaoDich
    var sheetTx = ss.getSheetByName('GiaoDich');
    if (sheetTx && sheetTx.getLastRow() > 1) {
      var txData = sheetTx.getRange(2, 1, sheetTx.getLastRow() - 1, 9).getValues();
      result.transactions = txData.map(function(r, idx) {
        return {
          id: String(r[0]) || ('gs_' + idx),
          type: String(r[1]).toLowerCase() === 'xuất' ? 'export' : 'import',
          date: Utilities.formatDate(new Date(r[2]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
          month: String(r[3]),
          branchName: String(r[4]),
          itemCode: String(r[5]),
          itemName: String(r[6]),
          quantity: Number(r[7]) || 0,
          note: String(r[8]) || ''
        };
      });
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Sheet: TongQuanTonKho
    var sheetSummary = getOrCreateSheet(ss, 'TongQuanTonKho');
    sheetSummary.clear();
    var summaryHeaders = ['Mã vật tư', 'Tên vật tư', 'Đơn vị', 'Nhóm', 'Tồn đầu', 'Tổng nhập', 'Tổng xuất', 'Tồn cuối'];
    var summaryRows = [summaryHeaders];
    if (payload.overview && payload.overview.length > 0) {
      payload.overview.forEach(function(r) {
        summaryRows.push([r.itemCode, r.itemName, r.unit, r.category, r.openingStock, r.imports, r.exports, r.closingStock]);
      });
    }
    sheetSummary.getRange(1, 1, summaryRows.length, summaryHeaders.length).setValues(summaryRows);
    styleHeader(sheetSummary, summaryHeaders.length);

    // 2. Sheet: DanhMucVatTu
    var sheetItems = getOrCreateSheet(ss, 'DanhMucVatTu');
    sheetItems.clear();
    var itemHeaders = ['Mã vật tư', 'Tên vật tư', 'Đơn vị tính', 'Nhóm vật tư', 'Trạng thái', 'Tồn tối thiểu'];
    var itemRows = [itemHeaders];
    if (payload.items && payload.items.length > 0) {
      payload.items.forEach(function(it) {
        itemRows.push([it.code, it.name, it.unit, it.category, it.status, it.minStock || 0]);
      });
    }
    sheetItems.getRange(1, 1, itemRows.length, itemHeaders.length).setValues(itemRows);
    styleHeader(sheetItems, itemHeaders.length);

    // 3. Sheet: GiaoDich
    var sheetTx = getOrCreateSheet(ss, 'GiaoDich');
    sheetTx.clear();
    var txHeaders = ['Mã GD', 'Loại (Nhập/Xuất)', 'Ngày GD', 'Tháng', 'Chi nhánh', 'Mã VT', 'Tên vật tư', 'Số lượng', 'Ghi chú', 'Người thực hiện'];
    var txRows = [txHeaders];
    if (payload.transactions && payload.transactions.length > 0) {
      payload.transactions.forEach(function(tx) {
        txRows.push([
          tx.id,
          tx.type === 'import' ? 'Nhập' : 'Xuất',
          tx.date,
          tx.month,
          tx.branchName,
          tx.itemCode,
          tx.itemName,
          tx.quantity,
          tx.note || '',
          tx.createdBy || ''
        ]);
      });
    }
    sheetTx.getRange(1, 1, txRows.length, txHeaders.length).setValues(txRows);
    styleHeader(sheetTx, txHeaders.length);

    // 4. Sheet: TonKhoTheoChiNhanh
    var sheetBranches = getOrCreateSheet(ss, 'TonKhoTheoChiNhanh');
    sheetBranches.clear();
    var brHeaders = ['Mã kho', 'Chi nhánh', 'Tồn đầu', 'Nhập', 'Xuất', 'Tồn cuối'];
    var brRows = [brHeaders];
    if (payload.branches && payload.branches.length > 0) {
      payload.branches.forEach(function(b) {
        brRows.push([b.branchCode, b.branchName, b.openingStock, b.imports, b.exports, b.closingStock]);
      });
    }
    sheetBranches.getRange(1, 1, brRows.length, brHeaders.length).setValues(brRows);
    styleHeader(sheetBranches, brHeaders.length);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Đã đồng bộ toàn bộ dữ liệu lên Google Sheets thành công!',
      spreadsheetUrl: ss.getUrl(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function styleHeader(sheet, numCols) {
  var range = sheet.getRange(1, 1, 1, numCols);
  range.setBackground('#1e3a8a');
  range.setFontColor('#ffffff');
  range.setFontWeight('bold');
  sheet.setFrozenRows(1);
}
`;

export async function testGoogleSheetsConnection(url: string): Promise<{ success: boolean; message: string; spreadsheetUrl?: string }> {
  if (!url || !url.startsWith('http')) {
    return { success: false, message: 'URL Google Apps Script không hợp lệ.' };
  }
  try {
    const res = await fetch(url, { method: 'GET', mode: 'cors' });
    if (!res.ok) {
      return { success: false, message: `Lỗi kết nối HTTP: ${res.status} ${res.statusText}` };
    }
    const json = await res.json();
    if (json.status === 'success') {
      return {
        success: true,
        message: 'Kết nối Google Sheets thành công!',
        spreadsheetUrl: json.spreadsheetUrl,
      };
    }
    return { success: false, message: json.message || 'Không thể xác thực cấu trúc bảng tính.' };
  } catch (err: any) {
    return {
      success: false,
      message: 'Không thể kết nối đến Web App: ' + (err.message || 'Vui lòng kiểm tra quyền "Bất kỳ ai (Anyone)" khi triển khai Apps Script.'),
    };
  }
}

export async function pushDataToGoogleSheets(
  url: string,
  state: AppStateData
): Promise<{ success: boolean; message: string; spreadsheetUrl?: string }> {
  if (!url || !url.startsWith('http')) {
    return { success: false, message: 'Chưa cấu hình URL Google Apps Script.' };
  }

  const { ledger } = calculateAllStockLedger(state);
  const sortedMonths = sortMonths(state.months);
  const latestMonth = sortedMonths[sortedMonths.length - 1] || 'T07/2026';

  // Compute overview rows
  const overviewRows = state.items.map((item) => {
    let opening = 0;
    let imports = 0;
    let exports = 0;
    let closing = 0;

    state.branches.forEach((b) => {
      const cell = ledger[latestMonth]?.[b.id]?.[item.code];
      if (cell) {
        opening += cell.opening;
        imports += cell.imports;
        exports += cell.exports;
        closing += cell.closing;
      }
    });

    return {
      itemCode: item.code,
      itemName: item.name,
      unit: item.unit,
      category: item.category,
      openingStock: opening,
      imports,
      exports,
      closingStock: closing,
    };
  });

  // Compute branch summary
  const branchRows = state.branches.map((b) => {
    let opening = 0;
    let imports = 0;
    let exports = 0;
    let closing = 0;

    state.items.forEach((it) => {
      const cell = ledger[latestMonth]?.[b.id]?.[it.code];
      if (cell) {
        opening += cell.opening;
        imports += cell.imports;
        exports += cell.exports;
        closing += cell.closing;
      }
    });

    return {
      branchCode: b.code,
      branchName: b.name,
      openingStock: opening,
      imports,
      exports,
      closingStock: closing,
    };
  });

  const payload = {
    overview: overviewRows,
    items: state.items,
    transactions: state.transactions,
    branches: branchRows,
    months: state.months,
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Google Apps Script handles text/plain best to bypass CORS preflight
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (json.status === 'success') {
      return {
        success: true,
        message: 'Đã đồng bộ thành công dữ liệu sang Google Sheets!',
        spreadsheetUrl: json.spreadsheetUrl,
      };
    }
    return {
      success: false,
      message: json.message || 'Lỗi khi ghi dữ liệu vào Google Sheets.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Lỗi gửi dữ liệu: ' + (err.message || 'Vui lòng kiểm tra quyền truy cập của Google Apps Script.'),
    };
  }
}
