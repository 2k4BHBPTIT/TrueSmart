// src/components/ProductList.jsx
import ProductCard from './ProductCard';

const ProductList = ({ products, title }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      {/* Tiêu đề Container */}
      <div className="flex items-center justify-between mb-8 border-b-2 border-gray-100 pb-4">
        <h2 className="text-2xl font-black italic uppercase text-gray-900 relative">
          {title}
          <span className="absolute -bottom-[18px] left-0 w-20 h-1 bg-red-600"></span>
        </h2>
        <button className="text-sm font-bold text-red-600 hover:underline">Xem tất cả ›</button>
      </div>

      {/* Lưới sản phẩm */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-200">
          <p className="text-gray-500 italic">Đang cập nhật sản phẩm...</p>
        </div>
      )}
    </section>
  );
};

export default ProductList;