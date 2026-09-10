import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Landmark } from "lucide-react";
import SelectBox from "../components/base/SelectBox";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const BankDetailsCreate = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [bankDetails, setBankDetails] = useState({
    bank_name: "",
    address: "",
    country_id: "",
    state_id: "",
    city_id: "",
    pincode: "",
    account_type: "Savings",
    account_number: "",
    confirm_account_number: "",
    branch_name: "",
    micr_number: "",
    ifsc_code: "",
    resource_type: "Project",
    resource_id: "",
    benficary_name: "",
    city_name: "",
    remark: "",
    active: true,
    company_codes: "",
    is_vertual: false,
    status: "active",
    virtual_account_code: "",
  });

  // Fetch Countries
  useEffect(() => {
    setLoading(true);
    fetch(`${baseURL}countries.json`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.countries)) {
          setCountries(data.countries);
        } else {
          setCountries([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching countries:", error);
        toast.error("Failed to fetch countries.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch Projects/Resources
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
        toast.error("Failed to fetch projects.");
      }
    };

    fetchProjects();
  }, []);

  // Fetch States based on selected country
  useEffect(() => {
    if (bankDetails.country_id) {
      fetch(`${baseURL}states.json?country_id=${bankDetails.country_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data.states)) {
            setStates(data.states);
          } else {
            setStates([]);
          }
          // Reset state and city when country changes
          setBankDetails((prev) => ({
            ...prev,
            state_id: "",
            city_id: "",
            city_name: "",
          }));
        })
        .catch((error) => {
          console.error("Error fetching states:", error);
          toast.error("Failed to fetch states.");
        });
    } else {
      setStates([]);
      setCities([]);
    }
  }, [bankDetails.country_id]);

  // Fetch Cities based on selected state
  useEffect(() => {
    if (bankDetails.state_id) {
      fetch(`${baseURL}cities.json?state_id=${bankDetails.state_id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data.cities)) {
            setCities(data.cities);
          } else {
            setCities([]);
          }
          // Reset city when state changes
          setBankDetails((prev) => ({ ...prev, city_id: "", city_name: "" }));
        })
        .catch((error) => {
          console.error("Error fetching cities:", error);
          toast.error("Failed to fetch cities.");
        });
    } else {
      setCities([]);
    }
  }, [bankDetails.state_id]);

  // Auto-populate city name when city is selected
  useEffect(() => {
    if (bankDetails.city_id) {
      const selectedCity = cities.find(
        (city) => city.id.toString() === bankDetails.city_id.toString()
      );
      if (selectedCity) {
        setBankDetails((prev) => ({ ...prev, city_name: selectedCity.name }));
      }
    }
  }, [bankDetails.city_id, cities]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBankDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle SelectBox Changes
  const handleSelectChange = (name, value) => {
    setBankDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Validate IFSC Code format
  const validateIFSC = (ifsc) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc);
  };

  // Validate Form Before Submission
  const validateForm = () => {
    if (!bankDetails.bank_name.trim()) {
      toast.error("Bank Name is required.");
      return false;
    }

    if (!bankDetails.account_number.trim()) {
      toast.error("Account Number is required.");
      return false;
    }

    if (!bankDetails.confirm_account_number.trim()) {
      toast.error("Confirm Account Number is required.");
      return false;
    }

    if (bankDetails.account_number !== bankDetails.confirm_account_number) {
      toast.error("Account numbers do not match.");
      return false;
    }

    if (!bankDetails.ifsc_code.trim()) {
      toast.error("IFSC Code is required.");
      return false;
    }

    if (!validateIFSC(bankDetails.ifsc_code)) {
      toast.error("Please enter a valid IFSC Code format (e.g., SBIN0001234).");
      return false;
    }

    if (!bankDetails.benficary_name.trim()) {
      toast.error("Beneficiary Name is required.");
      return false;
    }

    if (!bankDetails.branch_name.trim()) {
      toast.error("Branch Name is required.");
      return false;
    }

    return true;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dismiss existing toasts before showing a new one
    toast.dismiss();

    if (!validateForm()) return;

    setSubmitting(true);

    const bankDetailsPayload = {
      bank_detail: {
        ...bankDetails,
        // Convert string values to appropriate types
        country_id: parseInt(bankDetails.country_id) || null,
        state_id: parseInt(bankDetails.state_id) || null,
        city_id: parseInt(bankDetails.city_id) || null,
        resource_id: parseInt(bankDetails.resource_id) || null,
        resource_type: "Project", // Always set to "Project"
        active: bankDetails.active,
        is_vertual: bankDetails.is_vertual,
      },
    };

    try {
      const response = await fetch(`${baseURL}bank_details.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(bankDetailsPayload),
      });

      if (response.ok) {
        const responseData = await response.json();
        connectEvents.onRecordSaved({ mode: "added" });
        toast.success("Bank Details created successfully!");

        // Reset form
        setBankDetails({
          bank_name: "",
          address: "",
          country_id: "",
          state_id: "",
          city_id: "",
          pincode: "",
          account_type: "Savings",
          account_number: "",
          confirm_account_number: "",
          branch_name: "",
          micr_number: "",
          ifsc_code: "",
          resource_type: "Project",
          resource_id: "",
          benficary_name: "",
          city_name: "",
          remark: "",
          active: true,
          company_codes: "",
          is_vertual: false,
          status: "active",
          virtual_account_code: "",
        });

        // Navigate to bank details list or desired page
        navigate("/setup-member/bank-details-list");
      } else {
        const errorData = await response.json();
        console.error("Bank Details API Error:", errorData);
        toast.error(errorData.message || "Failed to create bank details.");
      }
    } catch (error) {
      console.error("Error submitting bank details:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setBankDetails({
      bank_name: "",
      address: "",
      country_id: "",
      state_id: "",
      city_id: "",
      pincode: "",
      account_type: "Savings",
      account_number: "",
      confirm_account_number: "",
      branch_name: "",
      micr_number: "",
      ifsc_code: "",
      resource_type: "Project",
      resource_id: "",
      benficary_name: "",
      city_name: "",
      remark: "",
      active: true,
      company_codes: "",
      is_vertual: false,
      status: "active",
      virtual_account_code: "",
    });
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
                  Create Bank Details
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
                        value={bankDetails.bank_name}
                        onChange={handleChange}
                        placeholder="Enter bank name"
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <FormTextField
                        label="Branch Name"
                        required
                        name="branch_name"
                        value={bankDetails.branch_name}
                        onChange={handleChange}
                        placeholder="Enter branch name"
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <FormTextField
                        label="IFSC Code"
                        required
                        name="ifsc_code"
                        value={bankDetails.ifsc_code}
                        onChange={handleChange}
                        placeholder="e.g., SBIN0001234"
                        style={{ textTransform: "uppercase" }}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <FormTextField
                        label="MICR Number"
                        name="micr_number"
                        value={bankDetails.micr_number}
                        onChange={handleChange}
                        placeholder="Enter MICR number"
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <FormTextField
                        label="Bank Address"
                        name="address"
                        value={bankDetails.address}
                        onChange={handleChange}
                        placeholder="Enter bank address"
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <SelectBox
                        label="Account Type"
                        required
                        placeholder="Select Account Type"
                        options={[
                          { label: "Savings", value: "Savings" },
                          { label: "Current", value: "Current" },
                        ]}
                        value={bankDetails.account_type}
                        onChange={(value) =>
                          handleSelectChange("account_type", value)
                        }
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <FormTextField
                        label="Account Number"
                        required
                        name="account_number"
                        value={bankDetails.account_number}
                        onChange={handleChange}
                        placeholder="Enter account number"
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <FormTextField
                        label="Confirm Account Number"
                        required
                        name="confirm_account_number"
                        value={bankDetails.confirm_account_number}
                        onChange={handleChange}
                        placeholder="Confirm account number"
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <FormTextField
                        label="Beneficiary Name"
                        required
                        name="benficary_name"
                        value={bankDetails.benficary_name}
                        onChange={handleChange}
                        placeholder="Enter beneficiary name"
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <FormTextField
                        label="Company Codes"
                        name="company_codes"
                        value={bankDetails.company_codes}
                        onChange={handleChange}
                        placeholder="Enter company codes"
                      />
                    </div>
                  </div>
                  {/* <div className="col-md-3">
                    <div className="form-group">
                      <label>Country</label>
                      <SelectBox
                        name="country_id"
                        options={
                          loading
                            ? [{ value: "", label: "Loading..." }]
                            : countries.length > 0
                              ? [{ value: "", label: "Select Country" }, ...countries.map((country) => ({
                                value: country.id,
                                label: country.name,
                              }))]
                              : [{ value: "", label: "No countries found" }]
                        }
                        value={bankDetails.country_id}
                        onChange={(value) => handleSelectChange("country_id", value)}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <SelectBox
                        label="State"
                        placeholder="Select State"
                        name="state_id"
                        options={
                          states.length > 0
                            ? [{ value: "", label: "Select State" }, ...states.map((state) => ({
                              value: state.id,
                              label: state.name,
                            }))]
                            : [{ value: "", label: bankDetails.country_id ? "No states found" : "Select country first" }]
                        }
                        value={bankDetails.state_id}
                        onChange={(value) => handleSelectChange("state_id", value)}
                        disabled={!bankDetails.country_id}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <SelectBox
                        label="City"
                        placeholder="Select City"
                        name="city_id"
                        options={
                          cities.length > 0
                            ? [{ value: "", label: "Select City" }, ...cities.map((city) => ({
                              value: city.id,
                              label: city.name,
                            }))]
                            : [{ value: "", label: bankDetails.state_id ? "No cities found" : "Select state first" }]
                        }
                        value={bankDetails.city_id}
                        onChange={(value) => handleSelectChange("city_id", value)}
                        disabled={!bankDetails.state_id}
                      />
                    </div>
                  </div> */}

                  <div className="col-md-3">
                    <div className="form-group">
                      <FormTextField
                        label="Pincode"
                        name="pincode"
                        value={bankDetails.pincode}
                        onChange={handleChange}
                        placeholder="Enter pincode"
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <FormTextField
                        label="Resource Type"
                        name="resource_type"
                        value="Project"
                        disabled
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <SelectBox
                        label="Project"
                        required
                        placeholder="Select Project"
                        options={projects.map((project) => ({
                          label: project.project_name,
                          value: project.id,
                        }))}
                        value={bankDetails.resource_id}
                        onChange={(value) =>
                          setBankDetails({ ...bankDetails, resource_id: value })
                        }
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <FormTextField
                        label="Virtual Account Code"
                        name="virtual_account_code"
                        value={bankDetails.virtual_account_code}
                        onChange={handleChange}
                        placeholder="Enter virtual account code"
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <FormTextField
                        label="City Name"
                        name="city_name"
                        value={bankDetails.city_name}
                        onChange={handleChange}
                        placeholder="Enter city name"
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <FormTextField
                        label="Remark"
                        name="remark"
                        value={bankDetails.remark}
                        onChange={handleChange}
                        placeholder="Enter any remarks or notes"
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="is_vertual"
                          checked={bankDetails.is_vertual}
                          onChange={handleChange}
                          id="virtualCheck"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="virtualCheck"
                        >
                          Is Virtual Account
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="banner-form-actions">
              <button
                type="submit"
                className="banner-form-action-btn"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
              {/* <div className="col-md-2">
                <button
                  type="button"
                  className="purple-btn2 purple-btn2-shadow w-100"
                  onClick={() => {
                    resetForm();
                  }}
                >
                  Reset
                </button>
              </div> */}
              <button
                type="button"
                className="banner-form-action-btn"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default BankDetailsCreate;
