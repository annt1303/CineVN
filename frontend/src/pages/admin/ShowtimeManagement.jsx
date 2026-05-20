import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Coins, 
  Plus, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  Check, 
  X, 
  Info, 
  Filter, 
  DollarSign, 
  Film,
  Building
} from "lucide-react";
import { api } from "../../services/api";

const MOVIE_FORMATS = ["FORMAT_2D", "FORMAT_3D", "FORMAT_IMAX", "FORMAT_4DX"];
const ROOM_TYPES = ["STANDARD", "IMAX", "GOLD_CLASS", "DELUXE"];
const TIME_SLOTS = [
  { value: "DAYTIME", label: "Ban ngày (Trước 17h)" },
  { value: "EVENING", label: "Buổi tối (Từ 17h)" }
];

export default function ShowtimeManagement() {
  const [activeTab, setActiveTab] = useState("showtimes");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Data list states
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [baseConfigs, setBaseConfigs] = useState([]);
  const [surcharges, setSurcharges] = useState([]);

  // Filter states
  const [filterCinemaId, setFilterCinemaId] = useState("");
  const [filterRoomId, setFilterRoomId] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Showtime Modal State
  const [showtimeModalOpen, setShowtimeModalOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [showtimeForm, setShowtimeForm] = useState({
    movieId: "",
    cinemaId: "",
    screenRoomId: "",
    movieFormat: "FORMAT_2D",
    startTime: "",
    basePrice: "",
    isActive: true
  });
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  const [estimatedEndTime, setEstimatedEndTime] = useState("");

  // BasePriceConfig Modal State
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [configForm, setConfigForm] = useState({
    roomType: "STANDARD",
    movieFormat: "FORMAT_2D",
    isWeekend: false,
    timeSlot: "DAYTIME",
    basePrice: ""
  });

  // Surcharge Inline Edit State
  const [editingSurchargeId, setEditingSurchargeId] = useState(null);
  const [editingSurchargeValue, setEditingSurchargeValue] = useState("");

  // Fetch initial collections
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch rooms when cinema changes in showtime modal
  useEffect(() => {
    if (showtimeForm.cinemaId) {
      fetchRoomsForCinema(showtimeForm.cinemaId);
    } else {
      setRooms([]);
    }
  }, [showtimeForm.cinemaId]);

  // Trigger price calculation when dynamic parameters change in showtime form
  useEffect(() => {
    if (showtimeForm.screenRoomId && showtimeForm.movieFormat && showtimeForm.startTime) {
      calculateSuggestedPrice();
    }
  }, [showtimeForm.screenRoomId, showtimeForm.movieFormat, showtimeForm.startTime]);

  // Calculate estimated end time on form changes
  useEffect(() => {
    if (showtimeForm.movieId && showtimeForm.startTime) {
      const movie = movies.find(m => m.id.toString() === showtimeForm.movieId.toString());
      if (movie) {
        const start = new Date(showtimeForm.startTime);
        const end = new Date(start.getTime() + movie.duration * 60000);
        setEstimatedEndTime(end.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
      }
    } else {
      setEstimatedEndTime("");
    }
  }, [showtimeForm.movieId, showtimeForm.startTime]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [moviesData, cinemasData, configsData, surchargesData] = await Promise.all([
        api.get("/api/admin/movies"),
        api.get("/api/admin/cinemas"),
        api.get("/api/admin/pricing/base-price-configs"),
        api.get("/api/admin/pricing/seat-type-prices")
      ]);
      setMovies(moviesData);
      setCinemas(cinemasData);
      setBaseConfigs(configsData);
      setSurcharges(surchargesData);

      // Pre-select first cinema for filtering if available
      if (cinemasData.length > 0) {
        setFilterCinemaId(cinemasData[0].id.toString());
        fetchFilterRooms(cinemasData[0].id.toString());
      }
      
      // Default filter date to today
      const todayStr = new Date().toISOString().split("T")[0];
      setFilterDate(todayStr);

      await fetchShowtimes();
    } catch (err) {
      setError("Không thể đồng bộ dữ liệu ban đầu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchShowtimes = async () => {
    try {
      const data = await api.get("/api/admin/showtimes");
      setShowtimes(data);
    } catch (err) {
      setError("Không thể tải danh sách lịch chiếu: " + err.message);
    }
  };

  const fetchRoomsForCinema = async (cinemaId) => {
    try {
      const data = await api.get(`/api/admin/rooms/cinema/${cinemaId}`);
      setRooms(data);
    } catch (err) {
      setError("Không thể tải phòng chiếu: " + err.message);
    }
  };

  const [filterRooms, setFilterRooms] = useState([]);
  const fetchFilterRooms = async (cinemaId) => {
    try {
      const data = await api.get(`/api/admin/rooms/cinema/${cinemaId}`);
      setFilterRooms(data);
      setFilterRoomId(""); // reset selection
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowAlert = (msg, isSuccess = true) => {
    if (isSuccess) {
      setSuccessMsg(msg);
      setError("");
    } else {
      setError(msg);
      setSuccessMsg("");
    }
    setTimeout(() => {
      setSuccessMsg("");
      setError("");
    }, 4500);
  };

  const calculateSuggestedPrice = async () => {
    const selectedRoom = rooms.find(r => r.id.toString() === showtimeForm.screenRoomId.toString());
    if (!selectedRoom) return;

    try {
      // ISO Format: YYYY-MM-DDTHH:mm:ss
      // HTML input date returns YYYY-MM-DDTHH:mm, we append :00
      const startTimeIso = showtimeForm.startTime.length === 16 ? `${showtimeForm.startTime}:00` : showtimeForm.startTime;
      const price = await api.get(
        `/api/admin/showtimes/calculate-price?roomType=${selectedRoom.roomType}&movieFormat=${showtimeForm.movieFormat}&startTime=${startTimeIso}`
      );
      setSuggestedPrice(price);
      // Pre-fill the price input if it's empty or matching previous suggestion
      if (!showtimeForm.basePrice || showtimeForm.basePrice === suggestedPrice?.toString()) {
        setShowtimeForm(prev => ({ ...prev, basePrice: price }));
      }
    } catch (err) {
      console.error("Lỗi tính toán giá gợi ý:", err);
    }
  };

  // =========================================================================
  // Showtime Actions
  // =========================================================================
  const handleShowtimeSubmit = async (e) => {
    e.preventDefault();
    if (!showtimeForm.movieId || !showtimeForm.screenRoomId || !showtimeForm.startTime || !showtimeForm.basePrice) {
      handleShowAlert("Vui lòng điền đầy đủ các thông tin bắt buộc!", false);
      return;
    }

    const payload = {
      movieId: parseInt(showtimeForm.movieId),
      screenRoomId: parseInt(showtimeForm.screenRoomId),
      startTime: showtimeForm.startTime.length === 16 ? `${showtimeForm.startTime}:00` : showtimeForm.startTime,
      movieFormat: showtimeForm.movieFormat,
      basePrice: parseFloat(showtimeForm.basePrice),
      isActive: showtimeForm.isActive
    };

    try {
      if (editingShowtime) {
        await api.put(`/api/admin/showtimes/${editingShowtime.id}`, payload);
        handleShowAlert("Cập nhật lịch chiếu thành công!");
      } else {
        await api.post("/api/admin/showtimes", payload);
        handleShowAlert("Tạo lịch chiếu mới thành công!");
      }
      setShowtimeModalOpen(false);
      setEditingShowtime(null);
      setSuggestedPrice(null);
      fetchShowtimes();
    } catch (err) {
      handleShowAlert("Không thể lưu lịch chiếu: " + err.message, false);
    }
  };

  const handleEditShowtime = (st) => {
    setEditingShowtime(st);
    // Find cinema from screenRoom
    setShowtimeForm({
      movieId: st.movieId.toString(),
      cinemaId: st.cinemaId.toString(),
      screenRoomId: st.screenRoomId.toString(),
      movieFormat: st.movieFormat,
      startTime: st.startTime.substring(0, 16), // YYYY-MM-DDTHH:mm
      basePrice: st.basePrice.toString(),
      isActive: st.isActive
    });
    setShowtimeModalOpen(true);
  };

  const handleDeleteShowtime = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy lịch chiếu này?")) return;
    try {
      await api.delete(`/api/admin/showtimes/${id}`);
      handleShowAlert("Hủy lịch chiếu thành công!");
      fetchShowtimes();
    } catch (err) {
      handleShowAlert("Không thể xóa lịch chiếu: " + err.message, false);
    }
  };

  // =========================================================================
  // Base Price Config Actions
  // =========================================================================
  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    if (!configForm.basePrice) {
      handleShowAlert("Vui lòng nhập giá vé cơ bản!", false);
      return;
    }

    const payload = {
      ...configForm,
      basePrice: parseFloat(configForm.basePrice)
    };

    try {
      if (editingConfig) {
        await api.put(`/api/admin/pricing/base-price-configs/${editingConfig.id}`, payload);
        handleShowAlert("Cập nhật cấu hình giá thành công!");
      } else {
        await api.post("/api/admin/pricing/base-price-configs", payload);
        handleShowAlert("Thêm cấu hình giá thành công!");
      }
      setConfigModalOpen(false);
      setEditingConfig(null);
      // Fetch fresh configs
      const configsData = await api.get("/api/admin/pricing/base-price-configs");
      setBaseConfigs(configsData);
    } catch (err) {
      handleShowAlert("Lỗi cấu hình giá: " + err.message, false);
    }
  };

  const handleEditConfig = (cfg) => {
    setEditingConfig(cfg);
    setConfigForm({
      roomType: cfg.roomType,
      movieFormat: cfg.movieFormat,
      isWeekend: cfg.isWeekend,
      timeSlot: cfg.timeSlot,
      basePrice: cfg.basePrice.toString()
    });
    setConfigModalOpen(true);
  };

  const handleDeleteConfig = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cấu hình giá này?")) return;
    try {
      await api.delete(`/api/admin/pricing/base-price-configs/${id}`);
      handleShowAlert("Xóa cấu hình giá thành công!");
      const configsData = await api.get("/api/admin/pricing/base-price-configs");
      setBaseConfigs(configsData);
    } catch (err) {
      handleShowAlert(err.message, false);
    }
  };

  // =========================================================================
  // Surcharge Inline Actions
  // =========================================================================
  const startEditingSurcharge = (item) => {
    setEditingSurchargeId(item.id);
    setEditingSurchargeValue(item.surcharge.toString());
  };

  const saveSurcharge = async (id, seatType) => {
    if (isNaN(parseFloat(editingSurchargeValue)) || parseFloat(editingSurchargeValue) < 0) {
      handleShowAlert("Giá trị phụ thu không hợp lệ!", false);
      return;
    }

    try {
      await api.put(`/api/admin/pricing/seat-type-prices/${id}`, {
        seatType: seatType,
        surcharge: parseFloat(editingSurchargeValue)
      });
      handleShowAlert("Cập nhật phụ thu ghế thành công!");
      setEditingSurchargeId(null);
      // Refetch surcharges
      const surchargesData = await api.get("/api/admin/pricing/seat-type-prices");
      setSurcharges(surchargesData);
    } catch (err) {
      handleShowAlert("Không thể cập nhật phụ thu: " + err.message, false);
    }
  };

  // Helper formatting values
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeFormatted = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    return `${timeFormatted} ${dateFormatted}`;
  };

  // Filtering showtimes for display
  const filteredShowtimes = showtimes.filter(st => {
    if (filterCinemaId && st.cinemaId?.toString() !== filterCinemaId.toString()) return false;
    if (filterRoomId && st.screenRoomId?.toString() !== filterRoomId.toString()) return false;
    if (filterDate) {
      const showtimeDay = st.startTime.substring(0, 10);
      if (showtimeDay !== filterDate) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Calendar className="text-rose-500" size={32} />
            Quản lý Lịch chiếu & Cấu hình Giá vé
          </h1>
          <p className="text-zinc-400 mt-1">
            Lập lịch biểu chiếu phim và thiết lập hệ thống định giá vé động tự động theo rạp, khung giờ và loại ghế.
          </p>
        </div>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
          <Info size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
          <Info size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-white/5">
        <button
          onClick={() => setActiveTab("showtimes")}
          className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === "showtimes"
              ? "border-rose-600 text-white"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Clock size={18} />
          Lịch chiếu suất chiếu
        </button>
        <button
          onClick={() => setActiveTab("basePrices")}
          className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === "basePrices"
              ? "border-rose-600 text-white"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Coins size={18} />
          Ma trận Giá gốc
        </button>
        <button
          onClick={() => setActiveTab("surcharges")}
          className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === "surcharges"
              ? "border-rose-600 text-white"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <DollarSign size={18} />
          Phụ thu Loại ghế
        </button>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div>
          <span className="ml-3 text-zinc-400">Đang tải dữ liệu...</span>
        </div>
      )}

      {/* TAB CONTENT: SHOWTIMES LIST */}
      {!loading && activeTab === "showtimes" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-zinc-900 border border-white/5 p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Cụm rạp</label>
                <select
                  value={filterCinemaId}
                  onChange={(e) => {
                    setFilterCinemaId(e.target.value);
                    fetchFilterRooms(e.target.value);
                  }}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="">Tất cả cụm rạp</option>
                  {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Phòng chiếu</label>
                <select
                  value={filterRoomId}
                  onChange={(e) => setFilterRoomId(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                  disabled={!filterCinemaId}
                >
                  <option value="">Tất cả phòng chiếu</option>
                  {filterRooms.map(r => <option key={r.id} value={r.id}>{r.name} ({r.roomType})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Ngày chiếu</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setEditingShowtime(null);
                setShowtimeForm({
                  movieId: "",
                  cinemaId: cinemas.length > 0 ? cinemas[0].id.toString() : "",
                  screenRoomId: "",
                  movieFormat: "FORMAT_2D",
                  startTime: "",
                  basePrice: "",
                  isActive: true
                });
                setSuggestedPrice(null);
                setShowtimeModalOpen(true);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer h-10 w-full md:w-auto justify-center"
            >
              <Plus size={16} />
              Thêm lịch chiếu
            </button>
          </div>

          {/* Showtimes Table/Grid */}
          {filteredShowtimes.length === 0 ? (
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-12 text-center text-zinc-500">
              <Calendar className="mx-auto text-zinc-600 mb-3" size={32} />
              Không có suất chiếu nào được lên lịch cho các bộ lọc này.
            </div>
          ) : (
            <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Phim</th>
                      <th className="px-6 py-4">Phòng / Rạp</th>
                      <th className="px-6 py-4">Định dạng</th>
                      <th className="px-6 py-4">Thời gian</th>
                      <th className="px-6 py-4">Giá gốc</th>
                      <th className="px-6 py-4">Trạng thái</th>
                      <th className="px-6 py-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-zinc-300">
                    {filteredShowtimes.map((st) => (
                      <tr key={st.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white max-w-[240px] truncate">
                          {st.movieTitle}
                        </td>
                        <td className="px-6 py-4">
                          <span className="block font-medium text-white">{st.screenRoomName}</span>
                          <span className="block text-xs text-zinc-500">{st.cinemaName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-rose-600/10 border border-rose-500/20 text-rose-500 font-bold px-2 py-0.5 rounded text-xs">
                            {st.movieFormat.replace("FORMAT_", "")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="block font-medium text-white">{st.startTime.substring(11, 16)} - {st.endTime.substring(11, 16)}</span>
                          <span className="block text-xs text-zinc-500">{st.startTime.substring(0, 10)}</span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-400">
                          {formatCurrency(st.basePrice)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            st.isActive 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                          }`}>
                            {st.isActive ? "Hoạt động" : "Hủy chiếu"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditShowtime(st)}
                              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                              title="Sửa lịch chiếu"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteShowtime(st.id)}
                              className="p-1.5 hover:bg-rose-950/30 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                              title="Hủy/Xóa suất chiếu"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: BASE PRICE CONFIGS */}
      {!loading && activeTab === "basePrices" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-zinc-900 border border-white/5 p-5 rounded-2xl">
            <div>
              <h2 className="text-xl font-bold text-white">Bảng Giá Vé Cơ Bản</h2>
              <p className="text-xs text-zinc-400 mt-1">Cấu hình ma trận giá vé gốc tự động theo định dạng phòng, phim, cuối tuần và khung giờ.</p>
            </div>
            <button
              onClick={() => {
                setEditingConfig(null);
                setConfigForm({
                  roomType: "STANDARD",
                  movieFormat: "FORMAT_2D",
                  isWeekend: false,
                  timeSlot: "DAYTIME",
                  basePrice: ""
                });
                setConfigModalOpen(true);
              }}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer h-10"
            >
              <PlusCircle size={16} />
              Thêm giá gốc
            </button>
          </div>

          <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Loại phòng</th>
                  <th className="px-6 py-4">Định dạng phim</th>
                  <th className="px-6 py-4">Thời điểm</th>
                  <th className="px-6 py-4">Khung giờ</th>
                  <th className="px-6 py-4">Giá vé cơ sở</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-zinc-300">
                {baseConfigs.map((cfg) => (
                  <tr key={cfg.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{cfg.roomType}</td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded text-xs font-mono">
                        {cfg.movieFormat}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {cfg.isWeekend ? (
                        <span className="text-amber-400 font-medium">Cuối tuần (T7-CN)</span>
                      ) : (
                        <span className="text-zinc-500">Trong tuần (T2-T6)</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {cfg.timeSlot === "DAYTIME" ? "Ban ngày (Trước 17h)" : "Buổi tối (Từ 17h)"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-rose-500">{formatCurrency(cfg.basePrice)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditConfig(cfg)}
                          className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteConfig(cfg.id)}
                          className="p-1.5 hover:bg-rose-950/30 rounded-lg text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SEAT SURCHARGES */}
      {!loading && activeTab === "surcharges" && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-zinc-900 border border-white/5 p-5 rounded-2xl">
            <h2 className="text-xl font-bold text-white">Phụ thu Phân loại Ghế</h2>
            <p className="text-xs text-zinc-400 mt-1">Phụ thu cộng thêm vào giá vé gốc của suất chiếu dựa theo loại ghế ngồi vật lý.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {surcharges.map((item) => (
              <div 
                key={item.id} 
                className="bg-zinc-900 border border-white/5 p-6 rounded-2xl flex items-center justify-between transition-all hover:border-white/10"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${
                      item.seatType === "COUPLE" ? "bg-rose-500" : item.seatType === "VIP" ? "bg-amber-500" : "bg-zinc-500"
                    }`} />
                    <h3 className="font-extrabold text-white text-lg">{item.seatType}</h3>
                  </div>
                  <p className="text-zinc-500 text-xs mt-1">
                    {item.seatType === "NORMAL" && "Ghế ngồi tiêu chuẩn, không phụ thu thêm."}
                    {item.seatType === "VIP" && "Ghế VIP ở vị trí trung tâm, có góc nhìn tốt nhất."}
                    {item.seatType === "COUPLE" && "Ghế đôi dành cho các cặp đôi tại hàng ghế cuối phòng chiếu."}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {editingSurchargeId === item.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editingSurchargeValue}
                        onChange={(e) => setEditingSurchargeValue(e.target.value)}
                        className="bg-zinc-950 border border-white/15 rounded-xl px-4 py-2 w-32 text-right font-semibold text-white focus:outline-none focus:border-rose-500"
                        placeholder="Số tiền"
                      />
                      <button
                        onClick={() => saveSurcharge(item.id, item.seatType)}
                        className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl cursor-pointer"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingSurchargeId(null)}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-extrabold text-white text-xl">
                        + {formatCurrency(item.surcharge)}
                      </span>
                      {item.seatType !== "NORMAL" && (
                        <button
                          onClick={() => startEditingSurcharge(item)}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl cursor-pointer transition-all"
                        >
                          Thay đổi
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SHOWTIME MODAL
      ========================================================================= */}
      {showtimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-8">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-zinc-900/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="text-rose-500" size={18} />
                {editingShowtime ? "Cập Nhật Lịch Chiếu" : "Tạo Mới Lịch Chiếu"}
              </h3>
              <button 
                onClick={() => setShowtimeModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleShowtimeSubmit} className="p-6 space-y-4">
              {/* Select Movie */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Bộ Phim *</label>
                <select
                  value={showtimeForm.movieId}
                  onChange={(e) => setShowtimeForm(prev => ({ ...prev, movieId: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500"
                  required
                >
                  <option value="">Chọn phim...</option>
                  {movies.map(m => (
                    <option key={m.id} value={m.id}>{m.title} ({m.duration} phút)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Cinema */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Cụm Rạp *</label>
                  <select
                    value={showtimeForm.cinemaId}
                    onChange={(e) => setShowtimeForm(prev => ({ ...prev, cinemaId: e.target.value, screenRoomId: "" }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500"
                    required
                  >
                    <option value="">Chọn cụm rạp...</option>
                    {cinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Select Screen Room */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Phòng Chiếu *</label>
                  <select
                    value={showtimeForm.screenRoomId}
                    onChange={(e) => setShowtimeForm(prev => ({ ...prev, screenRoomId: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500"
                    disabled={!showtimeForm.cinemaId}
                    required
                  >
                    <option value="">Chọn phòng...</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.roomType})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Movie Format */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Định dạng chiếu *</label>
                  <select
                    value={showtimeForm.movieFormat}
                    onChange={(e) => setShowtimeForm(prev => ({ ...prev, movieFormat: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500"
                    required
                  >
                    {MOVIE_FORMATS.map(f => (
                      <option key={f} value={f}>{f.replace("FORMAT_", "")}</option>
                    ))}
                  </select>
                </div>

                {/* Start Time */}
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Giờ Bắt Đầu *</label>
                  <input
                    type="datetime-local"
                    value={showtimeForm.startTime}
                    onChange={(e) => setShowtimeForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500"
                    required
                  />
                  {estimatedEndTime && (
                    <span className="text-zinc-500 text-xs mt-1 block">
                      Kết thúc dự kiến: {estimatedEndTime} (gồm 20p dọn phòng tiếp theo)
                    </span>
                  )}
                </div>
              </div>

              {/* Price Setup */}
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-zinc-400">Giá đề xuất ma trận:</span>
                  <span className="text-sm font-extrabold text-emerald-400">
                    {suggestedPrice ? formatCurrency(suggestedPrice) : "Chờ nhập đủ thông tin..."}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Giá vé gốc áp dụng *</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={showtimeForm.basePrice}
                      onChange={(e) => setShowtimeForm(prev => ({ ...prev, basePrice: e.target.value }))}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm font-semibold text-white focus:outline-none focus:border-rose-500"
                      placeholder="Chọn rạp, phòng và giờ để tự động điền hoặc nhập tay..."
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">VND</span>
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="st-active"
                  checked={showtimeForm.isActive}
                  onChange={(e) => setShowtimeForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-zinc-700 bg-zinc-900 text-rose-500 focus:ring-rose-500/50 focus:ring-offset-black w-4 h-4 cursor-pointer"
                />
                <label htmlFor="st-active" className="text-sm text-zinc-300 select-none cursor-pointer">
                  Mở lịch chiếu hoạt động công cộng
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowtimeModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm rounded-xl cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl cursor-pointer transition-colors"
                >
                  {editingShowtime ? "Cập nhật" : "Tạo suất chiếu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          BASE PRICE CONFIG MODAL
      ========================================================================= */}
      {configModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-8">
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-zinc-900/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Coins className="text-rose-500" size={18} />
                {editingConfig ? "Cập Nhật Cấu Hình Giá" : "Thêm Cấu Hình Giá Gốc"}
              </h3>
              <button 
                onClick={() => setConfigModalOpen(false)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfigSubmit} className="p-6 space-y-4">
              {/* Room Type */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Loại phòng</label>
                <select
                  value={configForm.roomType}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, roomType: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Movie Format */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Định dạng phim</label>
                <select
                  value={configForm.movieFormat}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, movieFormat: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  {MOVIE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>

              {/* Weekend indicator */}
              <div className="flex items-center justify-between bg-zinc-900/40 border border-white/5 p-3.5 rounded-xl">
                <div>
                  <span className="block text-sm font-semibold text-white">Áp dụng cuối tuần</span>
                  <span className="block text-xs text-zinc-500">Chỉ kích hoạt vào Thứ 7 và Chủ nhật</span>
                </div>
                <input
                  type="checkbox"
                  checked={configForm.isWeekend}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, isWeekend: e.target.checked }))}
                  className="rounded border-zinc-700 bg-zinc-900 text-rose-500 focus:ring-rose-500/50 focus:ring-offset-black w-5 h-5 cursor-pointer"
                />
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Khung giờ suất chiếu</label>
                <select
                  value={configForm.timeSlot}
                  onChange={(e) => setConfigForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  {TIME_SLOTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              {/* Base Price input */}
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Giá vé gốc cơ bản *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={configForm.basePrice}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, basePrice: e.target.value }))}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm font-semibold text-white focus:outline-none focus:border-rose-500"
                    placeholder="E.g., 80000"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">VND</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setConfigModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm rounded-xl cursor-pointer transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl cursor-pointer transition-colors"
                >
                  {editingConfig ? "Cập nhật" : "Thêm cấu hình"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
