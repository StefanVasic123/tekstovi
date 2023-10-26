'use client';
import React, { useState, useEffect } from 'react';
import Layout from './components/layout';
import Link from 'next/link';
import YouTube from 'react-youtube';

interface Post {
  id: string;
  title: string;
  content: string;
  genre: string;
  date: string;
  voiceCover: string;
  video: string;
  index: number;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [postId, setPostId] = useState('');
  const [videoId, setVideoId] = useState('');
  const [isPlaying, setIsPlaying] = useState(-1);
  const [postStates, setPostStates] = useState<boolean[]>([]);
  const [postIndex, setPostIndex] = useState(-1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/posts');
        if (response.ok) {
          const data: Post[] = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const processContent = (content: string, link: string) => {
    // Split the content by newline characters
    const lines = content.split('\n');

    // Get the first 4 lines
    const firstFourLines = lines.slice(0, 4).join('<br>');

    // Check if there are more lines
    const moreLines = lines.length > 4;
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

  return (
    <Layout>
      <div className='grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
        {posts.length > 0 ? (
          posts.map((item, index) => {
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
        ) : (
          <p>Loading posts...</p>
        )}
      </div>
    </Layout>
  );
}
