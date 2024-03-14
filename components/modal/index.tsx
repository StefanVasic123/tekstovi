import { useCurrentUser } from '@/hooks/useCurrentUser';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface ModalData {
  title?: string;
  content?: string;
  genre?: string;
  gender?: string;
  language?: string;
  role?: string;
  date?: string;
  voiceCover?: string;
  authorId?: string;
  promotionDuration?: string;
}

interface ModalProps {
  modalId: string;
  onSubmit: (data: ModalData) => void;
  title: string;
  originalData?: any;
  toggleModal: Function;
  isPromotionModal?: string | undefined;
}

const Modal: React.FC<ModalProps> = ({
  modalId,
  onSubmit,
  originalData,
  toggleModal,
  isPromotionModal,
}) => {
  const isUser = useCurrentUser();
  const countryPrefix = usePathname().split('/')[1];
  const [formData, setFormData] = useState<ModalData>({
    title: modalId === 'update' ? originalData.title : '',
    content: modalId === 'update' ? originalData.content : '',
    voiceCover: modalId === 'update' ? originalData.voiceCover : '',
    genre: modalId === 'update' ? originalData.genre : '',
    gender: modalId === 'update' ? originalData.gender : '',
    language: modalId === 'update' ? originalData.language : countryPrefix,
    role: modalId === 'update' ? originalData.role : '',
    date: modalId === 'update' ? originalData.date : '',
    authorId: '',
  });
  const [promotionDuration, setPromotionDuration] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectGenre = (e: any) => {
    setFormData({
      ...formData,
      genre: e,
    });
  };

  const handleSelectGender = (e: any) => {
    setFormData({
      ...formData,
      gender: e,
    });
  };

  const handleSelectLanguage = (e: any) => {
    setFormData({
      ...formData,
      language: e,
    });
  };

  const handleSelectRole = (e: any) => {
    setFormData({
      ...formData,
      role: e,
    });
  };

  const handleSubmit = () => {
    // Send the data to your Prisma API or do any other required actions.
    onSubmit(
      isPromotionModal
        ? (promotionDuration as any)
        : {
            ...formData,
            authorId: isUser?.id || '',
          }
    );
    toggleModal(''); // Close the modal after submission.
  };

  return (
    <>
      <div
        id={modalId}
        data-modal-backdrop='static'
        tabIndex={-1}
        aria-hidden='true'
        className='fixed top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center bg-gray-900 bg-opacity-50'
      >
        <div className='bg-white rounded-lg shadow dark:bg-gray-700 p-4 w-full max-w-md'>
          {/* Modal header */}
          <div className='flex items-start justify-between border-b dark:border-gray-600'>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
              <input
                type='text'
                name='title'
                value={formData.title}
                onChange={handleInputChange}
                placeholder='Title'
                className='w-full outline-none border-none'
              />
            </h3>
            <button
              type='button'
              className='text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white'
              data-modal-hide={modalId}
              onClick={() => toggleModal('')}
            >
              <svg
                className='w-3 h-3'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 14 14'
              >
                <path
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6'
                />
              </svg>
              <span className='sr-only'>Zatvori modal</span>
            </button>
          </div>

          {isPromotionModal ? (
            <select
              value={promotionDuration}
              onChange={(e) => setPromotionDuration(e.target.value)}
              className='w-full outline-none border-none'
            >
              <option value='' selected disabled hidden>
                Choose here
              </option>
              <option value='60000'>1 min</option>
              <option value='86400000'>1 day</option>
              <option value='604800000'>7 days</option>
              <option value='1296000000'>15 days</option>
              <option value='2592000000'>30 days</option>
            </select>
          ) : (
            <div className='p-6 space-y-6'>
              <textarea
                name='content'
                value={formData.content}
                onChange={handleInputChange}
                className='w-full outline-none border rounded-lg p-2 placeholder-gray-500 dark:placeholder-gray-400'
                placeholder='Content...'
              />

              <select
                name='genre'
                value={formData.genre}
                onChange={(e: any) => handleSelectGenre(e.target.value)}
                className='w-full outline-none border-none'
              >
                <option value='' disabled>
                  Odaberi žanr
                </option>
                <option value='folk'>Narodna</option>
                <option value='pop'>Pop</option>
                <option value='dancehall'>Dancehall</option>
              </select>

              <select
                name='gender'
                value={formData.gender}
                onChange={(e: any) => handleSelectGender(e.target.value)}
                className='w-full outline-none border-none'
              >
                <option value='' disabled>
                  Vokal
                </option>
                <option value='male'>Muški</option>
                <option value='female'>Ženski</option>
                <option value='duet'>Duet</option>
              </select>

              <select
                name='language'
                value={formData.language}
                onChange={(e: any) => handleSelectLanguage(e.target.value)}
                className='w-full outline-none border-none'
              >
                <option value='' disabled>
                  Language
                </option>
                <option value='en-US'>EN-US</option>
                <option value='es'>ES</option>
                <option value='de'>DE</option>
                <option value='fr'>FR</option>
                <option value='sr_RS'>SR</option>
              </select>

              <select
                name='role'
                value={formData.role}
                onChange={(e: any) => handleSelectRole(e.target.value)}
                className='w-full outline-none border-none'
              >
                <option value='' disabled>
                  Role
                </option>
                <option value='lyricist'>Lyricist</option>
                <option value='producer'>Producer</option>
                <option value='lyricist/producer'>Lyricist / Producer</option>
              </select>

              <input
                type='date'
                name='date'
                value={formData.date}
                onChange={handleInputChange}
                className='w-full outline-none border-none'
              />

              <input
                type='text'
                name='voiceCover'
                value={formData.voiceCover}
                onChange={handleInputChange}
                placeholder='link to voice cover'
                className='w-full outline-none border-none'
              />
            </div>
          )}

          <div className='flex items-center space-x-2 border-t border-gray-200 dark:border-gray-600'>
            <button
              data-modal-hide={modalId}
              type='button'
              className='text-white bg-blue-700 hover-bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark-hover-bg-blue-700 dark-focus:ring-blue-800'
              onClick={handleSubmit}
            >
              Submit
            </button>
            <button
              data-modal-hide={modalId}
              type='button'
              className='text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover-text-gray-900 focus-z-10 dark-bg-gray-700 dark-text-gray-300 dark-border-gray-500 dark-hover-text-white dark-hover-bg-gray-600 dark-focus-ring-gray-600'
              onClick={() => toggleModal('')}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
