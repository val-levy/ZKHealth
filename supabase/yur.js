import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';

// 1. Call your backend to generate a registration challenge
const optionsResponse = await fetch('/webauthn/generate-registration-options');
const options = await optionsResponse.json();

// 2. Trigger YubiKey and get credential
const attResp = await startRegistration(options);

// 3. Send result to your backend to verify and store
await fetch('/webauthn/verify-registration', {
  method: 'POST',
  body: JSON.stringify(attResp),
  headers: { 'Content-Type': 'application/json' },
});
