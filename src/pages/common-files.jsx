import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Files, Upload } from "lucide-react";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const MAX_UPLOAD_SIZE = {
  images: 3 * 1024 * 1024, // 3MB
  videos: 10 * 1024 * 1024, // 10MB
  documents: 20 * 1024 * 1024, // 20MB (for brochures, PPTs)
};

const CommonFileUpload = () => {
  const connectEvents = useConnectEvents();
  const [filesData, setFilesData] = useState({
    instagram_photos_videos: [],
    site_photos_progress: [],
    print_media: [],
    company_profile: [],
    competition_project_builders: [],
    possession_intimation: [],
    birthday_anniversary_emailers: [],
    whatsapp_creatives: [],
  });

  const [showTooltip, setShowTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [modalFiles, setModalFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Configuration for different upload types, including aspect ratios
  const uploadConfigs = {
    instagram_photos_videos: {
      label: "Instagram Photos/ Videos",
      accept: "image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
      maxSize: MAX_UPLOAD_SIZE.documents,
      multiple: true,
    },
    site_photos_progress: {
      label: "Site Photos Progress/ Milestone Tagging",
      accept: "image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
      maxSize: MAX_UPLOAD_SIZE.documents,
      multiple: true,
    },
    print_media: {
      label: "Print Media",
      accept: "image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
      maxSize: MAX_UPLOAD_SIZE.documents,
      multiple: true,
    },
    company_profile: {
      label: "Company Profile",
      accept: "image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
      maxSize: MAX_UPLOAD_SIZE.documents,
      multiple: true,
    },
    competition_project_builders: {
      label: "Competition - Project (Builders)",
      accept: "image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
      maxSize: MAX_UPLOAD_SIZE.documents,
      multiple: true,
    },
    possession_intimation: {
      label: "Possession Intimation with Pictorial",
      accept: "image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
      maxSize: MAX_UPLOAD_SIZE.documents,
      multiple: true,
    },
    birthday_anniversary_emailers: {
      label: "Birthday, Anniversary Emailers with Pictorials",
      accept: "image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.html",
      maxSize: MAX_UPLOAD_SIZE.documents,
      multiple: true,
    },
    whatsapp_creatives: {
      label: "Whatsapp Creatives (Tollfree/ Without Tollfree)",
      accept: "image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx",
      maxSize: MAX_UPLOAD_SIZE.documents,
      multiple: true,
    },
  };

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  // Helper function to get file icon and color based on file type
  const getFileIcon = (type, name) => {
    const extension = name.split('.').pop().toLowerCase();
    
    if (type.includes('pdf') || extension === 'pdf') {
      return { icon: '📄', color: '#dc3545', label: 'PDF' };
    } else if (type.includes('excel') || type.includes('spreadsheet') || ['xls', 'xlsx'].includes(extension)) {
      return { icon: '📊', color: '#28a745', label: 'Excel' };
    } else if (type.includes('word') || ['doc', 'docx'].includes(extension)) {
      return { icon: '📝', color: '#007bff', label: 'Word' };
    } else if (type.includes('presentation') || ['ppt', 'pptx'].includes(extension)) {
      return { icon: '📽️', color: '#fd7e14', label: 'PowerPoint' };
    } else if (type.includes('text') || extension === 'txt') {
      return { icon: '📄', color: '#6c757d', label: 'Text' };
    } else {
      return { icon: '📎', color: '#6c757d', label: 'File' };
    }
  };

  // Helper function to open file in new tab
  const openFile = (fileUrl, fileName) => {
    if (fileUrl) {
      // Open file in new tab
      window.open(fileUrl, '_blank');
    } else {
      toast.error(`Cannot open ${fileName}. File URL not available.`);
    }
  };

  // Fetch uploaded files from API
  const fetchUploadedFiles = async () => {
    try {
      setIsLoading(true);
      
      const response = await axios.get(`${baseURL}attachfiles.json`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      console.log('Fetched files API Response:', response.data);

      if (response.data && Array.isArray(response.data)) {
        // Transform API data to match component structure

        const transformedData = {
          instagram_photos_videos: [],
          site_photos_progress: [],
          print_media: [],
          company_profile: [],
          competition_project_builders: [],
          possession_intimation: [],
          birthday_anniversary_emailers: [],
          whatsapp_creatives: [],
        };

        // Map API relations to component categories
        const relationMapping = {
          'instagram_files': 'instagram_photos_videos',
          'milestone_tagging': 'site_photos_progress',
          'print_media': 'print_media',
          'company_profile': 'company_profile',
          'competition_project': 'competition_project_builders',
          'possesion_intimation': 'possession_intimation',
          'personal_emailers_pictorials': 'birthday_anniversary_emailers',
          'whatsapp_creatives': 'whatsapp_creatives',
        };

        response.data.forEach((fileItem) => {
          const category = relationMapping[fileItem.relation];
          if (category) {
            transformedData[category].push({
              file: null, // API file doesn't have File object
              name: fileItem.document_file_name || 'Unknown File',
              preview: fileItem.document_url || null,
              type: fileItem.document_content_type || '',
              id: fileItem.id,
              url: fileItem.document_url,
              size: fileItem.document_file_size || 0,
              uploaded_at: fileItem.created_at,
              isFromAPI: true // Flag to identify API files
            });
          }
        });

        setFilesData(transformedData);
      }

    } catch (error) {
      console.error('Error fetching uploaded files:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to fetch uploaded files.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load uploaded files on component mount
  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  // Handles files from direct input (non-cropper)
  const handleDirectFileUpload = (name, inputFiles) => {
    const config = uploadConfigs[name];
    if (!config) {
      toast.error("Invalid upload category.");
      return;
    }

    const newFiles = Array.from(inputFiles);
    const validFiles = [];

    newFiles.forEach((file) => {
      // Skip file type validation for now - accept all files
      // if (config.accept && !new RegExp(config.accept.replace(/\./g, "\\.").replace(/\*/g, ".*")).test(file.type)) {
      //   toast.error(`Invalid file type for ${config.label}: ${file.name}`);
      //   return;
      // }
      if (file.size > config.maxSize) {
        toast.error(
          `File too large: ${file.name}. Max size is ${formatFileSize(
            config.maxSize
          )}.`
        );
        return;
      }
      validFiles.push({
        file,
        name: file.name,
        preview: file.type.startsWith("image/") || file.type.startsWith("video/") ? URL.createObjectURL(file) : null,
        type: file.type,
      });
    });

    if (validFiles.length > 0) {
      // Don't add to state immediately - let API fetch handle it
      // Upload the newly selected files
      autoSubmitFiles(name, validFiles);
    }
  };

  const discardFile = (category, indexToRemove) => {
    setFilesData((prev) => ({
      ...prev,
      [category]: prev[category].filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  // Delete file from API and remove from display
  const deleteFile = async (category, indexToRemove, fileId, fileName) => {
    if (!fileId) {
      // If no fileId, just remove from local state (newly uploaded file not yet saved)
      discardFile(category, indexToRemove);
      return;
    }

    try {
      // Make DELETE API call
      const response = await axios.delete(`${baseURL}attachfiles/${fileId}.json`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      console.log('Delete file API Response:', response.data);

      // Check for successful response
      if (response.status >= 200 && response.status < 300) {
        connectEvents.onRecordDeleted({ record_id: fileId });
        toast.success(`File "${fileName}" deleted successfully.`);
        
        // Remove from local state
        discardFile(category, indexToRemove);
      } else {
        console.warn('Unexpected delete response:', response);
        toast.error('Failed to delete file. Please try again.');
      }

    } catch (error) {
      console.error('Delete file error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to delete file. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleFileNameChange = (category, index, newName) => {
    setFilesData((prev) => ({
      ...prev,
      [category]: prev[category].map((file, i) =>
        i === index ? { ...file, name: newName } : file
      ),
    }));
  };

  // Auto-submit function when files are added
  const autoSubmitFiles = async (categoryKey, newFiles) => {
    if (newFiles.length === 0) return;

    // Map categoryKey to the correct parameter name
    const getParameterName = (key) => {
      const mapping = {
        instagram_photos_videos: 'instagram_files',
        site_photos_progress: 'milestone_tagging',
        print_media: 'print_media',
        company_profile: 'company_profile',
        competition_project_builders: 'competition_project',
        possession_intimation: 'possesion_intimation',
        birthday_anniversary_emailers: 'personal_emailers_pictorials',
        whatsapp_creatives: 'whatsapp_creatives',
      };
      return mapping[key] || key;
    };

    try {
      // Create FormData for API submission
      const formData = new FormData();
      const parameterName = getParameterName(categoryKey);
      
      // Add relation information
      formData.append('relation', parameterName);
      formData.append('relation_id', 123);
      
      // Add files to attachfiles array
      newFiles.forEach((fileData) => {
        formData.append('attachfiles[]', fileData.file);
      });

      console.log(`Auto-submitting ${categoryKey} files to API with relation: ${parameterName}`, newFiles);

      // Make API call to upload files
      const response = await axios.post(`${baseURL}attachfiles.json`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      console.log('Auto-submit API Response:', response.data);

      // Check for successful response with multiple conditions
      const isSuccess = response.status >= 200 && response.status < 300 || 
                       response.data.success === true || 
                       response.data.status === 'success' ||
                       response.data.message === 'success';

      if (isSuccess) {
        toast.success(`${newFiles.length} file(s) uploaded and submitted automatically for ${uploadConfigs[categoryKey]?.label}`);
        
        // Refresh the files data from API to get the latest uploaded files
        setTimeout(() => {
          fetchUploadedFiles();
        }, 500);
      } else {
        console.warn('Unexpected API response:', response);
        toast.error('Failed to auto-submit files. Please try manual submission.');
      }

    } catch (error) {
      console.error('Auto-submit error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to auto-submit files. Please try manual submission.';
      toast.error(errorMessage);
    }
  };

  // Render a file upload section
  const renderFileUploadSection = (categoryKey) => {
    const config = uploadConfigs[categoryKey];
    if (!config) return null;

    const currentFiles = filesData[categoryKey] || [];

    const tooltipText = `Supports: Images, Videos, PDFs, Documents (DOC/DOCX), Presentations (PPT/PPTX), Excel (XLS/XLSX)`;

    return (
      <div className="d-flex flex-column mb-4 common-files__section">
        <div className="d-flex justify-content-between align-items-center mx-1">
          <h5 className="mb-0" style={{ fontSize: 15, fontWeight: 600, color: "#222" }}>
            {config.label}{" "}
            <span
              className="tooltip-container banner-upload-hint"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              [i]
              {showTooltip && (
                <span className="tooltip-text">{tooltipText}</span>
              )}
            </span>
            {config.required && <span className="otp-asterisk"> *</span>}
          </h5>
          <button
            className="banner-form-action-btn"
            type="button"
            onClick={() => openModal(categoryKey)}
            style={{ minWidth: 100, height: 36 }}
          >
            + Add
          </button>
          <input
            id={categoryKey}
            className="banner-upload-native-input"
            type="file"
            name={categoryKey}
            accept={config.accept}
            multiple={config.multiple}
            onChange={(e) => handleDirectFileUpload(categoryKey, e.target.files)}
          />
        </div>
        <div className="col-md-12 mt-2">
          <div
            className="mt-2 tbl-container common-files__table"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
            <table className="w-100">
              <colgroup>
                <col style={{ width: config.ratios ? "48%" : "58%" }} />
                <col style={{ width: config.ratios ? "27%" : "30%" }} />
                {config.ratios && <col style={{ width: "13%" }} />}
                <col style={{ width: "12%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Preview</th>
                  {config.ratios && <th>Ratio</th>}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={config.ratios ? 4 : 3} className="text-center">
                      <div 
                        className="spinner-border spinner-border-sm me-2" 
                        role="status" 
                        aria-hidden="true"
                        style={{ color: '#de7008' }}
                      ></div>
                      <span style={{ color: '#de7008' }}>Loading files...</span>
                    </td>
                  </tr>
                ) : currentFiles.length === 0 ? (
                  <tr>
                    <td colSpan={config.ratios ? 4 : 3}>No files selected</td>
                  </tr>
                ) : (
                  currentFiles.map((file, index) => {
                    const isVideo = file.type?.startsWith("video/");
                    const isImage = file.type?.startsWith("image/") && !file.type?.includes("pdf");
                    const isDocument = !isImage && !isVideo;
                    const isFromAPI = file.isFromAPI;

                    return (
                      <tr key={index}>
                        <td>
                          {isFromAPI ? (
                            <span style={{ padding: "5px 8px", fontSize: "14px" }}>
                              {file.name}
                            </span>
                          ) : (
                            <input
                              type="text"
                              className="form-control"
                              value={file.name || ""}
                              onChange={(e) =>
                                handleFileNameChange(categoryKey, index, e.target.value)
                              }
                              placeholder={`File ${index + 1}`}
                              style={{
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                                padding: "5px 8px",
                                fontSize: "14px",
                                width: "100%",
                              }}
                            />
                          )}
                        </td>
                        <td>
                          {isImage && (
                            <img
                              style={{ maxWidth: 100, maxHeight: 100 }}
                              className="img-fluid rounded"
                              src={isFromAPI ? file.url : file.preview}
                              alt={file.name}
                            />
                          )}
                          {isVideo && (
                            <video
                              controls
                              style={{ maxWidth: 100, maxHeight: 100 }}
                              className="img-fluid rounded"
                            >
                              <source src={isFromAPI ? file.url : file.preview} type={file.type || 'video/mp4'} />
                              Your browser does not support the video tag.
                            </video>
                          )}
                          {isDocument && (
                            <div
                              className="common-files__document-preview"
                              onClick={() => isFromAPI ? openFile(file.url, file.name) : null}
                              style={{ 
                                cursor: isFromAPI ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px',
                                borderRadius: '4px',
                                backgroundColor: isFromAPI ? '#f8f9fa' : 'transparent',
                                transition: 'background-color 0.2s',
                                maxWidth: '120px'
                              }}
                              onMouseEnter={(e) => {
                                if (isFromAPI) {
                                  e.target.style.backgroundColor = '#e9ecef';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (isFromAPI) {
                                  e.target.style.backgroundColor = '#f8f9fa';
                                }
                              }}
                              title={isFromAPI ? `Click to open ${file.name}` : file.name}
                            >
                              <span style={{ fontSize: '24px' }}>
                                {getFileIcon(file.type, file.name).icon}
                              </span>
                              <div style={{ fontSize: '11px', color: '#666' }}>
                                <div style={{ fontWeight: '500', color: getFileIcon(file.type, file.name).color }}>
                                  {getFileIcon(file.type, file.name).label}
                                </div>
                                {isFromAPI && (
                                  <div style={{ fontSize: '10px', color: '#999' }}>
                                    Click to open
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                        {config.ratios && <td>{file.ratio || "N/A"}</td>}
                        <td>
                          <button
                            type="button"
                            className="banner-form-action-btn common-files__delete-button"
                            onClick={() => {
                              if (file.isFromAPI && file.id) {
                                deleteFile(categoryKey, index, file.id, file.name);
                              } else {
                                discardFile(categoryKey, index);
                              }
                            }}
                            title={isFromAPI ? "Delete file permanently" : "Remove from display"}
                            style={{ minWidth: 30, width: 30, height: 30, padding: 0 }}
                          >
                            x
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Open modal for file selection
  const openModal = (categoryKey) => {
    setCurrentCategory(categoryKey);
    setModalFiles([]);
    setShowModal(true);
  };

  // Close modal and reset
  const closeModal = () => {
    setShowModal(false);
    setCurrentCategory('');
    setModalFiles([]);
    setIsUploading(false);
  };

  // Handle file selection in modal
  const handleModalFileSelection = (inputFiles) => {
    const config = uploadConfigs[currentCategory];
    if (!config) {
      toast.error("Invalid upload category.");
      return;
    }

    const newFiles = Array.from(inputFiles);
    const validFiles = [];

    newFiles.forEach((file) => {
      if (file.size > config.maxSize) {
        toast.error(
          `File too large: ${file.name}. Max size is ${formatFileSize(
            config.maxSize
          )}.`
        );
        return;
      }
      validFiles.push({
        file,
        name: file.name,
        preview: file.type.startsWith("image/") || file.type.startsWith("video/") ? URL.createObjectURL(file) : null,
        type: file.type,
      });
    });

    setModalFiles(config.multiple ? [...modalFiles, ...validFiles] : validFiles);
  };

  // Upload files from modal
  const uploadModalFiles = async () => {
    if (modalFiles.length === 0) {
      toast.error("Please select files to upload.");
      return;
    }

    setIsUploading(true);

    try {
      // Upload via API first
      await autoSubmitFiles(currentCategory, modalFiles);
      
      // Close modal on success
      setTimeout(() => {
        closeModal();
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Remove file from modal selection
  const removeModalFile = (indexToRemove) => {
    setModalFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Modal component
  const renderModal = () => {
    if (!showModal || !currentCategory) return null;

    const config = uploadConfigs[currentCategory];
    const tooltipText = `Supports: Images, Videos, PDFs, Documents (DOC/DOCX), Presentations (PPT/PPTX), Excel (XLS/XLSX)`;

    return (
      <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #dee2e6', padding: '20px 30px' }}>
              <h5 className="modal-title" style={{ color: '#333', fontWeight: '600', fontSize: '18px' }}>
                Upload Files - {config?.label}
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={closeModal}
                style={{ fontSize: '20px' }}
              ></button>
            </div>
            <div className="modal-body" style={{ padding: '30px' }}>
              <div className="mb-4">
                <small className="text-muted" style={{ fontSize: '13px', color: '#666' }}>
                  {tooltipText}
                </small>
              </div>
              
              {/* File Input */}
              <div className="mb-4">
                <input
                  id={`modal-${currentCategory}`}
                  className="banner-upload-native-input"
                  type="file"
                  accept={config?.accept}
                  multiple={config?.multiple}
                  onChange={(e) => handleModalFileSelection(e.target.files)}
                />
                <div className="banner-upload-dropzone">
                  <button
                    type="button"
                    className="banner-upload-files-btn"
                    onClick={() =>
                      document.getElementById(`modal-${currentCategory}`)?.click()
                    }
                  >
                    <Upload size={16} strokeWidth={1.8} />
                    Upload Files
                  </button>
                  <span className="banner-upload-item-label">
                    {config?.label}
                  </span>
                </div>
              </div>

              {/* Selected Files Preview - Simple Grid */}
              {modalFiles.length > 0 && (
                <div className="mt-4">
                  <h6 style={{ color: '#333', fontWeight: '600', marginBottom: '15px' }}>
                    Selected Files ({modalFiles.length})
                  </h6>
                  <div className="row g-3">
                    {modalFiles.map((file, index) => {
                      const isVideo = file.type?.startsWith("video/");
                      const isImage = file.type?.startsWith("image/");
                      const isDocument = !isImage && !isVideo;
                      
                      // Get file extension for display
                      const getFileExtension = (filename) => {
                        return filename.split('.').pop().toUpperCase();
                      };

                      return (
                        <div key={index} className="col-md-3 col-sm-4 col-6">
                          <div className="card" style={{ border: '1px solid #dee2e6', borderRadius: '8px', position: 'relative' }}>
                            <div className="card-body text-center p-3" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              {/* Remove button */}
                              <button
                                type="button"
                                className="btn btn-sm position-absolute"
                                onClick={() => removeModalFile(index)}
                                style={{ 
                                  top: '5px', 
                                  right: '5px', 
                                  background: '#dc3545', 
                                  color: 'white', 
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '24px',
                                  height: '24px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px'
                                }}
                              >
                                ×
                              </button>

                              {/* File preview */}
                              {isImage && (
                                <img
                                  style={{ 
                                    width: '60px', 
                                    height: '60px', 
                                    objectFit: 'cover',
                                    borderRadius: '6px',
                                    marginBottom: '8px'
                                  }}
                                  className="mx-auto"
                                  src={file.preview}
                                  alt={file.name}
                                />
                              )}
                              {isVideo && (
                                <div style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  backgroundColor: '#6f42c1', 
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginBottom: '8px',
                                  color: 'white',
                                  fontSize: '24px'
                                }}>
                                  🎥
                                </div>
                              )}
                              {isDocument && (
                                <div style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  backgroundColor: file.type.includes('pdf') ? '#dc3545' : 
                                                  file.type.includes('excel') || file.type.includes('spreadsheet') ? '#28a745' :
                                                  file.type.includes('word') ? '#007bff' : 
                                                  file.type.includes('presentation') ? '#fd7e14' : '#6c757d',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginBottom: '8px',
                                  color: 'white',
                                  fontSize: '11px',
                                  fontWeight: 'bold'
                                }}>
                                  {getFileExtension(file.name)}
                                </div>
                              )}
                              
                              {/* File name */}
                              <small 
                                className="text-muted" 
                                style={{ 
                                  fontSize: '11px', 
                                  wordBreak: 'break-all',
                                  lineHeight: '1.2'
                                }}
                                title={file.name}
                              >
                                {file.name.length > 15 ? file.name.substring(0, 15) + '...' : file.name}
                              </small>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer banner-form-actions" style={{ borderTop: '1px solid #dee2e6', padding: '20px 30px', margin: 0 }}>
              <button 
                type="button" 
                className="banner-form-action-btn"
                onClick={uploadModalFiles}
                disabled={isUploading || modalFiles.length === 0}
              >
                {isUploading
                  ? "Uploading..."
                  : `Upload ${modalFiles.length} File${modalFiles.length !== 1 ? "s" : ""}`}
              </button>
              <button 
                type="button" 
                className="banner-form-action-btn"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3 common-files-page">
        <div className="card banner-form-card mt-3 pb-4">
          <div className="card-header banner-form-section-header">
            <h3 className="banner-form-section-heading">
              <span className="banner-form-section-icon" aria-hidden="true">
                <Files size={16} strokeWidth={1.8} />
              </span>
              Common File Uploads
            </h3>
          </div>
          <div className="card-body">
            {renderFileUploadSection("instagram_photos_videos")}
            {renderFileUploadSection("site_photos_progress")}
            {renderFileUploadSection("print_media")}
            {renderFileUploadSection("company_profile")}
            {renderFileUploadSection("competition_project_builders")}
            {renderFileUploadSection("possession_intimation")}
            {renderFileUploadSection("birthday_anniversary_emailers")}
            {renderFileUploadSection("whatsapp_creatives")}
          </div>
        </div>
      </div>
      {renderModal()}
    </div>
  );
};

export default CommonFileUpload;