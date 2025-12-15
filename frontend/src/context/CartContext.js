import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
    setCartOpen(true); // abre el carrito cuando agregas algo
  };

  const removeFromCart = (index) =>
    setCart((prev) => prev.filter((_, i) => i !== index));

  const getTotal = () =>
    cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        getTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
