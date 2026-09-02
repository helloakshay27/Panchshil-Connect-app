import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { INFO_DB, hasInfo } from "./usage-info-data";

/* =====================================================================
   Floating "how this is calculated" explainer for the Panchshil Connect
   Usage Dashboard.

   Mirrors the reference InfoButton / InfoPopover pattern: an "i" button
   on a tile/card opens a contextually positioned popover (portaled to
   document.body) that explains how the metric is calculated and why it
   matters. Content comes from the INFO_DB database (see usage-info-data)
   keyed by a stable metric key. If a key has no entry, the button does
   not render.
   ===================================================================== */

/* =====================================================================
   InfoButton — the (i) glyph. Renders nothing when the key is unknown.
   `onInfo` is called with (key, DOMRect) so the parent can position the
   shared InfoPopover.
   ===================================================================== */
export function InfoButton({ infoKey, onInfo }) {
  const btnRef = useRef(null);
  if (!hasInfo(infoKey)) return null;
  return (
    <button
      type="button"
      ref={btnRef}
      className="pcd-info-btn"
      aria-label="How this is calculated"
      tabIndex={0}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = btnRef.current.getBoundingClientRect();
        onInfo(infoKey, rect);
      }}
    >
      i
    </button>
  );
}

/* =====================================================================
   InfoPopover — single floating explainer, portaled to document.body.
   `state` is { key, rect } or null; `onClose` dismisses it.
   ===================================================================== */
export function InfoPopover({ state, onClose }) {
  const popRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    if (!state || !popRef.current) {
      setPos(null);
      return;
    }
    const { rect } = state;
    const pw = popRef.current.offsetWidth;
    const ph = popRef.current.offsetHeight;
    const gap = 8;

    let left = rect.right - pw;
    if (left < 10) left = 10;
    if (left + pw > window.innerWidth - 10) left = window.innerWidth - pw - 10;

    let top = rect.bottom + gap;
    if (top + ph > window.innerHeight - 10) top = rect.top - ph - gap;
    if (top < 10) top = 10;

    setPos({ left, top });
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const onDocClick = (e) => {
      const t = e.target;
      if (!t.closest(".pcd-info-pop") && !t.closest(".pcd-info-btn")) onClose();
    };
    const onScroll = () => onClose();
    const onResize = () => onClose();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("click", onDocClick);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
    };
  }, [state, onClose]);

  if (!state) return null;
  const info = INFO_DB[state.key];
  if (!info) return null;

  return createPortal(
    <div
      ref={popRef}
      className="pcd-info-pop"
      style={{ left: pos?.left ?? -9999, top: pos?.top ?? -9999 }}
    >
      <div className="pcd-info-pop-title">{info.t}</div>
      <div className="pcd-info-pop-formula">
        <span className="pcd-info-pop-formula-label">How it&apos;s calculated</span>
        {info.f}
      </div>
      <div className="pcd-info-pop-desc">{info.d}</div>
    </div>,
    document.body,
  );
}
