import React, { useEffect, useState } from "react";
import axios from "axios";
import "../mor.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";

const PressReleasesCreate = () => {
  const [company, setCompany] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
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

  console.log("Data", formData);

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

      const data = response.data.company_setups;
      console.log("Data", data);
      setCompany(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleCompanyChange = (e) => {
    setFormData({ ...formData, company_id: e.target.value });
  };

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
        console.error(
          "Error fetching projects:",
          error.response?.data || error.message
        );
      }
    };

    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProjectChange = (e) => {
    setFormData({ ...formData, project_id: e.target.value });
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
        pr_pdf: validPdfs,
      }));
    }
  };

  // Form validation
 // Form validation
const validateForm = () => {
  let newErrors = {};
  
  // If all mandatory fields are empty, show a general message
  if (!formData.title.trim() && 
      (!formData.company_id || String(formData.company_id).trim() === "") && 
      !formData.release_date && 
      !formData.description.trim() && 
      (!formData.project_id || String(formData.project_id).trim() === "") &&
      (!formData.pr_image || formData.pr_image.length === 0) &&
      (!formData.pr_pdf || formData.pr_pdf.length === 0)) {
    toast.dismiss(); // Clear any previous toasts
    toast.error("Please fill in all the required fields.");
    return false;
  }
  
  // Sequential validation - check one field at a time
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
  
  if (!formData.project_id || String(formData.project_id).trim() === "") {
    newErrors.project_id = "Project is mandatory";
    setErrors(newErrors);
    toast.dismiss();
    toast.error("Project is mandatory");
    return false;
  }
  
  if (!formData.company_id || String(formData.company_id).trim() === "") {
    newErrors.company_id = "Company is mandatory";
    setErrors(newErrors);
    toast.dismiss();
    toast.error("Company is mandatory");
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
  
  if (!formData.pr_pdf || formData.pr_pdf.length === 0) {
    newErrors.pr_pdf = "Attachment (PDF) is mandatory";
    setErrors(newErrors);
    toast.dismiss();
    toast.error("Attachment (PDF) is mandatory");
    return false;
  }
  
  // If we reach here, all validations passed
  setErrors({});
  return true;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Use the new validation function instead of the inline validation
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

    // Append multiple images
    if (formData.pr_image?.length) {
      formData.pr_image.forEach((file) => {
        sendData.append("press_release[pr_image]", file);
      });
    }

    // Append multiple PDFs
    if (formData.pr_pdf?.length) {
      formData.pr_pdf.forEach((file) => {
        sendData.append("press_release[pr_pdf]", file);
      });
    }

    await axios.post(
      "https://panchshil-super.lockated.com/press_releases.json",
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
                          {" "}
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
                      {errors.pr_pdf && (
                        <span className="error text-danger">
                          {errors.pr_pdf}
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
      
    </>
  );
};

export default PressReleasesCreate;
