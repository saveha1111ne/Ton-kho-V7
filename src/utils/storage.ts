import { AppStateData, Branch, Item, ItemOpeningStock, Transaction, UserAccount } from '../types/inventory';

const STORAGE_KEY = 'cic_inventory_system_storage_v1';

export const DEFAULT_BRANCHES: Branch[] = [
  { id: 'b_hn', code: 'R1', name: 'Hà Nội (R1)', address: 'Kho Trung Tâm Cầu Giấy, Hà Nội', manager: 'Trần Văn Hưng', phone: '0901601601', isDefault: true },
  { id: 'b_dn', code: 'R2', name: 'Đà Nẵng (R2)', address: 'Kho Hải Châu, Đà Nẵng', manager: 'Nguyễn Thị Mai', phone: '0901601602', isDefault: true },
  { id: 'b_hcm', code: 'R3', name: 'HCM (R3)', address: 'Kho Tân Bình, TP. Hồ Chí Minh', manager: 'Lê Hoàng Nam', phone: '0901601603', isDefault: true },
  { id: 'b_ct', code: 'R4', name: 'Cần Thơ (R4)', address: 'Kho Ninh Kiều, Cần Thơ', manager: 'Phạm Minh Quân', phone: '0901601604', isDefault: true },
];

export const DEFAULT_CATEGORIES: string[] = [
  'Túi đeo chéo',
  'Dù',
  'Bình giữ nhiệt',
  'Balo & Túi',
  'Đồng phục',
  'Phụ kiện',
  'Văn phòng phẩm',
];

export const DEFAULT_ITEMS: Item[] = [
  {
    id: 'item_1',
    code: 'TC',
    name: 'Túi đeo chéo Team CIC',
    unit: 'Cái',
    category: 'Túi đeo chéo',
    status: 'active',
    minStock: 50,
    note: 'Vải Canvas chống thấm, in logo CIC phản quang',
    createdAt: '2026-05-20T08:00:00Z',
  },
  {
    id: 'item_2',
    code: 'DU0626',
    name: 'Dù gấp 3 tự động 2 chiều CIC',
    unit: 'Cây',
    category: 'Dù',
    status: 'active',
    minStock: 40,
    note: 'Khung nhôm hợp kim chống lật bão, tráng bạc chống UV',
    createdAt: '2026-05-20T08:00:00Z',
  },
  {
    id: 'item_3',
    code: 'BGN0626',
    name: 'Bình giữ nhiệt inox 304 500ml',
    unit: 'Cái',
    category: 'Bình giữ nhiệt',
    status: 'active',
    minStock: 60,
    note: 'Giữ nhiệt 24h, hiển thị nhiệt độ nắp cảm ứng',
    createdAt: '2026-05-20T08:00:00Z',
  },
  {
    id: 'item_4',
    code: 'BALO01',
    name: 'Balo laptop cao cấp CIC Pro',
    unit: 'Cái',
    category: 'Balo & Túi',
    status: 'active',
    minStock: 30,
    note: 'Chứa laptop 15.6 inch, cổng sạc USB tích hợp',
    createdAt: '2026-05-20T08:00:00Z',
  },
  {
    id: 'item_5',
    code: 'AO01',
    name: 'Áo polo đồng phục CIC Navy',
    unit: 'Cái',
    category: 'Đồng phục',
    status: 'active',
    minStock: 80,
    note: 'Chất liệu vải cá sấu mè co giãn 4 chiều',
    createdAt: '2026-05-20T08:00:00Z',
  },
  {
    id: 'item_6',
    code: 'MU01',
    name: 'Mũ lưỡi trai thêu nổi CIC Sport',
    unit: 'Cái',
    category: 'Phụ kiện',
    status: 'active',
    minStock: 50,
    note: 'Màu xanh navy viền trắng',
    createdAt: '2026-05-20T08:00:00Z',
  },
];

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user_admin',
    email: 'save.ha1111@gmail.com',
    name: 'Ha Nhung',
    role: 'admin',
    lastLogin: '2026-09-24T08:30:00Z',
  },
  {
    id: 'user_staff_hn',
    email: 'nhanvien.hanoi@gmail.com',
    name: 'Nguyễn Văn An (Thủ kho Hà Nội)',
    role: 'staff',
    branchId: 'b_hn',
    lastLogin: '2026-09-23T14:15:00Z',
  },
  {
    id: 'user_staff_hcm',
    email: 'nhanvien.hcm@gmail.com',
    name: 'Lê Thu Thảo (Thủ kho HCM)',
    role: 'staff',
    branchId: 'b_hcm',
    lastLogin: '2026-09-23T16:45:00Z',
  },
];

