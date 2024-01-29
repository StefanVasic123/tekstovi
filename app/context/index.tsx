'use client';
import { createContext, useState, useContext } from 'react';

const PostContext = createContext<any>(undefined);

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const [isWishlist, setIsWishlist] = useState(false);
  const [searchedPosts, setSearchedPosts] = useState([]);

  const toggleHeartClick = () => {
    setIsWishlist((prev) => !prev);
  };

  return (
    <PostContext.Provider
      value={{ isWishlist, toggleHeartClick, searchedPosts, setSearchedPosts }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  return useContext(PostContext);
};
