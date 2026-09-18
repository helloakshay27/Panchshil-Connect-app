import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, Landmark, Upload } from "lucide-react";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const BankForm = () => {
  const connectEvents = useConnectEvents();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    bank_name: "",
    interest_rate: "",
    bank_logo: "",
  });
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  const navigate = useNavigate();
  const { bankId } = useParams();
  const isEditMode = !!bankId;

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      "Content-Type": "application/json",
    },
  });

  const getMultipartHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  useEffect(() => {
    if (isEditMode && !hasFetched) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const res = await axios.get(
            `${baseURL}banks/${bankId}.json`,
            getAuthHeaders(),
          );

          const bankData = res.data?.bank || res.data;

          if (bankData) {
            setFormData({
              bank_name: bankData.bank_name || "",
              interest_rate: bankData.interest_rate || "",
              bank_logo: bankData.bank_logo || "",
            });

            if (bankData.bank_logo) {
              if (
                typeof bankData.bank_logo === "object" &&
                bankData.bank_logo.document_url
              ) {
                setImagePreview(bankData.bank_logo.document_url);
              } else if (typeof bankData.bank_logo === "string") {
                setImagePreview(bankData.bank_logo);
              }
            }

            setHasFetched(true);
          }
        } catch (err) {
          console.error("Failed to fetch bank:", err);
          toast.error("Failed to load bank");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [bankId, isEditMode, hasFetched]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select only image files.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setImagePreview(loadEvent.target.result);
    };
    reader.readAsDataURL(file);
    setFormData((previous) => ({
      ...previous,
      bank_logo: file.name,
    }));
  };

  const removeImage = () => {
    setImageFile(null);
    if (!isEditMode) setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFormData((previous) => ({
      ...previous,
      bank_logo: isEditMode ? previous.bank_logo : "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.bank_name.trim()) {
      toast.error("Bank name is required");
      return;
    }

    if (!formData.interest_rate || formData.interest_rate === "") {
      toast.error("Interest rate is required");
      return;
    }

    if (!isEditMode && !imageFile) {
      toast.error("Bank logo is required");
      return;
    }

    setLoading(true);

    try {
      let payload;
      let requestConfig;

      if (imageFile) {
        const formDataPayload = new FormData();
        formDataPayload.append("bank_name", formData.bank_name);
        formDataPayload.append("interest_rate", formData.interest_rate);
        formDataPayload.append("bank_logo", imageFile);
        payload = formDataPayload;
        requestConfig = getMultipartHeaders();
      } else {
        payload = {
          bank_name: formData.bank_name,
          interest_rate: formData.interest_rate,
        };
        requestConfig = getAuthHeaders();
      }

      if (isEditMode) {
        await axios.put(`${baseURL}banks/${bankId}.json`, payload, requestConfig);
        connectEvents.onRecordSaved({ mode: "updated" });
        toast.success("Bank updated successfully!");
      } else {
        await axios.post(`${baseURL}banks.json`, payload, requestConfig);
        connectEvents.onRecordSaved({ mode: "added" });
        toast.success("Bank created successfully!");
      }

      navigate("/setup-member/banks-list");
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to submit form";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
                  <Landmark size={16} strokeWidth={1.8} />
                </span>
                {isEditMode ? "Edit Bank" : "Create Bank"}
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Bank Name"
                      required
                      name="bank_name"
                      placeholder="Enter bank name"
                      value={formData.bank_name}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Interest Rate (%)"
                      required
                      type="number"
                      name="interest_rate"
                      placeholder="Enter interest rate"
                      value={formData.interest_rate}
                      onChange={handleChange}
                      step="0.1"
                      min="0"
                      disabled={loading}
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
                Bank Logo
              </h3>
            </div>
            <div className="card-body">
              <input
                ref={fileInputRef}
                type="file"
                name="bank_logo"
                accept="image/*"
                onChange={handleImageChange}
                className="banner-upload-native-input"
                disabled={loading}
              />
              <div className="banner-upload-dropzone">
                <button
                  type="button"
                  className="banner-upload-files-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <Upload size={16} strokeWidth={1.8} />
                  Upload Files
                </button>
                <span className="banner-upload-item-label">
                  Bank Logo
                  {!isEditMode && (
                    <span className="form-control-field__required"> *</span>
                  )}
                  <span
                    className="banner-upload-hint tooltip-container"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    [i]
                    {showTooltip && (
                      <span className="tooltip-text">
                        Image file required for new banks
                      </span>
                    )}
                  </span>
                </span>
              </div>

              {imagePreview && (
                <div className="mt-3 position-relative d-inline-block">
                  <img
                    src={imagePreview}
                    alt="Bank logo preview"
                    className="img-thumbnail"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "contain",
                    }}
                  />
                  {imageFile && (
                    <button
                      type="button"
                      className="position-absolute border-0 rounded-circle d-flex align-items-center justify-content-center"
                      title="Remove logo"
                      style={{
                        top: 2,
                        right: -5,
                        height: 20,
                        width: 20,
                        backgroundColor: "var(--red)",
                        color: "white",
                      }}
                      onClick={removeImage}
                    >
                      x
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="banner-form-actions">
            <button
              type="submit"
              className="banner-form-action-btn"
              disabled={loading}
            >
              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update"
                  : "Submit"}
            </button>
            <button
              type="button"
              className="banner-form-action-btn"
              onClick={() => navigate("/setup-member/banks-list")}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankForm;
