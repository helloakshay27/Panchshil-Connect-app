import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import { useParams } from "react-router-dom";

const ProjectDetails = () => {
  const { id } = useParams();

  console.log("id", id);

  const [isExpanded, setIsExpanded] = useState(false);

  const [formData, setFormData] = useState({
    property_type: "",
    SFDC_Project_Id: "",
    status: "",
    configurations: [],
    project_name: "",
    project_address: "",
    project_description: "",
    price: "",
    project_size_sq_mtr: "",
    project_size_sq_ft: "",
    rera_carpet_area_sq_mtr: "",
    rera_carpet_area_sqft: "",
    no_of_towers: "",
    no_of_apartments: "",
    rera_number: "",
    amenities: [],
    specifications: [],
    land_area: "",
    location: {
      address: "",
      addressLine1: "",
      address_line_two: "",
      addressLine3: "",
      city: "",
      state: "",
      pin_code: "",
      country: "",
    },
    brochure: null, // file input for brochure
    two_d_images: [], // array of file inputs for 2D images
  });

  console.log("formdata", formData);

  const [projectsType, setProjectsType] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://panchshil-super.lockated.com/get_all_projects.json`,
          {
            headers: {
              Authorization:
                "Bearer UNE7QFnkjxZJgtKm-Od6EaNeBsWOAiGGp8RpXpWrYQY",
            },
          }
        );

        const projects = response.data.projects;
        console.log("Projects:", projects);

        const selectedProject = projects.find((p) => p.id === Number(id));

        if (selectedProject) {
          setFormData(selectedProject);
        } else {
          setError("Project not found");
        }
      } catch (error) {
        setError("Error fetching project data");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return (
    <>
      {/* <Header /> */}
      <style>
        {`
          .form-disabled input,
          .form-disabled textarea,
          .form-disabled select {
            pointer-events: none;
            background-color: #f9f9f9;
            color: #6c757d;
            border: 1px solid #ccc;
            background-image: none;
          }
            .form-disabled input[type="file"] {
            display: none;
            }

          .form-disabled label {
            font-weight: bold;
          }
        `}
      </style>
      <div className="module-data-section p-3">
        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header3">
            <h3 className="card-title">Project Details</h3>
            <div className="card-body">
              <div className="row px-3">
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Project Type</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">
                          : {formData.property_type}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>SFDC Project ID</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">
                          : {formData.SFDC_Project_Id}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Project Construction Status</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">: {formData.status}</span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Configuration Type</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">
                          : {formData.configurations.name}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Project Name</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">
                          : {formData.project_name}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Location</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">
                          : {formData.project_address}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Project Description</label>
                  </div>
                  <div className="col-6">
                    <p
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: isExpanded ? "unset" : 1, // Show only 1 line initially
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: isExpanded ? "normal" : "nowrap",
                        cursor: "pointer",
                      }}
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      : {formData.project_description}{" "}
                      {!isExpanded && (
                        <span style={{ color: "black", cursor: "pointer" }}>
                          ...
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Price Onwards</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">: {formData.price}</span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Project Size(Sq. Mtr.)</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">
                          : {formData.project_size_sq_mtr}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Project Size(Sq.Ft.)</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">
                          : {formData.project_size_sq_ft}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Rera Carpet Area(Sq. M)</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">
                          : {formData.rera_carpet_area_sq_mtr}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Rare Carpet Area(Sq. Ft.)</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">
                          : {formData.rera_carpet_area_sqft}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Number of Towers</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">
                          : {formData.no_of_towers}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Number of Units</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">
                          : {formData.no_of_apartments}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Rera Number</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">
                          : {formData.rera_number}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Amenities</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">: {formData.amenities.name}</span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Specifications</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">
                          : {formData.specifications.name}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                  <div className="col-6 ">
                    <label>Land Area</label>
                  </div>
                  <div className="col-6">
                    <label className="text">
                      <span className="me-3">
                        <span className="text-dark">
                          : {formData.land_area}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header3">
            <h3 className="card-title">Address</h3>
          </div>
          <div className="card-body">
            <div className="row">
              {/* Address Section */}
              <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                <div className="col-6 ">
                  <label>Address</label>
                </div>
                <div className="col-6">
                  <label className="text">
                    <span className="me-3">
                      <span className="text-dark">
                        : {formData.location.address}
                      </span>
                    </span>
                  </label>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                <div className="col-6 ">
                  <label>City</label>
                </div>
                <div className="col-6">
                  <label className="text">
                    <span className="me-3">
                      <span className="text-dark">
                        : {formData.location.city}
                      </span>
                    </span>
                  </label>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                <div className="col-6 ">
                  <label>State</label>
                </div>
                <div className="col-6">
                  <label className="text">
                    <span className="me-3">
                      <span className="text-dark">
                        : {formData.location.state}
                      </span>
                    </span>
                  </label>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                <div className="col-6 ">
                  <label>Pin Code</label>
                </div>
                <div className="col-6">
                  <label className="text">
                    <span className="me-3">
                      <span className="text-dark">
                        : {formData.location.pin_code}
                      </span>
                    </span>
                  </label>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                <div className="col-6 ">
                  <label>Country</label>
                </div>
                <div className="col-6">
                  <label className="text">
                    <span className="me-3">
                      <span className="text-dark">
                        : {formData.location.country}
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card mt-3 pb-4 mx-4">
            <div className="card-header3">
              <h3 className="card-title">Document Attachment</h3>
            </div>
            <div className="card-body pb-2 mb-1 mt-0">
              <div className="row ">
               
                <div className="col-md-12 ">
                  <h5 class=" ">Brochure</h5>
                  <div className=" tbl-container w-100">
                    <table className=" w-100">
                      <thead>
                        <tr>
                          <th>File Name</th>

                          <th>File Type</th>
                          <th>updated at</th>
                          <th>Image</th>
                        </tr>
                      </thead>
                      <tbody>
                       
                        {formData.brochure && (
                          <tr>
                            <td>{formData.brochure?.document_file_name}</td>
                            <td>{formData.brochure?.document_content_type}</td>
                            <td>{formData.brochure?.document_updated_at}</td>
                            <td>
                              <a href={`${formData.brochure?.document_url}`}>
                                <svg
                                  width="15"
                                  height="16"
                                  viewBox="0 0 22 23"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M20.8468 22.9744H1.1545C0.662189 22.9744 0.333984 22.6462 0.333984 22.1538V15.5897C0.333984 15.0974 0.662189 14.7692 1.1545 14.7692C1.6468 14.7692 1.97501 15.0974 1.97501 15.5897V21.3333H20.0263V15.5897C20.0263 15.0974 20.3545 14.7692 20.8468 14.7692C21.3391 14.7692 21.6673 15.0974 21.6673 15.5897V22.1538C21.6673 22.6462 21.3391 22.9744 20.8468 22.9744ZM11.0007 18.0513C10.9186 18.0513 10.7545 18.0513 10.6724 17.9692C10.5904 17.9692 10.5083 17.8872 10.4263 17.8051L3.86219 11.241C3.53398 10.9128 3.53398 10.4205 3.86219 10.0923C4.19039 9.7641 4.6827 9.7641 5.01091 10.0923L10.1801 15.2615V0.820513C10.1801 0.328205 10.5083 0 11.0007 0C11.493 0 11.8212 0.328205 11.8212 0.820513V15.2615L16.9904 10.0923C17.3186 9.7641 17.8109 9.7641 18.1391 10.0923C18.4673 10.4205 18.4673 10.9128 18.1391 11.241L11.575 17.8051C11.493 17.8872 11.4109 17.9692 11.3289 17.9692C11.2468 18.0513 11.0827 18.0513 11.0007 18.0513Z"
                                    fill="#8B0203"
                                  ></path>
                                </svg>
                              </a>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

               
                <div className="col-md-12 mt-2">
                  <h5 class=" ">2D Image</h5>

                  <div className="mt-4 tbl-container">
                    <table className="   w-100">
                      <thead>
                        <tr>
                          <th>File Name</th>

                          <th>File Type</th>
                          <th>updated at</th>
                          <th>Image</th>
                        </tr>
                      </thead>
                      <tbody>
                       
                        {formData.two_d_images.length > 0 &&
                          formData.two_d_images.map((file, index) => (
                            <tr key={index}>
                              <td>{file.document_file_name}</td>
                              <td>{file.document_content_type}</td>
                              <td>{file.document_updated_at}</td>
                              <td>
                                <a href={`${file.document_url}`}>
                                  {" "}
                                  <svg
                                    width="15"
                                    height="16"
                                    viewBox="0 0 22 23"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M20.8468 22.9744H1.1545C0.662189 22.9744 0.333984 22.6462 0.333984 22.1538V15.5897C0.333984 15.0974 0.662189 14.7692 1.1545 14.7692C1.6468 14.7692 1.97501 15.0974 1.97501 15.5897V21.3333H20.0263V15.5897C20.0263 15.0974 20.3545 14.7692 20.8468 14.7692C21.3391 14.7692 21.6673 15.0974 21.6673 15.5897V22.1538C21.6673 22.6462 21.3391 22.9744 20.8468 22.9744ZM11.0007 18.0513C10.9186 18.0513 10.7545 18.0513 10.6724 17.9692C10.5904 17.9692 10.5083 17.8872 10.4263 17.8051L3.86219 11.241C3.53398 10.9128 3.53398 10.4205 3.86219 10.0923C4.19039 9.7641 4.6827 9.7641 5.01091 10.0923L10.1801 15.2615V0.820513C10.1801 0.328205 10.5083 0 11.0007 0C11.493 0 11.8212 0.328205 11.8212 0.820513V15.2615L16.9904 10.0923C17.3186 9.7641 17.8109 9.7641 18.1391 10.0923C18.4673 10.4205 18.4673 10.9128 18.1391 11.241L11.575 17.8051C11.493 17.8872 11.4109 17.9692 11.3289 17.9692C11.2468 18.0513 11.0827 18.0513 11.0007 18.0513Z"
                                      fill="#8B0203"
                                    ></path>
                                  </svg>
                                </a>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

             
            </div>
          </div>
      </div>
    </>
  );
};

export default ProjectDetails;
