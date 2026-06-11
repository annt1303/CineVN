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
  if (apiBase.startsWith('http')) {
    return apiBase.replace(/^http/, 'ws') + '/ws';
  } else {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}${apiBase}/ws`;
  }
};

// Modular Components
import MovieHero from "../components/movie/MovieHero";
import MovieInfo from "../components/movie/MovieInfo";
import ShowtimeStep from "../components/movie/ShowtimeStep";
import SeatStep from "../components/movie/SeatStep";
import PaymentStep from "../components/movie/PaymentStep";
import CheckoutStep from "../components/movie/CheckoutStep";

// Step metadata
const STEPS = [
  { num: 1, label: "Chọn suất chiếu" },
  { num: 2, label: "Chọn ghế" },
  { num: 3, label: "Thanh toán" },
  { num: 4, label: "Xác nhận" },
];

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
  const [step, setStep] = useState(1); // 1–4

  // Booking result from API (array of TicketResponse)
  const [bookingResult, setBookingResult] = useState(null);
  const [usedPaymentMethod, setUsedPaymentMethod] = useState(null);

  // Generate a unique token for this booking session
  const [bookingToken] = useState(() =>
    crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36)
  );

  const selectedSeatsRef = useRef(selectedSeats);
  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  // Cleanup held seats on unmount or showtime change
  useEffect(() => {
    return () => {
      const currentSelected = selectedSeatsRef.current;
      if (selectedShowtime && currentSelected && currentSelected.length > 0) {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/public/showtimes/${selectedShowtime.id}/seats/release`;
        const payload = JSON.stringify({
          seatIds: currentSelected.map((s) => s.id),
          bookingToken,
        });
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
        } else {
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
          }).catch((err) => console.error("Cleanup release error:", err));
        }
      }
    };
  }, [selectedShowtime, bookingToken]);

  // Handle browser tab close / refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentSelected = selectedSeatsRef.current;
      if (selectedShowtime && currentSelected && currentSelected.length > 0) {
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/public/showtimes/${selectedShowtime.id}/seats/release`;
        const payload = JSON.stringify({
          seatIds: currentSelected.map((s) => s.id),
          bookingToken,
        });
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [selectedShowtime, bookingToken]);

  // Fetch movie details
  useEffect(() => {
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

  // Generate upcoming dates (7 days)
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d,
      dayName: i === 0 ? "Hôm nay" : i === 1 ? "Ngày mai" : d.toLocaleDateString("vi-VN", { weekday: "short" }),
      dateString: d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    };
  });

  // Fetch showtimes for movie + date
  useEffect(() => {
    if (!movie) return;
    const fetchShowtimes = async () => {
      setLoadingShowtimes(true);
      try {
        const dateObj = dates[selectedDate].date;
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        const res = await api.get(`/api/public/showtimes/movie/${id}?date=${year}-${month}-${day}`);
        setShowtimeList(res);
      } catch (err) {
        console.error("Không thể tải lịch chiếu:", err);
      } finally {
        setLoadingShowtimes(false);
      }
    };
    fetchShowtimes();
  }, [movie, selectedDate, id]);

  // Fetch seats + connect WebSocket when entering step 2
  useEffect(() => {
    if (step !== 2 || !selectedShowtime) return;

    const fetchSeats = async () => {
      setLoadingSeats(true);
      try {
        const res = await api.get(
          `/api/public/showtimes/${selectedShowtime.id}/seats?bookingToken=${bookingToken}`
        );
        setSeatsData(res.seats || []);
      } catch (err) {
        console.error("Không thể tải sơ đồ ghế:", err);
      } finally {
        setLoadingSeats(false);
      }
    };
    fetchSeats();

    // WebSocket STOMP connection
    const wsUrl = getWsUrl();
    const stompClient = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        stompClient.subscribe(
          `/topic/showtimes/${selectedShowtime.id}/seats`,
          (message) => {
            const body = JSON.parse(message.body);
            if (body.bookingToken !== bookingToken) {
              setSeatsData((prev) =>
                prev.map((seat) => {
                  if (body.seatIds.includes(seat.id)) {
                    const updatedStatus = body.status === "held" ? "held" : body.status;
                    if (
                      (updatedStatus === "held" || updatedStatus === "booked") &&
                      selectedSeatsRef.current.some((s) => s.id === seat.id)
                    ) {
                      setSelectedSeats((p) => p.filter((s) => s.id !== seat.id));
                      alert(`Ghế ${seat.rowName}${seat.seatNumber} đã bị người khác giữ hoặc đặt mất!`);
                    }
                    return { ...seat, status: updatedStatus };
                  }
                  return seat;
                })
              );
            } else if (body.status === "booked") {
              setSeatsData((prev) =>
                prev.map((seat) =>
                  body.seatIds.includes(seat.id) ? { ...seat, status: "booked" } : seat
                )
              );
            }
          }
        );
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });
    stompClient.activate();
    return () => stompClient.deactivate();
  }, [selectedShowtime, step, bookingToken]);

  // ── Handlers ──

  const handleSeatSelect = async (seat) => {
    const isAlreadySelected = selectedSeats.find((s) => s.id === seat.id);
    if (isAlreadySelected) {
      try {
        await api.post(`/api/public/showtimes/${selectedShowtime.id}/seats/release`, {
          seatIds: [seat.id],
          bookingToken,
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
          bookingToken,
        });
        setSelectedSeats((prev) => [...prev, seat]);
      } catch (err) {
        alert("Ghế này đã có người giữ hoặc đặt chỗ!");
        try {
          const res = await api.get(
            `/api/public/showtimes/${selectedShowtime.id}/seats?bookingToken=${bookingToken}`
          );
          setSeatsData(res.seats || []);
        } catch (fetchErr) {
          console.error("Lỗi khi tải lại ghế:", fetchErr);
        }
      }
    }
  };

  const handleBackToStep1 = async () => {
    if (selectedSeats.length > 0) {
      try {
        await api.post(`/api/public/showtimes/${selectedShowtime.id}/seats/release`, {
          seatIds: selectedSeats.map((s) => s.id),
          bookingToken,
        });
        setSelectedSeats([]);
      } catch (err) {
        console.error("Lỗi khi nhả ghế:", err);
      }
    }
    setStep(1);
  };

  const handleBackToStep2 = () => setStep(2);

  /**
   * Called by PaymentStep after simulated delay.
   * paymentMethod = "VNPAY" | "MOMO" | "ZALOPAY" | "STRIPE"
   */
  const handleConfirmPayment = async (paymentMethod) => {
    if (selectedSeats.length === 0) return;
    try {
      const result = await api.post("/api/public/tickets/book", {
        showtimeId: selectedShowtime.id,
        seatIds: selectedSeats.map((s) => s.id),
        bookingToken,
        paymentMethod,
      });
      
      const bookingCode = result[0].bookingCode;
      const confirmResult = await api.post(`/api/public/tickets/confirm-payment?bookingCode=${bookingCode}`);
      
      setBookingResult(confirmResult);
      setUsedPaymentMethod(paymentMethod);
      setStep(4);
    } catch (err) {
      alert("Đặt vé thất bại: " + err.message);
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  if (!movie)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">Đang tải...</div>
    );

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Header */}
      <MovieHero backdrop={movie.backdrop} title={movie.title} onBack={() => navigate(-1)} />

      <div className="container mx-auto px-4 md:px-6 relative z-20 -mt-32 md:-mt-48">
        {/* Info Section */}
        <MovieInfo movie={movie} />

        {/* Booking Section */}
        <div className="mt-16">
          {/* Step Tab Bar */}
          <div className="flex items-center gap-2 sm:gap-4 border-b border-white/10 pb-4 mb-8 overflow-x-auto scrollbar-none">
            {STEPS.map((s, idx) => (
              <div key={s.num} className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <button
                  onClick={() => {
                    // Only allow going back, not forward past current step
                    if (s.num < step) setStep(s.num);
                  }}
                  disabled={s.num > step}
                  className={cn(
                    "text-base font-semibold transition-colors relative whitespace-nowrap",
                    s.num === step
                      ? "text-primary cursor-default"
                      : s.num < step
                      ? "text-gray-400 hover:text-white cursor-pointer"
                      : "text-gray-700 cursor-not-allowed"
                  )}
                >
                  {s.num}. {s.label}
                  {s.num === step && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute -bottom-4 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </button>
                {idx < STEPS.length - 1 && <span className="text-gray-700 flex-shrink-0">/</span>}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <ShowtimeStep
                key="step1"
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
                key="step2"
                seats={seatsData}
                loading={loadingSeats}
                selectedSeats={selectedSeats}
                handleSeatSelect={handleSeatSelect}
                totalPrice={totalPrice}
                formatCurrency={formatCurrency}
                onBack={handleBackToStep1}
                onNext={() => setStep(3)}
              />
            )}

            {step === 3 && (
              <PaymentStep
                key="step3"
                movie={movie}
                selectedShowtime={selectedShowtime}
                selectedSeats={selectedSeats}
                totalPrice={totalPrice}
                formatCurrency={formatCurrency}
                onBack={handleBackToStep2}
                onConfirmPayment={handleConfirmPayment}
              />
            )}

            {step === 4 && (
              <CheckoutStep
                key="step4"
                movie={movie}
                selectedShowtime={selectedShowtime}
                selectedSeats={selectedSeats}
                totalPrice={totalPrice}
                formatCurrency={formatCurrency}
                bookingResult={bookingResult}
                paymentMethod={usedPaymentMethod}
                onHome={() => navigate("/")}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
