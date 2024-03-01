import React, { useState, useEffect } from "react";
import Resumable from "resumablejs";

const VideoUpload = () => {
  const [resumable, setResumable] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadVideoSize, setUploadVideoSize] = useState(0);
  const [uploadTotalVideoSize, setUploadTotalVideoSize] = useState(0);

  function bytesToMB(bytes) {
    const megabytes = bytes / (1024 * 1024);
    return megabytes.toFixed(2);
  }

  useEffect(() => {
    const initializeResumable = () => {
      const uploader = new Resumable({
        target: "http://localhost:3001/upload",
        chunkSize: 5 * 1024 * 1024,
        simultaneousUploads: 3,
        forceChunkSize: true,
      });

      uploader.on("fileAdded", async () => {
        try {
          uploader.upload();
        } catch (error) {
          console.log("Error during API request:", error);
        }
      });

      uploader.on("fileProgress", async (file) => {
        try {
          const progress = file.progress();
          // if (+(progress * 100).toFixed(0) < 98) {
          setUploadProgress(+(progress * 100).toFixed(0));
          const currentUploadedMB = (progress * file.size) / (1024 * 1024);
          setUploadVideoSize(currentUploadedMB);
          // }
        } catch (error) {
          console.log("Error during API request:", error);
        }
      });

      uploader.on("fileSuccess", async (file, message) => {
        try {
          const responseData = JSON.parse(message);
          setUploadProgress(100);
          setUploadVideoSize(bytesToMB(file?.size));
          uploader.removeFile(file);
        } catch (error) {
          console.log("🚀 ~ uploader.on ~ error:", error);
        }
      });

      uploader.on("fileError", (file, message) => {
        console.log(
          `Error uploading file ${file.fileName}. Response:`,
          message
        );
      });
      setResumable(uploader);
    };

    initializeResumable();
    return () => {
      if (resumable) {
        resumable.destroy();
      }
    };
  }, []);

  const startUpload = () => {
    if (resumable) {
      resumable.upload();
    }
  };

  return (
    <div>
      <input
        type='file'
        onChange={(e) => {
          const totalSize = bytesToMB(e.target.files[0]?.size);
          setUploadTotalVideoSize(totalSize);
          resumable.addFile(e.target.files[0]);
        }}
      />
      <button onClick={startUpload}>Start Upload</button>
      <p>
        {uploadVideoSize || 0} MB of {uploadTotalVideoSize} MB
      </p>
      <p>{uploadProgress || 0} %</p>
    </div>
  );
};

export default VideoUpload;
