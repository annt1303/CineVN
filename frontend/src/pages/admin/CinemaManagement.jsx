import React from "react";
import CinemaTab from "../../components/admin/cinema/CinemaTab";
import RoomTab from "../../components/admin/cinema/RoomTab";
import CinemaModal from "../../components/admin/cinema/CinemaModal";
import RoomModal from "../../components/admin/cinema/RoomModal";
import PageHeader from "../../components/admin/cinema/PageHeader";
import TabsMenu from "../../components/admin/cinema/TabsMenu";
import useCinemaManagement from "../../hooks/useCinemaManagement";

const SEAT_TYPES = {
  NORMAL: { label: "Thường", color: "bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700", activeColor: "bg-zinc-600 border-zinc-400 text-white" },
  VIP: { label: "VIP", color: "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20", activeColor: "bg-amber-500 border-amber-400 text-black font-bold" },
  COUPLE: { label: "Đôi (Couple)", color: "bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20", activeColor: "bg-rose-500 border-rose-400 text-white font-bold" }
};

export default function CinemaManagement() {
  const {
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
  } = useCinemaManagement();

  return (
    <div className="space-y-8">
      {/* Header and alert */}
      <PageHeader
        title="Quản lý Rạp & Phòng chiếu"
        subtitle="Cấu hình hệ thống rạp chiếu phim toàn quốc và sơ đồ ghế ngồi phòng chiếu."
        successMsg={successMsg}
        error={error}
      />

      {/* Tabs Menu */}
      <TabsMenu
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cinemasCount={cinemas.length}
      />

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
