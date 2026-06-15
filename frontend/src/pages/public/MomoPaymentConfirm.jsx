import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Mail, Download, Home, Loader2, ArrowLeft } from "lucide-react";
import { api } from "../../services/api";

const PAYMENT_LABELS = {
  VNPAY: "VNPay",
  MOMO: "MoMo",
  ZALOPAY: "ZaloPay",
  STRIPE: "Thẻ Quốc tế (Stripe)",
  Online: "Online",
};

export default function MomoPaymentConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const resultCode = searchParams.get("resultCode");
  const orderId = searchParams.get("orderId"); // bookingCode
  const message = searchParams.get("message");

  useEffect(() => {
    if (!orderId) {
      setError("Không tìm thấy thông tin mã đặt vé (orderId).");
      setLoading(false);
      return;
    }

    // If MoMo returned a non-zero code immediately, it means payment failed/canceled
    if (resultCode && resultCode !== "0") {
      setError(`Thanh toán thất bại hoặc đã bị hủy. (Mã lỗi: ${resultCode})`);
      setLoading(false);
      // Inform backend to cancel tickets and release seats immediately
      api.get(`/api/public/payment/momo/verify?bookingCode=${orderId}`).catch(() => {});
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await api.get(`/api/public/payment/momo/verify?bookingCode=${orderId}`);
        if (res.status === "BOOKED") {
          setData(res);
        } else if (res.status === "CANCELLED") {
          setError("Giao dịch này đã bị hủy hoặc hết hạn thanh toán.");
        } else {
          setError("Giao dịch chưa hoàn tất hoặc đã xảy ra lỗi xác thực.");
        }
      } catch (err) {
        setError(err.message || "Không thể xác minh giao dịch.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId, resultCode]);

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  // Format start time
  const getShowtimeDisplay = (timeStr) => {
    if (!timeStr) return "";
    try {
      const d = new Date(timeStr);
      const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
      const date = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
      return `${time} – ${date}`;
    } catch (e) {
      return timeStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md w-full p-8 text-center border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center gap-5"
        >
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <h3 className="text-xl font-bold text-white">Đang xác minh giao dịch...</h3>
          <p className="text-gray-400 text-sm">
            Vui lòng không đóng trình duyệt hoặc tải lại trang trong khi hệ thống xác thực thanh toán MoMo.
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-md w-full p-8 text-center border border-red-500/20 rounded-3xl shadow-2xl shadow-red-500/5 flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-5">
            <XCircle size={36} />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Thanh toán thất bại</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {error}
          </p>
          <div className="flex flex-col w-full gap-2.5">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <Home size={18} />
              Quay lại trang chủ
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Success view
  const seatNames = data.seats ? data.seats.join(", ") : "";
  const showtimeDisplay = getShowtimeDisplay(data.startTime);
  const qrData = `VNCinema|${data.bookingCode}|${data.movieTitle}|${data.cinemaName}|${data.screenRoomName}|${showtimeDisplay}|${seatNames}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}`;

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-2xl w-full"
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
            Thanh toán thành công! 🎉
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-sm"
          >
            Vé đã được xác nhận qua cổng MoMo. Email kèm mã QR đã được gửi đến bạn.
          </motion.p>
        </div>

        {/* Booking Code */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl p-5 mb-5 text-center border border-primary/20"
        >
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Mã đặt vé (MoMo)</p>
          <p className="text-3xl font-extrabold tracking-[6px] text-yellow-400">{data.bookingCode}</p>
          <p className="text-xs text-gray-600 mt-1">Lưu mã này để đối soát nếu cần hỗ trợ</p>
        </motion.div>

        {/* Ticket Details + QR */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-2xl overflow-hidden mb-5 border border-white/10"
        >
          {/* Movie header */}
          <div className="bg-gradient-to-r from-primary/20 to-transparent px-6 py-4 border-b border-white/8">
            <h3 className="text-white font-bold text-lg">{data.movieTitle}</h3>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Left: info */}
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">🏛 Rạp / Phòng</p>
                <p className="text-white font-semibold">
                  {data.cinemaName} – {data.screenRoomName}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">🕐 Suất chiếu</p>
                <p className="text-white font-semibold">{showtimeDisplay}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                  💺 Ghế ({data.seats ? data.seats.length : 0})
                </p>
                <p className="text-white font-semibold">{seatNames}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">💳 Thanh toán qua</p>
                <p className="text-sky-400 font-semibold">{PAYMENT_LABELS[data.paymentMethod] ?? data.paymentMethod}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">💰 Tổng tiền</p>
                <p className="text-primary font-extrabold text-xl">{formatCurrency(data.totalPrice)}</p>
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
            Email xác nhận kèm mã QR vé đã được gửi đến hòm thư <strong>{data.userEmail || "của bạn"}</strong>. Hãy kiểm tra cả thư mục Spam nếu không thấy.
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
            onClick={() => navigate("/")}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Home size={18} />
            Về trang chủ
          </button>
          <a
            href={qrUrl}
            download={`VNCinema-${data.bookingCode}.png`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-colors cursor-pointer font-semibold text-sm"
          >
            <Download size={16} />
            Tải QR
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
