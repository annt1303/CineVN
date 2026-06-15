import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Search, User, Menu, X, LogOut, LayoutDashboard, Ticket } from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  const navLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Phim đang chiếu", path: "/now-showing" },
    { name: "Sắp chiếu", path: "/coming-soon" },
    { name: "Rạp phim", path: "/cinemas" },
    { name: "Khuyến mãi", path: "/promotions" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md py-3 shadow-lg border-b border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 z-50">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="bg-rose-600 p-2 rounded-xl text-white shadow-lg shadow-rose-600/20"
            >
              <Film size={24} />
            </motion.div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Cine<span className="text-rose-600">VN</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "relative text-sm font-medium transition-colors hover:text-white",
                    isActive ? "text-white" : "text-gray-400"
                  )}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 bg-rose-600 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 cursor-pointer">
              <Search size={20} />
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 px-4 py-2 rounded-full transition-all duration-300 border border-rose-500/20 cursor-pointer"
                >
                  <User size={18} />
                  <span className="text-sm font-medium">{user.fullName || user.email}</span>
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl p-2 z-20"
                      >
                        <div className="px-3 py-2 border-b border-white/5 mb-1">
                          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Tài khoản</p>
                          <p className="text-sm text-white truncate font-medium">{user.email}</p>
                          <p className="text-[10px] bg-rose-600/20 text-rose-400 rounded px-1.5 py-0.5 inline-block mt-1 font-bold">
                            {user.role}
                          </p>
                        </div>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium"
                          >
                            <LayoutDashboard size={16} className="text-rose-500" />
                            Quản trị viên
                          </Link>
                        )}

                        <Link
                          to="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium"
                        >
                          <User size={16} className="text-rose-500" />
                          Thông tin cá nhân
                        </Link>

                        <Link
                          to="/purchase-history"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium"
                        >
                          <Ticket size={16} className="text-rose-500" />
                          Lịch sử đặt vé
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-rose-400 hover:text-rose-350 hover:bg-rose-500/5 rounded-xl transition-all font-medium cursor-pointer"
                        >
                          <LogOut size={16} />
                          Đăng xuất
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white px-5 py-2.5 rounded-full transition-all duration-300 shadow-md shadow-rose-600/10 font-medium text-sm"
              >
                <User size={18} />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden z-50 text-white cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 w-full h-screen bg-zinc-950 z-40 flex flex-col p-6 pt-24 gap-6 md:hidden"
          >
            <div className="flex flex-col gap-4">
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Khám phá</p>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl font-bold text-white hover:text-rose-500 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="border-t border-white/5 pt-6 flex flex-col gap-4 mt-auto">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 bg-zinc-900 border border-white/5 p-3 rounded-2xl">
                    <div className="bg-rose-600/10 p-2.5 rounded-xl text-rose-500">
                      <User size={20} />
                    </div>
                    <div className="truncate">
                      <p className="text-white font-bold text-sm truncate">{user.fullName || user.email}</p>
                      <p className="text-zinc-500 text-xs truncate">{user.email}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 bg-rose-600/10 text-rose-400 font-bold py-3 rounded-xl border border-rose-500/10 text-sm"
                    >
                      <LayoutDashboard size={18} />
                      Trang Quản Trị Viên
                    </Link>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 bg-zinc-900 text-zinc-300 font-bold py-3 rounded-xl border border-white/5 text-sm"
                  >
                    <User size={18} />
                    Thông Tin Cá Nhân
                  </Link>

                  <Link
                    to="/purchase-history"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 bg-zinc-900 text-zinc-300 font-bold py-3 rounded-xl border border-white/5 text-sm"
                  >
                    <Ticket size={18} />
                    Lịch Sử Đặt Vé
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 bg-rose-900/10 text-rose-500 font-bold py-3 rounded-xl border border-rose-500/5 text-sm cursor-pointer"
                  >
                    <LogOut size={18} />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-red-500 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg shadow-rose-600/10"
                >
                  <User size={18} />
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}