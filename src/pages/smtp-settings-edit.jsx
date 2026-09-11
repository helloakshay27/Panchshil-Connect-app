import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail } from "lucide-react";
import SelectBox from "../components/base/SelectBox";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const AUTHENTICATION_OPTIONS = [
  { value: "plain", label: "Plain" },
  { value: "login", label: "Login" },
  { value: "cram_md5", label: "CRAM-MD5" },
];

const SMTPSettingsEdit = () => {
  const connectEvents = useConnectEvents();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    address: "",
    port: "",
    user_name: "",
    password: "",
    authentication: "plain",
    email: "",
    company_name: "",
  });

  useEffect(() => {
    const fetchSMTPData = async () => {
      try {
        setFetchingData(true);
        const response = await axios.get(`${baseURL}smtp_settings/${id}.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        const smtpData = response.data.smtp_setting || response.data;
        setFormData({
          address: smtpData.address || "",
          port: smtpData.port || "",
          user_name: smtpData.user_name || "",
          password: smtpData.password || "",
          authentication: smtpData.authentication || "plain",
          email: smtpData.email || "",
          company_name: smtpData.company_name || "",
        });
      } catch (error) {
        console.error("Error fetching SMTP data:", error);
        toast.error("Failed to fetch SMTP settings data");
        navigate("/setup-member/smtp-settings-list");
      } finally {
        setFetchingData(false);
      }
    };

    if (id) {
      fetchSMTPData();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue =
      name === "port" ? (value === "" ? "" : Number(value)) : value;
    setFormData({ ...formData, [name]: processedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    if (!formData.address.trim()) {
      toast.error("SMTP Address is required.");
      setLoading(false);
      return;
    }

    if (!formData.port || formData.port <= 0) {
      toast.error("Valid port number is required.");
      setLoading(false);
      return;
    }

    if (!formData.user_name.trim()) {
      toast.error("Username is required.");
      setLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      toast.error("Password is required.");
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (!formData.company_name.trim()) {
      toast.error("Company name is required.");
      setLoading(false);
      return;
    }

    try {
      const jsonPayload = {
        smtp_setting: {
          address: formData.address.trim(),
          port: Number(formData.port),
          user_name: formData.user_name.trim(),
          password: formData.password.trim(),
          authentication: formData.authentication,
          email: formData.email.trim(),
          company_name: formData.company_name.trim(),
        },
      };

      await axios.put(`${baseURL}smtp_settings/${id}.json`, jsonPayload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      connectEvents.onRecordSaved({ mode: "updated" });
      toast.success("SMTP settings updated successfully!");
      navigate("/setup-member/smtp-settings-list");
    } catch (error) {
      console.error("Error updating SMTP settings:", error);

      if (
        typeof error.response?.data === "string" &&
        error.response.data.includes("<!DOCTYPE html>")
      ) {
        toast.error(
          "Server error occurred. Please check the console and contact support.",
        );
      } else if (error.response?.status === 422) {
        const errors = error.response.data?.errors;
        if (errors) {
          Object.keys(errors).forEach((key) => {
            errors[key].forEach((errorMsg) => {
              toast.error(`${key}: ${errorMsg}`);
            });
          });
        } else {
          toast.error("Validation failed. Please check your inputs.");
        }
      } else if (error.response?.status === 401) {
        toast.error("Unauthorized. Please login again.");
      } else if (error.response?.status === 404) {
        toast.error("SMTP settings not found. It may have been deleted.");
      } else if (error.response?.status >= 500) {
        toast.error("Server error. Please try again later or contact support.");
      } else {
        toast.error("Failed to update SMTP settings. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/setup-member/smtp-settings-list");
  };

  if (fetchingData) {
    return (
      <div className="main-content">
        <div className="module-data-section banner-form-page p-3">
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <Mail size={16} strokeWidth={1.8} />
                </span>
                Loading...
              </h3>
            </div>
            <div className="card-body">
              <p className="mb-0 text-muted">Loading SMTP settings data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        <form onSubmit={handleSubmit}>
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <Mail size={16} strokeWidth={1.8} />
                </span>
                Edit SMTP Settings
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="SMTP Address"
                      required
                      name="address"
                      placeholder="e.g., smtp.gmail.com"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Port"
                      required
                      type="number"
                      name="port"
                      placeholder="e.g., 587"
                      value={formData.port}
                      onChange={handleChange}
                      min={1}
                      max={65535}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Username"
                      required
                      name="user_name"
                      placeholder="Enter SMTP Username"
                      value={formData.user_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <div className="form-control-field">
                      <label
                        className="form-control-field__label"
                        htmlFor="smtp-password"
                      >
                        Password
                        <span className="form-control-field__required"> *</span>
                      </label>
                      <input
                        id="smtp-password"
                        className="form-control-field__input"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter SMTP Password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        style={{ paddingRight: "40px" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: "10px",
                          transform: "translateY(-50%)",
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--red, #de7008)",
                        }}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Authentication"
                      required
                      placeholder="Select Authentication"
                      options={AUTHENTICATION_OPTIONS}
                      value={formData.authentication}
                      onChange={(value) =>
                        setFormData((previous) => ({
                          ...previous,
                          authentication: value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Email"
                      required
                      type="email"
                      name="email"
                      placeholder="e.g., noreply@company.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Company Name"
                      required
                      name="company_name"
                      placeholder="Enter Company Name"
                      value={formData.company_name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="banner-form-actions">
            <button
              type="submit"
              className="banner-form-action-btn"
              disabled={loading || fetchingData}
            >
              {loading ? "Updating..." : "Update"}
            </button>
            <button
              type="button"
              className="banner-form-action-btn"
              onClick={handleCancel}
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

export default SMTPSettingsEdit;
