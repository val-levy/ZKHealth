
import React, { useState } from "react";
import Button from "./Button";

interface FileUploadProps {
  userId: string;
  onUploadComplete?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ userId, onUploadComplete }) => {
  const [status, setStatus] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) {
      console.error("Missing file or user ID.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Upload failed:", data);
        setStatus("❌ Upload failed.");
        return;
      }

      setStatus("✅ File uploaded.");
      onUploadComplete?.();
    } catch (err: any) {
    console.error("❌ Upload error:", err);

    // Try extracting backend error if available
    if (err instanceof Response) {
      const data = await err.json();
      console.error("❌ Backend responded with:", data);
      setStatus("❌ Upload failed: " + (data.detail || "Unknown error"));
    } else {
      setStatus("❌ Upload error: " + err.message);
    }
    
  }

  };

  return (
    <div>
      <div
        className="cursor-pointer inline-block"
        onClick={() => document.getElementById("upload-hidden")?.click()}
      >
        <Button variant="primary">Select Files</Button>
      </div>
      <input
        id="upload-hidden"
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
      {status && <p className="text-sm mt-2">{status}</p>}
    </div>
  );
};

export default FileUpload;
