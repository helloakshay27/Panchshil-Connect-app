import React from 'react'

const CategoryTypes = () => {
  return (
    <div className="main-content">
    <div className="website-content overflow-auto">
      <div className="module-data-section container-fluid">
        <div className="card mt-4 pb-4 mx-4">
          <div className="card-header">
            <h3 className="card-title">Category Type</h3>
          </div>
          <div className="card-body">
            
              <div className="row">
                {/* Name Field */}
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Name{" "}
                      <span style={{ color: "#de7008", fontSize: "16px" }}>
                        *
                      </span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter name"
                      
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ✅ Submit & Cancel Buttons */}

              {/* ✅ End of Buttons */}
            
          </div>
        </div>
        <div className="row mt-2 justify-content-center">
          <div className="col-md-2">
            <button
              type="submit"
              className="purple-btn2 w-100"
            //   disabled={loading}
            >
            Submit
            </button>
          </div>

          <div className="col-md-2">
            <button
              type="button"
              className="purple-btn2 w-100"
            //   onClick={() => navigate("/setup-member/property-type-list")}
            //   disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default CategoryTypes