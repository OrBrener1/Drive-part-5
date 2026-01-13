function BackButton({ onBack }) {
  return (
    <button
      className="btn btn-ghost files-back-button"
      onClick={onBack}
      type="button"
    >
      {"<"} Back
    </button>
  );
}

export default BackButton;
