import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, Layers, Upload } from "lucide-react";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const ServiceCategoryForm = () => {
  const connectEvents = useConnectEvents();
  const [formData, setFormData] = useState({
    service_cat_name: "",
    service_image: "",
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const imageInputRef = useRef(null);

  const navigate = useNavigate();
  const { serviceId } = useParams();
  const isEditMode = !!serviceId;

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  });

  const getMultipartHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  });

  useEffect(() => {
    if (isEditMode && !hasFetched) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const res = await axios.get(
            `${baseURL}service_categories/${serviceId}.json`,
            {
              headers: getAuthHeaders(),
            }
          );

          const categoryData = res.data?.service_category || res.data;

          if (categoryData) {
            setFormData({
              service_cat_name: categoryData.service_cat_name || "",
              service_image: categoryData.service_image || "",
              active:
                categoryData.active !== undefined
                  ? categoryData.active
                  : true,
            });

            if (categoryData.service_image) {
              if (
                typeof categoryData.service_image === "object" &&
                categoryData.service_image.document_url
              ) {
                setImagePreview(categoryData.service_image.document_url);
              } else if (typeof categoryData.service_image === "string") {
                setImagePreview(categoryData.service_image);
              }
            }

            setHasFetched(true);
          }
        } catch (err) {
          console.error("Failed to fetch service category:", err);
          toast.error("Failed to load service category");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [serviceId, isEditMode, hasFetched]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      reader.readAsDataURL(file);

      setFormData((prev) => ({
        ...prev,
        service_image: file.name,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.service_cat_name.trim()) {
      toast.error("Service category name is required");
      return;
    }

    if (!isEditMode && !imageFile) {
      toast.error("Service image is required");
      return;
    }

    setSubmitting(true);

    try {
      let payload;
      let headers;

      if (imageFile) {
        const formDataPayload = new FormData();
        formDataPayload.append(
          "service_category[service_cat_name]",
          formData.service_cat_name
        );
        formDataPayload.append("service_category[service_image]", imageFile);
        formDataPayload.append("service_category[active]", formData.active);

        payload = formDataPayload;
        headers = getMultipartHeaders();
      } else {
        const updateData = {
          service_cat_name: formData.service_cat_name,
          active: formData.active,
        };

        payload = { service_category: updateData };
        headers = getAuthHeaders();
      }

      if (isEditMode) {
        await axios.put(
          `${baseURL}service_categories/${serviceId}.json`,
          payload,
          { headers }
        );
        connectEvents.onRecordSaved({ mode: "updated" });
        toast.success("Service Category updated successfully!");
      } else {
        await axios.post(`${baseURL}service_categories.json`, payload, {
          headers,
        });
        connectEvents.onRecordSaved({ mode: "added" });
        toast.success("Service Category created successfully!");
      }

      navigate("/setup-member/service-category-list");
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to submit form";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        <form onSubmit={handleSubmit}>
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <Layers size={16} strokeWidth={1.8} />
                </span>
                {isEditMode ? "Edit Service Category" : "Create Service Category"}
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Service Category Name"
                      required
                      name="service_cat_name"
                      value={formData.service_cat_name}
                      onChange={handleChange}
                      placeholder="Enter service category name"
                      disabled={loading || submitting}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card banner-form-card banner-attachment-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <FileText size={16} strokeWidth={1.8} />
                </span>
                Add Attachments
              </h3>
            </div>
            <div className="card-body">
              <input
                ref={imageInputRef}
                type="file"
                name="service_image"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading || submitting}
                className="banner-upload-native-input"
              />
              <div className="banner-upload-dropzone">
                <button
                  type="button"
                  className="banner-upload-files-btn"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={loading || submitting}
                >
                  <Upload size={16} strokeWidth={1.8} />
                  Upload Files
                </button>
                <span className="banner-upload-item-label">
                  Service Image
                  {!isEditMode && (
                    <span className="form-control-field__required">*</span>
                  )}
                </span>
              </div>

              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Service preview"
                    style={{
                      maxWidth: "100px",
                      maxHeight: "100px",
                      objectFit: "cover",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="banner-form-actions">
            <button
              type="submit"
              className="banner-form-action-btn"
              disabled={submitting}
            >
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : "Submit"}
            </button>
            <button
              type="button"
              className="banner-form-action-btn"
              onClick={() => navigate("/setup-member/service-category-list")}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceCategoryForm;
