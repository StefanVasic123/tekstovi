import { useState } from 'react';
import { Post } from '@/types.ts/post';

interface PostsState {
  posts: Post[];
  hasMore: boolean;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
  postsPagination: number;
  setPostsPagination: React.Dispatch<React.SetStateAction<number>>;
}

const usePostsState = (): PostsState => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [postsPagination, setPostsPagination] = useState<number>(1);

  return {
    posts,
    setPosts,
    hasMore,
    setHasMore,
    postsPagination,
    setPostsPagination,
  };
};

export default usePostsState;
