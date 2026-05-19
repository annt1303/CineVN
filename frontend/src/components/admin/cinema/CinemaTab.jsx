import React from "react";
import { Plus, Edit2, Trash2, Landmark } from "lucide-react";

export default function CinemaTab({
  cinemas,
  onAddCinema,
  onEditCinema,
  onDeleteCinema,
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Danh sách cụm rạp</h2>
        <button
          onClick={onAddCinema}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl transition-all cursor-pointer font-bold text-sm"
        >
          <Plus size={16} />
          Thêm rạp
        </button>
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-x-auto shadow-2xl">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-white/5 bg-white/2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4 min-w-[200px]">Tên cụm rạp</th>
              <th className="px-6 py-4 min-w-[250px]">Địa chỉ</th>
              <th className="px-6 py-4 min-w-[300px]">Mô tả</th>
              <th className="px-6 py-4 text-right min-w-[100px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-zinc-300">
            {cinemas.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-zinc-500 font-medium">
                  Chưa có cụm rạp nào. Hãy thêm cụm rạp mới!
                </td>
              </tr>
            ) : (
              cinemas.map((cinema) => (
                <tr key={cinema.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-rose-600/10 rounded-lg text-rose-500 flex-shrink-0">
                        <Landmark size={18} />
                      </div>
                      <span className="break-words whitespace-normal">{cinema.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 break-words whitespace-normal">{cinema.address}</td>
                  <td className="px-6 py-4 break-words whitespace-normal text-zinc-500">{cinema.description || "Không có mô tả"}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => onEditCinema(cinema)}
                      className="p-2 hover:bg-white/5 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer inline-block"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteCinema(cinema.id)}
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
