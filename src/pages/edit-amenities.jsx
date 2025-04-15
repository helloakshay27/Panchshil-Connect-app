import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../mor.css";
import { toast } from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";

const EditAmenities = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [amenityType, setAmenityType] = useState("");

  // Fetch existing amenity details
  useEffect(() => {
    const fetchAmenity = async () => {
      try {
        const response = await axios.get(
          `${baseURL}amenity_setups/${id}.json`
        );
        console.log(response.data);

        setName(response.data.name);
        setAmenityType(response.data.amenity_type || "");

        // ✅ Correctly set the preview image
        if (response.data.attachfile?.document_url) {
          setPreviewImage(response.data.attachfile.document_url);
        }
      } catch (error) {
        console.error("Error fetching amenity:", error);
        toast.error("Failed to load amenity details.");
      }
    };

    if (id) {
      fetchAmenity();
    }
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setIcon(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("amenity_setup[name]", name);
    formData.append("amenity_setup[amenity_type]", amenityType);
    if (icon) {
      formData.append("icon", icon);
    }

    try {
      await axios.put(
        `${baseURL}amenity_setups/${id}.json`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Amenity updated successfully!");
      navigate("/setup-member/amenities-list");
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      toast.error(
        `Failed to update amenity: ${
          error.response?.data?.error || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!name.trim() || !amenityType) {
      toast.dismiss();
      toast.error("Please fill in all required fields.");
      return false;
    }
    return true;
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <form onSubmit={handleSubmit}>
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Edit Amenity</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Name Field */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Name{" "}
                        <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Icon Upload */}
                  {/* Icon Upload */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Icon{" "}
                        <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        accept=".png,.jpg,.jpeg,.svg"
                        onChange={handleFileChange}
                      />
                    </div>

                    {/* ✅ Show Preview Image (Default or New Upload) */}
                    {/* ✅ Show Default or Uploaded Preview Image */}
                    <div className="mt-2">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Uploaded Preview"
                          className="img-fluid rounded"
                          style={{
                            maxWidth: "100px",
                            maxHeight: "100px",
                            objectFit: "cover",
                            border: "1px solid #ccc",
                            padding: "5px",
                          }}
                        />
                      ) : (
                        <p className="text-muted">No image uploaded</p>
                      )}
                    </div>
                  </div>

                  {/* Amenity Type SelectBox */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Amenity Type{" "}
                        <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <SelectBox
                        options={[
                          { value: "Indoor", label: "Indoor" },
                          { value: "Outdoor", label: "Outdoor" },
                        ]}
                        defaultValue={amenityType}
                        onChange={setAmenityType}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="row mt-2 justify-content-center">
              <div className="col-md-2">
                <button
                  type="submit"
                  className="purple-btn2 w-100"
                  disabled={loading}
                >
                  Submit
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
  );
};

export default EditAmenities;
