'use client';
import React, { useState, useEffect } from 'react';
import useDataFetching from '@/hooks/useDataFetching';

import InfiniteScroll from 'react-infinite-scroll-component';
import Layout from '../components/layout';

import Link from 'next/link';
import YouTube from 'react-youtube';

import GrayHeartIcon from '@/icons/GrayHeartIcon';
import BlueHeartIcon from '@/icons/BlueHeartIcon';
import { useWishList } from './context';

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
  const { isWishlist } = useWishList();
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  let { posts, hasMore, fetchPosts } = useDataFetching({
    selectedGenre: selectedGenre,
    selectedGender: selectedGender,
    isWishlist: isWishlist,
  });
  const [postId, setPostId] = useState('');
  const [videoId, setVideoId] = useState('');
  const [isPlaying, setIsPlaying] = useState(-1);
  const [postIndex, setPostIndex] = useState(-1);
  const [favoriteItems, setFavoriteItems] = useState<string[]>();

  // Define a key for localStorage
  const localStorageKey = 'favoriteItems';

  const fetchMoreData = () => {
    fetchPosts();
  };

  useEffect(() => {
    const storedItems = localStorage.getItem(localStorageKey);
    setFavoriteItems(storedItems ? JSON.parse(storedItems) : []);
  }, [selectedGenre, selectedGender]);

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
        {isItemInWishlist ? (
          <BlueHeartIcon onClick={() => {}} />
        ) : (
          <GrayHeartIcon onClick={() => {}} />
        )}
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
            }}
            className='p-2 border rounded-md'
          >
            <option value=''>Odaberi pol</option>
            <option value='male'>Muški</option>
            <option value='female'>Ženski</option>
            <option value='duet'>Duet</option>
          </select>
        </div>
      </div>

      <InfiniteScroll
        dataLength={posts.length}
        next={fetchMoreData}
        hasMore={hasMore} // You should set this based on your logic
        loader={<h4>Loading...</h4>}
        endMessage={
          !selectedGenre ||
          (!selectedGender && (
            <p style={{ textAlign: 'center' }}>
              <b>Nema više rezultata za odabranu pretragu.</b>
            </p>
          ))
        }
      >
        <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {posts.length > 0 ? (
            posts.map((item, index) => {
              return (
                <div
                  key={Math.random()}
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
                      <p className='text-blue-600 font-semibold'>
                        {item.genre}
                      </p>
                      <p className='text-gray-600'>{item.author?.name}</p>
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
      </InfiniteScroll>
    </Layout>
  );
}
