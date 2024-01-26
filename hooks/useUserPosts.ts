import { useEffect, useState } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { Post } from '@/types.ts/post';

export const useUserPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const currentUser: any = useCurrentUser();

  const fetchData = async () => {
    const queryParams = new URLSearchParams({
      authorId: currentUser?.id,
    });

    try {
      const response = await fetch(`/api/posts?${queryParams.toString()}`, {
        headers: {
          'x-admin-request': 'true',
        },
      });
      if (response.ok) {
        const data: Post[] = await response.json();
        data.sort((a, b) => a.listPlaceId - b.listPlaceId);
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return posts;
};
