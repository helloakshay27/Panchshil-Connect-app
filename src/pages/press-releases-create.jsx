import React, { useEffect, useState } from "react";
import axios from "axios";
import "../mor.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { baseURL } from "./baseurl/apiDomain";

const PressReleasesCreate = () => {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    release_date: "",
    pr_image: [],
    attachment_url: "",
    source_details: "",
  });

  const fetchCompany = async () => {
    try {
      const response = await axios.get(
        `${baseURL}company_setups.json`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data.company_setups;
      console.log("Data", data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fieldName = e.target.name;

    if (fieldName === "pr_image") {
      const allowedImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const validImages = files.filter((file) =>
        allowedImageTypes.includes(file.type)
      );

      if (validImages.length !== files.length) {
        toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
        e.target.value = "";
        return;
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        pr_image: validImages,
      }));
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (
      !formData.title.trim() &&
      !formData.release_date &&
      !formData.description.trim() &&
      (!formData.pr_image || formData.pr_image.length === 0) &&
      (!formData.attachment_url || formData.attachment_url.trim() === "")
    ) {
      toast.dismiss();
      toast.error("Please fill in all the required fields.");
      return false;
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is mandatory";
      setErrors(newErrors);
      toast.dismiss();
      toast.error("Title is mandatory");
      return false;
    }

    if (!formData.release_date) {
      newErrors.release_date = "Press Releases Date is mandatory";
      setErrors(newErrors);
      toast.dismiss();
      toast.error("Press Releases Date is mandatory");
      return false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is mandatory";
      setErrors(newErrors);
      toast.dismiss();
      toast.error("Description is mandatory");
      return false;
    }

    if (!formData.pr_image || formData.pr_image.length === 0) {
      newErrors.pr_image = "Attachment (Image) is mandatory";
      setErrors(newErrors);
      toast.dismiss();
      toast.error("Attachment (Image) is mandatory");
      return false;
    }

    if (!formData.attachment_url.trim()) {
      newErrors.attachment_url = "Attachment URL is mandatory";
      setErrors(newErrors);
      toast.dismiss();
      toast.error("Attachment URL is mandatory");
      return false;
    }

    setErrors({});
    return true;
  };

  console.log(formData.release_date)

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("Authentication error: Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const sendData = new FormData();
      sendData.append("press_release[title]", formData.title);
      sendData.append("press_release[release_date]", formData.release_date);
      sendData.append("press_release[description]", formData.description);

      // Append multiple images
      if (formData.pr_image?.length) {
        formData.pr_image.forEach((file) => {
          sendData.append("press_release[pr_image]", file);
        });
      }

      if (formData.attachment_url) {
        sendData.append("press_release[attachment_url]", formData.attachment_url);
      }

      await axios.post(
        `${baseURL}press_releases.json`,
        sendData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Press release created successfully!");
      navigate("/pressreleases-list");
    } catch (error) {
      console.error("Error response:", error.response);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
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
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Create Press Releases</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Title
                        <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="title"
                        placeholder="Enter Title"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Press Releases Date
                        <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <input
                        className="form-control"
                        type="Date"
                        name="release_date"
                        placeholder="Enter date"
                        value={formData.release_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Description
                        <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={1}
                        name="description"
                        placeholder="Enter Description"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Source Details
                        <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={1}
                        name="source_details"
                        placeholder="Enter Source Details"
                        value={formData.source_details}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Attachment (Image)
                        <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        name="pr_image"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                      />
                      {errors.pr_image && (
                        <span className="error text-danger">
                          {errors.pr_image}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Attachment URL
                        <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <input
                        className="form-control"
                        type="url"
                        name="attachment_url"
                        placeholder="Enter URL"
                        value={formData.attachment_url || ""}
                        onChange={handleChange}
                      />
                      {errors.attachment_url && (
                        <span className="error text-danger">
                          {errors.attachment_url}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-2 justify-content-center">
            <div className="col-md-2">
              <button
                onClick={handleSubmit}
                type="submit"
                className="purple-btn2 w-100"
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
        </div>
      </div>
    </>
  );
};

export default PressReleasesCreate;
