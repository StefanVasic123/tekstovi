'use client';

import type { PutBlobResult } from '@vercel/blob';
import { useState, useRef } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function AvatarUploadPage() {
  const user: any = useCurrentUser();

  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
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

          const newBlob = (await response.json()) as PutBlobResult;

          setBlob(newBlob);
        }}
      >
        <input name='file' ref={inputFileRef} type='file' required />
        <button type='submit'>Upload</button>
      </form>
      {blob && (
        <div>
          Blob url: <a href={blob.url}>{blob.url}</a>
        </div>
      )}
    </>
  );
}
