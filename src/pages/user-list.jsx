/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import EnhancedTable from "../components/EnhancedTable";
import { useConnectEvents } from "../hooks/useConnectEvents";
import { useSearchTracking } from "../hooks/useSearchTracking";
import { baseURL } from "./baseurl/apiDomain";
import "../mor.css";

const pageSize = 10;

const EditIcon = () => (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor">
    <path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1 1-2-2 1-1a.5.5 0 0 1 .707 0l1.293 1.293ZM13.793 4.354l-2-2L4.939 9.207a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.854-6.854Z" />
    <path
      fillRule="evenodd"
      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11Z"
    />
  </svg>
);

const ViewIcon = () => (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor">
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8c-.058.087-.123.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8Z" />
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
  </svg>
);

const StatusToggle = ({ active, label, onClick }) => (
  <button
    type="button"
    className={`enhanced-table__toggle ${active ? "is-active" : ""}`}
    onClick={onClick}
    aria-label={label}
    aria-pressed={active}
    title={label}
  >
    <span />
  </button>
);

const UserList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("user_list_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    try {
      const lockRolePermissions = localStorage.getItem("lock_role_permissions");
      const permissions = lockRolePermissions
        ? JSON.parse(lockRolePermissions).user || {}
        : {};
      console.log("User permissions:", permissions);
    } catch (error) {
      console.error("Error parsing lock_role_permissions:", error);
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseURL}users/get_users.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        if (Array.isArray(data.users)) {
          setUsers(data.users);
          connectEvents.onModuleLoaded({ record_count: data.users.length });
          setPagination({
            current_page: getPageFromStorage(),
            total_count: data.users.length,
            total_pages: Math.ceil(data.users.length / pageSize),
          });
        } else {
          console.error("API response does not contain users array", data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // The list is intentionally loaded once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPagination((previous) => ({ ...previous, current_page: 1 }));
  };

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.firstname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery, users],
  );

  useSearchTracking(searchQuery, filteredUsers.length);

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      total_count: filteredUsers.length,
      total_pages: Math.ceil(filteredUsers.length / pageSize),
      current_page: searchQuery ? 1 : previous.current_page,
    }));
  }, [filteredUsers.length, searchQuery]);

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({
      ...previous,
      current_page: pageNumber,
    }));
    localStorage.setItem("user_list_currentPage", pageNumber);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("s[name_or_email_cont]", searchQuery);
    navigate(`${window.location.pathname}?${params.toString()}`, {
      replace: true,
    });
  };

  const handleToggleUser = async (userId, currentStatus) => {
    toast.dismiss();
    try {
      const response = await fetch(`${baseURL}users/${userId}.json`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: { active: !currentStatus } }),
      });

      toast.success("Updated Status");

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      setUsers((previous) =>
        previous.map((user) =>
          user.id === userId ? { ...user, active: !currentStatus } : user,
        ),
      );
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const columns = [
    {
      key: "actions",
      label: "Action",
      sortable: false,
      alwaysVisible: true,
      render: (user) => (
        <div className="enhanced-table__row-actions">
          <button
            type="button"
            className="enhanced-table__action-button"
            onClick={() => navigate(`/setup-member/user-edit/${user.id}`)}
            aria-label={`Edit ${user.firstname || "user"}`}
            title="Edit"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            className="enhanced-table__action-button is-primary"
            onClick={() => navigate(`/setup-member/user-details/${user.id}`)}
            aria-label={`View ${user.firstname || "user"}`}
            title="View"
          >
            <ViewIcon />
          </button>
        </div>
      ),
    },
    {
      key: "serial_number",
      label: "Sr No",
      sortable: false,
      render: (_user, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "firstname",
      label: "First Name",
      render: (user) => user.firstname || "-",
    },
    {
      key: "lastname",
      label: "Last Name",
      render: (user) => user.lastname || "-",
    },
    { key: "email", label: "Email", render: (user) => user.email || "-" },
    {
      key: "mobile",
      label: "Mobile",
      render: (user) =>
        `${user.country_code ? `+${user.country_code} ` : ""}${
          user.mobile || "-"
        }`,
    },
    {
      key: "lock_role_name",
      label: "Role",
      filterable: true,
      render: (user) => user.lock_role_name || "-",
    },
    {
      key: "created_at",
      label: "Created On",
      render: (user) =>
        user.created_at
          ? new Date(user.created_at).toLocaleDateString("en-GB")
          : "-",
    },
    {
      key: "active",
      label: "Status",
      getSortValue: (user) => Number(Boolean(user.active)),
      render: (user) => (
        <StatusToggle
          active={user.active}
          label={`${user.active ? "Deactivate" : "Activate"} ${
            user.firstname || "user"
          }`}
          onClick={() => handleToggleUser(user.id, user.active)}
        />
      ),
    },
  ];

  const addButton = (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/setup-member/user-create")}
    >
      <Plus size={16} />
      <span>Add</span>
    </button>
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">USERS LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredUsers}
              loading={loading}
              emptyMessage="No users found."
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(user) => user.id}
              storageKey="user-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
