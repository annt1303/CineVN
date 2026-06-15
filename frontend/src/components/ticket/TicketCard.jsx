import { motion } from "framer-motion";
import { Calendar, MapPin, Armchair, CircleDollarSign, Film } from "lucide-react";

export default function TicketCard({ ticket, onSelect }) {
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
  } = ticket;

  // Format date/time
  const startTime = new Date(showtimeStartTime);
  const endTime = new Date(showtimeEndTime);

  const formatShowtimeDate = (date) => {
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatShowtimeTime = (date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Determine actual visual status based on date/time
  const isExpired = new Date() > endTime;
  let displayStatus = status;
  if (status === "BOOKED" && isExpired) {
    displayStatus = "EXPIRED";
  }

  const getStatusConfig = (statusKey) => {
    switch (statusKey) {
      case "BOOKED":
        return {
          label: "Chưa sử dụng",
          classes: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        };
      case "EXPIRED":
        return {
          label: "Đã sử dụng / Hết hạn",
          classes: "bg-zinc-800 border-white/5 text-zinc-500",
        };
      case "PENDING":
        return {
          label: "Chờ thanh toán",
          classes: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        };
      case "CANCELLED":
        return {
          label: "Đã hủy",
          classes: "bg-rose-500/10 border-rose-500/30 text-rose-400",
        };
      default:
        return {
          label: statusKey,
          classes: "bg-zinc-800 border-white/5 text-zinc-400",
        };
    }
  };

  const statusConfig = getStatusConfig(displayStatus);
  const moviePosterUrl = moviePosterPath
    ? (moviePosterPath.startsWith("http") ? moviePosterPath : `https://image.tmdb.org/t/p/w500${moviePosterPath}`)
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, borderColor: "rgba(229, 9, 20, 0.3)" }}
      transition={{ duration: 0.25 }}
      className="relative flex flex-col md:flex-row bg-zinc-900/60 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md"
    >
      {/* Movie poster/thumbnail */}
      <div className="relative w-full md:w-36 h-48 md:h-full flex-shrink-0 bg-zinc-950 overflow-hidden">
        {moviePosterUrl ? (
          <img
            src={moviePosterUrl}
            alt={movieTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
            <Film size={24} />
            <span className="text-xs">No Poster</span>
          </div>
        )}
        {/* Format tag */}
        <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black text-rose-500 border border-rose-500/20 uppercase tracking-widest">
          {movieFormat?.replace("FORMAT_", "") || "2D"}
        </div>
      </div>

      {/* Ticket Details */}
      <div className="flex-grow p-6 flex flex-col justify-between gap-4">
        <div>
          {/* Header row: title and status */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-white leading-snug line-clamp-1">
              {movieTitle}
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusConfig.classes}`}
            >
              {statusConfig.label}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 mt-4 text-zinc-400 text-xs">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-rose-500/80 flex-shrink-0" />
              <span>
                {formatShowtimeTime(startTime)} • {formatShowtimeDate(startTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-rose-500/80 flex-shrink-0" />
              <span className="truncate">
                {cinemaName} • <strong className="text-white">{screenRoomName}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Armchair size={14} className="text-rose-500/80 flex-shrink-0" />
              <span>
                Ghế <strong className="text-white">{seatName}</strong> ({seatType})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CircleDollarSign size={14} className="text-rose-500/80 flex-shrink-0" />
              <span>
                Giá vé:{" "}
                <strong className="text-white">
                  {price?.toLocaleString("vi-VN")}đ
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-1">
          <div className="text-xs">
            <span className="text-zinc-500">Mã đặt vé:</span>{" "}
            <code className="text-zinc-300 font-bold bg-white/5 px-2 py-0.5 rounded ml-1 font-mono">
              {bookingCode}
            </code>
          </div>
          <button
            onClick={() => onSelect(ticket)}
            className="text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-rose-600/10 cursor-pointer"
          >
            Xem vé chi tiết
          </button>
        </div>
      </div>
    </motion.div>
  );
}
