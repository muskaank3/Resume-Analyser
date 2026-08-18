import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UploadBox.css";

const UploadBox = ({ onUpload }) => {
  const navigate = useNavigate();

  const handleUpload = async (acceptedFiles) => {
    // JWT check
    const token = localStorage.getItem("token");

    // Login nahi hai → Login page
    if (!token) {
      navigate("/login");
      return;
    }

    const file = acceptedFiles[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("BACKEND DATA:", res.data);

      onUpload(res.data);
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [],
    },

    onDrop: handleUpload,
  });

  return (
    <div {...getRootProps()} className="upload-box">
      <input {...getInputProps()} />

      <p>Drag & Drop Resume here</p>

      <button type="button" className="upload-btn">
        Upload Resume
      </button>
    </div>
  );
};

export default UploadBox;