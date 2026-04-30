'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id?: string | number;
  Id?: string | number;
  name: string;
  price: number;
  quantity?: number;
  imageUrl?: string;
  colorId?: number;
  sizeId?: number;
  copyId?: number;
  colorName?: string;
  sizeName?: string;
  copyName?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (product: CartItem) => void;
  updateQuantity: (product: CartItem, newQuantity: number) => void; // <--- دالة جديدة
  clearCart: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getUniqueKey = (item: CartItem) => {
  const id = item.id || item.Id || 'unknown';
  const color = item.colorId || 0;
  const size = item.sizeId || 0;
  const copy = item.copyId || 0;
  return `${id}-${color}-${size}-${copy}`;
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to load cart", error);
        localStorage.removeItem('cart');
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product: CartItem) => {
    setCart((prevCart) => {
      const uniqueKey = getUniqueKey(product);
      const existingItem = prevCart.find((item) => getUniqueKey(item) === uniqueKey);

      if (existingItem) {
        // إذا وجد المنتج، نزيد 1 فقط
        return prevCart.map((item) =>
          getUniqueKey(item) === uniqueKey
            ? { ...item, quantity: (item.quantity || 0) + 1 }
            : item
        );
      } else {
        // منتج جديد
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // --- الدالة الجديدة لتحديث الكمية يدوياً (ستحل مشكلة زر -) ---
  const updateQuantity = (product: CartItem, newQuantity: number) => {
    setCart((prevCart) => {
      const uniqueKey = getUniqueKey(product);
      return prevCart.map((item) =>
        getUniqueKey(item) === uniqueKey
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  const removeFromCart = (product: CartItem) => {
    setCart((prevCart) => prevCart.filter((item) => getUniqueKey(item) !== getUniqueKey(product)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * (item.quantity || 0)), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};