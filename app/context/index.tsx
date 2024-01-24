'use client';
import { createContext, useState, useContext } from 'react';

const WishListContext = createContext<any>(undefined);

export const WishListProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isWishlist, setIsWishlist] = useState(false);

  const toggleHeartClick = () => {
    setIsWishlist((prev) => !prev);
  };

  return (
    <WishListContext.Provider value={{ isWishlist, toggleHeartClick }}>
      {children}
    </WishListContext.Provider>
  );
};

export const useWishList = () => {
  return useContext(WishListContext);
};
