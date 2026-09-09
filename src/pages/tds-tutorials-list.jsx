import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import EnhancedTable from "../components/EnhancedTable";
import { useConnectEvents } from "../hooks/useConnectEvents";
import { useSearchTracking } from "../hooks/useSearchTracking";
import { baseURL } from "./baseurl/apiDomain";

const pageSize = 10;

const renderAttachment = (tutorial) => {
  const attachment = tutorial.attachment;
  if (!attachment) return "No attachment";
  if (!attachment.document_url) return "Attachment available";

  if (attachment.document_content_type?.startsWith("video/")) {
    return (
      <video
        width="100"
        height="65"
        autoPlay
        muted
        loop
        playsInline
        style={{ display: "block", borderRadius: "8px", objectFit: "cover" }}
      >
        <source
          src={attachment.document_url}
          type={attachment.document_content_type}
        />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (attachment.document_content_type?.startsWith("image/")) {
    return (
      <img
        src={attachment.document_url}
        alt="Tutorial Attachment"
        className="img-fluid rounded"
        style={{ maxWidth: "100px", maxHeight: "100px", display: "block" }}
      />
    );
  }

  return (
    <a
      href={attachment.document_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "inline-block" }}
    >
      View attachment
    </a>
  );
};

const TdsTutorialList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("tds_tutorial_list_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    const fetchTutorials = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${baseURL}tds_tutorials.json`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("TDS tutorials not found.");
          } else if (response.status !== 401) {
            setError(`HTTP error! status: ${response.status}`);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const tutorialList = data.tds_tutorials || data || [];
        setTutorials(tutorialList);
        connectEvents.onModuleLoaded({ record_count: tutorialList.length });
        setPagination((previous) => ({
          ...previous,
          total_count: tutorialList.length,
          total_pages: Math.ceil(tutorialList.length / pageSize),
          current_page: getPageFromStorage(),
        }));
      } catch (fetchError) {
        console.error("Error fetching TDS tutorial data:", fetchError);
        setTutorials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
    // The list is intentionally loaded once from the existing endpoint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTutorials = useMemo(
    () =>
      tutorials.filter(
        (tutorial) =>
          (tutorial.name || tutorial.title || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (tutorial.description || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      ),
    [searchQuery, tutorials],
  );

  useSearchTracking(searchQuery, filteredTutorials.length);

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      total_count: filteredTutorials.length,
      total_pages: Math.ceil(filteredTutorials.length / pageSize),
    }));
  }, [filteredTutorials.length]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPagination((previous) => ({ ...previous, current_page: 1 }));
  };

  const handlePageChange = (pageNumber) => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredTutorials.length / pageSize),
    );
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      connectEvents.onModulePaginated({ page: pageNumber });
      setPagination((previous) => ({
        ...previous,
        current_page: pageNumber,
      }));
      localStorage.setItem("tds_tutorial_list_currentPage", pageNumber);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this tutorial?")) {
      return;
    }

    try {
      await axios.delete(`${baseURL}tds_tutorials/${id}.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setTutorials((previous) =>
        previous.filter((tutorial) => tutorial.id !== id),
      );
      connectEvents.onRecordDeleted({ record_id: id });
      toast.success("Tutorial deleted successfully!");
    } catch (deleteError) {
      console.error("Error deleting tutorial:", deleteError);
      toast.error("Failed to delete tutorial.");
    }
  };

  const columns = [
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      alwaysVisible: true,
      render: (tutorial) => (
        <div className="enhanced-table__row-actions">
          <button
            type="button"
            className="enhanced-table__action-button"
            onClick={() => handleDelete(tutorial.id)}
            aria-label={`Delete ${
              tutorial.name || tutorial.title || "tutorial"
            }`}
            title="Delete Tutorial"
          >
            <Trash2 size={17} />
          </button>
        </div>
      ),
    },
    {
      key: "serial_number",
      label: "Sr No",
      sortable: false,
      render: (_tutorial, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "name",
      label: "Name",
      getSortValue: (tutorial) => tutorial.name || tutorial.title || "",
      render: (tutorial) => tutorial.name || tutorial.title || "-",
    },
    {
      key: "attachment",
      label: "Attachment",
      sortable: false,
      className: "text-center",
      render: renderAttachment,
    },
  ];

  const addButton =
    tutorials.length < 1 ? (
      <button
        type="button"
        className="purple-btn2 enhanced-table__add"
        onClick={() => navigate("/setup-member/tds-tutorials-create")}
      >
        <Plus size={16} />
        <span>Add</span>
      </button>
    ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">TDS TUTORIAL LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredTutorials}
              loading={loading}
              emptyMessage={error || "No TDS tutorials found."}
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search tutorials"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(tutorial) => tutorial.id}
              storageKey="tds-tutorial-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TdsTutorialList;
