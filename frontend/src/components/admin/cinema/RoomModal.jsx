import React from "react";
import { Armchair, Save, Lock, Trash2 } from "lucide-react";

export default function RoomModal({
  isOpen,
  onClose,
  editingRoom,
  roomForm,
  setRoomForm,
  seatsGrid,
  selectedTool,
  setSelectedTool,
  handleResizeGrid,
  handleSeatClick,
  onSubmit,
  SEAT_TYPES,
}) {
  // Helper to compute contiguous seat numbers for active/locked physical seats dynamically in the view
  const getSeatNumber = (rowName, colNumber) => {
    let physicalCount = 0;
    for (let c = 1; c <= colNumber; c++) {
      const s = seatsGrid[`${rowName}_${c}`];
      if (s && s.isSeat) {
        physicalCount++;
      }
    }
    return physicalCount;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-3xl rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 relative my-2 sm:my-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <h3 className="text-lg font-extrabold text-white">
            {editingRoom ? `Chỉnh sửa: ${editingRoom.name}` : "Thêm phòng chiếu & Dựng ghế"}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white cursor-pointer font-bold text-xs"
          >
            Đóng
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Step 1: Info config */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-950 p-4 rounded-xl border border-white/5">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tên phòng chiếu *</label>
              <input
                type="text"
                required
                value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                placeholder="Ví dụ: Phòng chiếu 01"
                className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Số hàng ghế (1 - 20)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={roomForm.rowsCount}
                  onChange={(e) => setRoomForm({ ...roomForm, rowsCount: parseInt(e.target.value) || 8 })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Số cột ghế (1 - 20)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={roomForm.colsCount}
                  onChange={(e) => setRoomForm({ ...roomForm, colsCount: parseInt(e.target.value) || 12 })}
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleResizeGrid}
                  className="px-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  Dựng lưới
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Interactive grid editor */}
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Armchair size={16} className="text-rose-500" />
                Trình thiết lập ghế ngồi trực quan
              </h4>
              <p className="text-[11px] text-zinc-400 mt-1">Chọn công cụ loại ghế bên dưới, sau đó bấm lên các ghế trong sơ đồ để sơn màu/đổi thuộc tính.</p>
            </div>

            {/* Premium Control Panel & Legend */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-zinc-950 p-3 rounded-xl border border-white/5">
              {/* Brush Tools Group */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Bộ công cụ sơn (Cọ vẽ):</span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(SEAT_TYPES).map(([type, value]) => {
                    const isActive = selectedTool === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedTool(type)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                          isActive 
                            ? `${value.activeColor} ring-2 ring-rose-500/50 scale-105 shadow-md` 
                            : `${value.color} opacity-80 hover:opacity-100`
                        }`}
                      >
                        <Armchair size={14} />
                        {value.label}
                      </button>
                    );
                  })}
                  
                  {/* Maintenance/Lock Tool */}
                  <button
                    type="button"
                    onClick={() => setSelectedTool("LOCK")}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                      selectedTool === "LOCK"
                        ? "bg-amber-600 border-amber-500 text-white shadow-lg ring-2 ring-amber-500/30 scale-105 shadow-md"
                        : "bg-zinc-800 border-zinc-700 text-amber-500 hover:bg-zinc-700"
                    }`}
                  >
                    <Lock size={14} />
                    Khóa/Bảo trì
                  </button>

                  {/* Corridor Tool */}
                  <button
                    type="button"
                    onClick={() => setSelectedTool("INACTIVE")}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                      selectedTool === "INACTIVE"
                        ? "bg-rose-900 border-rose-500 text-white shadow-lg ring-2 ring-rose-500/30 scale-105 shadow-md"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    <Trash2 size={14} />
                    Lối đi (Xóa ghế)
                  </button>
                </div>
              </div>

              {/* Real-time stats & Color Legend */}
              <div className="flex flex-col gap-2 bg-zinc-900/40 p-3 rounded-xl border border-white/5 lg:min-w-[400px]">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Thống kê sơ đồ & Chú giải:</span>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-zinc-600 border border-zinc-500"></span>
                    <span>Thường: <strong className="text-white">{Object.values(seatsGrid).filter(s => s.isSeat && s.seatType === 'NORMAL').length}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500 border border-amber-400"></span>
                    <span>VIP: <strong className="text-amber-400">{Object.values(seatsGrid).filter(s => s.isSeat && s.seatType === 'VIP').length}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-rose-500 border border-rose-400"></span>
                    <span>Đôi: <strong className="text-rose-400">{Object.values(seatsGrid).filter(s => s.isSeat && s.seatType === 'COUPLE').length}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-red-950 border border-red-500/50"></span>
                    <span>Khóa: <strong className="text-red-400">{Object.values(seatsGrid).filter(s => s.isSeat && !s.isActive).length}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                    <span>Tổng hoạt động: <strong className="text-emerald-400">{Object.values(seatsGrid).filter(s => s.isSeat && s.isActive).length} ghế</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cinema Screen Symbol */}
            <div className="w-full bg-zinc-950 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5 overflow-x-auto">
              <div className="min-w-max flex flex-col items-center justify-center mx-auto py-2 sm:py-4">
                <div className="w-64 md:w-80 h-3 bg-zinc-700 rounded-full shadow-lg shadow-zinc-700/20 text-center text-[9px] font-bold tracking-widest text-zinc-900 uppercase pt-0.5 mb-14 border border-zinc-600">
                  MÀN HÌNH CHIẾU
                </div>

                {/* Render Visual Grid */}
                <div className="grid gap-1.5 sm:grid gap-2 select-none">
                  {Array.from({ length: roomForm.rowsCount }).map((_, rIndex) => {
                    const rowName = String.fromCharCode(65 + rIndex);
                    return (
                      <div key={rowName} className="flex items-center gap-2">
                        {/* Row letter */}
                        <span className="w-6 text-xs font-bold text-rose-500 text-center">{rowName}</span>
                        
                        {/* Columns seats */}
                        <div className="flex gap-1.5 sm:gap-2">
                          {Array.from({ length: roomForm.colsCount }).map((_, cIndex) => {
                            const colNumber = cIndex + 1;
                            const key = `${rowName}_${colNumber}`;
                            const seat = seatsGrid[key];
                            if (!seat) return null;

                            let seatStyle = "";
                            if (seat.isSeat) {
                              if (!seat.isActive) {
                                seatStyle = "bg-red-950/40 border-red-500/50 text-red-500 font-bold hover:bg-red-900/30";
                              } else if (seat.seatType === "VIP") {
                                seatStyle = "bg-amber-500 border-amber-400 text-zinc-950 font-bold";
                              } else if (seat.seatType === "COUPLE") {
                                seatStyle = "bg-rose-500 border-rose-400 text-white font-bold w-10 sm:w-12";
                              } else {
                                seatStyle = "bg-zinc-700 border-zinc-500 text-white";
                              }
                            } else {
                              seatStyle = "bg-zinc-950 border-white/5 text-zinc-800 opacity-20 pointer-events-auto border-dashed";
                            }

                            return (
                              <div
                                key={key}
                                onClick={() => handleSeatClick(key)}
                                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg border text-[9px] sm:text-[10px] flex items-center justify-center transition-all cursor-pointer font-semibold ${seatStyle}`}
                                title={`${rowName}-${getSeatNumber(rowName, colNumber)} (${seat.seatType})${!seat.isActive && seat.isSeat ? ' - Đang Khóa' : ''}`}
                              >
                                {seat.isSeat ? (seat.isActive ? `${getSeatNumber(rowName, colNumber)}` : "🔒") : "X"}
                              </div>
                            );
                          })}
                        </div>

                        {/* Right row letter */}
                        <span className="w-6 text-xs font-bold text-rose-500 text-center">{rowName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all font-semibold text-sm cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all font-bold text-sm cursor-pointer flex items-center gap-2"
            >
              <Save size={16} />
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
