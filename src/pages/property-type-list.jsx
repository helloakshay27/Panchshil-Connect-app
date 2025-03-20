import React from 'react'

const PropertyTypeList= () => {
  return (
    <>
  <div className="main-content">
    <div className="website-content overflow-auto">
      <div className="module-data-section container-fluid">
        {/* Table Content */}
        <div className="card mx-3 mt-4">
          <div className="card-header">
            <h3 className="card-title">Property Type List</h3>
          </div>
          <div className="card-body mt-4 pb-4 pt-0">
            <div className="tbl-container mt-3">
              <table className="w-100">
                <thead>
                  <tr>
                    <th>Sr No</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Apartment</td>
                    <td>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="25"
                        fill="#de7008"
                        className="bi bi-toggle-on"
                        viewBox="0 0 16 16"
                      >
                        <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8" />
                      </svg>
                    </td>
                  </tr>
                  
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</>

  )
}

export default PropertyTypeList