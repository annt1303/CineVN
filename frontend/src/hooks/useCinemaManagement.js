import { useState, useEffect } from "react";
import { api } from "../services/api";

export default function useCinemaManagement() {
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
  const [roomForm, setRoomForm] = useState({ name: "", rowsCount: 8, colsCount: 12, roomType: "STANDARD" });
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

    // Mark span placeholders for couple seats
    room.seats.forEach((seat) => {
      if (seat.seatType === "COUPLE") {
        const colIdx = seat.gridColumn || seat.seatNumber;
        const neighborIdx = colIdx + 1;
        if (neighborIdx <= maxCol) {
          grid[`${seat.rowName}_${neighborIdx}`] = {
            ...grid[`${seat.rowName}_${neighborIdx}`],
            isSeat: false,
            isActive: false,
            isSpanPlaceholder: true,
            spanParent: `${seat.rowName}_${colIdx}`
          };
        }
      }
    });

    setRoomForm({
      name: room.name,
      rowsCount: maxRow,
      colsCount: maxCol,
      roomType: room.roomType || "STANDARD"
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
    setRoomForm({ name: "", rowsCount: 8, colsCount: 12, roomType: "STANDARD" });
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

    const [rowName, colStr] = key.split("_");
    const c = parseInt(colStr);
    let updatedGrid = { ...seatsGrid };

    // Helper to clean up couple associations for a cell
    const cleanCouple = (grid, rName, colIdx) => {
      const currentKey = `${rName}_${colIdx}`;
      const currentSeat = grid[currentKey];
      if (!currentSeat) return;

      // Case A: This seat was a COUPLE seat. Its partner was at colIdx + 1.
      if (currentSeat.seatType === "COUPLE") {
        const partnerKey = `${rName}_${colIdx + 1}`;
        const partner = grid[partnerKey];
        if (partner && partner.isSpanPlaceholder && partner.spanParent === currentKey) {
          grid[partnerKey] = {
            ...partner,
            isSeat: true,
            isActive: true,
            seatType: "NORMAL",
            isSpanPlaceholder: false,
            spanParent: null
          };
        }
      }

      // Case B: This seat was a placeholder for a COUPLE seat at colIdx - 1.
      if (currentSeat.isSpanPlaceholder && currentSeat.spanParent) {
        const parentKey = currentSeat.spanParent;
        const parent = grid[parentKey];
        if (parent && parent.seatType === "COUPLE") {
          grid[parentKey] = {
            ...parent,
            seatType: "NORMAL"
          };
        }
        grid[currentKey] = {
          ...currentSeat,
          isSeat: true,
          isActive: true,
          seatType: "NORMAL",
          isSpanPlaceholder: false,
          spanParent: null
        };
      }
    };

    if (selectedTool === "COUPLE") {
      const neighborKey = `${rowName}_${c + 1}`;
      const neighborSeat = seatsGrid[neighborKey];

      if (!neighborSeat) {
        alert("Không thể tạo ghế đôi ở mép ngoài cùng bên phải!");
        return;
      }

      // Clean couple associations for both seats before pairing them
      cleanCouple(updatedGrid, rowName, c);
      cleanCouple(updatedGrid, rowName, c + 1);

      // Now pair them
      updatedGrid[key] = {
        ...updatedGrid[key],
        isSeat: true,
        isActive: true,
        seatType: "COUPLE",
        isSpanPlaceholder: false,
      };

      updatedGrid[neighborKey] = {
        ...updatedGrid[neighborKey],
        isSeat: false,
        isActive: false,
        isSpanPlaceholder: true,
        spanParent: key,
      };
    } else {
      // For any tool other than LOCK, if we are editing a seat, clean up its couple associations
      if (selectedTool !== "LOCK") {
        cleanCouple(updatedGrid, rowName, c);
      }

      let updated = { ...updatedGrid[key] };
      if (selectedTool === "INACTIVE") {
        // Turn into corridor (completely remove seat)
        updated.isSeat = false;
        updated.isActive = false;
      } else if (selectedTool === "LOCK") {
        // Toggle active status (Lock / Unlock) for physical seats
        if (updated.isSeat) {
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
      updatedGrid[key] = updated;
    }

    setSeatsGrid(updatedGrid);
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
      roomType: roomForm.roomType,
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

  return {
    activeTab,
    setActiveTab,
    cinemas,
    rooms,
    selectedCinemaId,
    setSelectedCinemaId,
    loading,
    error,
    successMsg,
    showCinemaModal,
    setShowCinemaModal,
    editingCinema,
    setEditingCinema,
    cinemaForm,
    setCinemaForm,
    showRoomModal,
    setShowRoomModal,
    editingRoom,
    setEditingRoom,
    roomForm,
    setRoomForm,
    seatsGrid,
    setSeatsGrid,
    selectedTool,
    setSelectedTool,
    handleCinemaSubmit,
    handleEditCinema,
    handleDeleteCinema,
    handleOpenAddRoom,
    handleOpenEditRoom,
    handleResizeGrid,
    handleSeatClick,
    handleRoomSubmit,
    handleDeleteRoom
  };
}
