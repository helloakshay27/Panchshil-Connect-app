import React from 'react'

const ProjectConfigEdit= () => {
  return (
    
        <>
          <div className="main-content">
            <div className="website-content overflow-auto">
              <div className="module-data-section container-fluid">
                {/* <form onSubmit={handleSubmit}> */}
                  <div className="card mt-4 pb-4 mx-4">
                    <div className="card-header">
                      <h3 className="card-title">Project Configuration</h3>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        {/* Name Field */}
                        <div className="col-md-3">
                          <div className="form-group">
                            <label>
                              Name <span style={{ color: "#de7008" }}> *</span>
                            </label>
                            <input
                              className="form-control"
                              type="text"
                              name="name"
                              
                              
                              placeholder="Enter Name"
                            />
                          </div>
                        </div>
      
                        {/* Icon Upload */}
                        <div className="col-md-3">
                          <div className="form-group">
                            <label>
                              Icon <span style={{ color: "#de7008" }}> *</span>
                            </label>
                            <input
                              className="form-control"
                              type="file"
                              name="icon"
                              
                            />
                          </div>
                        </div>
      
                        {/* Icon Preview */}
                        {/* {iconPreview && (
                          <div className="col-md-3 mt-2">
                            <label>Preview:</label>
                            <div className="position-relative">
                              <img
                                src={iconPreview}
                                alt="Icon Preview"
                                className="img-thumbnail"
                                style={{
                                  maxWidth: "100px",
                                  maxHeight: "100px",
                                  objectFit: "cover",
                                }}
                              />
                              <button
                                type="button"
                                className="position-absolute border-0 rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  top: 2,
                                  right: -5,
                                  height: 20,
                                  width: 20,
                                  backgroundColor: "var(--red)",
                                  color: "white",
                                }}
                                // onClick={handleRemoveIcon}
                              >
                                x
                              </button>
                            </div>
                          </div> */}
                        {/* )} */}
                      </div>
                    </div>
                  </div>
      
                  {/* Submit & Cancel Buttons */}
                  {/* <div className="row mt-2 justify-content-center">
                    <div className="col-md-2">
                      <button type="submit" className="purple-btn2 w-100" disabled={loading}>
                        {loading ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                    <div className="col-md-2">
                      <button type="button" className="purple-btn2 w-100" onClick={() => navigate(-1)}>
                        Cancel
                      </button>
                    </div>
                  </div> */}
                {/* </form> */}
              </div>
            </div>
          </div>
        </>
      );
      
  
};
export default ProjectConfigEdit;