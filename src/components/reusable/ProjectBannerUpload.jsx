import React, { useState, useRef } from 'react';
import { Upload, X, Trash2 } from 'lucide-react';

const ProjectBannerUpload = () => {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedRatio, setSelectedRatio] = useState(null);
  const [cropperImage, setCropperImage] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef(null);

  const ratios = [
    { label: '16:9', ratio: 16/9, width: 200, height: 112 },
    { label: '9:16', ratio: 9/16, width: 120, height: 213 },
    { label: '1:1', ratio: 1, width: 150, height: 150 },
    { label: '3:2', ratio: 3/2, width: 180, height: 120 }
  ];

  const handleRatioClick = (ratio) => {
    setSelectedRatio(ratio);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCropperImage({
          file,
          dataURL: e.target.result,
          targetRatio: selectedRatio
        });
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    event.target.value = '';
  };

  const handleCropComplete = (croppedFile) => {
    // Simulate cropped file with validation
    const img = new Image();
    img.onload = () => {
      const actualRatio = img.width / img.height;
      const targetRatio = selectedRatio.ratio;
      const isValidRatio = Math.abs(actualRatio - targetRatio) < 0.1;

      const newImage = {
        id: Date.now(),
        name: cropperImage.file.name,
        file: croppedFile || cropperImage.file,
        size: (croppedFile?.size || cropperImage.file.size) / (1024 * 1024), // MB
        ratio: selectedRatio.label,
        isValidRatio,
        uploadTime: new Date().toLocaleTimeString(),
        preview: URL.createObjectURL(croppedFile || cropperImage.file)
      };

      setUploadedImages(prev => [...prev, newImage]);
    };
    img.src = URL.createObjectURL(croppedFile || cropperImage.file);

    setShowCropper(false);
    setCropperImage(null);
    setSelectedRatio(null);
  };

  const handleRemoveImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
  };

  const SimpleCropper = ({ image, onComplete, onCancel }) => (
    <div className="cropper-overlay">
      <div className="cropper-modal">
        <div className="cropper-header">
          <h4>Crop Image - {image.targetRatio.label}</h4>
          <button onClick={onCancel} className="close-btn">×</button>
        </div>
        <div className="cropper-content">
          <div className="crop-preview">
            <img src={image.dataURL} alt="Preview" />
            <div className="crop-info">
              <p>Target Ratio: {image.targetRatio.label}</p>
              <p>Please adjust your image to fit the {image.targetRatio.label} ratio</p>
            </div>
          </div>
          <div className="cropper-actions">
            <button onClick={onCancel} className="cancel-btn">Cancel</button>
            <button onClick={() => onComplete(image.file)} className="complete-btn">
              Use Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="project-banner-upload">
      <div className="upload-header">
        <h2>Project Banner Images</h2>
        <p>Upload banner images supporting multiple ratios: 16:9, 9:16, 1:1, 3:2</p>
      </div>

      {/* Ratio Grid */}
      <div className="ratio-grid">
        {ratios.map((ratio) => (
          <div key={ratio.label} className="ratio-card">
            <div 
              className="ratio-upload-area"
              style={{ 
                width: ratio.width, 
                height: ratio.height,
                aspectRatio: ratio.ratio 
              }}
              onClick={() => handleRatioClick(ratio)}
            >
              <div className="upload-placeholder">
                <Upload size={24} />
              </div>
            </div>
            <div className="ratio-label">{ratio.label}</div>
          </div>
        ))}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Image Cropper Modal */}
      {showCropper && cropperImage && (
        <SimpleCropper
          image={cropperImage}
          onComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setCropperImage(null);
            setSelectedRatio(null);
          }}
        />
      )}

      {/* Uploaded Images Section */}
      {uploadedImages.length > 0 && (
        <>
          <div className="section-divider"></div>
          <div className="uploaded-section">
            <h3>Uploaded Banner Images</h3>
            <div className="uploaded-images">
              {uploadedImages.map((image) => (
                <div key={image.id} className={`uploaded-image-card ${!image.isValidRatio ? 'invalid' : ''}`}>
                  <div className="image-preview">
                    <img src={image.preview} alt={image.name} />
                  </div>
                  <div className="image-info">
                    <div className="image-name">{image.name}</div>
                    <div className="image-details">
                      <span className="image-ratio">{image.ratio}</span>
                      <span className="image-size">{image.size.toFixed(2)} MB</span>
                      {!image.isValidRatio && (
                        <span className="invalid-badge">Invalid Ratio</span>
                      )}
                    </div>
                    <div className="upload-time">Uploaded {image.uploadTime}</div>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveImage(image.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            {uploadedImages.length > 0 && (
              <div className="continue-section">
                <button className="continue-btn">
                  Continue ({uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} uploaded)
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        .project-banner-upload {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .upload-header {
          margin-bottom: 30px;
        }

        .upload-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #333;
          margin: 0 0 8px 0;
        }

        .upload-header p {
          color: #666;
          margin: 0;
          font-size: 14px;
        }

        .ratio-grid {
          display: flex;
          gap: 30px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 40px;
          padding: 40px 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .ratio-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .ratio-upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .ratio-upload-area:hover {
          border-color: #6366f1;
          background: #f8faff;
        }

        .upload-placeholder {
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .ratio-upload-area:hover .upload-placeholder {
          color: #6366f1;
        }

        .ratio-label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .section-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #e5e7eb, transparent);
          margin: 40px 0;
        }

        .uploaded-section h3 {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 20px;
        }

        .uploaded-images {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .uploaded-image-card {
          display: flex;
          align-items: center;
          padding: 16px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .uploaded-image-card.invalid {
          background: #fef2f2;
          border-color: #fecaca;
        }

        .uploaded-image-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .image-preview {
          width: 60px;
          height: 60px;
          border-radius: 6px;
          overflow: hidden;
          margin-right: 16px;
          flex-shrink: 0;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-info {
          flex: 1;
          min-width: 0;
        }

        .image-name {
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
          word-break: break-word;
        }

        .image-details {
          display: flex;
          gap: 12px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }

        .image-ratio {
          background: #e0e7ff;
          color: #3730a3;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .image-size {
          color: #6b7280;
          font-size: 12px;
        }

        .invalid-badge {
          background: #fee2e2;
          color: #dc2626;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .upload-time {
          color: #9ca3af;
          font-size: 12px;
        }

        .remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
          margin-left: 12px;
        }

        .remove-btn:hover {
          background: #fee2e2;
        }

        .continue-section {
          margin-top: 24px;
          text-align: center;
        }

        .continue-btn {
          background: #6366f1;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .continue-btn:hover {
          background: #5048e5;
        }

        /* Cropper Modal Styles */
        .cropper-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .cropper-modal {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
        }

        .cropper-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .cropper-header h4 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .close-btn:hover {
          background: #f3f4f6;
        }

        .cropper-content {
          padding: 20px;
        }

        .crop-preview {
          text-align: center;
          margin-bottom: 20px;
        }

        .crop-preview img {
          max-width: 100%;
          max-height: 300px;
          border-radius: 4px;
        }

        .crop-info {
          margin-top: 16px;
          padding: 12px;
          background: #f3f4f6;
          border-radius: 4px;
        }

        .crop-info p {
          margin: 4px 0;
          color: #6b7280;
          font-size: 14px;
        }

        .cropper-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .cancel-btn {
          background: #f3f4f6;
          color: #374151;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
        }

        .complete-btn {
          background: #6366f1;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .complete-btn:hover {
          background: #5048e5;
        }

        @media (max-width: 768px) {
          .ratio-grid {
            gap: 20px;
          }
          
          .uploaded-image-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .image-preview {
            margin-right: 0;
          }
          
          .remove-btn {
            margin-left: 0;
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectBannerUpload;