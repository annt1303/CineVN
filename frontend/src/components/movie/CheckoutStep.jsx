import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Mail, Download, Home } from "lucide-react";

const PAYMENT_LABELS = {
  VNPAY: "VNPay",
  MOMO: "MoMo",
  ZALOPAY: "ZaloPay",
  STRIPE: "Thẻ Quốc tế (Stripe)",
  Online: "Online",
};

export default function CheckoutStep({
  movie,
  selectedShowtime,
  selectedSeats,
  totalPrice,
  formatCurrency,
  bookingResult, // Array of TicketResponse from API
  paymentMethod,
  onHome,
}) {
  const activeShowtime = selectedShowtime;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const bookingCode = bookingResult?.[0]?.bookingCode ?? "TIC-XXXXXX";
  const seatNames = selectedSeats.map((s) => `${s.rowName}${s.seatNumber}`).join(", ");

  const showtimeDisplay = activeShowtime
    ? `${activeShowtime.startTime.substring(11, 16)} – ${activeShowtime.startTime.substring(8, 10)}/${activeShowtime.startTime.substring(5, 7)}/${activeShowtime.startTime.substring(0, 4)}`
    : "";

  // QR data = compact ticket info
  const qrData = `VNCinema|${bookingCode}|${movie?.title}|${activeShowtime?.cinemaName}|${activeShowtime?.screenRoomName}|${showtimeDisplay}|${seatNames}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`;

  return (
    <motion.div
      key="step-success"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-2xl mx-auto"
    >
      {/* Success Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 size={44} />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-extrabold text-white mb-2"
        >
          Đặt vé thành công! 🎉
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-sm"
        >
          Vé đã được xác nhận. Email xác nhận kèm mã QR đã được gửi tới hòm thư của bạn.
        </motion.p>
      </div>

      {/* Booking Code */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card rounded-2xl p-5 mb-5 text-center border border-primary/20"
      >
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Mã đặt vé</p>
        <p className="text-3xl font-extrabold tracking-[6px] text-yellow-400">{bookingCode}</p>
        <p className="text-xs text-gray-600 mt-1">Lưu mã này để đối soát nếu cần hỗ trợ</p>
      </motion.div>

      {/* Ticket Details + QR */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card rounded-2xl overflow-hidden mb-5"
      >
        {/* Movie header */}
        <div className="bg-gradient-to-r from-primary/20 to-transparent px-6 py-4 border-b border-white/8">
          <h3 className="text-white font-bold text-lg">{movie?.title}</h3>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Left: info */}
          <div className="space-y-4">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">🏛 Rạp / Phòng</p>
              <p className="text-white font-semibold">
                {activeShowtime?.cinemaName} – {activeShowtime?.screenRoomName}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">🕐 Suất chiếu</p>
              <p className="text-white font-semibold">{showtimeDisplay}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                💺 Ghế ({selectedSeats.length})
              </p>
              <p className="text-white font-semibold">{seatNames}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">💳 Thanh toán qua</p>
              <p className="text-sky-400 font-semibold">{PAYMENT_LABELS[paymentMethod] ?? paymentMethod}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">💰 Tổng tiền</p>
              <p className="text-primary font-extrabold text-xl">{formatCurrency(totalPrice)}</p>
            </div>
          </div>

          {/* Right: QR */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-white p-3 rounded-2xl shadow-lg shadow-black/40">
              <img
                src={qrUrl}
                alt="QR Code vé xem phim"
                className="w-48 h-48 object-contain"
              />
            </div>
            <p className="text-gray-500 text-xs mt-3 text-center">
              Xuất trình mã QR này khi vào rạp
            </p>
          </div>
        </div>
      </motion.div>

      {/* Email notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="flex items-start gap-3 bg-sky-500/10 border border-sky-500/20 rounded-2xl px-5 py-4 mb-6 text-sm"
      >
        <Mail size={18} className="text-sky-400 mt-0.5 flex-shrink-0" />
        <p className="text-sky-300">
          Email xác nhận kèm mã QR vé đã được gửi đến hòm thư của bạn. Hãy kiểm tra cả thư mục <em>Spam</em> nếu không thấy.
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3"
      >
        <button
          onClick={onHome}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <Home size={18} />
          Về trang chủ
        </button>
        <a
          href={qrUrl}
          download={`VNCinema-${bookingCode}.png`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-colors cursor-pointer font-semibold text-sm"
        >
          <Download size={16} />
          Tải QR
        </a>
      </motion.div>
    </motion.div>
  );
}
