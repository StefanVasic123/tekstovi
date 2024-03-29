'use client';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useDataFetching from '@/hooks/useDataFetching';

import InfiniteScroll from 'react-infinite-scroll-component';
import Layout from '../../components/layout';

import Link from 'next/link';
import YouTube from 'react-youtube';

import GrayHeartIcon from '@/icons/GrayHeartIcon';
import BlueHeartIcon from '@/icons/BlueHeartIcon';
import LikeButton from '@/icons/LikeButton';
import CommentIcon from '@/icons/CommentIcon';
import FavoritesButton from '@/icons/FavoritesButton';
import { usePosts } from '../context';
import { useCurrentUser } from '@/hooks/useCurrentUser';

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
  likeCount: number | undefined;
}

export default function Home() {
  const {
    isWishlist,
    searchedPosts,
    searchedQuery,
    selectedGenre: genreSelected,
    selectedGender: genderSelected,
  } = usePosts();
  const countryPrefix = usePathname();
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('');
  let { posts, setPosts, hasMore, fetchPosts } = useDataFetching({
    selectedGenre: selectedGenre || genreSelected,
    selectedGender: selectedGender || genderSelected,
    isWishlist: isWishlist,
    countryPrefix,
  });
  const [postId, setPostId] = useState('');
  const [videoId, setVideoId] = useState('');
  const [isPlaying, setIsPlaying] = useState(-1);
  const [postIndex, setPostIndex] = useState(-1);
  const [favoriteItems, setFavoriteItems] = useState<string[]>();

  const router = useRouter();

  // Define a key for localStorage
  const localStorageKey = 'favoriteItems';

  const user: any = useCurrentUser();

  const fetchMoreData = () => {
    fetchPosts();
  };

  useEffect(() => {
    const storedItems = localStorage.getItem(localStorageKey);
    setFavoriteItems(storedItems ? JSON.parse(storedItems) : []);
  }, [selectedGenre, selectedGender]);

  // Function to handle liking or unliking a post
  const HandleLikePost = async (postId: string, userId: string) => {
    const data = { postId, userId };
    try {
      const response = await fetch(`/api/posts/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Parse the response body as JSON
        const responseData = await response.json();

        // Update the like count for the specific post
        const updatedPosts = posts.map((post) => {
          if (post.id === postId) {
            // Update the like count based on the response
            return {
              ...post,
              likeCount: responseData.likeCount,
            };
          }
          return post;
        });

        // Update the 'posts' variable with the updated array

        setPosts(updatedPosts);
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error: any) {
      console.error('Error:', error.message);
    }
  };

  const handleCommentClick = (postId: string) => {
    return router.push(`/posts/${postId}`);
  };

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

  if (searchedQuery) {
    posts = searchedPosts;
  }

  return (
    <Layout>
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
        <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5'>
          {posts.length > 0 ? (
            posts.map((item: any, index) => {
              return (
                <div
                  key={Math.random()}
                  className='bg-white p-4 shadow-md hover:shadow-lg cursor-pointer text-center flex flex-col h-full relative' // Added relative positioning
                >
                  <div className='mb-2'>
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
                      <div className='absolute top-0 right-0'>
                        {/* Position FavoritesButton in the top right corner */}
                        {item?.promotion?.promoted && <FavoritesButton />}
                      </div>
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
                  <div className='flex justify-center mt-auto mb-2'>
                    <LikeButton
                      onClick={() => {
                        HandleLikePost(item?.id, user?.id);
                      }}
                    />
                    <span>&nbsp;{item.likeCount}</span>
                    <div className='w-4'></div>{' '}
                    <CommentIcon
                      onClick={() => {
                        handleCommentClick(item.id);
                      }}
                      commentCount={item.commentCount}
                    />
                  </div>
                  <div className='mt-auto'>
                    <div className='flex justify-between'>
                      <p className='text-blue-600 font-semibold'>
                        {item.genre}
                      </p>
                      <p className='text-gray-600'>
                        <Link href={`/user-account?authorId=${item.authorId}`}>
                          {item.author?.name}
                        </Link>
                      </p>
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
