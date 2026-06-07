import { useRef, useState } from "react";

const CLOSED_DIALOG = {
  open: false,
  title: "",
  message: "",
  confirmLabel: "Confirmer",
  cancelLabel: "Annuler",
  danger: false,
};

export default function useConfirm() {
  const [dialog, setDialog] = useState(CLOSED_DIALOG);
  const resolverRef = useRef(null);

  const confirm = (options) => new Promise((resolve) => {
    resolverRef.current = resolve;
    setDialog({ ...CLOSED_DIALOG, ...options, open: true });
  });

  const close = (result) => {
    setDialog(CLOSED_DIALOG);
    resolverRef.current?.(result);
    resolverRef.current = null;
  };

  return {
    dialog,
    confirm,
    confirmDialog: () => close(true),
    cancelDialog: () => close(false),
  };
}
