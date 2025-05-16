🧬 **ZKHealth – Zero-Knowledge Patient Sharing**

Built for Stellar Consensus Hackathon 2025
Web3 UX doesn’t have to suck. We proved it.

🔥 Why: The Narrative
What we’re building
ZKPS is a privacy-preserving healthcare dapp that enables patients to selectively prove the existence of off-chain medical documents—like vaccine records or diagnosis PDFs—using zero-knowledge proofs (ZKPs). Patients can share proof of a file without exposing its contents, and providers can verify integrity without storing sensitive data.

What it fixes
Web3 UX is clunky—wallets, keys, and complex flows slow everything down. We built a frictionless onboarding system using Stellar Passkeys, removed wallet interactions, and created a seamless, mobile-first experience that just works. Patients can login with Face ID, upload files, and approve share requests—no crypto knowledge required.

Who it helps
Patients managing sensitive health records and healthcare providers who need to verify authenticity without compromising patient privacy.

Why it’s important
In the age of AI and healthcare digitization, privacy and portability of data matters more than ever. ZKPS is built to scale for real-world adoption with decentralized proof and familiar UX.

Value proposition
🧠 ZK privacy + 🪪 passkey identity + 🌐 on-chain anchoring = Real UX breakthrough for Web3 healthcare.

✅ Implemented Features
🔐 Zero-Knowledge Proofs for File Integrity

👤 Passkey Login via passkey-kit

📁 Drag-and-Drop PDF Upload + Poseidon Hashing

🚀 Stellar On-Chain Anchoring via manageData

📤 Selective File Sharing with Providers

🧑‍⚕️ Provider Dashboard: Receive, verify, and view shared files

🌉 Seamless Smart Wallet Onboarding with Launchtube

📲 Mobile-Optimized, Wallet-Free Flow

✅ Live Testnet Deployment with Working Contracts

🛠 Technologies Used
Frontend: React, Vite, Tailwind CSS, Framer Motion

ZK Stack: Circom, SnarkJS, Poseidon Hash

Authentication: Passkeys via passkey-kit

Blockchain: Stellar Smart Contracts, manageData, Soroban

Dev Tools: js-stellar-sdk, launchtube

Data Storage: Off-chain IPFS (local simulation)

Build/Deploy: Launchtube, Stellar CLI

🌐 Live Links
🧭 Why Narrative: docs/WHY.md

🛠 Technical Design Docs: docs/TECHNICAL_DESIGN.md

🌍 Frontend App (Testnet): https://zkps.health

📦 Public GitHub Repo: https://github.com/your-team/zkps

🧾 Deployed Contract:

Contract ID: GC4X...ZKPS1

View on Stellar Expert

📄 Technical Design Docs Overview
See full doc at: docs/TECHNICAL_DESIGN.md

System Overview
A patient-facing app enabling passkey-authenticated file uploads, ZK hashing, proof generation, and on-chain anchoring—verifiable by providers.

Architecture Diagram
(Add flowchart here)

User → Uploads file → Poseidon hash → ZK proof → Send + store proof

Stellar stores hash in manageData

Providers verify hash from shared file + compare

Components
frontend/: React app with login, upload, sharing views

circuits/: Circom ZK circuit, input.json generator

stellar/: Rust contract logic + deployment

scripts/: CLI for interacting with contracts

Design Choices
Off-chain file storage to ensure GDPR/HIPAA compliance

Poseidon for ZK-friendly hashing

Stellar manageData to store tamper-proof hash anchors

Passkeys eliminate wallet UX friction

Events & Interactions
File uploaded → hash stored on-chain

ZK proof verified on provider dashboard

No blockchain literacy required from user

🧪 Optional (if you finish):
✅ Automated ZK Proof testing

✅ Auto-deploy build artifacts

🔗 Link to Launchtube Deployment

📢 Tags & Metadata
Repo Name: zkps-stellar-consensus-2025

Topics: stellar, rust, smart-contracts, consensus-toronto-2025

Website points to: https://developers.stellar.org/

📬 Contact
Built with ♥ by [Your Team Name]
Find us at [yourwebsite.com] or [@yourTwitterHandle]


