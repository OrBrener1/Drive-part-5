import { useMemo, useState } from "react";
import { updateFileName } from "../api/filesApi";

export function useRenameItem({ itemId, initialName, onSuccess }) {
  const [name, setName] = useState(initialName || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateName(value) {
    if (!value.trim()) return "Name is required";
    if (value.includes("..")) return 'Name cannot contain ".."';
    if (/[\\/:*?"<>|]/.test(value)) {
      return 'Name cannot contain: \\ / : * ? " < > |';
    }
    return "";
  }

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (error) return false;
    if (name === initialName) return false;
    return true;
  }, [name, error, initialName]);

  function onNameChange(value) {
    setName(value);
    setError(validateName(value));
  }

  async function submit() {
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await updateFileName(itemId, name.trim());
      onSuccess?.(name.trim());
    } catch (err) {
      setError(err?.message || "Rename failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    name,
    error,
    canSubmit,
    isSubmitting,
    onNameChange,
    submit,
  };
}
