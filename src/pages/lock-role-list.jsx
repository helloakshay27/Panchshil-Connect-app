import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const LockRoleList = () => {
  const [lockRoles, setLockRoles] = useState([]);
  const [lockFunctions, setLockFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [functionsLoading, setFunctionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editedPermissions, setEditedPermissions] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchLockRoles();
    fetchLockFunctions();
  }, []);

  useEffect(() => {
    if (selectedRole && lockFunctions.length > 0) {
      try {
        // Try to parse existing permissions or create new ones based on available functions
        let permissions = {};
        
        if (selectedRole.permissions_hash && selectedRole.permissions_hash !== "") {
          // Parse existing permissions
          permissions = JSON.parse(selectedRole.permissions_hash);
        }
        
        // Make sure all functions are present in permissions
        lockFunctions.forEach(func => {
          const functionName = func.action_name || func.name.toLowerCase().replace(/\s+/g, '_');
          if (!permissions[functionName]) {
            permissions[functionName] = { 
              all: "false", 
              create: "false", 
              show: "false", 
              update: "false", 
              destroy: "false" 
            };
          }
        });
        
        setEditedPermissions(permissions);
      } catch (error) {
        console.error("Error parsing permissions:", error);
        
        // Create default permissions based on available functions
        const defaultPermissions = {};
        lockFunctions.forEach(func => {
          const functionName = func.action_name || func.name.toLowerCase().replace(/\s+/g, '_');
          defaultPermissions[functionName] = { 
            all: "false", 
            create: "false", 
            show: "false", 
            update: "false", 
            destroy: "false" 
          };
        });
        
        setEditedPermissions(defaultPermissions);
      }
    } else {
      // Reset permissions when no role is selected
      setEditedPermissions({});
    }
  }, [selectedRole, lockFunctions]);

  const fetchLockFunctions = async () => {
    try {
      setFunctionsLoading(true);
      const response = await axios.get(
        "https://panchshil-super.lockated.com/lock_functions.json",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setLockFunctions(response.data || []);
    } catch (error) {
      console.error("Error fetching lock functions:", error);
      toast.error("Failed to load lock functions");
    } finally {
      setFunctionsLoading(false);
    }
  };

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
      // We don't auto-select any role now to show blank table first
      setSelectedRole(null);
    } catch (error) {
      console.error("Error fetching lock roles:", error);
      toast.error("Failed to load lock roles");
      setError("Failed to load lock roles");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePermissionChange = (functionName, permType) => {
    const updatedPermissions = { ...editedPermissions };
    
    // Toggle the permission
    const currentValue = updatedPermissions[functionName][permType];
    updatedPermissions[functionName][permType] = currentValue === "true" ? "false" : "true";
    
    // If "all" is checked, check all other permissions
    if (permType === "all" && updatedPermissions[functionName][permType] === "true") {
      updatedPermissions[functionName].create = "true";
      updatedPermissions[functionName].show = "true";
      updatedPermissions[functionName].update = "true";
      updatedPermissions[functionName].destroy = "true";
    }
    
    // If "all" is unchecked, uncheck all other permissions
    if (permType === "all" && updatedPermissions[functionName][permType] === "false") {
      updatedPermissions[functionName].create = "false";
      updatedPermissions[functionName].show = "false";
      updatedPermissions[functionName].update = "false";
      updatedPermissions[functionName].destroy = "false";
    }
    
    // Check if all individual permissions are checked, then check "all" too
    if (permType !== "all") {
      const allChecked = 
        updatedPermissions[functionName].create === "true" &&
        updatedPermissions[functionName].show === "true" &&
        updatedPermissions[functionName].update === "true" &&
        updatedPermissions[functionName].destroy === "true";
      
      updatedPermissions[functionName].all = allChecked ? "true" : "false";
    }
    
    setEditedPermissions(updatedPermissions);
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    
    try {
      const permissionsHash = JSON.stringify(editedPermissions);
      
      await axios.put(
        `https://panchshil-super.lockated.com/lock_roles/${selectedRole.id}.json`,
        {
          lock_role: {
            permissions_hash: permissionsHash
          }
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      // Update the local state
      const updatedRoles = lockRoles.map(role => 
        role.id === selectedRole.id 
          ? { ...role, permissions_hash: permissionsHash } 
          : role
      );
      
      setLockRoles(updatedRoles);
      
      // Show success toast
      toast.success("Permissions updated successfully!");
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Failed to save permissions");
    }
  };

  const filteredRoles = lockRoles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.display_name && role.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Function to format function name for display
  const formatFunctionName = (name) => {
    // Convert snake_case to Title Case
    return name.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Function to get a list of all function names being used
  const getFunctionDisplayName = (functionName) => {
    const func = lockFunctions.find(f => 
      (f.action_name && f.action_name === functionName) || 
      (f.name && f.name.toLowerCase().replace(/\s+/g, '_') === functionName)
    );
    
    if (func) {
      return func.name;
    }
    
    return formatFunctionName(functionName);
  };

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid">
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="d-flex justify-content-end px-4 pt-2 mt-3">
          <div className="col-md-4 pe-2 pt-2">
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

        <div className="row mx-2 mt-3">
          {/* Left sidebar with roles */}
          <div className="col-md-3">
            <div className="card sidebar-card">
              <div className="role-list">
                {loading ? (
                  <div className="text-center py-4">
                    <div
                      className="spinner-border"
                      role="status"
                      style={{ color: "var(--red)" }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : filteredRoles.length > 0 ? (
                  filteredRoles.map((role) => (
                    <div 
                      key={role.id} 
                      className={`role-item ${selectedRole && selectedRole.id === role.id ? 'active' : ''}`}
                      onClick={() => handleRoleSelect(role)}
                    >
                      {role.name || 'Unnamed Role'}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">No roles found</div>
                )}
              </div>
            </div>
          </div>

          {/* Right content with permissions table */}
          <div className="col-md-9">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h3 className="card-title m-0">
                  {/* {selectedRole ? `${selectedRole.name} Permissions` : 'Role Permissions'} */}
                  Role Permissions
                </h3>
                {/* {selectedRole && <div className="card-title-badge">new Permissions</div>} */}
              </div>
              <div className="card-body">
                {(loading || functionsLoading) ? (
                  <div className="text-center">
                    <div
                      className="spinner-border"
                      role="status"
                      style={{ color: "var(--red)" }}
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : selectedRole ? (
                  <div className="permissions-table-container mt-3 mb-4">
                    {(!editedPermissions || typeof editedPermissions !== 'object') ? (
                      <div className="alert alert-warning">
                        Unable to load permissions. Using default empty permissions.
                      </div>
                    ) : (
                      <>
                         <div className="tbl-container mt-3">
                         <table className="w-100">
                          <thead>
                            <tr className="bg-light">
                              <th></th>
                              <th >All</th>
                              <th >Add</th>
                              <th >View</th>
                              <th >Edit</th>
                              <th >Disable</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(editedPermissions).map((functionName) => (
                              <tr key={functionName}>
                                <td>{getFunctionDisplayName(functionName)}</td>
                                <td className="text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={editedPermissions[functionName]?.all === "true"} 
                                    onChange={() => handlePermissionChange(functionName, "all")}
                                  />
                                </td>
                                <td className="text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={editedPermissions[functionName]?.create === "true"} 
                                    onChange={() => handlePermissionChange(functionName, "create")}
                                  />
                                </td>
                                <td className="text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={editedPermissions[functionName]?.show === "true"} 
                                    onChange={() => handlePermissionChange(functionName, "show")}
                                  />
                                </td>
                                <td className="text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={editedPermissions[functionName]?.update === "true"} 
                                    onChange={() => handlePermissionChange(functionName, "update")}
                                  />
                                </td>
                                <td className="text-center">
                                  <input 
                                    type="checkbox" 
                                    checked={editedPermissions[functionName]?.destroy === "true"} 
                                    onChange={() => handlePermissionChange(functionName, "destroy")}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        </div>
                        
                        <div className="text-end mt-3">
                          <button 
                            className="update-btn"
                            onClick={savePermissions}
                          >
                            Update
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">Select a role to view permissions</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <style jsx>{`
        .role-list {
          max-height: 500px;
          overflow-y: auto;
        }
        
        .role-item {
          padding: 12px 15px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .role-item:hover {
          background-color: #f8f9fa;
        }
        
        .role-item.active {
          background-color: #f0f0f0;
          border-left: 3px solid #8B0203;
          font-weight: 600;
        }
        
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
        
        .sidebar-card {
          height: 100%;
          box-shadow: 0 0 10px rgba(0,0,0,0.05);
        }
        
        .card-title-badge {
          background-color: #f38120;
          color: white;
          padding: 5px 15px;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .update-btn {
          background-color: #f38120;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 4px;
          font-weight: 500;
        }
      `}</style> */}
    </div>
  );
};

export default LockRoleList;