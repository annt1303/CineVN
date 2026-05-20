import { Calendar, MapPin, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

export default function ShowtimeStep({
  dates,
  selectedDate,
  setSelectedDate,
  showtimes = [],
  selectedShowtime,
  setSelectedShowtime,
  onNext,
  loading = false
}) {
  // Group showtimes by cinema name
  const grouped = showtimes.reduce((acc, st) => {
    if (!acc[st.cinemaName]) acc[st.cinemaName] = [];
    acc[st.cinemaName].push(st);
    return acc;
  }, {});

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-8"
    >
      {/* Date Selection */}
      <div>
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-primary" /> Chọn ngày chiếu
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
          {dates.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedDate(idx);
                setSelectedShowtime(null); // Reset selected showtime when date changes
              }}
              className={cn(
                "shrink-0 w-24 py-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer",
                selectedDate === idx 
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" 
                  : "bg-secondary border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/20"
              )}
            >
              <span className="text-xs font-medium mb-1">{item.dayName}</span>
              <span className="text-lg font-bold">{item.dateString}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Showtime Selection grouped by Cinema */}
      <div>
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <MapPin size={20} className="text-primary" /> Chọn rạp và suất chiếu
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : showtimes.length === 0 ? (
          <div className="bg-secondary/40 border border-white/5 rounded-2xl p-8 text-center text-gray-500">
            Không có suất chiếu nào vào ngày này. Vui lòng chọn ngày khác!
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([cinemaName, list]) => (
              <div key={cinemaName} className="bg-secondary/35 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-primary rounded-full"></span>
                  {cinemaName}
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {list.map((st) => {
                    const time = st.startTime.substring(11, 16);
                    const format = st.movieFormat.replace("FORMAT_", "");
                    const isSelected = selectedShowtime && selectedShowtime.id === st.id;

                    return (
                      <button
                        key={st.id}
                        onClick={() => setSelectedShowtime(st)}
                        className={cn(
                          "py-2.5 px-3 rounded-xl transition-all border text-center cursor-pointer flex flex-col items-center justify-center",
                          isSelected 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/30" 
                            : "bg-secondary text-gray-300 border-white/10 hover:border-white/30 hover:bg-white/5"
                        )}
                      >
                        <span className="text-sm font-bold">{time}</span>
                        <span className="text-[10px] opacity-60 font-mono mt-0.5">{format} - {st.screenRoomName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Action */}
      <div className="flex justify-end pt-4">
        <button
          disabled={!selectedShowtime}
          onClick={onNext}
          className={cn(
            "px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all cursor-pointer",
            selectedShowtime 
              ? "bg-white text-background hover:bg-gray-200" 
              : "bg-white/10 text-gray-500 cursor-not-allowed"
          )}
        >
          Tiếp tục <ChevronLeft size={20} className="rotate-180" />
        </button>
      </div>
    </motion.div>
  );
}
