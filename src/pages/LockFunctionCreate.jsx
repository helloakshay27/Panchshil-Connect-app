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
  const [showActionName, setShowActionName] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    action_name: "",
    parent_function: "", // Default value
    active: 1,
  });

  // Fetch existing lock functions to get possible parent functions
  useEffect(() => {
    const fetchParentFunctions = async () => {
      try {
        const response = await axios.get(`${baseURL}/lock_functions.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

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

      await axios.post(`${baseURL}/lock_functions.json`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Lock function created successfully");
      navigate("/setup-member/lock-function-list");
    } catch (error) {
      console.error("Error creating lock function:", error);
      toast.error(
        `Error creating lock function: ${error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleNameChange = (value) => {
    let actionName = "";

    if (value === "Project") {
      actionName = "project";
    } else if (value === "Banner") {
      actionName = "banner";
    } else if (value === "Testimonial") {
      actionName = "testimonial";
    } else if (value === "Referral") {
      actionName = "referral";
    } else if (value === "Enquiry") {
      actionName = "enquiry";
    } else if (value === "Event") {
      actionName = "event";
    } else if (value === "Specification") {
      actionName = "specification";
    } else if (value === "Site Visit") {
      actionName = "site_visit";
    } else if (value === "Organization") {
      actionName = "organization";
    } else if (value === "Company") {
      actionName = "company";
    } else if (value === "Department") {
      actionName = "department";
    } else if (value === "Site") {
      actionName = "site";
    } else if (value === "Support Service") {
      actionName = "support_service";
    } else if (value === "Press Releases") {
      actionName = "press_releases";
    } else if (value === "FAQ") {
      actionName = "faq";
    } else if (value === "Referral Program") {
      actionName = "referral_program";
    } else if (value === "User Role") {
      actionName = "user_role";
    } else if (value === "Lock Function") {
      actionName = "lock_function";
    } else if (value === "User Module") {
      actionName = "user_module";
    } else if (value === "Property Type") {
      actionName = "property_type";
    } else if (value === "Project Building") {
      actionName = "project_building";
    } else if (value === "Construction") {
      actionName = "construction";
    } else if (value === "Project Config") {
      actionName = "project_config";
    } else if (value === "Amenities") {
      actionName = "amenities";
    } else if (value === "Visit Slot") {
      actionName = "visit_slot";
    } else if (value === "TDS Tutorials") {
      actionName = "tds_tutorials";
    } else if (value === "Plus Services") {
      actionName = "plus_services";
    } else if (value === "SMTP Settings") {
      actionName = "smtp_settings";
    } else if (value === "FAQ Category") {
      actionName = "faq_category";
    } else if (value === "FAQ SubCategory") {
      actionName = "faq_subcategory";
    } else if (value === "Construction Update") {
      actionName = "construction_update";
    } else if (value === "User Groups") {
      actionName = "user_groups";
    } else if (value === "Service Category") {
      actionName = "service_category";
    } else if (value === "Image Config") {
      actionName = "image_config";
    } else if (value === "Bank Details") {
      actionName = "bank_details";
    } else if (value === "Home Loan") {
      actionName = "home_loan";
    } else if (value === "Banks") {
      actionName = "banks";
    } else if (value === "Loan Manager") {
      actionName = "loan_manager";
    } else if (value === "Common Files") {
      actionName = "common_files";
    } else if (value === "Demand Notes") {
      actionName = "demand_notes";
    } else if (value === "Orders") {
      actionName = "orders";
    } else if (value === "Encash") {
      actionName = "encash";
    } else if (value === "Lock Payments") {
      actionName = "lock_payments";
    } else if (value === "Loyalty Members") {
      actionName = "loyalty_members";
    } else if (value === "Loyalty Tiers") {
      actionName = "loyalty_tiers";
    } else if (value === "Loyalty Section") {
      actionName = "loyalty_section";
    } else if (value === "Referral List") {
      actionName = "referral_list";
    } else if (value === "Rule Engine") {
      actionName = "rule_engine";
    } else if (value === "Loyalty Manager" || value === "Loyalty Managers") {
      actionName = "loyalty_manager";
    }

    setFormData({
      ...formData,
      name: value,
      action_name: actionName, // auto-fill
    });

    setShowActionName(false); // Hide Action Name field
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

                      {/* Changed input to select */}
                      <SelectBox
                        options={[
                          { label: "Project", value: "Project" },
                          { label: "Banner", value: "Banner" },
                          { label: "Testimonial", value: "Testimonial" },
                          { label: "Referral", value: "Referral" },
                          { label: "Enquiry", value: "Enquiry" },
                          { label: "Event", value: "Event" },
                          { label: "Specification", value: "Specification" },
                          { label: "Site Visit", value: "Site Visit" },
                          { label: "Organization", value: "Organization" },
                          { label: "Company", value: "Company" },
                          { label: "Department", value: "Department" },
                          { label: "Site", value: "Site" },
                          {
                            label: "Support Service",
                            value: "Support Service",
                          },
                          { label: "Press Releases", value: "Press Releases" },
                          { label: "FAQ", value: "FAQ" },
                          {
                            label: "Referral Program",
                            value: "Referral Program",
                          },
                          { label: "User Role", value: "User Role" },
                          { label: "Lock Function", value: "Lock Function" },
                          { label: "User Module", value: "User Module" },
                          { label: "User Groups", value: "User Groups" },
                          { label: "Property Type", value: "Property Type" },
                          {
                            label: "Project Building",
                            value: "Project Building",
                          },
                          { label: "Construction", value: "Construction" },
                          { label: "Construction Update", value: "Construction Update" },
                          { label: "Project Config", value: "Project Config" },
                          { label: "Amenities", value: "Amenities" },
                          { label: "Visit Slot", value: "Visit Slot" },
                          { label: "TDS Tutorials", value: "TDS Tutorials" },
                          { label: "Plus Services", value: "Plus Services" },
                          { label: "SMTP Settings", value: "SMTP Settings" },
                          { label: "FAQ Category", value: "FAQ Category" },
                          {
                            label: "FAQ SubCategory",
                            value: "FAQ SubCategory",
                          },
                          {
                            label: "Service Category",
                            value: "Service Category",
                          },
                          { label: "Image Config", value: "Image Config" },
                          { label: "Bank Details", value: "Bank Details" },
                          { label: "Home Loan", value: "Home Loan" },
                          { label: "Banks", value: "Banks" },
                          { label: "Loan Manager", value: "Loan Manager" },
                          { label: "Common Files", value: "Common Files" },
                          { label: "Demand Notes", value: "Demand Notes" },
                          { label: "Orders", value: "Orders" },
                          { label: "Encash", value: "Encash" },
                          { label: "Lock Payments", value: "Lock Payments" },
                          { label: "Loyalty Members", value: "Loyalty Members" },
                          { label: "Loyalty Tiers", value: "Loyalty Tiers" },
                          { label: "Loyalty Section", value: "Loyalty Section" },
                          { label: "Referral List", value: "Referral List" },
                          { label: "Rule Engine", value: "Rule Engine" },
                          { label: "Loyalty Managers", value: "Loyalty Managers"}
                          // Add more if needed
                        ]}
                        Value={formData.name}
                        onChange={(value) => handleNameChange(value)}
                      />

                      {errors.name && (
                        <span className="error text-danger">{errors.name}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Name Field */}
                  {showActionName && ( // Only show if needed
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
                          readOnly // Make it readonly since it fills automatically
                        />
                        {errors.action_name && (
                          <span className="error text-danger">
                            {errors.action_name}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

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
            <div className="col-md-2">
              <button
                onClick={handleSubmit}
                className="purple-btn2 w-100"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
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
    </>
  );
};

export default LockFunctionCreate;
