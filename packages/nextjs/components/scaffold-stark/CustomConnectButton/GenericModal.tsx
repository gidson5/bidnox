"use client";

import { forwardRef, ReactNode } from "react";

type GenericModalProps = {
  children: ReactNode;
  className?: string;
  modalId: string;
};

const GenericModal = forwardRef<HTMLDialogElement, GenericModalProps>(
  (
    {
      children,
      className = "modal-border bg-base-100 rounded-[8px] border flex flex-col relative w-full max-w-xs p-6",
      modalId,
    },
    ref,
  ) => (
    <dialog id={modalId} ref={ref} className="modal">
      <form method="dialog" className={`modal-box ${className}`}>
        {children}
      </form>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  ),
);

GenericModal.displayName = "GenericModal";

export default GenericModal;
