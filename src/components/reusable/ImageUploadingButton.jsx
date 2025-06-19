import ImageUploading from "react-images-uploading";
export const ImageUploadingButton = ({ value, onChange }) => {
  return (
    <ImageUploading value={value} onChange={onChange} acceptType={["jpg", "png", "jpeg", "webp"]}>
      {({ onImageUpload, onImageUpdate }) => (
        <button
          onClick={!value || value.length === 0 ? onImageUpload : () => onImageUpdate(0)}
          className="form-control purple-btn2"
        >
          Upload Image
        </button>
      )}
    </ImageUploading>
  );
};