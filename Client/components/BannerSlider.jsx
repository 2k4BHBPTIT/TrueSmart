import { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { useNavigate } from 'react-router-dom';

const tabs = [
  { label: 'iPhone 17 Series', slideIndex: 0 },
  { label: 'Samsung Galaxy', slideIndex: 1 },
  { label: 'Loa Bluetooth', slideIndex: 2 },
];

const slides = [
  {
    id: 1,
    title: 'iPhone 17 (Series)',
    badges: ['TRẢ GÓP 0%', 'THU CŨ ĐỔI MỚI', 'BẢO HÀNH 12 THÁNG'],
    bg: 'from-gray-900 via-gray-800 to-black',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
    link: '/category/phones',
  },
  {
    id: 2,
    title: 'THÔNG MINH HƠN BỀN BỊ HƠN',
    badges: ['SAMSUNG GALAXY S25', 'CHÍNH HÃNG VN/A'],
    bg: 'from-indigo-900 via-purple-900 to-black',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80',
    link: '/search?q=Samsung',
  },
  {
    id: 3,
    title: 'LOA BLUETOOTH CAO CẤP',
    badges: ['BOSE', 'MARSHALL', 'JBL', 'HARMAN KARDON'],
    bg: 'from-amber-900 via-orange-900 to-black',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80',
    link: '/category/speakers',
  },
];

const BannerSlider = () => {
  const navigate = useNavigate();
  const swiperRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabClick = (index) => {
    setActiveTab(index);
    swiperRef.current?.slideTo(index);
  };

  return (
    <div className="overflow-hidden rounded-[24px] border border-yellow-200/70 shadow-[0_16px_40px_rgba(17,24,39,0.08)]">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        loop
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          const realIndex = ((swiper.realIndex % slides.length) + slides.length) % slides.length;
          setActiveTab(realIndex);
        }}
        className="hero-slider h-[220px] md:h-[320px] lg:h-[380px]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className={`relative w-full h-full bg-gradient-to-r ${slide.bg} cursor-pointer`}
              onClick={() => navigate(slide.link)}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
              <div className="relative z-10 flex h-full max-w-lg flex-col justify-center p-6 md:p-10">
                <h2 className="mb-4 text-xl font-black uppercase leading-tight text-white md:text-3xl lg:text-4xl">
                  {slide.title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {slide.badges.map((badge) => (
                    <span key={badge} className="rounded-full bg-[#FFD700] px-3 py-1 text-[10px] font-black text-gray-900 md:text-xs">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Tabs dưới banner */}
      <div className="flex border-t border-gray-100 bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleTabClick(tab.slideIndex)}
            className={`flex-1 py-2.5 text-[10px] font-bold uppercase transition-colors md:text-xs ${
              activeTab === tab.slideIndex
                ? 'border-b-2 border-[#D0021B] bg-[#FFF3C4] text-[#D0021B]'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
