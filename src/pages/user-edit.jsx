import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";

const UserEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get user ID from URL params
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    mobile: "",
    email: "",
    role_id: "",
    company_id: "",
    department_id: "",
    country_code: "91",
    alternate_email1: "",
    alternate_email2: "",
    alternate_address: "",
    is_admin: false,
    employee_type: "",
    organization_id: "",
    user_title: "",
    gender: "",
    birth_date: "",
    blood_group: "",
    site_id: ""
  });

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setFetchingUser(true);
        // Using the users/get_users.json endpoint for fetching user details
        const response = await axios.get(
          `${baseURL}users/get_users.json`,
          {
            params: { id: id }, // Send ID as a query parameter
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        // Get user data from the response
        // First check the response structure and access user data properly
        console.log("API Response:", response.data);
        
        // Try to access user data from different possible paths
        const userData = response.data.user || 
                         response.data.data || 
                         (Array.isArray(response.data) ? response.data[0] : response.data);
        
        // Check if we have valid user data
        if (!userData) {
          throw new Error("Invalid user data structure in API response");
        }
        
        // Handle birth_date if it exists
        if (userData.birth_date) {
          try {
            // Convert date format from DD-MM-YYYY to YYYY-MM-DD for input date field
            const [day, month, year] = userData.birth_date.split('-');
            userData.birth_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } catch (error) {
            console.warn("Could not parse birth_date:", error);
            userData.birth_date = ""; // Set to empty if parsing fails
          }
        }
        
        // Convert string IDs to strings to avoid type mismatches in the form
        const processedData = {
          ...userData,
          role_id: userData.role_id?.toString() || "",
          company_id: userData.company_id?.toString() || "",
          organization_id: userData.organization_id?.toString() || "",
          department_id: userData.department_id?.toString() || "",
          site_id: userData.site_id?.toString() || ""
        };
        
        setFormData(processedData);
        setFetchingUser(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error(`Failed to fetch user details: ${error.response?.data?.message || error.message}`);
        setFetchingUser(false);
      }
    };
    
    fetchUserData();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));
  };

  // Validate form data
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;
    
    // Required fields validation
    const requiredFields = [
      { field: "firstname", label: "First Name" },
      { field: "lastname", label: "Last Name" },
      { field: "mobile", label: "Mobile Number" },
      { field: "email", label: "Email" },
      { field: "role_id", label: "Role ID" },
      { field: "company_id", label: "Company ID" }
    ];
    
    // Check all mandatory fields
    let emptyFields = requiredFields.filter(
      ({ field }) => !formData[field] || String(formData[field]).trim() === ""
    );
    
    // If all required fields are empty, show a general message
    if (emptyFields.length === requiredFields.length) {
      toast.dismiss();
      toast.error("Please fill in all the required fields.");
      return false;
    }
    
    // Sequential validation - check one field at a time
    for (const { field, label } of requiredFields) {
      if (!formData[field] || String(formData[field]).trim() === "") {
        newErrors[field] = `${label} is mandatory`;
        setErrors(newErrors);
        toast.dismiss();
        toast.error(`${label} is mandatory`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
      toast.error("Please enter a valid email address");
    }
    
    if (formData.alternate_email1 && !emailRegex.test(formData.alternate_email1)) {
      newErrors.alternate_email1 = "Please enter a valid alternate email address";
      isValid = false;
      toast.error("Please enter a valid alternate email address 1");
    }
    
    if (formData.alternate_email2 && !emailRegex.test(formData.alternate_email2)) {
      newErrors.alternate_email2 = "Please enter a valid alternate email address";
      isValid = false;
      toast.error("Please enter a valid alternate email address 2");
    }
    
    // Mobile validation - should be 10 digits
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number should be 10 digits";
      isValid = false;
      toast.error("Mobile number should be 10 digits");
    }
    
    setErrors(newErrors);
    return isValid && Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    // Format birth date for API if it exists
    let formattedData = {...formData};
    if (formData.birth_date) {
      const [year, month, day] = formData.birth_date.split('-');
      formattedData.birth_date = `${day}-${month}-${year}`;
    }

    // Create user object from form data
    const userData = {
      user: {
        ...formattedData,
        // Convert string IDs to numbers where needed
        role_id: formData.role_id ? parseInt(formData.role_id) : null,
        company_id: formData.company_id ? parseInt(formData.company_id) : null,
        organization_id: formData.organization_id ? parseInt(formData.organization_id) : null,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        site_id: formData.site_id ? parseInt(formData.site_id) : null
      }
    };

    try {
      // Using the user_details endpoint for updating user
      const response = await axios.put(
        `${baseURL}user_details/${id}.json`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      toast.success("User updated successfully");
      console.log("Response from API:", response.data);
      navigate("/users-list"); // Adjust this navigation path as needed
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error updating user: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // This navigates back one step in history
  };

  if (fetchingUser) {
    return (
      <div className="main-content">
        <div className="module-data-section p-3">
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading user data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="">
        <div className="">
          <div className="module-data-section p-3">
            <form onSubmit={handleSubmit} noValidate>
              <div className="card mt-4 pb-4 mx-4">
                <div className="card-header3">
                  <h3 className="card-title">Edit User</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="row">
                      {/* First Name */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>First Name <span className="otp-asterisk">*</span></label>
                          <input
                            className={`form-control ${errors.firstname ? "is-invalid" : ""}`}
                            type="text"
                            name="firstname"
                            placeholder="Enter firstname"
                            value={formData.firstname}
                            onChange={handleChange}
                          />
                          {errors.firstname && <div className="invalid-feedback">{errors.firstname}</div>}
                        </div>
                      </div>

                      {/* Last Name */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Last Name <span className="otp-asterisk">*</span></label>
                          <input
                            className={`form-control ${errors.lastname ? "is-invalid" : ""}`}
                            type="text"
                            name="lastname"
                            placeholder="Enter lastname"
                            value={formData.lastname}
                            onChange={handleChange}
                          />
                          {errors.lastname && <div className="invalid-feedback">{errors.lastname}</div>}
                        </div>
                      </div>

                      {/* Mobile */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Mobile Number <span className="otp-asterisk">*</span></label>
                          <input
                            className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
                            type="text"
                            name="mobile"
                            placeholder="Enter mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            maxLength={10}
                          />
                          {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Email <span className="otp-asterisk">*</span></label>
                          <input
                            className={`form-control ${errors.email ? "is-invalid" : ""}`}
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={handleChange}
                          />
                          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>
                      </div>

                      {/* Country Code */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Country Code</label>
                          <input
                            className="form-control"
                            type="text"
                            name="country_code"
                            placeholder="Enter country code"
                            value={formData.country_code}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Alternate Email 1 */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Alternate Email 1</label>
                          <input
                            className={`form-control ${errors.alternate_email1 ? "is-invalid" : ""}`}
                            type="email"
                            name="alternate_email1"
                            placeholder="Enter alternate email 1"
                            value={formData.alternate_email1 || ""}
                            onChange={handleChange}
                          />
                          {errors.alternate_email1 && <div className="invalid-feedback">{errors.alternate_email1}</div>}
                        </div>
                      </div>

                      {/* Alternate Email 2 */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Alternate Email 2</label>
                          <input
                            className={`form-control ${errors.alternate_email2 ? "is-invalid" : ""}`}
                            type="email"
                            name="alternate_email2"
                            placeholder="Enter alternate email 2"
                            value={formData.alternate_email2 || ""}
                            onChange={handleChange}
                          />
                          {errors.alternate_email2 && <div className="invalid-feedback">{errors.alternate_email2}</div>}
                        </div>
                      </div>

                      {/* Alternate Address */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Alternate Address</label>
                          <input
                            className="form-control"
                            type="text"
                            name="alternate_address"
                            placeholder="Enter alternate address"
                            value={formData.alternate_address || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* User Title */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>User Title</label>
                          <input
                            className="form-control"
                            type="text"
                            name="user_title"
                            placeholder="Enter user title"
                            value={formData.user_title || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Gender</label>
                          <SelectBox
                            name="gender"
                            value={formData.gender || ""}
                            onChange={handleChange}
                            options={[
                              { label: "Select", value: "" },
                              { label: "Male", value: "Male" },
                              { label: "Female", value: "Female" },
                              { label: "Other", value: "Other" },
                            ]}
                          />
                        </div>
                      </div>

                      {/* Birth Date */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Birth Date</label>
                          <input
                            className="form-control"
                            type="date"
                            name="birth_date"
                            value={formData.birth_date || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Blood Group */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Blood Group</label>
                          <input
                            className="form-control"
                            type="text"
                            name="blood_group"
                            placeholder="Enter blood group"
                            value={formData.blood_group || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Employee Type */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Employee Type</label>
                          <input
                            className="form-control"
                            type="text"
                            name="employee_type"
                            placeholder="Enter employee type"
                            value={formData.employee_type || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Company ID */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Company ID <span className="otp-asterisk">*</span></label>
                          <input
                            className={`form-control ${errors.company_id ? "is-invalid" : ""}`}
                            type="text"
                            name="company_id"
                            placeholder="Enter Company ID"
                            value={formData.company_id}
                            onChange={handleChange}
                          />
                          {errors.company_id && <div className="invalid-feedback">{errors.company_id}</div>}
                        </div>
                      </div>

                      {/* Organization ID */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Organization ID</label>
                          <input
                            className="form-control"
                            type="text"
                            name="organization_id"
                            placeholder="Enter Organization ID"
                            value={formData.organization_id || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Role ID */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Role ID <span className="otp-asterisk">*</span></label>
                          <input
                            className={`form-control ${errors.role_id ? "is-invalid" : ""}`}
                            type="text"
                            name="role_id"
                            placeholder="Enter Role ID"
                            value={formData.role_id}
                            onChange={handleChange}
                          />
                          {errors.role_id && <div className="invalid-feedback">{errors.role_id}</div>}
                        </div>
                      </div>

                      {/* Department ID */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Department ID</label>
                          <input
                            className="form-control"
                            type="text"
                            name="department_id"
                            placeholder="Enter Department ID"
                            value={formData.department_id || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Site ID */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Site ID</label>
                          <input
                            className="form-control"
                            type="text"
                            name="site_id"
                            placeholder="Enter Site ID"
                            value={formData.site_id || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Is Admin */}
                      <div className="col-md-3">
                        <div className="form-group mt-4">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="is_admin"
                              name="is_admin"
                              checked={formData.is_admin || false}
                              onChange={handleChange}
                            />
                            <label className="form-check-label" htmlFor="is_admin">
                              Is Admin
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit and Cancel Buttons */}
              <div className="row mt-2 justify-content-center">
                <div className="col-md-2">
                  <button
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEdit;