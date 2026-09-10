import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import MultiSelectBox from "../components/base/MultiSelectBox";
import FormTextField from "../components/base/FormTextField";
import { CalendarDays } from "lucide-react";
import { baseURL } from "./baseurl/apiDomain";
import { ImageUploadingButton } from "../components/reusable/ImageUploadingButton";
import { ImageCropper } from "../components/reusable/ImageCropper";
import ProjectBannerUpload from "../components/reusable/ProjectBannerUpload";
import ProjectImageVideoUpload from "../components/reusable/ProjectImageVideoUpload";
import { useConnectEvents } from "../hooks/useConnectEvents";
import EventFormSteps from "../components/events/EventFormSteps";
import "./banner-add.css";

const DATA_TYPE_OPTIONS = [
  { value: "bookedClients", label: "Booked Clients" },
  { value: "visitDoneLostClients", label: "Visit Done Lost Clients" },
  { value: "lostLeads", label: "Lost Leads" },
  { value: "cp", label: "CP" },
];

const MAX_SELECTABLE_PROJECTS = 3;

const EventEdit = () => {
  const connectEvents = useConnectEvents();
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  console.log("id", id);

  const [formData, setFormData] = useState({
    event_type: "",
    title: "",
    event_name: "",
    event_at: "",
    from_time: "",
    to_time: "",
    rsvp_action: "",
    rsvp_name: "",
    rsvp_number: "",
    description: "",
    publish: "",
    comment: "",
    location_url: "",
    pay_at: "",
    payment_link: "",
    attachfile: [],
    previewImage: [],
    is_important: "false",
    email_trigger_enabled: "false",
    salesforce_data_retention_days: "",
    creation_email_attachment: null,
    reminder_email_attachment: null,
    set_reminders_attributes: [],
    existingImages: [], // for previously uploaded images
    newImages: [], // for newly selected images
    cover_image: null, // Changed from array to single value
    existingCoverImage: null, // Add this to track existing cover image
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

  console.log("Data", formData);

  const [eventType, setEventType] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [dataType, setDataType] = useState([]);
  const originalDataRef = useRef(null);
  const creationAttachmentInputRef = useRef(null);
  const reminderAttachmentInputRef = useRef(null);

  const [reminderValue, setReminderValue] = useState("");
  const [reminderUnit, setReminderUnit] = useState("");
  const [image, setImage] = useState([]);
  const [croppedImage, setCroppedImage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [imageConfigurations, setImageConfigurations] = useState({});
  const [showUploader, setShowUploader] = useState(false);
  // const [showCoverUploader, setShowCoverUploader] = useState(false);
  const [showAttachmentTooltip, setShowAttachmentTooltip] = useState(false);
  const [step, setStep] = useState("details");
  const [showCoverUploader, setShowCoverUploader] = useState(false);
  const [showEventUploader, setShowEventUploader] = useState(false);
  const [showThumbnailUploader, setShowThumbnailUploader] = useState(false);

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

  // const updateFormData = (key, files) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [key]: [...(prev[key] || []), ...files],
  //   }));
  // };

  const updateFormData = (key, files) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [key]: files,
      };
      return newData;
    });
  };

  const updateEventFormData = (key, files) => {
    setFormData((prev) => {
      const existingFiles = prev[key] || [];

      const newData = {
        ...prev,
        [key]: [...existingFiles, ...files],
      };

      return newData;
    });
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

  const handleCoverImageCropComplete = (validImages) => {
    if (!validImages || validImages.length === 0) {
      toast.error("No valid images selected.");
      setShowCoverUploader(false);
      return;
    }

    validImages.forEach((img) => {
      if (!img.ratio) return;

      const formattedRatio = img.ratio.replace(":", "_by_");
      const key = `cover_image_${formattedRatio}`;

      updateFormData(key, [img]); // Replace or overwrite
    });

    // setPreviewImg(validImages[0].preview);
    setShowCoverUploader(false);
  };

  // const handleEventImageCropComplete = (validImages) => {
  //   if (!validImages || validImages.length === 0) {
  //     toast.error("No valid images selected.");
  //     setShowEventUploader(false);
  //     return;
  //   }

  //   validImages.forEach((img) => {
  //     if (!img.ratio) return;

  //     const formattedRatio = img.ratio.replace(":", "_by_");
  //     const key = `event_images_${formattedRatio}`;

  //     updateEventFormData(key, [img]); // Replace or overwrite
  //   });

  //   // setPreviewImg(validImages[0].preview);
  //   setShowEventUploader(false);
  // };

  const handleEventCroppedImages = (
    validImages,
    videoFiles = [],
    type = "event"
  ) => {
    // Handle video files first
    if (videoFiles && videoFiles.length > 0) {
      videoFiles.forEach((video) => {
        const formattedRatio = video.ratio.replace(":", "_by_");
        const prefix = type === "cover" ? "cover_image" : "event_images";
        const key = `${prefix}_${formattedRatio}`;

        setFormData((prev) => ({
          ...prev,
          [key]: [
            ...(prev[key] || []), // Keep existing files
            {
              file: video.file,
              name: video.file.name,
              preview: URL.createObjectURL(video.file),
              ratio: video.ratio,
              type: "video",
              id: `${key}-${Date.now()}-${Math.random()}`,
            },
          ],
        }));
      });

      setShowEventUploader(false);
      return;
    }

    // Handle images
    if (!validImages || validImages.length === 0) {
      toast.error(`No valid ${type} files selected.`);
      setShowEventUploader(false);
      return;
    }

    validImages.forEach((img) => {
      const formattedRatio = img.ratio.replace(":", "_by_");
      const prefix = type === "cover" ? "cover_image" : "event_images";
      const key = `${prefix}_${formattedRatio}`;

      setFormData((prev) => ({
        ...prev,
        [key]: [
          ...(prev[key] || []), // Keep existing files
          {
            file: img.file,
            name: img.file.name,
            preview: URL.createObjectURL(img.file),
            ratio: img.ratio,
            type: "image",
            id: `${key}-${Date.now()}-${Math.random()}`,
          },
        ],
      }));
    });

    setShowEventUploader(false);
  };

  const handleThumbnailCroppedImages = (validImages) => {
    if (!validImages || validImages.length === 0) {
      toast.error("No valid thumbnail images selected.");
      setShowThumbnailUploader(false);
      return;
    }

    validImages.forEach((img) => {
      const formattedRatio = img.ratio.replace(":", "_by_");
      const key = `thumbnail_images_${formattedRatio}`;
      updateEventFormData(key, [
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

  const handleImageRemoval = (key, index) => {
    setFormData((prev) => {
      const updatedArray = (prev[key] || []).filter((_, i) => i !== index);
      return {
        ...prev,
        [key]: updatedArray.length > 0 ? updatedArray : [],
      };
    });
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

  // const eventUploadConfig = {
  //   'cover image': ['16:9']
  // };

  // const currentUploadType = 'cover image';
  // const selectedRatios = eventUploadConfig[currentUploadType] || [];
  // const dynamicLabel = currentUploadType.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
  // const dynamicDescription = `Supports ${selectedRatios.join(', ')} aspect ratios`;

  // const updateFormData = (key, files) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [key]: files,
  //   }));
  // };

  // const handleCropComplete = (validImages) => {
  //   if (!validImages || validImages.length === 0) {
  //     toast.error("No valid images selected.");
  //     setShowUploader(false);
  //     return;
  //   }

  //   validImages.forEach((img) => {
  //     const formattedRatio = img.ratio.replace(':', 'by'); // e.g., "16:9" -> "16by9"
  //     const key = `${currentUploadType}_${formattedRatio}`.replace(/\s+/g, '_').toLowerCase(); // e.g., banner_image_16by9

  //     updateFormData(key, [img]); // send as array to preserve consistency
  //   });

  //   // setPreviewImg(validImages[0].preview); // preview first image only
  //   setShowUploader(false);
  // };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${baseURL}events/${id}.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        const data = response.data;

        // Format reminders
        const formattedReminders = (data.reminders || []).map((reminder) => {
          if (typeof reminder.days !== "undefined" && reminder.days !== null) {
            return {
              id: reminder.id,
              value: reminder.days,
              unit: "days",
              _destroy: false,
            };
          } else if (
            typeof reminder.hours !== "undefined" &&
            reminder.hours !== null
          ) {
            return {
              id: reminder.id,
              value: reminder.hours,
              unit: "hours",
              _destroy: false,
            };
          } else if (
            typeof reminder.minutes !== "undefined" &&
            reminder.minutes !== null
          ) {
            return {
              id: reminder.id,
              value: reminder.minutes,
              unit: "minutes",
              _destroy: false,
            };
          } else if (
            typeof reminder.weeks !== "undefined" &&
            reminder.weeks !== null
          ) {
            return {
              id: reminder.id,
              value: reminder.weeks,
              unit: "weeks",
              _destroy: false,
            };
          }
          return reminder;
        });

        // Hydrate the selected projects + single data type from
        // event_projects, if the API returns them; otherwise fall back to
        // the single legacy project_id so there is still one selected
        // project. All projects share one data type in this UI, so take it
        // from the first entry that has one.
        let initialProjectIds = [];
        let initialDataTypes = [];
        if (Array.isArray(data.event_projects) && data.event_projects.length > 0) {
          initialProjectIds = data.event_projects.map((ep) => ep.project_id ?? "");
          const firstWithDataType = data.event_projects.find(
            (ep) => Array.isArray(ep.data_types) && ep.data_types.length > 0
          );
          initialDataTypes = firstWithDataType?.data_types || [];
        } else if (data.project_id) {
          initialProjectIds = [data.project_id];
        }
        // Events created before the 2-project cap can still carry more than
        // that; trim the selection down so the form never opens already
        // over the new limit (submitting without touching Projects leaves
        // the extra ones untouched server-side, since the "changed?" check
        // below is diffed against this same trimmed list).
        if (initialProjectIds.length > MAX_SELECTABLE_PROJECTS) {
          toast.error(
            `This event has ${initialProjectIds.length} projects linked; only the first ${MAX_SELECTABLE_PROJECTS} are shown here.`
          );
          initialProjectIds = initialProjectIds.slice(0, MAX_SELECTABLE_PROJECTS);
        }
        setSelectedProjectIds(initialProjectIds);
        setDataType(initialDataTypes);

        // Prepare cover image preview
        const existingCoverImage =
          data.cover_image && data.cover_image.document_url
            ? {
                url: data.cover_image.document_url,
                id: data.cover_image.id,
                isExisting: true,
              }
            : null;

        // Prepare existing event image previews
        const existingImages =
          data.event_images?.map((img) => ({
            url: img.document_url,
            type: img.document_content_type,
            id: img.id,
            isExisting: true,
          })) || [];

        const attachfileData = data.attachfile
          ? Array.isArray(data.attachfile)
            ? data.attachfile
            : [data.attachfile]
          : [];

        const coverImageData = data.cover_image || null;

        setFormData((prev) => ({
          ...prev,
          ...data,
          title: data.event_title || data.event_title || "",
          is_important: data.is_important === true || data.is_important === "true" || data.is_important === 1,
          // attachfile: data.attachfile || [],
          pay_at: data.pay_at || "",
          payment_link: data.payment_link || "",
          salesforce_data_retention_days: data.salesforce_data_retention_days || "",
          creation_email_attachment: data.creation_email_attachment || null,
          reminder_email_attachment: data.reminder_email_attachment || null,
          attachfile: attachfileData,
          newImages: [],
          existingImages: existingImages,
          previewImage: existingImages,
          existingCoverImage: existingCoverImage, // <-- use the correct object
          cover_image: coverImageData,
          set_reminders_attributes: formattedReminders,
          cover_image_1_by_1: data.cover_image_1_by_1 || [],
          cover_image_9_by_16: data.cover_image_9_by_16 || [],
          cover_image_3_by_2: data.cover_image_3_by_2 || [],
          cover_image_16_by_9: data.cover_image_16_by_9 || [],
          event_images_1_by_1: data.event_images_1_by_1 || [],
          event_images_9_by_16: data.event_images_9_by_16 || [],
          event_images_3_by_2: data.event_images_3_by_2 || [],
          event_images_16_by_9: data.event_images_16_by_9 || [],
          thumbnail_images_1_by_1: data.thumbnail_images_1_by_1 || [],
          thumbnail_images_9_by_16: data.thumbnail_images_9_by_16 || [],
          thumbnail_images_3_by_2: data.thumbnail_images_3_by_2 || [],
          thumbnail_images_16_by_9: data.thumbnail_images_16_by_9 || [],
          location_url: data.comment || "",
        }));

        originalDataRef.current = {
          event_type: data.event_type || "",
          title: data.event_title || "",
          event_name: data.event_name || "",
          event_at: data.event_at || "",
          from_time: data.from_time || "",
          to_time: data.to_time || "",
          rsvp_action: data.rsvp_action || "",
          rsvp_name: data.rsvp_name || "",
          rsvp_number: data.rsvp_number || "",
          description: data.description || "",
          is_important: data.is_important,
          email_trigger_enabled: data.email_trigger_enabled,
          pay_at: data.pay_at || "",
          payment_link: data.payment_link || "",
          salesforce_data_retention_days: data.salesforce_data_retention_days || "",
          publish: data.publish || "",
          comment: data.comment || "",
          location_url: data.comment || "",
          had_cover_image: !!(data.cover_image && data.cover_image.document_url),
          project_ids: initialProjectIds,
          data_types: initialDataTypes,
        };

        console.log("project_id: ", data.project_id);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  const [projects, setProjects] = useState([]); // State to store projects

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Size check: must be below 3MB
      if (file.size > 3 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          cover_image: "Image size must be less than 3MB",
        }));
        toast.error("Image size must be less than 3MB");
        e.target.value = ""; // Clear the input
        return;
      }

      // Clear previous error if size is valid
      setErrors((prev) => ({
        ...prev,
        cover_image: "",
      }));

      // Save the image
      setFormData((prev) => ({
        ...prev,
        cover_image: file,
        existingCoverImage: null,
      }));
    } else {
      // If no file is selected
      setFormData((prev) => ({
        ...prev,
        cover_image: null,
      }));
    }
  };

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
        ); // Ensure data structure is correct
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // from_time / to_time hold either the server's ISO string, a local
  // "YYYY-MM-DDTHH:MM" value, or "YYYY-MM-DD" (date only) after the
  // user clears the time — so removing the time keeps the date.
  const normalizeDateTime = (value) => {
    if (!value) return "";
    const normalized = value.replace(" ", "T");
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/.test(normalized)) return normalized;
    return formatDateForInput(normalized);
  };

  const getDatePart = (value) => normalizeDateTime(value).slice(0, 10);
  const getTimePart = (value) => {
    const normalized = normalizeDateTime(value);
    if (normalized.length > 10) {
      const time = normalized.slice(11, 16);
      if (time === "00:00") return "";
      return time;
    }
    return "";
  };

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      const allowedImages = [];
      const newPreviews = [];

      files.forEach((file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        // Validate size based on type
        if (isImage && file.size > 3 * 1024 * 1024) {
          toast.error("Image size must be less than 3MB");
          return;
        }

        if (isVideo && file.size > 10 * 1024 * 1024) {
          toast.error("Video size must be less than 10MB");
          return;
        }

        if (!isImage && !isVideo) {
          toast.error(`${file.name} is not a supported file type`);
          return;
        }

        // If valid, add to list
        allowedImages.push(file);
        newPreviews.push({
          url: URL.createObjectURL(file),
          type: file.type,
          file: file,
          isExisting: false,
        });
      });

      if (allowedImages.length > 0) {
        setFormData((prev) => ({
          ...prev,
          attachfile: allowedImages,
          newImages: newPreviews,
          previewImage: [...prev.existingImages, ...newPreviews],
        }));
      }
    }
  };

  // Function to remove image from preview
  // const handleRemoveImage = async (index) => {
  //   toast.dismiss();
  //   setFormData((prev) => {
  //     const imageToRemove = prev.previewImage[index];

  //     if (imageToRemove.isExisting) {
  //       // Call backend API to remove the image
  //       axios
  //         .delete(`${baseURL}events/${id}/remove_image/${imageToRemove.id}`, {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //           },
  //         })
  //         .then(() => {
  //           toast.success("Image removed successfully!");
  //         })
  //         .catch(() => {
  //           toast.error("Failed to remove image from server.");
  //         });

  //       // Optimistically update UI
  //       const updatedExistingImages = prev.existingImages.filter(
  //         (img) => img.id !== imageToRemove.id
  //       );
  //       return {
  //         ...prev,
  //         existingImages: updatedExistingImages,
  //         previewImage: prev.previewImage.filter((_, i) => i !== index),
  //       };
  //     } else {
  //       // If it's a new image, remove from newImages and attachfile
  //       const newImageIndex = prev.newImages.findIndex(
  //         (img) => img.url === imageToRemove.url
  //       );

  //       if (newImageIndex !== -1) {
  //         const updatedNewImages = prev.newImages.filter(
  //           (_, i) => i !== newImageIndex
  //         );
  //         const updatedFiles = Array.from(prev.attachfile).filter(
  //           (_, i) => i !== newImageIndex
  //         );

  //         return {
  //           ...prev,
  //           newImages: updatedNewImages,
  //           attachfile: updatedFiles,
  //           previewImage: prev.previewImage.filter((_, i) => i !== index),
  //         };
  //       }
  //     }

  //     return prev;
  //   });
  // };

  const handleFetchedDiscardGallery = async (key, index, imageId) => {
    toast.dismiss();
    // If no imageId, it's a new image, just remove locally
    if (!imageId) {
      setFormData((prev) => {
        const updatedFiles = (prev[key] || []).filter((_, i) => i !== index);
        return { ...prev, [key]: updatedFiles };
      });
      toast.success("Image removed successfully!");
      return;
    }

    // Existing image: delete from server, then remove locally
    try {
      const response = await fetch(
        `${baseURL}events/${id}/remove_image/${imageId}.json`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!response.ok) {
        // Optionally, handle 404 as a successful local delete
        if (response.status === 404) {
          const updatedFiles = formData[key].filter((_, i) => i !== index);
          setFormData({ ...formData, [key]: updatedFiles });
          toast.success("Image removed from UI (already deleted on server).");
          return;
        }
        throw new Error("Failed to delete image");
      }

      // Remove from UI after successful delete
      setFormData((prev) => ({
        ...prev,
        [key]: (prev[key] || []).filter((_, i) => i !== index),
      }));

      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image:", error.message);
      toast.error("Failed to delete image. Please try again.");
    }
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "true", // Convert string to boolean
    }));
  };

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
    else if (dataType.length === 0) errors.push("Please select at least one data type.");
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

  const validateForm = () => {
    const errors = [...validateDetailsStep(), ...validateImagesStep()];
    if (errors.length > 0) {
      toast.error(errors[0]);
      return false;
    }
    return true;
  };

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

    if (!validateForm()) return;
    setLoading(true);

    // const cover16by9 = formData.cover_image_16_by_9;
    // const hasCover16by9 = Array.isArray(cover16by9)
    //   ? cover16by9.some(
    //       (img) =>
    //         img?.file instanceof File || img?.id || img?.document_file_name
    //     )
    //   : !!(
    //       cover16by9?.file instanceof File ||
    //       cover16by9?.id ||
    //       cover16by9?.document_file_name
    //     );

    // const event16by9 = formData.event_images_16_by_9;
    // const hasEvent16by9 = Array.isArray(event16by9)
    //   ? event16by9.some(
    //       (img) =>
    //         img?.file instanceof File || img?.id || img?.document_file_name
    //     )
    //   : !!(
    //       event16by9?.file instanceof File ||
    //       event16by9?.id ||
    //       event16by9?.document_file_name
    //     );

    // if (!hasCover16by9) {
    //   toast.error("Cover Image with 16:9 ratio is required.");
    //   setLoading(false);
    //   setIsSubmitting(false);
    //   return;
    // }

    // if (!hasEvent16by9) {
    //   toast.error("Event Image with 16:9 ratio is required.");
    //   setLoading(false);
    //   setIsSubmitting(false);
    //   return;
    // }

    const data = new FormData();

    const preparedReminders = prepareRemindersForSubmission();

    const orig = originalDataRef.current || {};

    const hasChanged = (key, currentVal) => {
      if (!(key in orig)) return false; // unknown/system fields are never sent
      const origVal = orig[key];
      if (Array.isArray(currentVal) || Array.isArray(origVal)) {
        return JSON.stringify(currentVal) !== JSON.stringify(origVal);
      }
      return String(currentVal ?? "") !== String(origVal ?? "");
    };

    // === PROJECTS & DATA TYPES (only if actually changed) ===
    // Primary project is the first selected one; every selected project
    // (with its Salesforce project id) goes into event_projects_attributes,
    // all sharing the same set of data types chosen above. Compared as
    // sorted sets, not array order, since re-selecting the same values in a
    // different order isn't a real change.
    const origProjectIds = orig.project_ids || [];
    const projectsChanged =
      JSON.stringify([...selectedProjectIds].map(String).sort()) !==
      JSON.stringify([...origProjectIds].map(String).sort());
    const origDataTypes = orig.data_types || [];
    const dataTypesChanged =
      JSON.stringify([...dataType].sort()) !== JSON.stringify([...origDataTypes].sort());

    if (projectsChanged || dataTypesChanged) {
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
    }

    // === EMAIL ATTACHMENTS (only resend if the user picked a new file) ===
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

    // === COVER IMAGE ===
    if (formData.cover_image && formData.cover_image instanceof File) {
      data.append("event[cover_image]", formData.cover_image);
    } else if (!formData.cover_image && !formData.existingCoverImage && orig.had_cover_image) {
      // Only send removal if there was an existing cover image that the user explicitly removed
      data.append("event[remove_cover_image]", "1");
    }

    // === EVENT IMAGES (NEW ONLY) ===
    if (Array.isArray(formData.attachfile)) {
      formData.attachfile.forEach((file) => {
        if (file instanceof File) {
          data.append("event[event_images_16_by_9][]", file);
        }
      });
    }

    // Object.entries(formData).forEach(([key, images]) => {
    //   if (key.startsWith("cover_image") && Array.isArray(images)) {
    //     images.forEach((img) => {
    //       const backendField =
    //         key.replace("cover_image", "event[cover_image") + "]";
    //       if (img.file instanceof File) {
    //         data.append(backendField, img.file);
    //       }
    //     });
    //   }
    // });
    coverImageRatios.forEach(({ key }) => {
      const images = formData[key];
      if (Array.isArray(images) && images.length > 0) {
        const img = images[0];
        if (img?.file instanceof File) {
          data.append(`event[${key}]`, img.file);
        }
      }
    });

    // Handle 16:9 preview image from new structure
    if (Array.isArray(formData.cover_image_16_by_9)) {
      formData.cover_image_16_by_9.forEach((img) => {
        if (img.file instanceof File) {
          data.append("event[cover_image]", img.file);
        }
      });
    }

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

    // Handle 16:9 preview image from new structure
    if (Array.isArray(formData.event_images_16_by_9)) {
      formData.event_images_16_by_9.forEach((img) => {
        if (img.file instanceof File) {
          data.append("event[event_images]", img.file);
        }
      });
    }

    // === REMINDERS ===
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

    // === RSVP FIELDS ===
    if (hasChanged("rsvp_action", formData.rsvp_action)) {
      data.append("event[rsvp_action]", formData.rsvp_action || "");
    }
    if (formData.rsvp_action === "yes") {
      if (hasChanged("rsvp_name", formData.rsvp_name)) {
        data.append("event[rsvp_name]", formData.rsvp_name || "");
      }
      if (hasChanged("rsvp_number", formData.rsvp_number)) {
        data.append("event[rsvp_number]", formData.rsvp_number || "");
      }
    }

    // === REMOVED EXISTING IMAGES ===
    const originalIds = formData.existingImages?.map((img) => img.id) || [];
    const currentIds =
      formData.previewImage
        ?.filter((img) => img.isExisting)
        .map((img) => img.id) || [];

    const removedIds = originalIds.filter((id) => !currentIds.includes(id));
    removedIds.forEach((id) => data.append("event[removed_image_ids][]", id));

    // === EVERYTHING ELSE (Primitive values only, only if changed) ===
    // Explicitly send event_title mapped from UI `title` field
    if (hasChanged("title", formData.title)) {
      data.append("event[event_title]", formData.title || "");
    }

    const skippedKeys = [
      "cover_image",
      "attachfile",
      "existingImages",
      "newImages",
      "previewImage",
      "set_reminders_attributes",
      "project_id",
      "creation_email_attachment",
      "reminder_email_attachment",
      "title",
      "event_title", // handled explicitly via the title → event_title mapping above
      "rsvp_action",
      "rsvp_name",
      "rsvp_number",
      "event_images",
      "existingCoverImage",
      "cover_image_1_by_1",
      "cover_image_9_by_16",
      "cover_image_3_by_2",
      "cover_image_16_by_9",
      "event_images_1_by_1",
      "event_images_9_by_16",
      "event_images_3_by_2",
      "event_images_16_by_9",
      "thumbnail_images_1_by_1",
      "thumbnail_images_9_by_16",
      "thumbnail_images_3_by_2",
      "thumbnail_images_16_by_9",
      "from_time",
      "to_time",
      "location_url",
    ];

    if (hasChanged("location_url", formData.location_url)) {
      data.append("event[comment]", formData.location_url);
    }

    if (formData.from_time && hasChanged("from_time", formData.from_time)) {
      const fromTimeValue = formData.from_time.includes("T") ? formData.from_time : `${formData.from_time}T00:00`;
      data.append("event[from_time]", fromTimeValue);
    }
    if (formData.to_time && hasChanged("to_time", formData.to_time)) {
      const toTimeValue = formData.to_time.includes("T") ? formData.to_time : `${formData.to_time}T00:00`;
      data.append("event[to_time]", toTimeValue);
    }

    Object.entries(formData).forEach(([key, value]) => {
      if (skippedKeys.includes(key)) return;

      if (value !== null && value !== undefined && typeof value !== "object") {
        if (hasChanged(key, value)) {
          data.append(`event[${key}]`, value);
        }
      }
    });

    // === SEND REQUEST ===
    try {
      const response = await axios.put(`${baseURL}events/${id}/update_event.json`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      connectEvents.onRecordSaved({ mode: "updated" });
      toast.success("Event updated successfully!");
      navigate("/event-list");
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to update event.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString.replace(" ", "T"));
    // Get local date and time in "YYYY-MM-DDTHH:MM" format
    const pad = (n) => n.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };
  const handleCancel = () => {
    navigate(-1);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

  return (
    <>
      <div className="main-content">
        <div className="module-data-section banner-form-page p-3">
              <EventFormSteps current={step} onStepClick={goToStep} />

              {step === "details" && (
              <div className="card banner-form-card mt-3 pb-4">
                <div className="card-header banner-form-section-header">
                  <h3 className="banner-form-section-heading">
                    <span className="banner-form-section-icon" aria-hidden="true">
                      <CalendarDays size={16} strokeWidth={1.8} />
                    </span>
                    Edit Event
                  </h3>
                </div>

                <div className="card-body">
                  <div className="row banner-form-fields">
                    <div className="col-md-6">
                      <div className="form-group">
                        <MultiSelectBox
                          label="Projects"
                          required
                          placeholder="Select Projects"
                          options={projects.map((project) => ({
                            value: project.id,
                            label: project.name || project.project_name,
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

                    <div className="col-md-3">
                      <div className="form-group">
                        <MultiSelectBox
                          label="Data Type"
                          required
                          placeholder="Select Data Type"
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

                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>Event Type</label>
                        <input
                          className="form-control"
                          type="text"
                          name="event_type"
                          placeholder="Enter Event Type"
                          value={formData.event_type || ""}
                          onChange={handleChange}
                        />
                      </div>
                    </div> */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <SelectBox
                          label="Event Type (Internal/External)"
                          placeholder="Select Event Type"
                          options={[
                            { value: "internal", label: "Internal" },
                            { value: "external", label: "External" },
                          ]}
                          value={formData.pay_at || ""}
                          onChange={(val) => {
                            setFormData((prev) => ({
                              ...prev,
                              pay_at: val,
                              payment_link: "",
                            }));
                          }}
                        />
                      </div>
                    </div>

                    {formData.pay_at === "external" && (
                      <div className="col-md-3">
                        <div className="form-group">
                          <FormTextField
                            label="Event Link"
                            type="url"
                            name="payment_link"
                            placeholder="Enter Event Link"
                            value={formData.payment_link || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    )}

                    <div className="col-md-3">
                      <div className="form-group">
                        <FormTextField
                          label="Event Name"
                          required
                          name="event_name"
                          placeholder="Enter Event Name"
                          value={formData.event_name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <FormTextField
                          label="Event Title"
                          name="title"
                          placeholder="Enter Event Title"
                          value={formData.title || ""}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <FormTextField
                          label="Event At"
                          name="event_at"
                          placeholder="Enter Event At"
                          value={formData.event_at}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <FormTextField
                          label="Location URL"
                          type="url"
                          name="location_url"
                          placeholder="Enter Location URL"
                          value={formData.location_url || ""}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <FormTextField
                          label="Event From"
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
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <FormTextField
                          label="From Time"
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
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <FormTextField
                          label="Event To"
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
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <FormTextField
                          label="To Time"
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
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <FormTextField
                          label="Salesforce Data Retention Days"
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
                        <FormTextField
                          label="Event Description"
                          name="description"
                          placeholder="Enter Description"
                          value={formData.description}
                          onChange={handleChange}
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
                                Max Upload Size for video 10 MB and for image 3
                                MB
                              </span>
                            )}
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          name="attachfile"
                          accept="image/*,video/*" 
                          multiple
                          onChange={handleFileChange} 
                        />
                      </div>

                    
                      {Array.isArray(formData.previewImage) &&
                        formData.previewImage.length > 0 && (
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            {formData.previewImage.map((fileObj, index) => {
                              const { url, type, isExisting } = fileObj;
                              const isVideo = type.startsWith("video");

                              return (
                                <div key={index} className="position-relative">
                                  {isVideo ? (
                                    <video
                                      src={url}
                                      controls
                                      className="rounded"
                                      style={{
                                        maxWidth: "100px",
                                        maxHeight: "100px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <img
                                      src={url}
                                      alt={`Preview ${index}`}
                                      className="img-fluid rounded"
                                      style={{
                                        maxWidth: "100px",
                                        maxHeight: "100px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  )}
                                
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm position-absolute"
                                    style={{
                                      top: "-5px",
                                      right: "-5px",
                                      fontSize: "10px",
                                      width: "20px",
                                      height: "20px",
                                      padding: "0",
                                      borderRadius: "50%",
                                    }}
                                    onClick={() => handleRemoveImage(index)}
                                    title={
                                      isExisting
                                        ? "Remove existing image"
                                        : "Remove new image"
                                    }
                                  >
                                    ×
                                  </button>
                                 
                                  <small
                                    className={`badge ${
                                      isExisting ? "bg-info" : "bg-success"
                                    } position-absolute`}
                                    style={{
                                      bottom: "-5px",
                                      left: "5px",
                                      fontSize: "8px",
                                    }}
                                  >
                                    {isExisting ? "" : ""}
                                  </small>
                                </div>
                              );
                            })}
                          </div>
                        )}
                    </div> */}
                    {/* <div className="col-md-3 col-sm-6 col-12">
                      <div className="form-group mt-3">
                  
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

                       
                        <div className="mt-2 d-flex flex-wrap">
                          {Array.isArray(formData.cover_image_16by9) && formData.cover_image_16by9.length > 0 ? (
                            formData.cover_image_16by9.map((file, index) => (
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
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                            ))
                          ) : croppedImage ? (
                            <div className="position-relative">
                              <img
                                src={croppedImage}
                                alt="Cover Preview"
                                className="img-fluid rounded"
                                style={{
                                  maxWidth: "100px",
                                  maxHeight: "100px",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          ) : formData.existingCoverImage ? (
                            <div className="position-relative">
                              <img
                                src={formData.existingCoverImage.url}
                                alt="Existing Cover"
                                className="img-fluid rounded"
                                style={{
                                  maxWidth: "100px",
                                  maxHeight: "100px",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          ) : (
                            <span>No image selected</span>
                          )}
                        </div>
                      </div>
                    </div> */}

                    <div className="col-md-3">
                      <div className="form-group">
                        <div className="form-control-field">
                          <span className="form-control-field__label">
                            Mark Important
                          </span>
                          <div className="form-radio-control">
                            <div className="form-check">
                              <input
                                id="edit-event-is-important-yes"
                                className="form-check-input"
                                type="radio"
                                name="is_important"
                                value="true"
                                checked={formData.is_important === true}
                                onChange={handleRadioChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="edit-event-is-important-yes"
                              >
                                Yes
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                id="edit-event-is-important-no"
                                className="form-check-input"
                                type="radio"
                                name="is_important"
                                value="false"
                                checked={formData.is_important === false}
                                onChange={handleRadioChange}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="edit-event-is-important-no"
                              >
                                No
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Share With Radio Buttons */}

                    {/* <div className="col-md-3">
                      <div className="form-group mt-3">
                        <label>Send Email</label>
                        <div className="d-flex">
                          
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="email_trigger_enabled"
                              value="true"
                              checked={formData.email_trigger_enabled === true} // Compare as boolean
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  email_trigger_enabled:
                                    e.target.value === "true", // Convert to boolean
                                }))
                              }
                              disabled={isEmailLocked}
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
                              checked={formData.email_trigger_enabled === false} // Compare as boolean
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  email_trigger_enabled:
                                    e.target.value === "true", // Convert to boolean
                                }))
                              }
                              disabled={isEmailLocked}
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
                        <div className="form-control-field">
                          <span className="form-control-field__label">
                            RSVP Action
                          </span>
                          <div className="form-radio-control">
                            <div className="form-check">
                              <input
                                id="edit-event-rsvp-yes"
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
                                htmlFor="edit-event-rsvp-yes"
                              >
                                Yes
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                id="edit-event-rsvp-no"
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
                                htmlFor="edit-event-rsvp-no"
                              >
                                No
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.rsvp_action === "yes" && (
                      <>
                        <div className="col-md-3">
                          <div className="form-group">
                            <FormTextField
                              label="RSVP Name"
                              required
                              name="rsvp_name"
                              placeholder="Enter RSVP Name"
                              value={formData.rsvp_name || ""}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <FormTextField
                              label="RSVP Number"
                              required
                              name="rsvp_number"
                              placeholder="Enter RSVP Number"
                              value={formData.rsvp_number || ""}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>Event Shared</label>
                        <input
                          className="form-control"
                          type="text"
                          name="shared"
                          placeholder="Enter Event Shared"
                          value={formData.shared}
                          onChange={handleChange}
                        />
                      </div>
                    </div> */}

                    <div className="col-md-3">
                      <div className="form-group">
                        <SelectBox
                          label="Set Reminders"
                          placeholder="Select"
                          options={timeOptions}
                          value={reminderUnit || ""}
                          onChange={(value) => {
                            setReminderUnit(value);
                            setReminderValue("");
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <FormTextField
                          label="Value"
                          type="number"
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
                          disabled={!reminderUnit}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <button
                          type="button"
                          className="banner-form-action-btn"
                          onClick={handleAddReminder}
                          disabled={!reminderValue || !reminderUnit}
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    <div className="col-md-12">
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
              <div className="card banner-form-card mt-3 pb-4">
                <div className="card-header banner-form-section-header">
                  <h3 className="banner-form-section-heading">
                    <span className="banner-form-section-icon" aria-hidden="true">
                      <CalendarDays size={16} strokeWidth={1.8} />
                    </span>
                    File Upload
                  </h3>
                </div>
                <div className="card-body mt-0 pb-0">
                  <div className="row"></div>

                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Cover Image{" "}
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
                  </div>

                  {showCoverUploader && (
                    <ProjectBannerUpload
                      onClose={() => setShowCoverUploader(false)}
                      includeInvalidRatios={false}
                      selectedRatioProp={selectedCoverRatios}
                      showAsModal={true}
                      label={coverImageLabel}
                      description={dynamicCoverDescription}
                      onContinue={(validImages) =>
                        handleCoverImageCropComplete(validImages, "cover_image")
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
                          {formData.cover_image?.document_url && (
                            <tr>
                              <td>
                                {formData.cover_image.document_file_name ||
                                  formData.cover_image.file_name ||
                                  formData.cover_image.document_url
                                    ?.split("/")
                                    ?.pop() ||
                                  "Cover Image"}
                              </td>
                              <td>
                                <img
                                  src={formData.cover_image.document_url}
                                  alt="Cover Preview"
                                  className="img-fluid rounded"
                                  style={{
                                    maxWidth: "100px",
                                    maxHeight: "100px",
                                    objectFit: "cover",
                                  }}
                                />
                              </td>
                              <td>N/A</td>
                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2" style={{ color: "#fff" }}
                                  onClick={() =>
                                    handleFetchedDiscardGallery("cover_image")
                                  }
                                >
                                  x
                                </button>
                              </td>
                            </tr>
                          )}

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
                                      className="purple-btn2" style={{ color: "#fff" }}
                                      onClick={() =>
                                        handleFetchedDiscardGallery(
                                          key,
                                          index,
                                          file.id
                                        )
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
                              {/* <td colSpan="4" className="text-center">No event images uploaded</td> */}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* <div className="d-flex justify-content-between align-items-end mx-1">
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
                      <ProjectBannerUpload
                        onClose={() => setShowEventUploader(false)}
                        includeInvalidRatios={false}
                        selectedRatioProp={selectedEventRatios}
                        showAsModal={true}
                        label={eventImageLabel}
                        description={dynamicEventDescription}
                        onContinue={(validImages) =>
                          handleEventImageCropComplete(
                            validImages,
                            "event_images"
                          )
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
                          {eventImageRatios.flatMap(({ key, label }) => {
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
                                      className="purple-btn2" style={{ color: "#fff" }}
                                      onClick={() =>
                                        handleFetchedDiscardGallery(key, index, file.id)
                                      }
                                    >
                                      x
                                    </button>
                                  </td>
                                </tr>
                              );
                            });
                          })}

                          {eventImageRatios.every(
                            ({ key }) =>
                              !(formData[key] && formData[key].length > 0)
                          ) && (
                            <tr>
                            
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div> */}

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
                            Max Upload Size for video 10 MB and for image 3 MB{getDynamicRatiosText("EventImage")}
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
                        <tbody>
                          {Array.isArray(formData.attachfile) &&
                            formData.attachfile.map((file) => (
                              <tr key={`attachfile-${file.id}`}>
                                <td>{file.document_file_name || "N/A"}</td>
                                <td>
                                  {file.document_url && (
                                    <img
                                      style={{
                                        maxWidth: "100px",
                                        maxHeight: "100px",
                                      }}
                                      className="img-fluid rounded"
                                      src={file.document_url}
                                      alt={
                                        file.document_file_name ||
                                        "Attached file"
                                      }
                                    />
                                  )}
                                </td>
                                <td>N/A</td>
                                <td>
                                  <button
                                    type="button"
                                    className="purple-btn2" style={{ color: "#fff" }}
                                    onClick={() =>
                                      handleFetchedDiscardGallery(file.id)
                                    }
                                    title="Remove attached file"
                                  >
                                    ×
                                  </button>
                                </td>
                              </tr>
                            ))}
                          {eventImageRatios.flatMap(({ key, label }) => {
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
                                `File ${index + 1}`;
                              const ratio = file.ratio || label;
                              const isVideo =
                                file.type === "video" ||
                                (file.file &&
                                  file.file.type.startsWith("video/")) ||
                                (preview &&
                                  [".mp4", ".webm", ".ogg"].some((ext) =>
                                    preview.toLowerCase().endsWith(ext)
                                  ));

                              return (
                                <tr key={`${key}-${file.id || index}`}>
                                  <td>{name}</td>
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
                                          src={preview}
                                          type={file.file?.type || "video/mp4"}
                                        />
                                        Your browser does not support the video
                                        tag.
                                      </video>
                                    ) : (
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
                                    )}
                                  </td>
                                  <td>{ratio}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="purple-btn2" style={{ color: "#fff" }}
                                      onClick={() =>
                                        handleFetchedDiscardGallery(
                                          key,
                                          index,
                                          file.id
                                        )
                                      }
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
                                      className="purple-btn2" style={{ color: "#fff" }}
                                      onClick={() =>
                                        handleFetchedDiscardGallery(
                                          key,
                                          index,
                                          file.id
                                        )
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
                              <td>
                                {formData.creation_email_attachment.name ||
                                  formData.creation_email_attachment.document_file_name ||
                                  "Attachment"}
                              </td>
                              <td>
                                <img
                                  src={
                                    formData.creation_email_attachment.preview ||
                                    formData.creation_email_attachment.document_url
                                  }
                                  alt="Creation email attachment"
                                  className="img-fluid rounded"
                                  style={{ maxWidth: 100, maxHeight: 100, objectFit: "cover" }}
                                />
                              </td>
                              <td>N/A</td>
                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2" style={{ color: "#fff" }}
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
                              <td>
                                {formData.reminder_email_attachment.name ||
                                  formData.reminder_email_attachment.document_file_name ||
                                  "Attachment"}
                              </td>
                              <td>
                                <img
                                  src={
                                    formData.reminder_email_attachment.preview ||
                                    formData.reminder_email_attachment.document_url
                                  }
                                  alt="Reminder email attachment"
                                  className="img-fluid rounded"
                                  style={{ maxWidth: 100, maxHeight: 100, objectFit: "cover" }}
                                />
                              </td>
                              <td>N/A</td>
                              <td>
                                <button
                                  type="button"
                                  className="purple-btn2" style={{ color: "#fff" }}
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
              <div className="card banner-form-card mt-3 pb-4">
                <div className="card-header banner-form-section-header">
                  <h3 className="banner-form-section-heading">
                    <span className="banner-form-section-icon" aria-hidden="true">
                      <CalendarDays size={16} strokeWidth={1.8} />
                    </span>
                    Preview
                  </h3>
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
                        {formData.set_reminders_attributes.filter((r) => !r._destroy).length > 0 ? (
                          formData.set_reminders_attributes
                            .filter((r) => !r._destroy)
                            .map((r, i) => (
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
                            src={
                              formData.creation_email_attachment.preview ||
                              formData.creation_email_attachment.document_url
                            }
                            alt="Creation email attachment"
                            style={{ width: 60, height: 60, objectFit: "cover" }}
                            className="img-fluid rounded"
                          />
                          <span className="text-dark">
                            {formData.creation_email_attachment.name ||
                              formData.creation_email_attachment.document_file_name}
                          </span>
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
                            src={
                              formData.reminder_email_attachment.preview ||
                              formData.reminder_email_attachment.document_url
                            }
                            alt="Reminder email attachment"
                            style={{ width: 60, height: 60, objectFit: "cover" }}
                            className="img-fluid rounded"
                          />
                          <span className="text-dark">
                            {formData.reminder_email_attachment.name ||
                              formData.reminder_email_attachment.document_file_name}
                          </span>
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

            <div className="banner-form-actions efs-nav">
              {step !== "details" && (
                <button
                  type="button"
                  className="banner-form-action-btn banner-form-action-btn--outline"
                  onClick={() => goToStep(step === "preview" ? "images" : "details")}
                >
                  Back
                </button>
              )}
              {step !== "preview" ? (
                <button
                  type="button"
                  className="banner-form-action-btn"
                  onClick={() => goToStep(step === "details" ? "images" : "preview")}
                >
                  Proceed to save
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="banner-form-action-btn banner-form-action-btn--outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    type="submit"
                    className="banner-form-action-btn"
                    disabled={loading}
                  >
                    Submit
                  </button>
                </>
              )}
            </div>
        </div>
      </div>
    </>
  );
};

export default EventEdit;
