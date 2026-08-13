import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import { CartContext } from '../context/CartContext';
import { Star, ShoppingCart, ShieldCheck, Truck, RotateCcw, Minus, Plus } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProductData = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Không thể lấy dữ liệu SP");
      } finally {
        setLoading(false);
      }
    };
    getProductData();
  }, [id]);

  if (loading) return <div className="p-20 text-center font-black text-gray-400">Đang đồng bộ dữ liệu kho...</div>;
  if (!product) return <div className="p-20 text-center font-black text-red-600">Sản phẩm không tồn tại!</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        
        {/* HÌNH ẢNH THỰC TỪ DB */}
        <div className="bg-gray-50 rounded-2xl p-10 flex items-center justify-center border border-gray-100 relative">
          <img src={product.image} alt={product.name} className="w-full max-h-[500px] object-contain transition-transform hover:scale-105" />
          {product.countInStock <= 0 && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-black text-white px-6 py-2 rounded-lg font-black uppercase -rotate-12">Hết hàng</span>
            </div>
          )}
        </div>

        {/* THÔNG TIN THỰC TỪ DB */}
        <div className="flex flex-col">
          <p className="text-red-600 font-black uppercase text-sm tracking-widest mb-2">{product.brand || 'X-Billiard'}</p>
          <h1 className="text-4xl font-black text-gray-900 mb-4 uppercase leading-tight">{product.name}</h1>
          
          <div className="flex items-center gap-6 mb-6">
            {/* Đánh giá thật */}
            <div className="flex items-center gap-1 text-yellow-400">
              <span className="text-gray-900 font-black mr-1">{product.rating?.toFixed(1) || '5.0'}</span>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill={i < Math.round(product.rating || 5) ? "currentColor" : "none"} />
              ))}
              <span className="text-gray-400 font-bold ml-2">({product.numReviews} nhận xét)</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            {/* Đã bán thật */}
            <div className="text-gray-500 font-bold">Đã bán: <span className="text-gray-900">{product.sold}</span></div>
          </div>

          <div className="bg-gray-900 text-white p-6 rounded-2xl mb-8 flex items-baseline gap-4 shadow-xl">
            <span className="text-4xl font-black">{product.price?.toLocaleString()}đ</span>
            {product.oldPrice > product.price && (
              <span className="text-gray-400 line-through font-bold">{product.oldPrice.toLocaleString()}đ</span>
            )}
          </div>

          <div className="space-y-4 mb-8 text-gray-700 font-bold border-b pb-8">
            <div className="flex justify-between"><span>Trạng thái:</span> 
              <span className={product.countInStock > 0 ? "text-green-600" : "text-red-600"}>
                {product.countInStock > 0 ? `Còn Hàng` : 'Liên hệ đặt hàng'}
              </span>
            </div>
            <div className="flex justify-between"><span>Danh mục:</span> <span className="uppercase text-gray-900">{product.category}</span></div>
            <div className="flex justify-between"><span>Tình trạng:</span> <span className="text-blue-600">{product.condition || 'Mới'}</span></div>
          </div>

          {/* Điều khiển số lượng */}
          <div className="flex items-center gap-6 mb-8">
            <span className="font-black uppercase text-sm">Số lượng:</span>
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-3 hover:bg-gray-100"><Minus size={20}/></button>
              <input type="number" value={quantity} readOnly className="w-12 text-center font-black text-xl" />
              <button onClick={() => setQuantity(q => Math.min(product.countInStock, q + 1))} className="p-3 hover:bg-gray-100"><Plus size={20}/></button>
            </div>
          </div>

    <button 
      disabled={product.countInStock <= 0 || !Number.isInteger(quantity) || quantity < 1 || quantity > (product.countInStock || 0)}
      onClick={() => {
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > (product.countInStock || 0)) {
          alert(`Số lượng không hợp lệ! Vui lòng chọn từ 1 đến ${product.countInStock || 0}`);
          return;
        }
        const productToAdd = {
          ...product,
          quantity: quantity
        };
        addToCart(productToAdd, quantity);
      }}
      className="w-full bg-red-600 hover:bg-black text-white font-black py-5 rounded-2xl uppercase tracking-[0.2em] transition-all shadow-lg hover:shadow-red-600/20 disabled:bg-gray-300"
    >
      {product.countInStock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
    </button>

          {/* Cam kết uy tín */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="flex flex-col items-center gap-2 p-4 bg-white border rounded-2xl">
              <ShieldCheck className="text-red-600" />
              <span className="text-[10px] font-black uppercase text-center">Bảo hành trọn đời</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-white border rounded-2xl">
              <Truck className="text-red-600" />
              <span className="text-[10px] font-black uppercase text-center">Giao hàng 2H</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-white border rounded-2xl">
              <RotateCcw className="text-red-600" />
              <span className="text-[10px] font-black uppercase text-center">Đổi trả 7 ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* MÔ TẢ CHI TIẾT THỰC TỪ DB */}
      <div className="mt-12 bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-black uppercase border-b-4 border-red-600 inline-block mb-8">Mô tả sản phẩm</h2>
        <div className="text-gray-600 font-medium leading-relaxed whitespace-pre-line text-lg">
          {product.description || 'Hiện sản phẩm chưa có mô tả chi tiết từ nhà sản xuất.'}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;