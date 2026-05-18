import { Film, Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#0a0c0f] pt-16 pb-8 border-t border-white/5 relative z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="bg-primary p-2 rounded-xl text-white">
                <Film size={24} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Cine<span className="text-primary">Max</span>
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6">
              Trải nghiệm điện ảnh đỉnh cao với hệ thống rạp chiếu phim hiện đại nhất. Đặt vé dễ dàng, thưởng thức trọn vẹn.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300">
                <Mail size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300">
                <Phone size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300">
                <MapPin size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Phim</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/" className="hover:text-primary transition-colors">Phim đang chiếu</Link></li>
              <li><Link to="/coming-soon" className="hover:text-primary transition-colors">Phim sắp chiếu</Link></li>
              <li><Link to="/top-rated" className="hover:text-primary transition-colors">Phim hay nhất</Link></li>
              <li><Link to="/promotions" className="hover:text-primary transition-colors">Khuyến mãi</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Hỗ trợ</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="#" className="hover:text-primary transition-colors">Góp ý</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Rạp chiếu</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Tuyển dụng</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Chính sách</h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="#" className="hover:text-primary transition-colors">Điều khoản chung</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Chính sách thanh toán</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Bảo mật thông tin</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} CineMax. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
