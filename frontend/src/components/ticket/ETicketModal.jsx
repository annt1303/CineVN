import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, MapPin, Armchair, Wallet, Film, AlertTriangle } from "lucide-react";
import QRCode from "qrcode";

export default function ETicketModal({ ticket, onClose }) {
  const [qrUrl, setQrUrl] = useState("");

  const {
    movieTitle,
    moviePosterPath,
    cinemaName,
    screenRoomName,
    seatName,
    seatType,
    showtimeStartTime,
    showtimeEndTime,
    movieFormat,
    price,
    status,
    bookingCode,
    paymentMethod,
  } = ticket;

  useEffect(() => {
    if (bookingCode) {
      QRCode.toDataURL(
        bookingCode,
        {
          width: 220,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        },
        (err, url) => {
          if (err) {
            console.error("QR Code Error:", err);
            return;
          }
          setQrUrl(url);
        }
      );
    }
  }, [bookingCode]);

  const startTime = new Date(showtimeStartTime);
  const endTime = new Date(showtimeEndTime);

  // Expired check
  const isExpired = new Date() > endTime;
  let displayStatus = status;
  if (status === "BOOKED" && isExpired) {
    displayStatus = "EXPIRED";
  }

  const getStatusLabel = (statusKey) => {
    switch (statusKey) {
      case "BOOKED":
        return { label: "HỢP LỆ (CHƯA DÙNG)", color: "text-emerald-400 bg-emerald-500/10" };
      case "EXPIRED":
        return { label: "ĐÃ SỬ DỤNG / HẾT HẠN", color: "text-zinc-500 bg-zinc-800" };
      case "PENDING":
        return { label: "CHỜ THANH TOÁN", color: "text-amber-400 bg-amber-500/10" };
      case "CANCELLED":
        return { label: "ĐÃ HỦY", color: "text-rose-400 bg-rose-500/10" };
      default:
        return { label: statusKey, color: "text-zinc-400 bg-zinc-800" };
    }
  };

  const statusInfo = getStatusLabel(displayStatus);
  const moviePosterUrl = moviePosterPath
    ? (moviePosterPath.startsWith("http") ? moviePosterPath : `https://image.tmdb.org/t/p/w500${moviePosterPath}`)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Ticket Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl z-10 flex flex-col"
      >
        {/* Header / Title */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5">
          <h2 className="text-lg font-black tracking-wide uppercase text-white">Vé điện tử (E-Ticket)</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:border-white/10 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 select-none max-h-[75vh]">
          {/* Main ticket stub block */}
          <div className="relative flex flex-col bg-white text-zinc-900 rounded-2xl overflow-hidden shadow-lg border border-zinc-200">
            {/* Upper part: Movie details */}
            <div className="p-5 flex gap-4">
              <div className="w-20 h-28 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0 border border-zinc-200">
                {moviePosterUrl ? (
                  <img src={moviePosterUrl} alt={movieTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <Film size={20} />
                  </div>
                )}
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="bg-rose-100 text-rose-700 text-[10px] font-black tracking-widest px-2 py-0.5 rounded inline-block mb-1 border border-rose-200 uppercase">
                    {movieFormat?.replace("FORMAT_", "") || "2D"}
                  </div>
                  <h3 className="font-extrabold text-base leading-tight text-zinc-950 line-clamp-2">
                    {movieTitle}
                  </h3>
                </div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                  Vé xem phim • VNCinema
                </div>
              </div>
            </div>

            {/* Perforated divider line with stubs */}
            <div className="relative h-4 flex items-center justify-between select-none pointer-events-none">
              {/* Left semi-circle */}
              <div className="w-4 h-8 bg-zinc-950 rounded-r-full -ml-2 border-r border-white/10" />
              {/* Dashed line */}
              <div className="flex-grow border-t border-dashed border-zinc-300 mx-2" />
              {/* Right semi-circle */}
              <div className="w-4 h-8 bg-zinc-950 rounded-l-full -mr-2 border-l border-white/10" />
            </div>

            {/* Lower part: Ticket metadata info */}
            <div className="p-5 pt-3 flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Suất chiếu</span>
                  <div className="flex items-center gap-1.5 text-zinc-900 font-semibold text-xs">
                    <Calendar size={13} className="text-zinc-400" />
                    <span>
                      {startTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} •{" "}
                      {startTime.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Rạp & Phòng</span>
                  <div className="flex items-center gap-1.5 text-zinc-900 font-semibold text-xs">
                    <MapPin size={13} className="text-zinc-400" />
                    <span className="truncate">{cinemaName} • {screenRoomName}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Số ghế</span>
                  <div className="flex items-center gap-1.5 text-zinc-900 font-semibold text-xs">
                    <Armchair size={13} className="text-zinc-400" />
                    <span>{seatName} ({seatType})</span>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Thanh toán</span>
                  <div className="flex items-center gap-1.5 text-zinc-900 font-semibold text-xs">
                    <Wallet size={13} className="text-zinc-400" />
                    <span>{paymentMethod || "Momo"}</span>
                  </div>
                </div>
              </div>

              {/* Price Row */}
              <div className="flex justify-between items-center border-t border-zinc-100 pt-3 mt-1.5">
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Tổng cộng</span>
                <span className="text-sm font-black text-zinc-950">
                  {price?.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>
          </div>

          {/* QR Code section */}
          {status === "BOOKED" && !isExpired ? (
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-4 rounded-3xl overflow-hidden shadow-lg border border-white/5 flex items-center justify-center">
                {qrUrl ? (
                  <img src={qrUrl} alt="E-Ticket QR Code" className="w-48 h-48 select-none" />
                ) : (
                  <div className="w-48 h-48 bg-zinc-900 rounded-2xl flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-zinc-700 border-t-rose-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-400">Đưa mã QR này cho nhân viên tại quầy vé để quét</p>
                <div className="mt-2.5">
                  <span className="text-xs text-zinc-500 font-semibold uppercase">Mã đặt vé:</span>{" "}
                  <code className="text-sm font-black font-mono tracking-widest text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-xl ml-1.5">
                    {bookingCode}
                  </code>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center gap-2.5">
              <div className={`p-2 rounded-xl ${statusInfo.color}`}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-white uppercase tracking-wider">{statusInfo.label}</p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {status === "CANCELLED"
                    ? "Vé này đã bị hủy thanh toán hoặc quá hạn giữ ghế. Không thể sử dụng để check-in tại quầy."
                    : "Suất chiếu của vé này đã diễn ra hoặc vé đã được quét sử dụng. Mã QR đã bị vô hiệu hóa."}
                </p>
              </div>
              {bookingCode && (
                <div className="mt-1 border-t border-white/5 pt-3 w-full">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Mã đặt vé:</span>{" "}
                  <code className="text-xs font-bold font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded ml-1">
                    {bookingCode}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
