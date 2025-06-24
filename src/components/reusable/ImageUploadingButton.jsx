import React from "react";
import ImageUploading from "react-images-uploading";

// Helper to extract filename
const extractFilename = (dataURL = "") => {
  if (!dataURL) return "";
  if (dataURL.startsWith("data:")) return "image-preview";
  return dataURL.split("/").pop()?.split("?")[0] || "image-preview";
};

const truncateFileName = (name = "", maxLength = 20) => {
  if (!name || name.length <= maxLength) return name;

  const dotIndex = name.lastIndexOf(".");
  const base = name.slice(0, dotIndex);
  const ext = name.slice(dotIndex);

  const visibleChars = maxLength - ext.length - 3; // leave space for "..."
  return base.slice(0, visibleChars) + "..." + ext;
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
            className="form-control flex items-center gap-3 cursor-pointer"
            type="File"
            role="button"
          >
            <span className="choose-btn font-semibold shrink-0 bg-gray-100 px-2 py-1 rounded">
              Choose files
            </span>
            <span
              className="file-label text-gray-700 text-sm truncate max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis"
              title={
                value && value.length > 0
                  ? value[0]?.file?.name || extractFilename(value[0]?.data_url)
                  : "No file chosen"
              }
            >
              {value && value.length > 0
                ? truncateFileName(value[0]?.file?.name || extractFilename(value[0]?.data_url))
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
            style={{ width: "8.5%", borderRadius: "8px" }}
          >
            {btntext}
          </button>
        );
      }}
    </ImageUploading>
  );
};