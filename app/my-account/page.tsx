'use client';
import { FaShare, FaDownload } from 'react-icons/fa'; // Import icons
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Post } from '@/types.ts/post';
import { useUserPosts } from '@/hooks/useUserPosts';
import Layout from '@/components/layout';
/*
interface User {
  name?: string;
  email?: string;
  image?: string;
  posts?: Post[];
}

interface AccountProps {
  user: User;
}
*/
const MyAccount = () => {
  const user: any = useCurrentUser();

  const userPosts: any = useUserPosts();

  return (
    <Layout>
      <div className='max-w-2xl mx-auto p-8'>
        <div className='text-center mb-4'>
          {/*user.image && (
            <div className='relative mx-auto mb-4 h-40 w-40 rounded-full overflow-hidden'>
              <Image
                src={test}
                alt={'${user.name}s profile picture'}
                layout='fill'
                objectFit='cover'
              />
            </div>
          )*/}
          <h1 className='text-2xl font-bold'>{user.name}</h1>
          <p className='text-gray-500'>{user.email}</p>
          <p className='text-gray-500'>Certified Lyrics</p>
        </div>
        <div className='grid gap-4 grid-cols-1 sm:grid-cols-1'>
          {userPosts?.map((post: any) => (
            <div key={post.id} className='bg-white p-4 rounded-lg shadow-md'>
              <div className='flex items-center justify-between mb-2'>
                <h2 className='text-lg font-semibold'>{post.title}</h2>
                <div className='flex items-center'>
                  <button className='bg-blue-500 text-white px-2 py-1 rounded'>
                    <FaShare />
                  </button>
                  <button className='bg-green-500 text-white px-2 py-1 ml-2 rounded'>
                    <FaDownload />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default MyAccount;
