/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import "./EnhancedTable.css";
import SelectBox from "./base/SelectBox";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  GripVertical,
  Grid3X3,
  Search,
  X,
} from "lucide-react";

const getCellValue = (row, column) => {
  if (column.getSortValue) return column.getSortValue(row);
  return row[column.key];
};

const compareValues = (left, right) => {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
};

const getPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([
    1,
    totalPages,
    currentPage,
    currentPage - 1,
    currentPage + 1,
  ]);
  const validPages = [...pages]
    .filter((page) => page > 0 && page <= totalPages)
    .sort((a, b) => a - b);

  return validPages.reduce((result, page, index) => {
    if (index > 0 && page - validPages[index - 1] > 1) result.push("ellipsis");
    result.push(page);
    return result;
  }, []);
};

export default function EnhancedTable({
  columns,
  data = [],
  loading = false,
  loadingMessage = "Loading...",
  emptyMessage = "No data available",
  searchTerm = "",
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = "Search",
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  leftActions,
  rightActions,
  getRowId = (row) => row.id,
  storageKey,
}) {
  const [sort, setSort] = useState({ key: null, direction: "asc" });
  const [hiddenColumns, setHiddenColumns] = useState(() => new Set());
  const [showColumns, setShowColumns] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [columnFilters, setColumnFilters] = useState({});
  const [columnOrder, setColumnOrder] = useState(() => {
    if (storageKey) {
      try {
        const savedOrder = JSON.parse(
          localStorage.getItem(`${storageKey}-column-order`),
        );
        if (Array.isArray(savedOrder)) return savedOrder;
      } catch {
        // Ignore invalid saved preferences and use the supplied order.
      }
    }
    return columns.map((column) => column.key);
  });
  const [columnWidths, setColumnWidths] = useState(() => {
    if (storageKey) {
      try {
        return (
          JSON.parse(localStorage.getItem(`${storageKey}-column-widths`)) || {}
        );
      } catch {
        // Ignore invalid saved preferences.
      }
    }
    return {};
  });
  const [draggingColumn, setDraggingColumn] = useState(null);
  const columnsMenuRef = useRef(null);
  const filtersMenuRef = useRef(null);

  useEffect(() => {
    setColumnOrder((current) => {
      const availableKeys = columns.map((column) => column.key);
      const retainedKeys = current.filter((key) => availableKeys.includes(key));
      const newKeys = availableKeys.filter(
        (key) => !retainedKeys.includes(key),
      );
      return [...retainedKeys, ...newKeys];
    });
  }, [columns]);

  useEffect(() => {
    const closeMenu = (event) => {
      if (
        columnsMenuRef.current &&
        !columnsMenuRef.current.contains(event.target)
      ) {
        setShowColumns(false);
      }
      if (
        filtersMenuRef.current &&
        !filtersMenuRef.current.contains(event.target)
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  const orderedColumns = useMemo(
    () =>
      columnOrder
        .map((key) => columns.find((column) => column.key === key))
        .filter(Boolean),
    [columnOrder, columns],
  );

  const visibleColumns = useMemo(
    () =>
      orderedColumns.filter(
        (column) => column.alwaysVisible || !hiddenColumns.has(column.key),
      ),
    [orderedColumns, hiddenColumns],
  );

  const filterableColumns = useMemo(
    () => columns.filter((column) => column.filterable),
    [columns],
  );

  const filteredData = useMemo(
    () =>
      data.filter((row) =>
        Object.entries(columnFilters).every(([key, selectedValue]) => {
          if (!selectedValue) return true;
          const column = columns.find((item) => item.key === key);
          if (!column) return true;
          return String(getCellValue(row, column) ?? "") === selectedValue;
        }),
      ),
    [columnFilters, columns, data],
  );

  const sortedData = useMemo(() => {
    if (!sort.key) return filteredData;
    const column = columns.find((item) => item.key === sort.key);
    if (!column) return filteredData;

    return [...filteredData].sort((left, right) => {
      const result = compareValues(
        getCellValue(left, column),
        getCellValue(right, column),
      );
      return sort.direction === "asc" ? result : -result;
    });
  }, [columns, filteredData, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const firstIndex = (safeCurrentPage - 1) * pageSize;
  const pageRows = sortedData.slice(firstIndex, firstIndex + pageSize);
  const pageNumbers = getPageNumbers(safeCurrentPage, totalPages);

  const changeSort = (column) => {
    if (column.sortable === false) return;
    setSort((current) => ({
      key: column.key,
      direction:
        current.key === column.key && current.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const toggleColumn = (columnKey) => {
    setHiddenColumns((current) => {
      const next = new Set(current);
      if (next.has(columnKey)) next.delete(columnKey);
      else next.add(columnKey);
      return next;
    });
  };

  const resetColumns = () => setHiddenColumns(new Set());

  const moveColumn = (sourceKey, targetKey) => {
    if (!sourceKey || sourceKey === targetKey) return;
    setColumnOrder((current) => {
      const next = [...current];
      const sourceIndex = next.indexOf(sourceKey);
      const targetIndex = next.indexOf(targetKey);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, sourceKey);
      if (storageKey) {
        localStorage.setItem(
          `${storageKey}-column-order`,
          JSON.stringify(next),
        );
      }
      return next;
    });
  };

  const startResize = (event, column) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const header = event.currentTarget.closest("th");
    const startWidth =
      columnWidths[column.key] || header?.getBoundingClientRect().width || 128;

    const resize = (moveEvent) => {
      const width = Math.max(80, startWidth + moveEvent.clientX - startX);
      setColumnWidths((current) => ({ ...current, [column.key]: width }));
    };

    const finishResize = (upEvent) => {
      const width = Math.max(80, startWidth + upEvent.clientX - startX);
      setColumnWidths((current) => {
        const next = { ...current, [column.key]: width };
        if (storageKey) {
          localStorage.setItem(
            `${storageKey}-column-widths`,
            JSON.stringify(next),
          );
        }
        return next;
      });
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", finishResize);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", finishResize);
  };

  return (
    <div className="enhanced-table">
      <div className="enhanced-table__toolbar">
        {leftActions && (
          <div className="enhanced-table__toolbar-left">{leftActions}</div>
        )}
        <form
          className="enhanced-table__search"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit?.(event);
          }}
        >
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
          {searchTerm && (
            <button
              type="button"
              className="enhanced-table__clear"
              onClick={() => onSearchChange?.({ target: { value: "" } })}
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </form>

        <div className="enhanced-table__toolbar-actions">
          {filterableColumns.length > 0 && (
            <div className="enhanced-table__filters" ref={filtersMenuRef}>
              <button
                type="button"
                className={`enhanced-table__icon-button ${
                  Object.values(columnFilters).some(Boolean) ? "is-active" : ""
                }`}
                onClick={() => {
                  setShowFilters((visible) => !visible);
                  setShowColumns(false);
                }}
                aria-expanded={showFilters}
                aria-haspopup="menu"
                aria-label="Filter table"
                title="Filter"
              >
                <Filter size={16} />
              </button>
              {showFilters && (
                <div className="enhanced-table__filters-menu" role="menu">
                  <div className="enhanced-table__columns-menu-header">
                    <span>Filter rows</span>
                    <button type="button" onClick={() => setColumnFilters({})}>
                      Clear
                    </button>
                  </div>
                  {filterableColumns.map((column) => {
                    const options = [
                      ...new Set(
                        data
                          .map((row) => getCellValue(row, column))
                          .filter(
                            (value) =>
                              value !== null &&
                              value !== undefined &&
                              value !== "",
                          )
                          .map(String),
                      ),
                    ].sort((left, right) => left.localeCompare(right));
                    return (
                      <label
                        className="enhanced-table__filter-field"
                        key={column.key}
                      >
                        <span>{column.label}</span>
                        <SelectBox
                          options={[
                            { value: "", label: "All" },
                            ...options.map((option) => ({
                              value: option,
                              label: option,
                            })),
                          ]}
                          value={columnFilters[column.key] || ""}
                          onChange={(value) => {
                            setColumnFilters((current) => ({
                              ...current,
                              [column.key]: value,
                            }));
                            onPageChange?.(1);
                          }}
                          placeholder="All"
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <div className="enhanced-table__columns" ref={columnsMenuRef}>
            <button
              type="button"
              className="enhanced-table__icon-button"
              onClick={() => {
                setShowColumns((visible) => !visible);
                setShowFilters(false);
              }}
              aria-expanded={showColumns}
              aria-haspopup="menu"
              aria-label="Choose visible columns"
              title="Columns"
            >
              <Grid3X3 size={16} />
            </button>
            {showColumns && (
              <div className="enhanced-table__columns-menu" role="menu">
                <div className="enhanced-table__columns-menu-header">
                  <span>Visible columns</span>
                  <button type="button" onClick={resetColumns}>
                    Show all
                  </button>
                </div>
                {columns.map((column) => {
                  const checked =
                    column.alwaysVisible || !hiddenColumns.has(column.key);
                  return (
                    <label
                      key={column.key}
                      className={
                        column.alwaysVisible
                          ? "enhanced-table__column-option is-locked"
                          : "enhanced-table__column-option"
                      }
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={column.alwaysVisible}
                        onChange={() => toggleColumn(column.key)}
                      />
                      <span className="enhanced-table__checkbox">
                        {checked && <Check size={12} />}
                      </span>
                      {column.label}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          {rightActions}
        </div>
      </div>

      <div className="tbl-container enhanced-table__container">
        <table>
          <thead>
            <tr>
              {visibleColumns.map((column) => {
                const resolvedWidth =
                  columnWidths[column.key] || column.width;
                const isPercentWidth =
                  typeof resolvedWidth === "string" &&
                  resolvedWidth.trim().endsWith("%");

                return (
                  <th
                    key={column.key}
                    className={`${column.headerClassName || ""} ${
                      draggingColumn === column.key ? "is-dragging" : ""
                    }`}
                    style={{
                      width: resolvedWidth,
                      minWidth: isPercentWidth ? undefined : resolvedWidth,
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      moveColumn(
                        event.dataTransfer.getData("text/plain"),
                        column.key,
                      );
                      setDraggingColumn(null);
                    }}
                  >
                    <div className="enhanced-table__header-content">
                      <button
                        type="button"
                        className="enhanced-table__sort"
                        onClick={() => changeSort(column)}
                        disabled={column.sortable === false}
                      >
                        <span>{column.label}</span>
                      </button>
                      <button
                        type="button"
                        className="enhanced-table__drag-handle"
                        draggable
                        onDragStart={(event) => {
                          event.stopPropagation();
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", column.key);
                          setDraggingColumn(column.key);
                        }}
                        onDragEnd={() => setDraggingColumn(null)}
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Drag ${column.label} column`}
                        title="Drag to reorder column"
                      >
                        <GripVertical size={14} />
                      </button>
                    </div>
                    <span
                      className="enhanced-table__resize-handle"
                      onMouseDown={(event) => startResize(event, column)}
                      aria-hidden="true"
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {!loading &&
              pageRows.map((row, index) => (
                <tr key={getRowId(row)}>
                  {visibleColumns.map((column) => (
                    <td key={column.key} className={column.className || ""}>
                      {column.render
                        ? column.render(row, {
                            index,
                            absoluteIndex: firstIndex + index,
                          })
                        : row[column.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>

        {loading && (
          <div className="enhanced-table__state">
            <div
              className="spinner-border spinner-border-sm"
              role="status"
              aria-label="Loading"
            />
          <span>{loadingMessage}</span>
          </div>
        )}

        {!loading && pageRows.length === 0 && (
          <div className="enhanced-table__state">{emptyMessage}</div>
        )}
      </div>

      {!loading && sortedData.length > 0 && (
        <div className="enhanced-table__footer">
          <span>
            Showing {firstIndex + 1} to{" "}
            {Math.min(firstIndex + pageSize, sortedData.length)} of{" "}
            {sortedData.length}
          </span>
          <nav aria-label="Table pagination">
            <button
              type="button"
              onClick={() => onPageChange?.(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
            </button>
            {pageNumbers.map((page, index) =>
              page === "ellipsis" ? (
                <span
                  className="enhanced-table__ellipsis"
                  key={`ellipsis-${index}`}
                >
                  …
                </span>
              ) : (
                <button
                  type="button"
                  key={page}
                  className={page === safeCurrentPage ? "is-active" : ""}
                  onClick={() => onPageChange?.(page)}
                  aria-current={page === safeCurrentPage ? "page" : undefined}
                >
                  {page}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => onPageChange?.(safeCurrentPage + 1)}
              disabled={safeCurrentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={15} />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
