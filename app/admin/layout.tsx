'use client';
import React, { useEffect, useState } from 'react';
import Layout from '../components/layout';
import Modal from '../components/modal';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import { StrictModeDroppable } from '../helpers/StrictModeDroppable';

interface Post {
  id: string;
  title: string;
  content: string;
  genre: string;
  gender: string;
  date: string;
  voiceCover: string;
  listPlaceId: number;
}

const AdminLayout = () => {
  const [id, setId] = useState('');
  const [userId, setUserId] = useState('10101010101');
  const [title, setTitle] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [updateData, setUpdateData] = useState({});
  const [updateError, setUpdateError] = useState('');
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/posts', {
        headers: {
          'x-admin-request': 'true',
        },
      });
      if (response.ok) {
        const data: Post[] = await response.json();
        data.sort((a, b) => a.listPlaceId - b.listPlaceId);
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

  const handleCreate = () => {
    toggleModal('create');
  };

  const handleUpdate = (post: Post) => {
    const { id, title, content, genre, gender, date, voiceCover } = post;
    setId(id);
    setTitle(title);
    setUpdateData({
      id,
      title,
      content,
      genre,
      gender,
      date,
      voiceCover,
    });
    toggleModal('update');
  };

  const handleUpdateSubmit = async (formData: any) => {
    const { title, content, genre, gender, voiceCover, date } = formData;
    setUpdateError('');
    if (id) {
      // send a request to the server to update the post.
      try {
        const body = { title, content, genre, gender, voiceCover, date };
        await fetch('/api/posts/' + id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        fetchData(); // Refresh the list of posts after updating
      } catch (error) {
        console.error(error);
      }
    } else {
      setUpdateError('ID is missing');
    }
  };

  const handleUpdateListOrder = async (dataArr: any) => {
    try {
      const body = dataArr;
      await fetch('/api/posts/' + userId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleModal = (type: string) => {
    switch (type) {
      case 'create':
        setIsOpenCreate(!isOpenCreate);
        break;
      case 'update':
        setIsOpenUpdate(!isOpenUpdate);
        break;
      default:
        setIsOpenCreate(false);
        setIsOpenUpdate(false);
    }
  };

  const reorderPosts = (posts: any, startIndex: any, endIndex: any) => {
    const newPostList = Array.from(posts);
    const [removed] = newPostList.splice(startIndex, 1);
    newPostList.splice(endIndex, 0, removed);

    return newPostList;
  };

  const onDragStart = (result: any) => {
    const { source, destination } = result;
  };

  const onDragUpdate = (result: any) => {
    const { source, destination } = result;
  };
  const onDragEnd = (result: any) => {
    const { source, destination } = result;

    // back on same position
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // different position
    const newPosts = reorderPosts(posts, source.index, destination.index);

    setPosts(newPosts as Post[]);

    const modulatedPosts = newPosts.map((post, index) => ({
      ...(newPosts[index] as any),
      index,
    }));

    handleUpdateListOrder(modulatedPosts);
  };

  return (
    <Layout>
      <div>
        <div>
          <h1 className='text-2xl font-bold mb-4'>Tvoji tekstovi</h1>
          <button onClick={() => handleCreate()}>Unesi tekst</button>
          <DragDropContext
            onDragStart={onDragStart}
            onDragUpdate={onDragUpdate}
            onDragEnd={onDragEnd}
          >
            <StrictModeDroppable droppableId='posts'>
              {(droppableProvided: any) => (
                <div
                  {...droppableProvided.droppableProps}
                  ref={droppableProvided.innerRef}
                >
                  {posts.map((post, index) => (
                    <Draggable
                      key={post.id}
                      draggableId={post.id.toString()}
                      index={index}
                    >
                      {(draggableProvided: any, draggableSnapshot: any) => (
                        <div
                          key={post.id}
                          className='mb-4'
                          {...draggableProvided.dragHandleProps}
                          {...draggableProvided.draggableProps}
                          ref={draggableProvided.innerRef}
                        >
                          <div className='flex justify-between items-center'>
                            <h2 className='text-lg font-semibold'>
                              {post.title}
                            </h2>
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
                      )}
                    </Draggable>
                  ))}
                </div>
              )}
            </StrictModeDroppable>
          </DragDropContext>
        </div>
      </div>
      {isOpenCreate && (
        <div>
          <Modal
            modalId='create'
            onSubmit={(e) => handleSubmit(e)}
            title={title}
            originalData={{}}
            toggleModal={(type: string) => toggleModal(type)}
          />
        </div>
      )}
      {isOpenUpdate && (
        <div>
          <Modal
            modalId='update'
            onSubmit={(e) => handleUpdateSubmit(e)}
            title={title}
            originalData={updateData}
            toggleModal={(type: string) => toggleModal(type)}
          />
        </div>
      )}

      {updateError && <div>{updateError}</div>}
    </Layout>
  );
};

export default AdminLayout;
