import { Link } from 'react-router-dom';
import {
  Smartphone, Laptop, Headphones, Watch, Home, Cable,
  Recycle, Wrench, Tag, Newspaper, Tablet
} from 'lucide-react';
import BannerSlider from './BannerSlider';

const categories = [
  { label: 'Điện thoại', icon: Smartphone, slug: 'phones' },
  { label: 'Hàng cũ', icon: Recycle, slug: 'used' },
  { label: 'Laptop', icon: Laptop, slug: 'laptops' },
  { label: 'Máy tính bảng', icon: Tablet, slug: 'tablets' },
  { label: 'Âm Thanh', icon: Headphones, slug: 'speakers' },
  { label: 'Đồng hồ', icon: Watch, slug: 'smartwatches' },
  { label: 'Nhà Thông Minh', icon: Home, slug: 'smart-home' },
  { label: 'Phụ kiện', icon: Cable, slug: 'accessories' },
  { label: 'Thu Mua', icon: Recycle, slug: 'buyback' },
  { label: 'Sửa Chữa', icon: Wrench, slug: 'repair' },
  { label: 'Khuyến Mãi', icon: Tag, slug: 'deals' },
  { label: 'Tin tức', icon: Newspaper, slug: 'news', path: '/tin-tuc' },
];

const promos = [
  { title: 'THU CŨ ĐỔI MỚI', desc: 'Trợ giá lên đến 5.000.000đ', bg: 'from-orange-500 to-red-500' },
  { title: 'TRẢ GÓP 0%', desc: 'Duyệt nhanh - Lãi suất 0%', bg: 'from-blue-600 to-blue-800' },
  { title: 'BẢO HÀNH 12 THÁNG', desc: 'Đổi 1-1 trong 30 ngày', bg: 'from-green-600 to-green-800' },
];

const HomeHero = () => (
  <section className="mb-6">
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="hidden overflow-hidden rounded-[24px] border border-yellow-200/70 bg-white/90 shadow-[0_16px_40px_rgba(17,24,39,0.06)] lg:col-span-2 lg:block">
        <div className="border-b border-yellow-100 bg-[#FFF8E1] px-3 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-gray-900">
          Danh mục nổi bật
        </div>
        <ul className="divide-y divide-gray-100">
          {categories.map(({ label, icon: Icon, slug, path }) => (
            <li key={label}>
              <Link
                to={path || `/category/${slug}`}
                className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-[#FFF3C4] hover:text-gray-900"
              >
                <Icon size={16} className="flex-shrink-0 text-[#C28A00]" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="lg:col-span-7">
        <BannerSlider />
      </div>

      <div className="hidden flex-col gap-3 lg:col-span-3 lg:flex">
        {promos.map((promo) => (
          <div
            key={promo.title}
            className={`flex min-h-[120px] flex-1 cursor-pointer flex-col justify-center rounded-[24px] bg-gradient-to-br ${promo.bg} p-4 text-white transition hover:opacity-95`}
          >
            <h3 className="text-sm font-black uppercase leading-tight">{promo.title}</h3>
            <p className="mt-1 text-xs opacity-90">{promo.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HomeHero;
