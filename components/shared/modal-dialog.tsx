"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type ModalDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function ModalDialog({ open, title, onClose, children }: ModalDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function close() {
    onClose();
    requestAnimationFrame(() => openerRef.current?.focus());
  }

  return (
    <dialog ref={dialogRef} className="app-dialog" aria-labelledby="app-dialog-title" onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === dialogRef.current) close(); }}>
      <div className="app-dialog__content">
        <div className="app-dialog__header"><h2 id="app-dialog-title">{title}</h2><button type="button" onClick={close} aria-label="Close dialog">×</button></div>
        {children}
      </div>
    </dialog>
  );
}
