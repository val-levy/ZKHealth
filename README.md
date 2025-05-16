# 🧬 ZKPS – Zero-Knowledge Patient Sharing  
**Built for Stellar Consensus Hackathon 2025**  
_Web3 UX doesn’t have to suck. We proved it._

---

## 🔥 Why: The Narrative

**What we’re building**  
ZKHealth is a privacy-first healthcare dapp that empowers patients to **securely share medical files** like vaccine records, test results, and diagnosis documents—with **full control over who sees what**.

Using zero-knowledge proofs, we let patients prove that a **file exists and is authentic without exposing its contents**. But that’s just the start: users can also selectively share the actual PDF files with trusted healthcare providers through a **built-in encrypted file delivery system**, enabling **frictionless verification and care coordination**.

**What it fixes**  
Today’s medical record sharing is awful.

Patients are forced to navigate a maze of portals, faxes, emails, and paper forms just to share basic health records. Providers often operate in disconnected systems with no real-time access to verified patient data, leading to gaps in information, delayed diagnoses, and slower care delivery.

Worse, current solutions require users to sacrifice privacy or control, exposing their full health history even when only one file is needed.

ZKHealth fixes this by giving patients full control over what they share, when they share it, and who gets to see it. Patients can prove they have a valid record (like a COVID vaccine) without revealing the document, or securely share the full file only when needed — all in a few taps, from their computer, without logging into five different portals.

It’s faster for providers, private for patients, verifiable on-chain, and a hell of a lot cooler.

**Who it helps**  
Me. You. Us. 3.5 billion people have access to healthcare and every single one of them has to deal with the inherent problems within the medical file sharing space. We bridge privacy and UX to make sure people understand what of theirs is being shared, for how long, and on the flip side, whether that document is valid.

**Why it’s important**  
In the age of AI and healthcare digitization, **privacy and portability** of data matters more than ever. ZK Health is built to scale for real-world adoption with **decentralized proof and familiar UX**.

**Value proposition**  
🧠 **ZK privacy** + 🪪 **passkey identity** + 🌐 **on-chain anchoring** = Real UX breakthrough for Web3 healthcare.

---

## ✅ Implemented Features

- 🔐 **Zero-Knowledge Proofs for File Integrity**  
- 👤 **Passkey Login** via [passkey-kit](https://github.com/kalepail/passkey-kit)  
- 📁 **Drag-and-Drop PDF Upload + Poseidon Hashing**  
- 🚀 **Stellar On-Chain Anchoring** via `manageData`  
- 📤 **Selective File Sharing with Providers**  
- 🧑‍⚕️ **Provider Dashboard**: Receive, verify, and view shared files  
- 🌉 **Seamless Smart Wallet Onboarding with Launchtube**  
- 📲 **Mobile-Optimized, Wallet-Free Flow**  
- ✅ **Live Testnet Deployment with Working Contracts**

---

## 🛠 Technologies Used

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion  
- **ZK Stack**: Circom, SnarkJS, Poseidon Hash  
- **Authentication**: Passkeys via [passkey-kit](https://github.com/kalepail/passkey-kit)  
- **Blockchain**: Stellar Smart Contracts, `manageData`, `Soroban`  
- **Dev Tools**: [js-stellar-sdk](https://github.com/stellar/js-stellar-sdk), [launchtube](https://github.com/stellar/launchtube)  
- **Data Storage**: Off-chain IPFS (local simulation)  
- **Build/Deploy**: Launchtube, Stellar CLI

---

## 🌐 Live Links

- 🧭 **Why Narrative**: [docs/WHY.md](https://github.com/your-team/zkps/docs/WHY.md)  
- 🛠 **Technical Design Docs**: [docs/TECHNICAL_DESIGN.md](https://github.com/your-team/zkps/docs/TECHNICAL_DESIGN.md)  
- 🌍 **Frontend App (Testnet)**: [https://zkps.health](https://zkps.health)  
- 📦 **Public GitHub Repo**: [https://github.com/your-team/zkps](https://github.com/your-team/zkps)  
- 🧾 **Deployed Contract**:  
  - Contract ID: `GC4X...ZKPS1`  
  - [View on Stellar Expert](https://stellar.expert/explorer/testnet/account/GC4X...ZKPS1)

---

## 📄 Technical Design Docs Overview

> _See full doc at: [`docs/TECHNICAL_DESIGN.md`](https://github.com/your-team/zkps/docs/TECHNICAL_DESIGN.md)_

### System Overview  
A patient-facing app enabling passkey-authenticated file uploads, ZK hashing, proof generation, and on-chain anchoring—verifiable by providers.

### Architecture Diagram  
_(Add flowchart here)_  
- User → Uploads file → Poseidon hash → ZK proof → Send + store proof  
- Stellar stores hash in `manageData`  
- Providers verify hash from shared file + compare

### Components  
- `frontend/`: React app with login, upload, sharing views  
- `circuits/`: Circom ZK circuit, input.json generator  
- `stellar/`: Rust contract logic + deployment  
- `scripts/`: CLI for interacting with contracts

### Design Choices  
- **Off-chain file storage** to ensure GDPR/HIPAA compliance  
- **Poseidon** for ZK-friendly hashing  
- **Stellar `manageData`** to store tamper-proof hash anchors  
- **Passkeys** eliminate wallet UX friction

### Events & Interactions  
- File uploaded → hash stored on-chain  
- ZK proof verified on provider dashboard  
- No blockchain literacy required from user

---

## 🧪 Optional

- ✅ Automated ZK Proof testing  
- ✅ Auto-deploy build artifacts  
- 🔗 [Link to Launchtube Deployment](#)

---

## 📢 Tags & Metadata

- **Repo Name**: `zkps-stellar-consensus-2025`  
- **Topics**: `stellar`, `rust`, `smart-contracts`, `consensus-toronto-2025`  
- **Website Points To**: https://developers.stellar.org/

---

## 📬 Contact

Built with ♥ by **[Your Team Name]**  
[yourwebsite.com](https://yourwebsite.com) — [@yourTwitterHandle](https://twitter.com/yourTwitterHandle)
