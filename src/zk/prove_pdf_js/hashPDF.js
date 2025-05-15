const fs = require("fs");
const circomlib = require("circomlibjs");
const crypto = require("crypto");
const path = require("path");

async function hashPDF(filename) {
  const poseidon = await circomlib.buildPoseidon();
  const F = poseidon.F;

  // Step 1: Read file
  const buffer = fs.readFileSync(filename);

  // Step 2: SHA-256 hash
  const sha256 = crypto.createHash("sha256").update(buffer).digest();

  // Step 3: Convert digest to BigInt for Poseidon
  const shaBigInt = BigInt("0x" + sha256.toString("hex"));
  const hash = poseidon([shaBigInt]);

  const result = F.toString(hash);

  // Step 4: Write input.json for ZK circuit
  const inputJson = {
    fileHash: result
  };

  fs.writeFileSync("input.json", JSON.stringify(inputJson, null, 2));
  console.log("✅ Poseidon commitment:", result);
}

hashPDF("Drew Manley's Resume.pdf");
