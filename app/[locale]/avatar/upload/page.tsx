'use client';

import { useRef } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface Props {
  handleImageChange: (result: any) => void; // Adjust the type according to your response shape
}

export default function AvatarUploadPage({ handleImageChange }: Props) {
  const user: any = useCurrentUser();

  const inputFileRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <h1>Upload Your Avatar</h1>

      <form
        onSubmit={async (event) => {
          event.preventDefault();

          if (!inputFileRef.current?.files) {
            throw new Error('No file selected');
          }

          const file = inputFileRef.current.files[0];

          const response = await fetch(
            `/api/avatar?filename=${file.name}&userId=${user.id}`,
            {
              method: 'POST',
              body: file,
            }
          );

          handleImageChange(await response.json());
        }}
      >
        <input name='file' ref={inputFileRef} type='file' required />
        <button type='submit'>Upload</button>
      </form>
    </>
  );
}
