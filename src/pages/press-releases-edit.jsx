import React, { useEffect, useState } from "react";
import axios from "axios";
import "../mor.css";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";

const PressReleasesEdit = () => {
  const [company, setCompany] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    company_id: "",
    project_id: "",
    release_date: "",
    pr_image: [],
    pr_pdf: [],
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/company_setups.json",
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
          "https://panchshil-super.lockated.com/projects.json",
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
            `https://panchshil-super.lockated.com/press_releases/${id}.json`,
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
            release_date: data.release_date
              ? data.release_date.split("T")[0]
              : "",
            attachfile: data.attachfile?.document_url
              ? [data.attachfile.document_url]
              : [],
            pr_pdf: data.pr_pdf?.document_url ? [data.pr_pdf.document_url] : [],
          });
        } catch (error) {
          console.error("Error fetching press release:", error);
        }
      };

      fetchPressRelease();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "release_date" ? formatDateForAPI(value) : value, // Ensure correct format on change
    });
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

      // Replace previous image with the new one
      setFormData((prevFormData) => ({
        ...prevFormData,
        attachfile: validImages,
      }));
    }

    if (fieldName === "pr_pdf") {
      const allowedPdfTypes = ["application/pdf"];
      const validPdfs = files.filter((file) =>
        allowedPdfTypes.includes(file.type)
      );

      if (validPdfs.length !== files.length) {
        toast.error("Only PDF files are allowed.");
        e.target.value = "";
        return;
      }

      // Replace previous PDF with the new one
      setFormData((prevFormData) => ({
        ...prevFormData,
        pr_pdf: validPdfs,
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    let newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is mandatory";
    // if (!formData.company_id.trim())
    //   newErrors.company_id = "Company is mandatory";
    // if (!formData.pr_image || formData.pr_image.length === 0)
    //   newErrors.pr_image = "At least one image is required";
    if (!formData.pr_pdf || formData.pr_pdf.length === 0)
      newErrors.pr_pdf = "At least one PDF is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const sendData = new FormData();
      sendData.append("title", formData.title);
      sendData.append("company_id", formData.company_id);
      sendData.append("release_date", formData.release_date);
      sendData.append("description", formData.description);
      sendData.append("project_id", formData.project_id);

      // Append only file objects (ignore URLs)
      formData.attachfile
        .filter((file) => file instanceof File)
        .forEach((file) => {
          sendData.append("pr_image", file);
        });

      formData.pr_pdf
        .filter((file) => file instanceof File)
        .forEach((file) => {
          sendData.append("pr_pdf", file);
        });

      await axios.put(
        `https://panchshil-super.lockated.com/press_releases/${id}.json`,
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
      console.log("formdata", sendData);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return ""; // Handle empty case
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-"); // Split YYYY-MM-DD
    return `${day}-${month}-${year}`; // Convert to DD-MM-YYYY
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
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          {" "}
                          *
                        </span>
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
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          {" "}
                          *
                        </span>
                      </label>
                      <input
                        className="form-control"
                        type="date"
                        name="release_date"
                        placeholder="Enter date"
                        value={formatDateForInput(formData.release_date)}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mt-1">
                    <div className="form-group">
                      <label>
                        Project<span style={{ color: "#de7008" }}> *</span>
                      </label>
                      <SelectBox
                        options={projects.map((proj) => ({
                          label: proj.project_name,
                          value: proj.id,
                        }))}
                        defaultValue={formData.project_id}
                        onChange={(value) =>
                          setFormData({ ...formData, project_id: value })
                        }
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Company{" "}
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          {" "}
                          *
                        </span>
                      </label>
                      <SelectBox
                        options={company.map((comp) => ({
                          label: comp.name,
                          value: comp.id,
                        }))}
                        defaultValue={formData.company_id}
                        onChange={(value) =>
                          setFormData({ ...formData, company_id: value })
                        }
                      />
                      {errors.company_id && (
                        <span className="error text-danger">
                          {errors.company_id}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Description
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          {" "}
                          *
                        </span>
                      </label>
                      <textarea
                        className="form-control"
                        rows={1}
                        name="description"
                        placeholder="Enter Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Attachment (Image)
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          *
                        </span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        name="pr_image"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                      />

                      {/* Display Existing & New Images */}
                      {formData.attachfile?.length > 0 &&
                        formData.attachfile.map((image, index) => (
                          <div key={index} className="mt-2">
                            <img
                              src={
                                typeof image === "string"
                                  ? image
                                  : URL.createObjectURL(image)
                              }
                              alt={`Uploaded ${index + 1}`}
                              style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        ))}

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
                        Attachment (PDF)
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          *
                        </span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        name="pr_pdf"
                        accept="application/pdf"
                        multiple
                        onChange={handleFileChange}
                      />

                      {/* Display Existing & New PDFs */}
                      {formData.pr_pdf?.length > 0 &&
                        formData.pr_pdf.map((pdf, index) => (
                          <div key={index} className="mt-2">
                            <a
                              href={
                                typeof pdf === "string"
                                  ? pdf
                                  : URL.createObjectURL(pdf)
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary"
                            >
                              View PDF {index + 1}
                            </a>
                          </div>
                        ))}

                      {errors.pr_pdf && (
                        <span className="error text-danger">
                          {errors.pr_pdf}
                        </span>
                      )}
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
                    //disabled={loading}
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
        </div>
      </div>
    </>
  );
};

export default PressReleasesEdit;
