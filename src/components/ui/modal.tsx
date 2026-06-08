"use client";

import { ReactNode, useEffect, useRef } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  disableClose?: boolean;
};

export function Modal({ open, onClose, title, children, disableClose = false }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleClose() {
    if (disableClose) {
      return;
    }

    onClose();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-transparent p-4 open:flex open:items-center open:justify-center"
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
    >
      <div
        aria-hidden
        className="fixed inset-0 bg-brand-950/30 backdrop-blur-md"
        onClick={handleClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-brand-100 bg-white p-6 shadow-xl shadow-brand-900/10">
        <h2 id="modal-title" className="text-lg font-semibold text-brand-900">
          {title}
        </h2>
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  );
}
