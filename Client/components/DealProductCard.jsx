// src/components/DealProductCard.jsx
import { Star, ShoppingCart, Clock } from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const DealProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  // ==========================================
  // LOGIC ĐỒNG HỒ ĐẾM NGƯỢC CHO TỪNG SẢN PHẨM
  // ==========================================
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Lấy thời gian kết thúc từ Backend (nếu không có, mặc định cho 2 tiếng để test)
    const endTime = product.dealEndTime || product.endTime 
      ? new Date(product.dealEndTime || product.endTime).getTime() 
      : new Date().getTime() + 2 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [product.dealEndTime, product.endTime]);

  const formatPrice = (price) => {
    if (!price) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/cart');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col items-center p-2 border border-gray-100 group relative">
      
      {/* Phần ảnh */}
      <div className="w-full aspect-square bg-gradient-to-b from-red-500 to-red-700 rounded-md relative flex items-center justify-center overflow-hidden">
        <img 
          src={product.image || 'https://via.placeholder.com/300'} 
          alt={product.name} 
          className="w-4/5 h-4/5 object-contain group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded shadow-sm">
          HOT 
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white flex justify-center items-center py-1.5 gap-1 text-[10px] font-bold backdrop-blur-sm">
          <Clock size={12} className="text-yellow-400 mr-1 animate-pulse" />
          Số Lượng Có Hạn
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="w-full text-center mt-3 pb-2">
        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        
        <div className="flex justify-center gap-0.5 my-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} fill={i < 4 ? "#f59e0b" : "none"} stroke="#f59e0b" />
          ))}
        </div>

        <div className="mt-1 flex flex-col items-center">
          {product.oldPrice && (
            <p className="text-[10px] text-gray-400 line-through">{formatPrice(product.oldPrice)}</p>
          )}
          {/* Lấy dealPrice nếu có, không thì lấy price gốc */}
          <p className="text-ts-red font-black text-lg">{formatPrice(product.dealPrice || product.price)}</p>
        </div>

        {/* Nút chức năng */}
        <div className="grid grid-cols-1 gap-2 mt-3">
          <button 
            onClick={handleBuyNow}
            className="bg-ts-red hover:bg-black text-white text-[11px] font-black py-2.5 rounded transition-all uppercase shadow-md"
          >
            Mua ngay
          </button>
          <button 
            onClick={() => addToCart(product)}
            className="border border-gray-300 hover:bg-red-50 hover:border-red-600 hover:text-red-600 text-gray-700 text-[10px] font-black py-2 rounded transition-all uppercase flex items-center justify-center gap-1"
          >
            <ShoppingCart size={12} /> + Giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default DealProductCard;