// Baseline opening stocks for initial month: T06/2026
const DEFAULT_OPENING_STOCKS: ItemOpeningStock[] = [
  // Hà Nội (b_hn)
  { month: 'T06/2026', branchId: 'b_hn', itemCode: 'TC', quantity: 250 },
  { month: 'T06/2026', branchId: 'b_hn', itemCode: 'DU0626', quantity: 180 },
  { month: 'T06/2026', branchId: 'b_hn', itemCode: 'BGN0626', quantity: 300 },
  { month: 'T06/2026', branchId: 'b_hn', itemCode: 'BALO01', quantity: 120 },
  { month: 'T06/2026', branchId: 'b_hn', itemCode: 'AO01', quantity: 400 },
  { month: 'T06/2026', branchId: 'b_hn', itemCode: 'MU01', quantity: 200 },

  // Đà Nẵng (b_dn)
  { month: 'T06/2026', branchId: 'b_dn', itemCode: 'TC', quantity: 140 },
  { month: 'T06/2026', branchId: 'b_dn', itemCode: 'DU0626', quantity: 100 },
  { month: 'T06/2026', branchId: 'b_dn', itemCode: 'BGN0626', quantity: 150 },
  { month: 'T06/2026', branchId: 'b_dn', itemCode: 'BALO01', quantity: 60 },
  { month: 'T06/2026', branchId: 'b_dn', itemCode: 'AO01', quantity: 220 },
  { month: 'T06/2026', branchId: 'b_dn', itemCode: 'MU01', quantity: 110 },

  // HCM (b_hcm)
  { month: 'T06/2026', branchId: 'b_hcm', itemCode: 'TC', quantity: 320 },
  { month: 'T06/2026', branchId: 'b_hcm', itemCode: 'DU0626', quantity: 240 },
  { month: 'T06/2026', branchId: 'b_hcm', itemCode: 'BGN0626', quantity: 380 },
  { month: 'T06/2026', branchId: 'b_hcm', itemCode: 'BALO01', quantity: 160 },
  { month: 'T06/2026', branchId: 'b_hcm', itemCode: 'AO01', quantity: 500 },
  { month: 'T06/2026', branchId: 'b_hcm', itemCode: 'MU01', quantity: 280 },

  // Cần Thơ (b_ct)
  { month: 'T06/2026', branchId: 'b_ct', itemCode: 'TC', quantity: 90 },
  { month: 'T06/2026', branchId: 'b_ct', itemCode: 'DU0626', quantity: 70 },
  { month: 'T06/2026', branchId: 'b_ct', itemCode: 'BGN0626', quantity: 110 },
  { month: 'T06/2026', branchId: 'b_ct', itemCode: 'BALO01', quantity: 45 },
  { month: 'T06/2026', branchId: 'b_ct', itemCode: 'AO01', quantity: 150 },
  { month: 'T06/2026', branchId: 'b_ct', itemCode: 'MU01', quantity: 80 },
];

