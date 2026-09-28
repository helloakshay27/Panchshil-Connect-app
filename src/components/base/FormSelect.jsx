import React from "react";
import Select, { components } from "react-select";
import { ChevronDown } from "lucide-react";
import "./form-controls.css";

const DropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <ChevronDown size={16} strokeWidth={1.8} color="#8d8d8d" />
  </components.DropdownIndicator>
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

const selectStyles = {
  control: (base, state) => ({
    ...base,
    width: "100%",
    minHeight: 48,
    height: 48,
    borderColor: state.isFocused || state.menuIsOpen ? "var(--red, #de7008)" : "#d0d0d0",
    borderRadius: 4,
    boxShadow: "none",
    backgroundColor: "#fff",
    "&:hover": {
      borderColor:
        state.isFocused || state.menuIsOpen ? "var(--red, #de7008)" : "#bdbdbd",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 8px 0 14px",
    height: 46,
    display: "flex",
    alignItems: "center",
    flexWrap: "nowrap",
    overflow: "hidden",
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
  singleValue: (base) => ({
    ...base,
    color: "#333",
    fontSize: 14,
    lineHeight: "20px",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    opacity: 0,
    width: 0,
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: 46,
    paddingRight: 6,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: "0 6px",
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
    fontSize: 14,
    lineHeight: "20px",
    padding: "8px 12px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    cursor: "pointer",
    backgroundColor:
      state.isSelected || state.isFocused ? "#fff4ec" : "#fff",
    color: state.isSelected ? "var(--red, #de7008)" : "#333",
  }),
};

export default function FormSelect({
  label,
  options = [],
  value = "",
  defaultValue,
  onChange,
  placeholder = "Select",
  required = false,
  disabled = false,
  isSearchable = true,
  isDisableFirstOption = false,
  className = "",
}) {
  const formattedOptions = isDisableFirstOption
    ? options.map((option, index) => ({
        ...option,
        isDisabled: index === 0,
      }))
    : options;

  const selectedValue =
    value !== "" && value !== null && value !== undefined
      ? value
      : defaultValue;
  const selectedOption =
    formattedOptions.find(
      (option) =>
        option.value == selectedValue || option.label === selectedValue,
    ) || null;

  const handleChange = (option) => {
    onChange?.(option?.value ?? "", option);
  };

  return (
    <div
      className={`form-select-field ${disabled ? "form-select-field--disabled" : ""} ${className}`}
    >
      {label && (
        <span className="form-select-field__label" title={label}>
          {label}
          {required && <span className="form-select-field__required"> *</span>}
        </span>
      )}
      <Select
        options={formattedOptions}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        isDisabled={disabled}
        isSearchable={isSearchable}
        isOptionDisabled={(option) => option.isDisabled}
        classNamePrefix="select"
        menuPortalTarget={typeof document === "undefined" ? undefined : document.body}
        menuPosition="fixed"
        styles={selectStyles}
        components={{ DropdownIndicator, IndicatorSeparator, MenuList }}
        formSelectSearchable={isSearchable}
        noOptionsMessage={() => "No options"}
      />
    </div>
  );
}
