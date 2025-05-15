// lib/auth.ts
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';

export async function registerYubiKey() {
  const resp = await fetch('/api/webauthn/register-options');
  const options = await resp.json();
  const attResp = await startRegistration(options);

  const verification = await fetch('/api/webauthn/register', {
    method: 'POST',
    body: JSON.stringify(attResp),
    headers: { 'Content-Type': 'application/json' },
  });

  return verification.ok;
}

export async function loginWithYubiKey() {
  const resp = await fetch('/api/webauthn/login-options');
  const options = await resp.json();
  const authResp = await startAuthentication(options);

  const verification = await fetch('/api/webauthn/login', {
    method: 'POST',
    body: JSON.stringify(authResp),
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await verification.json();
  return data; // should contain userId or wallet address
}
