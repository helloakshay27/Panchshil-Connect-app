import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";

const LoanManagerAdd = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${baseURL}projects.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Error fetching projects");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const validateForm = () => {
    let newErrors = {};
    
    // if (!formData.name.trim()) {
    //   newErrors.name = "Name is mandatory";
    // }
    
    // if (!formData.email.trim()) {
    //   newErrors.email = "Email is mandatory";
    // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    //   newErrors.email = "Please enter a valid email address";
    // }
    
    // if (!formData.mobile.trim()) {
    //   newErrors.mobile = "Mobile number is mandatory";
    // } else if (!/^\d{10}$/.test(formData.mobile)) {
    //   newErrors.mobile = "Please enter a valid 10-digit mobile number";
    // }
    
    // if (!formData.project_id) {
    //   newErrors.project_id = "Project is mandatory";
    // }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const payload = {
        loan_manager: {
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          project_id: parseInt(formData.project_id),
          active: formData.active,
        },
      };

      console.log("Data to be sent:", payload);

      await axios.post(`${baseURL}loan_managers.json`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Loan Manager created successfully");
      navigate("/setup-member/loan-manager-list");
    } catch (error) {
      console.error("Error creating loan manager:", error);
      
      if (error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        setErrors(serverErrors);
        
        // Show specific error messages
        Object.keys(serverErrors).forEach(key => {
          toast.error(`${key}: ${serverErrors[key].join(', ')}`);
        });
      } else {
        toast.error(`Error creating loan manager: ${error.message}`);
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="main-content">
      <style jsx>{`
        .btn-primary {
          background: #f1f5f9;
          color: #1f2937;
          padding: 8px 16px;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          margin-left: 10px;
          height: 38px;
          display: inline-flex;
          align-items: center;
        }
        .btn-primary:hover {
          background: #e2e8f0;
        }
        .sticky-footer {
          position: sticky;
          bottom: 0;
          background: white;
          padding-top: 16px;
          z-index: 10;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #cbd5e0;
          border-radius: 4px;
          font-size: 14px;
        }
        .form-control:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
        }
        .text-danger {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
        }
        .otp-asterisk {
          color: #ef4444;
        }
        .form-check {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .form-check-input {
          width: auto;
        }
      `}</style>

      <div className="module-data-section container-fluid overflow-hidden">
        <div className="module-data-section">
          <div className="card mt-4 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Create Loan Manager</h3>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Name Input */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Name
                        {/* <span className="otp-asterisk"> *</span> */}
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                      />
                      {errors.name && (
                        <div className="text-danger">{errors.name}</div>
                      )}
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Email
                        {/* <span className="otp-asterisk"> *</span> */}
                      </label>
                      <input
                        className="form-control"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <div className="text-danger">{errors.email}</div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Input */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Mobile
                        {/* <span className="otp-asterisk"> *</span> */}
                      </label>
                      <input
                        className="form-control"
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="Enter 10-digit mobile number"
                        maxLength="10"
                      />
                      {errors.mobile && (
                        <div className="text-danger">{errors.mobile}</div>
                      )}
                    </div>
                  </div>

                  {/* Project Select */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Project
                        {/* <span className="otp-asterisk"> *</span> */}
                      </label>
                      {loading ? (
                        <div>Loading projects...</div>
                      ) : (
                        <SelectBox
                          options={projects.map((project) => ({
                            label: project.project_name,
                            value: project.id,
                          }))}
                          value={formData.project_id}
                          onChange={(value) =>
                            setFormData({ ...formData, project_id: value })
                          }
                          placeholder="Select a project"
                        />
                      )}
                      {errors.project_id && (
                        <div className="text-danger">{errors.project_id}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  {/* Active Status */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="active"
                          id="active"
                          checked={formData.active}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="active">
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="row mt-4 sticky-footer justify-content-center">
            <div className="col-md-2">
              <button
                onClick={handleSubmit}
                className="purple-btn2 w-100"
                disabled={loading || isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Submit"}
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
  );
};

export default LoanManagerAdd;