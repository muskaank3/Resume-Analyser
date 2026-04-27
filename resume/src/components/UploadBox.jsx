import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import "./UploadBox.css";

const UploadBox = ({ onUpload }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [] },

    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];

      const formData = new FormData();
      formData.append("resume", file);

      try {
        const res = await axios.post(
          "http://localhost:5000/upload",
          formData
        );

        console.log("BACKEND DATA:", res.data);

        onUpload(res.data); // ✅ FIXED
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <div {...getRootProps()} className="upload-box">
      <input {...getInputProps()} />
      <p>Drag & Drop Resume here</p>
      <button className="upload-btn">Upload Resume</button>
    </div>
  );
};

export default UploadBox;