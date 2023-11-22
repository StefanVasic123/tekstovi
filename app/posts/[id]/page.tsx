'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Layout from '@/app/components/layout';

const CopyToClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (
  props
) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    stroke='currentColor'
    className='w-6 h-6 text-gray-500 hover:text-gray-700 transition duration-300'
    {...props}
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M9 5h7a2 2 0 012 2v12a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2z'
    />
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M9 5V3a1 1 0 011-1h7a1 1 0 011 1v2'
    />
  </svg>
);

interface Post {
  id: string;
  title: string;
  content: string;
  genre: string;
  date: string;
  voiceCover: string;
}

const PostPage: React.FC = () => {
  const [post, setPost] = useState<Post | null>(null);
  const [isCopied, setIsCopied] = useState(false);
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

  const copyLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);

    // Reset the copied state after a short delay
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  if (!post) {
    return <p>Loading post...</p>;
  }

  const notification = isCopied && (
    <div className='bg-gray-500 text-white p-2 absolute top-0 right-0 mt-2 mr-2 rounded'>
      Link do teksta kopiran!
    </div>
  );

  const videoFrame = (
    <div className='flex items-center justify-center max-w-screen-lg mx-auto my-6 overflow-hidden'>
      <div
        className='youtube-video'
        dangerouslySetInnerHTML={{ __html: post.voiceCover }}
      />
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
      {notification}
      <h1 className='text-3xl font-semibold text-center mb-2'>
        {post.title}
        <CopyToClipboardIcon
          onClick={copyLink}
          className='ml-2 cursor-pointer w-6 h-6 text-gray-500 hover:text-gray-700 transition duration-300 inline-block'
        />
      </h1>
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
