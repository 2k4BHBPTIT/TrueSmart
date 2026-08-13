// src/components/CartSidebar.jsx
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CartSidebar = () => {
  const { cartItems, updateQuantity, removeFromCart, totalPrice, isCartOpen, setIsCartOpen, prepareCheckout } = useContext(CartContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      alert('Giỏ hàng đang trống!');
      return;
    }
    prepareCheckout(null);
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const goToCartDetail = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 z-[150] transition-opacity ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
           onClick={() => setIsCartOpen(false)} />

      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[200] shadow-2xl transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col italic`}>
        <div className="p-4 border-b flex justify-between items-center bg-red-600 text-white">
          <h2 className="font-black uppercase">Giỏ hàng của bạn</h2>
          <button onClick={() => setIsCartOpen(false)}><X size={24}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-center py-10 text-gray-500 font-bold">Giỏ hàng đang trống</p>
          ) : (
            cartItems.map(item => (
              <div key={item._id} className="flex gap-4 border-b pb-4">
                <img 
                  src={item.image?.startsWith('http') ? item.image : `http://localhost:5000/uploads/${item.image}`} 
                  className="w-20 h-20 object-cover rounded" 
                  alt={item.name} 
                />
                <div className="flex-1">
                  <h3 className="font-bold text-sm line-clamp-1 uppercase">{item.name}</h3>
                  <p className="text-red-600 font-bold">{item.price?.toLocaleString()}đ</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQuantity(item._id, -1)} className="p-1 bg-gray-100 rounded"><Minus size={12}/></button>
                    <span className="font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, 1)} className="p-1 bg-gray-100 rounded"><Plus size={12}/></button>
                    <button onClick={() => removeFromCart(item._id)} className="ml-auto text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between font-black mb-4">
            <span>TỔNG CỘNG:</span>
            <span className="text-red-600">{totalPrice.toLocaleString()}đ</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={goToCartDetail} className="text-center py-3 border-2 border-red-600 text-red-600 font-bold rounded hover:bg-red-50 transition">
              XEM CHI TIẾT
            </button>
            <button onClick={handleCheckout} className="text-center py-3 bg-red-600 text-white font-bold rounded hover:bg-black transition">
              THANH TOÁN
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartSidebar;