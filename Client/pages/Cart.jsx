// src/pages/Cart.jsx
import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, prepareCheckout } = useContext(CartContext);
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === cartItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(cartItems.map(item => item._id));
    }
  };

  const selectedTotal = cartItems
    .filter(item => selectedIds.includes(item._id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (selectedIds.length === 0) {
      return alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
    }
    prepareCheckout(selectedIds);
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl font-black mb-4 uppercase">Giỏ hàng trống</h2>
        <Link title="Tiếp tục mua sắm" to="/" className="text-red-600 hover:text-black font-bold transition-colors underline underline-offset-4 uppercase">Quay lại cửa hàng</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-black mb-8 uppercase border-l-4 border-red-600 pl-4">Giỏ hàng của bạn</h1>
      
      {/* THÔNG TIN CHỌN TẤT CẢ */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-4 flex items-center gap-4">
        <input 
          type="checkbox" 
          checked={selectedIds.length === cartItems.length && cartItems.length > 0}
          onChange={toggleSelectAll}
          className="w-5 h-5 accent-red-600 cursor-pointer"
        />
        <span className="font-bold uppercase text-sm">Chọn tất cả ({cartItems.length} sản phẩm)</span>
      </div>

      <div className="space-y-4">
        {cartItems.map(item => (
          <div key={item._id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border-2 transition-all ${selectedIds.includes(item._id) ? 'border-red-600 bg-red-50/20' : 'border-gray-100'}`}>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* CHECKBOX SẢN PHẨM */}
              <input 
                type="checkbox" 
                checked={selectedIds.includes(item._id)}
                onChange={() => toggleSelect(item._id)}
                className="w-5 h-5 accent-red-600 cursor-pointer"
              />
              
              <img 
                src={item.image?.startsWith('http') ? item.image : `http://localhost:5000/uploads/${item.image}`} 
                alt={item.name} 
                className="w-20 h-20 object-cover rounded-lg border border-gray-100" 
              />
              <div>
                <h3 className="font-black text-gray-800 line-clamp-2">{item.name}</h3>
                <p className="text-red-600 font-black mt-1">{item.price?.toLocaleString()}đ</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
              <div className="flex items-center border rounded-lg bg-gray-50">
                <button onClick={() => updateQuantity(item._id, -1)} className="p-2 hover:bg-gray-200 transition-colors rounded-l-lg"><Minus size={16}/></button>
                <span className="font-black w-8 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, 1)} className="p-2 hover:bg-gray-200 transition-colors rounded-r-lg"><Plus size={16}/></button>
              </div>
              <button onClick={() => removeFromCart(item._id)} className="ml-2 text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg transition-colors"><Trash2 size={20}/></button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center text-xl font-black mb-6 border-b pb-4">
          <span className="uppercase text-gray-700">Tổng thanh toán ({selectedIds.length} sản phẩm):</span>
          <span className="text-3xl text-red-600">{selectedTotal.toLocaleString()}đ</span>
        </div>
        
        {/* ĐỔI LINK THÀNH BUTTON ĐỂ GỌI HÀM KẾT HỢP GỬI DỮ LIỆU */}
        <button 
          onClick={handleCheckout} 
          className="w-full text-center bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-black transition-all shadow-lg hover:-translate-y-0.5"
        >
          Tiến hành đặt hàng
        </button>
      </div>
    </div>
  );
};

export default Cart;