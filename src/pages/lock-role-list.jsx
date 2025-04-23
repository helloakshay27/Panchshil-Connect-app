import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const LockRoleList = () => {
  const [lockRoles, setLockRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRole, setEditingRole] = useState(null);
  const [expandedPermissions, setExpandedPermissions] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    display_name: "",
    active: true,
    permissions_hash: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchLockRoles();
  }, []);

  const fetchLockRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://panchshil-super.lockated.com/lock_roles.json",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setLockRoles(response.data || []);
    } catch (error) {
      console.error("Error fetching lock roles:", error);
      toast.error("Failed to load lock roles");
      setError("Failed to load lock roles");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.patch(
        `https://panchshil-super.lockated.com/lock_roles/${id}.json`,
        {
          lock_role: {
            active: !currentStatus,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Lock role status updated successfully");
      setLockRoles(prevRoles => 
        prevRoles.map(role => 
          role.id === id ? { ...role, active: !currentStatus } : role
        )
      );
    } catch (error) {
      console.error("Error updating lock role status:", error);
      toast.error("Failed to update lock role status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lock role?")) {
      try {
        await axios.delete(
          `https://panchshil-super.lockated.com/lock_roles/${id}.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        toast.success("Lock role deleted successfully");
        setLockRoles(prevRoles => prevRoles.filter(role => role.id !== id));
      } catch (error) {
        console.error("Error deleting lock role:", error);
        toast.error("Failed to delete lock role");
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredRoles = lockRoles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (role) => {
    setEditingRole(role.id);
    setEditFormData({
      name: role.name,
      display_name: role.display_name,
      active: role.active,
      permissions_hash: role.permissions_hash,
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditCancel = () => {
    setEditingRole(null);
  };

  const handleEditSubmit = async (id) => {
    try {
      await axios.patch(
        `https://panchshil-super.lockated.com/lock_roles/${id}.json`,
        {
          lock_role: editFormData
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Lock role updated successfully");
      setLockRoles(prevRoles => 
        prevRoles.map(role => 
          role.id === id ? { ...role, ...editFormData } : role
        )
      );
      setEditingRole(null);
    } catch (error) {
      console.error("Error updating lock role:", error);
      toast.error("Failed to update lock role");
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSearchTerm(searchQuery);
  };

  const togglePermissionsView = (id) => {
    if (expandedPermissions === id) {
      setExpandedPermissions(null);
    } else {
      setExpandedPermissions(id);
    }
  };

  const renderPermissionsTable = (permissionsHash) => {
    try {
      const permissions = JSON.parse(permissionsHash);
      return (
        <div className="permissions-table-container mt-3 mb-4">
          <table className="w-100 permissions-table">
            <thead>
              <tr className="bg-light">
                <th>Function</th>
                <th>All</th>
                <th>Add</th>
                <th>View</th>
                <th>Edit</th>
                <th>Disable</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(permissions).map((functionName) => (
                <tr key={functionName}>
                  <td>{functionName.charAt(0).toUpperCase() + functionName.slice(1)}</td>
                  <td className="text-center">
                    <input type="checkbox" checked={permissions[functionName].all === "true"} readOnly />
                  </td>
                  <td className="text-center">
                    <input type="checkbox" checked={permissions[functionName].create === "true"} readOnly />
                  </td>
                  <td className="text-center">
                    <input type="checkbox" checked={permissions[functionName].show === "true"} readOnly />
                  </td>
                  <td className="text-center">
                    <input type="checkbox" checked={permissions[functionName].update === "true"} readOnly />
                  </td>
                  <td className="text-center">
                    <input type="checkbox" checked={permissions[functionName].destroy === "true"} readOnly />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } catch (error) {
      console.error("Error parsing permissions hash:", error);
      return <div className="text-danger">Invalid permissions format</div>;
    }
  };

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="d-flex justify-content-end px-4 pt-2 mt-3">
          <div className="col-md-4 pe-2 pt-2">
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control tbl-search table_search"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <div className="input-group-append">
                  <button type="submit" className="btn btn-md btn-default">
                    <svg
                      width={16}
                      height={16}
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.66927 13.939C3.9026 13.939 0.835938 11.064 0.835938 7.53271C0.835938 4.00146 3.9026 1.12646 7.66927 1.12646C11.4359 1.12646 14.5026 4.00146 14.5026 7.53271C14.5026 11.064 11.4359 13.939 7.66927 13.939ZM7.66927 2.06396C4.44927 2.06396 1.83594 4.52021 1.83594 7.53271C1.83594 10.5452 4.44927 13.0015 7.66927 13.0015C10.8893 13.0015 13.5026 10.5452 13.5026 7.53271C13.5026 4.52021 10.8893 2.06396 7.66927 2.06396Z"
                        fill="#8B0203"
                      />
                      <path
                        d="M14.6676 14.5644C14.5409 14.5644 14.4143 14.5206 14.3143 14.4269L12.9809 13.1769C12.7876 12.9956 12.7876 12.6956 12.9809 12.5144C13.1743 12.3331 13.4943 12.3331 13.6876 12.5144L15.0209 13.7644C15.2143 13.9456 15.2143 14.2456 15.0209 14.4269C14.9209 14.5206 14.7943 14.5644 14.6676 14.5644Z"
                        fill="#8B0203"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="card-tools mt-1">
            <button
              className="purple-btn2 rounded-3"
              fdprocessedid="xn3e6n"
              onClick={() => navigate("/setup-member/lock-role-create")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={26}
                height={20}
                fill="currentColor"
                className="bi bi-plus"
                viewBox="0 0 16 16"
              >
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
              </svg>
              <span>Add</span>
            </button>
          </div>
        </div>

        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header">
            <h3 className="card-title">Lock Role List</h3>
          </div>
          <div className="card-body mt-4 pb-4 pt-0">
            {loading ? (
              <div className="text-center">
                <div
                  className="spinner-border"
                  role="status"
                  style={{ color: "var(--red)" }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="tbl-container mt-3">
                <table className="w-100">
                  <thead>
                    <tr>
                      <th>Sr No.</th>
                      <th>Name</th>
                     
                      <th>Status</th>
                     
                      <th>Permissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.length > 0 ? (
                      filteredRoles.map((role, index) => (
                        <React.Fragment key={role.id}>
                          <tr>
                            <td>{index + 1}</td> {/* Serial Number */}
                            <td>
                              {editingRole === role.id ? (
                                <input
                                  type="text"
                                  name="name"
                                  value={editFormData.name}
                                  onChange={handleEditFormChange}
                                  className="form-control form-control-sm"
                                />
                              ) : (
                                role.name
                              )}
                            </td>
                          
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm me-1"
                                  title={role.active ? "Deactivate" : "Activate"}
                                  onClick={() => handleToggleStatus(role.id, role.active)}
                                  style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    padding: 0,
                                    width: "70px",
                                  }}
                                >
                                  {role.active ? (
                                    <svg
                                      width="40"
                                      height="25"
                                      fill="#de7008"
                                      className="bi bi-toggle-on"
                                      viewBox="0 0 16 16"
                                    >
                                      <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8" />
                                    </svg>
                                  ) : (
                                    <svg
                                      width="40"
                                      height="25"
                                      fill="#667085"
                                      className="bi bi-toggle-off"
                                      viewBox="0 0 16 16"
                                    >
                                      <path d="M11 4a4 4 0 0 1 0 8H8a5 5 0 0 0 2-4 5 5 0 0 0-2-4zm-6 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8M0 8a5 5 0 0 0 5 5h6a5 5 0 0 0 0-10H5a5 5 0 0 0-5 5" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </td>
                          
                            <td>
                              {role.permissions_hash && (
                                <button 
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => togglePermissionsView(role.id)}
                                >
                                  {expandedPermissions === role.id ? 'Hide Permissions' : 'View Permissions'}
                                </button>
                              )}
                            </td>
                          </tr>
                          {expandedPermissions === role.id && role.permissions_hash && (
                            <tr>
                              <td colSpan="8" className="p-0">
                                <div className="p-3 bg-light">
                                  {renderPermissionsTable(role.permissions_hash)}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No lock roles found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .permissions-table {
          border: 1px solid #dee2e6;
        }
        
        .permissions-table th, 
        .permissions-table td {
          border: 1px solid #dee2e6;
          padding: 0.5rem;
        }
        
        .permissions-table-container {
          max-width: 100%;
          overflow-x: auto;
        }
        
        .permissions-table input[type="checkbox"] {
          width: 16px;
          height: 16px;
        }
      `}</style>
    </div>
  );
};

export default LockRoleList;