// Rich sample transactions across T06/2026, T07/2026, T08/2026
const DEFAULT_TRANSACTIONS: Transaction[] = [
  // T06/2026 Transactions
  {
    id: 'tx_06_1',
    type: 'import',
    month: 'T06/2026',
    date: '2026-06-05',
    branchId: 'b_hn',
    branchName: 'Hà Nội (R1)',
    itemCode: 'TC',
    itemName: 'Túi đeo chéo Team CIC',
    quantity: 150,
    note: 'Nhập lô hàng may xưởng đợt 1',
    createdBy: 'Hà Nhung Logistic',
    createdAt: '2026-06-05T09:00:00Z',
  },
  {
    id: 'tx_06_2',
    type: 'export',
    month: 'T06/2026',
    date: '2026-06-12',
    branchId: 'b_hn',
    branchName: 'Hà Nội (R1)',
    itemCode: 'TC',
    itemName: 'Túi đeo chéo Team CIC',
    quantity: 80,
    note: 'Cấp phát cho sự kiện Team Building Miền Bắc',
    createdBy: 'Trần Văn Hưng',
    createdAt: '2026-06-12T14:30:00Z',
  },
  {
    id: 'tx_06_3',
    type: 'import',
    month: 'T06/2026',
    date: '2026-06-08',
    branchId: 'b_hcm',
    branchName: 'HCM (R3)',
    itemCode: 'BGN0626',
    itemName: 'Bình giữ nhiệt inox 304 500ml',
    quantity: 200,
    note: 'Nhập kho lô gia công laser theo hợp đồng',
    createdBy: 'Hà Nhung Logistic',
    createdAt: '2026-06-08T10:00:00Z',
  },
  {
    id: 'tx_06_4',
    type: 'export',
    month: 'T06/2026',
    date: '2026-06-20',
    branchId: 'b_hcm',
    branchName: 'HCM (R3)',
    itemCode: 'BGN0626',
    itemName: 'Bình giữ nhiệt inox 304 500ml',
    quantity: 120,
    note: 'Xuất quà tặng hội nghị khách hàng CIC miền Nam',
    createdBy: 'Lê Hoàng Nam',
    createdAt: '2026-06-20T16:00:00Z',
  },
  {
    id: 'tx_06_5',
    type: 'import',
    month: 'T06/2026',
    date: '2026-06-10',
    branchId: 'b_dn',
    branchName: 'Đà Nẵng (R2)',
    itemCode: 'DU0626',
    itemName: 'Dù gấp 3 tự động 2 chiều CIC',
    quantity: 60,
    note: 'Điều chuyển bổ sung kho miền Trung',
    createdBy: 'Nguyễn Thị Mai',
    createdAt: '2026-06-10T11:00:00Z',
  },
  {
    id: 'tx_06_6',
    type: 'export',
    month: 'T06/2026',
    date: '2026-06-25',
    branchId: 'b_ct',
    branchName: 'Cần Thơ (R4)',
    itemCode: 'AO01',
    itemName: 'Áo polo đồng phục CIC Navy',
    quantity: 40,
    note: 'Phát cho nhân viên mới chi nhánh Tây Nam Bộ',
    createdBy: 'Phạm Minh Quân',
    createdAt: '2026-06-25T13:30:00Z',
  },

  // T07/2026 Transactions
  {
    id: 'tx_07_1',
    type: 'import',
    month: 'T07/2026',
    date: '2026-07-03',
    branchId: 'b_hn',
    branchName: 'Hà Nội (R1)',
    itemCode: 'DU0626',
    itemName: 'Dù gấp 3 tự động 2 chiều CIC',
    quantity: 120,
    note: 'Nhập kho chuẩn bị mùa mưa bão tháng 7',
    createdBy: 'Hà Nhung Logistic',
    createdAt: '2026-07-03T08:30:00Z',
  },
  {
    id: 'tx_07_2',
    type: 'export',
    month: 'T07/2026',
    date: '2026-07-10',
    branchId: 'b_hn',
    branchName: 'Hà Nội (R1)',
    itemCode: 'DU0626',
    itemName: 'Dù gấp 3 tự động 2 chiều CIC',
    quantity: 75,
    note: 'Xuất cấp cho chiến dịch Marketing CIC Hè 2026',
    createdBy: 'Trần Văn Hưng',
    createdAt: '2026-07-10T15:00:00Z',
  },
  {
    id: 'tx_07_3',
    type: 'import',
    month: 'T07/2026',
    date: '2026-07-07',
    branchId: 'b_hcm',
    branchName: 'HCM (R3)',
    itemCode: 'TC',
    itemName: 'Túi đeo chéo Team CIC',
    quantity: 180,
    note: 'Nhập lô hàng bổ sung phục vụ hội thảo',
    createdBy: 'Lê Hoàng Nam',
    createdAt: '2026-07-07T10:15:00Z',
  },
  {
    id: 'tx_07_4',
    type: 'export',
    month: 'T07/2026',
    date: '2026-07-18',
    branchId: 'b_hcm',
    branchName: 'HCM (R3)',
    itemCode: 'TC',
    itemName: 'Túi đeo chéo Team CIC',
    quantity: 95,
    note: 'Giao cho khối kinh doanh miền Nam',
    createdBy: 'Lê Hoàng Nam',
    createdAt: '2026-07-18T16:20:00Z',
  },
  {
    id: 'tx_07_5',
    type: 'import',
    month: 'T07/2026',
    date: '2026-07-12',
    branchId: 'b_dn',
    branchName: 'Đà Nẵng (R2)',
    itemCode: 'BGN0626',
    itemName: 'Bình giữ nhiệt inox 304 500ml',
    quantity: 90,
    note: 'Nhập điều chuyển từ tổng kho',
    createdBy: 'Nguyễn Thị Mai',
    createdAt: '2026-07-12T09:45:00Z',
  },
  {
    id: 'tx_07_6',
    type: 'export',
    month: 'T07/2026',
    date: '2026-07-22',
    branchId: 'b_dn',
    branchName: 'Đà Nẵng (R2)',
    itemCode: 'BGN0626',
    itemName: 'Bình giữ nhiệt inox 304 500ml',
    quantity: 45,
    note: 'Xuất phục vụ đoàn tham quan kỹ thuật',
    createdBy: 'Nguyễn Thị Mai',
    createdAt: '2026-07-22T14:10:00Z',
  },
  {
    id: 'tx_07_7',
    type: 'import',
    month: 'T07/2026',
    date: '2026-07-15',
    branchId: 'b_ct',
    branchName: 'Cần Thơ (R4)',
    itemCode: 'BALO01',
    itemName: 'Balo laptop cao cấp CIC Pro',
    quantity: 35,
    note: 'Nhập lô hàng phục vụ cán bộ chi nhánh',
    createdBy: 'Phạm Minh Quân',
    createdAt: '2026-07-15T11:20:00Z',
  },

  // T08/2026 Transactions
  {
    id: 'tx_08_1',
    type: 'import',
    month: 'T08/2026',
    date: '2026-08-04',
    branchId: 'b_hn',
    branchName: 'Hà Nội (R1)',
    itemCode: 'AO01',
    itemName: 'Áo polo đồng phục CIC Navy',
    quantity: 150,
    note: 'Nhập hàng may bổ sung đợt mùa thu',
    createdBy: 'Hà Nhung Logistic',
    createdAt: '2026-08-04T09:30:00Z',
  },
  {
    id: 'tx_08_2',
    type: 'export',
    month: 'T08/2026',
    date: '2026-08-16',
    branchId: 'b_hn',
    branchName: 'Hà Nội (R1)',
    itemCode: 'AO01',
    itemName: 'Áo polo đồng phục CIC Navy',
    quantity: 90,
    note: 'Phát đồng phục năm học mới cho khối dự án',
    createdBy: 'Trần Văn Hưng',
    createdAt: '2026-08-16T15:30:00Z',
  },
  {
    id: 'tx_08_3',
    type: 'import',
    month: 'T08/2026',
    date: '2026-08-08',
    branchId: 'b_hcm',
    branchName: 'HCM (R3)',
    itemCode: 'BGN0626',
    itemName: 'Bình giữ nhiệt inox 304 500ml',
    quantity: 160,
    note: 'Nhập kho chuẩn bị hội chợ triển lãm Logistics CIC',
    createdBy: 'Hà Nhung Logistic',
    createdAt: '2026-08-08T10:45:00Z',
  },
  {
    id: 'tx_08_4',
    type: 'export',
    month: 'T08/2026',
    date: '2026-08-25',
    branchId: 'b_hcm',
    branchName: 'HCM (R3)',
    itemCode: 'BGN0626',
    itemName: 'Bình giữ nhiệt inox 304 500ml',
    quantity: 80,
    note: 'Xuất tài trợ chương trình hội thảo sinh viên',
    createdBy: 'Lê Hoàng Nam',
    createdAt: '2026-08-25T14:00:00Z',
  },
];

