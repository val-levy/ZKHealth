
import fs from "fs";
import axios from "axios";
import FormData from "form-data"; 
import dotenv from "dotenv";
dotenv.config(); 

import path from "path";
import { fileURLToPath } from "url";

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the root .env file path
const envPath = path.resolve(__dirname, "./.env");
dotenv.config({ path: envPath });

// ...rest of your code...

const PINATA_API_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"; 


// ✅ Upload File to IPFS
export async function uploadToIPFS(filePath) {
    console.log("Uploading file:", filePath);

    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const fileStream = fs.createReadStream(filePath);
    const formData = new FormData();
    formData.append("file", fileStream);

    const response = await axios.post(PINATA_API_URL, formData, {
        headers: {
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
            ...formData.getHeaders(), 
        },
    });

    return response.data.IpfsHash;
}

if (import.meta.url === `file://${process.argv[1]}`) {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error("Usage: node ipfs_hasher.js <filePath>");
        process.exit(1);
    }
    uploadToIPFS(filePath)
        .then(hash => {
            console.log("IPFS Hash:", hash);
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}