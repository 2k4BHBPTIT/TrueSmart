import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ProductCard = ({ product, compact = false }) => {
  const { addToCart } = useContext(CartContext);
  const imageUrl = product.image?.startsWith('http')
    ? product.image
    : `${API_BASE}${product.image?.startsWith('/') ? '' : '/'}${product.image || '/uploads/no-image.jpg'}`;

  const price = product.dealPrice || product.price;
  const rating = product.rating || 5;

  if (compact) {
    return (
      <div className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-yellow-200/70 bg-[#FFFDF7] transition-all hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(245,196,0,0.16)]">
        <Link to={`/product/${product._id}`} className="block">
          <div className="flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF8E1] to-white p-3">
            <img
              src={imageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
        <div className="flex flex-grow flex-col p-3">
          <Link to={`/product/${product._id}`}>
            <h3 className="min-h-[32px] text-[11px] font-bold uppercase leading-tight text-gray-900 transition hover:text-[#D0021B] line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <p className="mt-2 text-sm font-black text-[#D0021B]">
            {price > 0 ? `${price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
          </p>
          <div className="mt-1 flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className={i < Math.round(rating) ? 'fill-[#FFD700] text-[#FFD700]' : 'text-gray-200'} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-yellow-200/70 bg-[#FFFDF7] transition-all hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(245,196,0,0.16)]">
      <Link to={`/product/${product._id}`} className="relative block">
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF8E1] to-white p-4">
          <img
            src={imageUrl}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="flex flex-grow flex-col p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="text-sm font-bold uppercase leading-tight text-gray-900 transition hover:text-[#D0021B] line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div>
            <p className="text-lg font-black text-[#D0021B]">
              {price > 0 ? `${price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
            </p>
            <div className="mt-1 flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className={i < Math.round(rating) ? 'fill-[#FFD700] text-[#FFD700]' : 'text-gray-200'} />
              ))}
            </div>
          </div>
          <button
            onClick={() => addToCart(product)}
            className="rounded-full bg-[#111827] px-3 py-2 text-xs font-black text-[#FFD700] transition hover:bg-[#1f2937]"
          >
            Mua
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
