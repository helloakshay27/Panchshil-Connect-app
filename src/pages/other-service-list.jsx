/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

const renderAttachment = (service) => {
  if (!service.attachment || Object.keys(service.attachment).length === 0) {
    return "No attachment";
  }

  const attachmentUrl =
    service.attachment.document_url || service.attachment.url || "";
  if (!attachmentUrl) return "No attachment";

  const fileExtension = attachmentUrl.split(".").pop().toLowerCase();
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

  if (imageExtensions.includes(fileExtension)) {
    return (
      <a href={attachmentUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={attachmentUrl}
          alt={service.name || "Attachment"}
          style={{
            width: "60px",
            height: "60px",
            objectFit: "cover",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        />
      </a>
    );
  }

  return (
    <a
      href={attachmentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-sm btn-outline-primary"
    >
      View File
    </a>
  );
};

const OtherServicesList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [otherServices, setOtherServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeToastId, setActiveToastId] = useState(null);

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("other_services_list_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    const fetchOtherServices = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(`${baseURL}other_services.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        const servicesData =
          response.data.other_services || response.data || [];
        setOtherServices(servicesData);
        connectEvents.onModuleLoaded({ record_count: servicesData.length });
        setPagination((previous) => ({
          ...previous,
          total_count: servicesData.length,
          total_pages: Math.ceil(servicesData.length / pageSize),
        }));
      } catch (fetchError) {
        console.error("Error fetching other services:", fetchError);
        setError("Failed to load other services. Please try again.");
        toast.error("Failed to load other services");
      } finally {
        setLoading(false);
      }
    };

    fetchOtherServices();
    // The list is intentionally loaded once from the existing endpoint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredServices = useMemo(
    () =>
      otherServices.filter(
        (service) =>
          (service.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (service.description || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      ),
    [otherServices, searchQuery],
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
      localStorage.setItem("other_services_list_currentPage", pageNumber);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    toast.dismiss();
    const updatedStatus = !currentStatus;

    if (activeToastId) toast.dismiss(activeToastId);

    try {
      await axios.patch(
        `${baseURL}other_services/${id}.json`,
        { other_service: { active: updatedStatus } },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        },
      );
      setOtherServices((previous) =>
        previous.map((service) =>
          service.id === id ? { ...service, active: updatedStatus } : service,
        ),
      );
      connectEvents.onRecordStatusChanged({
        record_id: id,
        new_status: updatedStatus ? "active" : "inactive",
      });
      const toastId = toast.success(
        `Other service ${
          updatedStatus ? "activated" : "deactivated"
        } successfully`,
      );
      setActiveToastId(toastId);
    } catch (toggleError) {
      console.error("Error toggling other service status:", toggleError);
      toast.error("Failed to update status");
    }
  };

  const columns = [
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      alwaysVisible: true,
      render: (service) => (
        <div className="enhanced-table__row-actions">
          <a
            href={`/setup-member/other-services-edit/${service.id}`}
            className="enhanced-table__action-button"
            aria-label={`Edit ${service.name || "other service"}`}
            title="Edit Other Service"
          >
            <Pencil size={17} />
          </a>
          <StatusToggle
            active={service.active}
            label={`${service.active ? "Deactivate" : "Activate"} ${
              service.name || "other service"
            }`}
            onClick={() => handleToggle(service.id, service.active)}
          />
        </div>
      ),
    },
    {
      key: "serial_number",
      label: "Sr No",
      sortable: false,
      render: (_service, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "plus_service_name",
      label: "Plus Service",
      filterable: true,
      render: (service) => service.plus_service_name || "-",
    },
    { key: "name", label: "Name", render: (service) => service.name || "-" },
    {
      key: "description",
      label: "Description",
      render: (service) => service.description || "-",
    },
    {
      key: "attachment",
      label: "Attachment",
      sortable: false,
      className: "text-center",
      render: renderAttachment,
    },
  ];

  const addButton = (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/setup-member/other-services-create")}
    >
      <Plus size={16} />
      <span>Add</span>
    </button>
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">OTHER SERVICES LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredServices}
              loading={loading}
              emptyMessage={error || "No other services found."}
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search other services"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(service) => service.id}
              storageKey="other-service-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherServicesList;
