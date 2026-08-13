import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductCarouselSection = ({ title, filters = [], products = [] }) => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  const filteredProducts = activeFilter
    ? products.filter((p) =>
        p.name?.toLowerCase().includes(activeFilter.toLowerCase()) ||
        p.category?.toLowerCase().includes(activeFilter.toLowerCase())
      )
    : products;

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products;

  const handleFilterClick = (filter) => {
    setActiveFilter(activeFilter === filter ? null : filter);
    navigate(`/search?q=${encodeURIComponent(filter)}`);
  };

  if (!products?.length) return null;

  return (
    <section className="mb-6 rounded-[24px] border border-yellow-200/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(17,24,39,0.06)] md:p-6">
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="section-title">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">Gợi ý sản phẩm nổi bật dành cho bạn.</p>
        </div>
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className={`filter-chip ${activeFilter === filter ? 'filter-chip-active' : ''}`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="group/carousel relative px-6">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={2}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
        >
          {displayProducts.map((product) => (
            <SwiperSlide key={product._id}>
              <ProductCard product={product} compact />
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          ref={prevRef}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-ts-yellow transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          ref={nextRef}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-ts-yellow transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default ProductCarouselSection;
