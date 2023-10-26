'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import Layout from '@/app/components/layout';

interface Post {
  id: string;
  title: string;
  content: string;
  genre: string;
  date: string;
  voiceCover: string; // Assuming voiceCover is a YouTube embed link
}

const PostPage: React.FC = () => {
  const [post, setPost] = useState<Post | null>(null);
  const path = usePathname();
  const parts = path.split('/');
  const id = parts[parts.length - 1];

  useEffect(() => {
    // Fetch the post data by id
    const fetchData = async () => {
      try {
        if (typeof id === 'string') {
          const response = await fetch(`/api/posts/${id}`);
          if (response.ok) {
            const data: Post = await response.json();
            setPost(data);
          }
        }
      } catch (error) {
        console.error('Error fetching post data:', error);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (!post) {
    return <p>Loading post...</p>;
  }

  const videoFrame = (
    <div className='flex items-center justify-center max-w-screen-lg mx-auto my-6'>
      <div dangerouslySetInnerHTML={{ __html: post.voiceCover }} />
    </div>
  );

  const postText = (content: string) => {
    const formattedContent = content.replace(/\n/g, '<br>');

    return (
      <div
        dangerouslySetInnerHTML={{ __html: formattedContent }}
        className='text-gray-700 mb-2 text-center'
      />
    );
  };

  const postContent = (
    <div className='bg-white p-4 shadow-md max-w-screen-lg mx-auto my-6 relative'>
      <h1 className='text-3xl font-semibold text-center mb-2'>{post.title}</h1>
      <p className='text-gray-700 text-lg my-4'>{postText(post.content)}</p>
      <div className='flex justify-between'>
        <p className='text-blue-600 font-semibold'>{post.genre}</p>
        <p className='text-gray-600 text-sm text-right'>{post.date}</p>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className='my-6'>{videoFrame}</div>
      <div className='my-6'>{postContent}</div>
    </Layout>
  );
};

export default PostPage;
