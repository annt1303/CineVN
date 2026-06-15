import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";
import momoLogo from "../../assets/MOMO.png";

const PAYMENT_METHODS = [
  {
    id: "VNPAY",
    name: "VNPay",
    desc: "Thẻ ATM nội địa / QR Code VNPay",
    logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-VNPAY-QR-1.png",
    color: "#005BAA",
    textColor: "#fff",
  },
  {
    id: "MOMO",
    name: "MoMo",
    desc: "Ví điện tử MoMo",
    logo: momoLogo,
    color: "#A50064",
    textColor: "#fff",
  },
  {
    id: "ZALOPAY",
    name: "ZaloPay",
    desc: "Ví ZaloPay / Ngân hàng liên kết",
    logo: "https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png",
    color: "#0068FF",
    textColor: "#fff",
  },
  {
    id: "STRIPE",
    name: "Thẻ Quốc tế",
    desc: "Visa / Mastercard / American Express",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    color: "#635bff",
    textColor: "#fff",
  },
];

export default function PaymentStep({
  movie,
  selectedShowtime,
  selectedSeats,
  totalPrice,
  formatCurrency,
  onBack,
  onConfirmPayment,
}) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [processing, setProcessing] = useState(false);
  const isSubmitting = useRef(false);

  const handlePay = async () => {
    if (!selectedMethod || processing || isSubmitting.current) return;
    isSubmitting.current = true;
    setProcessing(true);

    try {
      // Simulate payment processing animation (2s)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await onConfirmPayment(selectedMethod);
    } catch (err) {
      // Reset on error so user can retry
      isSubmitting.current = false;
      setProcessing(false);
    }
  };

  const activeShowtime = selectedShowtime;

  return (
    <motion.div
      key="step-payment"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.35 }}
      className="max-w-3xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6"
    >
      {/* ── LEFT: Payment Method Selection ── */}
      <div>
        <h3 className="text-white font-bold text-xl mb-5">Chọn phương thức thanh toán</h3>
        <div className="space-y-3">
          {PAYMENT_METHODS.map((method) => (
            <motion.button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer text-left",
                selectedMethod === method.id
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8"
              )}
            >
              {/* Logo */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white flex items-center justify-center flex-shrink-0 shadow">
                <img src={method.logo} alt={method.name} className="w-12 h-12 object-contain" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-base">{method.name}</p>
                <p className="text-gray-400 text-sm truncate">{method.desc}</p>
              </div>

              {/* Radio indicator */}
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                  selectedMethod === method.id
                    ? "border-primary bg-primary"
                    : "border-gray-600"
                )}
              >
                {selectedMethod === method.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-white"
                  />
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Note */}
        <div className="mt-5 text-xs text-gray-500 bg-white/5 rounded-xl p-4 border border-white/8 leading-relaxed">
          🔒 <span className="text-gray-400 font-medium">Thanh toán mô phỏng</span> – Hệ thống đang trong giai đoạn thử nghiệm.
          Sau khi xác nhận, vé sẽ được đặt ngay mà không cần chuyển sang cổng thanh toán thật.
          Email xác nhận kèm mã QR sẽ được gửi tới tài khoản của bạn.
        </div>
      </div>

      {/* ── RIGHT: Order Summary + CTA ── */}
      <div className="space-y-4">
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-transparent px-5 py-4 border-b border-white/8">
            <h4 className="text-white font-bold">Tóm tắt đơn hàng</h4>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm">
            <div>
              <span className="text-gray-500 block">Phim</span>
              <span className="text-white font-semibold leading-tight line-clamp-2">{movie?.title}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Suất chiếu</span>
              <span className="text-white font-medium">
                {activeShowtime
                  ? `${activeShowtime.startTime.substring(11, 16)} – ${activeShowtime.startTime.substring(8, 10)}/${activeShowtime.startTime.substring(5, 7)}/${activeShowtime.startTime.substring(0, 4)}`
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Rạp / Phòng</span>
              <span className="text-white font-medium">
                {activeShowtime?.cinemaName} – {activeShowtime?.screenRoomName}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Ghế ({selectedSeats.length})</span>
              <span className="text-white font-medium">
                {selectedSeats.map((s) => `${s.rowName}${s.seatNumber}`).join(", ")}
              </span>
            </div>
          </div>
          <div className="px-5 py-4 border-t border-white/8 flex items-center justify-between">
            <span className="text-gray-400 text-sm">Tổng cộng</span>
            <span className="text-primary font-extrabold text-2xl">{formatCurrency(totalPrice)}</span>
          </div>
        </div>

        {/* Pay Button */}
        <motion.button
          onClick={handlePay}
          disabled={!selectedMethod || processing}
          whileHover={!processing && selectedMethod ? { scale: 1.02 } : {}}
          whileTap={!processing && selectedMethod ? { scale: 0.97 } : {}}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3",
            selectedMethod && !processing
              ? "bg-primary hover:bg-primary-hover text-white cursor-pointer shadow-lg shadow-primary/30"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          )}
        >
          <AnimatePresence mode="wait">
            {processing ? (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                {/* Spinner */}
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <span>Đang xử lý giao dịch...</span>
              </motion.div>
            ) : (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {selectedMethod ? `Thanh toán qua ${PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.name}` : "Chọn phương thức thanh toán"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <button
          onClick={onBack}
          disabled={processing}
          className="w-full py-3 rounded-2xl border border-white/15 text-gray-400 hover:text-white hover:border-white/30 transition-colors text-sm cursor-pointer disabled:opacity-50"
        >
          ← Quay lại chọn ghế
        </button>
      </div>
    </motion.div>
  );
}