export function getInitialAppState(): AppStateData {
  return {
    items: DEFAULT_ITEMS,
    branches: DEFAULT_BRANCHES,
    months: ['T06/2026', 'T07/2026', 'T08/2026'],
    categories: DEFAULT_CATEGORIES,
    transactions: DEFAULT_TRANSACTIONS,
    openingStocks: DEFAULT_OPENING_STOCKS,
    users: DEFAULT_USERS,
    googleSheets: {
      webAppUrl: '',
      spreadsheetUrl: '',
      isConnected: false,
      autoSync: false,
    },
    activeUserId: 'user_admin',
  };
}

export function loadAppState(): AppStateData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialAppState();
      saveAppState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    // Ensure all critical properties exist
    return {
      items: Array.isArray(parsed.items) && parsed.items.length > 0 ? parsed.items : DEFAULT_ITEMS,
      branches: Array.isArray(parsed.branches) && parsed.branches.length > 0 ? parsed.branches : DEFAULT_BRANCHES,
      months: Array.isArray(parsed.months) && parsed.months.length > 0 ? parsed.months : ['T06/2026', 'T07/2026', 'T08/2026'],
      categories: Array.isArray(parsed.categories) && parsed.categories.length > 0 ? parsed.categories : DEFAULT_CATEGORIES,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : DEFAULT_TRANSACTIONS,
      openingStocks: Array.isArray(parsed.openingStocks) ? parsed.openingStocks : DEFAULT_OPENING_STOCKS,
      users: (Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : DEFAULT_USERS).map((u: UserAccount) => {
        if (u.role === 'admin' || u.id === 'user_admin' || u.email === 'save.ha1111@gmail.com') {
          return { ...u, name: 'Ha Nhung' };
        }
        return u;
      }),
      googleSheets: parsed.googleSheets || {
        webAppUrl: '',
        spreadsheetUrl: '',
        isConnected: false,
        autoSync: false,
      },
      activeUserId: parsed.activeUserId || 'user_admin',
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return getInitialAppState();
  }
}

export function saveAppState(state: AppStateData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event('cic_inventory_storage_updated'));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

export function resetAppStateToDefault(): AppStateData {
  const fresh = getInitialAppState();
  saveAppState(fresh);
  return fresh;
}

export const resetToDefaultData = resetAppStateToDefault;

export function exportStateAsJsonFile(state: AppStateData): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `CIC_Inventory_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importStateFromJson(jsonString: string): AppStateData | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.items || !parsed.transactions || !parsed.branches || !parsed.months) {
      return null;
    }
    saveAppState(parsed);
    return parsed;
  } catch (err) {
    console.error('Invalid backup JSON:', err);
    return null;
  }
}

