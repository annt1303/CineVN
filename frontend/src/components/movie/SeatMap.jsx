import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export default function SeatMap({ seats = [], selectedSeats, onSeatSelect }) {
  // Group seats by rowName
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.rowName]) {
      acc[seat.rowName] = [];
    }
    acc[seat.rowName].push(seat);
    return acc;
  }, {});

  // Sort rows alphabetically
  const sortedRows = Object.keys(rows).sort();
  sortedRows.forEach(row => {
    rows[row].sort((a, b) => a.gridColumn - b.gridColumn);
  });

  const handleSeatClick = (seat) => {
    if (seat.status === "booked" || seat.status === "held") return;
    onSeatSelect(seat);
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  // Dynamic legend prices
  const standardPrice = seats.find(s => s.seatType === "NORMAL")?.price || 0;
  const vipPrice = seats.find(s => s.seatType === "VIP")?.price || 0;
  const couplePrice = seats.find(s => s.seatType === "COUPLE")?.price || 0;

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="min-w-[600px] max-w-3xl mx-auto">
        {/* Screen */}
        <div className="mb-12 relative">
          <div className="h-2 w-full bg-accent rounded-full screen-glow"></div>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-gray-400 text-sm tracking-widest uppercase">
            Màn hình
          </div>
        </div>

        {/* Seats */}
        <div className="flex flex-col gap-4">
          {sortedRows.map((rowLabel) => {
            const rowSeats = rows[rowLabel];
            const maxCol = rowSeats.length > 0 ? Math.max(...rowSeats.map(s => s.gridColumn)) : 12;

            // Generate full row items, replacing missing gridColumn values with undefined (aisle)
            const gridRow = Array.from({ length: maxCol }).map((_, colIndex) => {
              const colNum = colIndex + 1;
              return rowSeats.find(s => s.gridColumn === colNum);
            });

            return (
              <div key={rowLabel} className="flex items-center justify-center gap-2">
                <div className="w-6 text-center text-gray-500 font-bold">{rowLabel}</div>
                <div className="flex gap-2">
                  {gridRow.map((seat, index) => {
                    if (!seat) {
                      // Corridor placeholder
                      return <div key={`aisle-${index}`} className="w-8 h-8" />;
                    }

                    const isSelected = selectedSeats.some((s) => s.id === seat.id);
                    
                    // Map seat types
                    const seatClass = seat.status === "booked" ? "seat-booked" :
                                      seat.status === "held" ? "seat-held" :
                                      isSelected ? "seat-selected text-white" :
                                      seat.seatType === "VIP" ? "seat-premium text-white/95" :
                                      seat.seatType === "COUPLE" ? "seat-vip text-white/95" :
                                      "seat-standard text-white/90";

                    return (
                      <motion.button
                        key={seat.id}
                        whileHover={seat.status !== "booked" && seat.status !== "held" ? { scale: 1.1 } : {}}
                        whileTap={seat.status !== "booked" && seat.status !== "held" ? { scale: 0.9 } : {}}
                        onClick={() => handleSeatClick(seat)}
                        className={cn(
                          "w-8 h-8 rounded-t-lg rounded-b-sm text-[10px] font-bold transition-colors flex items-center justify-center relative cursor-pointer",
                          seatClass
                        )}
                      >
                        {seat.rowName}{seat.seatNumber}
                        {isSelected && (
                          <motion.div
                            layoutId={`selected-indicator-${seat.id}`}
                            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full shadow-sm"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                <div className="w-6 text-center text-gray-500 font-bold">{rowLabel}</div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 p-4 glass rounded-xl">
          {standardPrice > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded seat-standard"></div>
              <span className="text-sm text-gray-300">Thường ({formatCurrency(standardPrice)})</span>
            </div>
          )}
          {vipPrice > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded seat-premium"></div>
              <span className="text-sm text-gray-300">VIP ({formatCurrency(vipPrice)})</span>
            </div>
          )}
          {couplePrice > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded seat-vip"></div>
              <span className="text-sm text-gray-300">Sweetbox ({formatCurrency(couplePrice)})</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded seat-selected"></div>
            <span className="text-sm text-gray-300">Đang chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded seat-held"></div>
            <span className="text-sm text-gray-300">Đang giữ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded seat-booked"></div>
            <span className="text-sm text-gray-300">Đã bán</span>
          </div>
        </div>
      </div>
    </div>
  );
}
