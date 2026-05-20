import { motion } from "framer-motion";
import { Ticket } from "lucide-react";

export default function CheckoutStep({
  movie,
  selectedShowtime,
  selectedSeats,
  totalPrice,
  formatCurrency,
  onHome
}) {
  const activeShowtime = selectedShowtime;

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="glass-card rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Ticket size={40} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Thanh toán thành công!</h2>
        <p className="text-gray-400 mb-8">Vé của bạn đã được thanh toán và đăng ký thành công trên hệ thống.</p>
        
        <div className="bg-background rounded-2xl p-6 text-left mb-8 border border-white/5 shadow-inner">
          <h3 className="font-bold text-xl text-white mb-4 border-b border-white/10 pb-4">
            {movie.title}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 text-sm block">Rạp / Phòng</span>
              <span className="text-white font-medium">
                {activeShowtime?.cinemaName} - {activeShowtime?.screenRoomName}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">Suất chiếu</span>
              <span className="text-white font-medium">
                {activeShowtime ? `${activeShowtime.startTime.substring(11, 16)} ngày ${activeShowtime.startTime.substring(8, 10)}/${activeShowtime.startTime.substring(5, 7)}/${activeShowtime.startTime.substring(0, 4)}` : ""}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">Ghế ({selectedSeats.length})</span>
              <span className="text-white font-medium truncate block max-w-[200px]">
                {selectedSeats.map(s => `${s.rowName}${s.seatNumber}`).join(", ")}
              </span>
            </div>
            <div>
              <span className="text-gray-500 text-sm block">Tổng tiền</span>
              <span className="text-primary font-bold text-lg">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={onHome}
          className="w-full py-4 rounded-full bg-white text-background font-bold hover:bg-gray-200 transition-colors cursor-pointer"
        >
          Về trang chủ
        </button>
      </div>
    </motion.div>
  );
}
