import React from "react";
import Select, { components } from "react-select";
import { ChevronDown, X } from "lucide-react";
import "./form-controls.css";

const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <ChevronDown size={16} strokeWidth={1.8} color="#8d8d8d" />
  </components.DropdownIndicator>
);

const ClearIndicator = (props) => (
  <components.ClearIndicator {...props}>
    <X size={14} strokeWidth={1.8} color="#8d8d8d" />
  </components.ClearIndicator>
);

const IndicatorSeparator = () => null;

const MenuList = (props) => {
  const { selectProps, children } = props;
  const searchable = selectProps.formSelectSearchable !== false;

  return (
    <components.MenuList {...props}>
      {searchable && (
        <div
          className="form-select-field__menu-search"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <input
            type="text"
            value={selectProps.inputValue || ""}
            onChange={(event) =>
              selectProps.onInputChange?.(event.target.value, {
                action: "input-change",
              })
            }
            onKeyDown={(event) => event.stopPropagation()}
            placeholder="Type to search..."
          />
        </div>
      )}
      {children}
    </components.MenuList>
  );
};

const multiSelectStyles = {
  control: (base, state) => ({
    ...base,
    width: "100%",
    minHeight: 40,
    height: state.hasValue ? "auto" : 40,
    alignItems: state.hasValue ? "flex-start" : "center",
    flexWrap: state.hasValue ? "wrap" : "nowrap",
    overflow: state.hasValue ? "visible" : "hidden",
    borderColor: state.isFocused || state.menuIsOpen ? "var(--red, #de7008)" : "#d0d0d0",
    borderRadius: 4,
    boxShadow: "none",
    backgroundColor: "#fff",
    "&:hover": {
      borderColor:
        state.isFocused || state.menuIsOpen ? "var(--red, #de7008)" : "#bdbdbd",
    },
  }),
  valueContainer: (base, state) => ({
    ...base,
    padding: state.hasValue ? "4px 8px 4px 12px" : "0 8px 0 12px",
    gap: 4,
    height: state.hasValue ? "auto" : 38,
    minHeight: state.hasValue ? 32 : 38,
    flex: "1 1 auto",
    flexWrap: state.hasValue ? "wrap" : "nowrap",
    overflow: state.hasValue ? "visible" : "hidden",
    alignItems: "center",
    alignContent: "flex-start",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9a9a9a",
    fontSize: 14,
    lineHeight: "20px",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    opacity: 0,
    width: 0,
    minWidth: 0,
    maxWidth: 0,
    height: 0,
    overflow: "hidden",
  }),
  indicatorsContainer: (base, state) => ({
    ...base,
    paddingRight: 6,
    alignSelf: state.hasValue ? "flex-start" : "center",
    height: 38,
  }),
  multiValue: (base) => ({
    ...base,
    margin: 0,
    maxWidth: "100%",
    borderRadius: 3,
    backgroundColor: "color-mix(in srgb, var(--red, #de7008) 14%, white)",
  }),
  multiValueLabel: (base) => ({
    ...base,
    padding: "2px 4px 2px 6px",
    color: "#333",
    fontSize: 12,
    lineHeight: "16px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: "0 6px",
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: "0 4px",
    cursor: "pointer",
    "&:hover": {
      color: "var(--red, #de7008)",
    },
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "var(--red, #de7008)",
    cursor: "pointer",
    borderRadius: "0 3px 3px 0",
    ":hover": {
      backgroundColor: "var(--red, #de7008)",
      color: "#fff",
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    marginTop: 4,
    border: "1px solid #d9d9d9",
    borderRadius: 4,
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    padding: "4px 0 6px",
    maxHeight: 240,
  }),
  option: (base, state) => ({
    ...base,
    display: "flex",
    alignItems: "center",
    minWidth: 0,
    fontSize: 14,
    lineHeight: "20px",
    padding: "8px 12px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    cursor: state.isDisabled ? "not-allowed" : "pointer",
    backgroundColor:
      state.isSelected || state.isFocused ? "#fff4ec" : "#fff",
    color: state.isDisabled
      ? "#aaa"
      : state.isSelected
        ? "var(--red, #de7008)"
        : "#333",
  }),
};

export default function FormMultiSelect({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Select",
  required = false,
  disabled = false,
  isSearchable = true,
  isCheckbox = false,
  maxSelected,
  className = "",
}) {
  const selectedOptions = Array.isArray(value) ? value : [];
  const selectedValues = selectedOptions.map((option) => option.value);
  const atMax = maxSelected != null && selectedValues.length >= maxSelected;

  const checkboxFormatOptionLabel = (option) => (
    <span
      title={option.label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <input
        type="checkbox"
        readOnly
        checked={selectedValues.includes(option.value)}
        style={{ accentColor: "var(--red, #de7008)", flexShrink: 0 }}
      />
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {option.label}
      </span>
    </span>
  );

  const textFormatOptionLabel = (option) => (
    <span title={option.label}>{option.label}</span>
  );

  return (
    <div className={`form-select-field form-select-field--multi ${disabled ? "form-select-field--disabled" : ""} ${className}`}>
      {label && (
        <span className="form-select-field__label" title={label}>
          {label}
          {required && <span className="form-select-field__required"> *</span>}
        </span>
      )}
      <Select
        isMulti
        options={options}
        value={selectedOptions}
        onChange={(selected) => onChange?.(selected || [])}
        placeholder={placeholder}
        isDisabled={disabled}
        isSearchable={isSearchable}
        closeMenuOnSelect={!isCheckbox}
        hideSelectedOptions={!isCheckbox}
        formatOptionLabel={
          isCheckbox ? checkboxFormatOptionLabel : textFormatOptionLabel
        }
        isOptionDisabled={(option) => atMax && !selectedValues.includes(option.value)}
        classNamePrefix="select"
        menuPortalTarget={typeof document === "undefined" ? undefined : document.body}
        menuPosition="fixed"
        styles={multiSelectStyles}
        components={{ DropdownIndicator, ClearIndicator, IndicatorSeparator, MenuList }}
        formSelectSearchable={isSearchable}
        noOptionsMessage={() => "No options"}
      />
    </div>
  );
}
