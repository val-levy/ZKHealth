const fs = require("fs");
const circomlib = require("circomlibjs");

async function getCommitmentFromJson(filePath) {
  const poseidon = await circomlib.buildPoseidon();
  const F = poseidon.F;

  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);

  console.log("📄 Loaded data:", data);

  if (!data.vaccine || !data.doses || !data.date1 || !data.date2) {
    throw new Error("❌ Missing required fields in input.json");
  }

  const vaccineBig = BigInt("104874423883");
  const dosesBig = BigInt(data.doses);
  const date1Big = BigInt(data.date1);
  const date2Big = BigInt(data.date2);

  const inputs = [vaccineBig, dosesBig, date1Big, date2Big];
  const hash = poseidon(inputs);

  console.log("✅ Poseidon commitment:", F.toString(hash));
  return F.toString(hash);
}

module.exports = { getCommitmentFromJson };
if (require.main === module) {
  const filePath = process.argv[2];
  getCommitmentFromJson(filePath)
    .then((commitment) => console.log("✅ Poseidon commitment:", commitment))
    .catch(console.error);
}