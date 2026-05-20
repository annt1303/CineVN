import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";

export default function NowShowingSection({ movies }) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollLimits = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    // Initial check and setup a small delay to allow DOM/images to render
    const timer = setTimeout(checkScrollLimits, 100);
    
    window.addEventListener("resize", checkScrollLimits);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScrollLimits);
    };
  }, [movies]);

  const handleScroll = () => {
    checkScrollLimits();
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      const targetScroll = direction === "left" 
        ? scrollLeft - scrollAmount 
        : scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="py-20 relative z-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="w-2 h-8 bg-primary rounded-full inline-block"></span>
              Phim Đang Chiếu
            </h2>
            <p className="text-gray-400">Danh sách phim bom tấn đang làm mưa làm gió tại rạp.</p>
          </div>
          <Link to="/all-movies" className="text-primary hover:text-white transition-colors font-medium flex items-center gap-1 group">
            Xem tất cả <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="relative group/carousel">
          {/* Left Arrow Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full glass hover:bg-primary hover:text-white text-gray-300 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg hidden md:flex md:opacity-0 md:group-hover/carousel:opacity-100"
              aria-label="Previous movies"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Right Arrow Button */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full glass hover:bg-primary hover:text-white text-gray-300 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg hidden md:flex md:opacity-0 md:group-hover/carousel:opacity-100"
              aria-label="Next movies"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Movie Slider Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex flex-row overflow-x-auto scroll-smooth scrollbar-none gap-6 pb-4 -mx-4 px-4 md:-mx-6 md:px-6"
          >
            {movies && movies.map((movie, index) => (
              <div
                key={movie.id}
                className="w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] flex-shrink-0"
              >
                <MovieCard movie={movie} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
