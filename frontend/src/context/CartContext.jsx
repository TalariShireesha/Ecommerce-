import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // ---------------- FETCH CART ----------------
  const fetchCart = async () => {
    try {
      const res = await api.get("/api/cart");
      setCart(res.data);
    } catch (err) {
      // If user not logged in, cart should be empty
      setCart([]);
    }
  };

  // ---------------- ADD TO CART ----------------
  const addToCart = async (productId) => {
    await api.post(`/api/cart/add/${productId}`);
    fetchCart();
  };

  // ---------------- REMOVE FROM CART ----------------
  const removeFromCart = async (productId) => {
    await api.post(`/api/cart/decrease/${productId}`);
    fetchCart();
  };

  // ---------------- WATCH TOKEN ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetchCart();   // login / refresh
    } else {
      setCart([]);   // logout
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        fetchCart,
        addToCart,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
