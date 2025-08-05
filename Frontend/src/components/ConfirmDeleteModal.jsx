import { useStores } from "../contexts/storeContext";
import { useState } from "react";

const ConfirmDeleteModal = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    handleDelete,
    selectedRepairId,
    type,
    setIsItemModalOpen,
    removeDeletedItemFromUI, // ✅ OPTIONAL: this helps immediately remove the item from UI if you have such a function
  } = useStores();

  const [isDeleting, setIsDeleting] = useState(false);

  if (!isModalOpen) return null;

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await handleDelete(selectedRepairId, type); // ✅ await the delete call

      // ✅ Optionally remove from local UI (e.g. if you're storing repairs list in state)
      if (typeof removeDeletedItemFromUI === "function") {
        removeDeletedItemFromUI(selectedRepairId);
      }

      // ✅ Close modal
      setIsModalOpen(false);
      setIsItemModalOpen(false);
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 h-full w-full flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete this repair?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-all duration-300"
            onClick={() => {
              setIsModalOpen(false);
              setIsItemModalOpen(false);
            }}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-300 disabled:opacity-50"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
