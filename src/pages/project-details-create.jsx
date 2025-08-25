import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import PropertySelect from "../components/base/PropertySelect";

import MultiSelectBox from "../components/base/MultiSelectBox";
import { baseURL } from "./baseurl/apiDomain";
import { ImageCropper } from "../components/reusable/ImageCropper";
import { ImageUploadingButton } from "../components/reusable/ImageUploadingButton";
import ProjectBannerUpload from "../components/reusable/ProjectBannerUpload";
import ProjectImageVideoUpload from "../components/reusable/ProjectImageVideoUpload";

const ProjectDetailsCreate = () => {
  const [formData, setFormData] = useState({
    Property_Type: "",
    Property_type_id: "",
    building_type: "",
    SFDC_Project_Id: "",
    Project_Construction_Status: "",
    Configuration_Type: [],
    Project_Name: "",
    project_address: "",
    Project_Description: "",
    Price_Onward: "",
    Project_Size_Sq_Mtr: "",
    Project_Size_Sq_Ft: "",
    development_area_sqft: "",
    development_area_sqmt: "",
    Rera_Carpet_Area_Sq_M: "",
    Rera_Carpet_Area_sqft: "",
    Rera_Sellable_Area: "",
    Number_Of_Towers: "",
    Number_Of_Units: "",
    no_of_floors: "",
    Rera_Number_multiple: [],
    Amenities: [],
    Specifications: [],
    Land_Area: "",
    land_uom: "",
    project_tag: "",
    virtual_tour_url_multiple: [],
    map_url: "",
    image: [],
    Address: {
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      pin_code: "",
      country: "",
    },
    brochure: [],
    two_d_images: [],
    videos: [],
    gallery_image: [],
    project_ppt: [],
    //project_creatives: [],
    project_creatives: [],
    project_creative_generics: [],
    project_creative_offers: [],
    project_interiors: [],
    project_exteriors: [],
    project_emailer_templetes: [],
    project_layout: [],
    project_sales_type: "",
    order_no: null,
    video_preview_image_url: [],
    enable_enquiry: false,
    rera_url: "",
    isDay: true,
    disclaimer: "",
    project_qrcode_image: [],
    cover_images: [],
    is_sold: false,
    plans: [],
  });

  useEffect(() => {
    console.log("formData updated:", formData);
  }, [formData]);

  const [projectsType, setprojectsType] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [activeToastId, setActiveToastId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [virtualTourUrl, setVirtualTourUrl] = useState("");
  const [virtualTourName, setVirtualTourName] = useState("");
  const [towerName, setTowerName] = useState("");
  const [reraNumber, setReraNumber] = useState("");
  const [reraUrl, setReraUrl] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [filteredAmenities, setFilteredAmenities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [projectCreatives, setProjectCreatives] = useState([]);
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [selectedCreativeType, setSelectedCreativeType] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [allBuildingTypes, setAllBuildingTypes] = useState([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  // const [showTooltip, setShowTooltip] = useState(false);
  const [showQrTooltip, setShowQrTooltip] = useState(false);
  // const [image, setImage] = useState([]);
  const [mainImageUpload, setMainImageUpload] = useState([]);
  const [coverImageUpload, setCoverImageUpload] = useState([]);
  const [galleryImageUpload, setGalleryImageUpload] = useState([]);
  const [floorPlanImageUpload, setFloorPlanImageUpload] = useState([]);
  const [planName, setPlanName] = useState("");
  const [planImages, setPlanImages] = useState([]);
  const [plans, setPlans] = useState([]);
  const [pendingImageUpload, setPendingImageUpload] = useState([]);
  const [showUploader, setShowUploader] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);

  const [dialogOpen, setDialogOpen] = useState({
    image: false,
    cover_images: false,
    gallery_image: false,
    two_d_images: false,
    plan_images: false,
  });

  const projectUploadConfig = {
    image: ["9:16", "1:1", "16:9", "3:2"],
    "cover images": ["1:1", "16:9", "9:16", "3:2"],
    "gallery image": ["16:9", "1:1", "9:16", "3:2"],
    "project 2d image": ["16:9", "1:1", "9:16", "3:2"],
  };

  const coverImageType = "cover images";
  const galleryImageType = "gallery image";
  const floorImageType = "project 2d image";
  const bannerImageType = "image";

  const selectedCoverRatios = projectUploadConfig[coverImageType] || [];
  const selectedGalleryRatios = projectUploadConfig[galleryImageType] || [];
  const selectedFloorRatios = projectUploadConfig[floorImageType] || [];
  const selectedBannerRatios = projectUploadConfig[bannerImageType] || [];

  const coverImageLabel = coverImageType.replace(/(^\w|\s\w)/g, (m) =>
    m.toUpperCase()
  );
  const galleryImageLabel = galleryImageType.replace(/(^\w|\s\w)/g, (m) =>
    m.toUpperCase()
  );
  const floorImageLabel = floorImageType.replace(/(^\w|\s\w)/g, (m) =>
    m.toUpperCase()
  );
  const bannerImageLabel = bannerImageType.replace(/(^\w|\s\w)/g, (m) =>
    m.toUpperCase()
  );

  const dynamicDescription = `Supports ${selectedCoverRatios.join(
    ", "
  )} aspect ratios`;
  const dynamicDescription1 = `Supports ${selectedGalleryRatios.join(
    ", "
  )} aspect ratios`;
  const dynamicDescription2 = `Supports ${selectedFloorRatios.join(
    ", "
  )} aspect ratios`;
  const dynamicDescription3 = `Supports ${selectedBannerRatios.join(
    ", "
  )} aspect ratios`;

  const updateFormData = (key, files) => {
    setFormData((prev) => {
      const existing = Array.isArray(prev[key]) ? prev[key] : [];
      return {
        ...prev,
        [key]: [...existing, ...files],
      };
    });
  };

  // Function to handle gallery image name changes
  const handleGalleryImageNameChange = (groupKey, imageIndex, newName) => {
    setFormData(prevData => ({
      ...prevData,
      [groupKey]: prevData[groupKey].map((img, index) => 
        index === imageIndex 
          ? { ...img, file_name: newName }
          : img
      )
    }));
  };

  const handleCroppedCoverImages = (
    validImages,
    type = "cover",
    videoFiles = []
  ) => {
    // Handle video files first (including GIFs)
    if (videoFiles && videoFiles.length > 0) {
      videoFiles.forEach((video) => {
        const formattedRatio = video.ratio.replace(":", "_by_");
        let prefix = "";

        switch (type) {
          case "gallery":
            prefix = galleryImageType; // "gallery image"
            break;
          case "floor":
            prefix = floorImageType; // "floor plan"
            break;
          case "banner":
            prefix = bannerImageType; // "banner image" for banner
            break;
          case "cover":
          default:
            prefix = coverImageType; // "cover image"
            break;
        }

        const key = `${prefix}_${formattedRatio}`
          .replace(/\s+/g, "_")
          .toLowerCase();
        updateFormData(key, [video]);
      });

      closeModal(type);
      return;
    }

    // Handle images if no videos
    if (!validImages || validImages.length === 0) {
      toast.error(
        `No valid ${type} image${
          ["cover", "banner"].includes(type) ? "" : "s"
        } selected.`
      );
      closeModal(type);
      return;
    }

    validImages.forEach((img) => {
      const formattedRatio = img.ratio.replace(":", "_by_");
      let prefix = "";

      switch (type) {
        case "gallery":
          prefix = galleryImageType;
          break;
        case "floor":
          prefix = floorImageType;
          break;
        case "banner":
          prefix = bannerImageType;
          break;
        case "cover":
        default:
          prefix = coverImageType;
          break;
      }

      const key = `${prefix}_${formattedRatio}`
        .replace(/\s+/g, "_")
        .toLowerCase();
      updateFormData(key, [img]);
    });

    closeModal(type);
  };

  const handleCroppedImages = (validImages, type = "cover") => {
    if (!validImages || validImages.length === 0) {
      toast.error(
        `No valid ${type} image${
          ["cover", "banner"].includes(type) ? "" : "s"
        } selected.`
      );
      closeModal(type);
      return;
    }

    validImages.forEach((img) => {
      const formattedRatio = img.ratio.replace(":", "_by_");
      let prefix = "";

      switch (type) {
        case "gallery":
          prefix = galleryImageType; // "gallery image"
          break;
        case "floor":
          prefix = floorImageType; // "floor plan"
          break;
        case "banner":
          prefix = bannerImageType; // "banner image" for banner
          break;
        case "cover":
        default:
          prefix = coverImageType; // "cover image"
          break;
      }

      const key = `${prefix}_${formattedRatio}`
        .replace(/\s+/g, "_")
        .toLowerCase();
      
      // Add file_name property to the image object
      const imageWithName = {
        ...img,
        file_name: img.name || `${type} Image ${Date.now()}`
      };
      
      updateFormData(key, [imageWithName]);
    });

    closeModal(type);
  };

  const closeModal = (type) => {
    switch (type) {
      case "gallery":
        setShowGalleryModal(false);
        break;
      case "floor":
        setShowFloorPlanModal(false);
        break;

      case "banner":
        setShowBannerModal(false);
        break;
      case "cover":
      default:
        setShowUploader(false);
        break;
    }
  };

  const discardImage = (key, imageToRemove) => {
    setFormData((prev) => {
      const updatedArray = (prev[key] || []).filter(
        (img) => img.id !== imageToRemove.id
      );

      // Remove the key if the array becomes empty
      const newFormData = { ...prev };
      if (updatedArray.length === 0) {
        delete newFormData[key];
      } else {
        newFormData[key] = updatedArray;
      }

      return newFormData;
    });

    // If the removed image is being previewed, reset previewImg
    if (previewImg === imageToRemove.preview) {
      setPreviewImg(null);
    }
  };

  const errorToastRef = useRef(null);
  const Navigate = useNavigate();

  const [reraList, setReraList] = useState([{ tower: "", reraNumber: "" }]);

  const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB
  const MAX_BROCHURE_SIZE = 20 * 1024 * 1024; // 20MB

  // Format file size to human-readable format
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  // Function to check file size
  const isFileSizeValid = (file, maxSize) => {
    if (file.size > maxSize) {
      return {
        valid: false,
        name: file.name,
        size: formatFileSize(file.size),
      };
    }
    return { valid: true };
  };

  // const handleFileChange = (e, fieldName) => {
  //   if (fieldName === "image") {
  //     const files = Array.from(e.target.files);
  //     const allowedTypes = [
  //       "image/jpeg",
  //       "image/png",
  //       "image/gif",
  //       "image/webp",
  //     ];

  //     const validTypeFiles = files.filter((file) =>
  //       allowedTypes.includes(file.type)
  //     );

  //     if (validTypeFiles.length !== files.length) {
  //       toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
  //       e.target.value = "";
  //       return;
  //     }

  //     const file = validTypeFiles[0];
  //     const sizeCheck = isFileSizeValid(file, MAX_IMAGE_SIZE);

  //     if (!sizeCheck.valid) {
  //       toast.error("Image size must be less than 3MB.");
  //       e.target.value = ""; // Reset input
  //       return;
  //     }

  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       image: file,
  //     }));
  //   }
  // };
  // const handleLayoutFileChange = (e, fieldName) => {
  //   if (fieldName === "Layoutimage") {
  //     const file = e.target.files[0]; // Only take the first file

  //     if (!file) return; // Exit if no file is selected

  //     const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  //     if (!allowedTypes.includes(file.type)) {
  //       toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
  //       e.target.value = ""; // Reset file input
  //       return;
  //     }

  //     // Check file size
  //     const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  //     if (file.size > MAX_IMAGE_SIZE) {
  //       toast.error(`File too large: ${file.name}. Max size is 10MB.`);
  //       e.target.value = ""; // Reset file input
  //       return;
  //     }

  //     // Set the single file in formData
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       project_layout: file,
  //     }));
  //   }
  // };
  // const handleImageUploaded = (newImageList) => {
  //   if (!newImageList || newImageList.length === 0) return;

  //   const file = newImageList[0].file;
  //   if (!file) return;

  //   const allowedImageTypes = [
  //     "image/jpeg", "image/png", "image/gif", "image/webp",
  //     "image/bmp", "image/tiff",
  //   ];

  //   const fileType = file.type;
  //   const sizeInMB = file.size / (1024 * 1024);

  //   const isImage = allowedImageTypes.includes(fileType);

  //   if (!isImage) {
  //     toast.error("❌ Please upload a valid image or video file.");
  //     return;
  //   }

  //   if (isImage && sizeInMB > 3) {
  //     toast.error("❌ Image size must be less than 3MB.");
  //     return;
  //   }

  //   setImage(newImageList);

  //   if (isImage) {
  //     setDialogOpen(true); // Open cropper only for images
  //   }
  // };

  const handleImageUploaded = (newImageList, type) => {
    if (!newImageList || newImageList.length === 0) return;

    const file = newImageList[0].file;
    if (!file) return;

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const fileType = file.type;
    const sizeInMB = file.size / (1024 * 1024);

    if (!allowedImageTypes.includes(fileType)) {
      toast.error("❌ Please upload a valid image.");
      return;
    }

    if (sizeInMB > 5) {
      toast.error("❌ Image size must be less than 5MB.");
      return;
    }

    // if (type === "cover_images") {
    //   setCoverImageUpload(newImageList);
    //   setDialogOpen((prev) => ({ ...prev, cover_images: true }));
    // }
    if (type === "cover_images") {
      // Skip cropper for GIFs
      if (fileType === "image/gif") {
        setFormData((prev) => ({
          ...prev,
          cover_images: Array.isArray(prev.cover_images)
            ? [...prev.cover_images, file]
            : [file],
        }));
        setCoverImageUpload([]);
        setDialogOpen((prev) => ({ ...prev, cover_images: false }));
        return;
      }
      setCoverImageUpload(newImageList);
      setDialogOpen((prev) => ({ ...prev, cover_images: true }));
    } else if (type === "image") {
      setPendingImageUpload(newImageList);
      setDialogOpen((prev) => ({ ...prev, image: true }));
    } else if (type === "gallery_image") {
      setGalleryImageUpload(newImageList);
      setDialogOpen((prev) => ({ ...prev, gallery_image: true }));
    } else if (type === "two_d_images") {
      setFloorPlanImageUpload(newImageList);
      setDialogOpen((prev) => ({ ...prev, two_d_images: true }));
    }
  };

  const amenityTypes = [
    ...new Set(amenities.map((ammit) => ammit.amenity_type)),
  ].map((type) => ({ value: type, label: type }));

  // Filter amenities based on selected type
  useEffect(() => {
    if (selectedType) {
      Area;
      setFilteredAmenities(
        amenities.filter((ammit) => ammit.amenity_type === selectedType.value)
      );
    } else {
      setFilteredAmenities([]);
    }
  }, [selectedType, amenities]);

  const handleChange = (e) => {
    const { name, type, files, value } = e.target;

    if (type === "file") {
      handleFileUpload(name, files);
    } else {
      if (
        [
          "address_line_1",
          "address_line_2",
          "city",
          "state",
          "pin_code",
          "country",
        ].includes(name)
      ) {
        setFormData((prev) => ({
          ...prev,
          Address: {
            ...prev.Address,
            [name]: value,
          },
        }));
      } else if (name === "virtual_tour_url_multiple") {
        setVirtualTour(value); // Update temporary input state
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const handleProjectCreativesUpload = (files) => {
    if (!files || files.length === 0) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "video/mp4",
      "video/mov",
    ];

    const MAX_SIZE = 50 * 1024 * 1024; // 50MB max per file

    const newFiles = Array.from(files);
    const validFiles = [];

    newFiles.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return;
      }

      if (file.size > MAX_SIZE) {
        toast.error(`File too large: ${file.name}. Max size is 50MB.`);
        return;
      }

      validFiles.push({ file, type: "" }); // Default type empty, user will select
    });

    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        project_creatives: [...prev.project_creatives, ...validFiles],
      }));
    }
  };

  // const MAX_VIDEO_SIZE = 10 * 1024 * 1024;
  // const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
  // const MAX_BROCHURE_SIZE = 20 * 1024 * 1024;
  const MAX_PPT_SIZE = 10 * 1024 * 1024; // 10MB

  // Modify the handleFileUpload function to handle gallery_images
  const handleFileUpload = (name, files) => {
    const MAX_SIZES = {
      brochure: MAX_BROCHURE_SIZE,
      two_d_images: MAX_IMAGE_SIZE,
      videos: MAX_VIDEO_SIZE,
      image: MAX_IMAGE_SIZE,
      video_preview_image_url: MAX_IMAGE_SIZE,
      gallery_image: MAX_IMAGE_SIZE,
      project_ppt: MAX_PPT_SIZE, // ✅ Ensure project_ppt is included
      project_creatives: MAX_IMAGE_SIZE, // Add creatives support
      cover_images: MAX_IMAGE_SIZE,
      project_creative_generics: MAX_IMAGE_SIZE,
      project_creative_offers: MAX_IMAGE_SIZE,
      project_interiors: MAX_IMAGE_SIZE,
      project_exteriors: MAX_IMAGE_SIZE,
      project_emailer_templetes: MAX_BROCHURE_SIZE,
      project_layout: MAX_IMAGE_SIZE,
      project_qrcode_image: MAX_IMAGE_SIZE,
      plans: MAX_IMAGE_SIZE, // 3MB
    };

    const allowedTypes = {
      image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      video_preview_image_url: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ],
      two_d_images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      gallery_image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      videos: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
      plans: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      project_qrcode_image: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ],
      brochure: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      project_ppt: [
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ], // ✅ PPT & PPTX support
      project_emailer_templetes: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      project_creatives: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      cover_images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      project_creative_generics: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ],
      project_creative_offers: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ],
      project_interiors: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      project_exteriors: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      project_layout: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
    };

    if (!files || !files.length) return;

    if (name === "project_layout") {
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit

      const newFiles = Array.from(files);
      const validFiles = [];

      newFiles.forEach((file) => {
        if (file.size > MAX_SIZE) {
          toast.error("Image size must be less than 3MB.");
          return;
        }

        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          project_layout: [...(prev.project_layout || []), ...validFiles],
        }));
      }
    } else {
      // toast.error("⚠️ Invalid upload category.");
    }

    if (name === "plans") {
      setFormData((prev) => ({
        ...prev,
        plans: [...(prev.plans || []), ...validFiles], // ✅ Fix: Ensure existing files are kept
      }));
    }

    if (name === "project_emailer_templetes") {
      // Handle multiple brochure files
      const newFiles = Array.from(files);
      const validFiles = [];

      newFiles.forEach((file) => {
        if (!allowedTypes.project_emailer_templetes.includes(file.type)) {
          toast.error(
            "Only PDF and DOCX files are allowed for project emailer templetes."
          );
          return;
        }

        if (!validateFile(file, MAX_SIZES[name])) return;
        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          project_emailer_templetes: [
            ...prev.project_emailer_templetes,
            ...validFiles,
          ],
        }));
      }
    }

    if (name === "project_exteriors") {
      const newFiles = Array.from(files);
      const validFiles = [];
      // Area;
      newFiles.forEach((file) => {
        if (!allowedTypes.project_exteriors.includes(file.type)) {
          toast.error("Only JPG, PNG, GIF, and WebP images are allowed.");
          return;
        }

        if (file.size > MAX_SIZES.project_exteriors) {
          toast.error("Image size must be less than 3MB.");
          return;
        }

        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          project_exteriors: [...(prev.project_exteriors || []), ...validFiles], // ✅ Fix: Ensure existing files are kept
        }));
      }
    }

    if (name === "project_interiors") {
      const newFiles = Array.from(files);
      const validFiles = [];

      newFiles.forEach((file) => {
        if (!allowedTypes.project_interiors.includes(file.type)) {
          toast.error("Only JPG, PNG, GIF, and WebP images are allowed.");
          return;
        }

        if (file.size > MAX_SIZES.project_interiors) {
          toast.error("Image size must be less than 3MB.");
          return;
        }

        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          project_interiors: [...(prev.project_interiors || []), ...validFiles], // ✅ Fix: Ensure existing files are kept
        }));
      }
    }

    if (name === "project_creative_offers") {
      const newFiles = Array.from(files);
      const validFiles = [];

      newFiles.forEach((file) => {
        if (!allowedTypes.project_creative_offers.includes(file.type)) {
          toast.error("Only JPG, PNG, GIF, and WebP images are allowed.");
          return;
        }

        if (file.size > MAX_SIZES.project_creative_offers) {
          toast.error("Image size must be less than 3MB.");
          return;
        }

        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          project_creative_offers: [
            ...(prev.project_creative_offers || []),
            ...validFiles,
          ], // ✅ Fix: Ensure existing files are kept
        }));
      }
    }

    if (name === "project_creative_generics") {
      const newFiles = Array.from(files);
      const validFiles = [];

      newFiles.forEach((file) => {
        if (!allowedTypes.project_creative_generics.includes(file.type)) {
          toast.error("Only JPG, PNG, GIF, and WebP images are allowed.");
          return;
        }

        if (file.size > MAX_SIZES.project_creative_generics) {
          toast.error("Image size must be less than 3MB.");
          return;
        }

        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          project_creative_generics: [
            ...(prev.project_creative_generics || []),
            ...validFiles,
          ], // ✅ Fix: Ensure existing files are kept
        }));
      }
    }

    if (name === "project_creatives") {
      const newFiles = Array.from(files);
      const validFiles = [];

      newFiles.forEach((file) => {
        if (!allowedTypes.project_creatives.includes(file.type)) {
          toast.error("Only JPG, PNG, GIF, and WebP images are allowed.");
          return;
        }

        if (file.size > MAX_SIZES.project_creatives) {
          toast.error("Image size must be less than 3MB.");
          return;
        }

        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          project_creatives: [...(prev.project_creatives || []), ...validFiles], // ✅ Fix: Ensure existing files are kept
        }));
      }
    }

    if (name === "cover_images") {
      const newFiles = Array.from(files);
      const validFiles = [];

      newFiles.forEach((file) => {
        if (!allowedTypes.cover_images.includes(file.type)) {
          toast.error("Only JPG, PNG, GIF, and WebP images are allowed.");
          return;
        }

        if (file.size > MAX_SIZES.cover_images) {
          toast.error("Image size must be less than 3MB.");
          return;
        }

        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          cover_images: [...(prev.cover_images || []), ...validFiles], // ✅ Fix: Ensure existing files are kept
        }));
      }
    }

    if (name === "project_ppt") {
      // Handle multiple PPT files
      const newFiles = Array.from(files);
      const validFiles = [];

      newFiles.forEach((file) => {
        if (!allowedTypes.project_ppt.includes(file.type)) {
          toast.error("Only PPT and PPTX files are allowed for Project PPT.");
          return;
        }

        if (file.size > MAX_SIZES.project_ppt) {
          toast.error(`File too large: ${file.name}. Max size is 10MB.`);
          return;
        }

        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          project_ppt: [...prev.project_ppt, ...validFiles], // ✅ Ensure multiple files are added
        }));
      }
    }

    if (name === "brochure") {
      // Handle multiple brochure files
      const newFiles = Array.from(files);
      const validFiles = [];

      newFiles.forEach((file) => {
        if (!allowedTypes.brochure.includes(file.type)) {
          toast.error("Only PDF and DOCX files are allowed for brochure.");
          return;
        }

        if (!validateFile(file, MAX_SIZES[name])) return;
        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          brochure: [...prev.brochure, ...validFiles],
        }));
      }
    } else if (
      name === "two_d_images" ||
      name === "videos" ||
      name === "gallery_image" ||
      name === "project_qrcode_image"
    ) {
      // Handle multiple files for images, videos, gallery
      const newFiles = Array.from(files);
      const validFiles = [];
      const tooLargeFiles = [];

      newFiles.forEach((file) => {
        // Check file type if there are allowed types specified
        if (allowedTypes[name] && !allowedTypes[name].includes(file.type)) {
          const fileType = name === "videos" ? "video" : "image";
          toast.error(
            `Only supported ${fileType} formats are allowed for ${name.replace(
              "_",
              " "
            )}.`
          );
          return;
        }

        const sizeCheck = isFileSizeValid(file, MAX_SIZES[name]);
        if (!sizeCheck.valid) {
          tooLargeFiles.push(sizeCheck);
          return;
        }

        validFiles.push(file);
      });

      if (tooLargeFiles.length > 0) {
        tooLargeFiles.forEach((file) => {
          if (name === "videos") {
            toast.error("Video size must be less than 10MB.");
          } else {
            toast.error("Image size must be less than 3MB.");
          }
        });
      }

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          [name]: [...(prev[name] || []), ...validFiles],
        }));
      }
    } else if (name === "image") {
      // Handle single image
      const file = files[0];
      if (!allowedTypes.image.includes(file.type)) {
        toast.error("Only JPG, PNG, GIF, and WebP images are allowed.");
        return;
      }

      const sizeCheck = isFileSizeValid(file, MAX_SIZES.image);
      if (!sizeCheck.valid) {
        toast.error(
          `File too large: ${sizeCheck.name} (${
            sizeCheck.size
          }). Max size: ${formatFileSize(MAX_SIZES.image)}`
        );
        return;
      }

      setFormData((prev) => ({ ...prev, video_preview_image_url: file }));
    } else if (name === "video_preview_image_url") {
      // Handle single image
      const file = files[0];
      if (!allowedTypes.video_preview_image_url.includes(file.type)) {
        toast.error("Only JPG, PNG, GIF, and WebP images are allowed.");
        return;
      }

      const sizeCheck = isFileSizeValid(
        file,
        MAX_SIZES.video_preview_image_url
      );
      if (!sizeCheck.valid) {
        toast.error(
          `File too large: ${sizeCheck.name} (${
            sizeCheck.size
          }). Max size: ${formatFileSize(MAX_SIZES.video_preview_image_url)}`
        );
        return;
      }

      setFormData((prev) => ({ ...prev, video_preview_image_url: file }));
    }
  }; // Add this to your file:
  // File Validation
  const validateFile = (file, maxSize, tooLargeFiles = null) => {
    const sizeCheck = isFileSizeValid(file, maxSize);
    if (!sizeCheck.valid) {
      if (tooLargeFiles) {
        tooLargeFiles.push(sizeCheck);
      } else {
        toast.error(
          `File too large: ${sizeCheck.name} (${
            sizeCheck.size
          }). Max size: ${formatFileSize(maxSize)}`
        );
      }
      return false;
    }
    return true;
  };

  // 3. Update handleDiscardFile to handle gallery_images
  const handleDiscardFile = (fileType, index) => {
    if (fileType === "brochure") {
      if (index !== undefined) {
        // Remove specific brochure by index
        const updatedBrochures = [...formData.brochure];
        updatedBrochures.splice(index, 1);
        setFormData({ ...formData, brochure: updatedBrochures });
      } else {
        // Clear all brochures if no index specified
        setFormData({ ...formData, brochure: [] });
      }
    } else if (fileType === "two_d_images") {
      const updatedFiles = [...formData.two_d_images];
      updatedFiles.splice(index, 1);
      setFormData({ ...formData, two_d_images: updatedFiles });
    } else if (fileType === "project_creatives") {
      const updatedFiles = [...formData.project_creatives];
      updatedFiles.splice(index, 1);
      setFormData({ ...formData, project_creatives: updatedFiles });
    } else if (fileType === "cover_images") {
      const updatedFiles = [...formData.cover_images];
      updatedFiles.splice(index, 1);
      setFormData({ ...formData, cover_images: updatedFiles });
    } else if (fileType === "project_creative_generics") {
      const updatedFiles = [...formData.project_creative_generics];
      updatedFiles.splice(index, 1);
      setFormData({ ...formData, project_creative_generics: updatedFiles });
    } else if (fileType === "project_creative_offers") {
      const updatedFiles = [...formData.project_creative_offers];
      updatedFiles.splice(index, 1);
      setFormData({ ...formData, project_creative_offers: updatedFiles });
    } else if (fileType === "project_interiors") {
      const updatedFiles = [...formData.project_interiors];
      updatedFiles.splice(index, 1);
      setFormData({ ...formData, project_interiors: updatedFiles });
    } else if (fileType === "project_exteriors") {
      const updatedFiles = [...formData.project_exteriors];
      updatedFiles.splice(index, 1);
      setFormData({ ...formData, project_exteriors: updatedFiles });
    } else if (fileType === "project_emailer_templetes") {
      const updatedFiles = [...formData.project_emailer_templetes];
      updatedFiles.splice(index, 1);
      setFormData({ ...formData, project_emailer_templetes: updatedFiles });
    } else if (fileType === "project_layout") {
      const updatedFiles = [...formData.project_layout];
      updatedFiles.splice(index, 1);
      setFormData({ ...formData, project_layout: updatedFiles });
    } else if (fileType === "videos") {
      const updatedVideos = [...formData.videos];
      updatedVideos.splice(index, 1);
      setFormData({ ...formData, videos: updatedVideos });
    } else if (fileType === "gallery_image") {
      const updatedGallery = [...formData.gallery_image];
      updatedGallery.splice(index, 1);
      setFormData({ ...formData, gallery_image: updatedGallery });
    } else if (fileType === "plans") {
      const updatedFiles = [...formData.plans];
      updatedFiles.splice(index, 1);
      setFormData({ ...formData, plans: updatedFiles });
    }
  };

  const handlePlanDelete = async (planId, index) => {
    if (!planId) {
      // Unsaved plan → just remove locally
      setPlans(plans.filter((_, idx) => idx !== index));
      toast.success("Plan removed successfully!");
      return;
    }

    try {
      const response = await fetch(`${baseURL}plans/${planId}.json`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete plan");
      }

      // ✅ Remove from local state
      setPlans(plans.filter((_, idx) => idx !== index));
      toast.success("Plan and all images deleted successfully!");
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete plan. Please try again.");
    }
  };

  const validateForm = (formData) => {
    // Clear previous toasts
    toast.dismiss();

    // if (formData.image.length === 0) {
    //   toast.error("Project Logo is required.");
    //   return false;
    // }
    if (!formData.Property_Type.length === 0) {
      toast.error("Property Type is required.");
      return false;
    }
    // if (!formData.building_type) {
    //   toast.error("Building Type is required.");
    //   return false;
    // }
    // if (!formData.Project_Construction_Status) {
    //   toast.error("Construction Status is required.");
    //   return false;
    // }
    // if (!formData.Configuration_Type.length) {
    //   toast.error("Configuration Type is required.");
    //   return false;
    // }
    if (!formData.Project_Name) {
      toast.error("Project Name is required.");
      return false;
    }
    if (!formData.project_address) {
      toast.error("Location is required.");
      return false;
    }
    // if (!formData.project_tag) {
    //   toast.error("Project Tag is required.");
    //   return false;
    // }
    // if (!formData.Project_Description) {
    //   toast.error("Project Description is required.");
    //   return false;
    // }
    // if (!formData.Price_Onward) {
    //   toast.error("Price Onward is required.");
    //   return false;
    // }
    // if (!formData.Project_Size_Sq_Mtr) {
    //   toast.error("Project Size (Sq. Mtr.) is required.");
    //   return false;
    // }
    // if (!formData.Project_Size_Sq_Ft) {
    //   toast.error("Project Size (Sq. Ft.) is required.");
    //   return false;
    // }
    // if (!formData.development_area_sqmt) {
    //   toast.error("Development Area (Sq. Mtr.) is required.");
    //   return false;
    // }
    // if (!formData.development_area_sqft) {
    //   toast.error("Development Area (Sq. Ft.) is required.");
    //   return false;
    // }
    // if (!formData.Rera_Carpet_Area_Sq_M) {
    //   toast.error("RERA Carpet Area (Sq. M) is required.");
    //   return false;
    // }
    // if (!formData.Rera_Carpet_Area_sqft) {
    //   toast.error("RERA Carpet Area (Sq. Ft.) is required.");
    //   return false;
    // }
    // if (!formData.Number_Of_Towers) {
    //   toast.error("Number of Towers is required.");
    //   return false;
    // }
    // if (!formData.no_of_floors) {
    //   toast.error("Number of Floors is required.");
    //   return false;
    // }
    // if (!formData.Number_Of_Units) {
    //   toast.error("Number of Units is required.");
    //   return false;
    // }
    // if (!formData.Land_Area) {
    //   toast.error("Land Area is required.");
    //   return false;
    // }
    // if (!formData.land_uom) {
    //   toast.error("Land UOM is required.");
    //   return false;
    // }
    // if (!formData.Rera_Number_multiple) {
    //   toast.error("RERA Number is required.");
    //   return false;
    // }

    // if (!formData.Amenities.length) {
    //   toast.error("Amenities are required.");
    //   return false;
    // }
    // if (!formData.Address || !formData.Address.address_line_1) {
    //   toast.error("Address Line 1 is required.");
    //   return false;
    // }
    // if (!formData.Address || !formData.Address.city) {
    //   toast.error("City is required.");
    //   return false;
    // }
    // if (!formData.Address || !formData.Address.state) {
    //   toast.error("State is required.");
    //   return false;
    // }
    // if (!formData.Address || !formData.Address.pin_code) {
    //   toast.error("Pin Code is required.");
    //   return false;
    // }
    // if (!formData.Address || !formData.Address.country) {
    //   toast.error("Country is required.");
    //   return false;
    // }
    // if (!formData.map_url) {
    //   toast.error("Map URL is required.");
    //   return false;
    // }
    // if (!formData.brochure.length === 0) {
    //   toast.error("Brochure is required.");
    //   return false;
    // }
    // if (formData.two_d_images.length === 0) {
    //   toast.error("At least one 2D image is required.");
    //   return false;
    // }
    // if (formData.videos.length === 0) {
    //   toast.error("At least one video is required.");
    //   return false;
    // }

    return true;
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (isSubmitting) return;

  //   setIsSubmitting(true);
  //   setLoading(true);

  //   const validationErrors = validateForm(formData);
  //   // ✅ Fix: Ensure form validation correctly stops submission
  //   if (!validateForm(formData)) {
  //     setLoading(false);
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   const data = new FormData();

  //   Object.entries(formData).forEach(([key, value]) => {
  //     // if (key === "order_no") {
  //     //   data.append("project[order_no]", parseInt(value) || null); // Append order_no as null if not provided
  //     // }
  //     if (key === "plans" && Array.isArray(value)) {
  //       value.forEach((plan, index) => {
  //         data.append(`project[plans][${index}][name]`, plan.name);
  //         if (Array.isArray(plan.images)) {
  //           plan.images.forEach((img) => {
  //             data.append(`project[plans][${index}][images][]`, img);
  //           });
  //         }
  //       });
  //     } else if (key === "Address") {
  //       for (const addressKey in value) {
  //         data.append(`project[Address][${addressKey}]`, value[addressKey]);
  //       }
  //     } else if (key === "brochure" && Array.isArray(value)) {
  //       value.forEach((file) => {
  //         if (file instanceof File) {
  //           data.append("project[ProjectBrochure][]", file);
  //         }
  //       });
  //     } else if (key === "project_emailer_templetes" && Array.isArray(value)) {
  //       value.forEach((file) => {
  //         if (file instanceof File) {
  //           data.append("project[ProjectEmailerTempletes][]", file);
  //         }
  //       });
  //     } else if (key === "two_d_images" && Array.isArray(value)) {
  //       value.forEach((file) => data.append("project[Project2DImage][]", file));
  //     } else if (key === "project_creatives" && Array.isArray(value)) {
  //       value.forEach((file) =>
  //         data.append("project[ProjectCreatives][]", file)
  //       );
  //     } else if (key === "cover_images" && Array.isArray(value)) {
  //       value.forEach((file) => data.append("project[cover_images][]", file));
  //     }
  //     // else if (key === "project_sales_type") {
  //     //   value.forEach((file) =>
  //     //     data.append("project[project_sales_type][]", value.vae)
  //     //   );
  //     // }
  //     else if (key === "project_creative_generics" && Array.isArray(value)) {
  //       value.forEach((file) =>
  //         data.append("project[ProjectCreativeGenerics][]", file)
  //       );
  //     } else if (key === "project_creative_offers" && Array.isArray(value)) {
  //       value.forEach((file) =>
  //         data.append("project[ProjectCreativeOffers][]", file)
  //       );
  //     } else if (key === "project_interiors" && Array.isArray(value)) {
  //       value.forEach((file) =>
  //         data.append("project[ProjectInteriors][]", file)
  //       );
  //     } else if (key === "project_exteriors" && Array.isArray(value)) {
  //       value.forEach((file) =>
  //         data.append("project[ProjectExteriors][]", file)
  //       );
  //     } else if (key === "project_layout" && Array.isArray(value)) {
  //       value.forEach((file) => data.append("project[ProjectLayout][]", file));
  //     } else if (key === "videos" && Array.isArray(value)) {
  //       value.forEach((file) => data.append("project[ProjectVideo][]", file));
  //     } else if (key === "gallery_image" && Array.isArray(value)) {
  //       value.forEach((fileObj, index) => {
  //         if (fileObj.gallery_image instanceof File) {
  //           // ✅ Check for actual File
  //           data.append("project[gallery_image][]", fileObj.gallery_image);
  //           data.append(
  //             `project[gallery_image_file_name][${index}]`,
  //             fileObj.gallery_image_file_name
  //           );
  //           data.append(
  //             `project[gallery_type]`,
  //             fileObj.gallery_image_file_type
  //           );
  //           data.append(
  //             `project[gallery_image_is_day][${index}]`,
  //             fileObj.isDay
  //           );
  //         }
  //       });
  //     } else if (key === "image" && mainImageUpload[0]?.file instanceof File) {
  //       data.append("project[image]", mainImageUpload[0]?.file);
  //     } else if (key === "video_preview_image_url" && value instanceof File) {
  //       data.append("project[video_preview_image_url]", value);
  //     } else if (key === "project_qrcode_image" && Array.isArray(value)) {
  //       const newTitles = []; // Array to store titles of new images

  //       value.forEach((fileObj) => {
  //         if (fileObj.project_qrcode_image instanceof File) {
  //           // Append the image file
  //           data.append(
  //             "project[project_qrcode_image][]",
  //             fileObj.project_qrcode_image
  //           );
  //         }
  //         if (fileObj.isNew) {
  //           // Collect titles of new images
  //           newTitles.push(fileObj.title || "");
  //         }
  //       });

  //       // Append only the titles of new images
  //       newTitles.forEach((title) => {
  //         data.append("project[project_qrcode_image_titles][]", title);
  //       });
  //     } else if (key === "virtual_tour_url_multiple" && Array.isArray(value)) {
  //       value.forEach((item, index) => {
  //         if (item.virtual_tour_url && item.virtual_tour_name) {
  //           data.append(
  //             `project[virtual_tour_url_multiple][${index}][virtual_tour_url]`,
  //             item.virtual_tour_url
  //           );
  //           data.append(
  //             `project[virtual_tour_url_multiple][${index}][virtual_tour_name]`,
  //             item.virtual_tour_name
  //           );
  //         }
  //       });
  //     } else if (key === "Rera_Number_multiple" && Array.isArray(value)) {
  //       value.forEach((item, index) => {
  //         if (item.tower_name && item.rera_number) {
  //           data.append(
  //             `project[Rera_Number_multiple][${index}][tower_name]`,
  //             item.tower_name
  //           );
  //           data.append(
  //             `project[Rera_Number_multiple][${index}][rera_number]`,
  //             item.rera_number
  //           );
  //           data.append(
  //             `project[Rera_Number_multiple][${index}][rera_url]`,
  //             item.rera_url
  //           );
  //         }
  //       });
  //     } else if (key === "project_ppt" && Array.isArray(value)) {
  //       value.forEach((file) => {
  //         if (file instanceof File) {
  //           data.append("project[ProjectPPT]", file);
  //         }
  //       });
  //     } else if (key === "project_creatives" && Array.isArray(value)) {
  //       value.forEach(({ file, type }) => {
  //         if (file instanceof File) {
  //           data.append("project[project_creatives][]", file); // Upload file
  //           data.append(`project[project_creatives_types][]`, type); // Store selected type
  //         }
  //       });
  //     } else if (key === "cover_images" && Array.isArray(value)) {
  //       value.forEach(({ file, type }) => {
  //         if (file instanceof File) {
  //           data.append("project[cover_images][]", file); // Upload file
  //           data.append(`project[cover_images_types][]`, type); // Store selected type
  //         }
  //       });
  //     } else if (key === "project_sales_type" && Array.isArray(value)) {
  //       // value.forEach(({ file, type }) => {
  //       // if (file instanceof File) {
  //       data.append("project[project_sales_type][]", value); // Upload file
  //       // data.append(`project[project_sales_type][]`, type); // Store selected type
  //       // }
  //     }
  //     else if (key.startsWith("image") && Array.isArray(value)) {
  //       value.forEach((img) => {
  //         const backendField = key.replace("image", "project[image") + "]";
  //         if (img.file instanceof File) {
  //           data.append(backendField, img.file);
  //         }
  //       });
  //     } else if (key.startsWith("cover_images_") && Array.isArray(value)) {
  //       value.forEach((img) => {
  //         const backendField = key.replace("cover_images_", "project[cover_images_") + "]";
  //         if (img.file instanceof File) {
  //           data.append(backendField, img.file);
  //         }
  //       });
  //     } else if (key.startsWith("gallery_image_") && Array.isArray(value)) {
  //       value.forEach((img) => {
  //         const backendField = key.replace("gallery_image_", "project[gallery_image_") + "]";
  //         if (img.file instanceof File) {
  //           data.append(backendField, img.file);
  //         }
  //       });
  //     } else if (key.startsWith("project_2d_image") && Array.isArray(value)) {
  //       value.forEach((img) => {
  //         const backendField = key.replace("project_2d_image", "project[project_2d_image") + "]";
  //         if (img.file instanceof File) {
  //           data.append(backendField, img.file);
  //         }
  //       });
  //     } else {
  //       data.append(`project[${key}]`, value);
  //     }
  //   });

  //   console.log("data to be sent:", Array.from(data.entries()));

  //   try {
  //     // const response = await axios.post(`${baseURL}projects.json`, data, {
  //     //   headers: {
  //     //     Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //     //   },
  //     // });
  //     console.log("data to be sent:", Array.from(data.entries()));
  //     // console.log("New Data",response.data);
  //     toast.success("Project submitted successfully");
  //     sessionStorage.removeItem("cached_projects");

  //     // Navigate("/project-list");
  //   } catch (error) {
  //     // catch (error) {
  //     //   console.error("Error submitting the form:", error);
  //     //   toast.error("Failed to submit the form. Please try again.");
  //     // }
  //     console.error("Error submitting the form:", error);
  //     if (
  //       error.response &&
  //       error.response.status === 422 &&
  //       error.response.data &&
  //       (error.response.data.project_name || error.response.data.Project_Name)
  //     ) {
  //       toast.error("Project name already exists.");
  //     } else {
  //       toast.error("Failed to submit the form. Please try again.");
  //     }
  //   } finally {
  //     setLoading(false);
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);

    // Validate form data
    const validationErrors = validateForm(formData);
    if (!validateForm(formData)) {
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    //     // Validate project banner images
    //     const hasProjectBanner9by16 = formData.image_9_by_16 && formData.image_9_by_16.some(img => img.file instanceof File);
    //     const hasProjectBanner1by1 = formData.image_1_by_1 && formData.image_1_by_1.some(img => img.file instanceof File);

    //     // Validate project cover images
    //     const hasProjectCover16by9 = formData.cover_images_16_by_9 && formData.cover_images_16_by_9.some(img => img.file instanceof File);

    //     // Validate gallery images (16:9 and 9:16)
    //     // const gallery16By9Files = Array.isArray(formData.gallery_image_16_by_9)
    //     //   ? formData.gallery_image_16_by_9.filter((img) => img.file instanceof File)
    //     //   : [];

    //     const gallery16By9Files = Array.isArray(formData.gallery_image_16_by_9)
    //   ? formData.gallery_image_16_by_9.filter((img) => img.file instanceof File)
    //   : [];

    //     // Validate floor plans (9:16, 1:1, 16:9)
    //     const hasFloorPlan16by9 = formData.project_2d_image_16_by_9 && formData.project_2d_image_16_by_9.some(img => img.file instanceof File);

    //   const imageCount = gallery16By9Files.length;

    //     // Check if all required images are present
    //     // if (gallery16By9Files.length < 3) {
    //     //   toast.error("At least 3 gallery images with 16:9 ratio are required.");
    //     //   setLoading(false);
    //     //   setIsSubmitting(false);
    //     //   return;
    //     // }

    // if (imageCount < 3 || imageCount % 3 !== 0) {
    //   const remainder = imageCount % 3;
    //   const imagesNeeded = 3 - remainder;
    //   const nextAllowed = imageCount + imagesNeeded;
    //   const previousAllowed = imageCount - remainder;

    //   let message = `Currently ${imageCount} gallery image${imageCount !== 1 ? "s" : ""} uploaded. `;

    //   if (imageCount < 3) {
    //     // ❗ User has less than minimum required images
    //     message += `Please upload at least 3 gallery images with 16:9 ratio to proceed.`;
    //   } else {
    //     // ⚖️ User has 4, 5, 7, 8, etc. — not a multiple of 3
    //     message += `Please upload ${imagesNeeded} more to make it ${nextAllowed}, or remove ${remainder} to make it ${previousAllowed} (multiples of 3 only) with 16:9 ratio to proceed.`;
    //   }

    //   toast.error(message);
    //   setLoading(false);
    //   setIsSubmitting(false);
    //   return;
    // }

    //     if (!hasFloorPlan16by9) {
    //       toast.error("Floor plans with 16:9 ratios are required.");
    //       setLoading(false);
    //       setIsSubmitting(false);
    //       return;
    //     }

    //     if (!hasProjectBanner9by16 && !hasProjectBanner1by1) {
    //       toast.error("Project banner image with 9:16 ratio is required.");
    //       setLoading(false);
    //       setIsSubmitting(false);
    //       return;
    //     }
    //     if (!hasProjectCover16by9) {
    //       toast.error("Project cover image with 16:9 ratio is required.");
    //       setLoading(false);
    //       setIsSubmitting(false);
    //       return;
    //     }

    // const hasImagesWithRatio = (ratioKey) => {
    //     return formData[ratioKey] && formData[ratioKey].length > 0 &&
    //            formData[ratioKey].some(img => img.file instanceof File);
    //   };

    // Validate project cover images (only if any cover images exist)

    // Validate gallery images (only if any gallery images exist)
    // const gallery16By9Files = formData.gallery_image_16_by_9
    //   ? formData.gallery_image_16_by_9.filter(img => img.file instanceof File)
    //   : [];

    // if (gallery16By9Files.length > 0) {
    //   const imageCount = gallery16By9Files.length;
    //   if (imageCount < 3 || imageCount % 3 !== 0) {
    //     const remainder = imageCount % 3;
    //     const imagesNeeded = 3 - remainder;
    //     const nextAllowed = imageCount + imagesNeeded;
    //     const previousAllowed = imageCount - remainder;

    //     let message = `Currently ${imageCount} gallery image${imageCount !== 1 ? "s" : ""} uploaded. `;

    //     if (imageCount < 3) {
    //       message += `Please upload at least 3 gallery images with 16:9 ratio to proceed.`;
    //     } else {
    //       message += `Please upload ${imagesNeeded} more to make it ${nextAllowed}, or remove ${remainder} to make it ${previousAllowed} (multiples of 3 only) with 16:9 ratio to proceed.`;
    //     }

    //     toast.error(message);
    //     setLoading(false);
    //     setIsSubmitting(false);
    //     return;
    //   }
    // }

    // const hasProjectBanner9by16 =
    //   formData.image_9_by_16 &&
    //   formData.image_9_by_16.some(
    //     (img) => img.file instanceof File || img.id || img.document_file_name
    //   );

    // const hasProjectBanner1by1 =
    //   Array.isArray(formData.image_1_by_1) &&
    //   formData.image_1_by_1.some(
    //     (img) => img?.file instanceof File || img?.id || img?.document_file_name
    //   );

    // const allImagesPresent = hasProjectBanner9by16 || hasProjectBanner1by1;

    // console.log("allImagesPresent:", allImagesPresent);

    // if (!allImagesPresent) {
    //   toast.error(
    //     "Project banner one of them or both (9:16) and (1:1) is required."
    //   );
    //   setLoading(false);
    //   setIsSubmitting(false);
    //   return;
    // }

    const gallery_images = [
      "gallery_image_16_by_9",
      "gallery_image_1_by_1",
      "gallery_image_9_by_16",
      "gallery_image_3_by_2",
    ];

    const isValidImage = (img) =>
      img?.file instanceof File || !!img?.id || !!img?.document_file_name;

    // Combine all valid images from all gallery fields
    let totalValidGalleryImages = 0;

    for (const key of gallery_images) {
      const images = Array.isArray(formData[key])
        ? formData[key].filter(isValidImage)
        : [];
      totalValidGalleryImages += images.length;
    }

    if (totalValidGalleryImages > 0 && totalValidGalleryImages % 3 !== 0) {
      const remainder = totalValidGalleryImages % 3;
      const imagesNeeded = 3 - remainder;
      const previousValidCount = totalValidGalleryImages - remainder;

      const message = `Currently in Gallery ${totalValidGalleryImages} image${
        totalValidGalleryImages !== 1 ? "s" : ""
      } uploaded. Please upload ${imagesNeeded} more or remove ${remainder} to make it a multiple of 3.`;

      toast.error(message);
      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    // Validate floor plans (only if any floor plan images exist)

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      // if (key === "order_no") {
      //   data.append("project[order_no]", parseInt(value) || null); // Append order_no as null if not provided
      // }

      if (key === "plans" && Array.isArray(value)) {
        value.forEach((plan, index) => {
          data.append(`project[plans][${index}][name]`, plan.name);
          if (Array.isArray(plan.images)) {
            plan.images.forEach((img) => {
              data.append(`project[plans][${index}][images][]`, img);
            });
          }
        });
      } else if (key === "Address") {
        for (const addressKey in value) {
          data.append(`project[Address][${addressKey}]`, value[addressKey]);
        }
      } else if (key === "brochure" && Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) {
            data.append("project[ProjectBrochure][]", file);
          }
        });
      } else if (key === "project_emailer_templetes" && Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) {
            data.append("project[ProjectEmailerTempletes][]", file);
          }
        });
      } else if (key === "two_d_images" && Array.isArray(value)) {
        value.forEach((file) => data.append("project[Project2DImage][]", file));
      } else if (key === "project_creatives" && Array.isArray(value)) {
        value.forEach((file) =>
          data.append("project[ProjectCreatives][]", file)
        );
      } else if (key === "cover_images" && Array.isArray(value)) {
        value.forEach((file) => data.append("project[cover_images][]", file));
      } else if (key === "project_creative_generics" && Array.isArray(value)) {
        value.forEach((file) =>
          data.append("project[ProjectCreativeGenerics][]", file)
        );
      } else if (key === "project_creative_offers" && Array.isArray(value)) {
        value.forEach((file) =>
          data.append("project[ProjectCreativeOffers][]", file)
        );
      } else if (key === "project_interiors" && Array.isArray(value)) {
        value.forEach((file) =>
          data.append("project[ProjectInteriors][]", file)
        );
      } else if (key === "project_exteriors" && Array.isArray(value)) {
        value.forEach((file) =>
          data.append("project[ProjectExteriors][]", file)
        );
      } else if (key === "project_layout" && Array.isArray(value)) {
        value.forEach((file) => data.append("project[ProjectLayout][]", file));
      } else if (key === "videos" && Array.isArray(value)) {
        value.forEach((file) => data.append("project[ProjectVideo][]", file));
      } else if (key === "gallery_image" && Array.isArray(value)) {
        value.forEach((fileObj, index) => {
          if (fileObj.gallery_image instanceof File) {
            data.append("project[gallery_image][]", fileObj.gallery_image);
            data.append(
              `project[gallery_image_file_name][${index}]`,
              fileObj.gallery_image_file_name
            );
            data.append(
              `project[gallery_type]`,
              fileObj.gallery_image_file_type
            );
            data.append(
              `project[gallery_image_is_day][${index}]`,
              fileObj.isDay
            );
          }
        });
      } else if (key === "image" && mainImageUpload[0]?.file instanceof File) {
        data.append("project[image]", mainImageUpload[0]?.file);
      } else if (key === "video_preview_image_url" && value instanceof File) {
        data.append("project[video_preview_image_url]", value);
      }

      // else if (key === "project_qrcode_image" && Array.isArray(value)) {
      //   const newTitles = [];
      //   value.forEach((fileObj) => {
      //     if (fileObj.project_qrcode_image instanceof File) {
      //       data.append("project[project_qrcode_image][]", fileObj.project_qrcode_image);
      //     }
      //     if (fileObj.isNew) {
      //       newTitles.push(fileObj.title || "");
      //     }
      //   });
      //   newTitles.forEach((title) => {
      //     data.append("project[project_qrcode_image_titles][]", title);
      //   });
      // }
      else if (key === "project_qrcode_image" && Array.isArray(value)) {
        value.forEach((fileObj) => {
          if (fileObj.project_qrcode_image instanceof File) {
            data.append(
              "project[project_qrcode_image][]",
              fileObj.project_qrcode_image
            );
            data.append(
              "project[project_qrcode_image_titles][]",
              fileObj.title || ""
            );
          }
        });
      } else if (key === "virtual_tour_url_multiple" && Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item.virtual_tour_url && item.virtual_tour_name) {
            data.append(
              `project[virtual_tour_url_multiple][${index}][virtual_tour_url]`,
              item.virtual_tour_url
            );
            data.append(
              `project[virtual_tour_url_multiple][${index}][virtual_tour_name]`,
              item.virtual_tour_name
            );
          }
        });
      } else if (key === "Rera_Number_multiple" && Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item.tower_name && item.rera_number) {
            data.append(
              `project[Rera_Number_multiple][${index}][tower_name]`,
              item.tower_name
            );
            data.append(
              `project[Rera_Number_multiple][${index}][rera_number]`,
              item.rera_number
            );
            data.append(
              `project[Rera_Number_multiple][${index}][rera_url]`,
              item.rera_url
            );
          }
        });
      } else if (key === "project_ppt" && Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) {
            data.append("project[ProjectPPT]", file);
          }
        });
      } else if (key === "project_creatives" && Array.isArray(value)) {
        value.forEach(({ file, type }) => {
          if (file instanceof File) {
            data.append("project[project_creatives][]", file);
            data.append(`project[project_creatives_types][]`, type);
          }
        });
      } else if (key === "cover_images" && Array.isArray(value)) {
        value.forEach(({ file, type }) => {
          if (file instanceof File) {
            data.append("project[cover_images][]", file);
            data.append(`project[cover_images_types][]`, type);
          }
        });
      } else if (key === "project_sales_type" && Array.isArray(value)) {
        data.append("project[project_sales_type][]", value);
      } else if (key.startsWith("image") && Array.isArray(value)) {
        value.forEach((img) => {
          const backendField = key.replace("image", "project[image") + "]";
          if (img.file instanceof File) {
            data.append(backendField, img.file);
          }
        });
      } else if (key.startsWith("cover_images_") && Array.isArray(value)) {
        value.forEach((img) => {
          const backendField =
            key.replace("cover_images_", "project[cover_images_") + "]";
          if (img.file instanceof File) {
            data.append(backendField, img.file);
          }
        });
      } else if (key.startsWith("gallery_image_") && Array.isArray(value)) {
        value.forEach((img, imgIndex) => {
          const backendField =
            key.replace("gallery_image_", "project[gallery_image_") + "][]"; // Append [] for multiple files
          if (img.file instanceof File) {
            data.append(backendField, img.file);
            // Add file_name parameter
            if (img.file_name) {
              const fileNameField = key.replace("gallery_image_", "project[gallery_image_") + "_file_names][]";
              data.append(fileNameField, img.file_name);
            }
          }
        });
      } else if (key.startsWith("floor_plans_") && Array.isArray(value)) {
        value.forEach((img) => {
          const backendField =
            key.replace("floor_plans_", "project[floor_plans_") + "]";
          if (img.file instanceof File) {
            data.append(backendField, img.file);
          }
        });
      } else if (key.startsWith("project_2d_image") && Array.isArray(value)) {
        value.forEach((img) => {
          if (img.file instanceof File) {
            const backendField =
              key.replace("project_2d_image", "project[project_2d_image") +
              "][]";
            data.append(backendField, img.file);
          }
        });
      } else {
        data.append(`project[${key}]`, value);
      }
    });

    console.log("data to be sent:", Array.from(data.entries()));

    try {
      const response = await axios.post(`${baseURL}projects.json`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      console.log("data to be sent:", Array.from(data.entries()));
      toast.success("Project submitted successfully");
      sessionStorage.removeItem("cached_projects");
      Navigate("/project-list");
    } catch (error) {
      console.error("Error submitting the form:", error);
      if (
        error.response &&
        error.response.status === 422 &&
        error.response.data &&
        (error.response.data.project_name || error.response.data.Project_Name)
      ) {
        toast.error("Project name already exists.");
      } else {
        toast.error("Failed to submit the form. Please try again.");
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    const fetchProjects = async () => {
      // const token = "RnPRz2AhXvnFIrbcRZKpJqA8aqMAP_JEraLesGnu43Q"; // Replace with your actual token
      const url = `${baseURL}get_property_types.json`;

      try {
        const response = await axios.get(url, {
          // headers: {
          //     Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          //     "Content-Type": "application/json",
          //    },
        });

        setprojectsType(response.data?.property_types);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchConfigurations = async () => {
      const url = `${baseURL}configuration_setups.json`;

      try {
        const response = await axios.get(url);
        setConfigurations(response.data);
      } catch (error) {
        console.error("Error fetching configurations:", error);
      }
    };

    fetchConfigurations();
  }, []);

  const handleImageNameChange = (e, index) => {
    const { value } = e.target;

    setFormData((prev) => {
      const updatedGallery = [...prev.gallery_image];
      updatedGallery[index].gallery_image_file_name = value;

      return { ...prev, gallery_image: updatedGallery };
    });
  };

  const handleCreativeImageNameChange = (e, index) => {
    const { value } = e.target;
    setFormData((prev) => {
      const updatedCreatives = [...prev.creative_images];
      updatedCreatives[index].creative_image_file_name = value;
      return { ...prev, creative_images: updatedCreatives };
    });
  };

  const handleDiscardCreative = (index) => {
    setFormData((prev) => ({
      ...prev,
      creative_images: prev.creative_images.filter((_, i) => i !== index),
    }));
  };

  const handleCreativeImageUpload = (event, type) => {
    const files = Array.from(event.target.files);

    if (!selectedCreativeType) {
      alert("Please select a creative type first.");
      return;
    }

    const updatedImages = files.map((file) => ({
      creative_image: file, // Actual image file
      creative_image_file_name: file.name, // Image name
      creative_type: selectedCreativeType, // Selected type
    }));

    setFormData((prev) => ({
      ...prev,
      [`${type}_images`]: [...(prev[`${type}_images`] || []), ...updatedImages],
    }));

    event.target.value = ""; // Reset file input
  };

  useEffect(() => {
    const fetchSpecifications = async () => {
      const url = `${baseURL}specification_setups.json`;

      try {
        const response = await axios.get(url);
        if (response.data && response.data.specification_setups) {
          setSpecifications(response.data.specification_setups);
        }
      } catch (error) {
        console.error("Error fetching specifications:", error);
      }
    };

    fetchSpecifications();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      // const token = "RnPRz2AhXvnFIrbcRZKpJqA8aqMAP_JEraLesGnu43Q"; // Replace with your actual token
      const url = `${baseURL}amenity_setups.json`;

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        setAmenities(response.data?.amenities_setups);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchCategoryTypes = async () => {
      try {
        const response = await axios.get(`${baseURL}category_types.json`);

        if (response.data) {
          // Extract only category_type from each object
          const formattedCategories = response.data.map((item) => ({
            value: item.category_type, // Assign category_type as value
            label: item.category_type, // Assign category_type as label
          }));

          setCategoryTypes(formattedCategories);
        }
      } catch (error) {
        console.error("Error fetching category types:", error);
      }
    };

    fetchCategoryTypes();
  }, []);

  const handleCancel = () => {
    setFormData({
      Property_Type: "",
      SFDC_Project_Id: "",
      Project_Construction_Status: "",
      Configuration_Type: [],
      Project_Name: "",
      project_address: "",
      Project_Description: "",
      Price_Onward: "",
      Project_Size_Sq_Mtr: "",
      Project_Size_Sq_Ft: "",
      development_area_sqft: "",
      development_area_sqmt: "",
      Rera_Carpet_Area_Sq_M: "",
      Rera_Carpet_Area_sqft: "",
      Number_Of_Towers: "",
      Number_Of_Units: "",
      no_of_floors: "",
      Rera_Number_multiple: [],
      Amenities: [],
      Specifications: [],
      Land_Area: "",
      land_uom: "",
      project_tag: "",
      virtual_tour_url_multiple: [],
      map_url: "",
      image: [],
      Address: {
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        pin_code: "",
        country: "",
      },
      brochure: [],
      two_d_images: [],
      videos: [],
      gallery_image: [],
    });
    Navigate(-1);
  };

  // const statusOptions = {
  //   "Office Parks": [
  //     { value: "Completed", label: "Completed" },
  //     // { value: "Under-Construction", label: "Under Construction" },
  //     { value: "Ready-To-Move-in", label: "Ready To Move in" },
  //     { value: "Upcoming", label: "Upcoming" },
  //   ],
  //   Residential: [
  //     { value: "Completed", label: "Completed" },
  //     { value: "Ready-To-Move-in", label: "Ready To Move in" },
  //     { value: "Upcoming", label: "Upcoming" },
  //   ],
  // };

  const handleTowerChange = (e) => {
    setTowerName(e.target.value);
  };

  const handleDayNightChange = (index, isDay) => {
    setFormData((prev) => {
      const updatedGallery = [...prev.gallery_image];
      updatedGallery[index].isDay = isDay;
      return { ...prev, gallery_image: updatedGallery };
    });
  };

  const handleReraNumberChange = (e) => {
    const { value } = e.target;

    // Allow only alphanumeric characters (letters & numbers) & limit to 12 chars
    if (/^[a-zA-Z0-9]{0,12}$/.test(value)) {
      setReraNumber(value);
    }
  };

  const handleReraUrlChange = (e) => {
    setReraUrl(e.target.value);
  };

  const handleReraNumberBlur = () => {
    if (reraNumber.length !== 12) {
      toast.error("RERA Number must be exactly 12 alphanumeric characters!", {
        position: "top-right",
        autoClose: 3000, // Closes after 3 seconds
      });

      setReraNumber(""); // Reset field if invalid
    }
  };

  const handleAddRera = () => {
    // Dismiss any existing toast notifications before showing a new one
    toast.dismiss();

    if (!towerName.trim() || !reraNumber.trim()) {
      toast.error("Both Tower and RERA Number are required.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      Rera_Number_multiple: [
        ...prev.Rera_Number_multiple,
        {
          tower_name: towerName,
          rera_number: reraNumber,
          rera_url: reraUrl,
        },
      ],
    }));

    // Clear input fields after adding
    setTowerName("");
    setReraNumber("");
    setReraUrl("");
  };

  // Handle Deleting a RERA Entry
  const handleDeleteRera = (index) => {
    setFormData((prev) => ({
      ...prev,
      Rera_Number_multiple: prev.Rera_Number_multiple.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleVirtualTourChange = (e) => {
    setVirtualTourUrl(e.target.value);
  };

  const handleVirtualTourNameChange = (e) => {
    setVirtualTourName(e.target.value);
  };

  const handleAddVirtualTour = () => {
    // Dismiss any existing toast messages before showing a new one
    toast.dismiss();

    // if (!virtualTourUrl.trim() || !virtualTourName.trim()) {
    //   toast.error("Both URL and Name are required.");
    //   return;
    // }

    setFormData((prev) => ({
      ...prev,
      virtual_tour_url_multiple: [
        ...prev.virtual_tour_url_multiple,
        {
          virtual_tour_url: virtualTourUrl,
          virtual_tour_name: virtualTourName,
        },
      ],
    }));

    // Clear input fields after adding
    setVirtualTourUrl("");
    setVirtualTourName("");
  };

  const handleDeleteVirtualTour = (index) => {
    setFormData((prev) => ({
      ...prev,
      virtual_tour_url_multiple: prev.virtual_tour_url_multiple.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);

    // if (!selectedCategory) {
    //   alert("Please select an image category first.");
    //   return;
    // }

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ];

    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      let isValid = false;
      let maxSize = 0;
      let fileTypeDescription = "";

      // Check if it's an image
      if (allowedImageTypes.includes(file.type)) {
        maxSize = MAX_IMAGE_SIZE;
        fileTypeDescription = "image";
        isValid = true;
      }
      // Check if it's a video
      else if (allowedVideoTypes.includes(file.type)) {
        maxSize = MAX_VIDEO_SIZE;
        fileTypeDescription = "video";
        isValid = true;
      }
      // Invalid file type
      else {
        toast.error(
          `Invalid file type: ${file.name}. Only images (JPG, PNG, GIF, WebP) and videos (MP4, WebM, QuickTime, AVI) are allowed.`
        );
        invalidFiles.push(file);
        return;
      }

      // Check file size
      if (file.size > maxSize) {
        toast.error("Image size must be less than 3MB.");
        invalidFiles.push(file);
        return;
      }

      validFiles.push(file);
    });

    // Only process valid files
    if (validFiles.length > 0) {
      const updatedImages = validFiles.map((file) => ({
        gallery_image: file, // ✅ Store actual File
        gallery_image_file_name: file.name,
        gallery_image_file_type: selectedCategory,
        isDay: true,
      }));

      setFormData((prev) => ({
        ...prev,
        gallery_image: [...(prev.gallery_image || []), ...updatedImages], // ✅ Ensure existing images are not overwritten
      }));

      // Show success message for valid files
      toast.success(`${validFiles.length} file(s) uploaded successfully.`);
    }

    // Show summary if there were invalid files

    event.target.value = ""; // Reset file input
  };
  const handleDiscardGallery = (index) => {
    setFormData((prev) => ({
      ...prev,
      gallery_image: prev.gallery_image.filter((_, i) => i !== index),
    }));
  };

  const handleDiscardPpt = (key, index) => {
    setFormData((prev) => {
      if (!prev[key] || !Array.isArray(prev[key])) return prev; // Ensure key exists and is an array

      const updatedFiles = prev[key].filter((_, i) => i !== index);

      console.log(`Updated ${key} after deletion:`, updatedFiles); // Debugging log

      return { ...prev, [key]: updatedFiles };
    });
  };
  useEffect(() => {
    axios
      .get(`${baseURL}/property_types.json`)
      .then((response) => {
        const options = response.data
          .filter((item) => item.active) // optional: only include active types
          .map((type) => ({
            value: type.property_type,
            label: type.property_type,
            id: type.id,
          }));
        setPropertyTypeOptions(options);
      })
      .catch((error) => {
        console.error("Error fetching property types:", error);
      });
  }, []);

  // const propertyTypeOptions = [
  //   { value: "Office Parks", label: "Office Parks" },
  //   // { value: "Plots", label: "Plots" },
  //   { value: "Residential", label: "Residential" },
  // ];

  // const buildingTypeOptions = {
  //   "Office Parks": [
  //     { value: "Mixed-Use-Development", label: "Mixed Use Development" },
  //     { value: "Special-Economic-Zone", label: "Special Economic Zone" },
  //     { value: "Tech-Parks", label: "Tech Parks" },
  //     { value: "Built-to-Suit", label: "Built to Suit" },
  //     { value: "Upcoming-Developments", label: "Upcoming Developments" },
  //   ],
  // Residential: [
  //   { value: "Completed", label: "Completed" },
  //   { value: "Ready-To-Move-In", label: "Ready To Move In" },
  //   { value: "Upcoming-Developments", label: "Upcoming Developments" },
  // ],
  // };

  // useEffect(() => {
  //   axios
  //     .get(`${baseURL}//building_types.json?q[property_type_id_eq]=${formData.Property_Type}`)
  //     .then((response) => {
  //       setAllBuildingTypes(response.data); // assumes structure is { "Office Parks": [{...}, {...}], ... }
  //     })
  //     .catch((error) => {
  //       console.error("Failed to fetch building types:", error);
  //     });
  // }, []);
  useEffect(() => {
    const fetchBuildingTypes = async () => {
      const url = `${baseURL}building_types.json?q[property_type_id_eq]=${formData.Property_Type}`;

      try {
        const response = await axios.get(url);
        setBuildingTypeOptions(response.data);
        console.log(response);
      } catch (error) {
        console.error("Error fetching building types:", error);
      }
    };
  }, [formData.Property_Type]);
  const [buildingTypeOptions, setBuildingTypeOptions] = useState([]);
  // console.log(buildingTypeOptions);

  const handlePropertyTypeChange = async (selectedOption) => {
    const { value, id } = selectedOption;

    setFormData((prev) => ({
      ...prev,
      Property_Type: value,
      Property_type_id: id,
      building_type: "", // Optionally reset building_type
    }));

    try {
      // const response = await axios.get(
      //   `https://dev-panchshil-super-app.lockated.com/building_types.json?q[property_type_id_eq]=${id}`
      // );
      const response = await axios.get(
        `${baseURL}building_types.json?q[property_type_id_eq]=${id}`
      );

      const buildingTypes = response.data || [];

      const formattedOptions = buildingTypes.map((item) => ({
        value: item.building_type,
        label: item.building_type,
        id: item.id,
      }));

      setBuildingTypeOptions(formattedOptions);
    } catch (error) {
      console.error("Error fetching building types:", error);
    }
  };
  // useEffect(() => {
  //   const fetchConstructionStatuses = async () => {
  //     try {
  //       const response = await axios.get(`${baseURL}construction_statuses.json`);
  //       const options = response.data.map((status) => ({
  //         label: status.construction_status,
  //         value: status.id,
  //       }));
  //       setStatusOptions(options);
  //     } catch (error) {
  //       console.error("Error fetching construction statuses:", error);
  //     }
  //   };
  //   fetchConstructionStatuses();
  // }, []);
  useEffect(() => {
    const fetchConstructionStatuses = async () => {
      try {
        const response = await axios.get(
          `${baseURL}construction_statuses.json`
        );
        const options = response.data
          .filter((status) => status.active) // Filter only active statuses
          .map((status) => ({
            label: status.construction_status, // Display name
            value: status.construction_status, // Unique identifier
            name: status.Project_Construction_Status_Name,
          }));
        setStatusOptions(options); // Set the options for the dropdown
      } catch (error) {
        console.error("Error fetching construction statuses:", error);
      }
    };

    fetchConstructionStatuses();
  }, []);

  const handleToggle = async (id, currentStatus) => {
    const updatedStatus = !currentStatus;

    // Dismiss any existing toast first
    if (activeToastId) {
      toast.dismiss(activeToastId);
    }

    try {
      await axios.put(
        `${baseURL}projects/${id}.json`,
        { project: { published: updatedStatus } },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setProjects((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, published: updatedStatus } : item
        )
      );

      // Show new toast and store its ID
      const newToastId = toast.success("Status updated successfully!", {
        duration: 3000, // Toast will auto-dismiss after 3 seconds
        position: "top-center", // Position the toast at the top center
        id: `toggle-${id}`, // Give each toast a unique ID based on project
      });

      setActiveToastId(newToastId);
    } catch (error) {
      console.error("Error updating status:", error);

      // Show error toast and store its ID
      const newToastId = toast.error("Failed to update status.", {
        duration: 3000,
        position: "top-center",
        id: `toggle-error-${id}`,
      });

      setActiveToastId(newToastId);
    }
  };

  const handleQRFileChange = (e, field) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      [field]: files, // save files (can be image or project_qr_code_image)
      [`${field}Preview`]: previews,
    }));
  };

  const handleQRCodeImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      project_qrcode_image: file, // Store the file
      title: file.name, // Default title is the file name
      isNew: true, // Mark as a new image
    }));

    setFormData((prev) => ({
      ...prev,
      project_qrcode_image: [
        ...(prev.project_qrcode_image || []),
        ...newImages,
      ],
    }));

    e.target.value = ""; // Reset the input box after upload
  };

  const handleQRCodeImageNameChange = (index, newName) => {
    setFormData((prev) => {
      const updatedImages = [...prev.project_qrcode_image];
      updatedImages[index].title = newName; // Update the title
      return { ...prev, project_qrcode_image: updatedImages };
    });
  };

  const handleRemoveQRCodeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      project_qrcode_image: prev.project_qrcode_image.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const project_banner = [
    { key: "image_1_by_1", label: "1:1" },
    { key: "image_16_by_9", label: "16:9" },
    { key: "image_9_by_16", label: "9:16" },
    { key: "image_3_by_2", label: "3:2" },
  ];
  const gallery_images = [
    { key: "gallery_image_16_by_9", label: "16:9" },
    { key: "gallery_image_1_by_1", label: "1:1" },
    { key: "gallery_image_9_by_16", label: "9:16" },
    { key: "gallery_image_3_by_2", label: "3:2" },
  ];
  const floorPlanRatios = [
    { key: "project_2d_image_16_by_9", label: "16:9" },
    { key: "project_2d_image_1_by_1", label: "1:1" },
    { key: "project_2d_image_3_by_2", label: "3:2" },
    { key: "project_2d_image_9_by_16", label: "9:16" },
  ];

  const coverImageRatios = [
    { key: "cover_images_1_by_1", label: "1:1" },
    { key: "cover_images_16_by_9", label: "16:9" },
    { key: "cover_images_9_by_16", label: "9:16" },
    { key: "cover_images_3_by_2", label: "3:2" },
  ];
  return (
    <>
      {/* <Header /> */}
      <div className="module-data-section p-3">
        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header">
            <h3 className="card-title">Create Project</h3>
          </div>
          <div className="card-body">
            <div className="row">
              {/* <div className="col-md-3">
                <div className="form-group">
                  <label>
                    Project Banner Image
                    <span
                      className="tooltip-container"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      [i]
                      {showTooltip && (
                        <span className="tooltip-text">
                          Max Upload Size 3 MB
                        </span>
                      )}
                    </span>
                    <span className="otp-asterisk"> *</span>
                  </label>

                 
                  <ImageUploadingButton
                    value={mainImageUpload}
                    onChange={(list) => handleImageUploaded(list, "image")}
                    variant="custom"
                  />
                   <small className="form-text text-muted">
                        Required ratio must be 9:16
                      </small>

                  <ImageCropper
                    open={dialogOpen.image}
                    image={pendingImageUpload?.[0]?.dataURL}
                    originalFile={pendingImageUpload?.[0]?.file}
                    onComplete={(cropped) => {
                      if (cropped) {
                        setFormData((prev) => ({
                          ...prev,
                          image: [cropped.file],
                        }));
                        setMainImageUpload([
                          {
                            file: cropped.file,
                            dataURL: URL.createObjectURL(cropped.file),
                          },
                        ]);
                      }
                      setDialogOpen((prev) => ({ ...prev, image: false }));
                      setPendingImageUpload([]);
                    }}
                      requiredRatios={[16 / 9, 1, 9 / 16]}
                    requiredRatioLabel="9:16"
                    allowedRatios={[
                      { label: "16:9", ratio: 16 / 9 },
                      { label: "9:16", ratio: 9 / 16 },
                      { label: "1:1", ratio: 1 },
                    ]}
                  />


                </div>
                {formData.image?.[0] && (
                  <div className="mt-2 flex items-center gap-3">
                    <img
                      src={URL.createObjectURL(formData.image[0])}
                      alt="Preview"
                      className="img-fluid rounded"
                      style={{ maxWidth: "100px", maxHeight: "100px",  objectFit: "cover" }}
                    />
                  </div>
                )}

              </div> */}

              <div className="col-md-3">
                <div className="form-group">
                  <label>
                    Property Types
                    <span className="otp-asterisk"> *</span>
                  </label>
                  <PropertySelect
                    options={propertyTypeOptions}
                    value={formData.Property_Type}
                    onChange={(value) => handlePropertyTypeChange(value)}
                  />
                </div>
              </div>

              {/* <div className="col-md-3 mt-1">
                <div className="form-group">
                  <label>
                    Project Building Type
                    
                  </label>
                  <SelectBox
                    options={buildingTypeOptions[formData.Property_Type] || []} 
                    value={formData.building_type}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        building_type: value,
                      }))
                    }
                    isDisabled={!formData.Property_Type} 
                  />
                </div>
              </div> */}
              <div className="col-md-3 mt-1">
                <div className="form-group">
                  <label>Project Building Type</label>
                  {/* <SelectBox
                    options={allBuildingTypes.map((type) => ({
                      value: type.building_type,
                      label: type.building_type,
                    }))}
                    value={formData.building_type}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        building_type: value,
                      }))
                    }
                    // isDisabled={!formData.Property_Type}
                  /> */}
                  <SelectBox
                    options={buildingTypeOptions}
                    defaultValue={formData.building_type}
                    onChange={(selected) => {
                      console.log(selected);
                      setFormData((prev) => ({
                        ...prev,
                        building_type: selected,
                        // building_type_id: selected.id,
                      }));
                    }}
                  />
                  {/* )} */}
                </div>
              </div>

              <div className="col-md-3 mt-0">
                <div className="form-group">
                  <label>
                    Project Construction Status
                    <span className="otp-asterisk"> *</span>
                  </label>
                  <SelectBox
                    options={statusOptions} // Use the dynamically fetched options
                    defaultValue={formData.Project_Construction_Status}
                    onChange={(selectedOption) =>
                      setFormData((prev) => ({
                        ...prev,
                        Project_Construction_Status: selectedOption, // Save the selected value
                      }))
                    }
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Configuration Type</label>
                  <MultiSelectBox
                    options={configurations.map((config) => ({
                      value: config.name,
                      label: config.name,
                    }))}
                    value={formData.Configuration_Type.map((type) => ({
                      value: type,
                      label: type,
                    }))}
                    onChange={(selectedOptions) =>
                      setFormData((prev) => ({
                        ...prev,
                        Configuration_Type: selectedOptions.map(
                          (option) => option.value
                        ),
                      }))
                    }
                    placeholder="Select Type"
                  />
                </div>
              </div>

              <div className="col-md-3 mt-1">
                <div className="form-group">
                  <label>
                    Project Name
                    <span className="otp-asterisk"> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="Project_Name"
                    placeholder="Enter Project Name"
                    value={formData.Project_Name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* {baseURL === "https://dev-panchshil-super-app.lockated.com/" && ( */}
              <div className="col-md-3 mt-1">
                <div className="form-group">
                  <label>
                    SFDC Project ID
                    <span className="otp-asterisk"> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="SFDC_Project_Id"
                    placeholder="Enter SFDC Project ID"
                    maxLength={18}
                    value={formData.SFDC_Project_Id}
                    onChange={handleChange}
                  />
                </div>
              </div>
              {/* )} */}

              <div className="col-md-3 mt-1">
                <div className="form-group">
                  <label>
                    Location
                    <span className="otp-asterisk"> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="project_address"
                    placeholder="Enter Location"
                    value={formData.project_address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Project Tag</label>
                  <SelectBox
                    options={[
                      //{ value: "", label: "Select status", isDisabled: true },
                      { value: "Featured", label: "Featured" },
                      { value: "Upcoming", label: "Upcoming" },
                    ]}
                    defaultValue={formData.project_tag}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        project_tag: value,
                      }))
                    }
                    //isDisableFirstOption={true}
                  />
                </div>
              </div>

              <div className="col-md-6 mt-2">
                <div className="form-group">
                  <label>Project Description</label>
                  <textarea
                    className="form-control"
                    rows={1}
                    name="Project_Description"
                    placeholder="Enter Project Description"
                    value={formData.Project_Description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Price Onward</label>
                  <input
                    className="form-control"
                    type="text-number"
                    name="Price_Onward"
                    placeholder="Enter Price Onward"
                    value={formData.Price_Onward}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Project Size (Sq. Mtr.) (For Residential)
                    {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span> */}
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="Project_Size_Sq_Mtr"
                    placeholder="Enter Size in Sq. Mtr."
                    value={formData.Project_Size_Sq_Mtr}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Project Size (Sq. Ft.) (For Residential)
                    {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span> */}
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="Project_Size_Sq_Ft"
                    placeholder="Enter Size in Sq. Ft."
                    value={formData.Project_Size_Sq_Ft}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Development Area (Sq. Mtr.) (For Office Park)
                    {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span> */}
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="development_area_sqmt"
                    placeholder="Enter Area Sq. Mt."
                    value={formData.development_area_sqmt}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Development Area (Sq. Ft.) (For Office Park)
                    {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span> */}
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="development_area_sqft"
                    placeholder="Enter Area in Sq. Ft."
                    value={formData.development_area_sqft}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>RERA Carpet Area (Sq. M)</label>
                  <input
                    className="form-control"
                    type="number"
                    name="Rera_Carpet_Area_Sq_M"
                    placeholder="Enter RERA Carpet Area (Sq. M)"
                    value={formData.Rera_Carpet_Area_Sq_M}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>RERA Carpet Area (Sq. Ft.)</label>
                  <input
                    className="form-control"
                    type="number"
                    name="Rera_Carpet_Area_sqft"
                    placeholder="Enter RERA Carpet Area (Sq. Ft.)"
                    value={formData.Rera_Carpet_Area_sqft}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    RERA Sellable Area
                   
                  </label>
                  <input
                    className="form-control"
                    type="text-number"
                    name="Rera_Sellable_Area"
                    placeholder="Enter Rera Sellable Area"
                    value={formData.Rera_Sellable_Area}
                    onChange={handleChange}
                  />
                </div>
              </div> */}

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Number of Towers
                    {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span> */}
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="Number_Of_Towers"
                    placeholder="Enter Number of Towers"
                    value={formData.Number_Of_Towers}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Number of Floors
                    {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span> */}
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="no_of_floors"
                    placeholder="Enter Number of Floors"
                    value={formData.no_of_floors}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Number of Units</label>
                  <input
                    className="form-control"
                    type="number"
                    name="Number_Of_Units"
                    placeholder="Enter Number of Units"
                    value={formData.Number_Of_Units}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Specifications
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <MultiSelectBox
                    options={specifications.map((spec) => ({
                      value: spec.id,
                      label: spec.name,
                    }))}
                    value={formData.Specifications.map((specId) => {
                      const spec = specifications.find((s) => s.id === specId);
                      return spec ? { value: spec.id, label: spec.name } : null;
                    }).filter(Boolean)}
                    onChange={(selectedOptions) =>
                      setFormData((prev) => ({
                        ...prev,
                        Specifications: selectedOptions.map(
                          (option) => option.value
                        ),
                      }))
                    }
                    placeholder="Select Specifications"
                  />
                </div>
              </div> */}

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Land Area</label>
                  <input
                    className="form-control"
                    type="number"
                    name="Land_Area"
                    placeholder="Enter Land Area"
                    value={formData.Land_Area}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Land UOM</label>
                  <SelectBox
                    options={[
                      { value: "Square Meter", label: "Square Meter" },
                      {
                        value: "Square Feet",
                        label: "Square Feet",
                      },
                      {
                        value: "Acre",
                        label: "Acre",
                      },
                      { value: "Hectare", label: "Hectare" },
                      { value: "Yard", label: "Yard" },
                      {
                        value: "Guntha",
                        label: "Guntha",
                      },
                      { value: "Bigha", label: "Bigha" },
                      { value: "Kanal", label: "Kanal" },
                      { value: "Marla", label: "Marla" },
                      { value: "Cent", label: "Cent" },
                      { value: "Ropani", label: "Ropani" },
                    ]}
                    value={formData?.land_uom || ""}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        land_uom: value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Project Sales Type</label>
                  <SelectBox
                    options={[
                      { value: "Sales", label: "Sales" },
                      { value: "Lease", label: "Lease" },
                    ]}
                    value={formData?.project_sales_type || ""}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        project_sales_type: value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Order Number</label>
                  <input
                    className="form-control"
                    type="number"
                    name="order_no"
                    placeholder="Enter Order Number"
                    value={formData.order_no}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Disclaimer</label>
                  <textarea
                    className="form-control"
                    rows={1}
                    name="disclaimer"
                    placeholder="Enter disclaimer"
                    value={formData.disclaimer}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label>
                    Project QR Code Images
                    <span
                      className="tooltip-container"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      [i]
                      {showTooltip && (
                        <span className="tooltip-text">
                          Max Upload Size 50 MB
                        </span>
                      )}
                    </span>
                    <span className="otp-asterisk"> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="file"
                    name="project_qrcode_image"
                    accept="image/*"
                    multiple
                    onChange={handleQRCodeImageChange}
                  />
                </div>

                {/* Display uploaded or existing QR code images */}
                <div className="mt-2">
                  {formData.project_qrcode_image.length > 0 ? (
                    formData.project_qrcode_image.map((image, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center mb-2"
                      >
                        <img
                          src={
                            image.isNew
                              ? URL.createObjectURL(image.project_qrcode_image) // Preview for new images
                              : image.document_url // URL for existing images
                          }
                          alt="QR Code Preview"
                          className="img-fluid rounded"
                          style={{
                            maxWidth: "100px",
                            maxHeight: "100px",
                            objectFit: "cover",
                            marginRight: "10px",
                          }}
                        />
                        <input
                          type="text"
                          className="form-control me-2"
                          placeholder="Enter image name"
                          value={
                            image.isNew
                              ? image.title || "" // For new uploads, use editable title
                              : image.title || image.file_name || "" // For existing, show title if present, else fallback to file_name
                          }
                          onChange={(e) =>
                            handleQRCodeImageNameChange(index, e.target.value)
                          }
                          disabled={!image.isNew} // Disable input for existing images
                        />
                        <button
                          type="button"
                          className="purple-btn2"
                          onClick={() => handleRemoveQRCodeImage(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <span>No images selected</span>
                  )}
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <label>Enable Enquiry</label>
                <div className="form-group">
                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        enable_enquiry: !prev.enable_enquiry, // Toggle the boolean value
                      }))
                    }
                    className="toggle-button"
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      padding: 0,
                      width: "35px",
                    }}
                  >
                    {formData.enable_enquiry ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="30"
                        fill="var(--red)"
                        className="bi bi-toggle-on"
                        viewBox="0 0 16 16"
                      >
                        <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="30"
                        fill="#667085"
                        className="bi bi-toggle-off"
                        viewBox="0 0 16 16"
                      >
                        <path d="M11 4a4 4 0 0 1 0 8H8a5 5 0 0 0 2-4 5 5 0 0 0-2-4zm-6 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8M0 8a5 5 0 0 0 5 5h6a5 5 0 0 0 0-10H5a5 5 0 0 0-5 5" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <label>Is Sold</label>
                <div className="form-group">
                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        is_sold: !prev.is_sold, // Toggle the boolean value
                      }))
                    }
                    className="toggle-button"
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      padding: 0,
                      width: "35px",
                    }}
                  >
                    {formData.is_sold ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="30"
                        fill="var(--red)"
                        className="bi bi-toggle-on"
                        viewBox="0 0 16 16"
                      >
                        <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="30"
                        fill="#667085"
                        className="bi bi-toggle-off"
                        viewBox="0 0 16 16"
                      >
                        <path d="M11 4a4 4 0 0 1 0 8H8a5 5 0 0 0 2-4 5 5 0 0 0-2-4zm-6 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8M0 8a5 5 0 0 0 5 5h6a5 5 0 0 0 0-10H5a5 5 0 0 0-5 5" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

         {baseURL !== "https://dev-panchshil-super-app.lockated.com/" && (
                  <>
        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header3 d-flex justify-content-between align-items-center">
            <h3 className="card-title">RERA Number</h3>
          </div>
          <div className="card-body mt-0 pb-0">
            {/* Input Fields for New Entry */}
            <div className="row align-items-center">
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Tower </label>
                  <input
                    className="form-control"
                    type="text"
                    name="tower_name"
                    placeholder="Enter Tower Name"
                    value={towerName}
                    onChange={handleTowerChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>RERA Number </label>
                  <input
                    className="form-control"
                    type="text"
                    name="rera_number"
                    placeholder="Enter RERA Number"
                    value={reraNumber}
                    onChange={handleReraNumberChange}
                    maxLength={12}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>RERA URL </label>
                  <input
                    className="form-control"
                    type="text"
                    name="rera_url"
                    placeholder="Enter RERA URL"
                    value={reraUrl}
                    onChange={handleReraUrlChange}
                  />
                </div>
              </div>

              {/* Add Button */}
              <div className="col-md-3 mt-2">
                <button
                  className="purple-btn2 rounded-3"
                  style={{ marginTop: "23px" }}
                  onClick={handleAddRera}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={26}
                    height={20}
                    fill="currentColor"
                    className="bi bi-plus"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                  </svg>
                  <span> Add</span>
                </button>
              </div>
            </div>

            {/* Editable RERA List Table */}
            {formData.Rera_Number_multiple.length > 0 && (
              <div className="col-md-12 mt-2">
                <div className="mt-4 tbl-container w-100">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>Sr No</th>
                        <th>Tower Name</th>
                        <th>RERA Number</th>
                        <th>Rera URL</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.Rera_Number_multiple.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={item.tower_name}
                              onChange={(e) =>
                                handleEditRera(
                                  index,
                                  "tower_name",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={item.rera_number}
                              onChange={(e) =>
                                handleEditRera(
                                  index,
                                  "rera_number",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={item.rera_url}
                              onChange={(e) =>
                                handleEditRera(
                                  index,
                                  "rera_url",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="purple-btn2"
                              onClick={() => handleDeleteRera(index)}
                            >
                              x
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        </>
         )}

        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header3">
            <h3 className="card-title">Amenities</h3>
          </div>
          <div className="card-body mt-0 pb-0">
            <div className="row">
              {/* Multi-Select Amenities Dropdown */}
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Amenities
                    {/* <span style={{ color: "#de7008", fontSize: "16px" }}> *</span> */}
                  </label>
                  <MultiSelectBox
                    options={amenities.map((ammit) => ({
                      value: ammit.id,
                      label: ammit.name,
                    }))}
                    value={formData.Amenities.map((id) => {
                      const ammit = amenities.find((ammit) => ammit.id === id);
                      return ammit
                        ? { value: ammit.id, label: ammit.name }
                        : null;
                    }).filter(Boolean)}
                    onChange={(selectedOptions) =>
                      setFormData((prev) => ({
                        ...prev,
                        Amenities: selectedOptions.map(
                          (option) => option.value
                        ),
                      }))
                    }
                    placeholder="Select amenities"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header">
            <h3 className="card-title">Address</h3>
          </div>
          <div className="card-body">
            <div className="row">
              {/* Address Section */}
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Address Line 1
                    {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                      *
                    </span>{" "} */}
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Address Line 1"
                    name="address_line_1"
                    value={formData.Address.address_line_1}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Address Line 2
                    {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                      *
                    </span>{" "} */}
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Address Line 2"
                    name="address_line_2"
                    value={formData.Address.address_line_2}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    City
                    {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span> */}
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="City"
                    name="city"
                    value={formData.Address.city}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    State
                    {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span> */}
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="State"
                    name="state"
                    value={formData.Address.state}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Pin Code
                    {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span> */}
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Pin Code"
                    name="pin_code"
                    value={formData.Address.pin_code}
                    maxLength={6} // Prevents typing more than 6 digits
                    onChange={(e) => {
                      const { name, value } = e.target;
                      // Allow only numbers (0-9) and ensure max 6 digits
                      if (/^\d{0,6}$/.test(value)) {
                        setFormData((prevData) => ({
                          ...prevData,
                          Address: { ...prevData.Address, [name]: value },
                        }));
                      }
                    }}
                    onBlur={(e) => {
                      const { name, value } = e.target;
                      if (value.length !== 6) {
                        toast.error("Pin Code must be exactly 6 digits");
                        setFormData((prevData) => ({
                          ...prevData,
                          Address: { ...prevData.Address, [name]: "" }, // Reset field on incorrect input
                        }));
                      }
                    }}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Country
                    {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span> */}
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Country"
                    name="country"
                    value={formData.Address.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Map URL
                    {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span> */}
                  </label>
                  <input
                    className="form-control"
                    type="url"
                    name="map_url"
                    placeholder="Enter Location"
                    value={formData.map_url}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {baseURL === "https://dev-panchshil-super-app.lockated.com/" && (
          <div className="card mt-3 pb-4 mx-4">
            <div className="card-header3">
              <h3 className="card-title">Plans</h3>
            </div>
            <div className="card-body mt-0 pb-0">
              <div className="row">
                <div className="d-flex justify-content-between align-items-end mx-1">
                  <h5 className="mt-3">
                    Project Plans{" "}
                    <span
                      className="tooltip-container"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      [i]
                      {showTooltip && (
                        <span className="tooltip-text">
                          Max Upload Size 10 MB per image
                        </span>
                      )}
                    </span>
                  </h5>
                </div>

                {/* <div className="row align-items-end"> */}
                <div className="col-md-3 mt-2">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Enter Plan Name"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                  />
                </div>

                <div className="col-md-3 mt-2">
                  <input
                    className="form-control"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setPlanImages(Array.from(e.target.files))}
                  />
                </div>

                <div className="col-md-3 ">
                  <button
                    className="purple-btn2"
                    type="button"
                    onClick={() => {
                      if (!planName || planImages.length === 0) {
                        toast.error(
                          "Please enter plan name and select images."
                        );
                        return;
                      }

                      const newPlan = { name: planName, images: planImages };

                      setPlans((prev) => [...prev, newPlan]);

                      // ✅ Add to formData.plans
                      setFormData((prev) => ({
                        ...prev,
                        plans: Array.isArray(prev.plans)
                          ? [...prev.plans, newPlan]
                          : [newPlan],
                      }));

                      setPlanName("");
                      setPlanImages([]);
                    }}
                  >
                    + Add
                  </button>
                </div>
                {/* </div> */}

                <div className="col-md-12">
                  <div className="mt-4 tbl-container">
                    <table className="w-100">
                      <thead>
                        <tr>
                          <th>Plan Name</th>
                          <th>Images</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plans.map((plan, pIdx) => (
                          <tr key={pIdx}>
                            <td>{plan.name}</td>
                            <td>
                              {plan.images.map((img, iIdx) => {
                                let src = "";
                                if (
                                  img instanceof File ||
                                  img instanceof Blob
                                ) {
                                  src = URL.createObjectURL(img);
                                } else if (typeof img === "string") {
                                  src = img;
                                } else if (img?.document_url) {
                                  src = img.document_url;
                                }

                                return (
                                  <img
                                    key={iIdx}
                                    src={src}
                                    alt="Plan"
                                    style={{
                                      maxWidth: 60,
                                      maxHeight: 60,
                                      marginRight: 5,
                                    }}
                                  />
                                );
                              })}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="purple-btn2"
                                onClick={() => handlePlanDelete(plan.id, pIdx)}
                              >
                                x
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* file Upload */}
        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header">
            <h3 className="card-title">File Upload</h3>
          </div>

          <div className="card-body">
            <div className="row">
              <div className="col-12 mb-4"></div>

              <div className="d-flex justify-content-between align-items-end mx-1">
                <h5 className="mt-3">
                  Project Banner{" "}
                  <span
                    className="tooltip-container"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    [i]
                    {showTooltip && (
                      <span className="tooltip-text">
                        Max Upload Size 3 MB and Required ratio is 9:16 and 1:1
                      </span>
                    )}
                  </span>
                  <span className="otp-asterisk"> *</span>
                </h5>

                <button
                  className="purple-btn2 rounded-3"
                  fdprocessedid="xn3e6n"
                  type="button"
                  onClick={() => setShowBannerModal(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-plus"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                  </svg>
                  <span>Add</span>
                </button>
              </div>
              {showBannerModal && (
                <ProjectBannerUpload
                  onClose={() => setShowBannerModal(false)}
                  includeInvalidRatios={false}
                  selectedRatioProp={selectedBannerRatios}
                  showAsModal={true}
                  label={bannerImageLabel}
                  description={dynamicDescription3}
                  onContinue={(validImages) =>
                    handleCroppedImages(validImages, "banner")
                  }
                />
              )}
              <div className="col-md-12 mt-2">
                <div className="mt-4 tbl-container">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Preview</th>
                        <th>Ratio</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project_banner.map(({ key, label }) => {
                        const files = formData[key] || [];

                        return files.map((file, index) => (
                          <tr key={`${key}-${index}`}>
                            <td>{file.name}</td>
                            <td>
                              <img
                                style={{ maxWidth: 100, maxHeight: 100 }}
                                className="img-fluid rounded"
                                src={file.preview}
                                alt={file.name}
                              />
                            </td>
                            <td>{file.ratio || label}</td>
                            <td>
                              <button
                                type="button"
                                className="purple-btn2"
                                onClick={() => discardImage(key, file)}
                              >
                                x
                              </button>
                            </td>
                          </tr>
                        ));
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-end mx-1">
                <h5 className="mt-3">
                  Project Cover Image{" "}
                  <span
                    className="tooltip-container"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    [i]
                    {showTooltip && (
                      <span className="tooltip-text">
                        Max Upload Size 5 MB and Required ratio is 16:9
                      </span>
                    )}
                  </span>
                  {/* <span style={{ color: "#de7008", fontSize: "16px" }}> *</span> */}
                </h5>

                <button
                  className="purple-btn2 rounded-3"
                  fdprocessedid="xn3e6n"
                  onClick={() => setShowUploader(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-plus"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                  </svg>
                  <span>Add</span>
                </button>
              </div>

              <div className="col-md-12 mt-2">
                <div className="mt-4 tbl-container">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Preview</th>
                        <th>Ratio</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* {coverImageRatios.map(({ key, label }) => {
                        const files = formData[key] || [];

                        return files.map((file, index) => (
                          <tr key={`${key}-${index}`}>
                            <td>{file.name}</td>
                            <td>
                              <img
                                style={{ maxWidth: 100, maxHeight: 100 }}
                                className="img-fluid rounded"
                                src={file.preview}
                                alt={file.name}
                              />
                            </td>
                            <td>{file.ratio || label}</td>
                            <td>
                              <button
                                type="button"
                                className="purple-btn2"
                                onClick={() => discardImage(key, file)}
                              >
                                x
                              </button>
                            </td>
                          </tr>
                        ));
                      })} */}
                      {coverImageRatios.map(({ key, label }) => {
                        const files = Array.isArray(formData[key])
                          ? formData[key]
                          : formData[key]
                          ? [formData[key]]
                          : [];

                        return files.map((file, index) => {
                          const preview =
                            file.preview || file.document_url || "";
                          const name =
                            file.name || file.document_file_name || "Unnamed";
                          const isVideo =
                            file.type === "video" ||
                            file.file?.type?.startsWith("video/") ||
                            preview.endsWith(".mp4") ||
                            preview.endsWith(".webm") ||
                            preview.endsWith(".gif") ||
                            preview.endsWith(".ogg");

                          return (
                            <tr key={`${key}-${index}`}>
                              <td>{name}</td>
                              <td>
                                {isVideo ? (
                                  <video
                                    controls
                                    style={{ maxWidth: 100, maxHeight: 100 }}
                                    className="img-fluid rounded"
                                  >
                                    <source
                                      src={preview}
                                      type={
                                        file.file?.type ||
                                        `video/${preview.split(".").pop()}`
                                      }
                                    />
                                    Your browser does not support the video tag.
                                  </video>
                                ) : (
                                  <img
                                    style={{ maxWidth: 100, maxHeight: 100 }}
                                    className="img-fluid rounded"
                                    src={preview}
                                    alt={name}
                                  />
                                )}
                              </td>
                              <td>{file.ratio || label}</td>
                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2"
                                  onClick={() => discardImage(key, file)}
                                >
                                  x
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                  </table>
                </div>

                {/* {showUploader && (
                  <ProjectBannerUpload
                    onClose={() => setShowUploader(false)}
                    includeInvalidRatios={false}
                    selectedRatioProp={selectedCoverRatios}
                    showAsModal={true}
                    label={coverImageLabel}
                    description={dynamicDescription}
                    onContinue={(validImages) => handleCroppedImages(validImages, "cover")}
                  /> */}

                {/* Uploader Component */}
                {showUploader && (
                  <ProjectImageVideoUpload
                    onClose={() => setShowUploader(false)}
                    includeInvalidRatios={false}
                    selectedRatioProp={selectedCoverRatios}
                    showAsModal={true}
                    label={coverImageLabel}
                    description={dynamicDescription}
                    onContinue={(validImages, videoFiles) =>
                      handleCroppedCoverImages(validImages, "cover", videoFiles)
                    }
                    allowVideos={true}
                  />
                )}
              </div>

              <div className="d-flex justify-content-between align-items-end mx-1">
                <h5 className="mt-3">
                  Gallery Images{" "}
                  <span
                    className="tooltip-container"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    [i]
                    {showTooltip && (
                      <span className="tooltip-text">
                        Max Upload Size 3 MB and Required ratio is 16:9
                      </span>
                    )}
                  </span>
                  {/* <span style={{ color: "#de7008", fontSize: "16px" }}> *</span> */}
                </h5>

                {/* Category Dropdown and Add Button in one row */}
                <div className="d-flex align-items-center">
                  {/* Dropdown for Category Selection */}
                  {/* <div className="me-2">
                    <SelectBox
                      options={categoryTypes} // Already formatted in the correct format
                      defaultValue={selectedCategory}
                      onChange={(value) => setSelectedCategory(value)}
                    />
                  </div> */}

                  {/* Add Button */}
                </div>
                <button
                  className="purple-btn2 rounded-3"
                  fdprocessedid="xn3e6n"
                  type="button"
                  onClick={() => setShowGalleryModal(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-plus"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                  </svg>
                  <span>Add</span>
                </button>

                {showGalleryModal && (
                  <ProjectBannerUpload
                    onClose={() => setShowGalleryModal(false)}
                    selectedRatioProp={selectedGalleryRatios}
                    showAsModal={true}
                    label={galleryImageLabel}
                    description={dynamicDescription1}
                    onContinue={(validImages) =>
                      handleCroppedImages(validImages, "gallery")
                    }
                  />
                )}
                {/* <input
                  id="gallery_image"
                  type="file"
                  accept="image/*"
                  name="gallery_image"
                  onChange={handleImageUpload}
                  multiple
                  style={{ display: "none" }}
                /> */}
              </div>

              {/* Gallery Table */}
              <div className="col-md-12 mt-2">
                <div
                  className="mt-4 tbl-container"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  <table className="w-100">
                    <thead>
                      <tr>
                        {/* <th>Image Category</th> */}
                        <th>Image Name</th>
                        <th>Image</th>
                        <th>Ratio</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gallery_images.map(({ key, label }) => {
                        const files = formData[key] || [];

                        return files.map((file, index) => (
                          <tr key={`${key}-${index}`}>
                            <td>
                              <input
                                type="text"
                                className="form-control"
                                value={file.file_name || file.name || `Image ${index + 1}`}
                                onChange={(e) => handleGalleryImageNameChange(key, index, e.target.value)}
                                placeholder="Enter image name"
                                style={{
                                  border: "1px solid #ddd",
                                  borderRadius: "4px",
                                  padding: "5px 8px",
                                  fontSize: "14px",
                                  width: "100%"
                                }}
                              />
                              {/* <small className="text-muted">Ratio: {label}</small> */}
                            </td>
                            <td>
                              <img
                                style={{ maxWidth: 100, maxHeight: 100 }}
                                className="img-fluid rounded"
                                src={file.preview}
                                alt={file.file_name || file.name || `Gallery Image ${index + 1}`}
                              />
                            </td>
                            <td>{file.ratio || label}</td>
                            <td>
                              <button
                                type="button"
                                className="purple-btn2"
                                onClick={() => discardImage(key, file)}
                              >
                                x
                              </button>
                            </td>
                          </tr>
                        ));
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

             {baseURL !== "https://dev-panchshil-super-app.lockated.com/" && (
                  <>
                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Floor Plan{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Max Upload Size 3 MB and Required ratio is 16:9
                          </span>
                        )}
                      </span>
                    </h5>

                    {/* <button
                  className="purple-btn2 rounded-3"
                  fdprocessedid="xn3e6n"
                  onClick={() =>
                    document.getElementById("two_d_images").click()
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-plus"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                  </svg>
                  <span>Add</span>
                </button> */}
                    {/* <input
                  id="two_d_images"
                  className="form-control"
                  type="file"
                  name="two_d_images"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload("two_d_images", e.target.files)
                  }
                  multiple
                  style={{ display: "none" }}
                /> */}

                    <button
                      className="purple-btn2 rounded-3"
                      fdprocessedid="xn3e6n"
                      type="button"
                      onClick={() => setShowFloorPlanModal(true)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-plus"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                      </svg>
                      <span>Add</span>
                    </button>

                    {showFloorPlanModal && (
                      <ProjectBannerUpload
                        onClose={() => setShowFloorPlanModal(false)}
                        selectedRatioProp={selectedFloorRatios}
                        showAsModal={true}
                        label={floorImageLabel}
                        description={dynamicDescription2}
                        onContinue={(validImages) =>
                          handleCroppedImages(validImages, "floor")
                        }
                      />
                    )}
                  </div>

                  <div className="col-md-12 mt-2">
                    <div className="mt-4 tbl-container">
                      <table className="w-100">
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>Preview</th>
                            <th>Ratio</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {floorPlanRatios.map(({ key, label }) => {
                            const files = formData[key] || [];

                            return files.map((file, index) => (
                              <tr key={`${key}-${index}`}>
                                <td>{file.name}</td>
                                <td>
                                  <img
                                    style={{ maxWidth: 100, maxHeight: 100 }}
                                    className="img-fluid rounded"
                                    src={file.preview}
                                    alt={file.name}
                                  />
                                </td>
                                <td>{file.ratio || label}</td>
                                <td>
                                  <button
                                    type="button"
                                    className="purple-btn2"
                                    onClick={() => discardImage(key, file)}
                                  >
                                    x
                                  </button>
                                </td>
                              </tr>
                            ));
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
              {/* Brochure Upload */}
              <div className="d-flex justify-content-between align-items-end mx-1">
                <h5 className="mt-3">
                  Brochure{" "}
                  <span
                    className="tooltip-container"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    [i]
                    {showTooltip && (
                      <span className="tooltip-text">Max Upload Size 5 MB</span>
                    )}
                  </span>
                  {/* <span style={{ color: "#de7008", fontSize: "16px" }}> *</span> */}
                </h5>

                <button
                  className="purple-btn2 rounded-3"
                  fdprocessedid="xn3e6n"
                  onClick={() => document.getElementById("brochure").click()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-plus"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                  </svg>
                  <span>Add</span>
                </button>
                <input
                  id="brochure"
                  className="form-control"
                  type="file"
                  name="brochure"
                  accept=".pdf,.docx"
                  onChange={(e) => handleFileUpload("brochure", e.target.files)}
                  multiple // Add this to allow multiple file selection
                  style={{ display: "none" }}
                />
              </div>

              <div className="col-md-12 mt-2">
                <div className="mt-4 tbl-container">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.brochure.length > 0 ? (
                        formData.brochure.map((brochure, index) => (
                          <tr key={`brochures-${index}`}>
                            <td>{brochure.name}</td>
                            <td>
                              <button
                                type="button"
                                className="purple-btn2"
                                onClick={() =>
                                  handleDiscardFile("brochure", index)
                                }
                              >
                                x
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          {/* <td colSpan="2" className="text-center">No brochures uploaded</td> */}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {baseURL !== "https://dev-panchshil-super-app.lockated.com/" && (
                  <>
                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Project PPT{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Max Upload Size 5 MB
                          </span>
                        )}
                      </span>
                      {/* <span style={{ color: "#de7008", fontSize: "16px" }}>*</span> */}
                    </h5>

                    <button
                      className="purple-btn2 rounded-3"
                      onClick={() =>
                        document.getElementById("project_ppt").click()
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-plus"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                      </svg>
                      <span>Add</span>
                    </button>

                    <input
                      id="project_ppt"
                      className="form-control"
                      type="file"
                      name="project_ppt"
                      accept=".ppt, .pptx"
                      onChange={(e) =>
                        handleFileUpload("project_ppt", e.target.files)
                      }
                      multiple
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="col-md-12 mt-2">
                    <div className="mt-4 tbl-container">
                      <table className="w-100">
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.project_ppt.map((file, index) => (
                            <tr key={index}>
                              <td>{file.name}</td>
                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2"
                                  onClick={() =>
                                    handleDiscardPpt("project_ppt", index)
                                  }
                                >
                                  x
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 2D Images */}

                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Project Layout{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Max Upload Size 3 MB
                          </span>
                        )}
                      </span>
                      {/* <span style={{ color: "#de7008", fontSize: "16px" }}> *</span> */}
                    </h5>

                    <button
                      className="purple-btn2 rounded-3"
                      fdprocessedid="xn3e6n"
                      onClick={() =>
                        document.getElementById("project_layout").click()
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-plus"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                      </svg>
                      <span>Add</span>
                    </button>

                    <input
                      id="project_layout"
                      className="form-control"
                      type="file"
                      name="project_layout"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload("project_layout", e.target.files)
                      }
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="col-md-12 mt-2">
                    <div className="mt-4 tbl-container">
                      <table className="w-100">
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>Preview</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* 2D Images */}
                          {formData.project_layout.map((file, index) => (
                            <tr key={index}>
                              <td> {file.name}</td>
                              <td>
                                <img
                                  style={{ maxWidth: 100, maxHeight: 100 }}
                                  className="img-fluid rounded"
                                  src={
                                    file.type.startsWith("image")
                                      ? URL.createObjectURL(file)
                                      : null
                                  }
                                  alt=""
                                />
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2"
                                  onClick={() =>
                                    handleDiscardFile("project_layout", index)
                                  }
                                >
                                  x
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Project Creatives{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Max Upload Size 3 MB
                          </span>
                        )}
                      </span>
                      {/* <span style={{ color: "#de7008", fontSize: "16px" }}> *</span> */}
                    </h5>

                    <button
                      className="purple-btn2 rounded-3"
                      fdprocessedid="xn3e6n"
                      onClick={() =>
                        document.getElementById("project_creatives").click()
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-plus"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                      </svg>
                      <span>Add</span>
                    </button>
                    <input
                      id="project_creatives"
                      className="form-control"
                      type="file"
                      name="project_creatives"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload("project_creatives", e.target.files)
                      }
                      multiple
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="col-md-12 mt-2">
                    <div className="mt-4 tbl-container">
                      <table className="w-100">
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>Preview</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* 2D Images */}
                          {formData.project_creatives.map((file, index) => (
                            <tr key={index}>
                              <td> {file.name}</td>
                              <td>
                                <img
                                  style={{ maxWidth: 100, maxHeight: 100 }}
                                  className="img-fluid rounded"
                                  src={
                                    file.type.startsWith("image")
                                      ? URL.createObjectURL(file)
                                      : null
                                  }
                                  alt=""
                                />
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2"
                                  onClick={() =>
                                    handleDiscardFile(
                                      "project_creatives",
                                      index
                                    )
                                  }
                                >
                                  x
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Project Creative Generics{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Max Upload Size 3 MB
                          </span>
                        )}
                      </span>
                      {/* <span style={{ color: "#de7008", fontSize: "16px" }}> *</span> */}
                    </h5>

                    <button
                      className="purple-btn2 rounded-3"
                      fdprocessedid="xn3e6n"
                      onClick={() =>
                        document
                          .getElementById("project_creative_generics")
                          .click()
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-plus"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                      </svg>
                      <span>Add</span>
                    </button>
                    <input
                      id="project_creative_generics"
                      className="form-control"
                      type="file"
                      name="project_creative_generics"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          "project_creative_generics",
                          e.target.files
                        )
                      }
                      multiple
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="col-md-12 mt-2">
                    <div className="mt-4 tbl-container">
                      <table className="w-100">
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>Preview</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* 2D Images */}
                          {formData.project_creative_generics.map(
                            (file, index) => (
                              <tr key={index}>
                                <td> {file.name}</td>
                                <td>
                                  <img
                                    style={{ maxWidth: 100, maxHeight: 100 }}
                                    className="img-fluid rounded"
                                    src={
                                      file.type.startsWith("image")
                                        ? URL.createObjectURL(file)
                                        : null
                                    }
                                    alt=""
                                  />
                                </td>

                                <td>
                                  <button
                                    type="button"
                                    className="purple-btn2"
                                    onClick={() =>
                                      handleDiscardFile(
                                        "project_creative_generics",
                                        index
                                      )
                                    }
                                  >
                                    x
                                  </button>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Project Creative Offers{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Max Upload Size 3 MB
                          </span>
                        )}
                      </span>
                      {/* <span style={{ color: "#de7008", fontSize: "16px" }}> *</span> */}
                    </h5>

                    <button
                      className="purple-btn2 rounded-3"
                      fdprocessedid="xn3e6n"
                      onClick={() =>
                        document
                          .getElementById("project_creative_offers")
                          .click()
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-plus"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                      </svg>
                      <span>Add</span>
                    </button>
                    <input
                      id="project_creative_offers"
                      className="form-control"
                      type="file"
                      name="project_creative_offers"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload(
                          "project_creative_offers",
                          e.target.files
                        )
                      }
                      multiple
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="col-md-12 mt-2">
                    <div className="mt-4 tbl-container">
                      <table className="w-100">
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>Preview</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* 2D Images */}
                          {formData.project_creative_offers.map(
                            (file, index) => (
                              <tr key={index}>
                                <td> {file.name}</td>
                                <td>
                                  <img
                                    style={{ maxWidth: 100, maxHeight: 100 }}
                                    className="img-fluid rounded"
                                    src={
                                      file.type.startsWith("image")
                                        ? URL.createObjectURL(file)
                                        : null
                                    }
                                    alt=""
                                  />
                                </td>

                                <td>
                                  <button
                                    type="button"
                                    className="purple-btn2"
                                    onClick={() =>
                                      handleDiscardFile(
                                        "project_creative_offers",
                                        index
                                      )
                                    }
                                  >
                                    x
                                  </button>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Project Interiors{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Max Upload Size 3 MB
                          </span>
                        )}
                      </span>
                      {/* <span style={{ color: "#de7008", fontSize: "16px" }}> *</span> */}
                    </h5>

                    <button
                      className="purple-btn2 rounded-3"
                      fdprocessedid="xn3e6n"
                      onClick={() =>
                        document.getElementById("project_interiors").click()
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-plus"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                      </svg>
                      <span>Add</span>
                    </button>
                    <input
                      id="project_interiors"
                      className="form-control"
                      type="file"
                      name="project_interiors"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload("project_interiors", e.target.files)
                      }
                      multiple
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="col-md-12 mt-2">
                    <div className="mt-4 tbl-container">
                      <table className="w-100">
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>Preview</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* 2D Images */}
                          {formData.project_interiors.map((file, index) => (
                            <tr key={index}>
                              <td> {file.name}</td>
                              <td>
                                <img
                                  style={{ maxWidth: 100, maxHeight: 100 }}
                                  className="img-fluid rounded"
                                  src={
                                    file.type.startsWith("image")
                                      ? URL.createObjectURL(file)
                                      : null
                                  }
                                  alt=""
                                />
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2"
                                  onClick={() =>
                                    handleDiscardFile(
                                      "project_interiors",
                                      index
                                    )
                                  }
                                >
                                  x
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Project Exteriors{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Max Upload Size 3 MB
                          </span>
                        )}
                      </span>
                      {/* <span style={{ color: "#de7008", fontSize: "16px" }}> *</span> */}
                    </h5>

                    <button
                      className="purple-btn2 rounded-3"
                      fdprocessedid="xn3e6n"
                      onClick={() =>
                        document.getElementById("project_exteriors").click()
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-plus"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                      </svg>
                      <span>Add</span>
                    </button>
                    <input
                      id="project_exteriors"
                      className="form-control"
                      type="file"
                      name="project_exteriors"
                      accept="image/*"
                      onChange={(e) =>
                        handleFileUpload("project_exteriors", e.target.files)
                      }
                      multiple
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="col-md-12 mt-2">
                    <div className="mt-4 tbl-container">
                      <table className="w-100">
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>Preview</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* 2D Images */}
                          {formData.project_exteriors.map((file, index) => (
                            <tr key={index}>
                              <td> {file.name}</td>
                              <td>
                                <img
                                  style={{ maxWidth: 100, maxHeight: 100 }}
                                  className="img-fluid rounded"
                                  src={
                                    file.type.startsWith("image")
                                      ? URL.createObjectURL(file)
                                      : null
                                  }
                                  alt=""
                                />
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2"
                                  onClick={() =>
                                    handleDiscardFile(
                                      "project_exteriors",
                                      index
                                    )
                                  }
                                >
                                  x
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Project Emailer Template{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Max Upload Size 5 MB
                          </span>
                        )}
                      </span>
                      {/* <span style={{ color: "#de7008", fontSize: "16px" }}> *</span> */}
                    </h5>

                    <button
                      className="purple-btn2 rounded-3"
                      fdprocessedid="xn3e6n"
                      onClick={() =>
                        document
                          .getElementById("project_emailer_templetes")
                          .click()
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-plus"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                      </svg>
                      <span>Add</span>
                    </button>
                    <input
                      id="project_emailer_templetes"
                      className="form-control"
                      type="file"
                      name="project_emailer_templetes"
                      accept=".pdf,.docx"
                      onChange={(e) =>
                        handleFileUpload(
                          "project_emailer_templetes",
                          e.target.files
                        )
                      }
                      multiple // Add this to allow multiple file selection
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="col-md-12 mt-2">
                    <div className="mt-4 tbl-container">
                      <table className="w-100">
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.project_emailer_templetes.length > 0 ? (
                            formData.project_emailer_templetes.map(
                              (brochure, index) => (
                                <tr key={`brochure-${index}`}>
                                  <td>{brochure.name}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="purple-btn2"
                                      onClick={() =>
                                        handleDiscardFile(
                                          "project_emailer_templetes",
                                          index
                                        )
                                      }
                                    >
                                      x
                                    </button>
                                  </td>
                                </tr>
                              )
                            )
                          ) : (
                            <tr>
                              {/* <td colSpan="2" className="text-center">No brochures uploaded</td> */}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Videos{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Max Upload Size 10 MB
                          </span>
                        )}
                      </span>
                      {/* <span style={{ color: "#de7008", fontSize: "16px" }}> *</span> */}
                    </h5>

                    <button
                      className="purple-btn2 rounded-3"
                      onClick={() => document.getElementById("videos").click()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={16}
                        height={16}
                        fill="currentColor"
                        className="bi bi-plus"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                      </svg>
                      <span>Add</span>
                    </button>

                    <input
                      id="videos"
                      className="form-control"
                      type="file"
                      name="videos"
                      accept="video/*"
                      onChange={(e) =>
                        handleFileUpload("videos", e.target.files)
                      }
                      multiple
                      style={{ display: "none" }}
                    />
                  </div>

                  <div className="col-md-12 mt-2">
                    <div className="mt-4 tbl-container">
                      <table className="w-100">
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>Preview</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.videos.map((file, index) => (
                            <tr key={index}>
                              <td>{file.name}</td>
                              <td>
                                <video
                                  style={{ maxWidth: 100, maxHeight: 100 }}
                                  className="img-fluid rounded"
                                  autoPlay
                                  muted
                                  src={URL.createObjectURL(file)}
                                />
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2"
                                  onClick={() =>
                                    handleDiscardFile("videos", index)
                                  }
                                >
                                  x
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* <div className="col-md-3 mt-4">
                <div className="form-group">
                  <label>
                    Video Preview Image Url
                    <span
                      className="tooltip-container"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      [i]
                      {showTooltip && (
                        <span className="tooltip-text">
                          Max Upload Size 50 MB
                        </span>
                      )}
                    </span>
                    
                  </label>

                  <input
                    className="form-control"
                    type="file"
                    name="video_preview_image_url"
                    accept="image/*"
                    multiple
                    required
                    onChange={(e) => handleFileChange(e, "video_preview_image_url")}
                  />
                </div>
              </div> */}

                    <div className="d-flex justify-content-between align-items-end mx-1">
                      <div className="col-md-12 mt-2">
                        <div className="form-group">
                          <label>Video Preview Image Url</label>
                          <input
                            className="form-control"
                            rows={1}
                            name="video_preview_image_url"
                            placeholder="Enter Video Url"
                            value={formData.video_preview_image_url}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* <div className="d-flex justify-content-between align-items-end mx-1">
    <h5 className="mt-3">Project Creatives</h5>

   
    <div className="d-flex align-items-center">
       
        <div className="me-2">
        <SelectBox
            className="form-control w-100"
            value={selectedCreativeType}
            options={[
                { label: "Select Creative Type", value: "" },
                { label: "Brochure", value: "Brochure" },
                { label: "Floor Plan", value: "Floor Plan" },
                { label: "3D View", value: "3D View" },
                { label: "Other", value: "Other" }
            ]}
            onChange={(value) => setSelectedCreativeType(value)}
        />
    
        </div>

       
        <button
            className="purple-btn2 rounded-3"
            onClick={() => document.getElementById("project_creatives").click()}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
            </svg>
            <span>Add</span>
        </button>
    </div>

    <input
        id="project_creatives"
        className="form-control"
        type="file"
        accept=".jpg, .jpeg, .png, .gif, .webp, .mp4, .mov, .pdf, .ppt, .pptx"
        onChange={(e) => handleProjectCreativesUpload(e.target.files)}
        multiple
        style={{ display: "none" }}
    />
    <div className="col-md-12 mt-2">
        <div className="mt-4 tbl-container">
            <table className="w-100">
                <thead>
                    <tr>
                        <th>Creative Type</th>
                        <th>File Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {formData.project_creatives.map((item, index) => (
                        <tr key={index}>
                            <td>{item.type}</td>
                            <td>{item.file.name}</td>
                            <td>
                                <button
                                    type="button"
                                    className="purple-btn2"
                                    onClick={() => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            project_creatives: prev.project_creatives.filter((_, i) => i !== index),
                                        }));
                                    }}
                                >
                                    x
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
    
    
</div>


<div className="col-md-12 mt-2">
    <div className="mt-4 tbl-container">
        <table className="w-100">
            <thead>
                <tr>
                    <th>Creative Type</th>
                    <th>File Name</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {formData.project_creatives.map((item, index) => (
                    <tr key={index}>
                        <td>{item.type}</td>
                        <td>{item.file.name}</td>
                        <td>
                            <button
                                type="button"
                                className="purple-btn2"
                                onClick={() => {
                                    setFormData((prev) => ({
                                        ...prev,
                                        project_creatives: prev.project_creatives.filter((_, i) => i !== index),
                                    }));
                                }}
                            >
                                x
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
</div> */}
            </div>
          </div>
        </div>

         {baseURL !== "https://dev-panchshil-super-app.lockated.com/" && (
                  <>
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header3 d-flex justify-content-between align-items-center">
                <h3 className="card-title">Virtual Tour</h3>
              </div>
              <div className="card-body mt-0 pb-0">
                {/* Input Fields */}
                <div className="row align-items-center">
                  {/* Virtual Tour Name */}
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>Virtual Tour Name </label>
                      <input
                        className="form-control"
                        type="text"
                        name="virtual_tour_name"
                        placeholder="Enter Virtual Tour Name"
                        value={virtualTourName}
                        onChange={handleVirtualTourNameChange}
                      />
                    </div>
                  </div>

                  {/* Virtual Tour URL */}
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>Virtual Tour URL </label>
                      <input
                        className="form-control"
                        type="url"
                        name="virtual_tour_url"
                        placeholder="Enter Virtual Tour URL"
                        value={virtualTourUrl}
                        onChange={handleVirtualTourChange}
                      />
                    </div>
                  </div>

                  {/* Add Button */}
                  <div className="col-md-3 mt-2">
                    <button
                      className="purple-btn2 rounded-3"
                      style={{ marginTop: "23px" }}
                      onClick={handleAddVirtualTour}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={26}
                        height={20}
                        fill="currentColor"
                        className="bi bi-plus"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                      </svg>
                      <span> Add</span>
                    </button>
                  </div>
                </div>

                {/* Virtual Tour List Table */}
                {formData.virtual_tour_url_multiple.length > 0 && (
                  <div className="col-md-12 mt-2">
                    <div className="mt-4 tbl-container w-100">
                      <table className="w-100">
                        <thead>
                          <tr>
                            <th>Sr No</th>
                            <th>Tour Name</th>
                            <th>Tour URL</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.virtual_tour_url_multiple.map(
                            (tour, index) => (
                              <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{tour.virtual_tour_name}</td>
                                <td>{tour.virtual_tour_url}</td>
                                <td>
                                  <button
                                    type="button"
                                    className="purple-btn2"
                                    onClick={() =>
                                      handleDeleteVirtualTour(index)
                                    }
                                  >
                                    x
                                  </button>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="card-body mt-0 pb-0"></div>
        <div className="row mt-2 justify-content-center">
          <div className="col-md-2">
            <button
              onClick={handleSubmit}
              className="purple-btn2 w-100"
              disabled={loading}
            >
              Submit
            </button>
          </div>
          <div className="col-md-2">
            <button
              type="button"
              onClick={handleCancel}
              className="purple-btn2 w-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetailsCreate;
