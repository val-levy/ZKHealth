require('dotenv').config();
const StellarSdk = require('stellar-sdk');

async function main() {
  const secret = process.env.STELLAR_SECRET;
  if (!secret || typeof secret !== 'string') {
    throw new Error('❌ STELLAR_SECRET not found or invalid. Check your .env file.');
  }

  const keypair = StellarSdk.Keypair.fromSecret(secret);
  const publicKey = keypair.publicKey();

  console.log("🔑 Public Key:", publicKey);

  // EXAMPLE: Store poseidonHash on-chain
  const server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

  const account = await server.loadAccount(publicKey);

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(StellarSdk.Operation.manageData({
      name: "fileHash",
      value: "your_poseidon_hash_here", // Replace with actual result
    }))
    .setTimeout(30)
    .build();

  transaction.sign(keypair);

  const result = await server.submitTransaction(transaction);
  console.log("✅ Transaction successful!");
  console.log(result._links.transaction.href);
}

main();
