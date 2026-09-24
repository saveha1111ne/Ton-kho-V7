import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { AppStateData, FilterState } from '../types/inventory';
import { getBranchSummary, sortMonths, formatQty } from '../utils/inventoryCalculations';
import { PieChart, TrendingUp, BarChart3, MapPin, Activity, Compass } from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsChartsProps {
  data: AppStateData;
  filters: FilterState;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data, filters }) => {
  const sortedMonths = sortMonths(data.months);
  const targetMonth = filters.selectedMonth !== 'all' ? filters.selectedMonth : (sortedMonths[sortedMonths.length - 1] || 'T08/2026');

  // 1. Data for Chart 1 & 2: By Branch for the active month
  const branchSummary = getBranchSummary(data, targetMonth, filters.searchQuery);

  const branchLabels = branchSummary.rows.map((b) => b.branchName);
  const branchStocks = branchSummary.rows.map((b) => b.closingStock);
  const branchImports = branchSummary.rows.map((b) => b.imports);
  const branchExports = branchSummary.rows.map((b) => b.exports);

  const branchColors = [
    '#38bdf8', // Hà Nội - Sky 400
    '#2dd4bf', // Đà Nẵng - Teal 400
    '#818cf8', // HCM - Indigo 400
    '#34d399', // Cần Thơ - Emerald 400
    '#fbbf24', // Khác 1 - Amber 400
    '#c084fc', // Khác 2 - Violet 400
  ];

  const totalClosing = branchSummary.total.closingStock;
  const totalImports = branchSummary.total.imports;
  const totalExports = branchSummary.total.exports;

  // Regional labeling helper
  const getRegionTag = (name: string, code: string) => {
    const lower = name.toLowerCase();
    if (code === 'R1' || lower.includes('hà nội')) return { region: 'Miền Bắc', tag: 'Kho đầu não phía Bắc', badgeBg: 'bg-sky-950 text-sky-300 border border-sky-600/40' };
    if (code === 'R2' || lower.includes('đà nẵng')) return { region: 'Miền Trung', tag: 'Trung chuyển Duyên hải', badgeBg: 'bg-teal-950 text-teal-300 border border-teal-600/40' };
    if (code === 'R3' || lower.includes('hcm') || lower.includes('hồ chí minh')) return { region: 'Miền Nam', tag: 'Kho trọng điểm phía Nam', badgeBg: 'bg-indigo-950 text-indigo-300 border border-indigo-600/40' };
    if (code === 'R4' || lower.includes('cần thơ')) return { region: 'Tây Nam Bộ', tag: 'Phân phối Đồng bằng SCL', badgeBg: 'bg-emerald-950 text-emerald-300 border border-emerald-600/40' };
    return { region: 'Khu vực khác', tag: 'Chi nhánh liên kết', badgeBg: 'bg-slate-800 text-slate-300 border border-slate-600/40' };
  };

  // Chart 1: Bar chart tồn kho theo chi nhánh
  const barBranchData = {
    labels: branchLabels,
    datasets: [
      {
        label: 'Tồn cuối kỳ',
        data: branchStocks,
        backgroundColor: 'rgba(56, 189, 248, 0.85)',
        borderColor: '#38bdf8',
        borderWidth: 1.5,
        borderRadius: 8,
      },
      {
        label: 'Tổng nhập',
        data: branchImports,
        backgroundColor: 'rgba(52, 211, 153, 0.85)',
        borderColor: '#34d399',
        borderWidth: 1.5,
        borderRadius: 8,
      },
      {
        label: 'Tổng xuất',
        data: branchExports,
        backgroundColor: 'rgba(251, 113, 133, 0.85)',
        borderColor: '#fb7185',
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  // Chart 2: Doughnut chart tỷ trọng tồn kho theo chi nhánh
  const doughnutData = {
    labels: branchLabels,
    datasets: [
      {
        data: branchStocks,
        backgroundColor: branchColors.slice(0, branchLabels.length),
        borderWidth: 2,
        borderColor: '#0d2238',
        hoverOffset: 8,
      },
    ],
  };

  // 3. Data for Chart 3 & 4: Across all months
  const monthlyImports: number[] = [];
  const monthlyExports: number[] = [];
  const monthlyStocks: number[] = [];

  sortedMonths.forEach((m) => {
    const summary = getBranchSummary(data, m, filters.searchQuery);
    monthlyImports.push(summary.total.imports);
    monthlyExports.push(summary.total.exports);
    monthlyStocks.push(summary.total.closingStock);
  });

  // Chart 3: Nhập / Xuất / Tồn theo tháng
  const monthlyComparisonData = {
    labels: sortedMonths,
    datasets: [
      {
        label: 'Tổng nhập',
        data: monthlyImports,
        backgroundColor: 'rgba(52, 211, 153, 0.85)',
        borderRadius: 6,
      },
      {
        label: 'Tổng xuất',
        data: monthlyExports,
        backgroundColor: 'rgba(251, 113, 133, 0.85)',
        borderRadius: 6,
      },
      {
        label: 'Tồn cuối kỳ',
        data: monthlyStocks,
        backgroundColor: 'rgba(56, 189, 248, 0.85)',
        borderRadius: 6,
      },
    ],
  };

  // Chart 4: Xu hướng tồn kho (Line Chart)
  const lineTrendData = {
    labels: sortedMonths,
    datasets: [
      {
        label: 'Xu hướng tồn kho toàn hệ thống',
        data: monthlyStocks,
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.12)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#FFD700',
        pointBorderColor: '#011627',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptionsBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e2e8f0',
          font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' as any },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#011627',
        titleColor: '#FFD700',
        bodyColor: '#ffffff',
        borderColor: '#334155',
        borderWidth: 1,
        titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' as any },
        bodyFont: { family: 'JetBrains Mono' },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans', size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 11 } },
      },
    },
  };

  return (
    <div className="space-y-6 pt-2">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-[#0d2238] border border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#00695C] flex items-center justify-center text-teal-200">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-white tracking-wide">
              BÁO CÁO PHÂN TÍCH THỊ PHẦN TỒN KHO & XU HƯỚNG
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            Dữ liệu trực quan hóa phân bổ hàng hóa 4 chi nhánh và chuyển dịch luân chuyển kho kỳ <strong className="text-amber-300">{targetMonth}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-[#011627] text-amber-300 border border-slate-700">
            Tổng tồn kỳ: <strong className="font-mono text-white">{formatQty(totalClosing)}</strong>
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-[#011627] text-emerald-400 border border-slate-700">
            Tổng nhập: <strong className="font-mono text-white">+{formatQty(totalImports)}</strong>
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-[#011627] text-rose-400 border border-slate-700">
            Tổng xuất: <strong className="font-mono text-white">-{formatQty(totalExports)}</strong>
          </span>
        </div>
      </div>

      {/* 2. REGIONAL MARKET SHARE CARDS */}
      <div className="bg-[#0d2238] border border-slate-700/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Cơ Cấu Thị Phần Tồn Kho Từng Chi Nhánh (Kỳ {targetMonth})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Tự động tính tỷ lệ % trên tổng tồn toàn quốc
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {branchSummary.rows.map((b, idx) => {
            const share = totalClosing > 0 ? (b.closingStock / totalClosing) * 100 : 0;
            const shareStr = share.toFixed(1);
            const regionInfo = getRegionTag(b.branchName, b.branchCode);
            const color = branchColors[idx % branchColors.length];

            return (
              <div 
                key={b.branchId}
                className="bg-[#081a2e] hover:bg-[#0b213a] border border-slate-700 hover:border-cyan-500/50 rounded-xl p-4 shadow-sm transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
                      {b.branchCode}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${regionInfo.badgeBg}`}>
                      {regionInfo.region}
                    </span>
                  </div>

                  {/* Branch name */}
                  <h4 className="font-bold text-sm text-white mb-1 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{b.branchName}</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-3">{regionInfo.tag}</p>

                  {/* Market Share Percent with custom progress bar */}
                  <div className="space-y-1.5 mb-3 bg-[#011627] p-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">Thị phần tồn:</span>
                      <span className="font-mono font-extrabold text-[#FFD700] text-sm">{shareStr}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(share, 100)}%`, backgroundColor: color }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Card bottom: Flow stats */}
                <div className="pt-2 border-t border-slate-700/80 grid grid-cols-3 gap-1 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Tồn kho</span>
                    <span className="font-mono font-bold text-white">{formatQty(b.closingStock)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nhập</span>
                    <span className="font-mono font-bold text-emerald-400">+{formatQty(b.imports)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Xuất</span>
                    <span className="font-mono font-bold text-rose-400">-{formatQty(b.exports)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. GRID 2X2 BIỂU ĐỒ TRỰC QUAN (Interactive Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Biểu đồ 1: Tồn kho theo chi nhánh (Bar Chart) */}
        <div className="bg-[#0d2238] border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>1. Tồn kho & Lưu chuyển theo Chi Nhánh</span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Tháng {targetMonth} · So sánh Tồn cuối, Nhập và Xuất từng kho
              </p>
            </div>
            <span className="text-[10px] font-mono bg-[#00695C] text-teal-100 px-2 py-0.5 rounded font-bold">
              BAR
            </span>
          </div>
          <div className="h-64 sm:h-72">
            <Bar data={barBranchData} options={chartOptionsBase} />
          </div>
        </div>

        {/* Biểu đồ 2: Tỷ lệ tồn kho (Doughnut Chart) */}
        <div className="bg-[#0d2238] border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-indigo-400" />
                <span>2. Tỷ Trọng Thị Phần Hàng Tồn Theo Vùng</span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Tháng {targetMonth} · Cơ cấu phần trăm tổng tồn ({formatQty(branchSummary.total.closingStock)} sản phẩm)
              </p>
            </div>
            <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-700/50 px-2 py-0.5 rounded font-bold">
              DOUGHNUT
            </span>
          </div>
          <div className="h-64 sm:h-72 flex items-center justify-center">
            <Doughnut 
              data={doughnutData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                    labels: {
                      color: '#e2e8f0',
                      font: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' as any },
                      usePointStyle: true,
                      boxWidth: 8,
                    },
                  },
                  tooltip: {
                    backgroundColor: '#011627',
                    titleColor: '#FFD700',
                    bodyColor: '#ffffff',
                    borderColor: '#334155',
                    borderWidth: 1,
                  }
                },
              }} 
            />
          </div>
        </div>

        {/* Biểu đồ 3: Nhập / Xuất / Tồn theo tháng */}
        <div className="bg-[#0d2238] border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>3. Nhập – Xuất – Tồn Qua Các Tháng</span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Theo dõi quy mô luân chuyển hàng hóa toàn hệ thống theo chu kỳ kế toán
              </p>
            </div>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded font-bold">
              GROUPED
            </span>
          </div>
          <div className="h-64 sm:h-72">
            <Bar data={monthlyComparisonData} options={chartOptionsBase} />
          </div>
        </div>

        {/* Biểu đồ 4: Xu hướng tồn kho (Line Chart) */}
        <div className="bg-[#0d2238] border border-slate-700/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#FFD700]" />
                <span>4. Xu Hướng Tồn Kho Toàn Hệ Thống</span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Biểu đồ đường thể hiện tồn kho tăng/giảm qua chuỗi thời gian
              </p>
            </div>
            <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded font-bold">
              LINE TREND
            </span>
          </div>
          <div className="h-64 sm:h-72">
            <Line data={lineTrendData} options={chartOptionsBase} />
          </div>
        </div>

      </div>

    </div>
  );
};
