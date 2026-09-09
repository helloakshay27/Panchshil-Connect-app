/* eslint-disable react/prop-types */
import { forwardRef } from "react";
import Select, { components as selectComponents } from "react-select";

import "./EnhancedSelect.css";

const portalStyles = {
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

const SearchableMenuList = (props) => {
  const { children, selectProps } = props;

  return (
    <selectComponents.MenuList {...props}>
      {selectProps.isSearchable !== false && (
        <div
          className="enhanced-select__menu-search"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <input
            type="search"
            value={selectProps.inputValue || ""}
            onChange={(event) =>
              selectProps.onInputChange?.(event.target.value, {
                action: "input-change",
              })
            }
            onKeyDown={(event) => event.stopPropagation()}
            placeholder="Type to search..."
            aria-label="Search options"
            autoFocus
          />
        </div>
      )}
      {children}
    </selectComponents.MenuList>
  );
};

const EnhancedSelect = forwardRef(function EnhancedSelect(
  { className = "", components = {}, menuPortalTarget, styles = {}, ...props },
  ref,
) {
  const callerMenuPortal = styles.menuPortal;
  const mergedStyles = {
    ...portalStyles,
    ...styles,
    menuPortal: (base, state) => {
      const portalBase = portalStyles.menuPortal(base, state);

      return callerMenuPortal
        ? callerMenuPortal(portalBase, state)
        : portalBase;
    },
  };
  const defaultPortalTarget =
    typeof document !== "undefined" ? document.body : undefined;
  const resolvedPortalTarget =
    menuPortalTarget === undefined ? defaultPortalTarget : menuPortalTarget;

  return (
    <Select
      ref={ref}
      {...props}
      className={[
        "enhanced-select",
        props.isMulti && "enhanced-select--is-multi",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      classNamePrefix="enhanced-select"
      components={{ MenuList: SearchableMenuList, ...components }}
      menuPortalTarget={resolvedPortalTarget}
      styles={mergedStyles}
    />
  );
});

export default EnhancedSelect;
