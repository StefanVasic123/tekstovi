import { useRef } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface AvatarUploadPageProps {
  handleImageChange: (result: any) => void; // Adjust the type according to your response shape
}

const AvatarUploadPage: React.FC<AvatarUploadPageProps> = ({
  handleImageChange,
}) => {
  const user = useCurrentUser();

  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!inputFileRef.current?.files) {
      throw new Error('No file selected');
    }

    const file = inputFileRef.current.files[0];

    const response = await fetch(
      `/api/avatar?filename=${file.name}&userId=${user?.id}`,
      {
        method: 'POST',
        body: file,
      }
    );

    handleImageChange(await response.json());
  };

  return (
    <>
      <h1>Upload Your Avatar</h1>

      <form onSubmit={handleSubmit}>
        <input name='file' ref={inputFileRef} type='file' required />
        <button type='submit'>Upload</button>
      </form>
    </>
  );
};

export default AvatarUploadPage;
