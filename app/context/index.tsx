'use client';
import { createContext, useState, useContext } from 'react';

const PostContext = createContext<any>(undefined);

export const PostProvider = ({ children }: { children: React.ReactNode }) => {
  const [isWishlist, setIsWishlist] = useState(false);
  const [searchedPosts, setSearchedPosts] = useState([]);
  const [searchedQuery, setSearchedQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedGender, setSelectedGender] = useState('');

  const toggleHeartClick = () => {
    setIsWishlist((prev) => !prev);
  };

  return (
    <PostContext.Provider
      value={{
        isWishlist,
        toggleHeartClick,
        searchedPosts,
        setSearchedPosts,
        searchedQuery,
        setSearchedQuery,
        selectedGenre,
        selectedGender,
        setSelectedGenre,
        setSelectedGender,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  return useContext(PostContext);
};
