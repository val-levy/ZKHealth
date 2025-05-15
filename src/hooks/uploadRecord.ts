// lib/uploadRecord.ts
import { supabase } from '../lib/supabase';
import { encryptFile } from '../lib/encrypt';
import { uploadToIPFS } from '../lib/ipfs';

export async function uploadRecord({
  file,
  userId,
  publicKey,
  sharedWith = [],
}: {
  file: File;
  userId: string;
  publicKey: string;
  sharedWith?: string[];
}) {
  // Step 1: Read file as binary
  const fileBuffer = new Uint8Array(await file.arrayBuffer());

  // Step 2: Encrypt file
  const encryptedFile = await encryptFile(fileBuffer, publicKey);

  // Step 3: Convert encrypted file to Blob/File for IPFS
    const encryptedFileArray = encryptedFile instanceof Uint8Array
    ? new Uint8Array(Uint8Array.from(encryptedFile).buffer) // ensure ArrayBuffer, not SharedArrayBuffer
    : new TextEncoder().encode(encryptedFile as string);

    const encryptedBlob = new Blob([encryptedFileArray], { type: 'application/octet-stream' });
    const encryptedFileForIPFS = new File([encryptedBlob], `${file.name}.pgp`);


  // Step 4: Upload to IPFS
  const ipfsHash = await uploadToIPFS(encryptedFileForIPFS);

  // Step 5: Store in Supabase
  const { error } = await supabase.from('records').insert([
    {
      owner_id: userId,
      ipfs_hash: ipfsHash,
      encrypted_meta: JSON.stringify({ fileName: file.name }),
      shared_with: sharedWith,
    },
  ]);

  if (error) throw new Error('Failed to upload record to Supabase: ' + error.message);
}



/*
Example usage in a component



import { uploadRecord } from '@/lib/uploadRecord';
import { useSession } from '@supabase/auth-helpers-react';

const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    await uploadRecord({
      file,
      userId: session.user.id,                // from Supabase auth
      publicKey: yourStoredPGPPublicKey,      // could come from DB or localStorage
      sharedWith: ['0xabc...', '0xdef...'],   // provider wallet addresses
    });
    alert('Upload successful');
  } catch (err) {
    console.error(err);
    alert('Upload failed');
  }
};

*/