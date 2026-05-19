import React from "react";

export default function CinemaModal({
  isOpen,
  onClose,
  editingCinema,
  cinemaForm,
  setCinemaForm,
  onSubmit,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-6 relative">
        <h3 className="text-xl font-extrabold text-white mb-4">
          {editingCinema ? "Cập nhật thông tin rạp" : "Thêm cụm rạp mới"}
        </h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Tên cụm rạp *</label>
            <input
              type="text"
              required
              value={cinemaForm.name}
              onChange={(e) => setCinemaForm({ ...cinemaForm, name: e.target.value })}
              placeholder="Ví dụ: CineVN Hùng Vương"
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Địa chỉ *</label>
            <input
              type="text"
              required
              value={cinemaForm.address}
              onChange={(e) => setCinemaForm({ ...cinemaForm, address: e.target.value })}
              placeholder="Ví dụ: Lầu 5, TTTM Hùng Vương Plaza, Quận 5, TP.HCM"
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Mô tả</label>
            <textarea
              value={cinemaForm.description}
              onChange={(e) => setCinemaForm({ ...cinemaForm, description: e.target.value })}
              placeholder="Nhập thông tin mô tả rạp chiếu..."
              rows="3"
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500 transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-all font-semibold text-sm cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all font-bold text-sm cursor-pointer"
            >
              Lưu rạp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
