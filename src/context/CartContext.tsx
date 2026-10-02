'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductItem } from '@/lib/initialData';

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  buyNowItem: CartItem | null;
  setBuyNowItem: (item: CartItem | null) => void;
  clearBuyNowItem: () => void;
  addToCart: (product: ProductItem, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  buyNowItem: null,
  setBuyNowItem: () => {},
  clearBuyNowItem: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isCartOpen: false,
  setIsCartOpen: () => {},
  totalItems: 0,
  subtotal: 0,
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [buyNowItem, setBuyNowItemState] = useState<CartItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cropnex_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
      const savedBuyNow = sessionStorage.getItem('cropnex_buynow');
      if (savedBuyNow) {
        setBuyNowItemState(JSON.parse(savedBuyNow));
      }
    } catch (e) {
      console.warn('Could not restore cart from storage', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cropnex_cart', JSON.stringify(cart));
    } catch (e) {
      // ignore
    }
  }, [cart]);

  const setBuyNowItem = (item: CartItem | null) => {
    setBuyNowItemState(item);
    if (item) {
      try {
        sessionStorage.setItem('cropnex_buynow', JSON.stringify(item));
      } catch (e) {}
    } else {
      try {
        sessionStorage.removeItem('cropnex_buynow');
      } catch (e) {}
    }
  };

  const clearBuyNowItem = () => {
    setBuyNowItemState(null);
    try {
      sessionStorage.removeItem('cropnex_buynow');
    } catch (e) {}
  };

  const addToCart = (product: ProductItem, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce(
    (acc, item) => acc + item.product.pricePerKg * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        buyNowItem,
        setBuyNowItem,
        clearBuyNowItem,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
