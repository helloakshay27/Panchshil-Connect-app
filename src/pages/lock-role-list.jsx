/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Check, Pencil, Plus, Search, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useConnectEvents } from "../hooks/useConnectEvents";
import { useSearchTracking } from "../hooks/useSearchTracking";
import { baseURL } from "./baseurl/apiDomain";
import "./lock-role-list.css";

const ACTION_ROWS = [
  { key: "create", label: "Add" },
  { key: "show", label: "View" },
  { key: "update", label: "Edit" },
  { key: "destroy", label: "Disable" },
];

const EMPTY_PERMISSIONS = {
  all: "false",
  create: "false",
  show: "false",
  update: "false",
  destroy: "false",
};

const getFunctionKey = (func) =>
  func.action_name || func.name?.toLowerCase().replace(/\s+/g, "_");

const getModuleName = (func) =>
  (func.parent_function || "").trim() || "Other";

const formatLabel = (name) =>
  String(name || "")
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const LockRoleList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [lockRoles, setLockRoles] = useState([]);
  const [lockFunctions, setLockFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [functionsLoading, setFunctionsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleSearch, setRoleSearch] = useState("");
  const [functionSearch, setFunctionSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [editedPermissions, setEditedPermissions] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchLockFunctions = async () => {
    toast.dismiss();
    try {
      setFunctionsLoading(true);
      const response = await axios.get(`${baseURL}/lock_functions.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });
      setLockFunctions(response.data || []);
    } catch (error) {
      console.error("Error fetching lock functions:", error);
      toast.error("Failed to load lock functions");
    } finally {
      setFunctionsLoading(false);
    }
  };

  const fetchLockRoles = async () => {
    toast.dismiss();
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}/lock_roles.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });
      const roles = response.data || [];
      setLockRoles(roles);
      setSelectedRole(roles.length > 0 ? roles[0] : null);
    } catch (error) {
      console.error("Error fetching lock roles:", error);
      toast.error("Failed to load lock roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLockRoles();
    fetchLockFunctions();
  }, []);

  useEffect(() => {
    setIsEditing(false);
    setFunctionSearch("");

    if (selectedRole && lockFunctions.length > 0) {
      try {
        let permissions = {};
        if (
          selectedRole.permissions_hash &&
          selectedRole.permissions_hash !== ""
        ) {
          permissions = JSON.parse(selectedRole.permissions_hash);
        }

        lockFunctions.forEach((func) => {
          const functionName = getFunctionKey(func);
          if (!permissions[functionName]) {
            permissions[functionName] = { ...EMPTY_PERMISSIONS };
          }
        });

        setEditedPermissions(permissions);
      } catch (error) {
        console.error("Error parsing permissions:", error);
        const defaultPermissions = {};
        lockFunctions.forEach((func) => {
          const functionName = getFunctionKey(func);
          defaultPermissions[functionName] = { ...EMPTY_PERMISSIONS };
        });
        setEditedPermissions(defaultPermissions);
      }
    } else {
      setEditedPermissions({});
    }
  }, [selectedRole, lockFunctions]);

  const handlePermissionChange = (functionName, permissionType) => {
    if (!isEditing) return;

    const updatedPermissions = { ...editedPermissions };
    const currentValue = updatedPermissions[functionName][permissionType];
    updatedPermissions[functionName][permissionType] =
      currentValue === "true" ? "false" : "true";

    if (
      permissionType === "all" &&
      updatedPermissions[functionName][permissionType] === "true"
    ) {
      updatedPermissions[functionName].create = "true";
      updatedPermissions[functionName].show = "true";
      updatedPermissions[functionName].update = "true";
      updatedPermissions[functionName].destroy = "true";
    }

    if (
      permissionType === "all" &&
      updatedPermissions[functionName][permissionType] === "false"
    ) {
      updatedPermissions[functionName].create = "false";
      updatedPermissions[functionName].show = "false";
      updatedPermissions[functionName].update = "false";
      updatedPermissions[functionName].destroy = "false";
    }

    if (permissionType !== "all") {
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
    toast.dismiss();
    if (!selectedRole) return;

    try {
      setSaving(true);
      const permissionsHash = JSON.stringify(editedPermissions);

      await axios.put(
        `${baseURL}/lock_roles/${selectedRole.id}.json`,
        {
          lock_role: {
            permissions_hash: permissionsHash,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      const updatedRoles = lockRoles.map((role) =>
        role.id === selectedRole.id
          ? { ...role, permissions_hash: permissionsHash }
          : role,
      );

      setLockRoles(updatedRoles);
      setSelectedRole((prev) =>
        prev ? { ...prev, permissions_hash: permissionsHash } : prev,
      );
      setIsEditing(false);
      connectEvents.onRecordSaved({
        mode: "updated",
        record_id: selectedRole.id,
      });
      toast.success("Role updated successfully!");
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Failed to update role.");
    } finally {
      setSaving(false);
    }
  };

  const filteredRoles = useMemo(
    () =>
      lockRoles.filter((role) => {
        const query = roleSearch.toLowerCase();
        return (
          role.name?.toLowerCase().includes(query) ||
          role.display_name?.toLowerCase().includes(query)
        );
      }),
    [lockRoles, roleSearch],
  );

  useSearchTracking(roleSearch, filteredRoles.length);

  const getFunctionDisplayName = (functionName) => {
    const func = lockFunctions.find(
      (item) => getFunctionKey(item) === functionName,
    );
    return func ? func.name : formatLabel(functionName);
  };

  const modules = useMemo(() => {
    const names = [];
    const seen = new Set();
    lockFunctions.forEach((func) => {
      const moduleName = getModuleName(func);
      if (!seen.has(moduleName)) {
        seen.add(moduleName);
        names.push(moduleName);
      }
    });
    return names;
  }, [lockFunctions]);

  useEffect(() => {
    if (!modules.length) {
      setSelectedModule("");
      return;
    }
    if (!modules.includes(selectedModule)) {
      setSelectedModule(modules[0]);
    }
  }, [modules, selectedModule]);

  const permissionEntries = useMemo(
    () => Object.entries(editedPermissions),
    [editedPermissions],
  );

  const visiblePermissionEntries = useMemo(() => {
    const query = functionSearch.toLowerCase().trim();
    const moduleKeys = new Set(
      lockFunctions
        .filter((func) => getModuleName(func) === selectedModule)
        .map(getFunctionKey),
    );

    return permissionEntries.filter(([functionName]) => {
      if (selectedModule && !moduleKeys.has(functionName)) return false;
      if (!query) return true;
      return getFunctionDisplayName(functionName)
        .toLowerCase()
        .includes(query);
    });
  }, [
    permissionEntries,
    functionSearch,
    lockFunctions,
    selectedModule,
  ]);

  const allVisibleEnabled =
    visiblePermissionEntries.length > 0 &&
    visiblePermissionEntries.every(
      ([, permissions]) => permissions?.all === "true",
    );

  const handleEnableAll = () => {
    if (!isEditing) return;
    const nextValue = allVisibleEnabled ? "false" : "true";
    const updatedPermissions = { ...editedPermissions };

    visiblePermissionEntries.forEach(([functionName]) => {
      updatedPermissions[functionName] = {
        all: nextValue,
        create: nextValue,
        show: nextValue,
        update: nextValue,
        destroy: nextValue,
      };
    });

    setEditedPermissions(updatedPermissions);
  };

  const selectedRoleName =
    selectedRole?.display_name || selectedRole?.name || "this role";

  return (
    <div className="module-data-section container-fluid lock-role-page">
        <div className="lock-role-header">
          <div className="lock-role-header-copy">
            <h1 className="lock-role-title">
              <span className="lock-role-title-icon" aria-hidden="true">
                <Shield size={16} strokeWidth={1.8} />
              </span>
              Role Management
            </h1>
            <p className="lock-role-subtitle">
              Manage user roles and their access permissions across modules
            </p>
          </div>
          <button
            type="button"
            className="lock-role-add-btn"
            onClick={() => navigate("/setup-member/lock-role-create")}
          >
            <Plus size={16} />
            Add New Role
          </button>
        </div>

        <div className="lock-role-layout">
          <aside className="lock-role-panel lock-role-sidebar">
            <h2 className="lock-role-panel-title">Roles</h2>
            <div className="lock-role-search">
              <Search size={15} />
              <input
                type="search"
                value={roleSearch}
                onChange={(event) => setRoleSearch(event.target.value)}
                placeholder="Search roles..."
                aria-label="Search roles"
              />
            </div>
            <div className="lock-role-list">
              {loading ? (
                <p className="lock-role-loading">Loading roles...</p>
              ) : filteredRoles.length > 0 ? (
                filteredRoles.map((role) => {
                  const active = selectedRole?.id === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      className={`lock-role-item${active ? " is-active" : ""}`}
                      onClick={() => setSelectedRole(role)}
                    >
                      <span className="lock-role-item-name">
                        {role.name || "Unnamed Role"}
                      </span>
                      {active && <Check size={16} />}
                    </button>
                  );
                })
              ) : (
                <p className="lock-role-empty">No roles found</p>
              )}
            </div>
          </aside>

          <section className="lock-role-panel lock-role-permissions">
            {selectedRole ? (
              <>
                <div className="lock-role-permissions-header">
                  <div>
                    <h2>Permissions Configuration</h2>
                    <p>
                      Configure access rights for <strong>{selectedRoleName}</strong>
                    </p>
                  </div>
                  {isEditing ? (
                    <button
                      type="button"
                      className="lock-role-edit-btn"
                      onClick={savePermissions}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Permissions"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="lock-role-edit-btn"
                      onClick={() => setIsEditing(true)}
                    >
                      <Pencil size={15} />
                      Edit Permissions
                    </button>
                  )}
                </div>

                {modules.length > 0 && (
                  <div className="lock-role-modules" role="tablist">
                    {modules.map((moduleName) => {
                      const active = selectedModule === moduleName;
                      return (
                        <button
                          key={moduleName}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          className={`lock-role-module-tab${active ? " is-active" : ""}`}
                          onClick={() => {
                            setSelectedModule(moduleName);
                            setFunctionSearch("");
                          }}
                        >
                          {formatLabel(moduleName)}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="lock-role-toolbar">
                  <div className="lock-role-access-meta">
                    {selectedModule
                      ? `${formatLabel(selectedModule)} Module Access`
                      : "Module Access"}
                    <span>
                      {visiblePermissionEntries.length} Function
                      {visiblePermissionEntries.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="lock-role-toolbar-actions">
                    <div className="lock-role-search">
                      <Search size={15} />
                      <input
                        type="search"
                        value={functionSearch}
                        onChange={(event) =>
                          setFunctionSearch(event.target.value)
                        }
                        placeholder="Search functions..."
                        aria-label="Search functions"
                      />
                    </div>
                    <label className="lock-role-enable-all">
                      Enable All
                      <input
                        type="checkbox"
                        checked={allVisibleEnabled}
                        onChange={handleEnableAll}
                        disabled={!isEditing || visiblePermissionEntries.length === 0}
                        aria-label="Enable all functions"
                      />
                    </label>
                  </div>
                </div>

                <div className="lock-role-table">
                  {functionsLoading ? (
                    <div className="lock-role-placeholder">
                      Loading functions...
                    </div>
                  ) : visiblePermissionEntries.length > 0 ? (
                    visiblePermissionEntries.map(([functionName, permissions]) => (
                      <div key={functionName}>
                        <div className="lock-role-row is-parent">
                          <div className="lock-role-function">
                            <span className="lock-role-function-dot" aria-hidden="true">
                              <Shield size={12} strokeWidth={2} />
                            </span>
                            {getFunctionDisplayName(functionName)}
                          </div>
                          <div className="lock-role-enabled">
                            <input
                              type="checkbox"
                              checked={permissions?.all === "true"}
                              disabled={!isEditing}
                              onChange={() =>
                                handlePermissionChange(functionName, "all")
                              }
                              aria-label={`Enable ${getFunctionDisplayName(functionName)}`}
                            />
                          </div>
                        </div>
                        {ACTION_ROWS.map((action) => (
                          <div
                            key={`${functionName}-${action.key}`}
                            className="lock-role-row is-child"
                          >
                            <div className="lock-role-function">
                              <span className="lock-role-child-dot" />
                              {action.label}
                            </div>
                            <div className="lock-role-enabled">
                              <input
                                type="checkbox"
                                checked={permissions?.[action.key] === "true"}
                                disabled={!isEditing}
                                onChange={() =>
                                  handlePermissionChange(
                                    functionName,
                                    action.key,
                                  )
                                }
                                aria-label={`${action.label} ${getFunctionDisplayName(functionName)}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="lock-role-placeholder">
                      No functions found
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="lock-role-placeholder">
                Select a role to view permissions
              </div>
            )}
          </section>
        </div>
    </div>
  );
};

export default LockRoleList;
