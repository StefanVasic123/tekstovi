'use client';
import { useEffect, useState } from 'react';
import { FaShare, FaDownload } from 'react-icons/fa';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useUserPosts } from '@/hooks/useUserPosts';
import Layout from '@/components/layout';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import AvatarUploadPage from '@/components/avatar/upload/page';

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
  const [showUploadImage, setShowUploadImage] = useState(false);
  const [userImage, setUserImage] = useState('');
  const user: any = useCurrentUser();

  const userPosts: any = useUserPosts();

  useEffect(() => {
    setUserImage(user?.image);
  }, [user]);

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

  const showUploadButton = () => {
    setShowUploadImage(!showUploadImage);
  };

  const handleImageChange = async (res: any) => {
    setUserImage(res.image);
    setShowUploadImage(false);
  };

  return (
    <Layout>
      <div className='max-w-2xl mx-auto p-8'>
        <div className='text-center mb-4'>
          {user?.image ? (
            <div className='relative mx-auto mb-4 h-40 w-40 rounded-full overflow-hidden'>
              <img
                src={userImage || user.image}
                alt={`${user.name}'s profile picture`}
                className='w-full h-full object-cover'
              />
              <button
                className='absolute bottom-5 left-0 right-0 bg-black bg-opacity-50 text-white text-sm font-semibold hover:bg-opacity-70'
                onClick={showUploadButton}
              >
                Change Image
              </button>
            </div>
          ) : (
            <div className='relative mx-auto mb-4 h-40 w-40 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center'>
              <button
                className='absolute bottom-5 left-0 right-0 bg-black bg-opacity-50 text-white text-sm font-semibold hover:bg-opacity-70'
                onClick={showUploadButton}
              >
                Upload Image
              </button>
            </div>
          )}
          {showUploadImage && (
            <AvatarUploadPage
              handleImageChange={(e: any) => handleImageChange(e)}
            />
          )}
          <h1 className='text-2xl font-bold'>{user?.name}</h1>
          <p className='text-gray-500'>{user?.email}</p>
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
                  <button
                    onClick={() => downloadPdf(post)}
                    className='bg-green-500 text-white px-2 py-1 ml-2 rounded'
                  >
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
