import { useState, useEffect, useRef } from 'react';
import { Post } from '@/types.ts/post';

interface UseDataFetchingProps {
  selectedGenre?: string;
  selectedGender?: string;
  isWishlist?: boolean;
  countryPrefix: string;
}

const useDataFetching = ({
  selectedGenre,
  selectedGender,
  isWishlist,
  countryPrefix,
}: UseDataFetchingProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [postsPagination, setPostsPagination] = useState(1);

  const localStorageKey = 'favoriteItems';

  const fetchPosts = async () => {
    try {
      // Conditionally include genre and gender parameters
      const url = `${countryPrefix}/api/posts?postsPagination=${postsPagination}${
        selectedGenre ? `&genre=${selectedGenre}` : ''
      }${selectedGender ? `&gender=${selectedGender}` : ''}`;

      const response = await fetch(url);

      if (response.ok) {
        const data: Post[] = await response.json();
        data.sort((a, b) => a.listPlaceId - b.listPlaceId);
        data?.length === 0 && setHasMore(false);
        setPosts((prevPosts) => [...prevPosts, ...data]);
        setPostsPagination((prevPagination) => prevPagination + 1);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setHasMore(false);
    }
  };

  const fetchFilteredPosts = async (isWishlist: boolean | undefined) => {
    try {
      let url = `${countryPrefix}/api/posts?postsPagination=1${
        selectedGenre ? `&genre=${selectedGenre}` : ''
      }${selectedGender ? `&gender=${selectedGender}` : ''}`;

      if (isWishlist) {
        // Fetch wishlist posts
        const storedItems = localStorage.getItem(localStorageKey);
        const wishlistItems = storedItems ? JSON.parse(storedItems) : [];
        url += `&wishlist=${JSON.stringify(wishlistItems)}`;
      } else {
        //remove wishlist params from url => remove '&wishlist= and everything that comes in array after'
        url = url.replace(/&wishlist=[^&]*/, '');
      }

      const response = await fetch(url);

      if (response.ok) {
        const data: Post[] = await response.json();
        data.sort((a, b) => a.listPlaceId - b.listPlaceId);
        data?.length === 0 && setHasMore(false);
        setPosts(data);
        setPostsPagination((prevPagination) => prevPagination + 1); // Increment pagination for infinite scroll
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setHasMore(false);
    }
  };

  useEffect(() => {
    if (!isWishlist) {
      setPosts([]);
      setPostsPagination(1);
    }
    setPosts([]);
    setPostsPagination(1);
    setHasMore(true);
    fetchFilteredPosts(isWishlist);
  }, [selectedGenre, selectedGender, isWishlist]);

  return { posts, setPosts, hasMore, fetchPosts };
};

export default useDataFetching;
