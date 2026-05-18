import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, Ticket, ChevronLeft } from "lucide-react";
import { movies, showtimes, formatCurrency } from "../data/mockData";
import SeatMap from "../components/SeatMap";
import { cn } from "../utils/cn";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [step, setStep] = useState(1); // 1: Info & Showtime, 2: Seat Selection, 3: Checkout

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    const foundMovie = movies.find(m => m.id === parseInt(id));
    if (foundMovie) setMovie(foundMovie);
  }, [id]);

  if (!movie) return <div className="min-h-screen flex items-center justify-center text-white">Đang tải...</div>;

  // Generate some upcoming dates
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d,
      dayName: i === 0 ? "Hôm nay" : i === 1 ? "Ngày mai" : d.toLocaleDateString("vi-VN", { weekday: "short" }),
      dateString: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
    };
  });

  const handleSeatSelect = (seat) => {
    setSelectedSeats((prev) => {
      const isAlreadySelected = prev.find((s) => s.id === seat.id);
      if (isAlreadySelected) {
        return prev.filter((s) => s.id !== seat.id);
      } else {
        if (prev.length >= 8) {
          alert("Bạn chỉ có thể chọn tối đa 8 ghế");
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Header */}
      <div className="relative h-[60vh] md:h-[70vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
        <img src={movie.backdrop} alt={movie.title} className="w-full h-full object-cover" />
        
        <div className="absolute top-24 left-4 z-20">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-20 -mt-32 md:-mt-48">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-48 md:w-72 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 hidden md:block"
          >
            <img src={movie.image} alt={movie.title} className="w-full object-cover" />
          </motion.div>

          {/* Info */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 pt-4 md:pt-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{movie.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-6">
              <span className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-md">{movie.rating} / 10</span>
              <span className="flex items-center gap-1"><Clock size={16} /> {movie.duration}</span>
              <span className="px-3 py-1 border border-white/20 rounded-full">{movie.genre.join(", ")}</span>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed mb-6">{movie.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block mb-1">Đạo diễn</span>
                <span className="text-white font-medium">{movie.director}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Diễn viên</span>
                <span className="text-white font-medium">{movie.cast.join(", ")}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Booking Section */}
        <div className="mt-16">
          <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-8">
            <button 
              onClick={() => setStep(1)}
              className={cn("text-lg font-semibold transition-colors relative", step === 1 ? "text-primary" : "text-gray-500 hover:text-white")}
            >
              1. Chọn suất chiếu
              {step === 1 && <motion.div layoutId="tab-indicator" className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <span className="text-gray-700">/</span>
            <button 
              disabled={step < 2}
              onClick={() => setStep(2)}
              className={cn("text-lg font-semibold transition-colors relative", step === 2 ? "text-primary" : step > 2 ? "text-white" : "text-gray-700")}
            >
              2. Chọn ghế
              {step === 2 && <motion.div layoutId="tab-indicator" className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <span className="text-gray-700">/</span>
            <button 
              disabled={step < 3}
              onClick={() => setStep(3)}
              className={cn("text-lg font-semibold transition-colors relative", step === 3 ? "text-primary" : "text-gray-700")}
            >
              3. Thanh toán
              {step === 3 && <motion.div layoutId="tab-indicator" className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Date Selection */}
                <div>
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Calendar size={20} className="text-primary" /> Chọn ngày</h3>
                  <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                    {dates.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(idx)}
                        className={cn(
                          "shrink-0 w-24 py-3 rounded-xl border flex flex-col items-center justify-center transition-all",
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

                {/* Showtime Selection */}
                <div>
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2"><MapPin size={20} className="text-primary" /> CineMax Trần Duy Hưng</h3>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {showtimes.map((st) => (
                      <button
                        key={st.id}
                        disabled={!st.available}
                        onClick={() => setSelectedShowtime(st.id)}
                        className={cn(
                          "py-3 rounded-xl font-medium transition-all border",
                          !st.available ? "bg-white/5 text-gray-600 border-transparent cursor-not-allowed" :
                          selectedShowtime === st.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/30" :
                          "bg-secondary text-gray-300 border-white/10 hover:border-white/30 hover:bg-white/5"
                        )}
                      >
                        {st.time}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    disabled={!selectedShowtime}
                    onClick={() => setStep(2)}
                    className={cn(
                      "px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all",
                      selectedShowtime 
                        ? "bg-white text-background hover:bg-gray-200" 
                        : "bg-white/10 text-gray-500 cursor-not-allowed"
                    )}
                  >
                    Tiếp tục <ChevronLeft size={20} className="rotate-180" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="glass-card rounded-3xl p-6 md:p-8">
                  <SeatMap selectedSeats={selectedSeats} onSeatSelect={handleSeatSelect} />
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-secondary/95 backdrop-blur-xl border-t border-white/10 p-4 md:p-6 z-40 transform translate-y-0">
                  <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 w-full">
                      <div className="text-sm text-gray-400 mb-1">Ghế đã chọn ({selectedSeats.length})</div>
                      <div className="font-semibold text-white truncate max-w-md">
                        {selectedSeats.length > 0 ? selectedSeats.map(s => s.id).join(", ") : "Chưa có ghế nào được chọn"}
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full text-left md:text-center">
                      <div className="text-sm text-gray-400 mb-1">Tổng tiền</div>
                      <div className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <button
                        onClick={() => setStep(1)}
                        className="px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
                      >
                        Quay lại
                      </button>
                      <button
                        disabled={selectedSeats.length === 0}
                        onClick={() => setStep(3)}
                        className={cn(
                          "flex-1 md:flex-none px-8 py-3 rounded-full font-bold transition-all shadow-lg",
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
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
              >
                <div className="glass-card rounded-3xl p-8 text-center">
                  <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Ticket size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Thanh toán thành công!</h2>
                  <p className="text-gray-400 mb-8">Vé của bạn đã được gửi về email. Vui lòng kiểm tra hộp thư.</p>
                  
                  <div className="bg-background rounded-2xl p-6 text-left mb-8 border border-white/5">
                    <h3 className="font-bold text-xl text-white mb-4 border-b border-white/10 pb-4">{movie.title}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500 text-sm block">Rạp</span>
                        <span className="text-white font-medium">CineMax Trần Duy Hưng</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm block">Suất chiếu</span>
                        <span className="text-white font-medium">{showtimes.find(s => s.id === selectedShowtime)?.time} - {dates[selectedDate].dateString}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm block">Ghế ({selectedSeats.length})</span>
                        <span className="text-white font-medium">{selectedSeats.map(s => s.id).join(", ")}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 text-sm block">Tổng tiền</span>
                        <span className="text-primary font-bold">{formatCurrency(totalPrice)}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate("/")}
                    className="w-full py-4 rounded-full bg-white text-background font-bold hover:bg-gray-200 transition-colors"
                  >
                    Về trang chủ
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
