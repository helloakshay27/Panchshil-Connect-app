import React, { useState } from "react";
import axios from "axios";
import Select from "react-select";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";

const ProjectDetailsCreate = () => {
  const [formData, setFormData] = useState({
    projectType: "",
    sfdcProjectId: "",
    constructionStatus: "",
    configurationType: "",
    projectName: "",
    location: "",
    description: "",
    priceOnward: "",
    projectSizeMtr: "",
    projectSizeFt: "",
    rareCarpetAreaMtr: "",
    rareCarpetAreaFt: "",
    numTowers: "",
    numUnits: "",
    rareNumber: "",
    amenities: "",
    specifications: "",
    landArea: "",
    addressLine1: "",
    addressLine2: "",
    addressLine3: "",
    city: "",
    state: "",
    pinCode: "",
    country: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/projects.json",
        formData
      );
      console.log(response.data);
    } catch (error) {
      console.error("There was an error submitting the form!", error);
    }
  };

  return (
    <>
      {/* <Header /> */}
      <div className="main-content">
        <Sidebar />
        <div className="website-content overflow-auto">
          <div className="module-data-section p-3">
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Project Details</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Project Type</label>
                        <select
                          className="form-control form-select"
                          style={{ width: "100%" }}
                          name="projectType"
                          value={formData.projectType}
                          onChange={handleChange}
                        >
                          <option value="" disabled selected>
                            Select Project Type
                          </option>
                          <option value="Alabama">Residental</option>
                          <option value="Alaska">Office Parks</option>
                          <option value="California">Plots</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>SFDC Project ID</label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Default input"
                          name="sfdcProjectId"
                          value={formData.sfdcProjectId}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Project Construction Status</label>
                        <select
                          className="form-control form-select"
                          style={{ width: "100%" }}
                          name="constructionStatus"
                          value={formData.constructionStatus}
                          onChange={handleChange}
                        >
                          <option value="" disabled selected>
                            Select status
                          </option>
                          <option value="Alabama">Completed</option>
                          <option value="Alaska">Ready-To-Move-In</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Configuration Type</label>
                        <select
                          className="form-control form-select"
                          style={{ width: "100%" }}
                          name="constructionType"
                          value={formData.constructionType}
                          onChange={handleChange}
                        >
                          <option value="" disabled selected>
                            Select Type
                          </option>
                          <option value="Alabama">3 BHK</option>
                          <option value="Alaska">4 BHK</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>Project Name</label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Default input"
                          name="projectName"
                          value={formData.projectName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>Location</label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Default input"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6 mt-2">
                      <div className="form-group">
                        <label>Project Description</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          placeholder="Enter ..."
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>Price Onward</label>
                        <select
                          className="form-control form-select"
                          style={{ width: "100%" }}
                          name="priceOnward"
                          value={formData.priceOnward}
                          onChange={handleChange}
                        >
                          <option value="Alabama">Alabama</option>
                          <option value="Alaska">Alaska</option>
                          <option value="California">California</option>
                          <option value="Delaware">Delaware</option>
                          <option value="Tennessee">Tennessee</option>
                          <option value="Texas">Texas</option>
                          <option value="Washington">Washington</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>Project Size (Sq. Mtr.)</label>
                        <input
                          className="form-control"
                          type="number"
                          placeholder="Default input"
                          name="projectSizeMtr"
                          value={formData.projectSizeMtr}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>Project Size (Sq. Ft.)</label>
                        <input
                          className="form-control"
                          type="number"
                          placeholder="Default input"
                          name="projectSizeFt"
                          value={formData.projectSizeFt}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>Rare Carpet Area (Sq. M)</label>
                        <input
                          className="form-control"
                          type="number"
                          placeholder="Default input"
                          name="rareCarpetAreaMtr"
                          value={formData.rareCarpetAreaMtr}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>Rare Carpet Area (Sq. Ft.)</label>
                        <input
                          className="form-control"
                          type="number"
                          placeholder="Default input"
                          name="rareCarpetAreaFt"
                          value={formData.rareCarpetAreaFt}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>Number of Towers</label>
                        <input
                          className="form-control"
                          type="number"
                          placeholder="Default input"
                          name="numTowers"
                          value={formData.numTowers}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>Number of Units</label>
                        <input
                          className="form-control"
                          type="number"
                          placeholder="Default input"
                          name="numUnits"
                          value={formData.numUnits}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>Rare Number</label>
                        <input
                          className="form-control"
                          type="number"
                          placeholder="Default input"
                          name="rareNumber"
                          value={formData.rareNumber}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>Amenities</label>
                        <select
                          className="form-control form-select"
                          style={{ width: "100%" }}
                          name="amenities"
                          value={formData.amenities}
                          onChange={handleChange}
                        >
                          <option value="Alabama">Alabama</option>
                          <option value="Alaska">Alaska</option>
                          <option value="California">California</option>
                          <option value="Delaware">Delaware</option>
                          <option value="Tennessee">Tennessee</option>
                          <option value="Texas">Texas</option>
                          <option value="Washington">Washington</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>Specifications</label>
                        <select
                          className="form-control form-select"
                          style={{ width: "100%" }}
                          name="specifications"
                          value={formData.specifications}
                          onChange={handleChange}
                        >
                          <option value="Alabama">Alabama</option>
                          <option value="Alaska">Alaska</option>
                          <option value="California">California</option>
                          <option value="Delaware">Delaware</option>
                          <option value="Tennessee">Tennessee</option>
                          <option value="Texas">Texas</option>
                          <option value="Washington">Washington</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>Land Area</label>
                        <input
                          className="form-control"
                          type="number"
                          placeholder="Default input"
                          name="landArea"
                          value={formData.landArea}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header3">
                <h3 className="card-title">Address</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Address Section */}
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>Address Line 1</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Address Line 1"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>Address Line 2</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Address Line 2"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>Address Line 3</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Address Line 3"
                        name="addressLine3"
                        value={formData.addressLine3}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* City, State, Pin, Country Section */}
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>State</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="State"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>Pin Code</label>
                      <input
                        className="form-control"
                        type="number"
                        placeholder="Pin Code"
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>Country</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-2 justify-content-center">
              <div className="col-md-2">
                <button type="submit" className="purple-btn2 w-100">
                  Submit
                </button>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default ProjectDetailsCreate;
