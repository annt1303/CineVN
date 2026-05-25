import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Client } from "@stomp/stompjs";
import { formatCurrency } from "../data/mockData";
import { cn } from "../utils/cn";
import { api } from "../services/api";
import { mapDbMovieToFrontend } from "../utils/movieMapper";

// Helper to construct WS URL dynamically
const getWsUrl = () => {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  
  if (apiBase.startsWith('http')) {
    return apiBase.replace(/^http/, 'ws') + '/ws';
  } else {
    const host = window.location.host;
    return `${protocol}//${host}${apiBase}/ws`;
  }
};

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

  // Generate a unique token for this booking session
  const [bookingToken] = useState(() => {
    return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
  });

  const selectedSeatsRef = useRef(selectedSeats);
  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  // Cleanup held seats on unmount or if we change showtime
  useEffect(() => {
    return () => {
      const currentSelected = selectedSeatsRef.current;
      if (selectedShowtime && currentSelected && currentSelected.length > 0) {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/public/showtimes/${selectedShowtime.id}/seats/release`;
        const payload = JSON.stringify({
          seatIds: currentSelected.map(s => s.id),
          bookingToken
        });
        
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
        } else {
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
          }).catch(err => console.error("Cleanup release error:", err));
        }
      }
    };
  }, [selectedShowtime, bookingToken]);

  // Handle browser tab close or refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentSelected = selectedSeatsRef.current;
      if (selectedShowtime && currentSelected && currentSelected.length > 0) {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/public/showtimes/${selectedShowtime.id}/seats/release`;
        const payload = JSON.stringify({
          seatIds: currentSelected.map(s => s.id),
          bookingToken
        });
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [selectedShowtime, bookingToken]);

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

  // Fetch seat status for selected showtime when on step 2 & connect to STOMP WebSocket
  useEffect(() => {
    if (step === 2 && selectedShowtime) {
      const fetchSeats = async () => {
        setLoadingSeats(true);
        try {
          const res = await api.get(`/api/public/showtimes/${selectedShowtime.id}/seats?bookingToken=${bookingToken}`);
          setSeatsData(res.seats || []);
        } catch (err) {
          console.error("Không thể tải sơ đồ ghế:", err);
        } finally {
          setLoadingSeats(false);
        }
      };

      fetchSeats();

      // Connect to WebSocket using STOMP
      const wsUrl = getWsUrl();
      const stompClient = new Client({
        brokerURL: wsUrl,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          stompClient.subscribe(`/topic/showtimes/${selectedShowtime.id}/seats`, (message) => {
            const body = JSON.parse(message.body);
            
            // Check if update is not from us
            if (body.bookingToken !== bookingToken) {
              setSeatsData((prevSeats) => {
                return prevSeats.map((seat) => {
                  if (body.seatIds.includes(seat.id)) {
                    const updatedStatus = body.status === "held" ? "held" : body.status;
                    
                    // If seat is now held or booked by someone else and we had it selected, deselect it
                    if ((updatedStatus === "held" || updatedStatus === "booked") && selectedSeatsRef.current.some(s => s.id === seat.id)) {
                      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
                      alert(`Ghế ${seat.rowName}${seat.seatNumber} đã bị người khác giữ hoặc đặt mất!`);
                    }
                    
                    return { ...seat, status: updatedStatus };
                  }
                  return seat;
                });
              });
            } else if (body.status === "booked") {
              // Update local state to show booked
              setSeatsData((prevSeats) => {
                return prevSeats.map((seat) => {
                  if (body.seatIds.includes(seat.id)) {
                    return { ...seat, status: "booked" };
                  }
                  return seat;
                });
              });
            }
          });
        },
        onStompError: (frame) => {
          console.error("STOMP Broker error:", frame.headers['message']);
        }
      });

      stompClient.activate();

      return () => {
        stompClient.deactivate();
      };
    }
  }, [selectedShowtime, step, bookingToken]);

  const handleSeatSelect = async (seat) => {
    const isAlreadySelected = selectedSeats.find((s) => s.id === seat.id);
    
    if (isAlreadySelected) {
      try {
        await api.post(`/api/public/showtimes/${selectedShowtime.id}/seats/release`, {
          seatIds: [seat.id],
          bookingToken
        });
        setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
      } catch (err) {
        alert("Không thể nhả ghế: " + err.message);
      }
    } else {
      if (selectedSeats.length >= 8) {
        alert("Bạn chỉ có thể chọn tối đa 8 ghế");
        return;
      }
      try {
        await api.post(`/api/public/showtimes/${selectedShowtime.id}/seats/hold`, {
          seatIds: [seat.id],
          bookingToken
        });
        setSelectedSeats((prev) => [...prev, seat]);
      } catch (err) {
        alert("Ghế này đã có người giữ hoặc đặt chỗ!");
        // Refresh seats data to show current statuses
        try {
          const res = await api.get(`/api/public/showtimes/${selectedShowtime.id}/seats?bookingToken=${bookingToken}`);
          setSeatsData(res.seats || []);
        } catch (fetchErr) {
          console.error("Lỗi khi tải lại ghế:", fetchErr);
        }
      }
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const handlePayment = async () => {
    if (selectedSeats.length === 0) return;
    try {
      await api.post("/api/public/tickets/book", {
        showtimeId: selectedShowtime.id,
        seatIds: selectedSeats.map(s => s.id),
        bookingToken
      });
      setStep(3);
    } catch (err) {
      alert("Đặt vé thất bại: " + err.message);
    }
  };

  const handleBackToStep1 = async () => {
    if (selectedSeats.length > 0) {
      try {
        await api.post(`/api/public/showtimes/${selectedShowtime.id}/seats/release`, {
          seatIds: selectedSeats.map(s => s.id),
          bookingToken
        });
        setSelectedSeats([]);
      } catch (err) {
        console.error("Lỗi khi nhả ghế:", err);
      }
    }
    setStep(1);
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
                onBack={handleBackToStep1}
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

