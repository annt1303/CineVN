import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "../data/mockData";
import { cn } from "../utils/cn";
import { api } from "../services/api";
import { mapDbMovieToFrontend } from "../utils/movieMapper";

// Modular Components
import MovieHero from "../components/movie/MovieHero";
import MovieInfo from "../components/movie/MovieInfo";
import ShowtimeStep from "../components/movie/ShowtimeStep";
import SeatStep from "../components/movie/SeatStep";
import CheckoutStep from "../components/movie/CheckoutStep";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(0);
  const [showtimeList, setShowtimeList] = useState([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [seatsData, setSeatsData] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [step, setStep] = useState(1); // 1: Info & Showtime, 2: Seat Selection, 3: Checkout

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    const fetchMovie = async () => {
      try {
        const data = await api.get(`/api/public/movies/${id}`);
        setMovie(mapDbMovieToFrontend(data));
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
      }
    };
    fetchMovie();
  }, [id]);

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

  // Fetch showtimes for movie and date
  useEffect(() => {
    if (!movie) return;

    const fetchShowtimes = async () => {
      setLoadingShowtimes(true);
      try {
        const dateObj = dates[selectedDate].date;
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;

        const res = await api.get(`/api/public/showtimes/movie/${id}?date=${dateString}`);
        setShowtimeList(res);
      } catch (err) {
        console.error("Không thể tải lịch chiếu:", err);
      } finally {
        setLoadingShowtimes(false);
      }
    };

    fetchShowtimes();
  }, [movie, selectedDate, id]);

  // Fetch seat status for selected showtime when on step 2
  useEffect(() => {
    if (step === 2 && selectedShowtime) {
      const fetchSeats = async () => {
        setLoadingSeats(true);
        try {
          const res = await api.get(`/api/public/showtimes/${selectedShowtime.id}/seats`);
          setSeatsData(res.seats || []);
        } catch (err) {
          console.error("Không thể tải sơ đồ ghế:", err);
        } finally {
          setLoadingSeats(false);
        }
      };

      fetchSeats();
    }
  }, [selectedShowtime, step]);

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

  const handlePayment = async () => {
    if (selectedSeats.length === 0) return;
    try {
      await api.post("/api/public/tickets/book", {
        showtimeId: selectedShowtime.id,
        seatIds: selectedSeats.map(s => s.id)
      });
      setStep(3);
    } catch (err) {
      alert("Đặt vé thất bại: " + err.message);
    }
  };

  if (!movie) return <div className="min-h-screen flex items-center justify-center text-white">Đang tải...</div>;

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Header */}
      <MovieHero 
        backdrop={movie.backdrop} 
        title={movie.title} 
        onBack={() => navigate(-1)} 
      />

      <div className="container mx-auto px-4 md:px-6 relative z-20 -mt-32 md:-mt-48">
        {/* Info Section */}
        <MovieInfo movie={movie} />

        {/* Booking Section */}
        <div className="mt-16">
          {/* Booking Step Tabs */}
          <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-8">
            <button 
              onClick={() => setStep(1)}
              className={cn("text-lg font-semibold transition-colors relative cursor-pointer", step === 1 ? "text-primary" : "text-gray-500 hover:text-white")}
            >
              1. Chọn suất chiếu
              {step === 1 && <motion.div layoutId="tab-indicator" className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <span className="text-gray-700">/</span>
            <button 
              disabled={step < 2}
              onClick={() => setStep(2)}
              className={cn("text-lg font-semibold transition-colors relative cursor-pointer", step === 2 ? "text-primary" : step > 2 ? "text-white" : "text-gray-700")}
            >
              2. Chọn ghế
              {step === 2 && <motion.div layoutId="tab-indicator" className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <span className="text-gray-700">/</span>
            <button 
              disabled={step < 3}
              onClick={() => setStep(3)}
              className={cn("text-lg font-semibold transition-colors relative cursor-pointer", step === 3 ? "text-primary" : "text-gray-700")}
            >
              3. Thanh toán
              {step === 3 && <motion.div layoutId="tab-indicator" className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          </div>

          {/* Stepper Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <ShowtimeStep
                dates={dates}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                showtimes={showtimeList}
                selectedShowtime={selectedShowtime}
                setSelectedShowtime={setSelectedShowtime}
                onNext={() => setStep(2)}
                loading={loadingShowtimes}
              />
            )}

            {step === 2 && (
              <SeatStep
                seats={seatsData}
                loading={loadingSeats}
                selectedSeats={selectedSeats}
                handleSeatSelect={handleSeatSelect}
                totalPrice={totalPrice}
                formatCurrency={formatCurrency}
                onBack={() => setStep(1)}
                onNext={handlePayment}
              />
            )}

            {step === 3 && (
              <CheckoutStep
                movie={movie}
                selectedShowtime={selectedShowtime}
                showtimes={showtimeList}
                selectedDate={selectedDate}
                dates={dates}
                selectedSeats={selectedSeats}
                totalPrice={totalPrice}
                formatCurrency={formatCurrency}
                onHome={() => navigate("/")}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

