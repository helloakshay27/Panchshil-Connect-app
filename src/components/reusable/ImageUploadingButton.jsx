import React from "react";
import ImageUploading from "react-images-uploading";

// Helper to extract filename
const extractFilename = (dataURL = "") => {
  if (!dataURL) return "";
  if (dataURL.startsWith("data:")) return "image-preview";
  return dataURL.split("/").pop()?.split("?")[0] || "image-preview";
};

export const ImageUploadingButton = ({
  value,
  onChange,
  variant = "button", // 'button' or 'custom'
  btntext = "Upload Image",
}) => {
  return (
    <ImageUploading
      value={value}
      onChange={onChange}
      acceptType={["jpg", "png", "jpeg", "webp", "gif", "mp4", "webm", "mov", "avi"]}
    >
      {({ onImageUpload, onImageUpdate }) => {
        const handleClick = !value || value.length === 0 ? onImageUpload : () => onImageUpdate(0);

        if (variant === "custom") {
          return (
            <div
              onClick={handleClick}
              className="custom-upload-wrapper"
              role="button"
              style={{
                cursor: "pointer",
                display: "inline-flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <span className="choose-btn" style={{ fontWeight: 600 }}>Choose files</span>
              <span className="file-label" style={{ color: "#666" }}>
                {value && value.length > 0
                  ? value[0]?.file?.name || extractFilename(value[0]?.data_url)
                  : "No file chosen"}
              </span>
            </div>
          );
        }

        return (
          <button
            onClick={handleClick}
            className="form-control purple-btn2"
            type="button"
            style={{ width: "8%" }}
          >
            {btntext}
          </button>
        );
      }}
    </ImageUploading>
  );
};
