# 🧬 ZKHealth – Technical Design Document

## 1. System Overview

ZKHealth is a privacy-first healthcare dapp enabling patients to securely share medical files with providers, using zero-knowledge proofs (ZKPs) to prove file authenticity without revealing contents. The system combines passkey-based authentication, ZK hashing, proof generation, and on-chain anchoring via Stellar smart contracts. Providers can verify proofs and, if authorized, access encrypted files.

---

## 2. Architecture

### High-Level Flow

1. **User Authentication:**  
   - Patient logs in using passkeys (WebAuthn) for a wallet-free, secure experience.

2. **File Upload & Hashing:**  
   - Patient uploads a PDF.  
   - File is hashed client-side using Poseidon (ZK-friendly hash).

3. **ZK Proof Generation:**  
   - Circom circuit generates a ZK proof that the file matches the hash.

4. **On-Chain Anchoring:**  
   - The hash is anchored on Stellar using `manageData` in a Soroban contract.

5. **Selective Sharing:**  
   - Patient can share the encrypted file and proof with a provider.

6. **Provider Verification:**  
   - Provider receives file and proof, verifies the hash matches the on-chain anchor, and confirms authenticity.

### Diagram

```
User (Patient)
   │
   ├─► Passkey Auth (Frontend)
   │
   ├─► Upload PDF ─► Poseidon Hash ─► ZK Proof (Circom)
   │
   ├─► Store Hash On-Chain (Stellar/Soroban)
   │
   └─► Share File + Proof (Encrypted, Off-chain)
           │
           ▼
   Provider Dashboard ─► Verify Proof + On-chain Hash
```

---

## 3. Main Components

- **Frontend (`frontend/`):**  
  React app for login, upload, sharing, and provider dashboard. Handles passkey auth, file hashing, proof generation, and UI.

- **ZK Circuits (`circuits/`):**  
  Circom circuits for Poseidon hashing and ZK proof generation. Includes input generators and SnarkJS integration.

- **Stellar Smart Contracts (`stellar/`):**  
  Rust-based Soroban contracts for anchoring file hashes using `manageData`. Ensures tamper-proof, timestamped records.

- **Scripts/CLI (`scripts/`):**  
  Node.js scripts for contract deployment, hash anchoring, and developer tooling.

- **Off-chain Storage:**  
  IPFS (simulated locally) for encrypted file storage, ensuring GDPR/HIPAA compliance.

---

## 4. Design Decisions & Rationale

- **Passkey Authentication:**  
  Chosen for frictionless, wallet-free login. Avoids onboarding hurdles of crypto wallets, improving UX and accessibility.

- **Poseidon Hash:**  
  Selected for ZK-friendliness and efficiency in Circom circuits, enabling performant proof generation.

- **Off-chain File Storage:**  
  Files are never stored on-chain to comply with privacy regulations (GDPR/HIPAA). Only hashes are anchored on Stellar.

- **Stellar `manageData`:**  
  Used for lightweight, tamper-proof anchoring of file hashes. Chosen for its simplicity and compatibility with Soroban.

- **Encrypted File Sharing:**  
  Files are encrypted client-side and shared only with authorized providers, ensuring end-to-end privacy.

---

## 5. Tradeoffs

- **Off-chain vs. On-chain Storage:**  
  Storing files off-chain sacrifices some decentralization but is necessary for privacy and regulatory compliance.

- **Passkeys vs. Wallets:**  
  Passkeys improve UX but may limit interoperability with some Web3 tools that expect wallet-based auth.

- **ZK Proof Complexity:**  
  Circom circuits are performant but require careful optimization for large files; we hash files in chunks to balance proof size and speed.

- **Stellar as Anchor:**  
  Stellar’s `manageData` is simple but not as expressive as some other chains’ smart contracts. We prioritized reliability and low cost.

---

## 6. Challenges & Solutions

- **ZK Proof Performance:**  
  Generating proofs for large files is slow. We optimized by hashing files in the browser in chunks, then proving the root hash.

- **Passkey Integration:**  
  WebAuthn APIs are still maturing. We used [passkey-kit](https://github.com/kalepail/passkey-kit) for cross-browser support.

- **Provider Verification UX:**  
  Ensuring providers can verify proofs without blockchain knowledge required a custom dashboard and clear UI flows.

- **On-chain Data Limits:**  
  Stellar’s `manageData` has size limits. We store only the hash, not the proof or file, and link off-chain data via metadata.

- **Privacy Compliance:**  
  All sensitive data remains off-chain and encrypted. Only non-identifying hashes are anchored on-chain.

---

## 7. References

- [Circom Documentation](https://docs.circom.io/)
- [Stellar Soroban](https://soroban.stellar.org/)
- [Passkey Kit](https://github.com/kalepail/passkey-kit)
- [Poseidon Hash](https://github.com/iden3/poseidon)

---

**Authors:** Drew Manley, Val Levy, Armaan Hajar, Finn Fujimura  
**Hackathon:** Stellar Consensus 2025
