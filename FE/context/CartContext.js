import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useAuth } from "./Auth";
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
 const { userId } = useAuth();

 // Hàm lưu giỏ hàng vào AsyncStorage theo userId
  const saveCartToStorage = async (userId, cart) => {
    try {
      await AsyncStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
    } catch (error) {
      console.error("Lỗi lưu giỏ hàng:", error);
    }
  };

  // Hàm load giỏ hàng từ AsyncStorage khi đăng nhập
  const loadCartFromStorage = async () => {
    try {
      const savedCart = await AsyncStorage.getItem(`cart_${userId}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Lỗi load giỏ hàng:", error);
    }
  };

  // Tự động load khi userId thay đổi
  useEffect(() => {
    if (userId) {
      loadCartFromStorage();
    }
  }, [userId]);

  //lưu lại giỏ hàng khi có thay đổi
  useEffect(() => {
  if (userId) {
    saveCartToStorage(userId, cartItems);
  }
}, [cartItems, userId]);


   // Thêm sản phẩm vào giỏ (nếu trùng thì chỉ tăng số lượng)
  const addToCart = (newItem) => {
    setCartItems((prevItems) => {
      const index = prevItems.findIndex((item) => item.id === newItem.id);
      let updatedCart;

      if (index !== -1) {
        updatedCart = [...prevItems];
        updatedCart[index].soluong += newItem.soluong;
      } else {
        updatedCart = [...prevItems, newItem];
      }

      saveCartToStorage(userId, updatedCart);
      return updatedCart;
    });
  };

  //Mặc dù useEffect trên đã xử lý, nhưng  cũng có thể lưu trực tiếp khi xóa
const removeFromCart = (itemId) => {
  setCartItems((prevItems) => {
    const updatedCart = prevItems.filter((item) => item.id !== itemId);
    saveCartToStorage(userId, updatedCart);
    return updatedCart;
  });
};

//xóa sp sau khi mua hàng
const clearCartAfterPurchase = (purchasedItems) => {
  setCartItems((prevItems) => {
    const remainingItems = prevItems.filter(
      (item) => !purchasedItems.some(p => p.id === item.id)
    );
    saveCartToStorage(userId, remainingItems);
    return remainingItems;
  });
};

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, loadCartFromStorage, userId, clearCartAfterPurchase  }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook để sử dụng dễ hơn
export const useCart = () => useContext(CartContext);
