
import "./CreateItemModal.css";

/**
 * Generic modal wrapper for create flows.
 * Pure UI component – no business logic.
 */
function CreateItemModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {children}
      </div>

      <div
        className="modal-backdrop"
        onClick={onClose}
      />
    </div>
  );
}

export default CreateItemModal;
