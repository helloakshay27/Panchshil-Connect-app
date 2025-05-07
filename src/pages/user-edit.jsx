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

  // State for dropdown options
  const [roles, setRoles] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [organizationsLoading, setOrganizationsLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(false);

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
    site_id: "",
  });

  console.log("Form Data:", formData);

  // Fetch dropdown data and user data when component mounts
  useEffect(() => {
    fetchRoles();
    fetchOrganizations();
    fetchCompanies();
    fetchUserData();
  }, [id]);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setFetchingUser(true);
      const response = await axios.get(`${baseURL}/user_details/${id}.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      console.log("API Response:", response.data);

      const userData =
        response.data.users ||
        response.data.data ||
        (Array.isArray(response.data) ? response.data[0] : response.data);

      if (!userData) {
        throw new Error("Invalid user data structure in API response");
      }

      if (userData?.birth_date) {
        try {
          const [day, month, year] = userData.birth_date.split("-");
          userData.birth_date = `${year}-${month.padStart(
            2,
            "0"
          )}-${day.padStart(2, "0")}`;
        } catch (error) {
          console.warn("Could not parse birth_date:", error);
          userData.birth_date = "";
        }
      }

      console.log(response.data);
      setFormData({
        organization_id: response.data.organization_id,
        company_id: response.data.company_id,
        role_id: response.data.role_id,
        firstname: response.data.firstname,
        lastname: response.data.lastname,
        mobile: response.data.mobile,
        email: response.data.email,
        alternate_email1: response.data.alternate_email1,
        alternate_email2: response.data.alternate_email2,
        alternate_address: response.data.alternate_address,
        is_admin: response.data.is_admin,
        employee_type: response.data.employee_type,
        user_title: response.data.user,
        gender: response.data.gender,
        birth_date: response.data.birth_date,
        blood_group: response.data.blood_group,
        site_id: response.data.site_id,
        department_id: response.data.department_id,
        country_code: response.data.country_code,
      });

      setFormData(userData);

      setFetchingUser(false);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error(
        `Failed to fetch user details: ${
          error.response?.data?.message || error.message
        }`
      );
      setFetchingUser(false);
    }
  };

  // Fetch roles from API
  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const response = await axios.get(`${baseURL}lock_roles.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.data && Array.isArray(response.data)) {
        setRoles(response.data);
      } else {
        console.error("Invalid roles data format:", response.data);
        toast.error("Failed to load roles: Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles. Please try again later.");
    } finally {
      setRolesLoading(false);
    }
  };

  // Fetch organizations from API
  const fetchOrganizations = async () => {
    setOrganizationsLoading(true);
    try {
      const response = await axios.get(`${baseURL}organizations.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (
        response.data &&
        response.data.organizations &&
        Array.isArray(response.data.organizations)
      ) {
        setOrganizations(response.data.organizations);
      } else {
        console.error("Invalid organizations data format:", response.data);
        toast.error("Failed to load organizations: Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      toast.error("Failed to load organizations. Please try again later.");
    } finally {
      setOrganizationsLoading(false);
    }
  };

  // Fetch companies from API
  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    try {
      const response = await axios.get(`${baseURL}company_setups.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.data && Array.isArray(response.data.company_setups)) {
        setCompanies(response.data.company_setups);
      } else {
        console.error("Invalid companies data format:", response.data);
        toast.error("Failed to load companies: Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to load companies. Please try again later.");
    } finally {
      setCompaniesLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    const requiredFields = [
      { field: "firstname", label: "First Name" },
      { field: "lastname", label: "Last Name" },
      { field: "mobile", label: "Mobile Number" },
      { field: "email", label: "Email" },
      { field: "role_id", label: "Role" },
      { field: "company_id", label: "Company" },
    ];

    let emptyFields = requiredFields.filter(
      ({ field }) => !formData[field] || String(formData[field]).trim() === ""
    );
    if (emptyFields.length === requiredFields.length) {
      toast.dismiss();
      toast.error("Please fill in all the required fields.");
      return false;
    }
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

    if (
      formData.alternate_email1 &&
      !emailRegex.test(formData.alternate_email1)
    ) {
      newErrors.alternate_email1 =
        "Please enter a valid alternate email address";
      isValid = false;
      toast.error("Please enter a valid alternate email address 1");
    }

    if (
      formData.alternate_email2 &&
      !emailRegex.test(formData.alternate_email2)
    ) {
      newErrors.alternate_email2 =
        "Please enter a valid alternate email address";
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
    let formattedData = { ...formData };
    if (formData?.birth_date) {
      const [year, month, day] = formData.birth_date.split("-");
      formattedData.birth_date = `${day}-${month}-${year}`;
    }

    // Create user object from form data
    const data = new FormData();
    // formDataToSend.append("company_setup[name]", formData.companyName);
    data.append("user[organization_id]", formData.organization_id);
    data.append("user[company_id]", formData.company_id);
    data.append("user[role_id]", formData.role_id);
    data.append("user[firstname]", formData.firstname);
    data.append("user[lastname]", formData.lastname);
    data.append("user[mobile]", formData.mobile);
    data.append("user[email]", formData.email);
    data.append("user[alternate_email1]", formData.alternate_email1);
    // data.append(
    //   "user[alternate_email2]",
    //   formData.alternate_email2
    // );
    data.append("user[alternate_address]", formData.alternate_address);
    // data.append("user[is_admin]", formData.is_admin);
    data.append("user[employee_type]", formData.employee_type);
    data.append("user[user_title]", formData.user_title);
    data.append("user[gender]", formData.gender);
    data.append("user[birth_date]", formData.birth_date);
    // data.append("user[blood_group]", formData.blood_group);
    data.append("user[site_id]", formData.site_id);
    data.append("user[department_id]", formData.department_id);
    // data.append("user[country_code]", formData.country_code);

    try {
      // Using the user_details endpoint for updating user
      const response = await axios.put(`${baseURL}users/${id}.json`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      toast.success("User updated successfully");
      console.log("Response from API:", response.data);
      navigate("/setup-member/user-list"); // Adjust this navigation path as needed
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error updating user: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); 
  };

  if (formData?.birth_date) {
    const [day, month, year] = formData.birth_date.split("-");
    
    if (day && month && year) {
      formData.birth_date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  } else {
    //FallBack
    console.warn("birth_date is null or undefined");
  }
  

  const formatDateToDisplay = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}-${month}-${year}`;
  };

  if (formData.birth_date) {
    const [day, month, year] = formData.birth_date.split("-");
    if (day && month && year) {
      formData.birth_date = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
    }
  }

  // Prepare dropdown options
  const roleOptions = [
    { label: "Select Role", value: "" },
    ...roles.map((role) => ({
      label: role.name || `Role ${role.id}`,
      value: role.id.toString(),
    })),
  ];

  const organizationOptions = [
    { label: "Select Organization", value: "" },
    ...organizations.map((org) => ({
      label: org.name || `Organization ${org.id}`,
      value: org.id.toString(),
    })),
  ];

  const companyOptions = [
    { label: "Select Company", value: "" },
    ...companies.map((company) => ({
      label: company.name || `Company ${company.id}`,
      value: company.id.toString(),
    })),
  ];

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
                          <label>
                            First Name <span className="otp-asterisk">*</span>
                          </label>
                          <input
                            className={`form-control ${
                              errors.firstname ? "is-invalid" : ""
                            }`}
                            type="text"
                            name="firstname"
                            placeholder="Enter firstname"
                            value={formData.firstname}
                            onChange={handleChange}
                          />
                          {errors.firstname && (
                            <div className="invalid-feedback">
                              {errors.firstname}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Last Name */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>
                            Last Name <span className="otp-asterisk">*</span>
                          </label>
                          <input
                            className={`form-control ${
                              errors.lastname ? "is-invalid" : ""
                            }`}
                            type="text"
                            name="lastname"
                            placeholder="Enter lastname"
                            value={formData.lastname}
                            onChange={handleChange}
                          />
                          {errors.lastname && (
                            <div className="invalid-feedback">
                              {errors.lastname}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mobile */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>
                            Mobile Number{" "}
                            <span className="otp-asterisk">*</span>
                          </label>
                          <input
                            className={`form-control ${
                              errors.mobile ? "is-invalid" : ""
                            }`}
                            type="text"
                            name="mobile"
                            placeholder="Enter mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            maxLength={10}
                          />
                          {errors.mobile && (
                            <div className="invalid-feedback">
                              {errors.mobile}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>
                            Email <span className="otp-asterisk">*</span>
                          </label>
                          <input
                            className={`form-control ${
                              errors.email ? "is-invalid" : ""
                            }`}
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={handleChange}
                          />
                          {errors.email && (
                            <div className="invalid-feedback">
                              {errors.email}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Alternate Email 1 */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Alternate Email </label>
                          <input
                            className={`form-control ${
                              errors.alternate_email1 ? "is-invalid" : ""
                            }`}
                            type="email"
                            name="alternate_email1"
                            placeholder="Enter alternate email"
                            value={formData.alternate_email1 || ""}
                            onChange={handleChange}
                          />
                          {errors.alternate_email1 && (
                            <div className="invalid-feedback">
                              {errors.alternate_email1}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Alternate Address */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Address</label>
                          <input
                            className="form-control"
                            type="text"
                            name="alternate_address"
                            placeholder="Enter address"
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
                      {/* <div className="col-md-3">
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
                      </div> */}

                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Gender</label>
                          <SelectBox
                            options={[
                              { label: "Male", value: "Male" },
                              { label: "Female", value: "Female" },
                              { label: "Other", value: "Other" },
                            ]}
                            defaultValue={formData.gender}
                            onChange={(value) =>
                              setFormData((prev) => ({
                                ...prev,
                                gender: value,
                              }))
                            }
                            // isDisableFirstOption={true}
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
                            value={formatDateToDisplay(formData.birth_date)}
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

                      {/* Company Dropdown
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Company <span className="otp-asterisk">*</span></label>
                          <SelectBox
                            name="company_id"
                            value={formData.company_id}
                            onChange={handleChange}
                            options={companyOptions}
                            isLoading={companiesLoading}
                            className={errors.company_id ? "is-invalid" : ""}
                          />
                          {errors.company_id && <div className="invalid-feedback">{errors.company_id}</div>}
                        </div>
                      </div> */}

                      <div className="col-md-3">
                        <div className="form-group">
                          <label>
                            Company
                            <span className="otp-asterisk"> *</span>
                          </label>
                          <SelectBox
                            options={companies.map((comp) => ({
                              label: comp.name,
                              value: comp.id,
                            }))}
                            defaultValue={formData.company_id}
                            onChange={(value) => {
                              setFormData({
                                ...formData,
                                company_id: value,
                              });
                            }}
                          />
                        </div>
                      </div>

                      {/* Organization Dropdown */}
                      {/* <div className="col-md-3">
                        <div className="form-group">
                          <label>Organization</label>
                          <SelectBox
                            name="organization_id"
                            value={formData.organization_id || ""}
                            onChange={handleChange}
                            options={organizationOptions}
                            isLoading={organizationsLoading}
                          />
                        </div>
                      </div> */}

                      <div className="col-md-3">
                        <div className="form-group">
                          <label>
                            Organization Id
                            <span className="otp-asterisk"> *</span>
                          </label>
                          <SelectBox
                            options={organizations.map((org) => ({
                              label: org.name,
                              value: org.id,
                            }))}
                            defaultValue={formData.organization_id}
                            onChange={(value) => {
                              setFormData({
                                ...formData,
                                organization_id: value,
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label>
                            User Role
                            <span className="otp-asterisk"> *</span>
                          </label>
                          <SelectBox
                            options={roles.map((role) => ({
                              label: role.name,
                              value: role.id,
                            }))}
                            defaultValue={formData.role_id}
                            onChange={(value) => {
                              setFormData({
                                ...formData,
                                role_id: value,
                              });
                            }}
                          />
                        </div>
                      </div>

                      {/* Role Dropdown */}
                      {/* <div className="col-md-3">
                        <div className="form-group">
                          <label>User Role <span className="otp-asterisk">*</span></label>
                          <SelectBox
                            name="role_id"
                            value={formData.role_id}
                            onChange={handleChange}
                            options={roleOptions}
                            isLoading={rolesLoading}
                            className={errors.role_id ? "is-invalid" : ""}
                          />
                          {errors.role_id && <div className="invalid-feedback">{errors.role_id}</div>}
                        </div>
                      </div> */}

                      {/* Department ID */}
                      <div className="col-md-3 mt-1">
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
                      <div className="col-md-3 mt-1">
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
