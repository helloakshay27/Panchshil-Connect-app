import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import MultiSelectBox from "../components/base/MultiSelectBox";
import { baseURL } from "./baseurl/apiDomain";
import ProjectBannerUpload from "../components/reusable/ProjectBannerUpload";

const NoticeboardEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    project_ids: [],
    notice_heading: "",
    notice_text: "",
    active: "1",
    IsDelete: "0",
    expire_time: "",
    user_id: "",
    publish: "1",
    notice_type: "",
    deny: "0",
    flag_expire: "1",
    canceled_by: "",
    canceler_id: "",
    comment: "",
    shared: "all",
    group_id: [],
    of_phase: "",
    of_atype: "",
    of_atype_id: "",
    is_important: "",
    email_trigger_enabled: "",
    home_screen_frequency: "",
    set_reminders_attributes: [],
    cover_image: [],
    cover_image_1_by_1: [],
    cover_image_9_by_16: [],
    cover_image_3_by_2: [],
    cover_image_16_by_9: [],
  });

  const [noticeTypes] = useState([]);
  const [eventUserID, setEventUserID] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectNameFallback, setProjectNameFallback] = useState("");
  const projectsRef = useRef([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [groups, setGroups] = useState([]);
  const [reminderValue, setReminderValue] = useState("");
  const [reminderUnit, setReminderUnit] = useState("");
  const [showCoverUploader, setShowCoverUploader] = useState(false);
  const [removingImageId, setRemovingImageId] = useState(null);

  const timeOptions = [
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

  const noticeTypeOptions = [
    { value: "maintenance", label: "App Maintenance" },
    { value: "general", label: "General" },
    { value: "announcement", label: "Announcement" },
    { value: "roadblock", label: "Roadblock" },
  ];

  const frequencyOptions = [
    { value: "once_per_session", label: "Once per session" },
    { value: "every_time", label: "Every time Home opens" },
  ];

  const coverImageRatios = [
    { key: "cover_image_1_by_1", label: "1:1" },
    { key: "cover_image_16_by_9", label: "16:9" },
    { key: "cover_image_9_by_16", label: "9:16" },
    { key: "cover_image_3_by_2", label: "3:2" },
  ];

  const eventUploadConfig = {
    "cover image": ["16:9", "1:1", "9:16", "3:2"],
  };

  const coverImageType = "cover image";
  const selectedCoverRatios = eventUploadConfig[coverImageType] || [];
  const coverImageLabel = coverImageType.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
  const dynamicCoverDescription = `Supports ${selectedCoverRatios.join(", ")} aspect ratios`;

  // ─── Image Helpers ───────────────────────────────────────────────────────────

  const updateFormData = (key, files) => {
    setFormData((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...files],
    }));
  };

  const processImageData = (imageData) => {
    if (!imageData) return [];
    const toArray = Array.isArray(imageData) ? imageData : [imageData];
    return toArray.map((img, index) => ({
      ...img,
      id: img.id || `temp-${Date.now()}-${index}`,
      name: img.name || img.document_file_name || img.filename || `Image ${index + 1}`,
      preview: img.preview || img.document_url || img.url || img.file_url || "",
      ratio: img.ratio || "unknown",
      type: img.type || "image",
    }));
  };

  const handleCroppedImages = (validImages) => {
    if (!validImages || validImages.length === 0) {
      toast.error("No valid cover image selected.");
      return;
    }
    try {
      validImages.forEach((img) => {
        const ratioKey = img.ratio.replace(":", "_by_");
        const specificKey = `cover_image_${ratioKey}`;
        const newImageData = {
          file: img.file,
          name: img.file.name,
          preview: URL.createObjectURL(img.file),
          ratio: img.ratio,
          id: `${specificKey}-${Date.now()}-${Math.random()}`,
        };
        setFormData((prev) => ({
          ...prev,
          cover_image: [newImageData],
          [specificKey]: [newImageData],
        }));
        toast.success(`Cover image (${img.ratio}) uploaded successfully!`);
      });
      setShowCoverUploader(false);
    } catch (err) {
      console.error("Error handling cropped images:", err);
      toast.error("Failed to process uploaded images");
    }
  };

  const removeImageFromServer = async (imageId) => {
    if (!id || !imageId) return false;
    try {
      setRemovingImageId(imageId);
      const token = localStorage.getItem("access_token");
      if (!token) {
        toast.error("Authentication required. Please login again.");
        return false;
      }
      const response = await axios.delete(
        `${baseURL}noticeboards/${id}/remove_image/${imageId}.json`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200 || response.status === 204) {
        toast.success("Image removed successfully");
        return true;
      }
      toast.error("Failed to remove image from server");
      return false;
    } catch (err) {
      console.error("Error removing image:", err);
      if (err.response?.status === 401) {
        toast.error("Authentication failed. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to remove image from server");
      }
      return false;
    } finally {
      setRemovingImageId(null);
    }
  };

  const handleImageRemoval = async (key, index) => {
    const imageToRemove = formData[key]?.[index];
    if (imageToRemove?.id && !imageToRemove.id.toString().startsWith("temp-")) {
      const success = await removeImageFromServer(imageToRemove.id);
      if (!success) return;
    }
    setFormData((prev) => {
      const updatedArray = (prev[key] || []).filter((_, i) => i !== index);
      const newFormData = { ...prev, [key]: updatedArray };
      if (key === "cover_image" && imageToRemove?.ratio) {
        const ratioKey = imageToRemove.ratio.replace(":", "_by_");
        const specificKey = `cover_image_${ratioKey}`;
        newFormData[specificKey] = (prev[specificKey] || []).filter(
          (item) => item.id !== imageToRemove.id
        );
      }
      if (
        key.includes("_1_by_1") ||
        key.includes("_16_by_9") ||
        key.includes("_9_by_16") ||
        key.includes("_3_by_2")
      ) {
        newFormData.cover_image = (prev.cover_image || []).filter(
          (item) => item.id !== imageToRemove.id
        );
      }
      return newFormData;
    });
  };

  // ─── Reminders ───────────────────────────────────────────────────────────────

  const handleAddReminder = () => {
    if (!reminderValue || !reminderUnit) return;
    setFormData((prev) => ({
      ...prev,
      set_reminders_attributes: [
        ...prev.set_reminders_attributes,
        { value: reminderValue, unit: reminderUnit },
      ],
    }));
    setReminderValue("");
    setReminderUnit("");
  };

  const handleRemoveReminder = (index) => {
    setFormData((prev) => {
      const reminders = [...prev.set_reminders_attributes];
      if (reminders[index]?.id) {
        reminders[index] = { ...reminders[index], _destroy: true };
      } else {
        reminders.splice(index, 1);
      }
      return { ...prev, set_reminders_attributes: reminders };
    });
  };

  const prepareRemindersForSubmission = () => {
    return formData.set_reminders_attributes
      .map((reminder) => {
        if (reminder._destroy) return { id: reminder.id, _destroy: true };
        const base = { id: reminder.id };
        if (reminder.unit === "days") base.days = Number(reminder.value);
        else if (reminder.unit === "hours") base.hours = Number(reminder.value);
        else if (reminder.unit === "minutes") base.minutes = Number(reminder.value);
        else if (reminder.unit === "weeks") base.weeks = Number(reminder.value);
        return base;
      })
      .filter((r) => !r._destroy || r.id);
  };

  // ─── Form Handlers ────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    toast.dismiss();
    const errors = [];
    const isRoadblock = formData.notice_type === "roadblock";
    if (!isRoadblock && !formData.comment) errors.push("Comment is required.");
    if (!formData.expire_time) errors.push("Expire Time is required.");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setLoading(true);

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach((err) => toast.error(err));
      setLoading(false);
      return;
    }

    const backendSharedValue = formData.shared === "all" ? 0 : 1;
    const preparedReminders = prepareRemindersForSubmission();

    const data = new FormData();

    if (Array.isArray(formData.project_ids) && formData.project_ids.length > 0) {
      formData.project_ids.forEach((pid) => data.append("noticeboard[project_ids][]", pid));
    }
    data.append("noticeboard[notice_heading]", formData.notice_heading);
    data.append("noticeboard[notice_text]", formData.notice_text);
    data.append("noticeboard[active]", formData.active);
    data.append("noticeboard[IsDelete]", formData.IsDelete);
    data.append("noticeboard[expire_time]", formData.expire_time);
    data.append("noticeboard[user_id]", formData.user_id);
    data.append("noticeboard[publish]", formData.publish);
    data.append("noticeboard[notice_type]", formData.notice_type);
    data.append("noticeboard[deny]", formData.deny);
    data.append("noticeboard[flag_expire]", formData.flag_expire);
    data.append("noticeboard[canceled_by]", formData.canceled_by);
    data.append("noticeboard[canceler_id]", formData.canceler_id);
    data.append("noticeboard[comment]", formData.comment);
    data.append("noticeboard[shared]", backendSharedValue);
    data.append("noticeboard[of_phase]", formData.of_phase);
    data.append("noticeboard[of_atype]", formData.of_atype);
    data.append("noticeboard[of_atype_id]", formData.of_atype_id);
    data.append("noticeboard[is_important]", formData.is_important);
    data.append("noticeboard[email_trigger_enabled]", formData.email_trigger_enabled);
    if (formData.home_screen_frequency) {
      data.append("noticeboard[home_screen_frequency]", formData.home_screen_frequency);
    }

    // Ratio-wise cover images (new uploads only — File instances)
    coverImageRatios.forEach(({ key }) => {
      if (formData[key] && formData[key].length > 0) {
        const img = formData[key][0];
        if (img?.file instanceof File) {
          data.append(`noticeboard[${key}]`, img.file);
        }
      }
    });

    // Group IDs
    if (Array.isArray(formData.group_id)) {
      formData.group_id.forEach((gid) => data.append("noticeboard[group_id][]", gid));
    } else if (formData.group_id) {
      data.append("noticeboard[group_id][]", formData.group_id);
    }

    // Reminders
    preparedReminders.forEach((reminder, index) => {
      if (reminder.id) data.append(`noticeboard[set_reminders_attributes][${index}][id]`, reminder.id);
      if (reminder._destroy) {
        data.append(`noticeboard[set_reminders_attributes][${index}][_destroy]`, "1");
      } else {
        if (reminder.days) data.append(`noticeboard[set_reminders_attributes][${index}][days]`, reminder.days);
        if (reminder.hours) data.append(`noticeboard[set_reminders_attributes][${index}][hours]`, reminder.hours);
        if (reminder.minutes) data.append(`noticeboard[set_reminders_attributes][${index}][minutes]`, reminder.minutes);
        if (reminder.weeks) data.append(`noticeboard[set_reminders_attributes][${index}][weeks]`, reminder.weeks);
      }
    });

    try {
      await axios.put(`${baseURL}noticeboards/${id}.json`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Broadcast updated successfully!");
      navigate("/noticeboard-list");
    } catch (err) {
      console.error("Error updating broadcast:", err);
      if (err.response?.data) {
        toast.error(`Error: ${err.response.data.message || "Update failed"}`);
      } else {
        toast.error("Failed to update the broadcast. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate(-1);

  // ─── Data Fetching ────────────────────────────────────────────────────────────

  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Authentication required. Please login.");
      navigate("/login");
    }
    if (!id || isNaN(parseInt(id))) {
      toast.error("Invalid broadcast ID");
      navigate("/noticeboard-list");
    }
  }, [id, navigate]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${baseURL}users/get_users.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        setEventUserID(response?.data.users || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Track selected project — also resolves project_name fallback
  useEffect(() => {
    if (formData.project_ids?.length > 0 && projects.length > 0) {
      const project = projects.find(
        (p) =>
          p.id === formData.project_ids[0] ||
          p.id?.toString() === formData.project_ids[0]?.toString()
      );
      setSelectedProject(project || null);
    } else if (projectNameFallback && projects.length > 0) {
      // API returned no project_id; match by project_name
      const matched = projects.find((p) => p.project_name === projectNameFallback);
      if (matched) {
        setFormData((prev) => ({ ...prev, project_ids: [matched.id] }));
        setProjectNameFallback("");
      }
    } else {
      setSelectedProject(null);
    }
  }, [formData.project_ids, projects, projectNameFallback]);

  // Fetch noticeboard by ID
  useEffect(() => {
    const fetchNoticeboardData = async () => {
      if (!id) return;
      setFetchLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          toast.error("Authentication required. Please login.");
          navigate("/login");
          return;
        }

        // Fetch projects and noticeboard in parallel
        const [nbRes, projRes] = await Promise.all([
          axios.get(`${baseURL}noticeboards/${id}.json`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }),
          axios.get(`${baseURL}projects.json`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          }),
        ]);

        // Always update projects from the parallel fetch
        const fetchedProjects = projRes.data.projects || [];
        projectsRef.current = fetchedProjects;
        setProjects(fetchedProjects);

        // API returns a flat object directly (not wrapped in { noticeboard: {...} })
        const d = nbRes.data.noticeboard ?? nbRes.data;

        if (!d || !d.id) {
          toast.error("No data returned from server.");
          return;
        }

        // Convert boolean/number/string → "1" or "0"
        const toBoolStr = (val, def = "") => {
          if (val === true || val === 1 || val === "1") return "1";
          if (val === false || val === 0 || val === "0") return "0";
          return def;
        };

        // Map backend shared → frontend
        let frontendSharedValue = "all";
        if (d.shared === 1 || d.shared === "1" || d.shared === true) {
          frontendSharedValue = d.group_ids?.length > 0 ? "group" : "individual";
        }

        // Build project_ids:
        // Priority 1: shared_notices array (multi-project)
        // Priority 2: root project_id (single project)
        // Priority 3: match project_name against projects list
        let projectIds = [];
        if (Array.isArray(d.shared_notices) && d.shared_notices.length > 0) {
          projectIds = d.shared_notices.map((sn) => sn.project_id).filter(Boolean);
        } else if (d.project_id) {
          projectIds = [d.project_id];
        } else if (d.project_name) {
          const allProjects = projRes
            ? projRes.data.projects || []
            : projectsRef.current;
          const matched = allProjects.find((p) => p.project_name === d.project_name);
          if (matched) projectIds = [matched.id];
        }

        setFormData({
          project_ids: projectIds,
          notice_heading: d.notice_heading || "",
          notice_text: d.notice_text || "",
          active: toBoolStr(d.active, "1"),
          IsDelete: toBoolStr(d.IsDelete, "0"),
          expire_time: d.expire_time
            ? new Date(d.expire_time).toISOString().slice(0, 16)
            : "",
          user_id: Array.isArray(d.user_ids)
            ? d.user_ids.join(",")
            : d.user_id?.toString() || "",
          publish: d.publish?.toString() || "1",
          notice_type: d.notice_type || "",
          deny: d.deny?.toString() || "0",
          flag_expire: toBoolStr(d.flag_expire, "1"),
          canceled_by: d.canceled_by || "",
          canceler_id: d.canceler_id?.toString() || "",
          comment: d.comment || "",
          shared: frontendSharedValue,
          group_id: d.group_ids || [],
          of_phase: d.of_phase || "",
          of_atype: d.of_atype || "",
          of_atype_id: d.of_atype_id?.toString() || "",
          is_important: toBoolStr(d.is_important, ""),
          email_trigger_enabled: d.email_trigger_enabled != null
            ? toBoolStr(d.email_trigger_enabled, "")
            : "",
          home_screen_frequency: d.home_screen_frequency || "",
          set_reminders_attributes: d.reminders || d.set_reminders_attributes || [],
          cover_image: processImageData(d.cover_image),
          cover_image_1_by_1: processImageData(d.cover_image_1_by_1),
          cover_image_9_by_16: processImageData(d.cover_image_9_by_16),
          cover_image_3_by_2: processImageData(d.cover_image_3_by_2),
          cover_image_16_by_9: processImageData(d.cover_image_16_by_9),
        });

      } catch (err) {
        console.error("Error fetching noticeboard data:", err);
        if (err.response?.status === 401) {
          toast.error("Authentication failed. Please login again.");
          navigate("/login");
        } else if (err.response?.status === 404) {
          toast.error("Broadcast not found.");
          navigate("/noticeboard-list");
        } else {
          toast.error("Failed to fetch broadcast data. Please try again.");
        }
      } finally {
        setFetchLoading(false);
      }
    };

    fetchNoticeboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch groups when shared === group
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${baseURL}usergroups.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        const groupsData = Array.isArray(response.data)
          ? response.data
          : response.data.usergroups || [];
        setGroups(groupsData);
      } catch (err) {
        console.error("Error fetching groups:", err);
      }
    };
    if (formData.shared === "group" && groups.length === 0) fetchGroups();
  }, [formData.shared]);

  // ─── Render ───────────────────────────────────────────────────────────────────

  if (fetchLoading) {
    return (
      <div
        className="main-content d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading broadcast data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="main-content">
        <div className="">
          <div className="module-data-section container-fluid">
            <div className="module-data-section p-3">
              {/* ── Main Form Card ── */}
              <div className="card mt-4 pb-4 mx-4">
                <div className="card-header">
                  <h3 className="card-title">Edit Broadcast</h3>
                </div>

                <div className="card-body">
                  {loading && (
                    <div className="text-center py-3">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">Updating broadcast...</p>
                    </div>
                  )}
                  {error && <p className="text-danger">{error}</p>}

                  <div className="row">
                    {/* Notice Type */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Notice Type<span className="otp-asterisk"> *</span>
                        </label>
                        <SelectBox
                          options={noticeTypeOptions}
                          value={formData.notice_type || ""}
                          onChange={(value) => {
                            const isRoadblock = value === "roadblock";
                            setFormData((prev) => ({
                              ...prev,
                              notice_type: value,
                              is_important: isRoadblock ? "1" : prev.is_important,
                            }));
                          }}
                        />
                      </div>
                    </div>

                    {/* Project – Multi Select with checkboxes */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Project<span className="otp-asterisk"> *</span>
                        </label>
                        <MultiSelectBox
                          isCheckbox
                          options={projects.map((project) => ({
                            label: project.project_name,
                            value: project.id,
                          }))}
                          value={
                            Array.isArray(formData.project_ids)
                              ? formData.project_ids
                                  .map((pid) => {
                                    const proj = projects.find(
                                      (p) =>
                                        p.id === pid ||
                                        p.id?.toString() === pid?.toString()
                                    );
                                    return proj
                                      ? { value: proj.id, label: proj.project_name }
                                      : null;
                                  })
                                  .filter(Boolean)
                              : []
                          }
                          onChange={(selectedOptions) =>
                            setFormData((prev) => ({
                              ...prev,
                              project_ids: selectedOptions.map((opt) => opt.value),
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* Notice Heading */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Notice Heading</label>
                        <input
                          className="form-control"
                          type="text"
                          name="notice_heading"
                          placeholder="Enter Notice Heading"
                          value={formData.notice_heading}
                          onChange={handleChange}
                          required={formData.notice_type !== "roadblock"}
                        />
                      </div>
                    </div>

                    {/* Notice Text */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Notice Text</label>
                        <textarea
                          className="form-control"
                          rows={1}
                          name="notice_text"
                          placeholder="Enter Notice Text"
                          value={formData.notice_text}
                          onChange={handleChange}
                          required={formData.notice_type !== "roadblock"}
                        />
                      </div>
                    </div>

                    {/* Frequency – Roadblock only */}
                    {formData.notice_type === "roadblock" && (
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>
                            Home Screen Display Frequency
                            <span className="otp-asterisk"> *</span>
                          </label>
                          <SelectBox
                            options={frequencyOptions}
                            value={formData.home_screen_frequency || ""}
                            onChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                home_screen_frequency: value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}

                    {/* Expire Time */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Expire Time<span className="otp-asterisk"> *</span>
                        </label>
                        <input
                          className="form-control"
                          type="datetime-local"
                          name="expire_time"
                          value={formData.expire_time}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Comment
                          {formData.notice_type !== "roadblock" && (
                            <span className="otp-asterisk"> *</span>
                          )}
                        </label>
                        <textarea
                          className="form-control"
                          rows={1}
                          name="comment"
                          placeholder="Enter Comment"
                          value={formData.comment}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Mark Important */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Mark Important</label>
                        <div className="d-flex">
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="is_important"
                              value="1"
                              checked={formData.is_important === "1"}
                              onChange={handleChange}
                              disabled={formData.notice_type === "roadblock"}
                            />
                            <label className="form-check-label" style={{ color: "black" }}>
                              Yes
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="is_important"
                              value="0"
                              checked={formData.is_important === "0"}
                              onChange={handleChange}
                              disabled={formData.notice_type === "roadblock"}
                            />
                            <label className="form-check-label" style={{ color: "black" }}>
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Send Email */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Send Email</label>
                        <div className="d-flex">
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="email_trigger_enabled"
                              value="1"
                              checked={formData.email_trigger_enabled === "1"}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" style={{ color: "black" }}>
                              Yes
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="email_trigger_enabled"
                              value="0"
                              checked={formData.email_trigger_enabled === "0"}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" style={{ color: "black" }}>
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Active Status */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Active Status</label>
                        <div className="d-flex">
                          <div className="form-check me-3">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="active"
                              value="1"
                              checked={formData.active === "1"}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" style={{ color: "black" }}>
                              Active
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="active"
                              value="0"
                              checked={formData.active === "0"}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" style={{ color: "black" }}>
                              Inactive
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── File Upload Card ── */}
              <div className="card mt-3 pb-4 mx-4">
                <div className="card-header3">
                  <h3 className="card-title">File Upload</h3>
                </div>
                <div className="card-body mt-0 pb-0">
                  <div className="d-flex justify-content-between align-items-end mx-1">
                    <h5 className="mt-3">
                      Broadcast Cover Image{" "}
                      <span
                        className="tooltip-container"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        [i]
                        {showTooltip && (
                          <span className="tooltip-text">
                            Max Upload Size 5 MB. Single image per aspect ratio
                            (16:9, 1:1, 9:16, 3:2)
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
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
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
                        onContinue={(validImages) => handleCroppedImages(validImages)}
                      />
                    )}
                  </div>

                  <div className="col-md-12 mt-2">
                    <p className="text-muted mb-2">
                      <i className="bi bi-info-circle"></i> Cover images: Only one
                      image per aspect ratio will be used
                    </p>
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
                                file.preview ||
                                file.document_url ||
                                file.url ||
                                file.file_url ||
                                "";
                              const name =
                                file.name ||
                                file.document_file_name ||
                                file.filename ||
                                `Cover Image ${index + 1}`;
                              const ratio = file.ratio || label;

                              return (
                                <tr key={`${key}-${index}`}>
                                  <td>{name}</td>
                                  <td>
                                    {preview ? (
                                      <img
                                        src={preview}
                                        alt="Preview"
                                        style={{
                                          width: "50px",
                                          height: "50px",
                                          objectFit: "cover",
                                        }}
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                          if (e.target.nextSibling)
                                            e.target.nextSibling.style.display = "block";
                                        }}
                                      />
                                    ) : null}
                                    <span
                                      style={{
                                        display: preview ? "none" : "block",
                                        fontSize: "12px",
                                        color: "#666",
                                      }}
                                    >
                                      No Preview
                                    </span>
                                  </td>
                                  <td>{ratio}</td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-danger btn-sm"
                                      disabled={removingImageId === file.id}
                                      onClick={async () =>
                                        await handleImageRemoval(key, index)
                                      }
                                    >
                                      {removingImageId === file.id
                                        ? "Removing..."
                                        : "Remove"}
                                    </button>
                                  </td>
                                </tr>
                              );
                            });
                          })}

                          {coverImageRatios.every(({ key }) => {
                            const files = Array.isArray(formData[key])
                              ? formData[key]
                              : [];
                            return files.length === 0;
                          }) && (
                            <tr>
                              <td colSpan="4" className="text-center">
                                No cover images uploaded
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Action Buttons ── */}
              <div className="row justify-content-center mt-3">
                <div className="col-md-2">
                  <button
                    onClick={handleSubmit}
                    type="submit"
                    className="purple-btn2 w-100"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update"}
                  </button>
                </div>
                <div className="col-md-2">
                  <button
                    type="button"
                    className="purple-btn2 w-100"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NoticeboardEdit;