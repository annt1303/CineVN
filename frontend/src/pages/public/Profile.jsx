import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Shield, Lock, CheckCircle2,
  AlertCircle, Edit3, KeyRound, Save, X, Calendar,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../services/api";

/* ─── tiny helpers ─── */
const InputField = ({ icon: Icon, label, id, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
        <Icon size={16} />
      </span>
      <input
        id={id}
        className={`w-full bg-zinc-900 border ${error ? "border-rose-500" : "border-white/10"
          } rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all`}
        {...props}
      />
    </div>
    {error && <p className="text-rose-400 text-xs flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
  </div>
);

const Toast = ({ type, message }) => (
  <motion.div
    initial={{ opacity: 0, y: -16, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -16, scale: 0.95 }}
    className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-medium ${type === "success"
        ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-400"
        : "bg-rose-950/90 border-rose-500/30 text-rose-400"
      } backdrop-blur-md`}
  >
    {type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
    {message}
  </motion.div>
);

/* ─── main component ─── */
export default function Profile() {
  const { user, isAuthenticated, updateProfile, changePassword, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("info"); // "info" | "security"
  const [toast, setToast] = useState(null);
  const [ticketCount, setTicketCount] = useState(0);

  /* profile form state */
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  /* password form state */
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState({ old: false, new: false, confirm: false });

  /* OTP state for email update */
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loadingSendOtp, setLoadingSendOtp] = useState(false);
  const [loadingVerifyOtp, setLoadingVerifyOtp] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        email: user.email || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get("/api/user/tickets")
        .then((data) => {
          if (data) setTicketCount(data.length);
        })
        .catch((err) => console.error("Error fetching tickets count:", err));
    }
  }, [isAuthenticated]);

  // Handle resend countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  /* ── toast helper ── */
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleEmailChange = (e) => {
    setProfileForm({ ...profileForm, email: e.target.value });
    if (otpSent) {
      setOtpSent(false);
      setOtpCode("");
    }
    if (otpVerified) {
      setOtpVerified(false);
    }
  };

  const handleSendOtp = async () => {
    const email = profileForm.email.trim();
    if (!email) {
      setProfileErrors((prev) => ({ ...prev, email: "Vui lòng nhập email trước khi nhận mã OTP." }));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setProfileErrors((prev) => ({ ...prev, email: "Định dạng email không hợp lệ." }));
      return;
    }

    setLoadingSendOtp(true);
    setProfileErrors((prev) => ({ ...prev, email: "" }));

    try {
      await sendOtp(email);
      setOtpSent(true);
      setCountdown(60);
      showToast("success", "Mã OTP đã được gửi! Vui lòng kiểm tra email.");
    } catch (err) {
      showToast("error", err.message || "Gửi mã OTP thất bại. Vui lòng thử lại.");
    } finally {
      setLoadingSendOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const email = profileForm.email.trim();
    if (!otpCode || otpCode.length !== 6) {
      showToast("error", "Mã OTP phải có độ dài đúng 6 chữ số.");
      return;
    }

    setLoadingVerifyOtp(true);

    try {
      await verifyOtp(email, otpCode);
      setOtpVerified(true);
      showToast("success", "Xác thực OTP thành công! Bạn có thể lưu thay đổi.");
    } catch (err) {
      showToast("error", err.message || "Mã OTP không chính xác hoặc đã hết hạn.");
    } finally {
      setLoadingVerifyOtp(false);
    }
  };

  /* ── profile validation ── */
  const validateProfile = () => {
    const errs = {};
    if (!profileForm.fullName.trim()) errs.fullName = "Họ và tên không được để trống";
    else if (profileForm.fullName.trim().length < 2) errs.fullName = "Họ và tên ít nhất 2 ký tự";
    if (profileForm.phone && !/^(\+84|0)[0-9]{9,10}$/.test(profileForm.phone)) {
      errs.phone = "Số điện thoại không hợp lệ";
    }

    const email = profileForm.email.trim();
    if (!email) {
      errs.email = "Email không được để trống";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errs.email = "Định dạng email không hợp lệ";
      }
    }
    return errs;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length) { setProfileErrors(errs); return; }

    const isEmailChanged = profileForm.email.trim().toLowerCase() !== user?.email?.toLowerCase();
    if (isEmailChanged && !otpVerified) {
      setProfileErrors((prev) => ({ ...prev, email: "Vui lòng xác thực mã OTP cho email mới trước khi lưu." }));
      return;
    }

    setProfileErrors({});
    setProfileLoading(true);
    try {
      await updateProfile({
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        email: profileForm.email.trim(),
      });
      showToast("success", "Cập nhật thông tin thành công!");
      setOtpVerified(false);
      setOtpSent(false);
      setOtpCode("");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  /* ── password validation ── */
  const validatePw = () => {
    const errs = {};
    if (!pwForm.oldPassword) errs.oldPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (!pwForm.newPassword) errs.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (pwForm.newPassword.length < 8) errs.newPassword = "Mật khẩu mới ít nhất 8 ký tự";
    if (!pwForm.confirmPassword) errs.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = "Mật khẩu xác nhận không khớp";
    return errs;
  };

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    const errs = validatePw();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwErrors({});
    setPwLoading(true);
    try {
      await changePassword(pwForm);
      showToast("success", "Đổi mật khẩu thành công!");
      setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setPwLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    });
  };

  const tabs = [
    { key: "info", label: "Thông tin cá nhân", icon: User },
    { key: "security", label: "Bảo mật", icon: Lock },
  ];

  const PwInput = ({ field, label, showKey }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"><KeyRound size={16} /></span>
        <input
          type={showPw[showKey] ? "text" : "password"}
          value={pwForm[field]}
          onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
          className={`w-full bg-zinc-900 border ${pwErrors[field] ? "border-rose-500" : "border-white/10"
            } rounded-xl py-3 pl-10 pr-12 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all`}
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShowPw({ ...showPw, [showKey]: !showPw[showKey] })}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors text-xs cursor-pointer"
        >
          {showPw[showKey] ? "Ẩn" : "Hiện"}
        </button>
      </div>
      {pwErrors[field] && (
        <p className="text-rose-400 text-xs flex items-center gap-1">
          <AlertCircle size={12} />{pwErrors[field]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1115] py-12 px-4">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast type={toast.type} message={toast.message} />}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">

        {/* ── Header card ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl mb-6 border border-white/5"
          style={{
            background:
              "linear-gradient(135deg, rgba(229,9,20,0.12) 0%, rgba(15,17,21,0.95) 60%, rgba(31,35,43,0.8) 100%)",
          }}
        >
          {/* decorative blur */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-rose-900/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-rose-900/30">
                {(user?.fullName || user?.email || "U")[0].toUpperCase()}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#0f1115] flex items-center justify-center">
                <CheckCircle2 size={12} className="text-white" />
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white truncate">
                {user?.fullName || "Chưa cập nhật tên"}
              </h1>
              <p className="text-zinc-400 text-sm mt-1 truncate">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 bg-rose-600/15 text-rose-400 text-xs font-bold px-3 py-1 rounded-full border border-rose-500/20">
                  <Shield size={11} />
                  {user?.role === "ADMIN" ? "Quản trị viên" : "Thành viên"}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-zinc-800 text-zinc-400 text-xs px-3 py-1 rounded-full border border-white/5">
                  <Calendar size={11} />
                  Tham gia {formatDate(user?.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Tab nav ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex gap-2 mb-6"
        >
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${activeTab === key
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/5 hover:border-white/10"
                }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </motion.div>

        {/* ── Tab content ── */}
        <AnimatePresence mode="wait">
          {activeTab === "info" && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-white/5 p-8"
              style={{ background: "linear-gradient(145deg, rgba(31,35,43,0.6) 0%, rgba(15,17,21,0.8) 100%)" }}
            >
              <div className="flex items-center gap-3 mb-7">
                <div className="bg-rose-600/15 p-2 rounded-xl text-rose-500"><Edit3 size={18} /></div>
                <div>
                  <h2 className="text-lg font-bold text-white">Thông tin cá nhân</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Cập nhật tên hiển thị và số điện thoại</p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
                {/* Editable email with OTP verification */}
                {(() => {
                  const isEmailChanged = profileForm.email.trim().toLowerCase() !== user?.email?.toLowerCase();
                  return (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          Email
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-grow">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                              <Mail size={16} />
                            </span>
                            <input
                              id="email"
                              type="email"
                              placeholder="name@example.com"
                              value={profileForm.email}
                              disabled={profileLoading || otpVerified}
                              onChange={handleEmailChange}
                              className={`w-full bg-zinc-900 border ${profileErrors.email ? "border-rose-500" : "border-white/10"
                                } rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all`}
                            />
                          </div>
                          {isEmailChanged && (
                            !otpVerified ? (
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={handleSendOtp}
                                disabled={loadingSendOtp || countdown > 0}
                                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/10 font-bold px-4 rounded-xl text-xs cursor-pointer min-w-[110px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                              >
                                {loadingSendOtp ? (
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-200 rounded-full"
                                  />
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
                                <CheckCircle2 size={14} />
                                Đã xác minh
                              </div>
                            )
                          )}
                        </div>
                        {profileErrors.email && (
                          <p className="text-rose-400 text-xs flex items-center gap-1">
                            <AlertCircle size={12} />
                            {profileErrors.email}
                          </p>
                        )}
                      </div>

                      <AnimatePresence>
                        {isEmailChanged && otpSent && !otpVerified && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-1.5 pt-2 border-t border-white/5">
                              <label htmlFor="otpCode" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                Nhập mã OTP
                              </label>
                              <div className="flex gap-2">
                                <div className="relative flex-grow">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                                    <KeyRound size={16} />
                                  </span>
                                  <input
                                    id="otpCode"
                                    type="text"
                                    maxLength={6}
                                    placeholder="Mã 6 chữ số"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all text-center tracking-widest font-bold"
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
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                    />
                                  ) : (
                                    <>
                                      <Shield size={14} />
                                      Xác nhận
                                    </>
                                  )}
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  );
                })()}

                <InputField
                  icon={User}
                  label="Họ và tên"
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  error={profileErrors.fullName}
                />

                <InputField
                  icon={Phone}
                  label="Số điện thoại"
                  id="phone"
                  type="tel"
                  placeholder="0901 234 567"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  error={profileErrors.phone}
                />

                <div className="flex justify-end pt-2">
                  <motion.button
                    type="submit"
                    disabled={profileLoading}
                    whileHover={{ scale: profileLoading ? 1 : 1.02 }}
                    whileTap={{ scale: profileLoading ? 1 : 0.98 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-rose-600/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {profileLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Đang lưu...
                      </>
                    ) : (
                      <><Save size={15} />Lưu thay đổi</>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="rounded-3xl border border-white/5 p-8"
              style={{ background: "linear-gradient(145deg, rgba(31,35,43,0.6) 0%, rgba(15,17,21,0.8) 100%)" }}
            >
              <div className="flex items-center gap-3 mb-7">
                <div className="bg-rose-600/15 p-2 rounded-xl text-rose-500"><Lock size={18} /></div>
                <div>
                  <h2 className="text-lg font-bold text-white">Đổi mật khẩu</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Mật khẩu mới ít nhất 8 ký tự</p>
                </div>
              </div>

              {/* Password strength hint */}
              <div className="flex items-start gap-3 bg-zinc-900/60 border border-white/5 rounded-2xl p-4 mb-6">
                <Shield size={16} className="text-rose-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Để bảo vệ tài khoản, hãy sử dụng mật khẩu có ít nhất <span className="text-white font-semibold">8 ký tự</span>, kết hợp chữ hoa, chữ thường và số.
                </p>
              </div>

              <form onSubmit={handlePwSubmit} className="flex flex-col gap-5">
                <PwInput field="oldPassword" label="Mật khẩu hiện tại" showKey="old" />
                <PwInput field="newPassword" label="Mật khẩu mới" showKey="new" />
                <PwInput field="confirmPassword" label="Xác nhận mật khẩu mới" showKey="confirm" />

                <div className="flex justify-end pt-2">
                  <motion.button
                    type="submit"
                    disabled={pwLoading}
                    whileHover={{ scale: pwLoading ? 1 : 1.02 }}
                    whileTap={{ scale: pwLoading ? 1 : 0.98 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-rose-600/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {pwLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Đang đổi...
                      </>
                    ) : (
                      <><KeyRound size={15} />Đổi mật khẩu</>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Quick stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6"
        >
          {[
            { label: "Vé đã mua", value: ticketCount, note: "Xem lịch sử", isLink: true, href: "/purchase-history" },
            { label: "Đánh giá", value: "—", note: "Sắp ra mắt" },
            { label: "Điểm thưởng", value: "—", note: "Sắp ra mắt" },
          ].map(({ label, value, note, isLink, href }) => {
            const cardContent = (
              <>
                <p className="text-2xl font-bold text-white">
                  {value}
                </p>
                <p className="text-sm text-zinc-400 font-medium">{label}</p>
                <p className={`text-xs mt-1 ${isLink ? "text-rose-500 font-semibold" : "text-zinc-600"}`}>{note}</p>
              </>
            );
            if (isLink) {
              return (
                <Link
                  key={label}
                  to={href}
                  className="rounded-2xl border border-white/5 p-5 flex flex-col gap-1 hover:border-rose-500/30 transition-all cursor-pointer"
                  style={{ background: "rgba(31,35,43,0.4)" }}
                >
                  {cardContent}
                </Link>
              );
            }
            return (
              <div
                key={label}
                className="rounded-2xl border border-white/5 p-5 flex flex-col gap-1"
                style={{ background: "rgba(31,35,43,0.4)" }}
              >
                {cardContent}
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
