'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/layout';
import { usePosts } from '@/app/context';

import { FaShare, FaDownload } from 'react-icons/fa';
import GrayHeartIcon from '@/icons/GrayHeartIcon';
import BlueHeartIcon from '@/icons/BlueHeartIcon';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const UserAccount = () => {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState<string[]>();

  const localStorageKey = 'favoriteItems';

  useEffect(() => {
    const authorId = searchParams.get('authorId');

    if (authorId) {
      const fetchData = async () => {
        try {
          // Fetch user data
          const userDataResponse = await fetch(`/api/users/${authorId}`);
          const userData = await userDataResponse.json();
          setUser(userData);

          // Fetch user's posts
          const postsDataResponse = await fetch(
            `/api/posts?authorId=${authorId}`,
            {
              headers: {
                'x-admin-request': 'true',
              },
            }
          );
          const postsData = await postsDataResponse.json();
          setPosts(postsData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      const storedItems = localStorage.getItem(localStorageKey);
      setFavoriteItems(storedItems ? JSON.parse(storedItems) : []);

      fetchData();
    }
  }, []);

  // Function to toggle the favorite status of an item
  const toggleFavorite = (postId: string) => {
    const updatedFavorites = [...(favoriteItems as any)];
    const itemIndex = updatedFavorites.indexOf(postId);

    if (itemIndex === -1) {
      updatedFavorites.push(postId);
    } else {
      updatedFavorites.splice(itemIndex, 1);
    }

    // Update the favorite items in state and localStorage
    setFavoriteItems(updatedFavorites as any);
    localStorage.setItem(localStorageKey, JSON.stringify(updatedFavorites));
  };

  // Function to check if an item is in the favorite list
  const isFavorite = (postId: string) => (favoriteItems ?? []).includes(postId);

  // Dynamic buttons based on wishlist status
  const renderWishlistButtons = (item: any) => {
    const isItemInWishlist = isFavorite(item.id);

    return (
      <button
        onClick={() => toggleFavorite(item.id)}
        className='focus:outline-none'
      >
        {isItemInWishlist ? (
          <BlueHeartIcon onClick={() => {}} />
        ) : (
          <GrayHeartIcon onClick={() => {}} />
        )}
      </button>
    );
  };

  if (!user || !posts) {
    return <div>Loading...</div>;
  }

  const downloadPdf = (post: any) => {
    const pdf = new jsPDF();

    // Create a div element with post content
    const postDiv = document.createElement('div');

    postDiv.style.width = '210mm'; // Set width to match A4 width
    postDiv.style.minHeight = '297mm'; // Set minimum height to match A4 height
    postDiv.style.boxSizing = 'border-box'; // Ensure padding and border are included in dimensions
    postDiv.style.padding = '20mm'; // Add padding for spacing
    postDiv.style.backgroundColor = '#f4f4f4';
    postDiv.style.fontFamily = 'Arial, sans-serif';
    postDiv.style.border = '10px solid #3498db'; // Blue border

    postDiv.innerHTML = `
          <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Certified song - ${
            post.title
          }</h1>
          <p style="color: #666; line-height: 1.5;">${post.content.replace(
            /\n/g,
            '<br>'
          )}</p>
          <p style="color: #999; text-align: left; margin-top: 20px;">Date: ${
            post.date
          }</p>
          <p style="color: #999; text-align: left; margin-top: 20px;">Date: Author - ${
            user.name
          }</p>
        `;

    // Append the div to the document body
    document.body.appendChild(postDiv);

    // Render the div to canvas and add to PDF
    html2canvas(postDiv, { scale: 2 }).then((canvas) => {
      document.body.removeChild(postDiv); // Remove the temporary div

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, 'pdf', 'NONE', 0);

      // Save the PDF with a specific filename
      pdf.save(`post_${post.title}_download.pdf`);
    });
  };
  return (
    <Layout>
      <div className='max-w-2xl mx-auto p-8'>
        <div className='text-center mb-4'>
          <div className='relative mx-auto mb-4 h-40 w-40 rounded-full overflow-hidden'>
            <img
              src={user.image}
              alt={`${user.name}'s profile picture`}
              className='w-full h-full object-cover'
            />

            <h1 className='text-2xl font-bold'>{user?.name}</h1>
            <p className='text-gray-500'>{user?.email}</p>
            <p className='text-gray-500'>Certified Lyrics</p>
          </div>
          <div className='grid gap-4 grid-cols-1 sm:grid-cols-1'>
            {posts?.map((post: any) => (
              <div key={post.id} className='bg-white p-4 rounded-lg shadow-md'>
                <div className='flex items-center justify-between mb-2'>
                  <h2 className='text-lg font-semibold'>{post.title}</h2>
                  <div className='flex items-center'>
                    <button className='bg-blue-500 text-white px-2 py-1 rounded'>
                      <FaShare />
                    </button>
                    <button
                      onClick={() => downloadPdf(post)}
                      className='bg-green-500 text-white px-2 py-1 ml-2 rounded'
                    >
                      <FaDownload />
                    </button>
                    {renderWishlistButtons(post)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserAccount;
