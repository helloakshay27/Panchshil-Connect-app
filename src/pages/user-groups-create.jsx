import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import SelectBox from "../components/base/SelectBox";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import MultiSelectBox from "../components/base/MultiSelectBox";
import "./banner-add.css";

const UserGroupCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [eventUserID, setEventUserID] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    company_id: "",
    site_id: "",
    user_id: "",
    active: true,
    member_ids: [],
  });

  console.log("Form Data:", formData);

  // Fetch users, companies, and sites when component mounts
  useEffect(() => {
    fetchUsers();
    fetchCompanies();
    fetchSites();
  }, []);

  // Fetch users from API
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await axios.get(`${baseURL}users/get_users.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else if (response.data && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
      } else {
        console.error("Invalid users data format:", response.data);
        toast.error("Failed to load users: Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users. Please try again later.");
    } finally {
      setUsersLoading(false);
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

  // Fetch sites from API
  const fetchSites = async () => {
    setSitesLoading(true);
    try {
      const response = await axios.get(`${baseURL}sites.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      console.log("Sites API response:", response.data);

      if (response.data && Array.isArray(response.data)) {
        setSites(response.data);
      } else if (response.data && Array.isArray(response.data.sites)) {
        setSites(response.data.sites);
      } else {
        console.error("Invalid sites data format:", response.data);
        toast.error("Failed to load sites: Invalid data format");
      }
    } catch (error) {
      console.error("Error fetching sites:", error);
      toast.error("Failed to load sites. Please try again later.");
    } finally {
      setSitesLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    if (!e || !e.target) return;

    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  // Handle member selection (multiple select)
  const handleMemberSelection = (selectedMembers) => {
    setFormData((prev) => ({
      ...prev,
      member_ids: selectedMembers,
    }));
  };

  // Validate form data
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Required fields validation
    const requiredFields = [
      { field: "name", label: "Group Name" },
      { field: "company_id", label: "Company" },
      { field: "site_id", label: "Site" },
      { field: "user_id", label: "User" },
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
    // for (const { field, label } of requiredFields) {
    //   if (field === "user_id") continue; // Skip validation for user
    //   if (!formData[field] || String(formData[field]).trim() === "") {
    //     newErrors[field] = `${label} is mandatory`;
    //     setErrors(newErrors);
    //     toast.dismiss();
    //     toast.error(`${label} is mandatory`);
    //     return false;
    //   }
    // }

    // Validate member_ids array
    if (formData.member_ids.length === 0) {
      newErrors.member_ids = "At least one member must be selected";
      setErrors(newErrors);
      toast.dismiss();
      toast.error("At least one member must be selected");
      return false;
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

    // Prepare the data according to the API structure
    const requestData = {
      usergroup: {
        name: formData.name,
        company_id: parseInt(formData.company_id),
        site_id: parseInt(formData.site_id),
        user_id: parseInt(formData.user_id),
        active: formData.active,
        member_ids: formData.member_ids.map((id) => parseInt(id)),
      },
    };

    try {
      const response = await axios.post(
        `${baseURL}usergroups.json`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      toast.success("User Group created successfully");
      console.log("Response from API:", response.data);
      navigate("/setup-member/user-groups-list"); // Adjust navigation path as needed
    } catch (error) {
      console.error("Error creating user group:", error);
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(`Error creating user group: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${baseURL}/users/get_users.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        const data = await response.json();
        setEventUserID(data.users || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setEventUserID([]);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        <form onSubmit={handleSubmit} noValidate>
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <Users size={16} strokeWidth={1.8} />
                </span>
                Create User Group
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Group Name"
                      required
                      name="name"
                      placeholder="Enter group name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <span className="error text-danger">{errors.name}</span>
                    )}
                  </div>
                </div>

                    {/* Company Dropdown */}
                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Company <span className="otp-asterisk">*</span>
                        </label>
                        <SelectBox
                          name="company_id"
                          options={
                            companiesLoading
                              ? [{ value: "", label: "Loading..." }]
                              : companies.length > 0
                              ? companies.map((comp) => ({
                                  value: comp.id,
                                  label: comp.name,
                                }))
                              : [{ value: "", label: "No company found" }]
                          }
                          value={formData.company_id}
                          onChange={(value) =>
                            setFormData({ ...formData, company_id: value })
                          }
                          className={errors.company_id ? "is-invalid" : ""}
                        />
                        {errors.company_id && (
                          <div className="invalid-feedback">
                            {errors.company_id}
                          </div>
                        )}
                      </div>
                    </div> */}

                    {/* Site Dropdown */}
                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Site <span className="otp-asterisk">*</span>
                        </label>
                        <SelectBox
                          name="site_id"
                          options={
                            sitesLoading
                              ? [{ value: "", label: "Loading..." }]
                              : sites.length > 0
                              ? sites.map((site) => ({
                                  value: site.id,
                                  label: site.name,
                                }))
                              : [{ value: "", label: "No site found" }]
                          }
                          value={formData.site_id}
                          onChange={(value) =>
                            setFormData({ ...formData, site_id: value })
                          }
                          className={errors.site_id ? "is-invalid" : ""}
                        />
                        {errors.site_id && (
                          <div className="invalid-feedback">
                            {errors.site_id}
                          </div>
                        )}
                      </div>
                    </div> */}

                    {/* User Dropdown */}
                    {/* <div className="col-md-4">
                      <div className="form-group">
                        <label>
                          Assign User <span className="otp-asterisk">*</span>
                        </label>
                        <SelectBox
                          name="user_id"
                          options={
                            usersLoading
                              ? [{ value: "", label: "Loading..." }]
                              : users.length > 0
                              ? users.map((user) => ({
                                  value: user.id,
                                  label: `${user.firstname} ${user.lastname}` || `User ${user.id}`,
                                }))
                              : [{ value: "", label: "No users found" }]
                          }
                          value={formData.user_id}
                          onChange={(value) =>
                            setFormData({ ...formData, user_id: value })
                          }
                          className={errors.user_id ? "is-invalid" : ""}
                        />
                        {errors.user_id && (
                          <div className="invalid-feedback">
                            {errors.user_id}
                          </div>
                        )}
                      </div>
                    </div> */}

                <div className="col-md-3">
                  <div className="form-group">
                    <MultiSelectBox
                      label="Members ID"
                      placeholder="Select Members"
                      options={
                        Array.isArray(eventUserID)
                          ? eventUserID.map((user) => ({
                              value: user.id,
                              label:
                                `${user.firstname} ${user.lastname}` ||
                                `User ${user.id}`,
                            }))
                          : []
                      }
                      value={formData.member_ids.map((id) => {
                        const user = eventUserID.find((u) => u.id === id);
                        return user
                          ? {
                              value: user.id,
                              label: `${user.firstname} ${user.lastname}`,
                            }
                          : { value: id, label: `User ${id}` };
                      })}
                      onChange={(selectedOptions) =>
                        setFormData((prev) => ({
                          ...prev,
                          member_ids: selectedOptions.map(
                            (option) => option.value
                          ),
                        }))
                      }
                    />
                    {errors.member_ids && (
                      <span className="error text-danger">
                        {errors.member_ids}
                      </span>
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
              disabled={loading}
            >
              {loading ? "Creating..." : "Submit"}
            </button>
            <button
              type="button"
              className="banner-form-action-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserGroupCreate;
