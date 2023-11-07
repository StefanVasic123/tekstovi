'use client';
import React, { useState, useEffect } from 'react';
import Layout from './components/layout';
import Link from 'next/link';
import YouTube from 'react-youtube';

const GrayHeartIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='18'
    height='18'
    viewBox='0 0 24 24'
    fill='none'
    stroke='gray' // Change the color to gray
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
  </svg>
);

const BlueHeartIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='18'
    height='18'
    viewBox='0 0 24 24'
    fill='blue'
    stroke='blue'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
  </svg>
);

interface Post {
  id: string;
  title: string;
  content: string;
  genre: string;
  gender: string;
  date: string;
  voiceCover: string;
  video: string;
  index: number;
  listPlaceId: number;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postId, setPostId] = useState('');
  const [videoId, setVideoId] = useState('');
  const [isPlaying, setIsPlaying] = useState(-1);
  const [postStates, setPostStates] = useState<boolean[]>([]);
  const [postIndex, setPostIndex] = useState(-1);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  const [favoriteItems, setFavoriteItems] = useState<string[]>();

  // Define a key for localStorage
  const localStorageKey = 'favoriteItems';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/posts');
        if (response.ok) {
          const data: Post[] = await response.json();
          data.sort((a, b) => a.listPlaceId - b.listPlaceId);
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const storedItems = localStorage.getItem(localStorageKey);
    setFavoriteItems(storedItems ? JSON.parse(storedItems) : []);

    fetchData();
  }, []);
  let filteredPosts;

  // Filter items based on the selected genre
  if (selectedGenre === 'wishlist') {
    filteredPosts = posts.filter((item) =>
      (favoriteItems ?? []).includes(item.id as any)
    );
  } else if (['folk', 'pop', 'dancehall'].includes(selectedGenre)) {
    filteredPosts = posts.filter((item) => item.genre === selectedGenre);
  } else if (['male', 'female', 'duet'].includes(selectedGender)) {
    filteredPosts = posts.filter((item) => item.gender === selectedGender);
  } else {
    filteredPosts = posts;
  }

  const processContent = (content: string, link: string) => {
    // Split the content by newline characters
    const lines = content.split('\n');

    // Get the first 4 lines
    const firstFourLines = lines.slice(0, 4).join('<br>');

    return (
      <>
        <div
          dangerouslySetInnerHTML={{ __html: firstFourLines }}
          className='text-gray-700 mb-2'
        />
        <Link href={link}>
          <p className='text-blue-600 cursor-pointer'>Vidi više...</p>
        </Link>
      </>
    );
  };

  const extractVideoId = (voiceCover: string) => {
    const regex =
      /(?:https:\/\/www\.youtube\.com\/embed\/|https:\/\/youtu\.be\/)([\w-]+)/;
    const match = voiceCover.match(regex);

    if (match && match[1]) {
      return match[1];
    }

    return null;
  };

  const playVideo = (videoId: string, id: string, index: number) => {
    if (videoId) {
      setPostId(id);
      setVideoId(videoId);
      setIsPlaying(index); // Start playing
    }
  };

  const stopVideo = () => {
    setVideoId('');
    setPostId('');
    setIsPlaying(-1); // Stop playing
  };

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
  const renderWishlistButtons = (item: Post) => {
    const isItemInWishlist = isFavorite(item.id);

    return (
      <button
        onClick={() => toggleFavorite(item.id)}
        className='focus:outline-none'
      >
        {isItemInWishlist ? <BlueHeartIcon /> : <GrayHeartIcon />}
      </button>
    );
  };
  return (
    <Layout>
      {/* Dropdown menu for selecting the genre */}
      <div className='flex'>
        <div>
          <select
            value={selectedGenre}
            onChange={(e) => {
              setSelectedGenre(e.target.value);
              setSelectedGender('');
            }}
            className='p-2 border rounded-md'
          >
            <option value=''>Obaberi žanr</option>
            <option value='folk'>Narodne</option>
            <option value='pop'>Pop</option>
            <option value='dancehall'>Moderne</option>
          </select>
        </div>
        {/* Dropdown menu for selecting gender */}
        <div>
          <select
            value={selectedGender}
            onChange={(e) => {
              setSelectedGender(e.target.value);
              setSelectedGenre('');
            }}
            className='p-2 border rounded-md'
          >
            <option value=''>Odaberi pol</option>
            <option value='male'>Muški</option>
            <option value='female'>Ženski</option>
            <option value='duet'>Duet</option>
          </select>
        </div>
        {/* Button for filtering wishlist */}
        <div>
          <button
            className='p-2 border rounded-md'
            onClick={() => {
              selectedGenre === 'wishlist'
                ? setSelectedGenre('')
                : setSelectedGenre('wishlist');
              setSelectedGender('');
            }}
          >
            Omiljene
          </button>
        </div>
      </div>

      <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
        {filteredPosts.length > 0 ? (
          filteredPosts.map((item, index) => {
            return (
              <div
                key={item.id}
                className='bg-white p-4 shadow-md hover:shadow-lg cursor-pointer text-center flex flex-col h-full'
              >
                <div className='mb-4'>
                  <div className='flex items-center justify-center mb-2'>
                    <h3 className='text-xl font-semibold'>{item.title}</h3>
                    {item.voiceCover && (
                      <button
                        onClick={() => {
                          setPostIndex(index);
                          isPlaying === index
                            ? stopVideo() // If playing, stop the video
                            : playVideo(
                                extractVideoId(item.voiceCover) || '',
                                item.id || '',
                                index
                              ); // If paused, play the video
                        }}
                        className='text-blue-600 cursor-pointer ml-2'
                      >
                        <span
                          role='img'
                          aria-label={
                            isPlaying === index ? 'Pause Voice' : 'Play Voice'
                          }
                        >
                          {isPlaying === index ? '⏸️' : '▶️'}{' '}
                          {/* Show pause or play button based on isPlaying */}
                        </span>
                      </button>
                    )}
                    {renderWishlistButtons(item)}
                  </div>
                  {item.voiceCover && postId === item.id && (
                    <div className='video-container'>
                      <div
                        className={`youtube-video ${
                          isPlaying ? 'playing' : 'paused'
                        }`}
                        onClick={isPlaying ? stopVideo : () => {}}
                      >
                        <YouTube
                          videoId={videoId}
                          opts={{
                            width: '100%',
                            height: '0',
                            playerVars: {
                              autoplay: isPlaying ? 1 : 0, // Auto-play if isPlaying is true
                              modestbranding: 1,
                              rel: 0,
                              controls: 0,
                              fs: 0,
                            },
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {processContent(item.content, `/posts/${item.id}`)}
                </div>
                <div className='mt-auto'>
                  <div className='flex justify-between'>
                    <p className='text-blue-600 font-semibold'>{item.genre}</p>
                    <p className='text-gray-600 text-sm'>{item.date}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : selectedGenre || selectedGender ? (
          <p>Nema rezultata za pretragu</p>
        ) : (
          <p>Učitavanje tekstova...</p>
        )}
      </div>
    </Layout>
  );
}
