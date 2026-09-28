import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { UserRound } from "lucide-react";
import FormTextField from "../components/base/FormTextField";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const LoanManagerEdit = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    project_id: "",
    active: true,
  });

  useEffect(() => {
    const fetchLoanManager = async () => {
      try {
        const response = await axios.get(`${baseURL}loan_managers/${id}.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (response.data) {
          const loanManagerData = response.data.loan_manager || response.data;
          setFormData({
            name: loanManagerData.name || "",
            email: loanManagerData.email || "",
            mobile: loanManagerData.mobile || "",
            project_id: loanManagerData.project_id || "",
            active:
              loanManagerData.active !== undefined
                ? loanManagerData.active
                : true,
          });
        }
      } catch (error) {
        console.error("Error fetching loan manager:", error);
        toast.error("Failed to fetch loan manager data");
      } finally {
        setLoading(false);
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${baseURL}projects.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to fetch projects");
      }
    };

    fetchLoanManager();
    fetchProjects();
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is mandatory";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is mandatory";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is mandatory";
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.project_id) {
      newErrors.project_id = "Project is mandatory";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    setLoading(true);

    try {
      const response = await axios.put(
        `${baseURL}loan_managers/${id}.json`,
        {
          loan_manager: {
            name: formData.name,
            email: formData.email,
            mobile: formData.mobile,
            project_id: formData.project_id,
            active: formData.active,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200) {
        connectEvents.onRecordSaved({ mode: "updated" });
        toast.success("Loan Manager updated successfully");
        navigate("/setup-member/loan-manager-list");
      }
    } catch (error) {
      console.error("Error updating loan manager:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error("Error updating loan manager. Please try again.");
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  if (loading && !formData.name) {
    return (
      <div className="main-content">
        <div className="module-data-section banner-form-page p-3">
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <UserRound size={16} strokeWidth={1.8} />
                </span>
                Loading...
              </h3>
            </div>
            <div className="card-body">
              <p className="mb-0">Loading loan manager...</p>
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
                  <UserRound size={16} strokeWidth={1.8} />
                </span>
                Edit Loan Manager
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Name"
                      name="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={handleChange}
                      maxLength={100}
                    />
                    {errors.name && (
                      <span className="text-danger">{errors.name}</span>
                    )}
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Email"
                      type="email"
                      name="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleChange}
                      maxLength={100}
                    />
                    {errors.email && (
                      <span className="text-danger">{errors.email}</span>
                    )}
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Mobile"
                      type="tel"
                      name="mobile"
                      placeholder="Enter 10-digit mobile number"
                      value={formData.mobile}
                      onChange={handleChange}
                      maxLength={10}
                    />
                    {errors.mobile && (
                      <span className="text-danger">{errors.mobile}</span>
                    )}
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Project"
                      placeholder="Select Project"
                      options={projects.map((project) => ({
                        label: project.project_name || project.name,
                        value: project.id,
                      }))}
                      value={formData.project_id}
                      onChange={(value) =>
                        setFormData({ ...formData, project_id: value })
                      }
                    />
                    {errors.project_id && (
                      <span className="text-danger">{errors.project_id}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="banner-form-actions">
            <button
              type="submit"
              className="banner-form-action-btn"
              disabled={loading || isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
            <button
              type="button"
              className="banner-form-action-btn"
              onClick={() => navigate("/setup-member/loan-manager-list")}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanManagerEdit;
