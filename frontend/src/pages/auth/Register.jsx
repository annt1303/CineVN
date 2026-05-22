import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Phone, Check, ArrowRight, Loader2, Clapperboard, ShieldCheck, KeyRound } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const { sendOtp, verifyOtp, register } = useAuth();
  const navigate = useNavigate();

  // Handle resend countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!email) {
      setError("Vui lòng nhập email trước khi nhận mã OTP.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Định dạng email không hợp lệ.");
      return;
    }

    setLoadingSendOtp(true);
    setError("");
    setSuccessMsg("");

    try {
      await sendOtp(email);
      setOtpSent(true);
      setCountdown(60);
      setSuccessMsg("Mã OTP đã được gửi! Vui lòng kiểm tra email.");
    } catch (err) {
      setError(err.message || "Gửi mã OTP thất bại. Vui lòng thử lại.");
    } finally {
      setLoadingSendOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError("Mã OTP phải có độ dài đúng 6 chữ số.");
      return;
    }

    setLoadingVerifyOtp(true);
    setError("");
    setSuccessMsg("");

    try {
      await verifyOtp(email, otpCode);
      setOtpVerified(true);
      setSuccessMsg("Xác thực OTP thành công! Vui lòng điền thông tin còn lại.");
    } catch (err) {
      setError(err.message || "Mã OTP không chính xác hoặc đã hết hạn.");
    } finally {
      setLoadingVerifyOtp(false);
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      setError("Vui lòng xác thực mã OTP trước khi hoàn tất đăng ký.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Mật khẩu phải chứa ít nhất 8 ký tự.");
      return;
    }

    setLoadingRegister(true);
    setError("");

    try {
      await register({
        email,
        password,
        fullName,
        phone,
      });
      setSuccessMsg("Đăng ký tài khoản thành công! Đang chuyển hướng đăng nhập...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Đăng ký tài khoản thất bại.");
    } finally {
      setLoadingRegister(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (otpSent) {
      setOtpSent(false);
      setOtpCode("");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-radial from-slate-900 via-zinc-950 to-black px-4 py-12 overflow-hidden">
      {/* Cinematic Lights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: -5 }}
            className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 shadow-lg shadow-rose-600/30 mb-4"
          >
            <Clapperboard className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">CineVN</h2>
          <p className="text-zinc-400 text-sm mt-1">Trở thành thành viên để nhận ngập tràn ưu đãi</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />

          <h3 className="text-xl font-bold text-white mb-6 text-center">Đăng ký tài khoản mới</h3>

          {/* Feedback Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl p-3 mb-4 flex items-center justify-center font-medium"
              >
                {error}
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl p-3 mb-4 flex items-center justify-center font-medium"
              >
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleCompleteRegistration} className="space-y-5">
            {/* Step 1: Email Input */}
            <div>
              <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={otpVerified}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-rose-500 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:ring-1 focus:ring-rose-500/30 transition-all duration-300 outline-none text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                {!otpVerified ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loadingSendOtp || countdown > 0}
                    className="bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold px-4 rounded-xl text-xs cursor-pointer min-w-[110px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loadingSendOtp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : countdown > 0 ? (
                      `${countdown}s`
                    ) : otpSent ? (
                      "Gửi lại"
                    ) : (
                      "Gửi OTP"
                    )}
                  </motion.button>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-3 rounded-xl text-xs flex items-center justify-center gap-1 min-w-[110px] select-none">
                    <Check className="w-4 h-4" />
                    Đã xác minh
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: OTP Verification Field */}
            <AnimatePresence>
              {otpSent && !otpVerified && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 pt-2 border-t border-zinc-800">
                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Nhập mã OTP</label>
                      <div className="flex gap-2">
                        <div className="relative flex-grow">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                            <KeyRound className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="Mã 6 chữ số"
                            className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-rose-500 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:ring-1 focus:ring-rose-500/30 transition-all duration-300 outline-none text-sm font-medium tracking-widest text-center"
                            required
                          />
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={loadingVerifyOtp || otpCode.length !== 6}
                          className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 rounded-xl text-xs cursor-pointer min-w-[110px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 shadow-lg shadow-rose-600/10"
                        >
                          {loadingVerifyOtp ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              Xác nhận
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Registration Rest Details (Always visible) */}
            <div className="space-y-4 pt-4 border-t border-zinc-800">
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Họ và Tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-rose-500 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:ring-1 focus:ring-rose-500/30 transition-all duration-300 outline-none text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Số điện thoại</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ""))}
                    placeholder="09XXXXXXXX"
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-rose-500 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:ring-1 focus:ring-rose-500/30 transition-all duration-300 outline-none text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                    className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-rose-500 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:ring-1 focus:ring-rose-500/30 transition-all duration-300 outline-none text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loadingRegister}
                className="w-full bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-6"
              >
                {loadingRegister ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tạo tài khoản...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Hoàn tất đăng ký
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-zinc-800 pt-6 text-sm text-zinc-500">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-rose-400 hover:text-rose-300 font-bold transition-colors">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
