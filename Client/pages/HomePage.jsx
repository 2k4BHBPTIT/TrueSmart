import { useEffect, useState } from 'react';
import API from '../api/axios';
import HomeHero from '../components/HomeHero';
import TrustBadges from '../components/TrustBadges';
import ProductCarouselSection from '../components/ProductCarouselSection';
import AccessoriesGrid from '../components/AccessoriesGrid';
import DealProductCard from '../components/DealProductCard';
import ProductCard from '../components/ProductCard';

const HomePage = ({ products, dealProducts }) => {
  const [phoneProducts, setPhoneProducts] = useState([]);
  const [speakerProducts, setSpeakerProducts] = useState([]);
  const [accessoryProducts, setAccessoryProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredPhones, setFeaturedPhones] = useState([]);
  const [featuredTablets, setFeaturedTablets] = useState([]);
  const [featuredLaptops, setFeaturedLaptops] = useState([]);
  const [featuredRepair, setFeaturedRepair] = useState([]);
  const [homeLayout, setHomeLayout] = useState({ layoutOrder: ['banner', 'flashSale', 'featured', 'featuredPhones', 'featuredTablets', 'featuredLaptops', 'featuredRepair', 'video', 'brands'], sectionVisibility: { banner: true, flashSale: true, featured: true, featuredPhones: true, featuredTablets: true, featuredLaptops: true, featuredRepair: true, video: true, brands: true } });

  useEffect(() => {
    const fetchByCategory = async () => {
      try {
        const [
          phones,
          speakers,
          accessories,
          featuredRes,
          featuredPhonesRes,
          featuredTabletsRes,
          featuredLaptopsRes,
          featuredRepairRes
        ] = await Promise.all([
          API.get('/products', { params: { category: 'Phones', limit: 20 } }),
          API.get('/products', { params: { category: 'Speakers', limit: 20 } }),
          API.get('/products', { params: { category: 'Accessories', limit: 20 } }),
          API.get('/products/get-featured'),
          API.get('/products/get-featured', { params: { category: 'Phones', limit: 8 } }),
          API.get('/products/get-featured', { params: { category: 'Tablets', limit: 8 } }),
          API.get('/products/get-featured', { params: { category: 'Laptops', limit: 8 } }),
          API.get('/products/get-featured', { params: { category: 'Repair', limit: 8 } }),
        ]);
        setPhoneProducts(phones.data.products || []);
        setSpeakerProducts(speakers.data.products || []);
        setAccessoryProducts(accessories.data.products || []);
        setFeaturedProducts(Array.isArray(featuredRes.data) ? featuredRes.data : (featuredRes.data?.products || featuredRes.data?.featured || []));
        setFeaturedPhones(Array.isArray(featuredPhonesRes.data) ? featuredPhonesRes.data : []);
        setFeaturedTablets(Array.isArray(featuredTabletsRes.data) ? featuredTabletsRes.data : []);
        setFeaturedLaptops(Array.isArray(featuredLaptopsRes.data) ? featuredLaptopsRes.data : []);
        setFeaturedRepair(Array.isArray(featuredRepairRes.data) ? featuredRepairRes.data : []);
      } catch (err) {
        console.error('Lỗi tải sản phẩm theo danh mục', err);
      }
    };

    const fetchHomeLayout = async () => {
      try {
        const res = await API.get('/settings');
        setHomeLayout({
          layoutOrder: res.data?.layoutOrder || ['banner', 'flashSale', 'featured', 'featuredPhones', 'featuredTablets', 'featuredLaptops', 'featuredRepair', 'video', 'brands'],
          sectionVisibility: res.data?.sectionVisibility || { banner: true, flashSale: true, featured: true, featuredPhones: true, featuredTablets: true, featuredLaptops: true, featuredRepair: true, video: true, brands: true },
        });
      } catch (err) {
        console.error('Lỗi tải cấu hình trang chủ', err);
      }
    };

    fetchByCategory();
    fetchHomeLayout();
  }, []);

  const allProducts = products || [];
  const renderSection = (key) => {
    if (!homeLayout.sectionVisibility?.[key]) return null;

    switch (key) {
      case 'banner':
        return <HomeHero key={key} />;
      case 'flashSale':
        return (
          <section key={key} className="mb-6 rounded-[24px] border border-red-200/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(17,24,39,0.06)] md:p-6">
            <h2 className="section-title mb-5 text-[#D0021B]">⚡ FLASH SALE</h2>
            {dealProducts?.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                {dealProducts.map((item) => (
                  <DealProductCard key={item._id} product={item} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 font-bold">Đang cập nhật...</p>
            )}
          </section>
        );
      case 'featured':
        return (
          <section key={key} className="mb-6 rounded-[24px] border border-yellow-200/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(17,24,39,0.06)] md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="section-title">SẢN PHẨM NỔI BẬT</h2>
                <p className="mt-1 text-sm text-gray-500">Các mặt hàng được đánh dấu nổi bật từ hệ thống.</p>
              </div>
            </div>
            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} compact />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 font-bold">Đang cập nhật sản phẩm nổi bật...</p>
            )}
          </section>
        );
      case 'featuredPhones':
        return (
          <section key={key} className="mb-6 rounded-[24px] border border-blue-200/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(17,24,39,0.06)] md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="section-title">ĐIỆN THOẠI NỔI BẬT</h2>
                <p className="mt-1 text-sm text-gray-500">Những mẫu điện thoại được yêu thích nhất.</p>
              </div>
            </div>
            {featuredPhones.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
                {featuredPhones.map((product) => (
                  <ProductCard key={product._id} product={product} compact />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 font-bold">Đang cập nhật điện thoại nổi bật...</p>
            )}
          </section>
        );
      case 'featuredTablets':
        return (
          <section key={key} className="mb-6 rounded-[24px] border border-purple-200/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(17,24,39,0.06)] md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="section-title">MÁY TÍNH BẢNG NỔI BẬT</h2>
                <p className="mt-1 text-sm text-gray-500">iPad và các dòng máy tính bảng hot nhất.</p>
              </div>
            </div>
            {featuredTablets.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
                {featuredTablets.map((product) => (
                  <ProductCard key={product._id} product={product} compact />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 font-bold">Đang cập nhật máy tính bảng nổi bật...</p>
            )}
          </section>
        );
      case 'featuredLaptops':
        return (
          <section key={key} className="mb-6 rounded-[24px] border border-green-200/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(17,24,39,0.06)] md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="section-title">LAPTOP NỔI BẬT</h2>
                <p className="mt-1 text-sm text-gray-500">MacBook, Dell, ASUS... đang được săn đón.</p>
              </div>
            </div>
            {featuredLaptops.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
                {featuredLaptops.map((product) => (
                  <ProductCard key={product._id} product={product} compact />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 font-bold">Đang cập nhật laptop nổi bật...</p>
            )}
          </section>
        );
      case 'featuredRepair':
        return (
          <section key={key} className="mb-6 rounded-[24px] border border-orange-200/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(17,24,39,0.06)] md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="section-title">DỊCH VỤ SỬA CHỮA</h2>
                <p className="mt-1 text-sm text-gray-500">Thay màn hình, thay pin, sửa chữa chuyên nghiệp.</p>
              </div>
            </div>
            {featuredRepair.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
                {featuredRepair.map((product) => (
                  <ProductCard key={product._id} product={product} compact />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 font-bold">Đang cập nhật dịch vụ sửa chữa...</p>
            )}
          </section>
        );
      case 'video':
        return <TrustBadges key={key} />;
      case 'brands':
        return (
          <div key={key}>
            <AccessoriesGrid />
            <section className="mb-6 flex h-48 items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-r from-gray-900 to-black relative md:h-64">
              <div className="z-10 px-4 text-center">
                <h2 className="text-2xl font-black uppercase tracking-wide text-white md:text-4xl">CÔNG NGHỆ THÔNG MINH</h2>
                <p className="mt-2 text-sm text-gray-400">Chính hãng - Giá tốt nhất thị trường</p>
              </div>
            </section>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-3 py-4 md:px-4">
        {homeLayout.layoutOrder.map((key) => renderSection(key))}

        {homeLayout.layoutOrder.length === 0 && (
          <>
            <HomeHero />
            <TrustBadges />
            {dealProducts?.length > 0 && (
              <section className="mb-6 rounded-[24px] border border-red-200/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(17,24,39,0.06)] md:p-6">
                <h2 className="section-title mb-5 text-[#D0021B]">⚡ FLASH SALE</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                  {dealProducts.map((item) => (
                    <DealProductCard key={item._id} product={item} />
                  ))}
                </div>
              </section>
            )}
            <ProductCarouselSection
              title="Điện thoại di động"
              filters={['Samsung', 'iPhone', 'Vertu Cao Cấp', 'Xiaomi']}
              products={phoneProducts.length ? phoneProducts : allProducts.filter((p) => p.category === 'Phones')}
            />
            <ProductCarouselSection
              title="Thiết bị âm thanh"
              filters={['Loa Bluetooth Bose', 'Loa Bluetooth Harman Kardon', 'Loa Bluetooth Marshall', 'Loa Bluetooth JBL', 'Loa B&O']}
              products={speakerProducts.length ? speakerProducts : allProducts.filter((p) => p.category === 'Speakers')}
            />
            <ProductCarouselSection
              title="Sửa chữa điện thoại"
              filters={['Sửa chữa iPhone', 'Sửa chữa Apple Watch', 'Sửa chữa Airpods', 'Sửa chữa Huawei', 'Sửa chữa Asus', 'Mạ vàng điện thoại']}
              products={accessoryProducts.length ? accessoryProducts : allProducts.filter((p) => p.category === 'Accessories')}
            />
            <AccessoriesGrid />
            <section className="mb-6 flex h-48 items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-r from-gray-900 to-black relative md:h-64">
              <div className="z-10 px-4 text-center">
                <h2 className="text-2xl font-black uppercase tracking-wide text-white md:text-4xl">CÔNG NGHỆ THÔNG MINH</h2>
                <p className="mt-2 text-sm text-gray-400">Chính hãng - Giá tốt nhất thị trường</p>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
