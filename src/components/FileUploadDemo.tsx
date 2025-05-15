// components/FileUploadDemo.tsx
'use client'; // if using Next.js App Router

import { useState } from 'react';
import { uploadRecord } from '@/hooks/uploadRecord';
import { supabase } from '@/lib/supabase';

export default function FileUploadDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');

    try {
      setStatus('Uploading...');

      const session = await supabase.auth.getSession();
      const userId = session.data.session?.user.id;

      if (!userId) throw new Error('No user logged in');

      // 👇 Replace this with your actual user's PGP public key
      const dummyPGPPublicKey = `-----BEGIN PGP PUBLIC KEY BLOCK-----
...
-----END PGP PUBLIC KEY BLOCK-----`;

      await uploadRecord({
        file,
        userId,
        publicKey: dummyPGPPublicKey,
        sharedWith: [], // or add provider wallet addresses here
      });

      setStatus('Upload successful!');
    } catch (err: any) {
      console.error(err);
      setStatus('Upload failed: ' + err.message);
    }
  };

  return (
    <div className="p-4 border rounded max-w-md mx-auto mt-10 bg-white">
      <h2 className="text-xl font-bold mb-2">Upload Medical Record</h2>
      <input type="file" onChange={handleSelectFile} />
      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Upload
      </button>
      {status && <p className="mt-2">{status}</p>}
    </div>
  );
}
