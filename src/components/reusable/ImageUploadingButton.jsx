import React from "react";
import ImageUploading from "react-images-uploading";

// Helper to get a displayable file name
const extractFilename = (dataURL = "") => {
  if (!dataURL) return "";
  if (dataURL.startsWith("data:")) return "image-preview";
  return dataURL.split("/").pop()?.split("?")[0] || "image-preview";
};

export const ImageUploadingButton = ({ value, onChange }) => {
  return (
    <ImageUploading
      value={value}
      onChange={onChange}
      acceptType={["jpg", "png", "jpeg", "webp", "gif", "mp4", "webm", "mov", "avi"]}
    >
      {({ onImageUpload, onImageUpdate }) => (
        <div
          onClick={!value || value.length === 0 ? onImageUpload : () => onImageUpdate(0)}
          className="custom-upload-wrapper"
          role="button"
        >
          <span className="choose-btn">Choose files</span>
          <span className="file-label">
            {value && value.length > 0
              ? value[0]?.file?.name || extractFilename(value[0]?.data_url)
              : "No file chosen"}
          </span>
        </div>
      )}
    </ImageUploading>
  );
};
