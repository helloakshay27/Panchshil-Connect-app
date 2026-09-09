import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import EnhancedTable from "../components/EnhancedTable";
import { baseURL } from "./baseurl/apiDomain";

const pageSize = 10;

const VideoTutorialList = () => {
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("video_tutorial_list_currentPage")) || 1;

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
        const response = await fetch(`${baseURL}video_tutorials.json`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("Video tutorials not found.");
          } else if (response.status !== 401) {
            setError(`HTTP error! status: ${response.status}`);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const tutorialList = data.video_tutorials || data || [];
        setTutorials(tutorialList);
        setPagination((previous) => ({
          ...previous,
          total_count: tutorialList.length,
          total_pages: Math.ceil(tutorialList.length / pageSize),
          current_page: getPageFromStorage(),
        }));
      } catch (fetchError) {
        console.error("Error fetching video tutorial data:", fetchError);
        setTutorials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, []);

  const filteredTutorials = useMemo(
    () =>
      tutorials.filter((tutorial) =>
        (tutorial.title || tutorial.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [searchQuery, tutorials],
  );

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
      setPagination((previous) => ({
        ...previous,
        current_page: pageNumber,
      }));
      localStorage.setItem("video_tutorial_list_currentPage", pageNumber);
    }
  };

  const cancelDelete = () => setDeleteId(null);

  const confirmDelete = async () => {
    const id = deleteId;
    setDeleteId(null);

    try {
      await axios.delete(`${baseURL}video_tutorials/${id}.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setTutorials((previous) =>
        previous.filter((tutorial) => tutorial.id !== id),
      );
      toast.success("Video tutorial deleted successfully!");
    } catch (deleteError) {
      console.error("Error deleting video tutorial:", deleteError);
      toast.error("Failed to delete video tutorial.");
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
          <a
            href={`/setup-member/video-tutorials-edit/${tutorial.id}`}
            className="enhanced-table__action-button"
            aria-label={`Edit ${
              tutorial.title || tutorial.name || "video tutorial"
            }`}
            title="Edit Video Tutorial"
          >
            <Pencil size={17} />
          </a>
          <button
            type="button"
            className="enhanced-table__action-button"
            onClick={() => setDeleteId(tutorial.id)}
            aria-label={`Delete ${
              tutorial.title || tutorial.name || "video tutorial"
            }`}
            title="Delete Video Tutorial"
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
      key: "title",
      label: "Title",
      getSortValue: (tutorial) => tutorial.title || tutorial.name || "",
      render: (tutorial) => tutorial.title || tutorial.name || "-",
    },
    {
      key: "video",
      label: "Video",
      sortable: false,
      className: "text-center",
      render: (tutorial) => {
        const videoFile =
          tutorial.video_attachment ||
          tutorial.video_file ||
          tutorial.attachment;
        const videoUrl = videoFile?.document_url || tutorial.video_file_url;
        const contentType = videoFile?.document_content_type;

        return videoUrl ? (
          <video
            width="100"
            height="65"
            controls
            style={{
              display: "block",
              borderRadius: "8px",
              objectFit: "cover",
            }}
          >
            <source src={videoUrl} type={contentType} />
            Your browser does not support the video tag.
          </video>
        ) : (
          "No video"
        );
      },
    },
  ];

  const addButton = (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/setup-member/video-tutorials-create")}
    >
      <Plus size={16} />
      <span>Add</span>
    </button>
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">VIDEO TUTORIAL LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredTutorials}
              loading={loading}
              emptyMessage={error || "No video tutorials found."}
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search video tutorials"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(tutorial) => tutorial.id}
              storageKey="video-tutorial-list"
            />
          </div>
        </div>
      </div>

      {deleteId && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={cancelDelete}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Video Tutorial</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cancelDelete}
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p className="mb-0">
                  Are you sure you want to delete this video tutorial?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="purple-btn2 rounded-3"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="purple-btn2 rounded-3"
                  onClick={confirmDelete}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTutorialList;
