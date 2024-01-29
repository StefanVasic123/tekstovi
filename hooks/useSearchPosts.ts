import { useEffect, useState } from 'react';
import { Post } from '@/types.ts/post';
import { usePosts } from '@/app/context';

export const useSearchPosts = (searchQuery: string) => {
  const [searchPosts, setPosts] = useState<Post[]>([]);
  const { setSearchedPosts, setSearchedQuery } = usePosts();
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/posts?search=${searchQuery}`);
      if (response.ok) {
        const data: Post[] = await response.json();
        // Add any additional sorting or processing logic as needed
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    setSearchedQuery(searchQuery);

    // Clear the previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set a new timeout to make the API call after 1000ms (1 second)
    const timeoutId: any = setTimeout(() => {
      fetchData();
    }, 1000);

    // Save the timeout ID for cleanup
    setSearchTimeout(timeoutId);

    // Cleanup function to clear the timeout on component unmount or when searchQuery changes
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [searchQuery]);

  return setSearchedPosts(searchPosts);
};
