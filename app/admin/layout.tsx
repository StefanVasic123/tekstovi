'use client';
import React, { useEffect, useState } from 'react';
import Layout from '../components/layout';
import Modal from '../components/modal';

interface Post {
  id: string;
  title: string;
  content: string;
  genre: string;
  date: string;
  voiceCover: string;
}

const AdminLayout = () => {
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [updateData, setUpdateData] = useState({});
  const [updateError, setUpdateError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (data: Object) => {
    // send a request to the server.
    // trebam da saljem i authorId
    try {
      await fetch(`/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      // Refresh the list of posts after creation
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const deletePost = async (id: string) => {
    try {
      await fetch('/api/posts/' + id, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      // Refresh the list of posts after deletion
      fetchData();
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleUpdate = (post: Post) => {
    const { id, title, content, genre, date, voiceCover } = post;
    setId(id);
    setTitle(title);
    setUpdateData({
      id,
      title,
      content,
      genre,
      date,
      voiceCover,
    });
    setIsUpdating(true);
  };

  const handleUpdateSubmit = async (formData: any) => {
    const { title, content, genre, voiceCover, date } = formData;
    setUpdateError('');
    if (id) {
      // send a request to the server to update the post.
      try {
        const body = { title, content, genre, voiceCover, date };
        await fetch('/api/posts/' + id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        setIsUpdating(false); // Close the update modal after submission
        fetchData(); // Refresh the list of posts after updating
      } catch (error) {
        console.error(error);
      }
    } else {
      setUpdateError('ID is missing');
    }
  };

  return (
    <Layout>
      <div>
        <div>
          <Modal
            modalId='Unesi tekst'
            onSubmit={(e) => handleSubmit(e)}
            title={title}
            originalData={updateData}
          />
        </div>
        <div>
          <h1 className='text-2xl font-bold mb-4'>Tvoji tekstovi</h1>
          {posts.map((post) => (
            <div key={post.id} className='mb-4'>
              <div className='flex justify-between items-center'>
                <h2 className='text-lg font-semibold'>{post.title}</h2>
                <div>
                  <button
                    onClick={() => handleUpdate(post)}
                    className='bg-blue-500 text-white px-2 py-1 rounded mx-2'
                  >
                    Update
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className='bg-red-500 text-white px-2 py-1 rounded'
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {isUpdating && (
        <Modal
          modalId='Izmeni tekst'
          onSubmit={(e) => handleUpdateSubmit(e)}
          title={title}
          originalData={updateData}
        />
      )}
      {updateError && <div>{updateError}</div>}
    </Layout>
  );
};

export default AdminLayout;
