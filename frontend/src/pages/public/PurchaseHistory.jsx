import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { ChevronLeft, Ticket, Film, RefreshCw, AlertCircle } from "lucide-react";
import TicketCard from "../../components/ticket/TicketCard";
import ETicketModal from "../../components/ticket/ETicketModal";

export default function PurchaseHistory() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "booked" | "expired" | "cancelled"
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/user/tickets");
      setTickets(data || []);
    } catch (err) {
      console.error("Failed to fetch purchase history:", err);
      setError(err.message || "Không thể tải lịch sử mua vé. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading || (!isAuthenticated && !loading)) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-zinc-800 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Helper to categorize tickets
  const categorizeTicket = (ticket) => {
    const isExpired = new Date() > new Date(ticket.showtimeEndTime);
    if (ticket.status === "BOOKED") {
      return isExpired ? "expired" : "booked";
    }
    return ticket.status.toLowerCase(); // "pending" or "cancelled" or others
  };

  const getFilteredTickets = () => {
    return tickets.filter((ticket) => {
      const category = categorizeTicket(ticket);
      if (activeTab === "all") return true;
      if (activeTab === "booked") return category === "booked";
      if (activeTab === "expired") return category === "expired" || ticket.status === "USED";
      if (activeTab === "cancelled") return category === "cancelled";
      return true;
    });
  };

  // Get counts for badges
  const getTabCounts = () => {
    const counts = { all: tickets.length, booked: 0, expired: 0, cancelled: 0 };
    tickets.forEach((ticket) => {
      const category = categorizeTicket(ticket);
      if (category === "booked") counts.booked++;
      else if (category === "expired" || ticket.status === "USED") counts.expired++;
      else if (category === "cancelled") counts.cancelled++;
    });
    return counts;
  };

  const tabCounts = getTabCounts();
  const filteredTickets = getFilteredTickets();

  const tabs = [
    { id: "all", label: "Tất cả", count: tabCounts.all },
    { id: "booked", label: "Chưa dùng", count: tabCounts.booked },
    { id: "expired", label: "Đã dùng / Hết hạn", count: tabCounts.expired },
    { id: "cancelled", label: "Đã hủy", count: tabCounts.cancelled },
  ];

  return (
    <div className="min-h-screen bg-[#0f1115] py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="p-2.5 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:border-white/10 transition-all cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wide">Lịch sử mua vé</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Quản lý và sử dụng vé xem phim của bạn</p>
            </div>
          </div>

          {tickets.length > 0 && (
            <button
              onClick={fetchTickets}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Tải lại
            </button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-950/30 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-400 text-sm mb-6">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span className="flex-grow">{error}</span>
            <button
              onClick={fetchTickets}
              className="text-xs font-bold underline hover:text-rose-300"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Tab Filters */}
        {tickets.length > 0 && (
          <div className="flex border-b border-white/5 overflow-x-auto gap-6 mb-8 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative pb-4 text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                    isActive ? "text-rose-500" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      isActive
                        ? "bg-rose-500/10 text-rose-400"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 h-40 animate-pulse flex gap-6"
              >
                <div className="w-24 bg-zinc-800 rounded-xl" />
                <div className="flex-grow flex flex-col justify-between py-2">
                  <div className="space-y-3">
                    <div className="h-4 bg-zinc-800 rounded w-1/3" />
                    <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  </div>
                  <div className="h-3 bg-zinc-800 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          /* Empty purchase history state */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-6 border border-dashed border-white/5 rounded-3xl bg-zinc-950/40"
          >
            <div className="w-16 h-16 rounded-2xl bg-rose-600/10 text-rose-500 flex items-center justify-center mb-5">
              <Ticket size={28} />
            </div>
            <h3 className="text-lg font-black text-white mb-2">Chưa mua vé nào</h3>
            <p className="text-zinc-500 text-xs text-center max-w-sm leading-relaxed mb-6">
              Bạn chưa thực hiện bất kỳ giao dịch đặt vé nào. Rất nhiều bộ phim bom tấn hấp dẫn đang chờ bạn khám phá!
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-rose-600/20"
            >
              <Film size={14} className="mr-2" />
              Đặt vé xem phim ngay
            </Link>
          </motion.div>
        ) : filteredTickets.length === 0 ? (
          /* Filtered empty state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-white/5 rounded-3xl"
          >
            <Ticket className="text-zinc-700 mb-4" size={36} />
            <p className="text-zinc-500 text-sm">Không có vé nào trong trạng thái này</p>
          </motion.div>
        ) : (
          /* Ticket list grid */
          <motion.div layout className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredTickets.map((ticket) => (
                <TicketCard
                  key={ticket.ticketId}
                  ticket={ticket}
                  onSelect={setSelectedTicket}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* E-Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <ETicketModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
