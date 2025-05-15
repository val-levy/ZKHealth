// ✅ Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const circomlibjs = require('circomlibjs');
const stellar = require('stellar-sdk');

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded');

    const filePath = path.join(__dirname, req.file.path);
    console.log("📄 File received:", req.file.originalname);

    // Step 1: SHA-256 → Poseidon hash
    const buffer = fs.readFileSync(filePath);
    const sha256 = crypto.createHash("sha256").update(buffer).digest();
    const shaBigInt = BigInt("0x" + sha256.toString("hex"));

    const poseidonHasher = await circomlibjs.buildPoseidon();
    const poseidonHash = poseidonHasher([shaBigInt]);
    const F = poseidonHasher.F;

    // Decimal string for ZK input
    const hashDecimal = F.toString(poseidonHash);
    
    // Hex string for Stellar (pad to 64 chars to be 32 bytes)
    const hashHex = BigInt(hashDecimal).toString(16).padStart(64, '0');
    
    console.log("✅ Poseidon Hash:", hashDecimal); // for ZK circuit
    

    // Step 2: Save hash for circuit input
    fs.writeFileSync(
      "prove_pdf_js/input.json",
      JSON.stringify({ fileHash: hashDecimal }, null, 2)
    );
    

    // Step 3: Generate witness
    execSync(`node prove_pdf_js/generate_witness.js prove_pdf_js/prove_pdf_js/prove_pdf.wasm prove_pdf_js/input.json prove_pdf_js/witness.wtns`);
    console.log("✅ Witness generated");

    // Step 4: Prove
    execSync(`snarkjs groth16 prove prove_pdf.zkey prove_pdf_js/witness.wtns prove_pdf_js/proof.json prove_pdf_js/public.json`);
    console.log("✅ ZK Proof generated");

    // Step 5: Verify
    execSync(`snarkjs groth16 verify prove_pdf_js/verification_key.json prove_pdf_js/public.json prove_pdf_js/proof.json`);
    console.log("✅ ZK Proof verified");

    // Step 6: Push to Stellar
    const server = new stellar.Server('https://horizon-testnet.stellar.org');
    const pair = stellar.Keypair.fromSecret(process.env.STELLAR_SECRET); // ✅ uses .env
    const account = await server.loadAccount(pair.publicKey());

    const transaction = new stellar.TransactionBuilder(account, {
      fee: stellar.BASE_FEE,
      networkPassphrase: stellar.Networks.TESTNET,
    })
    .addOperation(stellar.Operation.manageData({
      name: "pdf_hash",
      value: Buffer.from(hashHex, 'hex') // This ensures it's exactly 32 bytes
    }))
       
      .setTimeout(30)
      .build();

    transaction.sign(pair);
    const result = await server.submitTransaction(transaction);

    console.log("✅ Stellar transaction pushed:");
    console.log(`🔗 https://horizon-testnet.stellar.org/transactions/${result.hash}`);

    res.status(200).json({
      success: true,
      hash: {
        decimal: hashDecimal,
        hex: hashHex,
      },
      zk: {
        proof: 'prove_pdf_js/proof.json',
        public: 'prove_pdf_js/public.json',
      },
      stellar: result.hash,
    });

  } catch (err) {
    console.error("❌ Error during ZK processing:", err);
    res.status(500).send('ZK processing failed');
  }
});

app.listen(port, () => {
  console.log(`🚀 ZK server listening on http://localhost:${port}`);
});
