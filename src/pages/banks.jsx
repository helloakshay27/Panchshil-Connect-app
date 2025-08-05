import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { baseURL } from "./baseurl/apiDomain";

const BankForm = () => {
  const [formData, setFormData] = useState({
    bank_name: "",
    interest_rate: "",
    bank_logo: "",
  });
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const navigate = useNavigate();
  const { bankId } = useParams();
  const isEditMode = !!bankId;

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      "Content-Type": "application/json",
    },
  });

  const getMultipartHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  useEffect(() => {
    if (isEditMode && !hasFetched) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`${baseURL}banks/${bankId}.json`, 
            getAuthHeaders()
          );
          
          const bankData = res.data?.bank || res.data;
          
          if (bankData) {
            setFormData({
              bank_name: bankData.bank_name || "",
              interest_rate: bankData.interest_rate || "",
              bank_logo: bankData.bank_logo || "",
            });
            
            if (bankData.bank_logo) {
              if (typeof bankData.bank_logo === 'object' && bankData.bank_logo.document_url) {
                setImagePreview(bankData.bank_logo.document_url);
              } else if (typeof bankData.bank_logo === 'string') {
                setImagePreview(bankData.bank_logo);
              }
            }
            
            setHasFetched(true);
          }
        } catch (err) {
          console.error("Failed to fetch bank:", err);
          toast.error("Failed to load bank");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [bankId, isEditMode, hasFetched]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setFormData((prev) => ({
        ...prev,
        bank_logo: file.name,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bank_name.trim()) {
      toast.error("Bank name is required");
      return;
    }

    if (!formData.interest_rate || formData.interest_rate === "") {
      toast.error("Interest rate is required");
      return;
    }

    if (!isEditMode && !imageFile) {
      toast.error("Bank logo is required");
      return;
    }

    setLoading(true);

    try {
      let payload;
      let requestConfig;
      
      if (imageFile) {
        const formDataPayload = new FormData();
        formDataPayload.append('bank_name', formData.bank_name);
        formDataPayload.append('interest_rate', formData.interest_rate);
        formDataPayload.append('bank_logo', imageFile);
        
        payload = formDataPayload;
        requestConfig = getMultipartHeaders();
      } else {
        payload = {
          bank_name: formData.bank_name,
          interest_rate: formData.interest_rate,
        };
        requestConfig = getAuthHeaders();
      }
      
      if (isEditMode) {
        await axios.put(
          `${baseURL}banks/${bankId}.json`,
          payload,
          requestConfig
        );
        toast.success("Bank updated successfully!");
      } else {
        await axios.post(
          `${baseURL}banks.json`,
          payload,
          requestConfig
        );
        toast.success("Bank created successfully!");
      }

      navigate("/setup-member/banks-list"); // Update this path according to your routing
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit form";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <form id="bankForm" onSubmit={handleSubmit}>
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">
                  {isEditMode ? "Edit Bank" : "Create Bank"}
                </h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Bank Name <span className="otp-asterisk">*</span>
                      </label>
                      <input
                        type="text"
                        name="bank_name"
                        value={formData.bank_name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter bank name"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Interest Rate (%) <span className="otp-asterisk">*</span>
                      </label>
                      <input
                        type="number"
                        name="interest_rate"
                        value={formData.interest_rate}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter interest rate"
                        step="0.1"
                        min="0"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label>
                        Bank Logo {!isEditMode && <span className="otp-asterisk">*</span>}
                      </label>
                      <input
                        type="file"
                        name="bank_logo"
                        onChange={handleImageChange}
                        className="form-control"
                        accept="image/*"
                        disabled={loading}
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Bank logo preview"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              objectFit: "cover",
                              border: "1px solid #ddd",
                              borderRadius: "4px"
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button type="submit" style={{ display: "none" }} />
          </form>
          
          <div className="row mt-3 justify-content-center mx-4">
            <div className="col-md-2">
              <button
                type="submit"
                form="bankForm" 
                className="purple-btn2 w-100"
                disabled={loading}
              >
                {loading
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                  ? "Update"
                  : "Submit"}
              </button>
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="purple-btn2 w-100"
                onClick={() => navigate("/setup-member/banks-list")} // Update this path according to your routing
                disabled={loading}
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

export default BankForm;