import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";
import { generateSeats } from "../data/mockData";

export default function SeatMap({ selectedSeats, onSeatSelect }) {
  const [seats, setSeats] = useState([]);

  useEffect(() => {
    setSeats(generateSeats());
  }, []);

  // Group seats by row
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const handleSeatClick = (seat) => {
    if (seat.status === "booked") return;
    onSeatSelect(seat);
  };

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
          {Object.keys(rows).map((rowLabel) => (
            <div key={rowLabel} className="flex items-center justify-center gap-2">
              <div className="w-6 text-center text-gray-500 font-bold">{rowLabel}</div>
              <div className="flex gap-2">
                {rows[rowLabel].map((seat, index) => {
                  const isSelected = selectedSeats.some((s) => s.id === seat.id);
                  return (
                    <motion.button
                      key={seat.id}
                      whileHover={seat.status !== "booked" ? { scale: 1.1 } : {}}
                      whileTap={seat.status !== "booked" ? { scale: 0.9 } : {}}
                      onClick={() => handleSeatClick(seat)}
                      className={cn(
                        "w-8 h-8 rounded-t-lg rounded-b-sm text-xs font-medium transition-colors flex items-center justify-center relative",
                        seat.status === "booked" ? "seat-booked" : 
                        isSelected ? "seat-selected text-white" : 
                        `seat-${seat.type} text-white/90 opacity-80 hover:opacity-100`
                      )}
                      // Add a small gap in the middle to create an aisle
                      style={index === 5 ? { marginRight: '20px' } : {}}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="selected-indicator"
                          className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
              <div className="w-6 text-center text-gray-500 font-bold">{rowLabel}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 p-4 glass rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded seat-standard"></div>
            <span className="text-sm text-gray-300">Thường (50k)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded seat-premium"></div>
            <span className="text-sm text-gray-300">VIP (75k)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded seat-vip"></div>
            <span className="text-sm text-gray-300">Sweetbox (100k)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded seat-selected"></div>
            <span className="text-sm text-gray-300">Đang chọn</span>
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
