/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import EnhancedTable from "../components/EnhancedTable";
import { useConnectEvents } from "../hooks/useConnectEvents";
import { useSearchTracking } from "../hooks/useSearchTracking";
import { baseURL } from "./baseurl/apiDomain";

const pageSize = 10;

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

const TruncatedCell = ({ value }) => (
  <div className="enhanced-table__truncate-cell" title={value || "-"}>
    {value || "-"}
  </div>
);

const renderAttachment = (service) => {
  if (!service.attachment || Object.keys(service.attachment).length === 0) {
    return "No attachment";
  }

  const attachmentUrl =
    service.attachment.document_url || service.attachment.url || "";
  const contentType =
    service.attachment.document_content_type ||
    service.attachment.content_type ||
    "";

  if (attachmentUrl && contentType.startsWith("image/")) {
    return (
      <img
        src={attachmentUrl}
        alt="Service Attachment"
        className="img-fluid rounded"
        style={{
          width: "48px",
          height: "32px",
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }

  if (attachmentUrl && contentType.startsWith("video/")) {
    return (
      <video
        width="48"
        height="32"
        autoPlay
        muted
        loop
        playsInline
        style={{ display: "block", borderRadius: "4px", objectFit: "cover" }}
      >
        <source src={attachmentUrl} type={contentType} />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (attachmentUrl) {
    return (
      <a
        href={attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="enhanced-table__truncate-cell"
        title="Download Attachment"
      >
        Download Attachment
      </a>
    );
  }

  return "Attachment available";
};

const PlusServicesList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [plusServices, setPlusServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("plus_services_list_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    const fetchPlusServices = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${baseURL}plus_services.json`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("Plus services not found.");
          } else if (response.status !== 401) {
            setError(`HTTP error! status: ${response.status}`);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const servicesList = data.plus_services || data || [];
        setPlusServices(servicesList);
        connectEvents.onModuleLoaded({ record_count: servicesList.length });
        setPagination((previous) => ({
          ...previous,
          total_count: servicesList.length,
          total_pages: Math.ceil(servicesList.length / pageSize),
          current_page: getPageFromStorage(),
        }));
      } catch (fetchError) {
        console.error("Error fetching plus services data:", fetchError);
        setPlusServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlusServices();
    // The list is intentionally loaded once from the existing endpoint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredServices = useMemo(
    () =>
      plusServices.filter(
        (service) =>
          (service.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (service.description || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      ),
    [plusServices, searchQuery],
  );

  useSearchTracking(searchQuery, filteredServices.length);

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      total_count: filteredServices.length,
      total_pages: Math.ceil(filteredServices.length / pageSize),
    }));
  }, [filteredServices.length]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPagination((previous) => ({ ...previous, current_page: 1 }));
  };

  const handlePageChange = (pageNumber) => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredServices.length / pageSize),
    );
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      connectEvents.onModulePaginated({ page: pageNumber });
      setPagination((previous) => ({
        ...previous,
        current_page: pageNumber,
      }));
      localStorage.setItem("plus_services_list_currentPage", pageNumber);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    toast.dismiss();
    const updatedStatus = !currentStatus;

    try {
      await axios.put(
        `${baseURL}plus_services/${id}.json`,
        { plus_service: { active: updatedStatus } },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      setPlusServices((previous) =>
        previous.map((service) =>
          service.id === id ? { ...service, active: updatedStatus } : service,
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
  };

  const columns = [
    {
      key: "actions",
      label: "Actions",
      width: 90,
      sortable: false,
      alwaysVisible: true,
      render: (service) => (
        <div className="enhanced-table__row-actions">
          <a
            href={`/setup-member/plus-services-edit/${service.id}`}
            className="enhanced-table__action-button"
            aria-label={`Edit ${service.name || "plus service"}`}
            title="Edit Plus Service"
          >
            <Pencil size={17} />
          </a>
          <StatusToggle
            active={service.active}
            label={`${service.active ? "Deactivate" : "Activate"} ${
              service.name || "plus service"
            }`}
            onClick={() => handleToggle(service.id, service.active)}
          />
        </div>
      ),
    },
    {
      key: "serial_number",
      label: "Sr No",
      width: 55,
      sortable: false,
      render: (_service, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "name",
      label: "Name",
      width: 140,
      render: (service) => <TruncatedCell value={service.name} />,
    },
    {
      key: "mobile",
      label: "Mobile",
      width: 90,
      render: (service) => <TruncatedCell value={service.mobile} />,
    },
    {
      key: "address",
      label: "Address",
      width: 120,
      render: (service) => <TruncatedCell value={service.address} />,
    },
    {
      key: "service_category_name",
      label: "Service Category",
      width: 140,
      filterable: true,
      render: (service) => (
        <TruncatedCell value={service.service_category_name} />
      ),
    },
    {
      key: "description",
      label: "Description",
      width: 190,
      render: (service) => <TruncatedCell value={service.description} />,
    },
    {
      key: "attachment",
      label: "Attachment",
      width: 75,
      sortable: false,
      className: "text-center enhanced-table__media-cell",
      render: renderAttachment,
    },
  ];

  const addButton = (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/setup-member/plus-services-create")}
    >
      <Plus size={16} />
      <span>Add</span>
    </button>
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">PLUS SERVICES LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredServices}
              loading={loading}
              emptyMessage={error || "No plus services found."}
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search plus services"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(service) => service.id}
              storageKey="plus-service-list-compact"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlusServicesList;
