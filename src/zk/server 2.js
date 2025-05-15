// zk/server.js

const express = require('express')
const multer = require('multer')
const cors = require('cors') 
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const app = express()
const PORT = 3000
app.use(
    cors({
      origin: 'http://localhost:5173', // your frontend URL
    })
  )
// File upload config
const upload = multer({ dest: 'uploads/' })

app.post('/upload', upload.single('file'), async (req, res) => {
  const uploadedPath = req.file.path
  const originalName = req.file.originalname
  const targetPath = path.join(__dirname, 'prove_pdf_js', 'yourfile.pdf')

  try {
    // Move to expected filename
    fs.renameSync(uploadedPath, targetPath)

    console.log('✅ File uploaded:', originalName)

    // 1. Hash the PDF and generate input.json
    execSync(`node prove_pdf_js/hashPDF.js`, { stdio: 'inherit' })

    // 2. Generate witness
    execSync(`node prove_pdf_js/generate_witness.js prove_pdf_js/prove_pdf_js/prove_pdf.wasm prove_pdf_js/input.json prove_pdf_js/witness.wtns`, { stdio: 'inherit' })

    // 3. Create proof
    execSync(`snarkjs groth16 prove prove_pdf_js/prove_pdf.zkey prove_pdf_js/witness.wtns prove_pdf_js/proof.json prove_pdf_js/public.json`, { stdio: 'inherit' })

    const proof = JSON.parse(fs.readFileSync('prove_pdf_js/proof.json', 'utf8'))
    const publicSignals = JSON.parse(fs.readFileSync('prove_pdf_js/public.json', 'utf8'))
    const input = JSON.parse(fs.readFileSync('prove_pdf_js/input.json', 'utf8'))

    res.json({
      proof,
      publicSignals,
      hash: input.fileHash
    })

  } catch (err) {
    console.error('❌ Error:', err)
    res.status(500).json({ error: 'ZK proof generation failed' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 ZK server listening on http://localhost:${PORT}`)
})
