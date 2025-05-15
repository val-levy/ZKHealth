// lib/encrypt.ts
import * as openpgp from 'openpgp';

export async function encryptFile(data: Uint8Array, publicKeyArmored: string): Promise<Uint8Array> {
  const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });

  const message = await openpgp.createMessage({ binary: data });

  const encrypted = await openpgp.encrypt({
    message,
    encryptionKeys: publicKey,
    format: 'binary', // ensures Uint8Array return
  });

  // encrypted will be Uint8Array
  return encrypted as Uint8Array;
}

export async function decryptFile(encryptedData: Uint8Array, privateKeyArmored: string, passphrase: string): Promise<Uint8Array> {
  const privateKey = await openpgp.decryptKey({
    privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
    passphrase,
  });

  const message = await openpgp.readMessage({ armoredMessage: new TextDecoder().decode(encryptedData) });

  const { data: decrypted } = await openpgp.decrypt({
    message,
    decryptionKeys: privateKey,
  });

  return typeof decrypted === 'string' ? new TextEncoder().encode(decrypted) : decrypted;
}
