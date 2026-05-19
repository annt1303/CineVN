import React from "react";
import { Plus, Edit2, Trash2, Tv } from "lucide-react";

export default function RoomTab({
  cinemas,
  selectedCinemaId,
  setSelectedCinemaId,
  rooms,
  onAddRoom,
  onEditRoom,
  onDeleteRoom,
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-400">Chọn cụm rạp:</span>
          <select
            value={selectedCinemaId}
            onChange={(e) => setSelectedCinemaId(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-rose-500 transition-colors cursor-pointer"
          >
            {cinemas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onAddRoom}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl transition-all cursor-pointer font-bold text-sm self-start sm:self-auto"
        >
          <Plus size={16} />
          Thêm phòng chiếu
        </button>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Tên phòng chiếu</th>
              <th className="px-6 py-4">Số ghế hoạt động</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-zinc-300">
            {rooms.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-zinc-500 font-medium">
                  Chưa có phòng chiếu nào tại rạp này.
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                      <Tv size={18} />
                    </div>
                    {room.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full text-xs font-bold">
                      {room.totalSeats} ghế
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        room.isActive
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/10"
                          : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {room.isActive ? "Hoạt động" : "Tạm ngưng"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onEditRoom(room)}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors cursor-pointer text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <Edit2 size={12} />
                      Sửa sơ đồ ghế
                    </button>
                    <button
                      onClick={() => onDeleteRoom(room.id)}
                      className="p-2 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer inline-block"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
