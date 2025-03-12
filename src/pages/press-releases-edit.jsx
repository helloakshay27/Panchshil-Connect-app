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
      [name]: name === "release_date" ? formatDateForAPI(value) : value, 
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

      setFormData((prevFormData) => ({
        ...prevFormData,
        pr_pdf: validPdfs,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.company_id ||
      !formData.release_date ||
      !formData.description ||
      !formData.project_id
    ) {
      toast.error("Please fill all required fields before submitting.");
      return;
    }

    setLoading(true);
    try {
      const sendData = new FormData();
      sendData.append("title", formData.title);
      sendData.append("company_id", formData.company_id);
      sendData.append("release_date", formData.release_date);
      sendData.append("description", formData.description);
      sendData.append("project_id", formData.project_id);

     
      formData.attachfile
        .filter((file) => file instanceof File)
        .forEach((file) => {
          sendData.append("press_release[pr_image]", file);
        });

      formData.pr_pdf
        .filter((file) => file instanceof File)
        .forEach((file) => {
          sendData.append("press_release[pr_pdf]", file);
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
                              className="img-fluid rounded"
                              style={{
                                maxWidth: "100px",
                                maxHeight: "100px",
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
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="25"
                                viewBox="0 0 25 25"
                                fill="none"
                              >
                                <mask
                                  id={`mask${index}`}
                                  style={{ maskType: "alpha" }}
                                  maskUnits="userSpaceOnUse"
                                  x="0"
                                  y="0"
                                  width="25"
                                  height="25"
                                >
                                  <rect
                                    x="0.341797"
                                    y="0.0665283"
                                    width="24"
                                    height="24"
                                    fill="#D9D9D9"
                                  />
                                </mask>
                                <g mask={`url(#mask${index})`}>
                                  <path
                                    d="M9.3418 12.5665H10.3418V10.5665H11.3418C11.6251 10.5665 11.8626 10.4707 12.0543 10.279C12.246 10.0874 12.3418 9.84986 12.3418 9.56653V8.56653C12.3418 8.28319 12.246 8.04569 12.0543 7.85403C11.8626 7.66236 11.6251 7.56653 11.3418 7.56653H9.3418V12.5665ZM10.3418 9.56653V8.56653H11.3418V9.56653H10.3418ZM13.3418 12.5665H15.3418C15.6251 12.5665 15.8626 12.4707 16.0543 12.279C16.246 12.0874 16.3418 11.8499 16.3418 11.5665V8.56653C16.3418 8.28319 16.246 8.04569 16.0543 7.85403C15.8626 7.66236 15.6251 7.56653 15.3418 7.56653H13.3418V12.5665ZM14.3418 11.5665V8.56653H15.3418V11.5665H14.3418ZM17.3418 12.5665H18.3418V10.5665H19.3418V9.56653H18.3418V8.56653H19.3418V7.56653H17.3418V12.5665ZM8.3418 18.0665C7.7918 18.0665 7.32096 17.8707 6.9293 17.479C6.53763 17.0874 6.3418 16.6165 6.3418 16.0665V4.06653C6.3418 3.51653 6.53763 3.0457 6.9293 2.65403C7.32096 2.26236 7.7918 2.06653 8.3418 2.06653H20.3418C20.8918 2.06653 21.3626 2.26236 21.7543 2.65403C22.146 3.0457 22.3418 3.51653 22.3418 4.06653V16.0665C22.3418 16.6165 22.146 17.0874 21.7543 17.479C21.3626 17.8707 20.8918 18.0665 20.3418 18.0665H8.3418ZM8.3418 16.0665H20.3418V4.06653H8.3418V16.0665ZM4.3418 22.0665C3.7918 22.0665 3.32096 21.8707 2.9293 21.479C2.53763 21.0874 2.3418 20.6165 2.3418 20.0665V6.06653H4.3418V20.0665H18.3418V22.0665H4.3418Z"
                                    fill="#F58220"
                                  />
                                </g>
                              </svg>
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
