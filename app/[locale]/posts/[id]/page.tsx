'use client';
import { MouseEventHandler, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Layout from '@/components/layout';
import { useCurrentUser } from '@/hooks/useCurrentUser';

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

const CommentInput: React.FC<{ onSubmit: (comment: string) => void }> = ({
  onSubmit,
}) => {
  const [comment, setComment] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(comment);
    setComment('');
  };

  return (
    <form onSubmit={handleSubmit} className='mb-4'>
      <textarea
        value={comment}
        onChange={handleChange}
        placeholder='Enter your comment...'
        className='w-full border rounded-md p-2'
        rows={3}
        required
      />
      <button
        type='submit'
        className='bg-blue-500 text-white py-2 px-4 mt-2 rounded-md hover:bg-blue-600 transition duration-300'
      >
        Post Comment
      </button>
    </form>
  );
};

const Comment: React.FC<{
  author: string;
  text: string;
  handleReply: MouseEventHandler<HTMLButtonElement>;
  showReplyButton: boolean;
}> = ({ author, text, handleReply, showReplyButton }) => {
  return (
    <div className='flex items-center mb-4'>
      <div className='w-1/4'>
        {/* User Avatar */}
        <div className='w-10 h-10 bg-gray-300 rounded-full' />
      </div>
      <div className='w-3/4'>
        {/* Comment Content */}
        <div className='font-semibold'>{author}</div>
        <div className=''>{text}</div>
        {showReplyButton && (
          <button
            onClick={handleReply}
            className='mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300'
          >
            Reply
          </button>
        )}
      </div>
    </div>
  );
};

const PostPage: React.FC = () => {
  const [post, setPost] = useState<Post | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingCommentId, setReplyingCommentId] = useState('');

  const path = usePathname();
  const parts = path.split('/');
  const id = parts[parts.length - 1];

  const user = useCurrentUser();

  const handleReply = (commentId: string) => {
    setReplyingCommentId(commentId);
  };

  const handleSubmitComment = async () => {
    try {
      const response = await fetch(`/api/posts/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: id,
          userId: user?.id,
          content: newComment,
        }),
      });

      if (response.ok) {
        const data: Comment = await response.json();
        setComments([...(comments as any), data]);
        setNewComment('');
      } else {
        console.error('Failed to post comment:', response.statusText);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleSubmitReply = async (commentId: string, replyContent: string) => {
    try {
      const response = await fetch(`/api/posts/comment/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          content: replyContent,
          commentId: commentId,
        }),
      });

      if (response.ok) {
        const newReply: Comment = await response.json();

        // Find the parent comment in the comments state array
        const updatedComments = comments.map((comment: any) => {
          if (comment.id === commentId) {
            // Update the replies array of the parent comment
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply],
            };
          }
          return comment;
        });

        // Set the updated comments state array
        setComments(updatedComments);

        // Reset the replyingCommentId to close the reply textbox
        setReplyingCommentId('');
      } else {
        console.error('Failed to post reply:', response.statusText);
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

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

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/posts/comment/${id}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data as any);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    if (id) {
      fetchComments();
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
      <div className='max-w-screen-lg mx-auto my-6'>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitComment();
          }}
          className='mb-4'
        >
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder='Enter your comment...'
            className='w-full border rounded-md p-2'
            rows={3}
            required
          />
          <button
            type='submit'
            className='bg-blue-500 text-white py-2 px-4 mt-2 rounded-md hover:bg-blue-600 transition duration-300'
          >
            Post Comment
          </button>
        </form>

        {comments && comments.length > 0 ? (
          comments.map((comment: any) => (
            <div key={comment.id}>
              <div className='flex flex-col'>
                <Comment
                  author={comment.userId}
                  text={comment.content}
                  handleReply={() => handleReply(comment.id)}
                  showReplyButton={true}
                />
              </div>
              <div className='ml-4'>
                {replyingCommentId === comment.id && (
                  <div>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder='Enter your reply...'
                      className='w-full border rounded-md p-2'
                      rows={3}
                      required
                    />
                    <button
                      onClick={() =>
                        handleSubmitReply(comment.id, replyContent)
                      }
                      className='bg-blue-500 text-white py-2 px-4 mt-2 rounded-md hover:bg-blue-600 transition duration-300'
                    >
                      Post Reply
                    </button>
                  </div>
                )}
                {comment.replies && comment.replies.length > 0 && (
                  <div className='ml-4'>
                    {comment.replies.map((reply: any) => (
                      <div key={reply.id}>
                        <Comment
                          author={reply.userId}
                          text={reply.content}
                          handleReply={() => {}}
                          showReplyButton={false}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No comments available.</p>
        )}
      </div>
    </Layout>
  );
};

export default PostPage;
