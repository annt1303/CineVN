import React, { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "../../services/api";
import {
  DollarSign,
  Ticket,
  Users,
  Landmark,
  TrendingUp,
  Calendar,
  Loader2,
  AlertTriangle,
  Film,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────

function formatCurrency(value) {
  if (value == null) return "0 ₫";
  return Number(value).toLocaleString("vi-VN") + " ₫";
}

function formatCompactCurrency(value) {
  const num = Number(value);
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + " tỷ";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + " triệu";
  if (num >= 1_000) return (num / 1_000).toFixed(0) + "K";
  return num.toLocaleString("vi-VN") + " ₫";
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── SVG Area Chart ────────────────────────────────────────

function AreaChart({ data, width = 700, height = 300 }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const padding = { top: 30, right: 30, bottom: 50, left: 80 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxRevenue = useMemo(
    () => Math.max(...data.map((d) => Number(d.revenue)), 1),
    [data]
  );

  const points = useMemo(() => {
    if (data.length === 0) return [];
    return data.map((d, i) => ({
      x: padding.left + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW),
      y: padding.top + chartH - (Number(d.revenue) / maxRevenue) * chartH,
      ...d,
    }));
  }, [data, chartW, chartH, maxRevenue]);

  // Smooth bezier curve path
  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
      const cpx2 = prev.x + (curr.x - prev.x) * 0.6;
      path += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return path;
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const baseline = padding.top + chartH;
    return `${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;
  }, [linePath, points, chartH]);

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const ticks = [];
    const count = 5;
    for (let i = 0; i <= count; i++) {
      const val = (maxRevenue / count) * i;
      const y = padding.top + chartH - (val / maxRevenue) * chartH;
      ticks.push({ y, label: formatCompactCurrency(val) });
    }
    return ticks;
  }, [maxRevenue, chartH]);

  // X-axis labels
  const xLabels = useMemo(() => {
    if (data.length <= 10) return data.map((_, i) => i);
    const step = Math.ceil(data.length / 8);
    const indices = [];
    for (let i = 0; i < data.length; i += step) indices.push(i);
    if (indices[indices.length - 1] !== data.length - 1) indices.push(data.length - 1);
    return indices;
  }, [data]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-zinc-500"
        style={{ width, height }}
      >
        <p>Không có dữ liệu trong khoảng thời gian này.</p>
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      onMouseLeave={() => setHoverIndex(null)}
    >
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {yTicks.map((tick, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            y1={tick.y}
            x2={padding.left + chartW}
            y2={tick.y}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="4 4"
          />
          <text
            x={padding.left - 12}
            y={tick.y + 4}
            textAnchor="end"
            fill="rgba(255,255,255,0.4)"
            fontSize="11"
            fontFamily="system-ui"
          >
            {tick.label}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {xLabels.map((idx) => {
        const pt = points[idx];
        if (!pt) return null;
        return (
          <text
            key={idx}
            x={pt.x}
            y={height - 10}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize="11"
            fontFamily="system-ui"
          >
            {formatDate(pt.date)}
          </text>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#areaGradient)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#f43f5e"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow)"
      />

      {/* Dots & hover targets */}
      {points.map((pt, i) => (
        <g key={i} onMouseEnter={() => setHoverIndex(i)}>
          <circle
            cx={pt.x}
            cy={pt.y}
            r={hoverIndex === i ? 6 : 3}
            fill={hoverIndex === i ? "#fff" : "#f43f5e"}
            stroke={hoverIndex === i ? "#f43f5e" : "none"}
            strokeWidth="2"
            style={{ transition: "all 0.15s ease" }}
          />
          {/* Invisible larger hit target */}
          <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
        </g>
      ))}

      {/* Tooltip */}
      {hoverIndex !== null && points[hoverIndex] && (
        <g>
          <line
            x1={points[hoverIndex].x}
            y1={padding.top}
            x2={points[hoverIndex].x}
            y2={padding.top + chartH}
            stroke="rgba(244,63,94,0.3)"
            strokeDasharray="4 4"
          />
          <rect
            x={points[hoverIndex].x - 75}
            y={points[hoverIndex].y - 52}
            width="150"
            height="42"
            rx="8"
            fill="rgba(24,24,27,0.95)"
            stroke="rgba(244,63,94,0.4)"
            strokeWidth="1"
          />
          <text
            x={points[hoverIndex].x}
            y={points[hoverIndex].y - 34}
            textAnchor="middle"
            fill="#f43f5e"
            fontSize="12"
            fontWeight="600"
            fontFamily="system-ui"
          >
            {formatCurrency(points[hoverIndex].revenue)}
          </text>
          <text
            x={points[hoverIndex].x}
            y={points[hoverIndex].y - 18}
            textAnchor="middle"
            fill="rgba(255,255,255,0.5)"
            fontSize="10"
            fontFamily="system-ui"
          >
            {formatDate(points[hoverIndex].date)} • {points[hoverIndex].ticketCount} vé
          </text>
        </g>
      )}
    </svg>
  );
}

// ─── SVG Bar Chart ─────────────────────────────────────────

function BarChart({ data, width = 700, height = 280 }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const padding = { top: 20, right: 30, bottom: 60, left: 80 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxRevenue = useMemo(
    () => Math.max(...data.map((d) => Number(d.revenue)), 1),
    [data]
  );

  const barWidth = useMemo(
    () => Math.min(50, (chartW / data.length) * 0.6),
    [data, chartW]
  );

  const colors = [
    "#f43f5e",
    "#8b5cf6",
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ec4899",
    "#6366f1",
    "#14b8a6",
  ];

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-zinc-500"
        style={{ width, height }}
      >
        <p>Không có dữ liệu.</p>
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      onMouseLeave={() => setHoverIndex(null)}
    >
      <defs>
        {data.map((_, i) => (
          <linearGradient key={i} id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[i % colors.length]} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors[i % colors.length]} stopOpacity="0.5" />
          </linearGradient>
        ))}
      </defs>

      {/* Y grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = padding.top + chartH - ratio * chartH;
        return (
          <g key={i}>
            <line
              x1={padding.left}
              y1={y}
              x2={padding.left + chartW}
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 12}
              y={y + 4}
              textAnchor="end"
              fill="rgba(255,255,255,0.35)"
              fontSize="10"
              fontFamily="system-ui"
            >
              {formatCompactCurrency(maxRevenue * ratio)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = (Number(d.revenue) / maxRevenue) * chartH;
        const x =
          padding.left +
          (i / data.length) * chartW +
          (chartW / data.length - barWidth) / 2;
        const y = padding.top + chartH - barH;
        const isHover = hoverIndex === i;

        return (
          <g
            key={i}
            onMouseEnter={() => setHoverIndex(i)}
            style={{ cursor: "pointer" }}
          >
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx="4"
              fill={`url(#barGrad-${i})`}
              opacity={isHover ? 1 : 0.8}
              style={{ transition: "all 0.2s ease" }}
            />

            {/* Label below */}
            <text
              x={x + barWidth / 2}
              y={height - 15}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="10"
              fontFamily="system-ui"
            >
              {(d.cinemaName || d.movieTitle || "").length > 10
                ? (d.cinemaName || d.movieTitle || "").slice(0, 10) + "…"
                : d.cinemaName || d.movieTitle || ""}
            </text>

            {/* Hover tooltip */}
            {isHover && (
              <g>
                <rect
                  x={x + barWidth / 2 - 70}
                  y={y - 48}
                  width="140"
                  height="40"
                  rx="8"
                  fill="rgba(24,24,27,0.95)"
                  stroke={colors[i % colors.length]}
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 30}
                  textAnchor="middle"
                  fill={colors[i % colors.length]}
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="system-ui"
                >
                  {formatCurrency(d.revenue)}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={y - 16}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.5)"
                  fontSize="10"
                  fontFamily="system-ui"
                >
                  {d.ticketCount} vé bán ra
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Movie Ranking List ────────────────────────────────────

function MovieRankingList({ data }) {
  const maxRevenue = useMemo(
    () => Math.max(...data.map((d) => Number(d.revenue)), 1),
    [data]
  );

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-3">
      {data.slice(0, 8).map((movie, i) => {
        const pct = (Number(movie.revenue) / maxRevenue) * 100;
        return (
          <div key={movie.movieId} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg w-7 text-center shrink-0">
                  {i < 3 ? medals[i] : (
                    <span className="text-zinc-500 text-sm font-medium">#{i + 1}</span>
                  )}
                </span>
                <span className="text-sm text-white truncate font-medium">
                  {movie.movieTitle}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-xs text-zinc-400">{movie.ticketCount} vé</span>
                <span className="text-sm font-semibold text-rose-400 min-w-[90px] text-right">
                  {formatCompactCurrency(movie.revenue)}
                </span>
              </div>
            </div>
            <div className="ml-9 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${
                    i === 0
                      ? "#f43f5e, #fb923c"
                      : i === 1
                      ? "#8b5cf6, #a78bfa"
                      : i === 2
                      ? "#3b82f6, #60a5fa"
                      : "#52525b, #71717a"
                  })`,
                }}
              />
            </div>
          </div>
        );
      })}
      {data.length === 0 && (
        <p className="text-zinc-500 text-sm text-center py-6">
          Không có dữ liệu phim trong khoảng thời gian này.
        </p>
      )}
    </div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────

const PRESET_RANGES = [
  { label: "7 ngày", days: 7 },
  { label: "30 ngày", days: 30 },
  { label: "Tháng này", days: 0 }, // special
  { label: "90 ngày", days: 90 },
];

export default function Dashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePreset, setActivePreset] = useState(1); // default 30 days

  const today = new Date();

  const getPresetDates = useCallback(
    (presetIndex) => {
      const preset = PRESET_RANGES[presetIndex];
      let end = toISODate(today);
      let start;
      if (preset.days === 0) {
        // "This month"
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        start = toISODate(firstDay);
      } else {
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - preset.days);
        start = toISODate(startDate);
      }
      return { start, end };
    },
    [today]
  );

  const [startDate, setStartDate] = useState(() => getPresetDates(1).start);
  const [endDate, setEndDate] = useState(() => getPresetDates(1).end);

  const fetchReport = useCallback(async (start, end) => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get(
        `/api/admin/reports/dashboard?startDate=${start}&endDate=${end}`
      );
      setReport(data);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(startDate, endDate);
  }, [startDate, endDate, fetchReport]);

  const handlePreset = (index) => {
    setActivePreset(index);
    const { start, end } = getPresetDates(index);
    setStartDate(start);
    setEndDate(end);
  };

  const handleDateChange = (field, value) => {
    setActivePreset(-1);
    if (field === "start") setStartDate(value);
    else setEndDate(value);
  };

  const stats = report
    ? [
        {
          name: "Tổng doanh thu",
          value: formatCompactCurrency(report.summary.totalRevenue),
          icon: DollarSign,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
        },
        {
          name: "Vé đã bán",
          value: Number(report.summary.totalTicketsSold).toLocaleString("vi-VN") + " vé",
          icon: Ticket,
          color: "text-rose-400",
          bg: "bg-rose-500/10",
          border: "border-rose-500/20",
        },
        {
          name: "Tổng rạp chiếu",
          value: report.summary.totalCinemas + " cụm rạp",
          icon: Landmark,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
        },
        {
          name: "Khách hàng",
          value: Number(report.summary.totalUsers).toLocaleString("vi-VN") + " thành viên",
          icon: Users,
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <TrendingUp className="text-rose-500" size={30} />
            Báo cáo Thống kê
          </h1>
          <p className="text-zinc-400 mt-1">
            Phân tích doanh thu, lượt bán vé, và hiệu suất hoạt động của hệ thống CineVN.
          </p>
        </div>

        {/* Date filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_RANGES.map((range, i) => (
            <button
              key={i}
              onClick={() => handlePreset(i)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                activePreset === i
                  ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  : "bg-zinc-800/50 text-zinc-400 border-white/5 hover:bg-zinc-700/50 hover:text-zinc-300"
              }`}
            >
              {range.label}
            </button>
          ))}
          <div className="flex items-center gap-1.5 ml-2">
            <Calendar size={14} className="text-zinc-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange("start", e.target.value)}
              className="bg-zinc-800/60 border border-white/5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-rose-500/40 transition-colors"
            />
            <span className="text-zinc-600">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange("end", e.target.value)}
              className="bg-zinc-800/60 border border-white/5 rounded-lg px-2.5 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-rose-500/40 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={20} />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-rose-500" size={36} />
          <span className="ml-3 text-zinc-400">Đang tải dữ liệu thống kê...</span>
        </div>
      )}

      {/* Dashboard content */}
      {!loading && report && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className={`bg-zinc-900/80 backdrop-blur-sm border ${stat.border} p-5 rounded-2xl flex items-center justify-between group hover:scale-[1.02] transition-transform duration-200`}
                >
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-400">{stat.name}</p>
                    <p className="text-2xl font-bold text-white truncate">{stat.value}</p>
                  </div>
                  <div
                    className={`p-3.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon size={22} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Revenue trend chart */}
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-rose-500" size={20} />
              <h2 className="text-lg font-bold text-white">Biểu đồ Doanh thu theo ngày</h2>
            </div>
            <AreaChart data={report.dailyRevenue} />
          </div>

          {/* Bottom row: Cinema bar chart + Movie ranking */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cinema revenue bar chart */}
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Landmark className="text-blue-400" size={20} />
                <h2 className="text-lg font-bold text-white">Doanh thu theo Rạp</h2>
              </div>
              <BarChart data={report.cinemaRevenue} />
            </div>

            {/* Movie revenue ranking */}
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <Film className="text-amber-400" size={20} />
                <h2 className="text-lg font-bold text-white">Xếp hạng Phim bán chạy</h2>
              </div>
              <MovieRankingList data={report.movieRevenue} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
