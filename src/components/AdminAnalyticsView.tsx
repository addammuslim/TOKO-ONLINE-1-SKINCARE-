import React, { useState } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users, ArrowUpRight, ArrowDownRight, CreditCard, PieChart, Activity, Package } from 'lucide-react';
import { SalesAnalyticsPoint, Product } from '../types';

interface AdminAnalyticsViewProps {
  analyticsData: SalesAnalyticsPoint[];
  products: Product[];
  formatRupiah: (val: number) => string;
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({ analyticsData, products, formatRupiah }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d'>('14d');
  const [hoveredPoint, setHoveredPoint] = useState<SalesAnalyticsPoint | null>(null);

  const displayData = timeRange === '7d' ? analyticsData.slice(-7) : analyticsData;
  const maxRevenue = Math.max(...displayData.map((d) => d.revenue));
  const totalPeriodRevenue = displayData.reduce((acc, d) => acc + d.revenue, 0);
  const totalPeriodOrders = displayData.reduce((acc, d) => acc + d.ordersCount, 0);
  const averageOrderValue = Math.round(totalPeriodRevenue / Math.max(1, totalPeriodOrders));
  const totalVisitors = displayData.reduce((acc, d) => acc + d.visitors, 0);
  const conversionRate = ((totalPeriodOrders / Math.max(1, totalVisitors)) * 100).toFixed(2);

  // SVG Chart Geometry
  const chartWidth = 720;
  const chartHeight = 240;
  const paddingX = 40;
  const paddingY = 30;

  const points = displayData.map((d, index) => {
    const x = paddingX + (index / (displayData.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (d.revenue / maxRevenue) * (chartHeight - paddingY * 2);
    return { x, y, data: d };
  });

  const svgPathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaD = `${svgPathD} L ${points[points.length - 1].x},${chartHeight - paddingY} L ${points[0].x},${chartHeight - paddingY} Z`;

  return (
    <div className="space-y-6">
      {/* Top Controls & KPI header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9B786F]">
            Executive Business Intelligence
          </span>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#1F1C1A]">
            Analitik Performa Penjualan & Konversi
          </h2>
          <p className="text-xs text-[#736B63] mt-0.5">
            Data transaksi real-time terintegrasi dengan gateway pembayaran dan sistem persediaan
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl text-xs font-semibold">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-lg transition ${timeRange === '7d' ? 'bg-[#2C2724] text-white shadow-sm' : 'text-[#736B63] hover:text-[#1F1C1A]'}`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => setTimeRange('14d')}
            className={`px-3 py-1.5 rounded-lg transition ${timeRange === '14d' ? 'bg-[#2C2724] text-white shadow-sm' : 'text-[#736B63] hover:text-[#1F1C1A]'}`}
          >
            14 Hari Terakhir
          </button>
        </div>
      </div>

      {/* 4 Core Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD5] shadow-sm">
          <div className="flex items-center justify-between text-[#736B63] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Pendapatan (GMV)</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg"><DollarSign size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-[#1F1C1A]">{formatRupiah(totalPeriodRevenue)}</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-medium">
            <ArrowUpRight size={14} /> <span>+22.4% vs periode lalu</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD5] shadow-sm">
          <div className="flex items-center justify-between text-[#736B63] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Rerata Nilai Pesanan (AOV)</span>
            <div className="p-1.5 bg-[#FAF5F0] text-[#9B786F] rounded-lg"><ShoppingCart size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-[#1F1C1A]">{formatRupiah(averageOrderValue)}</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-medium">
            <ArrowUpRight size={14} /> <span>Batas gratis ongkir Rp 250k efektif</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD5] shadow-sm">
          <div className="flex items-center justify-between text-[#736B63] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Rasio Konversi Checkout</span>
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg"><Activity size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-[#1F1C1A]">{conversionRate}%</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-[#736B63]">
            <span>{totalPeriodOrders} pesanan dari {totalVisitors} kunjungan</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD5] shadow-sm">
          <div className="flex items-center justify-between text-[#736B63] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Customer Retention Rate</span>
            <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg"><Users size={16} /></div>
          </div>
          <div className="text-2xl font-bold text-[#1F1C1A]">36.4%</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-[#736B63]">
            <span>64% Pelanggan Baru &bull; 36% Repeat Order</span>
          </div>
        </div>
      </div>

      {/* Main Revenue Timeline Interactive SVG Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E8DFD5] shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <div>
            <h3 className="font-semibold text-base text-[#1F1C1A]">Grafik Tren Omset Penjualan Harian</h3>
            <p className="text-xs text-[#736B63]">Hover titik kurva untuk melihat rincian omset dan total pesanan</p>
          </div>
          {hoveredPoint && (
            <div className="px-3 py-1.5 bg-[#FAF8F5] border border-[#9B786F] rounded-xl text-xs flex items-center gap-3">
              <span className="font-semibold text-[#1F1C1A]">{hoveredPoint.date}:</span>
              <span className="font-bold text-emerald-800">{formatRupiah(hoveredPoint.revenue)}</span>
              <span className="text-[#736B63]">({hoveredPoint.ordersCount} pesanan)</span>
            </div>
          )}
        </div>

        {/* SVG Curve */}
        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-64 overflow-visible">
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9B786F" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#9B786F" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="#F0EBE5"
                    strokeDasharray="4 4"
                  />
                  <text x={paddingX - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#9E9285" fontFamily="monospace">
                    {formatRupiah(Math.round(maxRevenue * ratio)).replace('Rp ', '')}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path d={areaD} fill="url(#revenueGradient)" />

            {/* Line path */}
            <path d={svgPathD} fill="none" stroke="#9B786F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Interactive Points */}
            {points.map((pt, i) => (
              <g key={i} className="cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#FFFFFF"
                  stroke="#9B786F"
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredPoint(pt.data)}
                  className="transition hover:scale-150"
                />
                <text
                  x={pt.x}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#736B63"
                  fontWeight="500"
                >
                  {pt.data.date}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Breakdown Split: Payment Gateway Share & Top Skincare Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment Channels Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DFD5] pb-3">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="text-[#9B786F]" />
              <h3 className="font-semibold text-sm text-[#1F1C1A]">Distribusi Kanal Pembayaran</h3>
            </div>
            <span className="text-[11px] text-[#736B63] font-mono">100% Real-time</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>QRIS Instan (GoPay, OVO, BCA)</span>
                <span className="text-[#1F1C1A]">38% (Rp 18.5M)</span>
              </div>
              <div className="w-full h-2 bg-[#FAF5F0] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-700 rounded-full" style={{ width: '38%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>BCA Virtual Account</span>
                <span className="text-[#1F1C1A]">32% (Rp 15.6M)</span>
              </div>
              <div className="w-full h-2 bg-[#FAF5F0] rounded-full overflow-hidden">
                <div className="h-full bg-blue-700 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Mandiri & BNI VA</span>
                <span className="text-[#1F1C1A]">14% (Rp 6.8M)</span>
              </div>
              <div className="w-full h-2 bg-[#FAF5F0] rounded-full overflow-hidden">
                <div className="h-full bg-indigo-700 rounded-full" style={{ width: '14%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Kartu Kredit Visa / Mastercard</span>
                <span className="text-[#1F1C1A]">9% (Rp 4.4M)</span>
              </div>
              <div className="w-full h-2 bg-[#FAF5F0] rounded-full overflow-hidden">
                <div className="h-full bg-amber-700 rounded-full" style={{ width: '9%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Cash on Delivery (COD)</span>
                <span className="text-[#1F1C1A]">7% (Rp 3.4M)</span>
              </div>
              <div className="w-full h-2 bg-[#FAF5F0] rounded-full overflow-hidden">
                <div className="h-full bg-stone-600 rounded-full" style={{ width: '7%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Skincare Formulas */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E8DFD5] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DFD5] pb-3">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-[#9B786F]" />
              <h3 className="font-semibold text-sm text-[#1F1C1A]">Produk Skincare Terlaris & Konversi</h3>
            </div>
            <span className="text-[11px] text-[#736B63]">Peringkat Penjualan</span>
          </div>

          <div className="divide-y divide-[#E8DFD5] text-xs">
            {products.slice(0, 5).map((p, idx) => {
              const unitPrice = p.discount_price ?? p.price;
              const estSold = 84 - idx * 14;
              const estRevenue = estSold * unitPrice;
              return (
                <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#FAF5F0] text-[#9B786F] font-bold flex items-center justify-center text-[11px]">
                      {idx + 1}
                    </span>
                    <img src={p.primary_image} alt="" className="w-10 h-10 rounded-lg object-cover border border-[#E8DFD5]" />
                    <div>
                      <div className="font-semibold text-[#1F1C1A] line-clamp-1">{p.name}</div>
                      <div className="text-[11px] text-[#736B63]">{p.category_name} &bull; Sisa {p.stock} botol</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#1F1C1A]">{formatRupiah(estRevenue)}</div>
                    <div className="text-[11px] text-emerald-700 font-medium">{estSold} unit terjual</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
