import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import SeatMap from "./SeatMap";

export default function SeatStep({
  seats = [],
  loading = false,
  selectedSeats,
  handleSeatSelect,
  totalPrice,
  formatCurrency,
  onBack,
  onNext
}) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-secondary/20 rounded-3xl border border-white/5">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <span className="text-zinc-500 text-sm mt-3">Đang tải sơ đồ ghế...</span>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-6 md:p-8">
          <SeatMap seats={seats} selectedSeats={selectedSeats} onSeatSelect={handleSeatSelect} />
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-secondary/95 backdrop-blur-xl border-t border-white/10 p-4 md:p-6 z-40 transform translate-y-0 shadow-2xl">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="text-sm text-gray-400 mb-1">Ghế đã chọn ({selectedSeats.length})</div>
            <div className="font-semibold text-white truncate max-w-md">
              {selectedSeats.length > 0 ? selectedSeats.map(s => `${s.rowName}${s.seatNumber}`).join(", ") : "Chưa có ghế nào được chọn"}
            </div>
          </div>
          
          <div className="flex-1 w-full text-left md:text-center">
            <div className="text-sm text-gray-400 mb-1">Tổng tiền</div>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Quay lại
            </button>
            <button
              disabled={selectedSeats.length === 0}
              onClick={onNext}
              className={cn(
                "flex-1 md:flex-none px-8 py-3 rounded-full font-bold transition-all shadow-lg cursor-pointer",
                selectedSeats.length > 0 
                  ? "bg-primary text-white hover:bg-primary-hover shadow-primary/30" 
                  : "bg-white/10 text-gray-500 cursor-not-allowed shadow-none"
              )}
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
