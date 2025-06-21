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
              className="form-control"
              type="File"
              role="button"
              // style={{
              //   width: "20%",
              //   borderRadius: "8px",
              //   display: "flex",
              //   alignItems: "center",
              //   justifyContent: "center",
              //   cursor: "pointer",
              //   backgroundColor: "#f0f0f0",
              //   padding: "10px",
              // }}
            >
              <span className="choose-btn" style={{ fontWeight: 600,  }}>Choose files</span>
              <span className="file-label" style={{  color: "#9b9b9b" }}>
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
            style={{ width: "8.5%", borderRadius:"8px"}}
          >
            {btntext}
          </button>
        );
      }}
    </ImageUploading>
  );
};