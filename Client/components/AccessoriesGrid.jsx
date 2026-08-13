import { Link } from 'react-router-dom';

const accessoryItems = [
  { label: 'Featured', featured: true, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80' },
  { label: 'Phụ kiện Apple', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80' },
  { label: 'Dán màn hình', image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=900&q=80' },
  { label: 'Ốp lưng', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80' },
  { label: 'Cáp sạc', image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80' },
  { label: 'Pin dự phòng', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80' },
  { label: 'Thiết bị mạng', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80' },
  { label: 'Gaming Gear', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80' },
  { label: 'Gimbal', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80' },
  { label: 'Thẻ nhớ/USB', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80' },
  { label: 'Chuột/Bàn phím', image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=900&q=80' },
  { label: 'Sim 4G', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80' },
  { label: 'Camera hành trình', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80' },
  { label: 'Camera an ninh', image: 'https://images.unsplash.com/photo-1563291074-2bf8677ac0e5?auto=format&fit=crop&w=900&q=80' },
  { label: 'Phụ kiện Laptop', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80' },
  { label: 'Quạt mini', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80' },
  { label: 'Ba lô/Túi xách', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80' },
  { label: 'Dây đeo đồng hồ', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80' },
  { label: 'Ổ cứng di động', image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80' },
  { label: 'Apple Care', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80' },
];

const usedItems = [
  { label: 'iPhone Cũ', bg: 'bg-purple-100', slug: 'used-iphone', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80' },
  { label: 'Samsung Cũ', bg: 'bg-blue-100', slug: 'used-samsung', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80' },
  { label: 'Macbook cũ', bg: 'bg-amber-100', slug: 'used-macbook', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80' },
  { label: 'iPad Cũ', bg: 'bg-pink-100', slug: 'used-ipad', image: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=900&q=80' },
  { label: 'Đồng hồ thông minh cũ', bg: 'bg-green-800 text-white', slug: 'used-watch', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80' },
];

const AccessoriesGrid = () => (
  <>
    <section className="mb-6 rounded-[24px] border border-yellow-200/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(17,24,39,0.06)] md:p-6">
      <h2 className="section-title mb-5">PHỤ KIỆN</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
        {accessoryItems.map(({ label, featured, image }) => (
          <Link
            key={label}
            to={`/search?q=${encodeURIComponent(label)}`}
            className="group relative aspect-square overflow-hidden rounded-2xl shadow-sm"
          >
            <img src={image} alt={label} className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="relative z-10 flex h-full flex-col justify-between p-2">
              <span className="text-[10px] font-black leading-tight text-white">
                {featured && '🏅 '}{label}
              </span>
              <div className="self-end h-8 w-8 rounded-full border border-white/70 bg-white/15 backdrop-blur-sm" />
            </div>
          </Link>
        ))}
      </div>
    </section>

    <section className="mb-6 rounded-[24px] border border-yellow-200/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(17,24,39,0.06)] md:p-6">
      <h2 className="section-title mb-5">HÀNG CŨ</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {usedItems.map(({ label, bg, slug, image }) => (
          <Link
            key={label}
            to={`/category/${slug}`}
            className={`group relative h-36 overflow-hidden rounded-xl p-4 shadow-sm ${bg}`}
          >
            <img src={image} alt={label} className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <span className="relative z-10 text-sm font-black leading-tight text-white">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  </>
);

export default AccessoriesGrid;
