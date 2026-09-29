/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import EnhancedTable from "../components/EnhancedTable";
import { useConnectEvents } from "../hooks/useConnectEvents";
import { useSearchTracking } from "../hooks/useSearchTracking";
import { baseURL } from "./baseurl/apiDomain";
import "../mor.css";

const pageSize = 10;

const EditIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1 1-2-2 1-1a.5.5 0 0 1 .707 0l1.293 1.293ZM13.793 4.354l-2-2L4.939 9.207a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.854-6.854Z" />
    <path
      fillRule="evenodd"
      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11Z"
    />
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

const ReferralAttachment = ({ referral }) => {
  const attachments = referral.attachments || [];
  const previewFile = attachments.find(
    (file) =>
      file.document_content_type?.startsWith("image/") ||
      file.document_content_type?.startsWith("video/"),
  );

  if (!previewFile) {
    return attachments.length > 0 ? "Attachment available" : "No attachments";
  }

  const url = previewFile.document_url;
  const isVideo = previewFile.document_content_type?.startsWith("video/");

  if (isVideo) {
    return (
      <video
        width="56"
        height="32"
        autoPlay
        muted
        loop
        playsInline
        style={{
          display: "block",
          borderRadius: "4px",
          objectFit: "cover",
        }}
      >
        <source src={url} type={previewFile.document_content_type} />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <img
      src={url}
      alt={referral.title || "Referral attachment"}
      className="img-fluid rounded"
      style={{
        width: "56px",
        height: "32px",
        objectFit: "cover",
        display: "block",
      }}
    />
  );
};

const ReferralProgramList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("referral_list_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    const fetchReferrals = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${baseURL}/referral_configs.json`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError("Unauthorized: Please check your API key or token.");
          } else if (response.status === 404) {
            setError("Referral configs not found.");
          } else {
            setError(`HTTP error! status: ${response.status}`);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const referralList =
          data.referrals || data.referral_configs || data || [];

        setReferrals(referralList);
        connectEvents.onModuleLoaded({ record_count: referralList.length });
        setPagination((previous) => ({
          ...previous,
          total_count: referralList.length,
          total_pages: Math.ceil(referralList.length / pageSize),
          current_page: getPageFromStorage(),
        }));
      } catch (fetchError) {
        console.error("Error fetching referral data:", fetchError);
        setError("Failed to fetch referral data. Please try again.");
        setReferrals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
    // The list is intentionally loaded once from the existing API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({
      ...previous,
      current_page: pageNumber,
    }));
    localStorage.setItem("referral_list_currentPage", pageNumber);
  };

  const handleToggle = useCallback(
    async (id, currentStatus) => {
      toast.dismiss();
      const updatedStatus = !currentStatus;

      try {
        if (updatedStatus) {
          const deactivatePromises = referrals
            .filter((item) => item.active && item.id !== id)
            .map((item) =>
              axios.put(
                `${baseURL}referral_configs/${item.id}.json`,
                { referral_config: { active: false } },
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                  },
                },
              ),
            );
          await Promise.all(deactivatePromises);
        }

        await axios.put(
          `${baseURL}referral_configs/${id}.json`,
          { referral_config: { active: updatedStatus } },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        );

        setReferrals((previous) =>
          previous.map((item) =>
            item.id === id
              ? { ...item, active: updatedStatus }
              : updatedStatus
                ? { ...item, active: false }
                : item,
          ),
        );

        connectEvents.onRecordStatusChanged({
          record_id: id,
          new_status: updatedStatus ? "active" : "inactive",
        });
        toast.success("Status updated successfully!");
      } catch (toggleError) {
        console.error("Error updating status:", toggleError);
        toast.error("Failed to update status.");
      }
    },
    [connectEvents, referrals],
  );

  const filteredReferrals = useMemo(
    () =>
      referrals.filter(
        (referral) =>
          !searchQuery ||
          (referral.title || referral.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (referral.description || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      ),
    [referrals, searchQuery],
  );

  useSearchTracking(searchQuery, filteredReferrals.length);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredReferrals.length / pageSize));
    setPagination((previous) => ({
      ...previous,
      total_count: filteredReferrals.length,
      total_pages: totalPages,
      current_page:
        previous.current_page > totalPages ? 1 : previous.current_page,
    }));

    if (pagination.current_page > totalPages) {
      localStorage.setItem("referral_list_currentPage", 1);
    }
  }, [filteredReferrals.length, pagination.current_page]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPagination((previous) => ({ ...previous, current_page: 1 }));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
  };

  const columns = useMemo(
    () => [
      {
        key: "actions",
        label: "Action",
        width: "10%",
        sortable: false,
        alwaysVisible: true,
        render: (referral) => (
          <div className="enhanced-table__row-actions">
            <button
              type="button"
              className="enhanced-table__action-button"
              onClick={() => navigate(`/referral-program-edit/${referral.id}`)}
              aria-label={`Edit ${referral.title || "referral"}`}
              title="Edit"
            >
              <EditIcon />
            </button>
            <StatusToggle
              active={referral.active}
              label={`${referral.active ? "Deactivate" : "Activate"} ${
                referral.title || "referral"
              }`}
              onClick={() => handleToggle(referral.id, referral.active)}
            />
          </div>
        ),
      },
      {
        key: "serial_number",
        label: "Sr No",
        width: "8%",
        sortable: false,
        render: (_referral, { absoluteIndex }) => absoluteIndex + 1,
      },
      {
        key: "title",
        label: "Title",
        width: "22%",
        filterable: true,
        render: (referral) => (
          <div
            className="enhanced-table__truncate-cell"
            title={referral.title || "-"}
          >
            {referral.title || "-"}
          </div>
        ),
      },
      {
        key: "description",
        label: "Description",
        width: "40%",
        render: (referral) => (
          <div
            className="enhanced-table__truncate-cell"
            title={referral.description || "-"}
          >
            {referral.description || "-"}
          </div>
        ),
      },
      {
        key: "attachments",
        label: "Attachments",
        width: "20%",
        sortable: false,
        className: "enhanced-table__media-cell",
        render: (referral) => <ReferralAttachment referral={referral} />,
      },
    ],
    [handleToggle, navigate],
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">REFERRAL PROGRAM LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <EnhancedTable
              columns={columns}
              data={filteredReferrals}
              loading={loading}
              emptyMessage={
                searchQuery
                  ? "No referral configs found matching your search."
                  : "No referral configs found."
              }
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search by title or description"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              getRowId={(referral) => referral.id}
              storageKey="referral-program-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralProgramList;
