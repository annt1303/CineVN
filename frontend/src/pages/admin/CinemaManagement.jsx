import React, { useState, useEffect } from "react";
import { Info, Landmark, Tv } from "lucide-react";
import { api } from "../../services/api";
import CinemaTab from "../../components/admin/cinema/CinemaTab";
import RoomTab from "../../components/admin/cinema/RoomTab";
import CinemaModal from "../../components/admin/cinema/CinemaModal";
import RoomModal from "../../components/admin/cinema/RoomModal";

const SEAT_TYPES = {
  NORMAL: { label: "Thường", color: "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700", activeColor: "bg-zinc-600 border-zinc-400 text-white" },
  VIP: { label: "VIP", color: "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20", activeColor: "bg-amber-500 border-amber-400 text-black font-bold" },
  COUPLE: { label: "Đôi (Couple)", color: "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20", activeColor: "bg-rose-500 border-rose-400 text-white font-bold" }
};

export default function CinemaManagement() {
  const [activeTab, setActiveTab] = useState("cinemas");
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modals / Form states
  const [showCinemaModal, setShowCinemaModal] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [cinemaForm, setCinemaForm] = useState({ name: "", address: "", description: "" });

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({ name: "", rowsCount: 8, colsCount: 12 });
  const [seatsGrid, setSeatsGrid] = useState({}); // Key: row_col, Val: { rowName, seatNumber, seatType, isActive }
  const [selectedTool, setSelectedTool] = useState("NORMAL"); // NORMAL, VIP, COUPLE, INACTIVE

  // Fetch initial data
  useEffect(() => {
    fetchCinemas();
  }, []);

  useEffect(() => {
    if (selectedCinemaId) {
      fetchRooms(selectedCinemaId);
    } else {
      setRooms([]);
    }
  }, [selectedCinemaId]);

  const fetchCinemas = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/admin/cinemas");
      setCinemas(data);
      if (data.length > 0 && !selectedCinemaId) {
        setSelectedCinemaId(data[0].id.toString());
      }
    } catch (err) {
      setError(err.message || "Không thể tải danh sách rạp");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (cinemaId) => {
    try {
      const data = await api.get(`/api/admin/rooms/cinema/${cinemaId}`);
      setRooms(data);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách phòng chiếu");
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
    }, 4000);
  };

  // Cinema actions
  const handleCinemaSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCinema) {
        await api.put(`/api/admin/cinemas/${editingCinema.id}`, cinemaForm);
        handleShowAlert("Cập nhật cụm rạp thành công!");
      } else {
        await api.post("/api/admin/cinemas", cinemaForm);
        handleShowAlert("Thêm cụm rạp mới thành công!");
      }
      setShowCinemaModal(false);
      setEditingCinema(null);
      setCinemaForm({ name: "", address: "", description: "" });
      fetchCinemas();
    } catch (err) {
      handleShowAlert(err.message, false);
    }
  };

  const handleEditCinema = (cinema) => {
    setEditingCinema(cinema);
    setCinemaForm({
      name: cinema.name,
      address: cinema.address,
      description: cinema.description || ""
    });
    setShowCinemaModal(true);
  };

  const handleDeleteCinema = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa rạp này? Toàn bộ phòng và ghế liên quan sẽ bị xóa!")) return;
    try {
      await api.delete(`/api/admin/cinemas/${id}`);
      handleShowAlert("Xóa rạp thành công!");
      fetchCinemas();
      if (selectedCinemaId === id.toString()) {
        setSelectedCinemaId("");
      }
    } catch (err) {
      handleShowAlert(err.message, false);
    }
  };

  // Generate blank seat grid based on row/col counts
  const generateBlankGrid = (rowsCount, colsCount) => {
    const grid = {};
    for (let r = 0; r < rowsCount; r++) {
      const rowName = String.fromCharCode(65 + r); // A, B, C...
      for (let c = 1; c <= colsCount; c++) {
        grid[`${rowName}_${c}`] = {
          rowName,
          seatNumber: c,
          gridColumn: c,
          seatType: "NORMAL",
          isSeat: true,
          isActive: true
        };
      }
    }
    setSeatsGrid(grid);
  };

  // Load grid for existing room
  const handleLoadRoomGrid = (room) => {
    // Calculate rows and cols count first to establish the grid boundaries
    const rows = room.seats.map(s => s.rowName.charCodeAt(0) - 64);
    const cols = room.seats.map(s => s.gridColumn || s.seatNumber);
    const maxRow = rows.length > 0 ? Math.max(...rows) : 8;
    const maxCol = cols.length > 0 ? Math.max(...cols) : 12;

    const grid = {};
    // Pre-fill entire grid with inactive corridor placeholders
    for (let r = 0; r < maxRow; r++) {
      const rowName = String.fromCharCode(65 + r);
      for (let c = 1; c <= maxCol; c++) {
        grid[`${rowName}_${c}`] = {
          rowName,
          seatNumber: c,
          gridColumn: c,
          seatType: "NORMAL",
          isSeat: false,
          isActive: false
        };
      }
    }

    // Override with actual physical seats from database (can be active or locked)
    room.seats.forEach((seat) => {
      const colIdx = seat.gridColumn || seat.seatNumber;
      grid[`${seat.rowName}_${colIdx}`] = {
        rowName: seat.rowName,
        seatNumber: seat.seatNumber,
        gridColumn: colIdx,
        seatType: seat.seatType,
        isSeat: true,
        isActive: seat.isActive
      };
    });

    setRoomForm({
      name: room.name,
      rowsCount: maxRow,
      colsCount: maxCol
    });
    setSeatsGrid(grid);
  };

  // Handle seat grid resize in modal
  const handleResizeGrid = () => {
    const { rowsCount, colsCount } = roomForm;
    const grid = {};
    for (let r = 0; r < rowsCount; r++) {
      const rowName = String.fromCharCode(65 + r);
      for (let c = 1; c <= colsCount; c++) {
        const key = `${rowName}_${c}`;
        if (seatsGrid[key]) {
          grid[key] = {
            ...seatsGrid[key],
            gridColumn: c
          };
        } else {
          grid[key] = {
            rowName,
            seatNumber: c,
            gridColumn: c,
            seatType: "NORMAL",
            isSeat: false, // New extended areas default to inactive corridors
            isActive: false
          };
        }
      }
    }
    setSeatsGrid(grid);
  };

  const handleOpenAddRoom = () => {
    if (!selectedCinemaId) {
      alert("Vui lòng chọn cụm rạp trước khi thêm phòng!");
      return;
    }
    setEditingRoom(null);
    setRoomForm({ name: "", rowsCount: 8, colsCount: 12 });
    generateBlankGrid(8, 12);
    setShowRoomModal(true);
  };

  const handleOpenEditRoom = (room) => {
    setEditingRoom(room);
    handleLoadRoomGrid(room);
    setShowRoomModal(true);
  };

  // Click handler for seats in visual editor grid
  const handleSeatClick = (key) => {
    const seat = seatsGrid[key];
    if (!seat) return;

    let updated = { ...seat };
    if (selectedTool === "INACTIVE") {
      // Turn into corridor (completely remove seat)
      updated.isSeat = false;
      updated.isActive = false;
    } else if (selectedTool === "LOCK") {
      // Toggle active status (Lock / Unlock) for physical seats
      if (seat.isSeat) {
        updated.isActive = !updated.isActive;
      } else {
        // If it was a corridor, turn it into a locked seat
        updated.isSeat = true;
        updated.isActive = false;
        updated.seatType = "NORMAL";
      }
    } else {
      // Paint brush: Set type and make physical, active
      updated.isSeat = true;
      updated.isActive = true;
      updated.seatType = selectedTool;
    }

    setSeatsGrid({
      ...seatsGrid,
      [key]: updated
    });
  };

  // Room submit (Save seats layout)
  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    if (!roomForm.name.trim()) {
      handleShowAlert("Vui lòng nhập tên phòng!", false);
      return;
    }

    // Re-calculate contiguous seatNumber for all physical seats (active or locked) in each row before submitting
    const seatsArray = [];
    for (let r = 0; r < roomForm.rowsCount; r++) {
      const rowName = String.fromCharCode(65 + r);
      let physicalSeatCounter = 1;
      
      for (let c = 1; c <= roomForm.colsCount; c++) {
        const key = `${rowName}_${c}`;
        const seat = seatsGrid[key];
        
        // Save physical seats (both active and locked) to the database
        if (seat && seat.isSeat) {
          const updatedSeat = { ...seat };
          updatedSeat.gridColumn = c; // Save the visual column index
          updatedSeat.seatNumber = physicalSeatCounter;
          physicalSeatCounter++;
          seatsArray.push(updatedSeat);
        }
      }
    }

    const body = {
      name: roomForm.name,
      cinemaId: parseInt(selectedCinemaId),
      seats: seatsArray
    };

    try {
      if (editingRoom) {
        await api.put(`/api/admin/rooms/${editingRoom.id}`, body);
        handleShowAlert("Cập nhật phòng chiếu và sơ đồ ghế thành công!");
      } else {
        await api.post("/api/admin/rooms", body);
        handleShowAlert("Thêm phòng chiếu và sơ đồ ghế mới thành công!");
      }
      setShowRoomModal(false);
      setEditingRoom(null);
      fetchRooms(selectedCinemaId);
    } catch (err) {
      handleShowAlert(err.message, false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phòng chiếu này?")) return;
    try {
      await api.delete(`/api/admin/rooms/${roomId}`);
      handleShowAlert("Xóa phòng thành công!");
      fetchRooms(selectedCinemaId);
    } catch (err) {
      handleShowAlert(err.message, false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and alert */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Quản lý Rạp & Phòng chiếu</h1>
          <p className="text-zinc-400 mt-1">Cấu hình hệ thống rạp chiếu phim toàn quốc và sơ đồ ghế ngồi phòng chiếu.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center gap-2">
          <Info size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl flex items-center gap-2">
          <Info size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5">
        <button
          onClick={() => setActiveTab("cinemas")}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === "cinemas"
              ? "border-rose-600 text-white"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Landmark size={18} />
          Cụm rạp ({cinemas.length})
        </button>
        <button
          onClick={() => setActiveTab("rooms")}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === "rooms"
              ? "border-rose-600 text-white"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          <Tv size={18} />
          Phòng chiếu & Sơ đồ ghế
        </button>
      </div>

      {/* Tab contents */}
      {activeTab === "cinemas" ? (
        <CinemaTab
          cinemas={cinemas}
          onAddCinema={() => {
            setEditingCinema(null);
            setCinemaForm({ name: "", address: "", description: "" });
            setShowCinemaModal(true);
          }}
          onEditCinema={handleEditCinema}
          onDeleteCinema={handleDeleteCinema}
        />
      ) : (
        <RoomTab
          cinemas={cinemas}
          selectedCinemaId={selectedCinemaId}
          setSelectedCinemaId={setSelectedCinemaId}
          rooms={rooms}
          onAddRoom={handleOpenAddRoom}
          onEditRoom={handleOpenEditRoom}
          onDeleteRoom={handleDeleteRoom}
        />
      )}

      {/* Modal overlays */}
      <CinemaModal
        isOpen={showCinemaModal}
        onClose={() => setShowCinemaModal(false)}
        editingCinema={editingCinema}
        cinemaForm={cinemaForm}
        setCinemaForm={setCinemaForm}
        onSubmit={handleCinemaSubmit}
      />

      <RoomModal
        isOpen={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        editingRoom={editingRoom}
        roomForm={roomForm}
        setRoomForm={setRoomForm}
        seatsGrid={seatsGrid}
        setSeatsGrid={setSeatsGrid}
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        handleResizeGrid={handleResizeGrid}
        handleSeatClick={handleSeatClick}
        onSubmit={handleRoomSubmit}
        SEAT_TYPES={SEAT_TYPES}
      />
    </div>
  );
}
