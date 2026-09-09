/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
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

const bannerMediaFormats = [
  { key: "banner_video_9_by_16", ratio: "9:16" },
  { key: "banner_video_1_by_1", ratio: "1:1" },
  { key: "banner_video_16_by_9", ratio: "16:9" },
  { key: "banner_video_3_by_2", ratio: "3:2" },
];

const BannerMedia = ({ banner }) => (
  <div
    style={{
      display: "flex",
      gap: "6px",
      maxHeight: "32px",
      overflow: "hidden",
      flexWrap: "nowrap",
    }}
  >
    {bannerMediaFormats
      .filter((item) => banner?.[item.key])
      .map((item) => {
        const media = banner[item.key];
        const isVideo = media?.document_content_type?.startsWith("video/");
        const url = media?.document_url || "-";

        return (
          <div key={item.key} style={{ flex: "0 0 auto" }}>
            {isVideo ? (
              <video
                width="56"
                height="32"
                autoPlay
                muted
                loop
                playsInline
                style={{
                  borderRadius: "4px",
                  objectFit: "cover",
                  display: "block",
                }}
              >
                <source src={url} type={media?.document_content_type} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={url}
                className="img-fluid rounded"
                alt={banner?.title || `Banner ${item.ratio}`}
                style={{
                  width: "56px",
                  height: "32px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            )}
          </div>
        );
      })}
  </div>
);

const BannerList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bannerPermissions, setBannerPermissions] = useState({});

  const getBannerPermissions = () => {
    try {
      const lockRolePermissions = localStorage.getItem("lock_role_permissions");
      if (!lockRolePermissions) return {};

      const permissions = JSON.parse(lockRolePermissions);
      return permissions.banner || {};
    } catch (permissionError) {
      console.error("Error parsing lock_role_permissions:", permissionError);
      return {};
    }
  };

  useEffect(() => {
    setBannerPermissions(getBannerPermissions());
  }, []);

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("banner_list_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  const onToggle = useCallback(
    async (bannerId, currentStatus) => {
      toast.dismiss();
      setLoading(true);
      try {
        const response = await axios.put(
          `${baseURL}banners/${bannerId}.json`,
          {
            banner: {
              active: !currentStatus,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.status === 200) {
          setBanners((previousBanners) =>
            previousBanners.map((banner) =>
              banner.id === bannerId
                ? { ...banner, active: !currentStatus }
                : banner,
            ),
          );
          connectEvents.onRecordStatusChanged({
            record_id: bannerId,
            new_status: !currentStatus ? "active" : "inactive",
          });
          toast.success("Banner status updated successfully!");
        }
      } catch (toggleError) {
        console.error("Error toggling banner status:", toggleError);
        toast.error(
          "Limit reached: only 6 active banners allowed. Please deactivate one before activating another.",
        );
      } finally {
        setLoading(false);
      }
    },
    [connectEvents],
  );

  const filteredBanners = useMemo(
    () =>
      banners
        .filter((banner) =>
          searchQuery
            ? (banner.title?.toLowerCase() || "").includes(
                searchQuery.toLowerCase(),
              )
            : true,
        )
        .sort((left, right) => (right.id || 0) - (left.id || 0)),
    [banners, searchQuery],
  );

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      total_count: filteredBanners.length,
      total_pages: Math.ceil(filteredBanners.length / pageSize),
      current_page: searchQuery ? 1 : previous.current_page,
    }));
  }, [filteredBanners.length, searchQuery]);

  useSearchTracking(searchQuery, filteredBanners.length);

  useEffect(() => {
    const fetchBanners = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}banners.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          params: {
            banner_name: true,
            title: true,
            image: true,
            banners_list: true,
            web: true,
          },
        });

        const list = response.data.banners_list || [];
        setBanners(list);
        connectEvents.onModuleLoaded({ record_count: list.length });
      } catch (fetchError) {
        setError("Failed to fetch banners. Please try again later.");
        console.error("Error fetching banners:", fetchError);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [connectEvents]);

  const handlePageChange = (pageNumber) => {
    setPagination((previous) => ({
      ...previous,
      current_page: pageNumber,
    }));
    localStorage.setItem("banner_list_currentPage", pageNumber);
    connectEvents.onModulePaginated({ page: pageNumber });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("s[name_cont]", searchQuery);
    }
    navigate(`${window.location.pathname}?${params.toString()}`, {
      replace: true,
    });
  };

  const columns = useMemo(
    () => [
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        alwaysVisible: true,
        render: (banner) => (
          <div className="enhanced-table__row-actions">
            {bannerPermissions.update === "true" && (
              <a
                href={`/banner-edit/${banner.id}`}
                className="enhanced-table__action-button"
                aria-label={`Edit ${banner.title || "banner"}`}
                title="Edit"
              >
                <EditIcon />
              </a>
            )}
          </div>
        ),
      },
      {
        key: "serial_number",
        label: "Sr No",
        sortable: false,
        render: (_banner, { absoluteIndex }) => absoluteIndex + 1,
      },
      {
        key: "title",
        label: "Title",
        filterable: true,
        render: (banner) => banner.title || "-",
      },
      {
        key: "banner_media",
        label: "Banner",
        sortable: false,
        className: "enhanced-table__media-cell",
        render: (banner) => <BannerMedia banner={banner} />,
      },
      {
        key: "active",
        label: "Status",
        filterable: true,
        getSortValue: (banner) => (banner.active ? "Active" : "Inactive"),
        render: (banner) => (
          <StatusToggle
            active={banner.active}
            label={`${banner.active ? "Deactivate" : "Activate"} ${
              banner.title || "banner"
            }`}
            onClick={() => onToggle(banner.id, banner.active)}
          />
        ),
      },
    ],
    [bannerPermissions.update, onToggle],
  );

  const addButton =
    bannerPermissions.create === "true" ? (
      <button
        type="button"
        className="purple-btn2 enhanced-table__add"
        onClick={() => navigate("/banner-add")}
      >
        <Plus size={16} />
        <span>Add</span>
      </button>
    ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">BANNER LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredBanners}
              loading={loading}
              emptyMessage={
                error || "No banners found matching your search criteria"
              }
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search banners"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(banner) => banner.id}
              storageKey="banner-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerList;
