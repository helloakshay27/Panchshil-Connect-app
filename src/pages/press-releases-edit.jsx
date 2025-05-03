import React, { useEffect, useState } from "react";
import axios from "axios";
import "../mor.css";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";

const PressReleasesEdit = () => {
  const [company, setCompany] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company_id: "",
    project_id: "",
    release_date: "",
    pr_image: null,
    press_source: "",
    attachment_url: "",
  });

  useEffect(() => {
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
        setCompany(response.data.company_setups);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompany();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(
          `${baseURL}projects.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchPressRelease = async () => {
        try {
          const response = await axios.get(
            `${baseURL}press_releases/${id}.json`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = response.data;

          setFormData({
            title: data.title || "",
            description: data.description || "",
            company_id: data.company_id || "",
            project_id: data.project_id || "",
            release_date: data.release_date ? formatDateForInput(data.release_date) : "",
            pr_image: data.attachfile?.document_url || [],
            attachment_url: data.attachment_url || "",
            press_source: data.press_source || "",
          });
        } catch (error) {
          console.error("Error fetching press release:", error);
        }
      };

      fetchPressRelease();
    }
  }, [id]);

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString); // Convert string to Date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-indexed, so add 1
    const day = String(date.getDate()).padStart(2, "0");
  
    return `${year}-${month}-${day}`; // Format as yyyy-MM-dd
  };

  console.log(formData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "release_date" ? value : value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]; // Since only one image is allowed
    const fieldName = e.target.name;

    if (fieldName === "pr_image") {
      const allowedImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (file && !allowedImageTypes.includes(file.type)) {
        toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
        e.target.value = "";
        return;
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        pr_image: file,
      }));
    }

    if (fieldName === "attachment_url") {
      const allowedPdfTypes = ["application/pdf"];
      if (file && !allowedPdfTypes.includes(file.type)) {
        toast.error("Only PDF files are allowed.");
        e.target.value = "";
        return;
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        attachment_url: file,
      }));
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (
      !formData.title.trim() ||
      !formData.release_date ||
      !formData.description.trim() ||
      formData.pr_image.length === 0 ||
      !formData.attachment_url.trim()
    ) {
      toast.dismiss();
      toast.error("Please fill in all the required fields.");
      return false;
    }

    setErrors({});
    return true;
  };

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
      sendData.append("press_release[company_id]", formData.company_id);
      sendData.append("press_release[release_date]", formData.release_date);
      sendData.append("press_release[description]", formData.description);
      sendData.append("press_release[project_id]", formData.project_id);
      sendData.append("press_release[press_source]", formData.press_source);

      // Append images
      sendData.append("press_release[pr_image]", formData.pr_image);

      if (formData.attachment_url) {
        sendData.append(
          "press_release[attachment_url]",
          formData.attachment_url
        );
      }

      await axios.put(
        `${baseURL}press_releases/${id}.json`,
        sendData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Press release updated successfully!");
      navigate("/pressreleases-list");
    } catch (error) {
      console.error("Error submitting form:", error);
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
                <h3 className="card-title">Edit Press Release</h3>
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
                        Press Release Date
                        <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <input
                        className="form-control"
                        type="date"
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
                        Press Release Source
                        <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={1}
                        name="press_source"
                        placeholder="Enter Source"
                        value={formData.press_source}
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
                        Attachment (Image)
                        <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        name="pr_image"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {formData.pr_image && (
                        <div className="mt-2">
                          <img
                            src={
                              formData.pr_image &&
                              typeof formData.pr_image === "string"
                                ? formData.pr_image
                                : URL.createObjectURL(formData.pr_image)
                            }
                            alt="Uploaded Image"
                            className="img-fluid rounded"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Attachment URL <span className="otp-asterisk">{" "}*</span></label>
                      <input
                        className="form-control"
                        type="url"
                        name="attachment_url"
                        placeholder="Enter URL"
                        value={formData.attachment_url}
                        onChange={handleChange}
                      />
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
                disabled={loading}
                className="purple-btn2 w-100"
              >
                {loading ? "Submitting..." : "Save "}
              </button>
            </div>
            <div className="col-md-2">
              <button onClick={handleCancel} className="purple-btn2 w-100">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PressReleasesEdit;
