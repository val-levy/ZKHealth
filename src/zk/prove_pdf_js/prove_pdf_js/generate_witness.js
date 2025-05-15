const fs = require("fs");
const build = require("./prove_pdf_js/witness_calculator.js"); // use relative path if needed

async function main() {
  const wasmPath = process.argv[2];
  const inputPath = process.argv[3];
  const outputPath = process.argv[4];

  const buffer = fs.readFileSync(wasmPath);
  const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  // This is the correct way to use it
  const witnessCalculator = await build(buffer);
  const witness = await witnessCalculator.calculateWTNSBin(input, 0);

  fs.writeFileSync(outputPath, witness);
  console.log("✅ Witness generated at", outputPath);
}

main();
