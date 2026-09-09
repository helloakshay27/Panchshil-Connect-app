/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Box, ButtonBase, Popover, Typography } from "@mui/material";
import axios from "axios";
import { toast } from "react-hot-toast";
import EnhancedTable from "../components/EnhancedTable";
import { useConnectEvents } from "../hooks/useConnectEvents";
import { useSearchTracking } from "../hooks/useSearchTracking";
import { baseURL } from "./baseurl/apiDomain";
import "../mor.css";

const pageSize = 10;

const PermissionCheckbox = ({ checked, label, onChange }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={onChange}
    aria-label={label}
  />
);

const LockRoleList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [lockRoles, setLockRoles] = useState([]);
  const [lockFunctions, setLockFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [functionsLoading, setFunctionsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editedPermissions, setEditedPermissions] = useState({});
  const [permissionPage, setPermissionPage] = useState(1);
  const [roleMenuAnchor, setRoleMenuAnchor] = useState(null);

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
          const functionName =
            func.action_name || func.name.toLowerCase().replace(/\s+/g, "_");
          if (!permissions[functionName]) {
            permissions[functionName] = {
              all: "false",
              create: "false",
              show: "false",
              update: "false",
              destroy: "false",
            };
          }
        });

        setEditedPermissions(permissions);
      } catch (error) {
        console.error("Error parsing permissions:", error);
        const defaultPermissions = {};

        lockFunctions.forEach((func) => {
          const functionName =
            func.action_name || func.name.toLowerCase().replace(/\s+/g, "_");
          defaultPermissions[functionName] = {
            all: "false",
            create: "false",
            show: "false",
            update: "false",
            destroy: "false",
          };
        });

        setEditedPermissions(defaultPermissions);
      }
    } else {
      setEditedPermissions({});
    }
    setPermissionPage(1);
  }, [selectedRole, lockFunctions]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setRoleMenuAnchor(null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePermissionChange = (functionName, permissionType) => {
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
      connectEvents.onRecordSaved({
        mode: "updated",
        record_id: selectedRole.id,
      });
      toast.success("Role Updated successfully!");
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast.error("Failed to update role.");
    }
  };

  const filteredRoles = useMemo(
    () =>
      lockRoles.filter(
        (role) =>
          role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (role.display_name &&
            role.display_name.toLowerCase().includes(searchTerm.toLowerCase())),
      ),
    [lockRoles, searchTerm],
  );

  useSearchTracking(searchTerm, filteredRoles.length);

  const formatFunctionName = (name) =>
    name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const getFunctionDisplayName = (functionName) => {
    const func = lockFunctions.find(
      (item) =>
        (item.action_name && item.action_name === functionName) ||
        (item.name &&
          item.name.toLowerCase().replace(/\s+/g, "_") === functionName),
    );
    return func ? func.name : formatFunctionName(functionName);
  };

  const permissionRows = useMemo(
    () =>
      Object.entries(editedPermissions).map(([functionName, permissions]) => ({
        functionName,
        permissions,
      })),
    [editedPermissions],
  );

  const permissionColumns = [
    {
      key: "functionName",
      label: "Functions",
      alwaysVisible: true,
      render: (row) => getFunctionDisplayName(row.functionName),
    },
    ...[
      ["all", "All"],
      ["create", "Add"],
      ["show", "View"],
      ["update", "Edit"],
      ["destroy", "Disable"],
    ].map(([key, label]) => ({
      key,
      label,
      sortable: false,
      render: (row) => (
        <PermissionCheckbox
          checked={row.permissions?.[key] === "true"}
          label={`${label} ${getFunctionDisplayName(row.functionName)}`}
          onChange={() => handlePermissionChange(row.functionName, key)}
        />
      ),
    })),
  ];

  const addButton = (
    <>
      <button
        type="button"
        className="purple-btn2 enhanced-table__add"
        onClick={(event) => setRoleMenuAnchor(event.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={Boolean(roleMenuAnchor)}
      >
        <Plus size={16} />
        <span>Add</span>
      </button>
      <Popover
        anchorEl={roleMenuAnchor}
        open={Boolean(roleMenuAnchor)}
        onClose={() => setRoleMenuAnchor(null)}
        anchorReference="none"
        slotProps={{
          paper: {
            sx: {
              position: "fixed",
              top: "auto !important",
              right: "auto !important",
              bottom: "30px !important",
              left: "50% !important",
              transform: "translateX(-50%) !important",
              maxWidth: "calc(100vw - 32px)",
              overflow: "hidden",
              borderRadius: "10px",
              boxShadow: "0 8px 28px rgba(15, 23, 42, 0.16)",
            },
          },
        }}
      >
        <Box
          role="menu"
          aria-label="Lock roles"
          sx={{
            display: "flex",
            alignItems: "stretch",
            minHeight: 74,
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              minWidth: 145,
              px: 2,
              borderLeft: "30px solid #d8c8a1",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#222" }}>
                Roles
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#667085" }}>
                Select a role
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{ display: "flex", alignItems: "stretch", overflowX: "auto" }}
          >
            {loading ? (
              <Typography sx={{ px: 2, alignSelf: "center", fontSize: 12 }}>
                Loading roles...
              </Typography>
            ) : lockRoles.length > 0 ? (
              lockRoles.map((role) => {
                const active = selectedRole?.id === role.id;
                return (
                  <ButtonBase
                    key={role.id}
                    role="menuitem"
                    onClick={() => handleRoleSelect(role)}
                    sx={{
                      minWidth: 92,
                      px: 1.5,
                      color: active ? "var(--red)" : "#344054",
                      borderLeft: "1px solid #eaecf0",
                      fontSize: 12,
                      fontWeight: active ? 700 : 500,
                      whiteSpace: "nowrap",
                      "&:hover": { backgroundColor: "#fff7ef" },
                    }}
                  >
                    {role.name || "Unnamed Role"}
                  </ButtonBase>
                );
              })
            ) : (
              <Typography sx={{ px: 2, alignSelf: "center", fontSize: 12 }}>
                No roles found
              </Typography>
            )}

            <ButtonBase
              role="menuitem"
              onClick={() => {
                setRoleMenuAnchor(null);
                navigate("/setup-member/lock-role-create");
              }}
              sx={{
                minWidth: 96,
                px: 1.5,
                gap: 0.75,
                color: "#344054",
                borderLeft: "1px solid #eaecf0",
                fontSize: 12,
                fontWeight: 600,
                "&:hover": { backgroundColor: "#fff7ef" },
              }}
            >
              <Plus size={16} />
              New Role
            </ButtonBase>

            <ButtonBase
              aria-label="Close role actions"
              onClick={() => setRoleMenuAnchor(null)}
              sx={{
                width: 58,
                flexShrink: 0,
                borderLeft: "1px solid #eaecf0",
                "&:hover": { backgroundColor: "#f9fafb" },
              }}
            >
              <X size={17} />
            </ButtonBase>
          </Box>
        </Box>
      </Popover>
    </>
  );

  const updateButton = selectedRole ? (
    <button type="button" className="update-btn" onClick={savePermissions}>
      Update
    </button>
  ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">LOCK ROLE LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <div className="row">
              <div className="col-md-12">
                <EnhancedTable
                  columns={permissionColumns}
                  data={permissionRows}
                  loading={loading || functionsLoading}
                  emptyMessage={
                    selectedRole
                      ? "Unable to load permissions."
                      : "Select a role to view permissions"
                  }
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                  searchPlaceholder="Search"
                  currentPage={permissionPage}
                  pageSize={pageSize}
                  onPageChange={setPermissionPage}
                  leftActions={addButton}
                  rightActions={updateButton}
                  getRowId={(row) => row.functionName}
                  storageKey="lock-role-list"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockRoleList;
