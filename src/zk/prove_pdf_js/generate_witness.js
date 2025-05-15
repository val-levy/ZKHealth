const fs = require("fs");
const build = require("./witness_calculator.js");

async function main() {
  const wasmPath = process.argv[2];
  const inputPath = process.argv[3];
  const outputPath = process.argv[4];

  const buffer = fs.readFileSync(wasmPath);
  const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  const witnessCalculator = await build(buffer);
  const witness = await witnessCalculator.calculateWTNSBin(input, 0);

  fs.writeFileSync(outputPath, witness);
  console.log("✅ Witness written to", outputPath);
}

main();
