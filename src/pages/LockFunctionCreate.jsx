import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";

const LockFunctionCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [parentFunctions, setParentFunctions] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    action_name: "",
    parent_function: "all_functions", // Default value
    active: 1,
  });

  // Fetch existing lock functions to get possible parent functions
  useEffect(() => {
    const fetchParentFunctions = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/lock_functions.json",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Extract unique parent_function values from the response
        const uniqueParentFunctions = [
          ...new Set(response.data.map((func) => func.parent_function)),
        ].filter(Boolean);

        // Create options for the dropdown
        const parentFunctionOptions = uniqueParentFunctions.map((func) => ({
          id: func,
          name: func,
        }));

        // Add "all_functions" if it's not already in the list
        if (!uniqueParentFunctions.includes("all_functions")) {
          parentFunctionOptions.unshift({
            id: "all_functions",
            name: "all_functions",
          });
        }

        setParentFunctions(parentFunctionOptions);
      } catch (error) {
        console.error("Error fetching parent functions:", error);
        toast.error("Failed to fetch parent functions");
      } finally {
        setLoading(false);
      }
    };

    fetchParentFunctions();
  }, []);

  // Input Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  // Form Validation
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      toast.error("Name is required");
      isValid = false;
    }

    if (!formData.action_name.trim()) {
      newErrors.action_name = "Action name is required";
      toast.error("Action name is required");
      isValid = false;
    }

    if (!formData.parent_function) {
      newErrors.parent_function = "Parent function is required";
      toast.error("Parent function is required");
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const payload = {
        lock_function: {
          name: formData.name,
          action_name: formData.action_name,
          parent_function: formData.parent_function,
          active: formData.active,
          module_id: "1", // Default value as per the example
        },
      };

      await axios.post(
        "https://panchshil-super.lockated.com/lock_functions.json",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Lock function created successfully");
      navigate("/setup-member/lock-function-list");
    } catch (error) {
      console.error("Error creating lock function:", error);
      toast.error(
        `Error creating lock function: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-hidden">
          <div className="module-data-section">
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Create Lock Function</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Name Input */}
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Name
                        <span className="otp-asterisk"> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter function name"
                      />
                      {errors.name && (
                        <span className="error text-danger">{errors.name}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Name Input */}
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Action Name
                        <span className="otp-asterisk"> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="action_name"
                        value={formData.action_name}
                        onChange={handleChange}
                        placeholder="Enter action name"
                      />
                      {errors.action_name && (
                        <span className="error text-danger">
                          {errors.action_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Parent Function Selection */}
                  {/* <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Parent Function
                        <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <SelectBox
                        options={parentFunctions.map((func) => ({
                          label: func.name,
                          value: func.id,
                        }))}
                        Value={formData.parent_function}
                        onChange={(value) =>
                          setFormData({ ...formData, parent_function: value })
                        }
                      />
                      {errors.parent_function && (
                        <span className="error text-danger">
                          {errors.parent_function}
                        </span>
                      )}
                    </div>
                  </div> */}
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Parent Function
                        <span className="otp-asterisk"> *</span>
                      </label>
                      <SelectBox
                        options={[
                          { label: "All Functions", value: "All Functions " }, // Default option
                        ]}
                        Value={formData.parent_function}
                        onChange={(value) =>
                          setFormData({ ...formData, parent_function: value })
                        }
                      />
                      {errors.parent_function && (
                        <span className="error text-danger">
                          {errors.parent_function}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row mt-3">
                  {/* Active Status */}
                  <div className="col-md-4">
                    <div className="form-group">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="active"
                          id="isActive"
                          checked={formData.active === 1}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="isActive">
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="row mt-4 justify-content-center">
            <div className="col-md-3">
              <button
                onClick={handleSubmit}
                className="purple-btn2 w-100"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
            <div className="col-md-3">
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
    </>
  );
};

export default LockFunctionCreate;
