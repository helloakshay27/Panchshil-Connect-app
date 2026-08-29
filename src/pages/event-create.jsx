import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import MultiSelectBox from "../components/base/MultiSelectBox";
import { baseURL } from "./baseurl/apiDomain";
import { ImageUploadingButton } from "../components/reusable/ImageUploadingButton";
import { ImageCropper } from "../components/reusable/ImageCropper";
import ProjectBannerUpload from "../components/reusable/ProjectBannerUpload";
import ProjectImageVideoUpload from "../components/reusable/ProjectImageVideoUpload";
import { useConnectEvents } from "../hooks/useConnectEvents";
import EventFormSteps from "../components/events/EventFormSteps";

const DATA_TYPE_OPTIONS = [
  { value: "bookedClients", label: "Booked Clients" },
  { value: "visitDoneLostClients", label: "Visit Done Lost Clients" },
  { value: "lostLeads", label: "Lost Leads" },
  { value: "cp", label: "CP" },
];

const EventCreate = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    event_type: "",
    title: "",
    event_name: "",
    event_at: "",
    from_time: "",
    to_time: "",
    rsvp_action: "",
    description: "",
    publish: "",
    comment: "",
    location_url: "",
    pay_at: "",
    payment_link: "",
    attachfile: [],
    cover_image: [],
    is_important: "",
    email_trigger_enabled: "",
    salesforce_data_retention_days: "",
    creation_email_attachment: null,
    reminder_email_attachment: null,
    set_reminders_attributes: [],
    cover_image_1_by_1: [],
    cover_image_9_by_16: [],
    cover_image_3_by_2: [],
    cover_image_16_by_9: [],
    event_images_1_by_1: [],
    event_images_9_by_16: [],
    event_images_3_by_2: [],
    event_images_16_by_9: [],
    thumbnail_images_1_by_1: [],
    thumbnail_images_9_by_16: [],
    thumbnail_images_3_by_2: [],
    thumbnail_images_16_by_9: [],
  });

  console.log("formData", formData);
  const [eventType, setEventType] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [dataType, setDataType] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [step, setStep] = useState("details");
  const [imageConfigurations, setImageConfigurations] = useState({});

  // Enhanced reminder state
  const [reminderValue, setReminderValue] = useState("");
  const [reminderUnit, setReminderUnit] = useState("");
  const [image, setImage] = useState([]);
  const [croppedImage, setCroppedImage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showAttachmentTooltip, setShowAttachmentTooltip] = useState(false);
  const [showCoverUploader, setShowCoverUploader] = useState(false);
  const [showEventUploader, setShowEventUploader] = useState(false);
  const [showThumbnailUploader, setShowThumbnailUploader] = useState(false);
  const previewUrlsRef = useRef(new Map()); // Store preview URLs for cleanup
  const creationAttachmentInputRef = useRef(null);
  const reminderAttachmentInputRef = useRef(null);

  const timeOptions = [
    // { value: "", label: "Select Unit" },
    { value: "minutes", label: "Minutes" },
    { value: "hours", label: "Hours" },
    { value: "days", label: "Days" },
    { value: "weeks", label: "Weeks" },
  ];

  const timeConstraints = {
    minutes: { min: 0, max: 40320 },
    hours: { min: 0, max: 672 },
    days: { min: 0, max: 28 },
    weeks: { min: 0, max: 4 },
  };

  const coverImageRatios = [
    { key: "cover_image_1_by_1", label: "1:1" },
    { key: "cover_image_16_by_9", label: "16:9" },
    { key: "cover_image_9_by_16", label: "9:16" },
    { key: "cover_image_3_by_2", label: "3:2" },
  ];

  const eventImageRatios = [
    { key: "event_images_1_by_1", label: "1:1" },
    { key: "event_images_16_by_9", label: "16:9" },
    { key: "event_images_9_by_16", label: "9:16" },
    { key: "event_images_3_by_2", label: "3:2" },
  ];

  const thumbnailImageRatios = [
    { key: "thumbnail_images_1_by_1", label: "1:1" },
    { key: "thumbnail_images_16_by_9", label: "16:9" },
    { key: "thumbnail_images_9_by_16", label: "9:16" },
    { key: "thumbnail_images_3_by_2", label: "3:2" },
  ];

  const eventUploadConfig = {
    "cover image": ["16:9", "1:1", "9:16", "3:2"],
    "event images": ["16:9", "1:1", "9:16", "3:2"],
    "thumbnail image": ["16:9", "1:1", "9:16", "3:2"],
  };

  const coverImageType = "cover image";
  const selectedCoverRatios = eventUploadConfig[coverImageType] || [];
  const coverImageLabel = coverImageType.replace(/(^\w|\s\w)/g, (m) =>
    m.toUpperCase()
  );
  const dynamicCoverDescription = `Supports ${selectedCoverRatios.join(
    ", "
  )} aspect ratios`;

  const eventImageType = "event images";
  const selectedEventRatios = eventUploadConfig[eventImageType] || [];
  const eventImageLabel = eventImageType.replace(/(^\w|\s\w)/g, (m) =>
    m.toUpperCase()
  );
  const dynamicEventDescription = `Supports ${selectedEventRatios.join(
    ", "
  )} aspect ratios`;

  const thumbnailImageType = "thumbnail image";
  const selectedThumbnailRatios = eventUploadConfig[thumbnailImageType] || [];
  const thumbnailImageLabel = thumbnailImageType.replace(/(^\w|\s\w)/g, (m) =>
    m.toUpperCase()
  );
  const dynamicThumbnailDescription = `Supports ${selectedThumbnailRatios.join(
    ", "
  )} aspect ratios`;

  const updateFormData = (key, files) => {
    setFormData((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...files],
    }));
  };

  const handleCroppedImages = (validImages, type = "cover") => {
    if (!validImages || validImages.length === 0) {
      toast.error(
        `No valid ${type} image${
          ["cover", "event"].includes(type) ? "" : "s"
        } selected.`
      );
      return;
    }

    validImages.forEach((img) => {
      const formattedRatio = img.ratio.replace(":", "_by_");
      const prefix = type === "cover" ? "cover_image" : "event_images";
      const key = `${prefix}_${formattedRatio}`;
      updateFormData(key, [
        {
          file: img.file,
          name: img.file.name,
          preview: URL.createObjectURL(img.file),
          ratio: img.ratio,
          id: `${key}-${Date.now()}-${Math.random()}`, // Unique ID for each image
        },
      ]);
    });

    if (type === "cover") {
      setShowCoverUploader(false);
    } else {
      setShowEventUploader(false);
    }
  };

  const handleEventCroppedImages = (
    validImages,
    videoFiles = [],
    type = "cover"
  ) => {
    // Handle video files first
    if (videoFiles && videoFiles.length > 0) {
      videoFiles.forEach((video) => {
        const formattedRatio = video.ratio.replace(":", "_by_");
        const prefix = type === "cover" ? "cover_image" : "event_images";
        const key = `${prefix}_${formattedRatio}`;

        updateFormData(key, [
          {
            file: video.file,
            name: video.file.name,
            preview: URL.createObjectURL(video.file),
            ratio: video.ratio,
            type: "video",
            id: `${key}-${Date.now()}-${Math.random()}`,
          },
        ]);
      });

      if (type === "cover") {
        setShowCoverUploader(false);
      } else {
        setShowEventUploader(false);
      }
      return;
    }

    // Handle images
    if (!validImages || validImages.length === 0) {
      toast.error(`No valid ${type} files selected.`);
      return;
    }

    validImages.forEach((img) => {
      const formattedRatio = img.ratio.replace(":", "_by_");
      const prefix = type === "cover" ? "cover_image" : "event_images";
      const key = `${prefix}_${formattedRatio}`;
      updateFormData(key, [
        {
          file: img.file,
          name: img.file.name,
          preview: URL.createObjectURL(img.file),
          ratio: img.ratio,
          type: "image",
          id: `${key}-${Date.now()}-${Math.random()}`,
        },
      ]);
    });

    if (type === "cover") {
      setShowCoverUploader(false);
    } else {
      setShowEventUploader(false);
    }
  };

  const handleThumbnailCroppedImages = (validImages) => {
    if (!validImages || validImages.length === 0) {
      toast.error("No valid thumbnail images selected.");
      return;
    }

    validImages.forEach((img) => {
      const formattedRatio = img.ratio.replace(":", "_by_");
      const key = `thumbnail_images_${formattedRatio}`;
      updateFormData(key, [
        {
          file: img.file,
          name: img.file.name,
          preview: URL.createObjectURL(img.file),
          ratio: img.ratio,
          id: `${key}-${Date.now()}-${Math.random()}`,
        },
      ]);
    });

    setShowThumbnailUploader(false);
  };

  const closeModal = (type) => {
    let prefix = "";
    switch (type) {
      case "cover":
        prefix = coverImageType; // "gallery image"
        break;
      case "event":
        prefix = eventImageType; // "floor plan"
        break;
    }
  };

  const handleImageRemoval = (key, index) => {
    setFormData((prev) => {
      const updatedArray = (prev[key] || []).filter((_, i) => i !== index);
      return {
        ...prev,
        [key]: updatedArray.length > 0 ? updatedArray : [],
      };
    });
  };

  const handleAttachmentRemoval = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachfile: prev.attachfile.filter((_, i) => i !== index),
    }));
  };

  console.log("formData", formData);

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

  // Set Reminders
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [reminders, setReminders] = useState([]);

  const handleAddReminder = () => {
    if (!reminderValue || !reminderUnit) return;

    const newReminder = {
      value: reminderValue,
      unit: reminderUnit,
    };

    setFormData((prevFormData) => ({
      ...prevFormData,
      set_reminders_attributes: [
        ...prevFormData.set_reminders_attributes,
        newReminder,
      ],
    }));

    setReminderValue("");
    setReminderUnit("");
  };

  const handleRemoveReminder = (index) => {
    setFormData((prevFormData) => {
      const reminders = [...prevFormData.set_reminders_attributes];

      // Check if the reminder has an ID (existing reminder)
      if (reminders[index]?.id) {
        // Mark the reminder for deletion by adding `_destroy: true`
        reminders[index]._destroy = true;
      } else {
        // Remove the reminder directly if it's a new one
        reminders.splice(index, 1);
      }

      return {
        ...prevFormData,
        set_reminders_attributes: reminders,
      };
    });
  };

  // Convert reminders to API format before submission. Also folds in
  // whatever is currently typed into the Unit/Value inputs but was never
  // committed with "+ Add" — without this, filling those fields and going
  // straight to Submit silently drops the reminder, since it never made it
  // into formData.set_reminders_attributes.
  const prepareRemindersForSubmission = () => {
    const pending =
      reminderValue && reminderUnit
        ? [{ value: reminderValue, unit: reminderUnit }]
        : [];
    return [...formData.set_reminders_attributes, ...pending]
      .map((reminder) => {
        if (reminder._destroy) {
          return { id: reminder.id, _destroy: true };
        }
        const baseReminder = { id: reminder.id };
        if (reminder.unit === "days") {
          baseReminder.days = Number(reminder.value);
        } else if (reminder.unit === "hours") {
          baseReminder.hours = Number(reminder.value);
        } else if (reminder.unit === "minutes") {
          baseReminder.minutes = Number(reminder.value);
        } else if (reminder.unit === "weeks") {
          baseReminder.weeks = Number(reminder.value);
        }
        return baseReminder;
      })
      .filter((r) => !r._destroy || r.id);
  };

  // Handle input change for form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // from_time / to_time are stored as "YYYY-MM-DD" (date only) or
  // "YYYY-MM-DDTHH:MM" (date + time), so the date survives when the
  // time is cleared.
  const getDatePart = (value) => (value ? value.slice(0, 10) : "");
  const getTimePart = (value) =>
    value && value.length > 10 ? value.slice(11, 16) : "";

  const handleDateTimeChange = (field, part, partValue) => {
    setFormData((prev) => {
      const date = part === "date" ? partValue : getDatePart(prev[field]);
      const time = part === "time" ? partValue : getTimePart(prev[field]);
      let combined = "";
      if (date && time) combined = `${date}T${time}`;
      else if (date) combined = date;
      return { ...prev, [field]: combined };
    });
  };

  //for files into array
  const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB
  const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"];

    for (let file of selectedFiles) {
      const isImage = allowedImageTypes.includes(file.type);
      const isVideo = allowedVideoTypes.includes(file.type);

      // Type validation
      if (!isImage && !isVideo) {
        toast.error(
          `Invalid file type "${file.name}". Only JPG, PNG, GIF, WebP (images) or MP4, WebM, OGG (videos) allowed.`
        );
        e.target.value = "";
        return;
      }

      // Size validation
      if (isImage && file.size > MAX_IMAGE_SIZE) {
        toast.error("Image size must be less than 3MB");
        e.target.value = "";
        return;
      }

      if (isVideo && file.size > MAX_VIDEO_SIZE) {
        toast.error("Video size must be less than 10MB");
        e.target.value = "";
        return;
      }
    }

    // All files are valid ✅
    setFormData((prevFormData) => ({
      ...prevFormData,
      attachfile: [...prevFormData.attachfile, ...selectedFiles],
    }));
  };

  useEffect(() => {
    console.log("Updated attachfile:", formData.attachfile);
  }, [formData.attachfile]);

  const handleRadioChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Update the state with the radio button's value
    }));
  };

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const fileData = selectedFiles.map((file) => ({
      file: file,
      name: file.name,
      type: file.type,
      url: file.type.startsWith("image") ? URL.createObjectURL(file) : null,
    }));
    setFiles([...files, ...fileData]);
  };

  const MAX_SELECTABLE_PROJECTS = 2;

  const handleProjectsMultiSelectChange = (selectedOptions) => {
    const opts = selectedOptions || [];
    if (opts.length > MAX_SELECTABLE_PROJECTS) {
      toast.error(`You can select up to ${MAX_SELECTABLE_PROJECTS} projects only.`);
      return;
    }
    setSelectedProjectIds(opts.map((opt) => opt.value));
  };

  const handleCreationEmailAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      creation_email_attachment: {
        file,
        name: file.name,
        preview: URL.createObjectURL(file),
      },
    }));
  };

  const handleReminderEmailAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({
      ...prev,
      reminder_email_attachment: {
        file,
        name: file.name,
        preview: URL.createObjectURL(file),
      },
    }));
  };

  const validateDetailsStep = () => {
    const errors = [];
    if (!formData.event_name) errors.push("Event Name is required.");
    if (selectedProjectIds.length === 0) errors.push("Please select at least one project.");
    else if (selectedProjectIds.length > MAX_SELECTABLE_PROJECTS)
      errors.push(`You can select up to ${MAX_SELECTABLE_PROJECTS} projects only.`);
    if (dataType.length === 0) errors.push("Please select at least one data type.");
    return errors;
  };

  const validateImagesStep = () => {
    const errors = [];
    if (!formData.creation_email_attachment) {
      errors.push("Event Creation Email Attachment is required.");
    }
    if (!formData.reminder_email_attachment) {
      errors.push("Event Reminder Email Attachment is required.");
    }
    return errors;
  };

  const validateForm = () => [...validateDetailsStep(), ...validateImagesStep()];

  const goToStep = (nextStep) => {
    if (nextStep === "images" || nextStep === "preview") {
      const errors = validateDetailsStep();
      if (errors.length > 0) {
        errors.forEach((err) => toast.error(err));
        return;
      }
    }
    if (nextStep === "preview") {
      const errors = validateImagesStep();
      if (errors.length > 0) {
        errors.forEach((err) => toast.error(err));
        return;
      }
    }
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    // const hasProjectBanner1by1 =
    //   formData.cover_image_16_by_9 &&
    //   formData.cover_image_16_by_9.some((img) => img.file instanceof File);

    // const hasEventBanner1by1 =
    //   formData.event_images_16_by_9 &&
    //   formData.event_images_16_by_9.some((img) => img.file instanceof File);

    // if (!hasProjectBanner1by1) {
    //   toast.error("Cover Image with 16:9 ratio is required.");
    //   setLoading(false);
    //   setIsSubmitting(false);
    //   return;
    // }

    // if (!hasEventBanner1by1) {
    //   toast.error("Event Image with 16:9 ratio is required.");
    //   setLoading(false);
    //   setIsSubmitting(false);
    //   return;
    // }

    const preparedReminders = prepareRemindersForSubmission();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append("event[pay_at]", formData.pay_at);
    data.append("event[event_name]", formData.event_name);
    data.append("event[payment_link]", formData.payment_link || "");
    data.append("event[event_title]", formData.title || "");
    if (formData.event_at) data.append("event[event_at]", formData.event_at);
    if (formData.from_time) {
      const fromTimeValue = formData.from_time.includes("T") ? formData.from_time : `${formData.from_time}T00:00`;
      data.append("event[from_time]", fromTimeValue);
    }
    if (formData.to_time) {
      const toTimeValue = formData.to_time.includes("T") ? formData.to_time : `${formData.to_time}T00:00`;
      data.append("event[to_time]", toTimeValue);
    }
    data.append("event[rsvp_action]", formData.rsvp_action);
    data.append("event[description]", formData.description);
    data.append("event[publish]", formData.publish);
    data.append("event[comment]", formData.location_url);
    data.append("event[is_important]", formData.is_important);
    data.append("event[email_trigger_enabled]", formData.email_trigger_enabled);
    if (formData.salesforce_data_retention_days) {
      data.append(
        "event[salesforce_data_retention_days]",
        formData.salesforce_data_retention_days
      );
    }

    // Primary project is the first selected one; every selected project
    // (with its Salesforce project id) goes into event_projects_attributes,
    // all sharing the single data type chosen above.
    data.append("event[project_id]", selectedProjectIds[0] || "");
    selectedProjectIds.forEach((projectId, index) => {
      const projectMeta = projects.find(
        (p) => String(p.id) === String(projectId)
      );
      const projectSfdcId =
        projectMeta?.sfdc_id ||
        projectMeta?.SFDC_Project_Id ||
        projectMeta?.project_sfdc_id ||
        "";
      data.append(
        `event[event_projects_attributes][${index}][project_id]`,
        projectId
      );
      data.append(
        `event[event_projects_attributes][${index}][project_sfdc_id]`,
        projectSfdcId
      );
      dataType.forEach((dt) => {
        data.append(
          `event[event_projects_attributes][${index}][data_types][]`,
          dt
        );
      });
    });

    if (formData.creation_email_attachment?.file) {
      data.append(
        "event[creation_email_attachment]",
        formData.creation_email_attachment.file
      );
    }
    if (formData.reminder_email_attachment?.file) {
      data.append(
        "event[reminder_email_attachment]",
        formData.reminder_email_attachment.file
      );
    }

    if (formData.cover_image && formData.cover_image.length > 0) {
      const file = formData.cover_image[0];
      if (file instanceof File) {
        data.append("event[cover_image]", file);
      }
    }

    if (formData.rsvp_action === "yes") {
      data.append("event[rsvp_name]", formData.rsvp_name);
      data.append("event[rsvp_number]", formData.rsvp_number);
    }

    // For coverImageRatios
    coverImageRatios.forEach(({ key }) => {
      const images = formData[key];
      if (Array.isArray(images) && images.length > 0) {
        const img = images[0]; // 👈 only the first image
        if (img?.file instanceof File) {
          data.append(`event[${key}]`, img.file); // 👈 flat key format
        }
      }
    });

    // For eventImageRatios
    eventImageRatios.forEach(({ key }) => {
      const images = formData[key];
      if (Array.isArray(images) && images.length > 0) {
        images.forEach((img) => {
          if (img?.file instanceof File) {
            data.append(`event[${key}][]`, img.file);
          }
        });
      }
    });

    // For thumbnailImageRatios
    thumbnailImageRatios.forEach(({ key }) => {
      const images = formData[key];
      if (Array.isArray(images) && images.length > 0) {
        images.forEach((img) => {
          if (img?.file instanceof File) {
            data.append(`event[${key}][]`, img.file);
          }
        });
      }
    });

    // Updated reminder data appending
    preparedReminders.forEach((reminder, index) => {
      if (reminder.id)
        data.append(
          `event[set_reminders_attributes][${index}][id]`,
          reminder.id
        );
      if (reminder._destroy) {
        data.append(`event[set_reminders_attributes][${index}][_destroy]`, "1");
      } else {
        if (reminder.days)
          data.append(
            `event[set_reminders_attributes][${index}][days]`,
            reminder.days
          );
        if (reminder.hours)
          data.append(
            `event[set_reminders_attributes][${index}][hours]`,
            reminder.hours
          );
        if (reminder.minutes)
          data.append(
            `event[set_reminders_attributes][${index}][minutes]`,
            reminder.minutes
          );
        if (reminder.weeks)
          data.append(
            `event[set_reminders_attributes][${index}][weeks]`,
            reminder.weeks
          );
      }
    });

    // if (formData.attachfile && formData.attachfile.length > 0) {
    //   formData.attachfile.forEach((file) => {
    //     if (file instanceof File) {
    //       data.append("event[event_images][]", file);
    //     } else {
    //       console.warn("Invalid file detected:", file);
    //     }
    //   });
    // } else {
    //   // toast.error("Attachment is required.");
    //   setLoading(false);
    //   return;
    // }

    console.log("dta to be sent:", Array.from(data.entries()));

    try {
      console.log("dta to be sent:", Array.from(data.entries()));

      const response = await axios.post(`${baseURL}events/create_event.json`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      connectEvents.onRecordSaved({ mode: "added" });
      toast.success("Event created successfully!");
      setStep("details");
      setSelectedProjectIds([]);
      setDataType([]);
      setFormData({
        title: "",
        pay_at: "",
        payment_link: "",
        event_name: "",
        event_at: "",
        from_time: "",
        to_time: "",
        rsvp_action: "",
        description: "",
        publish: "",
        comment: "",
        location_url: "",
        attachfile: [],
        cover_image: [],
        is_important: "",
        email_trigger_enabled: "",
        salesforce_data_retention_days: "",
        creation_email_attachment: null,
        reminder_email_attachment: null,
        set_reminders_attributes: [],
        cover_image_1_by_1: [],
        cover_image_9_by_16: [],
        cover_image_3_by_2: [],
        cover_image_16_by_9: [],
        event_images_1_by_1: [],
        event_images_9_by_16: [],
        event_images_3_by_2: [],
        event_images_16_by_9: [],
        thumbnail_images_1_by_1: [],
        thumbnail_images_9_by_16: [],
        thumbnail_images_3_by_2: [],
        thumbnail_images_16_by_9: [],
      });

      navigate("/event-list");
    } catch (error) {
      console.error("Error submitting the form:", error);
      if (error.response && error.response.data) {
        toast.error(
          `Error: ${error.response.data.message || "Submission failed"}`
        );
      } else {
        toast.error("Failed to submit the form. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      const url = `${baseURL}events.json`;

      try {
        const response = await axios.get(
          `${baseURL}events/create_event.json`,

          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        setEventType(response?.data?.events);
        console.log("eventType", eventType);
      } catch (error) {
        console.error("Error fetching Event:", error);
      }
    };

    fetchEvent();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${baseURL}projects/projects_for_events.json`,

          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        setProjects(
          Array.isArray(response.data)
            ? response.data
            : response.data.projects || []
        );
      } catch (error) {
        console.error(
          "Error fetching projects:",
          error.response?.data || error.message
        );
      }
    };

    fetchProjects();
  }, []);

  const handleCancel = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchImageConfigurations = async () => {
      try {
        const configNames = ["EventCoverImage", "EventImage", "EvenetThumbnailImage"];
        const configs = {};
        for (const name of configNames) {
          const response = await axios.get(
            `${baseURL}system_constants.json?q[description_eq]=ImagesConfiguration&q[name_eq]=${name}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            }
          );
          if (response.data && Array.isArray(response.data)) {
            configs[name] = response.data.map((item) => item.value);
          }
        }
        setImageConfigurations(configs);
      } catch (error) {
        console.error("Error fetching image configurations:", error);
      }
    };
    fetchImageConfigurations();
  }, []);

  const formatRatio = (value) => {
    if (!value) return "";
    const match = value.match(/(\d+)_by_(\d+)/);
    if (match) return `${match[1]}:${match[2]}`;
    return value;
  };

  const getDynamicRatiosText = (configName) => {
    const ratios = imageConfigurations[configName];
    if (!ratios || ratios.length === 0) return "";
    const formattedRatios = ratios.map(formatRatio).join(", ");
    return ` and Required ratio${ratios.length > 1 ? "s are" : " is"} ${formattedRatios}`;
  };

  const handleCoverImageUpload = (newImageList) => {
    if (!newImageList || newImageList.length === 0) return;

    const file = newImageList[0].file;
    if (!file) return;

    // Check if it's an image file
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.error("Please upload a valid image file");
      return;
    }

    // Check file size (3MB limit)
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image size must be less than 3MB");
      return;
    }

    setImage(newImageList);
    setDialogOpen(true);
  };

  const handleAttachmentUpload = (e) => {
    const files = Array.from(e.target.files);

    const newAttachments = files.map((file) => {
      const isVideo = file.type.includes("video") || file.name.endsWith(".mp4");
      return {
        file,
        name: file.name,
        type: file.type || (isVideo ? "video/mp4" : "image/jpeg"),
        preview: URL.createObjectURL(file),
        size: file.size,
      };
    });

    setFormData((prev) => ({
      ...prev,
      attachfile: [...(prev.attachfile || []), ...newAttachments],
    }));
  };

  return (
    <>
      <div className="main-content">
        <div className="" style={{ width: "100%" }}>
          <div className="module-data-section container-fluid">
            <div className="module-data-section p-3">
              <EventFormSteps current={step} onStepClick={goToStep} />

              {step === "details" && (
              <div className="card mt-4 pb-2 mx-4">
                <div className="card-header">
                  <h3 className="card-title">Create Event</h3>
                </div>

                <div className="card-body">
                  {error && <p className="text-danger">{error}</p>}
                  <div className="row">
                    <div className="col-md-6 mt-1">
                      <div className="form-group">
                        <label>
                          Projects
                          <span className="otp-asterisk"> *</span>
                        </label>
                        <MultiSelectBox
                          options={projects.map((proj) => ({
                            value: proj.id,
                            label: proj.name || proj.project_name,
                          }))}
                          value={selectedProjectIds.map((id) => {
                            const projectMeta = projects.find(
                              (p) => String(p.id) === String(id)
                            );
                            return {
                              value: id,
                              label:
                                projectMeta?.name ||
                                projectMeta?.project_name ||
                                `Project ${id}`,
                            };
                          })}
                          onChange={handleProjectsMultiSelectChange}
                          maxSelected={MAX_SELECTABLE_PROJECTS}
                        />
                      </div>
                    </div>

                    <div className="col-md-3 mt-1">
                      <div className="form-group">
                        <label>
                          Data Type
                          <span className="otp-asterisk"> *</span>
                        </label>
                        <MultiSelectBox
                          options={DATA_TYPE_OPTIONS}
                          value={DATA_TYPE_OPTIONS.filter((o) =>
                            dataType.includes(o.value)
                          )}
                          onChange={(selectedOptions) =>
                            setDataType((selectedOptions || []).map((opt) => opt.value))
                          }
                        />
                      </div>
                    </div>
                    {/* <div className="col-md-3 mt-1">
                      <div className="form-group">
                        <label>Event Type</label>
                        <input
                          className="form-control"
                          type="text"
                          name="event_type"
                          placeholder="Enter Event Type"
                          value={formData.event_type}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div> */}
                    <div className="col-md-3 mt-1">
                      <div className="form-group">
                        <label>Event Type (Internal/External)</label>
                        <SelectBox
                          options={[
                            { value: "", label: "Select Event Type" },
                            { value: "internal", label: "Internal" },
                            { value: "external", label: "External" },
                          ]}
                          value={formData.pay_at}
                          onChange={(val) => {
                            setFormData((prev) => ({
                              ...prev,
                              pay_at: val,
                              payment_link: "",
                            }));
                          }}
                          isDisableFirstOption={true}
                        />
                      </div>
                    </div>

                    {formData.pay_at === "external" && (
                      <div className="col-md-3 mt-1">
                        <div className="form-group">
                          <label>Event Link</label>
                          <input
                            className="form-control"
                            type="url"
                            name="payment_link"
                            placeholder="Enter Event Link"
                            value={formData.payment_link}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    )}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Event Name
                          <span className="otp-asterisk"> *</span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="event_name"
                          placeholder="Enter Event Name"
                          value={formData.event_name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Event Title</label>
                        <input
                          className="form-control"
                          type="text"
                          name="title"
                          placeholder="Enter Event Title"
                          value={formData.title}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                   
                    <div className="col-md-3 mt-1">
                      <div className="form-group">
                        <label>Event At</label>
                        <input
                          className="form-control"
                          type="text"
                          name="event_at"
                          placeholder="Enter Event At"
                          value={formData.event_at}
                          required
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                     <div className="col-md-3 mt-1">
                      <div className="form-group">
                        <label>Location URL</label>
                        <input
                          className="form-control"
                          type="url"
                          name="location_url"
                          placeholder="Enter Location URL"
                          value={formData.location_url}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Event From</label>
                        <div className="d-flex gap-2" style={{ flexWrap: "wrap" }}>
                          <input
                            className="form-control"
                            type="date"
                            name="from_date"
                            value={getDatePart(formData.from_time)}
                            onChange={(e) =>
                              handleDateTimeChange(
                                "from_time",
                                "date",
                                e.target.value
                              )
                            }
                            style={{ flex: "1 1 130px", minWidth: 0 }}
                          />
                          <input
                            className="form-control"
                            type="time"
                            name="from_time_part"
                            value={getTimePart(formData.from_time)}
                            onChange={(e) =>
                              handleDateTimeChange(
                                "from_time",
                                "time",
                                e.target.value
                              )
                            }
                            disabled={!getDatePart(formData.from_time)}
                            style={{ flex: "1 1 110px", minWidth: 0 }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Event To</label>
                        <div className="d-flex gap-2" style={{ flexWrap: "wrap" }}>
                          <input
                            className="form-control"
                            type="date"
                            name="to_date"
                            value={getDatePart(formData.to_time)}
                            onChange={(e) =>
                              handleDateTimeChange(
                                "to_time",
                                "date",
                                e.target.value
                              )
                            }
                            style={{ flex: "1 1 130px", minWidth: 0 }}
                          />
                          <input
                            className="form-control"
                            type="time"
                            name="to_time_part"
                            value={getTimePart(formData.to_time)}
                            onChange={(e) =>
                              handleDateTimeChange(
                                "to_time",
                                "time",
                                e.target.value
                              )
                            }
                            disabled={!getDatePart(formData.to_time)}
                            style={{ flex: "1 1 110px", minWidth: 0 }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3 mt-1">
                      <div className="form-group">
                        <label>Salesforce Data Retention Days</label>
                        <input
                          className="form-control"
                          type="number"
                          min="0"
                          name="salesforce_data_retention_days"
                          placeholder="e.g. 30"
                          value={formData.salesforce_data_retention_days}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Event Description</label>
                        <textarea
                          className="form-control"
                          rows={1}
                          name="description"
                          placeholder="Enter Description"
                          value={formData.description}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Attachment
                          <span
                            className="tooltip-container"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                          >
                            [i]
                            {showTooltip && (
                              <span className="tooltip-text">
                                Max Upload Size for video 10 MB and for image 3 MB
                              </span>
                            )}
                          </span>
                          <span />
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          name="attachfile"
                          accept="image/* video/*"
                          multiple
                          required
                          onChange={(e) => handleFileChange(e, "attachfile")}
                        />
                      </div>
                    </div> */}

                    {/* <div className="col-md-3 col-sm-6 col-12">
                      <div className="form-group">
                        <label className="d-flex align-items-center gap-1 mb-2">
                          <span>Cover Image</span>

                          <span
                            className="tooltip-container"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            style={{ cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            [i]
                            {showTooltip && (
                              <span
                                className="tooltip-text"
                                style={{
                                  marginLeft: '6px',
                                  background: '#f9f9f9',
                                  border: '1px solid #ccc',
                                  padding: '6px 8px',
                                  borderRadius: '4px',
                                  position: 'absolute',
                                  zIndex: 1000,
                                  fontSize: '13px',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                Max Upload Size 3 MB and Required ratio is 16:9
                              </span>
                            )}
                          </span>
                        </label>

                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowUploader(true)}
                          className="custom-upload-button input-upload-button"
                        >
                          <span
                            className="upload-button-label"
                          >
                            Choose file
                          </span>
                          <span
                            className="upload-button-value"
                          >
                            No file chosen
                          </span>
                        </span>

                        {showUploader && (
                          <ProjectBannerUpload
                            onClose={() => setShowUploader(false)}
                            includeInvalidRatios={false}
                            selectedRatioProp={selectedRatios}
                            showAsModal={true}
                            label={dynamicLabel}
                            description={dynamicDescription}
                            onContinue={handleCropComplete}
                          />
                        )}

                        <div className="mt-2">
                          {Array.isArray(formData.cover_image_16_by_9) &&
                            formData.cover_image_16_by_9.length > 0 ? (
                            formData.cover_image_16_by_9.map((file, index) => (
                              <div
                                key={index}
                                className="position-relative"
                                style={{ marginRight: "10px", marginBottom: "10px" }}
                              >
                                <img
                                  src={file.preview}
                                  alt={file.name}
                                  className="img-fluid rounded"
                                  style={{
                                    maxWidth: "100px",
                                    maxHeight: "100px",
                                    objectFit: "cover"
                                  }}
                                />
                              </div>
                            ))
                          ) : (
                            <span>No image selected</span>
                          )}
                        </div>
                      </div>
                    </div> */}

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Mark Important</label>
                        <div className="d-flex">
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="is_important"
                              value="true"
                              checked={formData.is_important === true}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  is_important: true,
                                }))
                              }
                            />
                            <label
                              className="form-check-label"
                              style={{ color: "black" }}
                            >
                              Yes
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="is_important"
                              value="false"
                              checked={formData.is_important === false}
                              onChange={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  is_important: false,
                                }))
                              }
                            />
                            <label
                              className="form-check-label"
                              style={{ color: "black" }}
                            >
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>Send Email
                            <span className="otp-asterisk"> *</span>
                        </label>
                        <div className="d-flex">
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="email_trigger_enabled"
                              value="true"
                              checked={
                                formData.email_trigger_enabled === "true"
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  email_trigger_enabled: e.target.value, // Store "true" as string
                                }))
                              }
                              required
                            />
                            <label
                              className="form-check-label"
                              style={{ color: "black" }}
                            >
                              Yes
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="email_trigger_enabled"
                              value="false"
                              checked={
                                formData.email_trigger_enabled === "false"
                              }
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  email_trigger_enabled: e.target.value, // Store "false" as string
                                }))
                              }
                              required
                            />
                            <label
                              className="form-check-label"
                              style={{ color: "black" }}
                            >
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    </div> */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>RSVP Action</label>
                        <div className="d-flex">
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="rsvp_action"
                              value="yes"
                              checked={formData.rsvp_action === "yes"}
                              onChange={handleChange}
                              required
                            />
                            <label
                              className="form-check-label"
                              style={{ color: "black" }}
                            >
                              Yes
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="rsvp_action"
                              value="no"
                              checked={formData.rsvp_action === "no"}
                              onChange={handleChange}
                              required
                            />
                            <label
                              className="form-check-label"
                              style={{ color: "black" }}
                            >
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.rsvp_action === "yes" && (
                      <>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label>RSVP Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter RSVP Name"
                              name="rsvp_name"
                              value={formData.rsvp_name || ""}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label>RSVP Number</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Enter RSVP Number"
                              name="rsvp_number"
                              value={formData.rsvp_number || ""}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="col-md-6">
                      <label className="form-label">Set Reminders</label>

                      {/* Input fields for adding new reminders */}
                      <div className="row mb-2">
                        <div className="col-md-4">
                          <SelectBox
                            options={timeOptions}
                            value={reminderUnit || ""}
                            onChange={(value) => {
                              setReminderUnit(value);
                              setReminderValue("");
                            }}
                          />
                        </div>
                        <div className="col-md-4">
                          <input
                            type="number"
                            className="form-control"
                            placeholder="Value"
                            value={reminderValue}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const unit = reminderUnit;
                              const constraints = timeConstraints[unit] || {
                                min: 0,
                                max: Infinity,
                              };
                              if (
                                val >= constraints.min &&
                                val <= constraints.max
                              ) {
                                setReminderValue(e.target.value);
                              }
                            }}
                            min={timeConstraints[reminderUnit]?.min || 0}
                            max={timeConstraints[reminderUnit]?.max || ""}
                            title={
                              reminderUnit
                                ? `Must be between ${timeConstraints[reminderUnit].min} to ${timeConstraints[reminderUnit].max} ${reminderUnit}`
                                : "Please select a time unit first"
                            }
                            disabled={!reminderUnit}
                          />
                        </div>

                        <div className="col-md-4">
                          <button
                            type="button"
                            className="btn btn-danger w-100"
                            onClick={handleAddReminder}
                            disabled={!reminderValue || !reminderUnit}
                            style={{
                              height: "35px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            + Add
                          </button>
                        </div>
                      </div>

                      {/* Display added reminders. Map to {reminder, originalIndex}
                          before filtering, so handleRemoveReminder(originalIndex)
                          still targets the right entry in the unfiltered
                          set_reminders_attributes array if a reminder is ever
                          soft-deleted (_destroy: true, but left in place). */}
                      {formData.set_reminders_attributes
                        .map((reminder, originalIndex) => ({ reminder, originalIndex }))
                        .filter(({ reminder }) => !reminder._destroy)
                        .map(({ reminder, originalIndex }) => (
                          <div className="row mb-2" key={originalIndex}>
                            <div className="col-md-4">
                              <select
                                className="form-control"
                                value={reminder.unit}
                                disabled
                                style={{ backgroundColor: "#f8f9fa" }}
                              >
                                {timeOptions.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-md-4">
                              <input
                                type="number"
                                className="form-control"
                                value={reminder.value}
                                readOnly
                                style={{ backgroundColor: "#f8f9fa" }}
                              />
                            </div>

                            <div className="col-md-4">
                              <button
                                type="button"
                                className="btn btn-danger w-100"
                                onClick={() => handleRemoveReminder(originalIndex)}
                                style={{
                                  height: "35px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>

                  </div>
                </div>
              </div>
              )}

              {step === "images" && (
              <div className="card mt-3 pb-4 mx-4">
                <div className="card-header3">
                  <h3 className="card-title">File Upload</h3>
                </div>
                <div className="card-body mt-0 pb-0">
                  <div className="row"></div>

                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Event Cover Image{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Max Upload Size 3 MB{getDynamicRatiosText("EventCoverImage")}
                          </span>
                        )}
                      </span>
                    </h5>
                    <button
                      className="purple-btn2 rounded-3"
                      type="button"
                      onClick={() => setShowCoverUploader(true)}
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
                    {showCoverUploader && (
                      <ProjectBannerUpload
                        onClose={() => setShowCoverUploader(false)}
                        includeInvalidRatios={false}
                        selectedRatioProp={selectedCoverRatios}
                        showAsModal={true}
                        label={coverImageLabel}
                        description={dynamicCoverDescription}
                        onContinue={(validImages) =>
                          handleCroppedImages(validImages, "cover")
                        }
                      />
                    )}
                  </div>
                  <div className="col-md-12 mt-2">
                    <div
                      className="mt-4 tbl-container"
                      style={{ maxHeight: "300px", overflowY: "auto" }}
                    >
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
                          {coverImageRatios.flatMap(({ key, label }) => {
                            const files = Array.isArray(formData[key])
                              ? formData[key]
                              : formData[key]
                              ? [formData[key]]
                              : [];

                            if (files.length === 0) return [];

                            return files.map((file, index) => {
                              const preview =
                                file.preview || file.document_url || "";
                              const name =
                                file.name ||
                                file.document_file_name ||
                                `Image ${index + 1}`;
                              const ratio = file.ratio || label;

                              return (
                                <tr key={`${key}-${file.id || index}`}>
                                  <td>{name}</td>
                                  <td>
                                    {preview ? (
                                      <img
                                        style={{
                                          maxWidth: 100,
                                          maxHeight: 100,
                                          objectFit: "cover",
                                        }}
                                        className="img-fluid rounded"
                                        src={preview}
                                        alt={name}
                                        onError={(e) => {
                                          console.error(
                                            `Failed to load image: ${preview}`
                                          );
                                          e.target.src =
                                            "https://via.placeholder.com/100?text=Preview+Failed";
                                        }}
                                      />
                                    ) : (
                                      <span>No Preview Available</span>
                                    )}
                                  </td>
                                  <td>{ratio}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="purple-btn2"
                                      onClick={() =>
                                        handleImageRemoval(key, index, file.id)
                                      }
                                    >
                                      x
                                    </button>
                                  </td>
                                </tr>
                              );
                            });
                          })}

                          {coverImageRatios.every(
                            ({ key }) =>
                              !(formData[key] && formData[key].length > 0)
                          ) && (
                            <tr>
                              {/* <td colSpan="4" className="text-center">No cover images uploaded</td> */}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Event Attachment{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowAttachmentTooltip(true)}
                        onMouseLeave={() => setShowAttachmentTooltip(false)}
                      >
                        [i]
                        {showAttachmentTooltip && (
                          <span className="tooltip-text">
                            Max Upload Size 3 MB{getDynamicRatiosText("EventImage")}
                          </span>
                        )}
                      </span>
                    </h5>
                    <button
                      className="purple-btn2 rounded-3"
                      type="button"
                      onClick={() => setShowEventUploader(true)}
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
                    {showEventUploader && (
                      <ProjectImageVideoUpload
                        onClose={() => setShowEventUploader(false)}
                        includeInvalidRatios={false}
                        selectedRatioProp={selectedEventRatios}
                        showAsModal={true}
                        label={eventImageLabel}
                        description={dynamicEventDescription}
                        onContinue={(validImages, videoFiles) =>
                          handleEventCroppedImages(
                            validImages,
                            videoFiles,
                            "event"
                          )
                        }
                        allowVideos={true}
                      />
                    )}
                  </div>
                  <div className="col-md-12 mt-2">
                    <div
                      className="mt-4 tbl-container"
                      style={{ maxHeight: "300px", overflowY: "auto" }}
                    >
                      <table className="w-100">
                        <thead>
                          <tr>
                            <th>File Name</th>
                            <th>Preview</th>
                            <th>Ratio</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        {/* <tbody>
                          {eventImageRatios.map(({ key, label }) =>
                            (formData[key] || []).length > 0
                              ? formData[key].map((file, index) => (
                                  <tr key={`${key}-${file.id}`}>
                                    <td>{file.name || "Unnamed File"}</td>
                                    <td>
                                      {file.preview ? (
                                        <img
                                          style={{
                                            maxWidth: 100,
                                            maxHeight: 100,
                                            objectFit: "cover",
                                          }}
                                          className="img-fluid rounded"
                                          src={file.preview}
                                          alt={file.name || "Event Image"}
                                          onError={(e) => {
                                            console.error(
                                              `Failed to load image: ${file.preview}`
                                            );
                                            e.target.src =
                                              "https://via.placeholder.com/100?text=Preview+Failed";
                                          }}
                                        />
                                      ) : (
                                        <span>No Preview Available</span>
                                      )}
                                    </td>
                                    <td>{file.ratio || label}</td>
                                    <td>
                                      <button
                                        type="button"
                                        className="purple-btn2"
                                        onClick={() =>
                                          handleImageRemoval(key, index)
                                        }
                                      >
                                        x
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              : null
                          )}
                          {eventImageRatios.every(
                            ({ key }) => (formData[key] || []).length === 0
                          ) && (
                            <tr>
                             
                            </tr>
                          )}
                        </tbody> */}

                        <tbody>
                          {eventImageRatios.map(({ key, label }) =>
                            (formData[key] || []).length > 0
                              ? formData[key].map((file, index) => {
                                  const isVideo =
                                    file.type === "video" ||
                                    (file.file &&
                                      file.file.type.startsWith("video/")) ||
                                    (file.preview &&
                                      [".mp4", ".webm", ".ogg"].some((ext) =>
                                        file.preview.toLowerCase().endsWith(ext)
                                      ));

                                  return (
                                    <tr key={`${key}-${file.id}`}>
                                      <td>{file.name || "Unnamed File"}</td>
                                      <td>
                                        {isVideo ? (
                                          <video
                                            controls
                                            style={{
                                              maxWidth: 100,
                                              maxHeight: 100,
                                              objectFit: "cover",
                                            }}
                                            className="img-fluid rounded"
                                          >
                                            <source
                                              src={file.preview}
                                              type={
                                                file.file?.type || "video/mp4"
                                              }
                                            />
                                            Your browser does not support the
                                            video tag.
                                          </video>
                                        ) : (
                                          <img
                                            style={{
                                              maxWidth: 100,
                                              maxHeight: 100,
                                              objectFit: "cover",
                                            }}
                                            className="img-fluid rounded"
                                            src={file.preview}
                                            alt={file.name || "Event Image"}
                                            onError={(e) => {
                                              console.error(
                                                `Failed to load image: ${file.preview}`
                                              );
                                              e.target.src =
                                                "https://via.placeholder.com/100?text=Preview+Failed";
                                            }}
                                          />
                                        )}
                                      </td>
                                      <td>{file.ratio || label}</td>
                                      <td>
                                        <button
                                          type="button"
                                          className="purple-btn2"
                                          onClick={() =>
                                            handleImageRemoval(key, index)
                                          }
                                        >
                                          x
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              : null
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Event Thumbnail Image{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Max Upload Size 3 MB{getDynamicRatiosText("EvenetThumbnailImage")}
                          </span>
                        )}
                      </span>
                    </h5>
                    <button
                      className="purple-btn2 rounded-3"
                      type="button"
                      onClick={() => setShowThumbnailUploader(true)}
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
                    {showThumbnailUploader && (
                      <ProjectBannerUpload
                        onClose={() => setShowThumbnailUploader(false)}
                        includeInvalidRatios={false}
                        selectedRatioProp={selectedThumbnailRatios}
                        showAsModal={true}
                        label={thumbnailImageLabel}
                        description={dynamicThumbnailDescription}
                        onContinue={(validImages) =>
                          handleThumbnailCroppedImages(validImages)
                        }
                      />
                    )}
                  </div>
                  <div className="col-md-12 mt-2">
                    <div
                      className="mt-4 tbl-container"
                      style={{ maxHeight: "300px", overflowY: "auto" }}
                    >
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
                          {thumbnailImageRatios.flatMap(({ key, label }) => {
                            const files = Array.isArray(formData[key])
                              ? formData[key]
                              : formData[key]
                              ? [formData[key]]
                              : [];

                            if (files.length === 0) return [];

                            return files.map((file, index) => {
                              const preview =
                                file.preview || file.document_url || "";
                              const name =
                                file.name ||
                                file.document_file_name ||
                                `Image ${index + 1}`;
                              const ratio = file.ratio || label;

                              return (
                                <tr key={`${key}-${file.id || index}`}>
                                  <td>{name}</td>
                                  <td>
                                    {preview ? (
                                      <img
                                        style={{
                                          maxWidth: 100,
                                          maxHeight: 100,
                                          objectFit: "cover",
                                        }}
                                        className="img-fluid rounded"
                                        src={preview}
                                        alt={name}
                                        onError={(e) => {
                                          console.error(
                                            `Failed to load image: ${preview}`
                                          );
                                          e.target.src =
                                            "https://via.placeholder.com/100?text=Preview+Failed";
                                        }}
                                      />
                                    ) : (
                                      <span>No Preview Available</span>
                                    )}
                                  </td>
                                  <td>{ratio}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="purple-btn2"
                                      onClick={() =>
                                        handleImageRemoval(key, index, file.id)
                                      }
                                    >
                                      x
                                    </button>
                                  </td>
                                </tr>
                              );
                            });
                          })}

                          {thumbnailImageRatios.every(
                            ({ key }) =>
                              !(formData[key] && formData[key].length > 0)
                          ) && (
                            <tr></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Event Creation Email Attachment
                      <span className="otp-asterisk"> *</span>
                    </h5>
                    <button
                      className="purple-btn2 rounded-3"
                      type="button"
                      onClick={() => creationAttachmentInputRef.current?.click()}
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
                      ref={creationAttachmentInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleCreationEmailAttachmentChange}
                    />
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
                          {formData.creation_email_attachment ? (
                            <tr>
                              <td>{formData.creation_email_attachment.name}</td>
                              <td>
                                <img
                                  src={formData.creation_email_attachment.preview}
                                  alt={formData.creation_email_attachment.name}
                                  className="img-fluid rounded"
                                  style={{ maxWidth: 100, maxHeight: 100, objectFit: "cover" }}
                                />
                              </td>
                              <td>N/A</td>
                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      creation_email_attachment: null,
                                    }))
                                  }
                                >
                                  x
                                </button>
                              </td>
                            </tr>
                          ) : (
                            <tr></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Event Reminder Email Attachment
                      <span className="otp-asterisk"> *</span>
                    </h5>
                    <button
                      className="purple-btn2 rounded-3"
                      type="button"
                      onClick={() => reminderAttachmentInputRef.current?.click()}
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
                      ref={reminderAttachmentInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleReminderEmailAttachmentChange}
                    />
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
                          {formData.reminder_email_attachment ? (
                            <tr>
                              <td>{formData.reminder_email_attachment.name}</td>
                              <td>
                                <img
                                  src={formData.reminder_email_attachment.preview}
                                  alt={formData.reminder_email_attachment.name}
                                  className="img-fluid rounded"
                                  style={{ maxWidth: 100, maxHeight: 100, objectFit: "cover" }}
                                />
                              </td>
                              <td>N/A</td>
                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      reminder_email_attachment: null,
                                    }))
                                  }
                                >
                                  x
                                </button>
                              </td>
                            </tr>
                          ) : (
                            <tr></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {step === "preview" && (
              <div className="card mt-4 pb-4 mx-4">
                <div className="card-header">
                  <h3 className="card-title">Preview</h3>
                </div>
                <div className="card-body">
                  <div className="row px-3">
                    {[
                      ["Event Name", formData.event_name],
                      ["Event Title", formData.title],
                      ["Event Type", formData.pay_at],
                      ["Event At", formData.event_at],
                      ["Location URL", formData.location_url],
                      ["Event From", formData.from_time],
                      ["Event To", formData.to_time],
                      ["Description", formData.description],
                      ["Mark Important", formData.is_important === true ? "Yes" : formData.is_important === false ? "No" : "-"],
                      ["RSVP Action", formData.rsvp_action],
                      ["RSVP Name", formData.rsvp_action === "yes" ? formData.rsvp_name : null],
                      ["RSVP Number", formData.rsvp_action === "yes" ? formData.rsvp_number : null],
                      ["Salesforce Data Retention Days", formData.salesforce_data_retention_days],
                    ].map(([label, value]) =>
                      value === null ? null : (
                        <div className="col-lg-6 col-md-6 col-sm-12 row px-3" key={label}>
                          <div className="col-6">
                            <label>{label}</label>
                          </div>
                          <div className="col-6">
                            <span className="text-dark">: {value || "-"}</span>
                          </div>
                        </div>
                      )
                    )}

                    <div className="col-lg-6 col-md-6 col-sm-12 row px-3">
                      <div className="col-6">
                        <label>Projects</label>
                      </div>
                      <div className="col-6">
                        <span className="text-dark">
                          :{" "}
                          {selectedProjectIds
                            .map(
                              (id) =>
                                projects.find((p) => String(p.id) === String(id))?.name ||
                                projects.find((p) => String(p.id) === String(id))?.project_name ||
                                `Project ${id}`
                            )
                            .join(", ") || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-12 row px-3">
                      <div className="col-6">
                        <label>Data Type</label>
                      </div>
                      <div className="col-6">
                        <span className="text-dark">
                          :{" "}
                          {DATA_TYPE_OPTIONS.filter((o) => dataType.includes(o.value))
                            .map((o) => o.label)
                            .join(", ") || "-"}
                        </span>
                      </div>
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12 row px-3">
                      <div className="col-6">
                        <label>Set Reminders</label>
                      </div>
                      <div className="col-6">
                        {formData.set_reminders_attributes.length > 0 ? (
                          formData.set_reminders_attributes.map((r, i) => (
                            <div key={i}>
                              <span className="text-dark">
                                : {r.value} {r.unit}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-dark">: -</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <hr className="my-4" />

                  <div className="row px-3">
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                      <label className="d-block mb-1">
                        Event Creation Email Attachment
                      </label>
                      {formData.creation_email_attachment ? (
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={formData.creation_email_attachment.preview}
                            alt={formData.creation_email_attachment.name}
                            style={{ width: 60, height: 60, objectFit: "cover" }}
                            className="img-fluid rounded"
                          />
                          <span className="text-dark">{formData.creation_email_attachment.name}</span>
                        </div>
                      ) : (
                        <span className="text-dark">-</span>
                      )}
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-12 mb-3">
                      <label className="d-block mb-1">
                        Event Reminder Email Attachment
                      </label>
                      {formData.reminder_email_attachment ? (
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={formData.reminder_email_attachment.preview}
                            alt={formData.reminder_email_attachment.name}
                            style={{ width: 60, height: 60, objectFit: "cover" }}
                            className="img-fluid rounded"
                          />
                          <span className="text-dark">{formData.reminder_email_attachment.name}</span>
                        </div>
                      ) : (
                        <span className="text-dark">-</span>
                      )}
                    </div>

                    {[
                      ["Cover Images", coverImageRatios],
                      ["Event Attachments", eventImageRatios],
                      ["Thumbnail Images", thumbnailImageRatios],
                    ].map(([label, ratios]) => {
                      const count = ratios.reduce(
                        (sum, { key }) => sum + (formData[key]?.length || 0),
                        0
                      );
                      return (
                        <div className="col-lg-4 col-md-6 col-sm-12 mb-3" key={label}>
                          <label className="d-block mb-1">{label}</label>
                          <span className="text-dark">{count} file{count === 1 ? "" : "s"} added</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              )}
            </div>

            <div className="efs-nav">
              {step !== "details" && (
                <button
                  type="button"
                  className="purple-btn1"
                  onClick={() => goToStep(step === "preview" ? "images" : "details")}
                >
                  Back
                </button>
              )}
              {step !== "preview" ? (
                <button
                  type="button"
                  className="purple-btn2"
                  onClick={() => goToStep(step === "details" ? "images" : "preview")}
                >
                  Proceed to save
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="purple-btn1"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    type="submit"
                    className="purple-btn2"
                    disabled={loading}
                  >
                    Submit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventCreate;
