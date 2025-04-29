import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { baseURL } from "./baseurl/apiDomain";

const LockRoleCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [lockFunctions, setLockFunctions] = useState([]);
  const [permissionsHash, setPermissionsHash] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    display_name: "",
    active: 1,
    role_for: "pms", // Default value
  });

  // Standard action types based on your image
  const standardActions = ["all", "create", "show", "update", "destroy"];
  const actionLabels = {
    all: "All",
    create: "Add",
    show: "View", 
    update: "Edit",
    destroy: "Disable"
  };

  // Fetch lock functions from API
  useEffect(() => {
    const fetchLockFunctions = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/lock_functions.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Store functions using their name
        setLockFunctions(response.data);

        // Initialize permissions hash using action_name as the key
        const initialPermissions = {};
        response.data.forEach(func => {
          initialPermissions[func.action_name] = {};
          standardActions.forEach(action => {
            initialPermissions[func.action_name][action] = "false";
          });
        });
        
        setPermissionsHash(initialPermissions);
      } catch (error) {
        console.error("Error fetching lock functions:", error);
        toast.error("Failed to fetch lock functions");
      } finally {
        setLoading(false);
      }
    };

    fetchLockFunctions();
  }, []);

  // Input Handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  // Handle permission checkbox changes
  const handlePermissionChange = (actionName, action, checked) => {
    setPermissionsHash(prevPermissions => {
      const updatedPermissions = { ...prevPermissions };
      
      // Update the specific permission
      if (!updatedPermissions[actionName]) {
        updatedPermissions[actionName] = {};
      }
      
      updatedPermissions[actionName][action] = checked ? "true" : "false";
      
      // If "all" is checked, set all actions to true for this function
      if (action === "all" && checked) {
        standardActions.forEach(act => {
          updatedPermissions[actionName][act] = "true";
        });
      }
      
      // If "all" is unchecked, set all actions to false for this function
      if (action === "all" && !checked) {
        standardActions.forEach(act => {
          updatedPermissions[actionName][act] = "false";
        });
      }
      
      // If any other action is unchecked, ensure "all" is also unchecked
      if (action !== "all" && !checked) {
        updatedPermissions[actionName]["all"] = "false";
      }
      
      // If all other actions are checked, set "all" to checked
      if (action !== "all" && checked) {
        const allOtherActionsChecked = standardActions
          .filter(act => act !== "all")
          .every(act => updatedPermissions[actionName][act] === "true");
          
        if (allOtherActionsChecked) {
          updatedPermissions[actionName]["all"] = "true";
        }
      }
      
      return updatedPermissions;
    });
  };

  // Form Validation
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Role title is required";
      toast.error("Role title is required");
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
        lock_role: {
          name: formData.name,
          display_name: formData.name, // Using the same name for display_name
          access_level: null,
          access_to: null,
          active: formData.active,
          role_for: formData.role_for,
        },
        permissions_hash: permissionsHash,
        lock_modules: null
      };

      await axios.post(
        `${baseURL}/lock_roles.json`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Lock role created successfully");
      navigate("/setup-member/lock-role-list");
    } catch (error) {
      console.error("Error creating lock role:", error);
      toast.error(
        `Error creating lock role: ${
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
      {/* <div className="main-content"> */}
        <div className="module-data-section">
          {/* <div className="module-data-section"> */}
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Create Lock Role</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Role Title Input (Name) */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        Role Title
                        <span className="otp-asterisk"> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter role title"
                      />
                      {errors.name && (
                        <span className="error text-danger">{errors.name}</span>
                      )}
                    </div>
                  </div>

                  {/* Active Status */}
                  <div className="col-md-6">
                    <div className="form-group mt-4">
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

                {/* Permissions Table Structure (without table header, as requested) */}
                <div className="row mt-4">
                  <div className="col-12">
                  <div className="tbl-container mt-3 ">
                  <table className="w-100">
                        <thead>
                          <tr className="bg-light">
                            <th style={{width: "30%"}}>Function</th>
                            {standardActions.map(action => (
                              <th key={action} className="text-center">{actionLabels[action]}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {!loading &&
                            lockFunctions.map((func) => (
                              <tr key={func.id}>
                                <td>{func.name}</td>
                                {standardActions.map(action => (
                                  <td key={`${func.action_name}-${action}`} className="text-center">
                                    <input
                                      type="checkbox"
                                      className="form-check-input"
                                      checked={permissionsHash[func.action_name]?.[action] === "true"}
                                      onChange={(e) =>
                                        handlePermissionChange(
                                          func.action_name,
                                          action,
                                          e.target.checked
                                        )
                                      }
                                    />
                                  </td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/* </div> */}

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
      {/* </div> */}
    </>
  );
};

export default LockRoleCreate;