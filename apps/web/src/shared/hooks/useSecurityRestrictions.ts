import { useEffect } from "react";

/**
 * PROD ONLY: block context menu, devtools shortcuts, view-source,
 * copy/paste and text selection. (Deterrent — not a security boundary;
 * the real protection is the encrypted API + server-side validation.)
 */
export const useSecurityRestrictions = () => {
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      if (key === "f12") e.preventDefault();
      if (ctrl && e.shiftKey && ["i", "j", "c"].includes(key)) e.preventDefault();
      if (ctrl && ["u", "c", "v", "s", "p"].includes(key)) e.preventDefault();
    };
    const onClipboard = (e: ClipboardEvent) => e.preventDefault();
    const onDrag = (e: DragEvent) => e.preventDefault();

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("copy", onClipboard);
    document.addEventListener("cut", onClipboard);
    document.addEventListener("paste", onClipboard);
    document.addEventListener("dragstart", onDrag);
    const prevSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("copy", onClipboard);
      document.removeEventListener("cut", onClipboard);
      document.removeEventListener("paste", onClipboard);
      document.removeEventListener("dragstart", onDrag);
      document.body.style.userSelect = prevSelect;
    };
  }, []);
};
