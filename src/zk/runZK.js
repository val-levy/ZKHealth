const { getCommitmentFromJson } = require("./circuit_build/hashRecord.js");
const { writeCommitmentToStellar } = require("./manageData.js");

(async () => {
  const commitment = await getCommitmentFromJson("./input.json");
  await writeCommitmentToStellar("covid_commitment", commitment);
})();
