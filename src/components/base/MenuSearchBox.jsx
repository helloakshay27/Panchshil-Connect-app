// Keystrokes go to react-select's own (focused) input and arrive here via
// inputValue; this box only mirrors that text, so it must never take focus.
export default function MenuSearchBox({ inputValue = "" }) {
  return (
    <div className="form-select-field__menu-search-box" aria-hidden="true">
      {inputValue && (
        <span className="form-select-field__menu-search-text">{inputValue}</span>
      )}
      <span className="form-select-field__menu-search-caret" />
      {!inputValue && (
        <span className="form-select-field__menu-search-placeholder">
          Type to search...
        </span>
      )}
    </div>
  );
}
