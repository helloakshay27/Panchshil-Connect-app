import React, { useEffect, useState } from "react";
import axios from "axios";
import "../mor.css";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

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

  // Fetch projects
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

  // Fetch existing press release data
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
              : "", // Ensure proper format
            pr_image: data.pr_image || [],
            pr_pdf: data.pr_pdf || [],
          });
        } catch (error) {
          console.error("Error fetching press release:", error);
        }
      };
      fetchPressRelease();
    }
  }, [id]);

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
        pr_image: [...prevFormData.pr_image, ...validImages],
      }));
    } else if (fieldName === "pr_pdf") {
      const allowedPdfTypes = ["application/pdf"];
      const validPdfs = files.filter((file) =>
        allowedPdfTypes.includes(file.type)
      );

      if (validPdfs.length !== files.length) {
        toast.error("Only PDF files are allowed.");
        e.target.value = "";
        return;
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        pr_pdf: [...prevFormData.pr_pdf, ...validPdfs],
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    let newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is mandatory";
    if (!formData.company_id.trim())
      newErrors.company_id = "Company is mandatory";
    if (!formData.pr_image || formData.pr_image.length === 0)
      newErrors.pr_image = "At least one image is required";
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

      formData.pr_image.forEach((file) => {
        sendData.append("attachment[]", file);
      });

      formData.pr_pdf.forEach((file) => {
        sendData.append("attachment[]", file);
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
    } catch (error) {
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
                        type="Date"
                        name="release_date"
                        placeholder="Enter date"
                        value={formData.release_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mt-1">
                    <div className="form-group">
                      <label>
                        Project<span style={{ color: "#de7008" }}> *</span>
                      </label>
                      <select
                        className="form-control form-select"
                        name="project_id"
                        value={formData.project_id}
                        required
                        onChange={handleChange}
                      >
                        <option value="">Select Project</option>
                        {projects.map((proj) => (
                          <option key={proj.id} value={proj.id}>
                            {proj.project_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Company{" "}
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          *
                        </span>
                      </label>
                      <select
                        className="form-control form-select"
                        value={formData.company_id}
                        name="company_id"
                        onChange={handleChange}
                      >
                        <option value="">Select Company</option>

                        {console.log("projects", projects)}
                        {company.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
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
                      {formData.pr_image.length > 0 &&
                        formData.pr_image.map((image, index) => (
                          <div key={index} className="mt-2">
                            <img
                              src={
                                typeof image === "string"
                                  ? image
                                  : URL.createObjectURL(image)
                              }
                              alt="Uploaded"
                              style={{ width: "100px", height: "100px" }}
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
      <span style={{ color: "#de7008", fontSize: "16px" }}>*</span>
    </label>
    <input
      className="form-control"
      type="file"
      name="pr_pdf"
      accept="application/pdf"
      multiple
      onChange={handleFileChange}
    />

    {/* Display existing PDFs */}
    {formData.pr_pdf.length > 0 &&
      formData.pr_pdf.map((pdf, index) => (
        <div key={index} className="mt-2">
          {typeof pdf === "string" ? (
            <a
              href={pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              View PDF {index + 1}
            </a>
          ) : (
            <a
              href={URL.createObjectURL(pdf)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary"
            >
              Preview PDF {index + 1}
            </a>
          )}
        </div>
      ))}

    {errors.pr_pdf && <span className="error text-danger">{errors.pr_pdf}</span>}
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
