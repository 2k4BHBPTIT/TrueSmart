// src/context/CartContext.jsx
import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cartItems');
      const parsed = savedCart ? JSON.parse(savedCart) : [];
      return Array.isArray(parsed) ? parsed.map(item => ({
        _id: item._id,
        name: String(item.name || ''),
        price: Math.max(0, Number(item.price) || 0),
        image: item.image,
        quantity: Math.max(1, Number(item.quantity) || 1)
      })).filter(item => item._id)
      : [];
    } catch (e) {
      console.error('Lỗi parse cart từ localStorage:', e);
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Lỗi lưu cart vào localStorage:', e);
    }
  }, [cartItems]);

  const addToCart = (product) => {
    if (!product?._id) return;
    const finalPrice = Math.max(0, Number(product.dealPrice || product.price || 0));
    const quantity = Math.max(1, Number(product.quantity) || 1);
    
    setCartItems(prev => {
      const isExist = prev.find(item => item._id === product._id);
      if (isExist) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: Math.min(99, item.quantity + quantity), price: finalPrice }
            : item
        );
      }
      return [...prev, {
        _id: product._id,
        name: String(product.name || ''),
        price: finalPrice,
        image: product.image,
        quantity: quantity
      }];
    });
  };

  const updateQuantity = (id, amount) => {
    setCartItems(prev => prev.map(item =>
      item._id === id
        ? { ...item, quantity: Math.max(1, Math.min(99, item.quantity + amount)) }
        : item
    ));
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  };

  const clearCart = () => setCartItems([]);

  const totalPrice = cartItems.reduce((total, item) => {
    const price = Math.max(0, Number(item.price) || 0);
    const qty = Math.max(0, Number(item.quantity) || 0);
    return total + (price * qty);
  }, 0);

  const prepareCheckout = (selectedIds = null) => {
    if (!selectedIds || selectedIds.length === 0) {
      setCheckoutItems([...cartItems]);
    } else {
      setCheckoutItems(cartItems.filter(i => selectedIds.includes(i._id)));
    }
  };

  const clearCheckout = () => setCheckoutItems([]);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, updateQuantity, removeFromCart, clearCart, totalPrice,
      isCartOpen, setIsCartOpen,
      checkoutItems, prepareCheckout, clearCheckout
    }}>
      {children}
    </CartContext.Provider>
  );
};
