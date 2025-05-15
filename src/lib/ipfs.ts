// lib/ipfs.ts
import { Web3Storage, File } from 'web3.storage';

const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN!;
const client = new Web3Storage({ token });

export async function uploadToIPFS(file: File): Promise<string> {
  const cid = await client.put([file], {
    wrapWithDirectory: false,
  });
  return cid;
}

export async function downloadFromIPFS(cid: string): Promise<Blob> {
  const res = await client.get(cid);
  if (!res?.ok) throw new Error("Failed to fetch from IPFS");
  const files = await res.files();
  return await files[0].arrayBuffer().then((b) => new Blob([b]));
}
