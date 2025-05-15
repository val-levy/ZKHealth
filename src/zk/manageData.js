require("dotenv").config();
const stellarSdk = require("stellar-sdk");

const {
  Server,
  Keypair,
  TransactionBuilder,
  Networks,
  Operation
} = stellarSdk;

const server = new Server("https://horizon-testnet.stellar.org");
const keypair = Keypair.fromSecret(process.env.STELLAR_SECRET);
console.log("Writing to:", keypair.publicKey());

async function writeCommitmentToStellar(key, value) {
    const account = await server.loadAccount(keypair.publicKey());
    const fee = await server.fetchBaseFee();

  const tx = new TransactionBuilder(account, {
    fee,
    networkPassphrase: Networks.TESTNET
  })
    .addOperation(Operation.manageData({
      name: key,
      value: Buffer.from(BigInt(value).toString(16).padStart(64, "0"), "hex")
    }))
    .setTimeout(30)
    .build();

  tx.sign(keypair);
  const res = await server.submitTransaction(tx);
  console.log(`✅ Data written:`, res._links.transaction.href);
}

module.exports = { writeCommitmentToStellar };
